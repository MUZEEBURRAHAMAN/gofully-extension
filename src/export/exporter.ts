import type { CaptureResult, ExportFormat } from "../types";
import { copyToClipboard } from "./clipboard";
import { savePng } from "./save-png";
import { downloadPDF } from "./pdf-generator";

export async function exportCapture(
  result: CaptureResult,
  format: ExportFormat,
  options?: { saveAs?: boolean; pdfPageSize?: "a4" | "letter"; pdfWatermark?: boolean }
): Promise<void> {
  const domain = getDomain(result.url);

  switch (format) {
    case "clipboard":
      await copyToClipboard(result.blob);
      break;

    case "png":
      await savePng(result.blob, domain, options?.saveAs);
      break;

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
