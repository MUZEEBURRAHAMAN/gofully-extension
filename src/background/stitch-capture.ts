import type {
  CaptureResult,
  CaptureFrame,
  PageDimensions,
  CaptureProgress,
  Settings,
} from "../types";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { loadImage, canvasToBlob } from "../utils/image";
import { hideProgressInTab, suppressProgressInTab, unsuppressProgressInTab } from "../utils/progress-overlay";

const CAPTURE_DELAY = 300;
const OVERLAP_PX = 20;
const SEAM_MISMATCH_THRESHOLD = 0.08;

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

  const settingsRes = await (chrome.storage.sync?.get("settings").catch(() => null)) ||
    await chrome.storage.local.get("settings").catch(() => null);
  const shouldSkipSticky =
    (settingsRes?.settings as Partial<Settings> | undefined)?.skipStickyHeaders ?? true;

  // Hide sticky elements so they appear only once at the top. This is NOT a
  // one-time check: many real headers are position:static at scrollY=0 and
  // only become position:fixed once a page-owned scroll listener sees the
  // user pass some threshold (the common "sticky navbar on scroll" pattern
  // in WordPress/Shopify/Squarespace/Bootstrap themes). A single hide pass
  // run before any scrolling happens can never observe that later fixed
  // state, so the header sails straight into every subsequent frame.
  // hideStickyElements() is idempotent and cumulative (content/sticky-
  // manager.ts), so calling it again after each scroll step — including
  // during seam re-capture below — is safe and picks up anything that just
  // turned fixed/sticky at the new scroll position.
  const hideStickyForCurrentPosition = async (): Promise<void> => {
    if (!shouldSkipSticky) return;
    // chrome.tabs.sendMessage to the content script isn't a guaranteed
    // delivery (same gap the progress-badge cleanup hit) — a fixed-position
    // element (floating action buttons, cursor-follow decorations, not just
    // nav headers) that silently fails to hide gets baked into every
    // subsequent frame. executeScript actually fails loudly instead of
    // no-op'ing.
    //
    // A fixed sleep() after this is a guess, not a guarantee: this
    // executeScript call resolving only means the hide *ran*, not that the
    // browser has *painted* the result yet. That guess held on a clean test
    // profile but not on a real browser under real load (many other
    // extensions competing for the main thread) — pages with two stacked
    // sticky elements (e.g. a header at top:0 plus a secondary sticky
    // sub-nav below it) showed both still visible in the very next frame.
    // Waiting on two animation frames instead guarantees at least one full
    // paint has happened before the next scroll+capture step runs.
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return new Promise<void>((resolve) => {
          if (typeof (window as any).__gofully_hide_sticky === "function") {
            (window as any).__gofully_hide_sticky();
          }
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
      },
    }).catch(() => {});
  };

  // Hide cookie banners, consent dialogs, and fixed overlays before capture
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const selectors = [
        '[class*="cookie"]', '[id*="cookie"]',
        '[class*="consent"]', '[id*="consent"]',
        '[class*="gdpr"]', '[id*="gdpr"]',
        '[class*="cc-banner"]', '[class*="cc_banner"]',
        '.cky-consent-container', '#onetrust-banner-sdk',
        '#CybotCookiebotDialog', '.js-consent-banner',
        '[aria-label*="cookie" i]', '[aria-label*="consent" i]',
      ];
      const hidden: HTMLElement[] = [];
      const sel = selectors.join(",");
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const style = getComputedStyle(el);
        if (style.position === "fixed" || style.position === "sticky") {
          el.dataset.gofullyOrigDisplay = el.style.display;
          el.style.display = "none";
          hidden.push(el);
        }
      });
      (window as any).__gofully_hidden_overlays = hidden;
    },
  }).catch(() => {});

  // Pause all playing videos so they don't produce smeared frames
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const videos = document.querySelectorAll("video");
      const playing: HTMLVideoElement[] = [];
      videos.forEach((v) => { if (!v.paused) { v.pause(); playing.push(v); } });
      (window as any).__gofully_paused_videos = playing;
    },
  }).catch(() => {});

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

    const firstDataUrl = await captureFrameSafely(tabId, windowId);
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
      await hideStickyForCurrentPosition();

      let step = 0;
      while (coveredY < scrollHeight && step < maxSteps) {
        if (isCaptureCancelled) break;
        step++;

        const remaining = scrollHeight - coveredY;
        if (remaining <= 0) break;

        let targetY: number;
        let isLastStep = false;

        if (remaining >= viewportHeight) {
          targetY = coveredY;
        } else {
          // Final partial remainder step: scroll to bottom so the tail is visible
          targetY = Math.max(0, scrollHeight - viewportHeight);
          isLastStep = true;
        }

        await performScroll(tabId, targetY, pageInit.targetSelector);
        await sleep(CAPTURE_DELAY);

        // Re-check for newly fixed/sticky elements at this scroll position
        // (see hideStickyForCurrentPosition above) before this frame's
        // shutter opens, not just once at the top of the page.
        await hideStickyForCurrentPosition();

        const scrollInfo = await getActualScrollPosition(tabId, pageInit.targetSelector);
        if (scrollInfo.docHeight && scrollInfo.docHeight > scrollHeight) {
          scrollHeight = scrollInfo.docHeight;
        }

        // If page cannot scroll any further
        if (Math.abs(scrollInfo.currentY - lastScrollY) < 1 && step > 1) {
          break;
        }

        const dataUrl = await captureFrameSafely(tabId, windowId);

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
    // Restore sticky elements to their original state (same reliable
    // executeScript path as the hide call above).
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (typeof (window as any).__gofully_restore_sticky === "function") {
          (window as any).__gofully_restore_sticky();
        }
      },
    }).catch(() => {});

    // Restore hidden cookie banners and overlays
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const hidden = (window as any).__gofully_hidden_overlays as HTMLElement[] | undefined;
        if (hidden) {
          hidden.forEach((el) => {
            el.style.display = el.dataset.gofullyOrigDisplay ?? "";
            delete el.dataset.gofullyOrigDisplay;
          });
        }
        delete (window as any).__gofully_hidden_overlays;
      },
    }).catch(() => {});

    // Resume videos that were paused for capture
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const paused = (window as any).__gofully_paused_videos as HTMLVideoElement[] | undefined;
        if (paused) { paused.forEach((v) => { try { v.play(); } catch {} }); }
        delete (window as any).__gofully_paused_videos;
      },
    }).catch(() => {});

    // Restore smooth scroll behavior and original scroll position
    await cleanupScrollCapture(tabId, pageInit.initialScrollY, pageInit.targetSelector).catch(() => {});

    await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_KEEPALIVE_STOP" }).catch(() => {});

    onProgress?.({ current: 0, total: 0, phase: "done" });
  }

  onProgress?.({ current: 0, total: 0, phase: "stitching" });

  // Seam verification: compare adjacent frame boundaries and re-capture bad seams
  if (frames.length >= 2) {
    const badSeams = await verifySeams(frames, dpr);
    if (badSeams.length > 0 && !isCaptureCancelled) {
      try {
        // Re-enter capture mode to fix bad seams
        await initScrollCapture(tabId);
        await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_KEEPALIVE_START" }).catch(() => {});

        // The original hide-sticky state was already reverted by the
        // finally-block restore above (opacity back to normal). Every
        // re-captured seam frame here is, by definition, not the top-of-page
        // frame, so a fixed/sticky header must be hidden again before any of
        // these recaptures or it bakes straight back into the "fixed" seam.
        await hideStickyForCurrentPosition();

        for (const seamIdx of badSeams) {
          if (isCaptureCancelled) break;
          const badFrame = frames[seamIdx + 1];
          const targetY = badFrame.dstY ?? badFrame.scrollY;

          await performScroll(tabId, targetY, pageInit.targetSelector);
          await sleep(CAPTURE_DELAY + 100);
          await hideStickyForCurrentPosition();

          const newDataUrl = await captureFrameSafely(tabId, windowId);
          badFrame.dataUrl = newDataUrl;
        }

        await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_KEEPALIVE_STOP" }).catch(() => {});
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            if (typeof (window as any).__gofully_restore_sticky === "function") {
              (window as any).__gofully_restore_sticky();
            }
          },
        }).catch(() => {});
        await cleanupScrollCapture(tabId, pageInit.initialScrollY, pageInit.targetSelector).catch(() => {});
      } catch {
        // Re-capture failed — use original frames
      }
    }
  }

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

      // Temporarily disable smooth scroll so programmatic scrollTo is
      // instantaneous, and hide scrollbars everywhere — each frame is a
      // captureVisibleTab() snapshot taken right after a programmatic
      // scroll, and Chrome's overlay scrollbar thumb is still fading out at
      // that exact instant on most systems, so without this it gets baked
      // into the stitched image once per frame near the scroll edge.
      const styleEl = document.createElement("style");
      styleEl.id = "__gf_no_smooth_scroll";
      styleEl.textContent = `
        * { scroll-behavior: auto !important; }
        * { scrollbar-width: none !important; }
        *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      `;
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

async function verifySeams(
  frames: CaptureFrame[],
  dpr: number
): Promise<number[]> {
  const badSeams: number[] = [];
  if (frames.length < 2) return badSeams;

  for (let i = 0; i < frames.length - 1; i++) {
    const upper = frames[i];
    const lower = frames[i + 1];

    const upperEnd = (upper.dstY ?? upper.scrollY) + (upper.cropHeight ?? upper.height);
    const lowerStart = lower.dstY ?? lower.scrollY;
    if (Math.abs(upperEnd - lowerStart) > 2) continue;

    const stripH = Math.min(OVERLAP_PX, Math.floor((upper.cropHeight ?? upper.height) / 4));
    if (stripH < 4) continue;

    try {
      const imgA = await loadImage(upper.dataUrl);
      const imgB = await loadImage(lower.dataUrl);
      const frameDprA = imgA.width / upper.width;
      const frameDprB = imgB.width / lower.width;

      const sampleW = Math.min(imgA.width, imgB.width, 200);
      const stripHpxA = Math.round(stripH * frameDprA);
      const stripHpxB = Math.round(stripH * frameDprB);

      const canvasA = new OffscreenCanvas(sampleW, stripHpxA);
      const ctxA = canvasA.getContext("2d")!;
      const cropYA = Math.round(((upper.cropHeight ?? upper.height) - stripH) * frameDprA) + Math.round((upper.cropY ?? 0) * frameDprA);
      ctxA.drawImage(imgA, 0, cropYA, sampleW, stripHpxA, 0, 0, sampleW, stripHpxA);

      const canvasB = new OffscreenCanvas(sampleW, stripHpxB);
      const ctxB = canvasB.getContext("2d")!;
      const cropYB = Math.round((lower.cropY ?? 0) * frameDprB);
      ctxB.drawImage(imgB, 0, cropYB, sampleW, stripHpxB, 0, 0, sampleW, stripHpxB);

      const normalH = Math.min(stripHpxA, stripHpxB);
      const dataA = ctxA.getImageData(0, stripHpxA - normalH, sampleW, normalH).data;
      const dataB = ctxB.getImageData(0, 0, sampleW, normalH).data;

      let diffSum = 0;
      const totalPixels = sampleW * normalH;
      for (let p = 0; p < dataA.length; p += 4) {
        const dr = Math.abs(dataA[p] - dataB[p]);
        const dg = Math.abs(dataA[p + 1] - dataB[p + 1]);
        const db = Math.abs(dataA[p + 2] - dataB[p + 2]);
        diffSum += (dr + dg + db) / (3 * 255);
      }
      const mismatchRatio = diffSum / totalPixels;

      if (mismatchRatio > SEAM_MISMATCH_THRESHOLD) {
        badSeams.push(i);
      }
    } catch {
      // Can't verify this seam — skip
    }
  }
  return badSeams;
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

/**
 * Wraps a single captureVisibleTab() shutter with badge suppression so the
 * in-page progress badge can never be baked into the frame — see the
 * suppressProgressInTab doc comment in utils/progress-overlay.ts for why
 * hideProgressInTab alone isn't sufficient on a busy real page.
 */
async function captureFrameSafely(tabId: number, windowId?: number): Promise<string> {
  await suppressProgressInTab(tabId);
  await hideProgressInTab(tabId);
  try {
    return await captureWithRetry(windowId);
  } finally {
    await unsuppressProgressInTab(tabId);
  }
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
