import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "GoFully vs Nimbus Capture — Fast, Lightweight Alternative (2026)",
  description:
    "Looking for a fast, lightweight alternative to Nimbus Capture? Compare GoFully vs Nimbus: zero workspace bloat, on-device OCR, and free PDF exports with no subscriptions.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/nimbus" },
  openGraph: {
    title: "GoFully vs Nimbus Capture — Fast, Lightweight Alternative (2026)",
    description:
      "Compare GoFully and Nimbus Capture: lightweight performance, on-device OCR, and free annotation without cloud lock-in.",
    url: "https://gofully-extension.vercel.app/alternatives/nimbus",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gofully-extension.vercel.app/alternatives/nimbus#article",
  url: "https://gofully-extension.vercel.app/alternatives/nimbus",
  headline: "GoFully vs Nimbus Capture — Fast, Lightweight Alternative",
  description:
    "Compare GoFully and Nimbus Capture: lightweight performance, on-device OCR, and free annotation without cloud lock-in.",
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
  { feature: "Full page scrolling capture", gofully: "Yes, fast & free", nimbus: "Yes", gofullyYes: true, nimbusYes: true },
  { feature: "Local OCR text extraction", gofully: "Yes, on-device", nimbus: "Requires Premium Plan", gofullyYes: true, nimbusYes: false },
  { feature: "Redaction & privacy blur", gofully: "Included free", nimbus: "Requires Pro tier", gofullyYes: true, nimbusYes: false },
  { feature: "Paginated PDF export", gofully: "Free & Instant", nimbus: "Paid subscription", gofullyYes: true, nimbusYes: false },
  { feature: "Screenshot beautifier & mockups", gofully: "Included free", nimbus: "Not offered", gofullyYes: true, nimbusYes: false },
  { feature: "Lightweight performance", gofully: "Minimal memory footprint", nimbus: "Heavy suite / slow capture", gofullyYes: true, nimbusYes: false },
  { feature: "Mandatory cloud workspace", gofully: "No — 100% on-device", nimbus: "Pushes FuseBase cloud", gofullyYes: true, nimbusYes: false },
  { feature: "Pricing", gofully: "100% Free forever", nimbus: "Freemium ($7/mo)", gofullyYes: true, nimbusYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-yes" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-no" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function NimbusAlternativePage() {
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
              { label: "GoFully vs Nimbus Capture" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <PageHeader
        title="GoFully vs Nimbus Capture"
        lede="Nimbus Capture transitioned from a nimble screenshot utility into a complex workspace and note-taking platform (FuseBase) with monthly subscriptions and heavy memory usage. GoFully stays laser-focused on fast, private, CleanShot-grade screen capture."
      />

      {/* Highlights */}
      <div className="gf-sec-plain">
        <div className="gf-feature-grid">
          <div className="gf-feature">
            <h2>Zero Workspace Bloat</h2>
            <p className="gf-small">
              You do not need a whole project management platform just to capture and crop a screenshot. GoFully opens in milliseconds with no external baggage or heavy memory overhead.
            </p>
          </div>

          <div className="gf-feature">
            <h2>Private On-Device OCR</h2>
            <p className="gf-small">
              Need text from an image or chart? GoFully’s local WebAssembly OCR model runs straight on your CPU, extracting text in milliseconds with zero cloud transmission.
            </p>
          </div>

          <div className="gf-feature">
            <h2>No Account Required</h2>
            <p className="gf-small">
              Nimbus continuously pushes users toward cloud workspace accounts and sync services. GoFully works completely offline with no account and no data collection.
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
                <th>Nimbus Capture</th>
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
                    <div className="flex items-center gap-2"><Check yes={r.nimbusYes} /><span>{r.nimbus}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gf-footnote">
          Comparison based on Nimbus Capture / FuseBase&apos;s public website and Chrome Web Store listing as of September 2026. Nimbus is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <CtaBand
        title="Experience fast, clean screen capture"
        sub="100% free, 100% on-device, and built for speed."
      />

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
