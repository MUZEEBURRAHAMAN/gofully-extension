import type { CaptureFrame } from "../types";
import { loadImage, canvasToBlob, needsTiling, computeTiles } from "../utils/image";
import { createWorker } from "tesseract.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OFFSCREEN_PING") {
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === "PERFORM_OCR") {
    const { dataUrl } = message.payload as { dataUrl: string };
    (async () => {
      let worker: any = null;
      try {
        const workerPath = chrome.runtime.getURL("assets/tesseract-worker.min.js");
        const corePath = chrome.runtime.getURL("assets/tesseract-core.wasm.js");
        const langPath = chrome.runtime.getURL("assets");

        // Tesseract's own worker/WASM instantiation is a black box once
        // started — if it stalls (a bad build of the WASM asset, a
        // sandboxing quirk, anything), there's no other signal that it's
        // stuck. Without a bound here, the UI's "Extracting text…" spinner
        // would run forever instead of failing with an actionable message.
        const withTimeout = <T,>(p: Promise<T>, label: string, ms = 20000): Promise<T> =>
          Promise.race([
            p,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error(`OCR engine timed out (${label})`)), ms)
            ),
          ]);

        worker = await withTimeout(
          createWorker({
            workerPath,
            corePath,
            langPath,
            logger: () => {},
            errorHandler: (err) => console.warn("Tesseract worker warning:", err),
          }),
          "starting engine"
        );

        await withTimeout(worker.loadLanguage("eng"), "loading language");
        await withTimeout(worker.initialize("eng"), "initializing engine");
        const ret: any = await withTimeout(worker.recognize(dataUrl), "recognizing text", 30000);
        const text = (ret?.data?.text || "").trim();
        sendResponse({ text });
      } catch (err: any) {
        console.error("Offscreen OCR error:", err);
        sendResponse({ error: err?.message || "OCR recognition failed" });
      } finally {
        if (worker) {
          try { await worker.terminate(); } catch {}
        }
      }
    })();
    return true;
  }

  if (message.type === "STITCH_FRAMES") {
    const { frames, totalWidth, totalHeight, dpr } = message.payload as {
      frames: CaptureFrame[];
      totalWidth: number;
      totalHeight: number;
      dpr: number;
    };

    stitchFrames(frames, totalWidth, totalHeight, dpr)
      .then((blob) => {
        sendResponse({ blob });
      })
      .catch((err) => {
        sendResponse({ error: err.message });
      });

    return true;
  }
  return false;
});

async function stitchFrames(
  frames: CaptureFrame[],
  totalWidth: number,
  totalHeight: number,
  dpr: number
): Promise<Blob> {
  const pixelWidth = Math.round(totalWidth * dpr);
  const pixelHeight = Math.round(totalHeight * dpr);

  if (needsTiling(pixelWidth, pixelHeight)) {
    return stitchTiled(frames, pixelWidth, pixelHeight, dpr);
  }

  const canvas = new OffscreenCanvas(pixelWidth, pixelHeight);
  const ctx = canvas.getContext("2d")!;

  for (const frame of frames) {
    const img = await loadImage(frame.dataUrl);
    const dstX = Math.round(frame.x * dpr);
    const dstY = Math.round(frame.scrollY * dpr);
    ctx.drawImage(img, dstX, dstY);
  }

  return canvasToBlob(canvas);
}

async function stitchTiled(
  frames: CaptureFrame[],
  totalWidth: number,
  totalHeight: number,
  dpr: number
): Promise<Blob> {
  const tiles = computeTiles(totalWidth, totalHeight);

  // For tiled output, we'll create each tile canvas and combine into a single image
  // For now, create the first tile that fits within limits
  const tile = tiles[0];
  const canvas = new OffscreenCanvas(tile.width, tile.height);
  const ctx = canvas.getContext("2d")!;

  for (const frame of frames) {
    const img = await loadImage(frame.dataUrl);
    const dstX = Math.round(frame.x * dpr) - tile.x;
    const dstY = Math.round(frame.scrollY * dpr) - tile.y;

    // Check if this frame overlaps with the current tile
    if (
      dstX + img.width > 0 &&
      dstX < tile.width &&
      dstY + img.height > 0 &&
      dstY < tile.height
    ) {
      ctx.drawImage(img, dstX, dstY);
    }
  }

  return canvasToBlob(canvas);
}
