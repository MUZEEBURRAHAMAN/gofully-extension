"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/site/icon";
import type { IconName } from "@/ui/ds/icons";
import s from "./landing.module.css";

const CASES: Array<{ tab: string; tag: string; title: string; body: string; points: Array<[IconName, string]>; img: string; alt: string }> = [
  { tab: "Support and QA", tag: "Support and QA", title: "Report a bug in one image", body: "Capture the broken page, circle the bug, blur the customer’s email and attach one image to the ticket.", points: [["full-page", "Full page capture with sticky headers handled"], ["arrow", "Arrow and numbered steps on the bug"], ["blur", "Customer email blurred before sending"], ["copy", "Copied straight into the ticket"]], img: "/landing/draw-4.webp", alt: "A page marked up with a circle, an arrow and a note" },
  { tab: "Product and design", tag: "Product and design", title: "Grab a whole page, then mark what changed", body: "Capture a competitor’s full pricing page, point at what changed and drop it in the doc.", points: [["full-page", "One image of the entire page"], ["arrow", "Arrows, boxes and callouts"], ["region", "Crop to the part that matters"], ["pdf", "Save as PNG, JPG, WebP or PDF"]], img: "/landing/full-page-4.webp", alt: "A long page captured as one tall image" },
  { tab: "Marketing", tag: "Marketing", title: "Turn a product screen into a post", body: "Add a background, frame and tilt in under a minute, then save the look as a preset to reuse.", points: [["beautify", "Gradients, wallpapers or a solid colour"], ["visible", "macOS, Windows or browser frames"], ["layers", "3D tilt and progressive blur"], ["star", "Presets for social posts and slides"]], img: "/landing/beautify-4.webp", alt: "A screenshot on a gradient, tilted in 3D" },
  { tab: "Docs and onboarding", tag: "Docs and onboarding", title: "Send customers one clear PDF", body: "Capture each screen, write a line under each step and export one guide. Up to 30 steps, stored on your device.", points: [["element", "Capture just the card or table you mean"], ["guide", "Write a caption under every step"], ["pdf", "Export a PDF or Markdown with images"], ["lock", "Nothing leaves your device"]], img: "/landing/element-4.webp", alt: "A single card captured from a dashboard" },
  { tab: "Research and study", tag: "Research and study", title: "Pull quotes out of charts and scans", body: "Select text in an image, a locked PDF or a paused video and paste it into your notes.", points: [["text-ocr", "Reads English, Spanish, French, German, Portuguese and Chinese"], ["offline", "Runs offline, no cloud OCR"], ["copy", "Copy as plain text or JSON"], ["search", "Search past captures by what they say"]], img: "/landing/text-4.webp", alt: "Text copied out of a dashboard" },
];

/** Figma: Landing v2 › Use cases. */
export function UseCases() {
  const [i, setI] = useState(0);
  const c = CASES[i];
  return (
    <div>
      <div className={s.tabs} role="tablist" aria-label="Use cases">
        {CASES.map((x, n) => (
          <button key={x.tab} type="button" role="tab" id={`uc-${n}`} aria-selected={n === i} aria-controls="uc-panel" className={`${s.tab} ${n === i ? s.tabOn : ""}`} onClick={() => setI(n)}>
            {x.tab}
          </button>
        ))}
      </div>
      <div className={s.casePanel} id="uc-panel" role="tabpanel" aria-labelledby={`uc-${i}`} key={i}>
        <div className={s.caseText}>
          <span className={s.tag}>{c.tag}</span>
          <h3 className={s.caseTitle}>{c.title}</h3>
          <p>{c.body}</p>
          <ul className={s.checks}>
            {c.points.map(([ic, t]) => (
              <li key={t}><Icon name={ic} size={18} /><span>{t}</span></li>
            ))}
          </ul>
        </div>
        <div className={s.caseShot}>
          <Image src={c.img} alt={c.alt} width={960} height={630} sizes="(max-width: 900px) 100vw, 560px" quality={90} />
        </div>
      </div>
    </div>
  );
}
