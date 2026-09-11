import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text (Coming Soon)",
  description:
    "Preview GoFully's upcoming smart highlighter tool. Learn how semi-transparent blending and straight-line snapping let you emphasize key UI elements cleanly.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots" },
  openGraph: {
    title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text — GoFully",
    description:
      "A technical walkthrough and preview of GoFully v1.1.2 highlighter tool. CleanShot-grade text emphasis with multiply-blend canvas rendering.",
    url: "https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots",
  headline: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text",
  description:
    "A guide and technical preview of GoFully's upcoming annotation highlighter: semi-transparent multiply-blending, straight-line snapping, and crisp contrast for documentation.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
  author: {
    "@type": "Organization",
    name: "GoFully",
    url: "https://gofully-extension.vercel.app/",
  },
  publisher: {
    "@type": "Organization",
    name: "GoFully",
    url: "https://gofully-extension.vercel.app/",
    logo: {
      "@type": "ImageObject",
      url: "https://gofully-extension.vercel.app/logo.png",
    },
  },
};

export default function HighlighterToolGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Screenshot Highlighter Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center" style={{ padding: "36px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="inline-flex items-center gap-2 border border-amber-300 bg-amber-50/80 px-3 py-1 text-[11px] font-semibold text-amber-700 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon · Planned for v1.1.2
          </div>
          <h1
            className="gf-heading-font font-semibold"
            style={{ fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 16 }}
          >
            How to Use the Highlighter Tool in Screenshots Without Obscuring Text
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Highlighting text or UI elements should guide the eye, not turn your screenshot into a messy finger-painting. Here is how clean visual highlighting works.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            {/* Feature Status Callout */}
            <div className="border border-dashed border-amber-300 bg-amber-50/50 p-5 rounded-none">
              <h2 className="gf-heading-font font-semibold text-[16px] text-amber-900 mb-2">
                Preview Specification · Roadmap Feature
              </h2>
              <p className="text-[14px] leading-relaxed text-amber-800/90">
                GoFully currently features solid annotation shapes (rectangles, circles, arrows, callout text, blur, and redaction). The new <strong>Multiply-Blend Highlighter</strong> with smart horizontal snap is undergoing final usability polishing for <strong>v1.1.2</strong>. Follow our progress on the{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-amber-950">
                  public roadmap
                </Link>.
              </p>
            </div>

            {/* Why Standard Screenshot Highlighters Fail */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                The Problem: Why Most Screenshot Highlighters Look Cluttered
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Most browser capture tools implement highlighters as standard canvas paint brushes with a simple alpha channel (e.g. 50% yellow opacity). This causes two major defects:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">1. Washed-Out Text Contrast</h3>
                  <p className="text-neutral-600">Standard alpha blending places yellow pigments over dark letters, turning crisp 100% black typography into muddy grayish-brown.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">2. Crooked Freehand Strokes</h3>
                  <p className="text-neutral-600">Freehand mouse drawing produces wavy, uneven lines that look unpolished in professional executive presentations and customer support docs.</p>
                </div>
              </div>
            </section>

            {/* The GoFully Solution: Multiply Blending & Auto-Snap */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                The GoFully Approach: Multiply Blend &amp; Horizontal Snap
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Inspired by macOS-native tools like CleanShot X, GoFully v1.1.2 integrates two dedicated rendering features:
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">
                    Canvas <code className="text-blue-600 font-mono text-xs">globalCompositeOperation = &apos;multiply&apos;</code>
                  </h3>
                  <p className="text-[14px] text-neutral-600">
                    Instead of painting over text, multiply blending darkens the background with the highlighter pigment while leaving underlying black text pitch black. Your letters remain razor-sharp.
                  </p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">
                    Hold <kbd className="border bg-white px-1.5 py-0.5 font-mono text-xs">Shift</kbd> for Level Horizontal Ruler Snapping
                  </h3>
                  <p className="text-[14px] text-neutral-600">
                    Holding Shift locks the highlighter angle to a perfectly straight horizontal line, matching the exact baseline of text paragraphs and data tables.
                  </p>
                </div>
              </div>
            </section>

            {/* Step by Step Guide */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step-by-Step: Highlighting Screenshots in v1.1.2
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Capture the Page</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Take a full-page or visible area screenshot using GoFully. The image opens immediately in the annotation viewer.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Select the Highlighter (H)</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Click the highlighter icon on the top canvas toolbar or press the <kbd className="border bg-neutral-100 px-1.5 py-0.5 text-xs font-mono">H</kbd> key.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Choose Color &amp; Stroke Thickness</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Select from curated palettes: Canary Yellow, Emerald Green, Electric Cyan, or Soft Rose. Adjust stroke width to match your typography size.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Draw with Straight-Line Snapping</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Click and drag across the sentence. Hold <kbd className="border bg-neutral-100 px-1.5 py-0.5 text-xs font-mono">Shift</kbd> to lock the line horizontally.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides & Early Access */}
            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Complementary Annotation Guides
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Learn how to combine highlighting with privacy redaction and full-page scrolling captures:
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/how-to-blur-sensitive-info-in-screenshots"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Read Blur &amp; Redaction Guide →
                </Link>
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
              </div>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* Global CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Clean, professional annotations on any webpage
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          100% free, on-device, and private. Capture, crop, annotate, and export without watermarks.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add GoFully to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
