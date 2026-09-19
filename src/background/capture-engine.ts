import type {
  CaptureMode,
  CaptureResult,
  PageDimensions,
  CaptureRegion,
  CaptureProgress,
} from "../types";
import { captureWithScrollStitch } from "./stitch-capture";
import { dataUrlToBlob, loadImage } from "../utils/image";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { hideProgressInTab, suppressProgressInTab, unsuppressProgressInTab } from "../utils/progress-overlay";

export async function captureFullPage(
  tabId: number,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  // This "preparing" event is sent before the very first frame is captured,
  // via a fire-and-forget message (see service-worker.ts's sendProgress).
  // Suppress badge creation up front so a delayed delivery of *this specific*
  // message can't land — and create the badge for the first time — right
  // before captureWithScrollStitch's own first shutter. captureWithScrollStitch
  // lifts this suppression once it's safely past that first frame, via its
  // own captureFrameSafely wrapper around every subsequent shutter — but if
  // anything throws before that first frame is ever captured (e.g. layout
  // prep below), nothing else would lift it, leaving the tab's badge stuck
  // suppressed for any later capture. The outer finally here is that backstop.
  await suppressProgressInTab(tabId).catch(() => {});

  try {
    onProgress?.({
      phase: "preparing",
      current: 1,
      total: 3,
    });

    const dimensions = await prepareFullPageLayout(tabId);
    try {
      // Restore any forced layout so the page and inner containers scroll naturally
      await restoreFullPageLayout(tabId);
      return await captureWithScrollStitch(tabId, dimensions, onProgress);
    } finally {
      await restoreFullPageLayout(tabId);
    }
  } finally {
    await unsuppressProgressInTab(tabId).catch(() => {});
  }
}

/**
 * Wraps a single captureVisibleTab() shutter with badge suppression — same
 * reasoning as captureFrameSafely in stitch-capture.ts. hideProgressInTab
 * alone only hides a badge that already exists; on a busy page the
 * CAPTURE_PROGRESS message this same call's own onProgress() fired can be
 * delayed past that check and create the badge for the first time right
 * before this exact shutter.
 */
async function captureVisibleTabSafely(tabId: number, windowId?: number): Promise<string> {
  await suppressProgressInTab(tabId);
  await hideProgressInTab(tabId);
  try {
    return typeof windowId === "number"
      ? await chrome.tabs.captureVisibleTab(windowId, { format: "png" })
      : await chrome.tabs.captureVisibleTab({ format: "png" });
  } finally {
    await unsuppressProgressInTab(tabId);
  }
}

export async function captureVisibleArea(
  tabId: number,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  // Suppress before the "capturing" event below fires, not just around the
  // shutter — that event's own fire-and-forget delivery is the thing that
  // can race the shutter. captureVisibleTabSafely's own suppress call is
  // then a harmless re-suppress; this outer try/finally is the backstop if
  // anything throws before it's ever reached (e.g. chrome.tabs.get below).
  await suppressProgressInTab(tabId).catch(() => {});
  try {
    onProgress?.({
      phase: "capturing",
      current: 1,
      total: 1,
    });
    const tab = await chrome.tabs.get(tabId);
    if (tab.windowId) {
      await chrome.tabs.update(tabId, { active: true }).catch(() => {});
    }
    const dataUrl = await captureVisibleTabSafely(tabId, tab.windowId);
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
      method: "visible-tab",
      timestamp: Date.now(),
      url: tab.url || "",
      title: tab.title || "",
    };
  } finally {
    await unsuppressProgressInTab(tabId).catch(() => {});
  }
}

export async function captureSelectedArea(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureResult> {
  await suppressProgressInTab(tabId).catch(() => {});
  let dataUrl: string;
  let tab: chrome.tabs.Tab;
  try {
    tab = await chrome.tabs.get(tabId);
    if (tab.windowId) {
      await chrome.tabs.update(tabId, { active: true }).catch(() => {});
    }
    dataUrl = await captureVisibleTabSafely(tabId, tab.windowId);
  } finally {
    await unsuppressProgressInTab(tabId).catch(() => {});
  }
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
    method: "visible-tab",
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
 * tall; the overflow is happening inside a child), so the scroll-stitch
 * capture would only ever produce a viewport-sized screenshot no matter how
 * "full page" capture is invoked. Ordinary pages
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
