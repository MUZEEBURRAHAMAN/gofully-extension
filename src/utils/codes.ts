/**
 * Reads QR codes and barcodes from an image, on the device. Chrome's built-in
 * BarcodeDetector is used where it exists (macOS, ChromeOS, Android) because it
 * reads many formats; jsQR covers QR codes everywhere else.
 * Decoded values are untrusted text from a picture: show them with textContent
 * and only ever link to them through safeLink().
 */
import jsQR from "jsqr";

export { codeKind, safeLink, CODE_LABEL, type CodeKind } from "./code-links";

export interface FoundCode {
  format: string;
  value: string;
  /** Bounding box in the image's own pixels. */
  box: { x: number; y: number; w: number; h: number };
}

const MAX_VALUE = 4000;
/** jsQR is slow on huge images, so wide captures are scaled to this width first. */
const JSQR_MAX_SIDE = 1600;
/** A very tall capture is read in at most this many slices. */
const MAX_SLICES = 24;

type Detector = { detect(src: ImageBitmapSource): Promise<{ rawValue: string; format: string; boundingBox: DOMRectReadOnly }[]> };

async function nativeDetector(): Promise<Detector | null> {
  const BD = (globalThis as unknown as { BarcodeDetector?: { new (o?: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> } }).BarcodeDetector;
  if (!BD) return null;
  try {
    const formats = await BD.getSupportedFormats();
    return formats.length ? new BD({ formats }) : null;
  } catch {
    return null;
  }
}

function dedupe(codes: FoundCode[]): FoundCode[] {
  const seen = new Set<string>();
  return codes.filter((c) => {
    const k = `${c.format}|${c.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Finds every code in the image. Never throws: an unreadable image just has no codes. */
export async function scanCodes(bitmap: ImageBitmap): Promise<FoundCode[]> {
  const found: FoundCode[] = [];
  const native = await nativeDetector();
  if (native) {
    try {
      for (const r of await native.detect(bitmap)) {
        if (!r.rawValue) continue;
        const b = r.boundingBox;
        found.push({ format: r.format, value: r.rawValue.slice(0, MAX_VALUE), box: { x: b.x, y: b.y, w: b.width, h: b.height } });
      }
    } catch {
      /* fall through to jsQR */
    }
  }
  if (!found.some((c) => c.format === "qr_code")) {
    // jsQR reads one code per call and needs the code at a readable size, so a tall capture is read
    // in overlapping slices at up to 1600 px wide instead of being shrunk as a whole.
    try {
      const scale = Math.min(1, JSQR_MAX_SIDE / bitmap.width);
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const sliceH = Math.min(Math.round(bitmap.height * scale), Math.round(w * 1.25));
      const step = Math.max(1, Math.round(sliceH * 0.75));
      const totalH = Math.round(bitmap.height * scale);
      const canvas = new OffscreenCanvas(w, sliceH);
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      for (let y = 0, n = 0; y < totalH && n < MAX_SLICES; y += step, n++) {
        const h = Math.min(sliceH, totalH - y);
        ctx.clearRect(0, 0, w, sliceH);
        ctx.drawImage(bitmap, 0, y / scale, bitmap.width, h / scale, 0, 0, w, h);
        const qr = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" });
        if (qr?.data) {
          const xs = [qr.location.topLeftCorner.x, qr.location.topRightCorner.x, qr.location.bottomLeftCorner.x, qr.location.bottomRightCorner.x];
          const ys = [qr.location.topLeftCorner.y, qr.location.topRightCorner.y, qr.location.bottomLeftCorner.y, qr.location.bottomRightCorner.y];
          const x = Math.min(...xs) / scale, top = (Math.min(...ys) + y) / scale;
          found.push({ format: "qr_code", value: qr.data.slice(0, MAX_VALUE), box: { x, y: top, w: Math.max(...xs) / scale - x, h: (Math.max(...ys) + y) / scale - top } });
        }
        if (y + h >= totalH) break;
      }
    } catch {
      /* no code */
    }
  }
  return dedupe(found);
}
