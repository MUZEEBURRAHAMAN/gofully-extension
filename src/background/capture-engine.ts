import type {
  CaptureMode,
  CaptureResult,
  PageDimensions,
  CaptureRegion,
  CaptureProgress,
} from "../types";
import { getCaptureMethod } from "../utils/permissions";
import { captureWithCDP } from "./cdp-capture";
import { captureWithScrollStitch } from "./stitch-capture";
import { dataUrlToBlob, loadImage } from "../utils/image";
import { detectDPRFromCapture } from "../utils/dpr-handler";

const MAX_CDP_HEIGHT = 16384;

export async function captureFullPage(
  tabId: number,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  onProgress?.({
    phase: "preparing",
    current: 1,
    total: 3,
  });

  const dimensions = await prepareFullPageLayout(tabId);
  try {
    const method = await getCaptureMethod(dimensions.scrollHeight);

    if (method === "cdp") {
      try {
        onProgress?.({
          phase: "capturing",
          current: 1,
          total: 3,
        });

        // position:sticky/fixed elements (nav bars, sidebars, campaign
        // banners) can visually repeat down the page in a CDP screenshot
        // this tall — captureBeyondViewport renders in internal tiles, and
        // sticky elements get re-pinned relative to each tile. The
        // scroll-stitch fallback below already hides them for the same
        // reason; the CDP path just never did. Restored in the inner
        // finally before any scroll-stitch fallback runs its own
        // independent hide/restore cycle, so the two never overlap.
        await chrome.tabs.sendMessage(tabId, { type: "HIDE_STICKY" }).catch(() => {});
        try {
          const res = await captureWithCDP(tabId, dimensions);
          onProgress?.({
            phase: "stitching",
            current: 2,
            total: 3,
          });
          return res;
        } finally {
          await chrome.tabs.sendMessage(tabId, { type: "RESTORE_STICKY" }).catch(() => {});
        }
      } catch (e) {
        // CDP failed — fall back to scroll-stitch
        console.warn("CDP capture failed, falling back to scroll-stitch:", e);
        return await captureWithScrollStitch(tabId, dimensions, onProgress);
      }
    }
    return await captureWithScrollStitch(tabId, dimensions, onProgress);
  } finally {
    await restoreFullPageLayout(tabId);
  }
}

export async function captureVisibleArea(
  tabId: number,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  onProgress?.({
    phase: "capturing",
    current: 1,
    total: 1,
  });
  const tab = await chrome.tabs.get(tabId);
  if (tab.windowId) {
    await chrome.tabs.update(tabId, { active: true }).catch(() => {});
  }
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
  const blob = dataUrlToBlob(dataUrl);
  const img = await loadImage(dataUrl);

  onProgress?.({
    phase: "done",
    current: 1,
    total: 1,
  });

  return {
    blob,
    width: img.width,
    height: img.height,
    mode: "visible-area",
    method: "cdp",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

export async function captureSelectedArea(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureResult> {
  const tab = await chrome.tabs.get(tabId);
  if (tab.windowId) {
    await chrome.tabs.update(tabId, { active: true }).catch(() => {});
  }
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
  const img = await loadImage(dataUrl);
  const [{ result: vpWidth }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.innerWidth,
  });
  const dpr = detectDPRFromCapture(img.width, vpWidth || img.width);

  // Crop to selection
  const sx = Math.round(region.x * dpr);
  const sy = Math.round(region.y * dpr);
  const sw = Math.round(region.width * dpr);
  const sh = Math.round(region.height * dpr);

  const canvas = new OffscreenCanvas(sw, sh);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob = await canvas.convertToBlob({ type: "image/png" });

  return {
    blob,
    width: sw,
    height: sh,
    mode: "selected-area",
    method: "cdp",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

/**
 * Measures the page and — for the common SPA layout where <html>/<body> are
 * pinned to 100vh with overflow:hidden and the real content scrolls inside a
 * nested container — temporarily forces that container (and any overflow-
 * hidden ancestors up to <body>) to lay out at its full natural height.
 *
 * Without this, document.body/documentElement.scrollHeight report only one
 * viewport of height on such pages (the document genuinely is only that
 * tall; the overflow is happening inside a child), so both the CDP capture
 * and the scroll-stitch fallback would only ever produce a viewport-sized
 * screenshot no matter how "full page" capture is invoked. Ordinary pages
 * where body/html itself is the scrolling element are untouched by this —
 * the expansion only runs when body/html scrollHeight doesn't already
 * exceed one viewport.
 */
async function prepareFullPageLayout(tabId: number): Promise<PageDimensions> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const body = document.body;
      const html = document.documentElement;
      const viewportHeight = window.innerHeight;

      const bodyScrollHeight = Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      );

      // Find the tallest genuinely-overflowing scroll container, only when
      // body/html itself doesn't already reflect more than one viewport.
      let innerContainer: HTMLElement | null = null;
      let innerHeight = 0;
      if (bodyScrollHeight <= viewportHeight + 4) {
        const all = document.querySelectorAll<HTMLElement>("*");
        for (const el of all) {
          const cs = getComputedStyle(el);
          if (
            (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight + 40 &&
            el.scrollHeight > innerHeight
          ) {
            innerHeight = el.scrollHeight;
            innerContainer = el;
          }
        }
      }

      const restore: Array<{ el: HTMLElement; prop: "overflow" | "height" | "maxHeight"; value: string }> = [];
      const forceExpand = (el: HTMLElement) => {
        restore.push({ el, prop: "overflow", value: el.style.overflow });
        restore.push({ el, prop: "height", value: el.style.height });
        restore.push({ el, prop: "maxHeight", value: el.style.maxHeight });
        el.style.setProperty("overflow", "visible", "important");
        el.style.setProperty("height", "auto", "important");
        el.style.setProperty("max-height", "none", "important");
      };

      if (innerContainer) {
        forceExpand(html);
        forceExpand(body);
        forceExpand(innerContainer);
        let p: HTMLElement | null = innerContainer.parentElement;
        while (p && p !== body) {
          const pcs = getComputedStyle(p);
          if (pcs.overflow !== "visible" || pcs.height === "0px") forceExpand(p);
          p = p.parentElement;
        }
      }

      (window as any).__gfRestoreLayout = restore;

      return {
        scrollWidth: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        scrollHeight: Math.max(
          bodyScrollHeight,
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          innerHeight
        ),
        viewportWidth: window.innerWidth,
        viewportHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      };
    },
  });
  return result as PageDimensions;
}

async function restoreFullPageLayout(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const restore = (window as any).__gfRestoreLayout as
        | Array<{ el: HTMLElement; prop: "overflow" | "height" | "maxHeight"; value: string }>
        | undefined;
      if (!restore) return;
      for (const r of restore) {
        if (r.value) r.el.style[r.prop] = r.value;
        else r.el.style.removeProperty(r.prop === "maxHeight" ? "max-height" : r.prop);
      }
      delete (window as any).__gfRestoreLayout;
    },
  }).catch(() => {});
}
