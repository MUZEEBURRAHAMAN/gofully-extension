import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "GoFully vs FireShot — Best Free FireShot Pro Alternative (2026)",
  description:
    "Looking for a modern FireShot alternative? Compare GoFully vs FireShot: CleanShot-grade editor, on-device OCR, and paginated PDF export without paying $39.95 for FireShot Pro.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/fireshot" },
  openGraph: {
    title: "GoFully vs FireShot — Best Free FireShot Pro Alternative (2026)",
    description:
      "A feature-by-feature comparison of GoFully and FireShot. Get modern annotations, on-device OCR, and paginated PDF export 100% free.",
    url: "https://gofully-extension.vercel.app/alternatives/fireshot",
    siteName: "GoFully",
  },
};

const ROWS = [
  { feature: "Full page scrolling capture", gofully: "Yes", fireshot: "Yes", gofullyYes: true, fireshotYes: true },
  { feature: "Visible area capture", gofully: "Yes", fireshot: "Yes", gofullyYes: true, fireshotYes: true },
  { feature: "Selected region capture", gofully: "Yes", fireshot: "Yes", gofullyYes: true, fireshotYes: true },
  { feature: "Local WebAssembly OCR", gofully: "Yes, on-device", fireshot: "Not offered", gofullyYes: true, fireshotYes: false },
  { feature: "Modern visual annotation studio", gofully: "Yes (CleanShot-grade)", fireshot: "Requires FireShot Pro ($39.95)", gofullyYes: true, fireshotYes: false },
  { feature: "Redaction (blur & mosaic)", gofully: "Free & Built-in", fireshot: "Requires FireShot Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Screenshot beautifier & mockups", gofully: "Free", fireshot: "Not offered", gofullyYes: true, fireshotYes: false },
  { feature: "Paginated multi-page PDF", gofully: "Free", fireshot: "Requires FireShot Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Modern UI & User Experience", gofully: "Contemporary, sleek, dark mode", fireshot: "Legacy 2012-era interface", gofullyYes: true, fireshotYes: false },
  { feature: "Account / License Key required", gofully: "None", fireshot: "License key needed for Pro", gofullyYes: true, fireshotYes: false },
  { feature: "Price", gofully: "100% Free forever", fireshot: "Free basic / $39.95 Pro", gofullyYes: true, fireshotYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://gofully-extension.vercel.app/alternatives/fireshot#webpage",
  url: "https://gofully-extension.vercel.app/alternatives/fireshot",
  name: "GoFully vs FireShot",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-07",
};

export default function FireShotAlternativePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <BreadcrumbJsonLd name="GoFully vs FireShot" path="/alternatives/fireshot" />
      <SiteNav />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/alternatives" className="inline-block border gf-heading-font font-semibold uppercase hover:underline" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
              ← All Alternatives
            </Link>
          </div>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 16 }}>
            GoFully vs FireShot
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 620, marginTop: 18 }}>
            FireShot is a long-standing browser extension, but its best features — like multi-page PDF generation, editing, and annotations — are locked behind a $39.95 FireShot Pro license. See how GoFully delivers these features free with a modern UI.
          </p>
        </div>
      </div>

      {/* Key Advantages */}
      <div style={{ padding: "0 24px 56px" }}>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 960 }}>
          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">Modern Clean UI</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              FireShot still uses an interface reminiscent of early 2010s software. GoFully features a sleek, dark-mode ready editor built with modern typography and fluid controls.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">Free Multi-Page PDF</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Need to save a long article or documentation as a clean, paginated PDF? FireShot reserves paginated PDF exports for paid Pro users. GoFully gives it to you free.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">On-Device Local OCR</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              FireShot cannot extract text from captured images. GoFully has a built-in WebAssembly OCR engine that instantly pulls text and code snippets from any area without cloud uploads.
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
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>FireShot</th>
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
                    <div className="flex items-center gap-2"><Check yes={r.fireshotYes} /><span style={{ color: "rgba(29,31,32,.5)" }}>{r.fireshot}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto text-center" style={{ maxWidth: 640, fontSize: 11.5, color: "rgba(29,31,32,.4)", marginTop: 16, padding: "0 24px 40px" }}>
          Comparison based on FireShot&apos;s public website and Chrome Web Store listing as of September 2026. FireShot is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Upgrade your screenshot workflow with GoFully
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          No license keys, no $39.95 upgrades. Full page scrolling, OCR, and annotation free.
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
