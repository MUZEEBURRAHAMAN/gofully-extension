import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { GuideBrowser } from "@/components/site/guide-browser";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Browser Capture & Screenshot Guides",
  description:
    "Master web captures with step-by-step guides on full-page scrolling screenshots in Chrome, on-device OCR text extraction, and privacy redaction.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides" },
  openGraph: {
    title: "Browser Capture & Screenshot Guides — GoFully",
    description:
      "Step-by-step tutorials on capturing entire webpages, blurring sensitive information, and extracting text from images locally.",
    url: "https://gofully-extension.vercel.app/guides",
    siteName: "GoFully",
  },
};

interface GuideItem {
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  readTime: string;
  date: string;
  comingSoon?: boolean;
}

const GUIDES: GuideItem[] = [
  {
    slug: "how-to-draw-on-a-live-website",
    title: "How to Draw on Any Live Website and Capture It with Your Marks",
    subtitle:
      "Use GoFully's Draw on Page to sketch arrows, highlight text and add sticky notes right on a live website, then capture the visible area or the full page with your marks in place.",
    tag: "Visual Annotation",
    readTime: "4 min read",
    date: "New in v1.1.3",
  },
  {
    slug: "how-to-capture-a-single-element",
    title: "How to Capture a Single Element on a Webpage (Card, Table or Chat Message)",
    subtitle:
      "Capture just one card, table, chart or chat message in Chrome. GoFully's Capture Element outlines whatever is under your pointer and crops to it exactly.",
    tag: "Capture Tutorial",
    readTime: "3 min read",
    date: "New in v1.1.3",
  },
  {
    slug: "how-to-auto-redact-sensitive-info",
    title: "How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots",
    subtitle:
      "GoFully's Auto-redact reads your screenshot on your device and covers emails, card numbers, phone numbers, ID numbers, IP addresses and API keys with black boxes you review before export.",
    tag: "Privacy & Security",
    readTime: "4 min read",
    date: "New in v1.1.3",
  },
  {
    slug: "how-to-make-a-step-by-step-guide-from-screenshots",
    title: "How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)",
    subtitle:
      "Turn several GoFully captures into one how-to document. Add captions, reorder steps and export a PDF or a Markdown ZIP, all on your device.",
    tag: "Workflow & Docs",
    readTime: "4 min read",
    date: "New in v1.1.3",
  },
  {
    slug: "screenshot-tool-for-developers-and-qa",
    title: "The Screenshot Workflow Built for Developers & QA",
    subtitle:
      "Why full-page capture, redaction, OCR, and PDF export matter for bug reports and QA tickets — and how to use them in one workflow.",
    tag: "Use Case",
    readTime: "5 min read",
    date: "Updated September 2026",
  },
  {
    slug: "best-full-page-screenshot-extensions",
    title: "Best Full Page Screenshot Extensions for Chrome (2026)",
    subtitle:
      "A fact-checked comparison of GoFully, GoFullPage, Awesome Screenshot, FireShot, and Nimbus — by capture modes, OCR, and pricing.",
    tag: "Comparison",
    readTime: "6 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-take-full-page-screenshot-chrome",
    title: "How to Take a Full Page Screenshot in Chrome Without Cutting Off Content",
    subtitle:
      "Learn the 3 ways to capture an entire scrolling webpage in Google Chrome — including DevTools commands and the 1-click extension method.",
    tag: "Capture Tutorial",
    readTime: "5 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-blur-sensitive-info-in-screenshots",
    title: "How to Blur or Redact Sensitive Information in Screenshots (Mac & Windows)",
    subtitle:
      "A complete guide to masking passwords, API tokens, and customer PII before sharing bug reports or documentation.",
    tag: "Privacy & Security",
    readTime: "4 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-extract-unselectable-text",
    title: "How to Extract and Copy Unselectable Text from Any Webpage or Image",
    subtitle:
      "Extract text from infographics, charts, YouTube frames, or locked websites in seconds using on-device WebAssembly OCR.",
    tag: "OCR & Productivity",
    readTime: "4 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-save-webpage-as-pdf",
    title: "How to Save a Full Webpage as PDF in Chrome (Without Cutting Off Content)",
    subtitle:
      "Learn 3 ways to save an entire scrolling webpage as a clean, paginated PDF — print dialog, DevTools, and the 1-click extension method compared.",
    tag: "Export Tutorial",
    readTime: "5 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-beautify-screenshots",
    title: "How to Beautify Screenshots for Social Media & Presentations (Free)",
    subtitle:
      "Turn raw browser screenshots into polished images with custom backgrounds, browser frames, padding, and shadows — no Photoshop or paid tools needed.",
    tag: "Design & Workflow",
    readTime: "4 min read",
    date: "Updated September 2026",
  },
  {
    slug: "privacy-first-screenshot-tools",
    title: "Privacy-First Screenshot Tools: Why Offline Capture Matters in 2026",
    subtitle:
      "Most screenshot extensions upload your images to external servers. Learn why offline-first tools protect your data — and which ones actually stay local.",
    tag: "Privacy & Security",
    readTime: "6 min read",
    date: "Updated September 2026",
  },
  {
    slug: "how-to-extract-text-in-multiple-languages-ocr",
    title: "How to Extract Text in Multiple Languages with On-Device OCR",
    subtitle:
      "Capture and extract Spanish, French, German, Portuguese, and Chinese text from images and locked web apps — 100% locally.",
    tag: "OCR & i18n",
    readTime: "4 min read",
    date: "Available in v1.1.2",
  },
  {
    slug: "custom-keyboard-shortcuts-for-screen-capture",
    title: "How to Set Custom Keyboard Shortcuts for Fast Screen Capture",
    subtitle:
      "Trigger full page scrolling capture, visible area snapshots, or selected region OCR with custom keybindings.",
    tag: "Workflow & Speed",
    readTime: "4 min read",
    date: "Available in v1.1.2",
  },
  {
    slug: "how-to-use-highlighter-tool-in-screenshots",
    title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text",
    subtitle:
      "Emphasize key UI metrics and paragraphs with CleanShot-grade multiply blending and level horizontal snapping.",
    tag: "Visual Annotation",
    readTime: "4 min read",
    date: "Available in v1.1.2",
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://gofully-extension.vercel.app/guides#collection",
  url: "https://gofully-extension.vercel.app/guides",
  name: "Browser Capture & Screenshot Guides",
  description: "Tutorials on full page screenshots, local OCR, and privacy redaction.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-11",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: GUIDES.map((g, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://gofully-extension.vercel.app/guides/${g.slug}`,
      name: g.title,
    })),
  },
};

export default function GuidesIndexPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "Guides" }]} />
      </div>

      {/* Hero */}
      <PageHeader
        eyebrow="Documentation & Tutorials"
        title="Browser Capture & Productivity Guides"
        lede="Practical, in-depth tutorials on full page web captures, CleanShot-grade visual annotation, client-side OCR text extraction, and privacy best practices."
      />

      <div className="gf-sec-plain">
        <GuideBrowser guides={GUIDES} />
      </div>

      {/* CTA */}
      <CtaBand
        title="Ready to streamline your screen captures?"
        sub="100% free, 100% on-device, and zero accounts. Capture full pages, extract text, and redact in seconds."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
