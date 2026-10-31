import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Extract Text in Multiple Languages with On-Device OCR",
  description:
    "Learn how GoFully's on-device multi-language OCR lets you extract Spanish, French, German, Portuguese, and Chinese text from images and locked web apps — 100% locally in Chrome.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr" },
  openGraph: {
    title: "How to Extract Text in Multiple Languages with On-Device OCR — GoFully",
    description:
      "A technical walkthrough of GoFully v1.1.2 multi-language on-device OCR engine. Extract international scripts with zero cloud uploads.",
    url: "https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr",
  headline: "How to Extract Text in Multiple Languages with On-Device OCR",
  description:
    "A guide to GoFully's multi-language WebAssembly OCR engine for in-browser text extraction across international character sets.",
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

export default function MultiLanguageOcrGuidePage() {
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
              { label: "Multi-Language OCR Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Available Now · Live in v1.1.2"
        title="How to Extract Text in Multiple Languages with On-Device OCR"
        lede="Extracting international scripts — German, Spanish, French, Portuguese, or Simplified Chinese — from locked web apps without sending proprietary documents to a remote cloud OCR API."
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
                Multi-language OCR is officially live in <strong>GoFully v1.1.2</strong>! Powered by local WebAssembly, you can now extract text in English, Spanish, French, German, Portuguese, and Simplified Chinese without sending a single byte to an external server. Track our full journey on the{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-emerald-950">
                  interactive roadmap
                </Link>.
              </p>
            </div>

            {/* The Problem with Cloud OCR for Global Teams */}
            <section className="space-y-4">
              <h2>
                The Dilemma: Why Cloud Translation APIs Compromise Security
              </h2>
              <p className="gf-p">
                Engineering teams, localization managers, and analysts frequently need to copy foreign text from UI screenshots, video streams, or international SaaS dashboards. However, traditional browser extensions send screen pixels to third-party cloud servers (like Google Cloud Vision or AWS Rekognition) to run OCR.
              </p>
              <p className="gf-p">
                This presents critical compliance risks:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[14.5px] text-neutral-600">
                <li><strong>GDPR &amp; Data Sovereignty:</strong> Pixels containing European customer data leave EU boundaries.</li>
                <li><strong>Confidential Financials:</strong> German or Japanese enterprise contracts cannot be uploaded to unverified OCR proxies.</li>
                <li><strong>Latency:</strong> Network round-trips can take 2–5 seconds, breaking rapid debugging flows.</li>
              </ul>
            </section>

            {/* How Multi-Language OCR Works Locally */}
            <section className="space-y-4">
              <h2>
                How GoFully Multi-Language OCR Works On-Device
              </h2>
              <p className="gf-p">
                GoFully avoids remote API dependencies entirely. In GoFully v1.1.2, language dictionaries are fetched on-demand once and cached directly in your browser&apos;s IndexedDB sandbox.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="gf-tcard">
                  <h3 className="gf-h3">1. Dynamic Language Loading</h3>
                  <p className="text-neutral-600">Only download the language models you need (e.g. Spanish, German, Japanese) without bloating your extension footprint.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">2. Local WebAssembly Execution</h3>
                  <p className="text-neutral-600">Pixel matrices are processed directly via your computer&apos;s CPU using SIMD-accelerated WebAssembly inside a background Service Worker.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">3. UTF-8 Preserving Output</h3>
                  <p className="text-neutral-600">Accents, umlauts, kanji, and non-Latin character spacings are rendered faithfully to the clipboard with one-click copy.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">4. Zero Cloud Exposure</h3>
                  <p className="text-neutral-600">No images or extracted strings ever leave your device. 100% compliant with SOC 2, HIPAA, and internal security policies.</p>
                </div>
              </div>
            </section>

            {/* Step by Step Walkthrough */}
            <section className="space-y-4">
              <h2>
                Step-by-Step: Extracting International Text in v1.1.2
              </h2>
              
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Capture Selected Region</h3>
                  <p className="gf-small">
                    Press <kbd>Alt</kbd> + <kbd>S</kbd> (or your custom shortcut) and drag a box across the foreign text, graphic, or video frame.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Select Target Language</h3>
                  <p className="gf-small">
                    In the preview toolbar, click the OCR dropdown. Select Auto-Detect or specify the source script (e.g., Español, Deutsch, 日本語, Français).
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Click &apos;Extract Text&apos;</h3>
                  <p className="gf-small">
                    The local WASM core processes the bounded bitmap in under 400ms. An editable text area pops up with the recognized characters.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Copy to Clipboard</h3>
                  <p className="gf-small">
                    Click &apos;Copy Text&apos; and paste directly into Google Translate, DeepL, VS Code, or your issue tracker.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides */}
            <section className="gf-sep">
              <h2>
                Related Capture &amp; OCR Guides
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Explore more workflows for unselectable text and high-precision visual documentation:
              </p>
              <div className="gf-btn-row">
                <Link
                  href="/roadmap"
                  className="gf-btn-p"
                >
                  View Feature Roadmap →
                </Link>
                <Link
                  href="/guides/how-to-extract-unselectable-text"
                  className="gf-btn-s"
                >
                  Text Extraction Best Practices →
                </Link>
              </div>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-extract-text-in-multiple-languages-ocr" />

      {/* Global CTA */}
      <CtaBand
        title="Ready to capture and extract without cloud leaks?"
        sub="100% free, 100% on-device, and zero accounts. Install GoFully today to capture, redact, and extract text with v1.1.2."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
