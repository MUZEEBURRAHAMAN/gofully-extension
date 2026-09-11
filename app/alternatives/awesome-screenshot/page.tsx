import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function AwesomeScreenshotAlternativePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 960 }}>
          <Breadcrumbs
            items={[
              { label: "Alternatives", href: "/alternatives" },
              { label: "GoFully vs Awesome Screenshot" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center" style={{ padding: "40px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 16 }}>
            GoFully vs Awesome Screenshot
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 620, marginTop: 18 }}>
            Awesome Screenshot started as a simple capture extension, but has grown into a cloud-first platform built around accounts, monthly subscriptions, and team sharing. GoFully was built to bring back fast, 100% offline, free browser captures.
          </p>
        </div>
      </div>

      {/* Core Differences Grid */}
      <div style={{ padding: "0 24px 56px" }}>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 960 }}>
          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">No Forced Account</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Awesome Screenshot requires account registration to use its full suite. GoFully requires zero signup — install and take screenshots immediately without handing over your email address.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">100% Local Privacy</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Capturing sensitive dashboards or API keys? Awesome Screenshot is built around cloud sync and sharing by default. GoFully processes pixels and OCR locally inside your browser memory — zero telemetry, no cloud step at all.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">No Premium Paywalls</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Awesome Screenshot locks PDF generation, advanced markup, and unlimited storage behind a $6/mo subscription. GoFully gives you every feature free with no artificial paywalls.
            </p>
          </BlueprintFrame>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border-t" style={{ padding: "64px 24px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 44 }}>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em" }}>
            Feature by feature comparison
          </h2>
        </div>
        <div className="mx-auto overflow-x-auto" style={{ maxWidth: 880 }}>
          <table className="w-full bg-white border" style={{ borderColor: "rgba(29,31,32,.12)", borderCollapse: "collapse", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(29,31,32,.12)" }}>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Feature</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "var(--gf-color-accent)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>GoFully</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Awesome Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.feature} style={{ borderBottom: i < ROWS.length - 1 ? "1px solid rgba(29,31,32,.08)" : undefined }}>
                  <td style={{ padding: "14px 20px", color: "var(--gf-color-text)", fontWeight: 500 }}>{r.feature}</td>
                  <td style={{ padding: "14px 20px", background: "rgba(22,103,242,.02)" }}>
                    <div className="flex items-center gap-2"><Check yes={r.gofullyYes} /><span style={{ color: "rgba(29,31,32,.65)", fontWeight: 600 }}>{r.gofully}</span></div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center gap-2"><Check yes={r.awesomeYes} /><span style={{ color: "rgba(29,31,32,.5)" }}>{r.awesome}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto text-center" style={{ maxWidth: 640, fontSize: 11.5, color: "rgba(29,31,32,.4)", marginTop: 16, padding: "0 24px 40px" }}>
          Comparison based on Awesome Screenshot&apos;s public pricing and Chrome Web Store listing as of September 2026. Awesome Screenshot is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Ditch the cloud subscriptions. Try GoFully free.
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          Zero accounts, zero cloud servers, zero watermarks. Capture, redact, annotate, and export instantly.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
