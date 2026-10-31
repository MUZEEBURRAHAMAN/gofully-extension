import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "GoFully vs FireShot — Best Free FireShot Pro Alternative (2026)",
  description:
    "Looking for a free FireShot Pro alternative? Compare GoFully vs FireShot: paginated PDF exports, local OCR, and CleanShot-grade annotations without paying $39.95.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/fireshot" },
  openGraph: {
    title: "GoFully vs FireShot — Best Free FireShot Pro Alternative (2026)",
    description:
      "Compare GoFully and FireShot: full page capture, PDF export, and local OCR without a paid license.",
    url: "https://gofully-extension.vercel.app/alternatives/fireshot",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gofully-extension.vercel.app/alternatives/fireshot#article",
  url: "https://gofully-extension.vercel.app/alternatives/fireshot",
  headline: "GoFully vs FireShot — Best Free FireShot Pro Alternative",
  description:
    "Compare GoFully and FireShot: full page capture, PDF export, and local OCR without a paid license.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-07",
  dateModified: "2026-09-08",
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

const ROWS = [
  { feature: "Full page scrolling capture", gofully: "Yes, fast & free", fireshot: "Yes", gofullyYes: true, fireshotYes: true },
  { feature: "Multi-page PDF export", gofully: "Included free", fireshot: "Requires FireShot Pro ($39.95)", gofullyYes: true, fireshotYes: false },
  { feature: "Local OCR text extraction", gofully: "Yes, on-device", fireshot: "Requires FireShot Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Annotation & markup tools", gofully: "Full editor free", fireshot: "Requires FireShot Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Blur & sensitive info redaction", gofully: "Included free", fireshot: "Requires FireShot Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Mockup & beautifier backgrounds", gofully: "Included free", fireshot: "Not offered", gofullyYes: true, fireshotYes: false },
  { feature: "Modern web UI & Dark mode", gofully: "Modern CleanShot-grade", fireshot: "Legacy early-2010s UI", gofullyYes: true, fireshotYes: false },
  { feature: "One-time cost / License fee", gofully: "100% Free forever", fireshot: "$39.95 one-time license", gofullyYes: true, fireshotYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-yes" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-no" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function FireShotAlternativePage() {
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
              { label: "Alternatives", href: "/alternatives" },
              { label: "GoFully vs FireShot" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <PageHeader
        title="GoFully vs FireShot"
        lede="FireShot is a long-standing browser extension, but its best features — like multi-page PDF generation, editing, and annotations — are locked behind a $39.95 FireShot Pro license. See how GoFully delivers these features free with a modern UI."
      />

      {/* Key Advantages */}
      <div className="gf-sec-plain">
        <div className="gf-feature-grid">
          <div className="gf-feature">
            <h2>Modern Clean UI</h2>
            <p className="gf-small">
              FireShot still uses an interface reminiscent of early 2010s software. GoFully features a sleek, dark-mode ready editor built with modern typography and fluid controls.
            </p>
          </div>

          <div className="gf-feature">
            <h2>Free Multi-Page PDF</h2>
            <p className="gf-small">
              Need to save a long article or documentation as a clean, paginated PDF? FireShot reserves paginated PDF exports for paid Pro users. GoFully gives it to you free.
            </p>
          </div>

          <div className="gf-feature">
            <h2>On-Device Local OCR</h2>
            <p className="gf-small">
              FireShot cannot extract text from captured images. GoFully has a built-in WebAssembly OCR engine that instantly pulls text and code snippets from any area without cloud uploads.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="gf-sec gf-sec--sunken">
        <div className="gf-sec-head">
          <h2>
            Feature by feature comparison
          </h2>
        </div>
        <div className="gf-table-wrap">
          <table className="gf-compare">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="gf-col-us">GoFully</th>
                <th>FireShot</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.feature}>
                  <td>{r.feature}</td>
                  <td className="gf-col-us">
                    <div className="flex items-center gap-2"><Check yes={r.gofullyYes} /><span>{r.gofully}</span></div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2"><Check yes={r.fireshotYes} /><span>{r.fireshot}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gf-footnote">
          Comparison based on FireShot&apos;s public website and Chrome Web Store listing as of September 2026. FireShot is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <CtaBand
        title="Upgrade your screenshot workflow with GoFully"
        sub="No license keys, no $39.95 upgrades. Full page scrolling, OCR, and annotation free."
      />

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
