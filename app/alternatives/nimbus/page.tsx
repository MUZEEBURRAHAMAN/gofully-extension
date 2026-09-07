import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "GoFully vs Nimbus Capture — Fast, Lightweight Alternative (2026)",
  description:
    "Looking for a Nimbus Screenshot alternative without workspace bloat, forced cloud accounts, or subscriptions? Compare GoFully vs Nimbus Capture for fast, private screenshots.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives/nimbus" },
  openGraph: {
    title: "GoFully vs Nimbus Capture — Fast, Lightweight Alternative (2026)",
    description:
      "A direct comparison of GoFully and Nimbus Capture. Instant client-side capture, on-device OCR, and zero cloud bloat.",
    url: "https://gofully-extension.vercel.app/alternatives/nimbus",
    siteName: "GoFully",
  },
};

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
];

const ROWS = [
  { feature: "Full page scrolling capture", gofully: "Yes (Clean stitch)", nimbus: "Yes", gofullyYes: true, nimbusYes: true },
  { feature: "Visible area capture", gofully: "Yes", nimbus: "Yes", gofullyYes: true, nimbusYes: true },
  { feature: "Selected region capture", gofully: "Yes", nimbus: "Yes", gofullyYes: true, nimbusYes: true },
  { feature: "Local WebAssembly OCR", gofully: "Yes, 100% on-device", nimbus: "Not offered", gofullyYes: true, nimbusYes: false },
  { feature: "Annotation & markup tools", gofully: "Free & Unrestricted", nimbus: "Basic free / Premium advanced", gofullyYes: true, nimbusYes: false },
  { feature: "Redaction (blur & mosaic)", gofully: "Free", nimbus: "Limited on Free tier", gofullyYes: true, nimbusYes: false },
  { feature: "Screenshot beautifier & mockups", gofully: "Free", nimbus: "Not offered", gofullyYes: true, nimbusYes: false },
  { feature: "Paginated PDF export", gofully: "Free", nimbus: "Requires Nimbus Pro ($7/mo)", gofullyYes: true, nimbusYes: false },
  { feature: "Extension footprint / Performance", gofully: "Ultra-lightweight, 0 background memory", nimbus: "Heavy suite (bundled with notes & workspace)", gofullyYes: true, nimbusYes: false },
  { feature: "Cloud sync & mandatory account", gofully: "No account, 100% offline", nimbus: "Pushes account creation and cloud storage", gofullyYes: true, nimbusYes: false },
  { feature: "Price", gofully: "100% Free", nimbus: "Freemium ($7.00 / month)", gofullyYes: true, nimbusYes: false },
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
  "@id": "https://gofully-extension.vercel.app/alternatives/nimbus#webpage",
  url: "https://gofully-extension.vercel.app/alternatives/nimbus",
  name: "GoFully vs Nimbus Capture",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-07",
};

export default function NimbusAlternativePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <BreadcrumbJsonLd name="GoFully vs Nimbus Capture" path="/alternatives/nimbus" />
      <SiteNav links={NAV_LINKS} />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/alternatives" className="inline-block border gf-heading-font font-semibold uppercase hover:underline" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
              ← All Alternatives
            </Link>
          </div>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 16 }}>
            GoFully vs Nimbus Capture
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 620, marginTop: 18 }}>
            Nimbus Capture transitioned from a nimble screenshot utility into a complex workspace and note-taking platform (FuseBase) with monthly subscriptions and heavy memory usage. GoFully stays laser-focused on fast, private, CleanShot-grade screen capture.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div style={{ padding: "0 24px 56px" }}>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 960 }}>
          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">Zero Workspace Bloat</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              You do not need a whole project management platform just to capture and crop a screenshot. GoFully opens in milliseconds with no external baggage or heavy memory overhead.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">Private On-Device OCR</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Need text from an image or chart? GoFully’s local WebAssembly OCR model runs straight on your CPU, extracting text in milliseconds with zero cloud transmission.
            </p>
          </BlueprintFrame>

          <BlueprintFrame className="bg-white p-6">
            <h2 className="gf-heading-font font-semibold text-[17px] mb-2">No Account Required</h2>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "rgba(29,31,32,.55)" }}>
              Nimbus continuously pushes users toward cloud workspace accounts and sync services. GoFully works completely offline with no account and no data collection.
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
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Nimbus Capture</th>
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
                    <div className="flex items-center gap-2"><Check yes={r.nimbusYes} /><span style={{ color: "rgba(29,31,32,.5)" }}>{r.nimbus}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto text-center" style={{ maxWidth: 640, fontSize: 11.5, color: "rgba(29,31,32,.4)", marginTop: 16, padding: "0 24px 40px" }}>
          Comparison based on Nimbus Capture / FuseBase&apos;s public website and Chrome Web Store listing as of September 2026. Nimbus is a trademark of its respective owner.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Experience fast, clean screen capture
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          100% free, 100% on-device, and built for speed.
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
