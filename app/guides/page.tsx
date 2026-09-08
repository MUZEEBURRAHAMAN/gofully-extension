import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "Browser Capture & Screenshot Guides — GoFully",
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

const GUIDES = [
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
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://gofully-extension.vercel.app/guides#collection",
  url: "https://gofully-extension.vercel.app/guides",
  name: "Browser Capture & Screenshot Guides",
  description: "Tutorials on full page screenshots, local OCR, and privacy redaction.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-07",
};

export default function GuidesIndexPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <BreadcrumbJsonLd name="Guides" path="/guides" />
      <SiteNav />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Documentation &amp; Tutorials
          </span>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 22 }}>
            Browser Capture &amp; Productivity Guides
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.55)", maxWidth: 620, marginTop: 18 }}>
            Practical, in-depth tutorials on full page web captures, CleanShot-grade visual annotation, client-side OCR text extraction, and privacy best practices.
          </p>
        </div>
      </div>

      {/* Guides Grid */}
      <div style={{ padding: "0 24px 64px" }}>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1140 }}>
          {GUIDES.map((g) => (
            <BlueprintFrame key={g.slug} className="bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-[var(--gf-color-accent)] bg-blue-50 border border-blue-200 px-2 py-0.5">
                    {g.tag}
                  </span>
                  <span className="text-[11px] text-neutral-400">{g.readTime}</span>
                </div>
                <h2 className="gf-heading-font font-semibold text-[18px] leading-snug mb-3">
                  <Link href={`/guides/${g.slug}`} className="hover:text-[var(--gf-color-accent)] transition-colors">
                    {g.title}
                  </Link>
                </h2>
                <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", marginBottom: 20 }}>
                  {g.subtitle}
                </p>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "rgba(29,31,32,.08)" }}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-flex items-center gap-1.5 gf-heading-font font-semibold text-[13px] hover:underline"
                  style={{ color: "var(--gf-color-accent)" }}
                >
                  Read full tutorial →
                </Link>
              </div>
            </BlueprintFrame>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Ready to streamline your screen captures?
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          100% free, 100% on-device, and zero accounts. Capture full pages, extract text, and redact in seconds.
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
