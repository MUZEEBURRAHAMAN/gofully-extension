import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

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

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
];

const ROWS: { feature: string; gofully: string; gofullpage: string; gofullyYes: boolean; gofullpageYes: boolean }[] = [
  { feature: "Full page scrolling capture", gofully: "Yes", gofullpage: "Yes", gofullyYes: true, gofullpageYes: true },
  { feature: "Visible area capture", gofully: "Yes", gofullpage: "No", gofullyYes: true, gofullpageYes: false },
  { feature: "Selected region capture", gofully: "Yes", gofullpage: "No", gofullyYes: true, gofullpageYes: false },
  { feature: "Local OCR text extraction", gofully: "Yes, on-device", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Annotation & markup tools", gofully: "Free", gofullpage: "Requires Premium", gofullyYes: true, gofullpageYes: false },
  { feature: "Redaction (blur / pixelate)", gofully: "Free", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Beautify / mockup backgrounds", gofully: "Free", gofullpage: "Not offered", gofullyYes: true, gofullpageYes: false },
  { feature: "Export formats", gofully: "PNG, WebP, 4K UHD, PDF", gofullpage: "PNG, JPG, PDF", gofullyYes: true, gofullpageYes: true },
  { feature: "Account required", gofully: "No", gofullpage: "No for capture, yes for Premium", gofullyYes: true, gofullpageYes: false },
  { feature: "Price", gofully: "Free, all features", gofullpage: "Free capture / paid editing", gofullyYes: true, gofullpageYes: false },
];

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

export default function GoFullPageAlternativePage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav links={NAV_LINKS} />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Alternatives
          </span>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 22 }}>
            GoFully vs GoFullPage
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 600, marginTop: 18 }}>
            Both capture full-length webpage screenshots in one click. The difference is what happens after the capture — GoFully adds local OCR, annotation, redaction, and beautify tools free, with no premium tier and no account.
          </p>
        </div>
      </div>

      {/* Timely context, factual, cited */}
      <div style={{ padding: "0 24px 56px" }}>
        <BlueprintFrame className="mx-auto bg-white" style={{ maxWidth: 880, padding: "22px 28px" }}>
          <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
            <strong style={{ color: "var(--gf-color-text)" }}>Note:</strong> GoFullPage briefly lost its Chrome Web Store listing in August 2026 over a policy dispute and, per{" "}
            <a href="https://gofullpage.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>
              GoFullPage&apos;s own site
            </a>
            , was still routing installs through a beta build as of early September 2026. GoFully has always shipped as a single, directly-installable Chrome Web Store listing.
          </p>
        </BlueprintFrame>
      </div>

      {/* Comparison table */}
      <div className="border-t" style={{ padding: "64px 24px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 44 }}>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em" }}>
            Feature by feature
          </div>
        </div>
        <div className="mx-auto overflow-x-auto" style={{ maxWidth: 880 }}>
          <table className="w-full bg-white border" style={{ borderColor: "rgba(29,31,32,.12)", borderCollapse: "collapse", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(29,31,32,.12)" }}>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Feature</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "var(--gf-color-accent)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>GoFully</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "16px 20px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>GoFullPage</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.feature} style={{ borderBottom: i < ROWS.length - 1 ? "1px solid rgba(29,31,32,.08)" : undefined }}>
                  <td style={{ padding: "14px 20px", color: "var(--gf-color-text)" }}>{r.feature}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center gap-2"><Check yes={r.gofullyYes} /><span style={{ color: "rgba(29,31,32,.65)" }}>{r.gofully}</span></div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center gap-2"><Check yes={r.gofullpageYes} /><span style={{ color: "rgba(29,31,32,.5)" }}>{r.gofullpage}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto text-center" style={{ maxWidth: 640, fontSize: 11.5, color: "rgba(29,31,32,.4)", marginTop: 16, padding: "0 24px 40px" }}>
          Comparison based on GoFullPage&apos;s public website and Chrome Web Store listing as of September 2026. GoFullPage is a product of Full Page, LLC and is not affiliated with GoFully.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <div className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Try GoFully free
        </div>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          No account, no premium tier, no catch. Every capture mode, OCR, annotation, and export format is included.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add to Chrome — it&apos;s free
        </a>
        <p style={{ marginTop: 18 }}>
          <Link href="/faq" className="underline" style={{ color: "rgba(255,255,255,.5)", fontSize: 12.5 }}>
            Have questions? See the FAQ
          </Link>
        </p>
      </div>

      <SiteFooterIndustry activeHref="/alternatives/gofullpage" />
    </div>
  );
}
