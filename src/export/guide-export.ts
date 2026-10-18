import { jsPDF } from "jspdf";
import type { Guide } from "../utils/guide";

const PAGE = { a4: { w: 595.28, h: 841.89 }, letter: { w: 612, h: 792 } } as const;
const BLUE: [number, number, number] = [22, 103, 242];
const INK: [number, number, number] = [29, 31, 32];

export function guideSlug(title: string): string {
  const s = (title || "guide").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (s || "guide").slice(0, 60);
}

export function guideTitle(g: Guide): string {
  return g.title.trim() || "Step-by-step guide";
}

/** A4/Letter portrait PDF: title, then each step as heading, caption and screenshot. */
export function buildGuidePdf(g: Guide, size: "a4" | "letter" = "a4"): Blob {
  const { w: PW, h: PH } = PAGE[size];
  const M = 48;
  const CW = PW - M * 2;
  const pdf = new jsPDF({ unit: "pt", format: [PW, PH], orientation: "portrait" });
  let y = M;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...INK);
  const titleLines = pdf.splitTextToSize(guideTitle(g), CW) as string[];
  pdf.text(titleLines, M, y + 18);
  y += titleLines.length * 26 + 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(110, 114, 120);
  pdf.text(`${g.steps.length} step${g.steps.length === 1 ? "" : "s"}`, M, y + 8);
  y += 30;

  g.steps.forEach((s, i) => {
    const caption = s.caption.trim();
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const capLines = caption ? (pdf.splitTextToSize(caption, CW) as string[]) : [];
    const headH = 22 + capLines.length * 15 + (capLines.length ? 6 : 0);

    // fit the image into the width, and never taller than a page's usable height
    const maxImgH = PH - M * 2 - headH;
    const scale = Math.min(CW / s.w, maxImgH / s.h);
    const iw = s.w * scale;
    const ih = s.h * scale;

    if (y + headH + ih > PH - M) {
      pdf.addPage([PW, PH], "portrait");
      y = M;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...BLUE);
    pdf.text(`Step ${i + 1}`, M, y + 12);
    y += 22;

    if (capLines.length) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...INK);
      pdf.text(capLines, M, y + 8);
      y += capLines.length * 15 + 6;
    }

    pdf.addImage(s.img, "JPEG", M, y, iw, ih);
    pdf.setDrawColor(220, 224, 230);
    pdf.rect(M, y, iw, ih);
    y += ih + 28;
  });

  return pdf.output("blob");
}

/** Markdown + images as a ZIP (plain Markdown can't carry images without a server). */
export function buildGuideMarkdown(g: Guide): string {
  const lines = [`# ${guideTitle(g)}`, ""];
  g.steps.forEach((s, i) => {
    lines.push(`## Step ${i + 1}`, "");
    if (s.caption.trim()) lines.push(s.caption.trim(), "");
    lines.push(`![Step ${i + 1}](images/step-${String(i + 1).padStart(2, "0")}.jpg)`, "");
  });
  return lines.join("\n");
}
