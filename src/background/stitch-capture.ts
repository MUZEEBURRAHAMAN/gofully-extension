import type {
  CaptureResult,
  CaptureFrame,
  PageDimensions,
  CaptureProgress,
} from "../types";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { loadImage, canvasToBlob } from "../utils/image";

const CAPTURE_DELAY = 800;

export async function captureWithScrollStitch(
  tabId: number,
  dimensions: PageDimensions,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  const { scrollWidth, scrollHeight, viewportWidth, viewportHeight } =
    dimensions;

  // Hide sticky elements (ignore if content script not ready)
  await chrome.tabs.sendMessage(tabId, { type: "HIDE_STICKY" }).catch(() => {});

  // Pre-scroll to trigger lazy loading (ignore if content script not ready)
  await chrome.tabs.sendMessage(tabId, {
    type: "PRE_SCROLL_LAZY",
    payload: { maxWait: 2000 },
  }).catch(() => {});

  const frames: CaptureFrame[] = [];
  const yStep = viewportHeight;
  const totalSteps = Math.ceil(scrollHeight / yStep);
  let dpr = dimensions.devicePixelRatio;

  for (let step = 0; step < totalSteps; step++) {
    const scrollY = Math.min(step * yStep, scrollHeight - viewportHeight);

    // Scroll to position
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (x: number, y: number) => window.scrollTo(x, y),
      args: [0, scrollY],
    });

    await sleep(CAPTURE_DELAY);

    // Capture visible tab (with retry for rate limit)
    const dataUrl = await captureWithRetry();

    // Detect actual DPR from first frame
    if (step === 0) {
      const img = await loadImage(dataUrl);
      dpr = detectDPRFromCapture(img.width, viewportWidth);
    }

    frames.push({
      dataUrl,
      x: 0,
      y: scrollY,
      width: viewportWidth,
      height: viewportHeight,
      scrollX: 0,
      scrollY,
    });

    onProgress?.({
      current: step + 1,
      total: totalSteps,
      phase: "capturing",
    });
  }

  // Restore sticky elements (ignore if content script not ready)
  await chrome.tabs.sendMessage(tabId, { type: "RESTORE_STICKY" }).catch(() => {});

  // Reset scroll position
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.scrollTo(0, 0),
    args: [],
  });

  onProgress?.({ current: 0, total: 0, phase: "stitching" });

  // Stitch frames
  const blob = await stitchFrames(
    frames,
    scrollWidth,
    scrollHeight,
    dpr,
    viewportHeight
  );

  const tab = await chrome.tabs.get(tabId);

  return {
    blob,
    width: Math.round(scrollWidth * dpr),
    height: Math.round(scrollHeight * dpr),
    mode: "full-page",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

async function stitchFrames(
  frames: CaptureFrame[],
  totalWidth: number,
  totalHeight: number,
  dpr: number,
  viewportHeight: number
): Promise<Blob> {
  const canvasWidth = Math.round(totalWidth * dpr);
  const canvasHeight = Math.round(totalHeight * dpr);

  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d")!;

  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const img = await loadImage(frame.dataUrl);

    const dstX = 0;
    const dstY = Math.round(frame.scrollY * dpr);
    const dstW = Math.min(img.width, canvasWidth);
    const maxDstH = canvasHeight - dstY;

    if (maxDstH <= 0) continue;

    if (img.height <= maxDstH) {
      // Normal frame: draw the whole captured image
      ctx.drawImage(img, 0, 0, img.width, img.height, dstX, dstY, dstW, img.height);
    } else {
      // Last frame bleeds past canvas bottom — draw only what fits,
      // taking from the BOTTOM of the image so the seam aligns correctly
      const srcY = img.height - maxDstH;
      ctx.drawImage(img, 0, srcY, img.width, maxDstH, dstX, dstY, dstW, maxDstH);
    }
  }

  return canvasToBlob(canvas);
}

async function captureWithRetry(maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chrome.tabs.captureVisibleTab({ format: "png" });
    } catch (e: any) {
      if (e?.message?.includes("MAX_CAPTURE") && i < maxRetries - 1) {
        await sleep(1000);
        continue;
      }
      throw e;
    }
  }
  return await chrome.tabs.captureVisibleTab({ format: "png" });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
