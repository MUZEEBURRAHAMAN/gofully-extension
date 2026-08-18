export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function loadImage(src: string): Promise<ImageBitmap> {
  if (src.startsWith("data:")) {
    const res = await fetch(src);
    const blob = await res.blob();
    return createImageBitmap(blob);
  }
  const res = await fetch(src);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

export function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type = "image/png",
  quality = 1
): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}

export function generateFilename(
  domain: string,
  ext: "png" | "pdf"
): string {
  const now = new Date();
  const ts = now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
  const clean = domain.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  return `gofully-${clean}-${ts}.${ext}`;
}

const MAX_CANVAS_DIM = 16384;
const MAX_CANVAS_AREA = 16384 * 16384;

export interface TileInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeTiles(
  totalWidth: number,
  totalHeight: number
): TileInfo[] {
  const cols = Math.ceil(totalWidth / MAX_CANVAS_DIM);
  const rows = Math.ceil(totalHeight / MAX_CANVAS_DIM);
  const tiles: TileInfo[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * MAX_CANVAS_DIM;
      const y = row * MAX_CANVAS_DIM;
      const w = Math.min(MAX_CANVAS_DIM, totalWidth - x);
      const h = Math.min(MAX_CANVAS_DIM, totalHeight - y);
      if (w > 0 && h > 0) tiles.push({ x, y, width: w, height: h });
    }
  }
  return tiles;
}

export function needsTiling(width: number, height: number): boolean {
  return (
    width > MAX_CANVAS_DIM ||
    height > MAX_CANVAS_DIM ||
    width * height > MAX_CANVAS_AREA
  );
}
