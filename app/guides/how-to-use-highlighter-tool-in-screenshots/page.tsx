import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text",
  description:
    "Learn how GoFully's smart highlighter tool with semi-transparent blending and straight-line snapping lets you emphasize key UI elements cleanly without obscuring text.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots" },
  openGraph: {
    title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text — GoFully",
    description:
      "A technical walkthrough of GoFully v1.1.2 highlighter tool. CleanShot-grade text emphasis with multiply-blend canvas rendering.",
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
    "A guide to GoFully's annotation highlighter: semi-transparent multiply-blending, straight-line snapping, and crisp contrast for documentation.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-11",
  dateModified: "2026-09-20",
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Screenshot Highlighter Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Available Now · Live in v1.1.2"
        title="How to Use the Highlighter Tool in Screenshots Without Obscuring Text"
        lede="Highlighting text or UI elements should guide the eye, not turn your screenshot into a messy finger-painting. Here is how clean visual highlighting works."
        meta={["By GoFully Engineering", "Updated September 2026", "4 min read"]}
      />

      {/* Article Body */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            {/* Feature Status Callout */}
            <div className="gf-callout gf-callout--green">
              <h2>
                Feature Live in GoFully v1.1.2
              </h2>
              <p className="text-[14px] leading-relaxed text-emerald-800/90">
                The new <strong>Multiply-Blend Highlighter</strong> with smart horizontal snap is officially available in <strong>GoFully v1.1.2</strong>. You can now highlight code snippets, paragraphs, and key metrics with zero text occlusion right inside your browser. See our full journey on the{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-emerald-950">
                  public roadmap
                </Link>.
              </p>
            </div>

            {/* Why Standard Screenshot Highlighters Fail */}
            <section className="space-y-4">
              <h2>
                The Problem: Why Most Screenshot Highlighters Look Cluttered
              </h2>
              <p className="gf-p">
                Most browser capture tools implement highlighters as standard canvas paint brushes with a simple alpha channel (e.g. 50% yellow opacity). This causes two major defects:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="gf-tcard">
                  <h3 className="gf-h3">1. Washed-Out Text Contrast</h3>
                  <p className="text-neutral-600">Standard alpha blending places yellow pigments over dark letters, turning crisp 100% black typography into muddy grayish-brown.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">2. Crooked Freehand Strokes</h3>
                  <p className="text-neutral-600">Freehand mouse drawing produces wavy, uneven lines that look unpolished in professional executive presentations and customer support docs.</p>
                </div>
              </div>
            </section>

            {/* The GoFully Solution: Multiply Blending & Auto-Snap */}
            <section className="space-y-4">
              <h2>
                The GoFully Approach: Multiply Blend &amp; Horizontal Snap
              </h2>
              <p className="gf-p">
                Inspired by macOS-native tools like CleanShot X, GoFully v1.1.2 integrates two dedicated rendering features:
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">
                    Canvas <code>globalCompositeOperation = &apos;multiply&apos;</code>
                  </h3>
                  <p className="gf-small">
                    Instead of painting over text, multiply blending darkens the background with the highlighter pigment while leaving underlying black text pitch black. Your letters remain razor-sharp.
                  </p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">
                    Hold <kbd>Shift</kbd> for Level Horizontal Ruler Snapping
                  </h3>
                  <p className="gf-small">
                    Holding Shift locks the highlighter angle to a perfectly straight horizontal line, matching the exact baseline of text paragraphs and data tables.
                  </p>
                </div>
              </div>
            </section>

            {/* Step by Step Guide */}
            <section className="space-y-4">
              <h2>
                Step-by-Step: Highlighting Screenshots in v1.1.2
              </h2>
              
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Capture the Page</h3>
                  <p className="gf-small">
                    Take a full-page or visible area screenshot using GoFully. The image opens immediately in the annotation viewer.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Select the Highlighter (H)</h3>
                  <p className="gf-small">
                    Click the highlighter icon on the top canvas toolbar or press the <kbd>H</kbd> key.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Choose Color &amp; Stroke Thickness</h3>
                  <p className="gf-small">
                    Select from curated palettes: Canary Yellow, Emerald Green, Electric Cyan, or Soft Rose. Adjust stroke width to match your typography size.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Draw with Straight-Line Snapping</h3>
                  <p className="gf-small">
                    Click and drag across the sentence. Hold <kbd>Shift</kbd> to lock the line horizontally.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides & Early Access */}
            <section className="gf-sep">
              <h2>
                Complementary Annotation Guides
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Learn how to combine highlighting with privacy redaction and full-page scrolling captures:
              </p>
              <div className="gf-btn-row">
                <Link
                  href="/guides/how-to-blur-sensitive-info-in-screenshots"
                  className="gf-btn-p"
                >
                  Read Blur &amp; Redaction Guide →
                </Link>
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="gf-btn-s"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
              </div>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-use-highlighter-tool-in-screenshots" />

      {/* Global CTA */}
      <CtaBand
        title="Clean, professional annotations on any webpage"
        sub="100% free, on-device, and private. Capture, crop, annotate, and export without watermarks."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
