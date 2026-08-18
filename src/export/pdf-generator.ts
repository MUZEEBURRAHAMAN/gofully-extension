import { jsPDF } from "jspdf";
import { generateFilename } from "../utils/image";

export async function generatePDF(
  imageBlob: Blob,
  _pageSize: "a4" | "letter" = "a4",
  watermarkUrl?: string
): Promise<Blob> {
  const img = await createImageBitmap(imageBlob);

  // Treat the capture as 144 DPI (2× retina): 2 image pixels = 1 pt.
  // This makes the PDF page match the page's CSS pixel dimensions exactly,
  // so the content looks crisp and properly sized in any PDF viewer.
  const PX_TO_PT = 0.5;
  const pageW = Math.round(img.width * PX_TO_PT);
  const fullH  = Math.round(img.height * PX_TO_PT);

  // PDF spec allows up to 14400pt (~200 in) per page
  const MAX_PAGE_H = 14400;
  const pageH = Math.min(fullH, MAX_PAGE_H);
  const totalPages = Math.ceil(fullH / pageH);

  const dataUrl = await blobToDataUrl(imageBlob);

  const pdf = new jsPDF({
    unit: "pt",
    format: [pageW, pageH],
  });

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      const remainH = fullH - i * pageH;
      pdf.addPage([pageW, Math.min(pageH, remainH)]);
    }

    // Draw full image, offset upward per page. "NONE" = no extra compression —
    // the PNG is already losslessly compressed; re-encoding degrades quality.
    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      -(i * pageH),
      pageW,
      fullH,
      undefined,
      "NONE"
    );

    if (watermarkUrl) {
      const thisPageH = i === totalPages - 1 ? fullH - i * pageH : pageH;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(watermarkUrl, 10, thisPageH - 10);
      if (totalPages > 1) {
        pdf.text(
          `Page ${i + 1} of ${totalPages}`,
          pageW - 80,
          thisPageH - 10
        );
      }
    }
  }

  return pdf.output("blob");
}

export async function downloadPDF(
  imageBlob: Blob,
  domain: string,
  pageSize: "a4" | "letter" = "a4",
  watermarkUrl?: string
): Promise<void> {
  const pdfBlob = await generatePDF(imageBlob, pageSize, watermarkUrl); // pageSize kept for API compat
  const dataUrl = await blobToDataUrl(pdfBlob);
  const filename = generateFilename(domain, "pdf");

  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false,
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
