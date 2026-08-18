import type { CaptureFrame } from "../types";
import { loadImage, canvasToBlob, needsTiling, computeTiles } from "../utils/image";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
