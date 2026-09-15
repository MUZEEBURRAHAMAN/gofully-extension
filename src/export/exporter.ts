import type { CaptureResult, ExportFormat } from "../types";
import { copyToClipboard } from "./clipboard";
import { savePng } from "./save-png";
import { downloadPDF } from "./pdf-generator";

export async function exportCapture(
  result: CaptureResult,
  format: ExportFormat,
  options?: { saveAs?: boolean; pdfPageSize?: "a4" | "letter"; pdfWatermark?: boolean; jpgQuality?: number }
): Promise<void> {
  const domain = getDomain(result.url);

  switch (format) {
    case "clipboard":
      await copyToClipboard(result.blob);
      break;

    case "png":
      await savePng(result.blob, domain, options?.saveAs);
      break;

    case "jpg": {
      const bitmap = await createImageBitmap(result.blob);
      const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
      oc.getContext("2d")!.drawImage(bitmap, 0, 0);
      const jpgBlob = await oc.convertToBlob({ type: "image/jpeg", quality: options?.jpgQuality ?? 0.92 });
      const filename = `gofully-${domain}-${Date.now()}.jpg`;
      const url = URL.createObjectURL(jpgBlob);
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      break;
    }

    case "webp": {
      const bitmap = await createImageBitmap(result.blob);
      const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
      oc.getContext("2d")!.drawImage(bitmap, 0, 0);
      const webpBlob = await oc.convertToBlob({ type: "image/webp", quality: 0.92 });
      const filename = `gofully-${domain}-${Date.now()}.webp`;
      const url = URL.createObjectURL(webpBlob);
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      break;
    }

    case "pdf":
      await downloadPDF(
        result.blob,
        domain,
        options?.pdfPageSize || "a4",
        options?.pdfWatermark ? result.url : undefined
      );
      break;
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}
