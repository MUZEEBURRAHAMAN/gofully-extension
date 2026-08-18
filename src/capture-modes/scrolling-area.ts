import type { CaptureRegion, CaptureResult, CaptureFrame, CaptureProgress } from "../types";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { loadImage, canvasToBlob } from "../utils/image";

const SPEED_MAP = { slow: 800, medium: 600, fast: 500 };
const DUPLICATE_THRESHOLD = 0.98;

export async function captureScrollingArea(
  tabId: number,
  region: CaptureRegion,
  speed: "slow" | "medium" | "fast",
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  const frames: CaptureFrame[] = [];
  const delay = SPEED_MAP[speed];

  // Get page dimensions
  const [{ result: pageInfo }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
    }),
  });

  const pi = pageInfo as { scrollHeight: number; scrollY: number; viewportHeight: number };
  const scrollStep = region.height;
  const estimatedSteps = Math.ceil(
    (pi.scrollHeight - pi.scrollY) / scrollStep
  );
  let dpr = 1;
  let lastFrameHash = "";
  let step = 0;

  // Capture first frame at current position
  const firstFrame = await captureAndCropFrame(tabId, region);
  if (firstFrame) {
    const img = await loadImage(firstFrame.dataUrl);
    dpr = detectDPRFromCapture(img.width, region.width);
    if (dpr === 0) dpr = 1;

    frames.push(firstFrame);
    lastFrameHash = await hashFrame(firstFrame.dataUrl);
    step++;
    onProgress?.({ current: step, total: estimatedSteps, phase: "capturing" });
  }

  // Auto-scroll and capture loop
  let reachedEnd = false;
  while (!reachedEnd) {
    // Scroll by region height
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (dy: number) => window.scrollBy(0, dy),
      args: [scrollStep],
    });

    await sleep(delay);

    // Check if we actually scrolled
    const [{ result: newPos }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.scrollY,
    });

    const frame = await captureAndCropFrame(tabId, region);
    if (!frame) break;

    const hash = await hashFrame(frame.dataUrl);

    // Duplicate detection — page end reached
    if (hash === lastFrameHash) {
      reachedEnd = true;
      break;
    }

    frames.push(frame);
    lastFrameHash = hash;
    step++;
    onProgress?.({ current: step, total: estimatedSteps, phase: "capturing" });

    // Safety: max 200 frames
    if (frames.length >= 200) break;
  }

  onProgress?.({ current: 0, total: 0, phase: "stitching" });

  // Stitch all frames vertically
  const blob = await stitchScrollingFrames(frames, region, dpr);
  const tab = await chrome.tabs.get(tabId);

  return {
    blob,
    width: Math.round(region.width * dpr),
    height: Math.round(region.height * frames.length * dpr),
    mode: "scrolling-area",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

export async function captureManualFrame(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureFrame | null> {
  return captureAndCropFrame(tabId, region);
}

export async function stitchManualFrames(
  frames: CaptureFrame[],
  region: CaptureRegion,
  tabId: number
): Promise<CaptureResult> {
  const firstImg = frames.length > 0 ? await loadImage(frames[0].dataUrl) : null;
  const dpr = firstImg ? firstImg.width / region.width : 1;
  const blob = await stitchScrollingFrames(frames, region, dpr);
  const tab = await chrome.tabs.get(tabId);

  return {
    blob,
    width: Math.round(region.width * dpr),
    height: Math.round(region.height * frames.length * dpr),
    mode: "scrolling-area",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

async function captureAndCropFrame(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureFrame | null> {
  try {
    const dataUrl = await captureWithRetry();

    const img = await loadImage(dataUrl);
    const [{ result: vpWidth }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.innerWidth,
    });
    const dpr = img.width / (vpWidth || img.width);

    // Crop to region
    const sx = Math.round(region.x * dpr);
    const sy = Math.round(region.y * dpr);
    const sw = Math.round(region.width * dpr);
    const sh = Math.round(region.height * dpr);

    const canvas = new OffscreenCanvas(sw, sh);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
    const croppedUrl = await blobToDataUrl(croppedBlob);

    return {
      dataUrl: croppedUrl,
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      scrollX: 0,
      scrollY: 0,
    };
  } catch {
    return null;
  }
}

async function stitchScrollingFrames(
  frames: CaptureFrame[],
  region: CaptureRegion,
  dpr: number
): Promise<Blob> {
  if (frames.length === 0) throw new Error("No frames to stitch");

  // Load first frame to get actual pixel dimensions
  const firstImg = await loadImage(frames[0].dataUrl);
  const frameWidth = firstImg.width;
  const frameHeight = firstImg.height;

  const totalHeight = frameHeight * frames.length;
  const canvas = new OffscreenCanvas(frameWidth, totalHeight);
  const ctx = canvas.getContext("2d")!;

  for (let i = 0; i < frames.length; i++) {
    const img = await loadImage(frames[i].dataUrl);
    ctx.drawImage(img, 0, i * frameHeight);
  }

  return canvasToBlob(canvas);
}

async function hashFrame(dataUrl: string): Promise<string> {
  // Simple pixel sampling hash for duplicate detection
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

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}
