import type { CaptureResult, CaptureFrame, ScrollableElementInfo, CaptureProgress } from "../types";
import { loadImage, canvasToBlob } from "../utils/image";

const CAPTURE_DELAY = 800;

export async function captureScrollableElement(
  tabId: number,
  elementInfo: ScrollableElementInfo,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  const { selector, scrollHeight, clientHeight, scrollWidth, clientWidth } = elementInfo;

  // Save original scroll position
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        (el as any).__snapforge_origScrollTop = el.scrollTop;
        (el as any).__snapforge_origScrollLeft = el.scrollLeft;
        el.scrollTop = 0;
        el.scrollLeft = 0;
      }
    },
    args: [selector],
  });

  await sleep(CAPTURE_DELAY);

  const frames: CaptureFrame[] = [];
  const totalSteps = Math.ceil(scrollHeight / clientHeight);

  for (let step = 0; step < totalSteps; step++) {
    // Scroll element to position
    const scrollY = step * clientHeight;
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (sel: string, y: number) => {
        const el = document.querySelector(sel) as HTMLElement;
        if (el) el.scrollTop = y;
      },
      args: [selector, scrollY],
    });

    await sleep(CAPTURE_DELAY);

    // Get current element rect (may shift if page scrolls)
    const [{ result: rect }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      },
      args: [selector],
    });

    if (!rect) break;

    // Capture visible tab and crop to element bounds
    const dataUrl = await captureWithRetry();

    const img = await loadImage(dataUrl);
    const vpWidth =
      (
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => window.innerWidth,
        })
      )[0].result || 1;
    const dpr = img.width / vpWidth;

    const sx = Math.round(rect.x * dpr);
    const sy = Math.round(rect.y * dpr);
    const sw = Math.round(rect.width * dpr);
    const sh = Math.round(rect.height * dpr);

    const cropCanvas = new OffscreenCanvas(sw, sh);
    const cropCtx = cropCanvas.getContext("2d")!;
    cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const croppedBlob = await cropCanvas.convertToBlob({ type: "image/png" });
    const croppedUrl = await blobToDataUrl(croppedBlob);

    // For the last frame, we may have partial content
    const isLastFrame = scrollY + clientHeight >= scrollHeight;
    const effectiveHeight = isLastFrame
      ? scrollHeight - scrollY
      : clientHeight;

    frames.push({
      dataUrl: croppedUrl,
      x: 0,
      y: scrollY,
      width: rect.width,
      height: effectiveHeight,
      scrollX: 0,
      scrollY,
    });

    onProgress?.({
      current: step + 1,
      total: totalSteps,
      phase: "capturing",
    });
  }

  // Restore original scroll position
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        el.scrollTop = (el as any).__snapforge_origScrollTop || 0;
        el.scrollLeft = (el as any).__snapforge_origScrollLeft || 0;
      }
    },
    args: [selector],
  });

  onProgress?.({ current: 0, total: 0, phase: "stitching" });

  // Stitch frames
  const blob = await stitchElementFrames(frames, clientHeight, scrollHeight);
  const tab = await chrome.tabs.get(tabId);

  const firstImg = await loadImage(frames[0].dataUrl);

  return {
    blob,
    width: firstImg.width,
    height: Math.round(firstImg.width * (scrollHeight / clientWidth)),
    mode: "scrollable-element",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

async function stitchElementFrames(
  frames: CaptureFrame[],
  clientHeight: number,
  scrollHeight: number
): Promise<Blob> {
  if (frames.length === 0) throw new Error("No frames to stitch");

  const firstImg = await loadImage(frames[0].dataUrl);
  const frameWidth = firstImg.width;
  const fullFrameHeight = firstImg.height;

  // Calculate the DPR-scaled total height
  const dpr = fullFrameHeight / clientHeight;
  const totalPixelHeight = Math.round(scrollHeight * dpr);

  const canvas = new OffscreenCanvas(frameWidth, totalPixelHeight);
  const ctx = canvas.getContext("2d")!;

  for (let i = 0; i < frames.length; i++) {
    const img = await loadImage(frames[i].dataUrl);
    const dstY = Math.round(frames[i].scrollY * dpr);

    // For the last frame, only draw the portion that contains new content
    if (i === frames.length - 1) {
      const remainingHeight = totalPixelHeight - dstY;
      const srcY = img.height - remainingHeight;
      if (srcY > 0) {
        ctx.drawImage(
          img,
          0, srcY, frameWidth, remainingHeight,
          0, dstY, frameWidth, remainingHeight
        );
      } else {
        ctx.drawImage(img, 0, dstY);
      }
    } else {
      ctx.drawImage(img, 0, dstY);
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

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}
