import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "GoFully vs Awesome Screenshot — Best Free Alternative (2026)",
  description:
    "Looking for an Awesome Screenshot alternative? GoFully offers 100% free full-page captures, on-device OCR, redaction, and PDF exports without account registration or cloud paywalls.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/awesome-screenshot" },
  openGraph: {
    title: "GoFully vs Awesome Screenshot — Best Free Alternative (2026)",
    description:
      "A feature-by-feature look at GoFully vs Awesome Screenshot. Free on-device OCR, zero cloud lock-in.",
    url: "https://gofully-extension.vercel.app/alternatives/awesome-screenshot",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gofully-extension.vercel.app/alternatives/awesome-screenshot#article",
  url: "https://gofully-extension.vercel.app/alternatives/awesome-screenshot",
  headline: "GoFully vs Awesome Screenshot — Best Free Alternative",
  description:
    "A feature-by-feature comparison of GoFully vs Awesome Screenshot. Free on-device OCR, zero cloud lock-in.",
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
  { feature: "Full page scrolling capture", gofully: "Yes, fast & free", awesome: "Yes", gofullyYes: true, awesomeYes: true },
  { feature: "Local OCR text extraction", gofully: "Yes, 100% on-device", awesome: "Requires paid Cloud", gofullyYes: true, awesomeYes: false },
  { feature: "Privacy blur & redaction", gofully: "Included free", awesome: "Limited on free tier", gofullyYes: true, awesomeYes: false },
  { feature: "Mockup & beautifier backgrounds", gofully: "Included free", awesome: "Not offered", gofullyYes: true, awesomeYes: false },
  { feature: "Multi-page PDF export", gofully: "Included free", awesome: "Requires subscription", gofullyYes: true, awesomeYes: false },
  { feature: "Mandatory account sign-in", gofully: "No account required", awesome: "Yes, required", gofullyYes: true, awesomeYes: false },
  { feature: "Cloud storage uploads", gofully: "Never — 100% offline", awesome: "Forced cloud sync", gofullyYes: true, awesomeYes: false },
  { feature: "Capture limits per month", gofully: "Unlimited", awesome: "Limited on free plan", gofullyYes: true, awesomeYes: false },
  { feature: "Pricing", gofully: "100% Free forever", awesome: "Freemium ($6/mo)", gofullyYes: true, awesomeYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-yes" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gf-no" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function AwesomeScreenshotAlternativePage() {
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
              { label: "GoFully vs Awesome Screenshot" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <PageHeader
        title="GoFully vs Awesome Screenshot"
        lede="Awesome Screenshot started as a simple capture extension, but has grown into a cloud-first platform built around accounts, monthly subscriptions, and team sharing. GoFully was built to bring back fast, 100% offline, free browser captures."
      />

      {/* Core Differences Grid */}
      <div className="gf-sec-plain">
        <div className="gf-feature-grid">
          <div className="gf-feature">
            <h2>No Forced Account</h2>
            <p className="gf-small">
              Awesome Screenshot requires account registration to use its full suite. GoFully requires zero signup — install and take screenshots immediately without handing over your email address.
            </p>
          </div>

          <div className="gf-feature">
            <h2>100% Local Privacy</h2>
            <p className="gf-small">
              Capturing sensitive dashboards or API keys? Awesome Screenshot is built around cloud sync and sharing by default. GoFully processes pixels and OCR locally inside your browser memory — zero telemetry, no cloud step at all.
            </p>
          </div>

          <div className="gf-feature">
            <h2>No Premium Paywalls</h2>
            <p className="gf-small">
              Awesome Screenshot locks PDF generation, advanced markup, and unlimited storage behind a $6/mo subscription. GoFully gives you every feature free with no artificial paywalls.
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
                <th>Awesome Screenshot</th>
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
                    <div className="flex items-center gap-2"><Check yes={r.awesomeYes} /><span>{r.awesome}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gf-footnote">
          Comparison based on Awesome Screenshot&apos;s public pricing and Chrome Web Store listing as of September 2026. Awesome Screenshot is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <CtaBand
        title="Ditch the cloud subscriptions. Try GoFully free."
        sub="Zero accounts, zero cloud servers, zero watermarks. Capture, redact, annotate, and export instantly."
      />

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
