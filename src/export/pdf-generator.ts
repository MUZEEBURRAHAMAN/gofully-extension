import { jsPDF } from "jspdf";
import { generateFilename } from "../utils/image";

export async function generatePDF(
  imageBlob: Blob,
  pageSize: "a4" | "letter" = "a4",
  watermarkUrl?: string
): Promise<Blob> {
  const dataUrl = await blobToDataUrl(imageBlob);
  let imgWidth = 0;
  let imgHeight = 0;

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(imageBlob);
    imgWidth = bitmap.width;
    imgHeight = bitmap.height;
    if (typeof bitmap.close === "function") bitmap.close();
  } else if (typeof Image !== "undefined") {
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for PDF"));
    });
    imgWidth = img.width;
    imgHeight = img.height;
  }

  if (imgWidth === 0 || imgHeight === 0) {
    throw new Error("Invalid image dimensions for PDF generation");
  }

  const PAGE_SIZES: Record<"a4" | "letter", { width: number; height: number }> = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612.0, height: 792.0 },
  };

  const selectedSize = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  const isLandscape = imgWidth > imgHeight && imgHeight <= selectedSize.width;
  const pageW = isLandscape ? selectedSize.height : selectedSize.width;
  const pageH = isLandscape ? selectedSize.width : selectedSize.height;

  // Scale the image so its width fills the page width
  const scale = pageW / imgWidth;
  const scaledTotalH = imgHeight * scale;

  // Calculate pages required based on standard page height
  const totalPages = Math.max(1, Math.ceil(scaledTotalH / pageH));

  const pdf = new jsPDF({
    unit: "pt",
    format: [pageW, pageH],
    orientation: isLandscape ? "landscape" : "portrait",
  });

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      pdf.addPage([pageW, pageH], isLandscape ? "landscape" : "portrait");
    }

    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      -(i * pageH),
      pageW,
      scaledTotalH,
      undefined,
      "FAST"
    );

    if (watermarkUrl) {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(watermarkUrl, 14, pageH - 10);
      if (totalPages > 1) {
        pdf.text(
          `Page ${i + 1} of ${totalPages}`,
          pageW - 75,
          pageH - 10
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
