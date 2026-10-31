import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "GoFully vs GoFullPage — Free Full Page Screenshot Comparison (2026)",
  description:
    "Looking for a GoFullPage alternative? Compare GoFully vs GoFullPage: capture modes, local OCR, annotation, redaction, and export formats — all free, no account, no premium paywall.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/gofullpage" },
  openGraph: {
    title: "GoFully vs GoFullPage — Free Full Page Screenshot Comparison",
    description:
      "A feature-by-feature look at GoFully and GoFullPage for full page screenshots, OCR, annotation, and export.",
    url: "https://gofully-extension.vercel.app/alternatives/gofullpage",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gofully-extension.vercel.app/alternatives/gofullpage#article",
  url: "https://gofully-extension.vercel.app/alternatives/gofullpage",
  headline: "GoFully vs GoFullPage — Free Full Page Screenshot Comparison",
  description:
    "A feature-by-feature comparison of GoFully and GoFullPage for full page screenshots, OCR, annotation, and export.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-07",
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

const ROWS: { feature: string; gofully: string; gofullpage: string; gofullyYes: boolean; gofullpageYes: boolean }[] = [
  { feature: "Full page scrolling capture", gofully: "Yes", gofullpage: "Yes", gofullyYes: true, gofullpageYes: true },
  { feature: "Visible area capture", gofully: "Yes", gofullpage: "No", gofullyYes: true, gofullpageYes: false },
  { feature: "Selected region capture", gofully: "Yes", gofullpage: "No", gofullyYes: true, gofullpageYes: false },
  { feature: "Local OCR text extraction", gofully: "Yes, 6 langs (offline)", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Annotation & markup tools", gofully: "Free (6 shapes)", gofullpage: "Requires Premium", gofullyYes: true, gofullpageYes: false },
  { feature: "CleanShot-style highlighter", gofully: "Free", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Redaction (blur / pixelate)", gofully: "Free", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Beautify / mockup backgrounds", gofully: "Free", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Export formats", gofully: "PNG, JPG, WebP, 4K, PDF", gofullpage: "PNG, JPG, PDF", gofullyYes: true, gofullpageYes: true },
  { feature: "Account required", gofully: "No", gofullpage: "No for capture, yes for Premium", gofullyYes: true, gofullpageYes: false },
  { feature: "Price", gofully: "Free, all features", gofullpage: "Free capture / paid editing", gofullyYes: true, gofullpageYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-yes" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-no" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function GoFullPageAlternativePage() {
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
              { label: "GoFully vs GoFullPage" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <PageHeader
        title="GoFully vs GoFullPage"
        lede="Both capture full-length webpage screenshots in one click. The difference is what happens after the capture — GoFully adds local OCR, annotation, redaction, and beautify tools free, with no premium tier and no account."
      />

      {/* Timely context — factual and cited */}
      <div className="gf-sec-plain">
        <div className="gf-callout gf-callout--neutral gf-narrow">
          <p>
            <strong>Note:</strong> GoFullPage&apos;s Chrome Web Store listing was temporarily removed on{" "}
            <a href="https://blog.gofullpage.com/2026/08/11/gofullpage-chrome-update/" target="_blank" rel="noopener noreferrer">
              August 11, 2026
            </a>
            {" "}over a copyright dispute involving one design element — the developers were explicit that it was{" "}
            <a href="https://blog.gofullpage.com/2026/08/14/gofullpage-chrome-update-a-progress-report/" target="_blank" rel="noopener noreferrer">
              not a security issue
            </a>
            . It was restored by late August 2026, though GoFullPage&apos;s own homepage still noted a beta-build workaround as of early September. GoFully has always shipped as a single, directly-installable Chrome Web Store listing with no removal history.
          </p>
        </div>
      </div>

      {/* Comparison table */}
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
                <th>GoFullPage</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.feature}>
                  <td>{r.feature}</td>
                  <td>
                    <div className="flex items-center gap-2"><Check yes={r.gofullyYes} /><span>{r.gofully}</span></div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2"><Check yes={r.gofullpageYes} /><span>{r.gofullpage}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gf-footnote">
          Comparison based on GoFullPage&apos;s public website and Chrome Web Store listing as of September 2026. GoFullPage is a product of Full Page, LLC and is not affiliated with GoFully.
        </p>
      </div>

      {/* CTA */}
      <CtaBand
        title="Try GoFully free"
        sub="No account, no premium tier, no catch. Every capture mode, OCR, annotation, and export format is included."
      />

      <SiteFooterIndustry activeHref="/alternatives/gofullpage" />
    </div>
  );
}
