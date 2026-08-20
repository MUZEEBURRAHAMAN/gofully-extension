import { jsPDF } from "jspdf";
import { generateFilename } from "../utils/image";

export async function generatePDF(
  imageBlob: Blob,
  _pageSize: "a4" | "letter" = "a4",
  watermarkUrl?: string
): Promise<Blob> {
  const dataUrl = await blobToDataUrl(imageBlob);
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image for PDF"));
  });

  const PX_TO_PT = 0.75; // Standard 96 DPI CSS/web rendering: 1px = 0.75pt
  const pageW = Math.round(img.width * PX_TO_PT);
  const fullH  = Math.round(img.height * PX_TO_PT);

  // PDF spec allows up to 14400pt (~200 in) per page
  const MAX_PAGE_H = 14400;
  const pageH = Math.min(fullH, MAX_PAGE_H);
  const totalPages = Math.ceil(fullH / pageH);

  const pdf = new jsPDF({
    unit: "pt",
    format: [pageW, pageH],
    orientation: pageW > pageH ? "landscape" : "portrait",
  });

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      const remainH = fullH - i * pageH;
      const thisH = Math.min(pageH, remainH);
      pdf.addPage([pageW, thisH], pageW > thisH ? "landscape" : "portrait");
    }

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
  const pdfBlob = await generatePDF(imageBlob, pageSize, watermarkUrl);
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
