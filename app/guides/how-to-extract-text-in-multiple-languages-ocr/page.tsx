import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "How to Extract Text in Multiple Languages with On-Device OCR (Coming Soon)",
  description:
    "Preview GoFully's upcoming multi-language OCR feature. Extract Spanish, French, German, Japanese, Chinese, and Arabic text from images and locked web apps — 100% locally in Chrome.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr" },
  openGraph: {
    title: "How to Extract Text in Multiple Languages with On-Device OCR — GoFully",
    description:
      "A technical walkthrough and preview of GoFully v1.1.2 multi-language on-device OCR engine. Extract international scripts with zero cloud uploads.",
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
    "A guide and technical preview of GoFully's upcoming multi-language WebAssembly OCR engine for in-browser text extraction across Latin, CJK, and Cyrillic character sets.",
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

export default function MultiLanguageOcrGuidePage() {
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
              { label: "Multi-Language OCR Guide" },
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
            How to Extract Text in Multiple Languages with On-Device OCR
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Extracting international scripts — Japanese, German, Spanish, French, or simplified Chinese — from locked web apps without sending proprietary documents to a remote cloud OCR API.
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
                GoFully currently ships with English and Latin-character OCR powered by local WebAssembly. The multi-language training packs (covering 20+ world languages with dynamic asset loading) are currently under QA validation and scheduled for release in <strong>v1.1.2</strong>. Track real-time progress on our{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-amber-950">
                  interactive roadmap
                </Link>.
              </p>
            </div>

            {/* The Problem with Cloud OCR for Global Teams */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                The Dilemma: Why Cloud Translation APIs Compromise Security
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Engineering teams, localization managers, and analysts frequently need to copy foreign text from UI screenshots, video streams, or international SaaS dashboards. However, traditional browser extensions send screen pixels to third-party cloud servers (like Google Cloud Vision or AWS Rekognition) to run OCR.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
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
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                How GoFully Multi-Language OCR Works On-Device
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                GoFully avoids remote API dependencies entirely. In v1.1.2, language dictionaries will be fetched on-demand once and cached directly in your browser&apos;s IndexedDB sandbox.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">1. Dynamic Language Loading</h3>
                  <p className="text-neutral-600">Only download the language models you need (e.g. Spanish, German, Japanese) without bloating your extension footprint.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">2. Local WebAssembly Execution</h3>
                  <p className="text-neutral-600">Pixel matrices are processed directly via your computer&apos;s CPU using SIMD-accelerated WebAssembly inside a background Service Worker.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">3. UTF-8 Preserving Output</h3>
                  <p className="text-neutral-600">Accents, umlauts, kanji, and non-Latin character spacings are rendered faithfully to the clipboard with one-click copy.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">4. Zero Cloud Exposure</h3>
                  <p className="text-neutral-600">No images or extracted strings ever leave your device. 100% compliant with SOC 2, HIPAA, and internal security policies.</p>
                </div>
              </div>
            </section>

            {/* Step by Step Walkthrough */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step-by-Step: Extracting International Text in v1.1.2
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Capture Selected Region</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Press <kbd className="border bg-neutral-100 px-1.5 py-0.5 text-xs font-mono">Alt</kbd> + <kbd className="border bg-neutral-100 px-1.5 py-0.5 text-xs font-mono">S</kbd> (or your custom shortcut) and drag a box across the foreign text, graphic, or video frame.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Select Target Language</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    In the preview toolbar, click the OCR dropdown. Select Auto-Detect or specify the source script (e.g., Español, Deutsch, 日本語, Français).
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Click &apos;Extract Text&apos;</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    The local WASM core processes the bounded bitmap in under 400ms. An editable text area pops up with the recognized characters.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Copy to Clipboard</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Click &apos;Copy Text&apos; and paste directly into Google Translate, DeepL, VS Code, or your issue tracker.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides & Early Access */}
            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Want Early Access to Multi-Language OCR?
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Help test our multi-language models before public release or request a specific language pack for your team.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/roadmap"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Vote on Roadmap →
                </Link>
                <Link
                  href="/guides/how-to-extract-unselectable-text"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Try Current English OCR Guide →
                </Link>
              </div>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* Global CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Ready to capture and extract without cloud leaks?
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          100% free, 100% on-device, and zero accounts. Install GoFully today and get automatic updates when v1.1.2 lands.
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
