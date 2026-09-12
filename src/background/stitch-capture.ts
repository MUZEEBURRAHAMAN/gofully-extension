import type {
  CaptureResult,
  CaptureFrame,
  PageDimensions,
  CaptureProgress,
  Settings,
} from "../types";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { loadImage, canvasToBlob } from "../utils/image";

const CAPTURE_DELAY = 300;

let isCaptureCancelled = false;

export function cancelActiveCapture(): void {
  isCaptureCancelled = true;
}

export async function captureWithScrollStitch(
  tabId: number,
  dimensions: PageDimensions,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  isCaptureCancelled = false;

  // 1. Activate tab and obtain windowId
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  const windowId = tab?.windowId;
  if (windowId) {
    await chrome.tabs.update(tabId, { active: true }).catch(() => {});
  }

  // 2. Pre-scroll to trigger lazy loading
  await chrome.tabs.sendMessage(tabId, {
    type: "PRE_SCROLL_LAZY",
    payload: { maxWait: 1500 },
  }).catch(() => {});

  // 3. Prepare page for scroll capture:
  const pageInit = await initScrollCapture(tabId);
  let scrollHeight = Math.max(dimensions.scrollHeight, pageInit.scrollHeight);
  // Falls back to common defaults, not `window` — this runs in the MV3
  // service worker, which has no window global (unlike the func: () => {}
  // callbacks below, which execute in the page and can use it freely).
  const viewportHeight = pageInit.viewportHeight || dimensions.viewportHeight || 800;
  const viewportWidth = pageInit.viewportWidth || dimensions.viewportWidth || 1280;

  const frames: CaptureFrame[] = [];
  let dpr = dimensions.devicePixelRatio || 1;
  const maxSteps = Math.min(150, Math.ceil(scrollHeight / (viewportHeight * 0.5)) + 10);

  let coveredY = 0;
  let lastFrameHash = "";
  let lastScrollY = -1;

  // Holds the background service worker alive for the duration of the
  // capture — see the matching handler in content/sticky-manager.ts.
  await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_KEEPALIVE_START" }).catch(() => {});

  try {
    // Step 0: Capture natural page at top (scrollY = 0)
    await performScroll(tabId, 0, pageInit.targetSelector);
    await sleep(250);

    const initialScroll = await getActualScrollPosition(tabId, pageInit.targetSelector);
    if (initialScroll.docHeight && initialScroll.docHeight > scrollHeight) {
      scrollHeight = initialScroll.docHeight;
    }

    // Hide any in-page progress overlay during snapshot
    await hideProgressInTab(tabId);

    const firstDataUrl = await captureWithRetry(windowId);
    const img0 = await loadImage(firstDataUrl);
    dpr = detectDPRFromCapture(img0.width, viewportWidth);
    lastFrameHash = await hashFrame(firstDataUrl);
    lastScrollY = 0;

    const frame0Height = Math.min(viewportHeight, scrollHeight);
    frames.push({
      dataUrl: firstDataUrl,
      x: 0,
      y: 0,
      width: viewportWidth,
      height: viewportHeight,
      scrollX: 0,
      scrollY: 0,
      cropY: 0,
      cropHeight: frame0Height,
      dstY: 0,
    });
    coveredY = frame0Height;

    onProgress?.({
      current: 1,
      total: Math.max(1, Math.ceil(scrollHeight / viewportHeight)),
      phase: "capturing",
    });

    // If page extends beyond initial viewport, capture remaining contiguous slices
    if (scrollHeight > viewportHeight) {
      // Hide sticky elements for subsequent frames so they appear only once at the top
      const settingsRes = await (chrome.storage.sync?.get("settings").catch(() => null)) ||
        await chrome.storage.local.get("settings").catch(() => null);
      const shouldSkipSticky =
        (settingsRes?.settings as Partial<Settings> | undefined)?.skipStickyHeaders ?? true;
      if (shouldSkipSticky) {
        await chrome.tabs.sendMessage(tabId, { type: "HIDE_STICKY" }).catch(() => {});
        await sleep(50);
      }

      let step = 0;
      while (coveredY < scrollHeight && step < maxSteps) {
        if (isCaptureCancelled) break;
        step++;

        const remaining = scrollHeight - coveredY;
        if (remaining <= 0) break;

        let targetY: number;
        let isLastStep = false;

        if (remaining >= viewportHeight) {
          // Contiguous non-overlapping full viewport step
          targetY = coveredY;
        } else {
          // Final partial remainder step: scroll to bottom so the tail is visible
          targetY = Math.max(0, scrollHeight - viewportHeight);
          isLastStep = true;
        }

        await performScroll(tabId, targetY, pageInit.targetSelector);
        await sleep(CAPTURE_DELAY);

        const scrollInfo = await getActualScrollPosition(tabId, pageInit.targetSelector);
        if (scrollInfo.docHeight && scrollInfo.docHeight > scrollHeight) {
          scrollHeight = scrollInfo.docHeight;
        }

        // If page cannot scroll any further
        if (Math.abs(scrollInfo.currentY - lastScrollY) < 1 && step > 1) {
          break;
        }

        await hideProgressInTab(tabId);
        const dataUrl = await captureWithRetry(windowId);

        const currentHash = await hashFrame(dataUrl);
        if (currentHash === lastFrameHash && step > 1) {
          // Content is unchanged — reached bottom
          break;
        }
        lastFrameHash = currentHash;
        lastScrollY = scrollInfo.currentY;

        if (!isLastStep) {
          // Full viewport tile placed seamlessly at coveredY
          frames.push({
            dataUrl,
            x: 0,
            y: coveredY,
            width: viewportWidth,
            height: viewportHeight,
            scrollX: 0,
            scrollY: scrollInfo.currentY,
            cropY: 0,
            cropHeight: viewportHeight,
            dstY: coveredY,
          });
          coveredY += viewportHeight;
        } else {
          // Final tile: crop only the uncaptured bottom remainder
          const cropY = Math.max(0, viewportHeight - remaining);
          frames.push({
            dataUrl,
            x: 0,
            y: coveredY,
            width: viewportWidth,
            height: viewportHeight,
            scrollX: 0,
            scrollY: scrollInfo.currentY,
            cropY,
            cropHeight: remaining,
            dstY: coveredY,
          });
          coveredY += remaining;
          break;
        }

        onProgress?.({
          current: step + 1,
          total: Math.max(1, Math.ceil(scrollHeight / viewportHeight)),
          phase: "capturing",
        });

        if (scrollInfo.isAtBottom) {
          break;
        }
      }
    }
  } finally {
    // Restore sticky elements to their original state
    await chrome.tabs.sendMessage(tabId, { type: "RESTORE_STICKY" }).catch(() => {});

    // Restore smooth scroll behavior and original scroll position
    await cleanupScrollCapture(tabId, pageInit.initialScrollY, pageInit.targetSelector).catch(() => {});

    await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_KEEPALIVE_STOP" }).catch(() => {});

    onProgress?.({ current: 0, total: 0, phase: "done" });
  }

  onProgress?.({ current: 0, total: 0, phase: "stitching" });

  const totalWidth = viewportWidth;
  const actualHeight = calculateStitchedHeight(frames, viewportHeight);
  const blob = await stitchFrames(frames, totalWidth, actualHeight, dpr);

  return {
    blob,
    width: Math.round(totalWidth * dpr),
    height: Math.round(actualHeight * dpr),
    mode: "full-page",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab?.url || "",
    title: tab?.title || "",
  };
}

async function hideProgressInTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const el = document.getElementById("gofully-progress-overlay");
      if (el) el.style.setProperty("display", "none", "important");
    },
  }).catch(() => {});
}

async function initScrollCapture(tabId: number): Promise<{
  initialScrollY: number;
  scrollHeight: number;
  viewportHeight: number;
  viewportWidth: number;
  targetSelector: string | null;
}> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const initialScrollY =
        window.scrollY ||
        (document.scrollingElement ? document.scrollingElement.scrollTop : 0) ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      // Temporarily disable smooth scroll so programmatic scrollTo is instantaneous
      const styleEl = document.createElement("style");
      styleEl.id = "__gf_no_smooth_scroll";
      styleEl.textContent = "* { scroll-behavior: auto !important; }";
      (document.head || document.documentElement).appendChild(styleEl);

      const html = document.documentElement;
      const body = document.body;

      // If html/body has overflow-y: hidden, temporarily un-hide so page can scroll
      const htmlCs = window.getComputedStyle(html);
      const bodyCs = window.getComputedStyle(body);
      if (htmlCs.overflowY === "hidden") {
        html.style.setProperty("overflow-y", "auto", "important");
      }
      if (bodyCs.overflowY === "hidden") {
        body.style.setProperty("overflow-y", "auto", "important");
      }

      let docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      // Test whether window itself actually responds to scrolling
      const origY = window.scrollY || (document.scrollingElement ? document.scrollingElement.scrollTop : 0);
      window.scrollTo({ top: origY + 5, behavior: "instant" });
      const testY = window.scrollY || (document.scrollingElement ? document.scrollingElement.scrollTop : 0);
      const windowCanScroll = Math.abs(testY - origY) >= 1;
      window.scrollTo({ top: origY, behavior: "instant" });

      let targetSelector: string | null = null;
      let scrollHeight = docHeight;

      if (!windowCanScroll) {
        // Look for the overflowing scroll container in the page
        const all = document.querySelectorAll<HTMLElement>("*");
        let bestContainer: HTMLElement | null = null;
        let maxH = 0;
        for (const el of all) {
          if (el === html || el === body) continue;
          const cs = getComputedStyle(el);
          if (
            (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight + 20 &&
            el.scrollHeight > maxH
          ) {
            maxH = el.scrollHeight;
            bestContainer = el;
          }
        }
        if (bestContainer) {
          bestContainer.setAttribute("data-gf-scroll-target", "1");
          targetSelector = "[data-gf-scroll-target='1']";
          scrollHeight = maxH;
        }
      }

      return {
        initialScrollY,
        scrollHeight,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        targetSelector,
      };
    },
  });
  return result as any;
}

async function performScroll(
  tabId: number,
  targetY: number,
  targetSelector: string | null
): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (y: number, selector: string | null) => {
      if (selector) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          el.scrollTo({ top: y, left: 0, behavior: "instant" });
          el.scrollTop = y;
          el.dispatchEvent(new Event("scroll"));
          return;
        }
      }

      window.scrollTo({ top: y, left: 0, behavior: "instant" });
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = y;
      }
      document.documentElement.scrollTop = y;
      document.body.scrollTop = y;
      window.dispatchEvent(new Event("scroll"));
    },
    args: [targetY, targetSelector],
  });
}

async function getActualScrollPosition(
  tabId: number,
  targetSelector: string | null
): Promise<{ currentY: number; isAtBottom: boolean; docHeight: number }> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (selector: string | null) => {
      if (selector) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          const maxScroll = el.scrollHeight - el.clientHeight;
          return {
            currentY: el.scrollTop,
            isAtBottom: el.scrollTop >= maxScroll - 4,
            docHeight: el.scrollHeight,
          };
        }
      }

      const currentY =
        window.scrollY ||
        (document.scrollingElement ? document.scrollingElement.scrollTop : 0) ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const maxScroll = docHeight - window.innerHeight;

      return {
        currentY,
        isAtBottom: currentY >= maxScroll - 4,
        docHeight,
      };
    },
    args: [targetSelector],
  });
  return result as { currentY: number; isAtBottom: boolean; docHeight: number };
}

async function cleanupScrollCapture(
  tabId: number,
  initialScrollY: number,
  targetSelector: string | null
): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (initY: number, selector: string | null) => {
      // Restore scroll position
      if (selector) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          el.scrollTop = initY;
          el.removeAttribute("data-gf-scroll-target");
        }
      }
      window.scrollTo({ top: initY, left: 0, behavior: "instant" });
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = initY;
      }
      document.documentElement.scrollTop = initY;
      document.body.scrollTop = initY;

      // Remove injected no-smooth-scroll style
      document.getElementById("__gf_no_smooth_scroll")?.remove();

      // Restore original scroll behavior
      const html = document.documentElement;
      const body = document.body;
      const origHtml = (window as any).__gfOrigHtmlScrollBehavior;
      const origBody = (window as any).__gfOrigBodyScrollBehavior;

      if (origHtml) html.style.scrollBehavior = origHtml;
      else html.style.removeProperty("scroll-behavior");

      if (origBody) body.style.scrollBehavior = origBody;
      else body.style.removeProperty("scroll-behavior");

      delete (window as any).__gfOrigHtmlScrollBehavior;
      delete (window as any).__gfOrigBodyScrollBehavior;
    },
    args: [initialScrollY, targetSelector],
  }).catch(() => {});
}

function calculateStitchedHeight(frames: CaptureFrame[], fallbackHeight: number): number {
  if (frames.length === 0) return fallbackHeight;
  let maxH = 0;
  for (const f of frames) {
    const endY = (f.dstY ?? f.scrollY) + (f.cropHeight ?? f.height);
    if (endY > maxH) maxH = endY;
  }
  return maxH || fallbackHeight;
}

async function stitchFrames(
  frames: CaptureFrame[],
  totalWidth: number,
  totalHeight: number,
  dpr: number
): Promise<Blob> {
  if (frames.length === 0) {
    const emptyCanvas = new OffscreenCanvas(100, 100);
    return canvasToBlob(emptyCanvas);
  }

  const canvasWidth = Math.round(totalWidth * dpr);
  const canvasHeight = Math.round(totalHeight * dpr);

  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const img = await loadImage(frame.dataUrl);

    const frameDpr = img.width / frame.width;
    const cropY = Math.round((frame.cropY ?? 0) * frameDpr);
    const cropH = Math.round((frame.cropHeight ?? frame.height) * frameDpr);
    const dstY = Math.round((frame.dstY ?? frame.scrollY) * dpr);
    const dstH = Math.round((frame.cropHeight ?? frame.height) * dpr);
    const dstW = Math.min(canvasWidth, img.width);

    if (dstH <= 0 || cropH <= 0 || dstY >= canvasHeight) continue;

    const actualCropH = Math.min(cropH, img.height - cropY);
    const actualDstH = Math.min(dstH, canvasHeight - dstY);

    ctx.drawImage(
      img,
      0,
      cropY,
      img.width,
      actualCropH,
      0,
      dstY,
      dstW,
      actualDstH
    );
  }

  return canvasToBlob(canvas);
}

async function hashFrame(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 16, 16);
  const data = ctx.getImageData(0, 0, 16, 16).data;

  let hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    hash = ((hash << 5) - hash + data[i]) | 0;
    hash = ((hash << 5) - hash + data[i + 1]) | 0;
    hash = ((hash << 5) - hash + data[i + 2]) | 0;
  }
  return hash.toString(36);
}

async function captureWithRetry(windowId?: number, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (typeof windowId === "number") {
        return await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
      }
      return await chrome.tabs.captureVisibleTab({ format: "png" });
    } catch (e: any) {
      if (e?.message?.includes("MAX_CAPTURE") && i < maxRetries - 1) {
        await sleep(1000);
        continue;
      }
      if (i < maxRetries - 1) {
        await sleep(300);
        continue;
      }
      throw e;
    }
  }
  return typeof windowId === "number"
    ? await chrome.tabs.captureVisibleTab(windowId, { format: "png" })
    : await chrome.tabs.captureVisibleTab({ format: "png" });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
