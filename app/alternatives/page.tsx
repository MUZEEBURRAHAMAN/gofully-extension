import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "Best Chrome Screenshot Extension Alternatives (2026)",
  description:
    "Compare the top Chrome screenshot extensions: GoFully vs GoFullPage, Awesome Screenshot, FireShot, and Nimbus. 100% free, private on-device OCR, no cloud paywall.",
  alternates: { canonical: "https://gofully-extension.vercel.app/alternatives" },
  openGraph: {
    title: "Best Chrome Screenshot Extension Alternatives (2026) — GoFully",
    description:
      "A complete feature-by-feature comparison of top screenshot tools: GoFully vs GoFullPage, Awesome Screenshot, FireShot, and Nimbus.",
    url: "https://gofully-extension.vercel.app/alternatives",
    siteName: "GoFully",
  },
};

const ALTERNATIVES = [
  {
    slug: "gofullpage",
    name: "GoFullPage",
    tagline: "Popular one-click scrolling screenshot tool",
    pros: "Fast scrolling capture, simple interface, reliable stitching.",
    cons: "No region capture, no visible capture, annotations locked behind paid Premium, no OCR, no redaction/blur.",
    verdict: "GoFully matches the 1-click full page capture but adds local OCR, free visual markup, privacy blur, and mockups with zero paywalls.",
  },
  {
    slug: "awesome-screenshot",
    name: "Awesome Screenshot",
    tagline: "Heavy screenshot & screen recording platform",
    pros: "Includes video recording, cloud storage, team workspace integration.",
    cons: "Mandatory account sign-in, cloud storage privacy concerns, screenshot limits on free tier, watermarks, aggressive upsells.",
    verdict: "GoFully requires no account, never uploads your screenshots to third-party cloud servers, and includes unlimited high-res exports.",
  },
  {
    slug: "fireshot",
    name: "FireShot",
    tagline: "Legacy webpage capture extension",
    pros: "Full page capture, multi-browser support, direct email export.",
    cons: "Dated Windows-XP style UI, core features (PDF pagination, editor, text export) locked behind paid FireShot Pro license.",
    verdict: "GoFully provides a modern CleanShot-grade design studio, native paginated PDF export, and on-device OCR completely free.",
  },
  {
    slug: "nimbus",
    name: "Nimbus Capture",
    tagline: "Workspace & documentation screenshot tool",
    pros: "Scroll capture, video recording, note taking.",
    cons: "Bloated all-in-one suite, slow capture engine, forced cloud sync, premium subscriptions for basic features.",
    verdict: "GoFully stays focused on being a razor-sharp, lightweight capture and annotation tool that executes 100% on your machine in milliseconds.",
  },
];

const MATRIX = [
  { feature: "Full page scrolling capture", gofully: "Yes", gofullpage: "Yes", awesome: "Yes", fireshot: "Yes", nimbus: "Yes" },
  { feature: "Visible area capture", gofully: "Yes", gofullpage: "No", awesome: "Yes", fireshot: "Yes", nimbus: "Yes" },
  { feature: "Selected region capture", gofully: "Yes", gofullpage: "No", awesome: "Yes", fireshot: "Yes", nimbus: "Yes" },
  { feature: "Local WebAssembly OCR", gofully: "Yes, on-device", gofullpage: "No", awesome: "No (Cloud/Paid)", fireshot: "No", nimbus: "No" },
  { feature: "Annotation & markup tools", gofully: "Free", gofullpage: "Paid ($12/yr)", awesome: "Limited Free", fireshot: "Paid ($39.95)", nimbus: "Limited Free" },
  { feature: "Privacy blur & redaction", gofully: "Free", gofullpage: "No", awesome: "Limited", fireshot: "Paid Pro", nimbus: "Paid Pro" },
  { feature: "Beautify & mockup frames", gofully: "Free", gofullpage: "No", awesome: "No", fireshot: "No", nimbus: "No" },
  { feature: "Paginated PDF export", gofully: "Free", gofullpage: "Yes", awesome: "Paid", fireshot: "Paid Pro", nimbus: "Paid" },
  { feature: "Account required", gofully: "No", gofullpage: "No (Yes for Pro)", awesome: "Yes", fireshot: "No", nimbus: "Yes" },
  { feature: "Cloud uploads / Tracking", gofully: "Zero (100% Local)", gofullpage: "Minimal", awesome: "Heavy Cloud", fireshot: "Local", nimbus: "Cloud Sync" },
  { feature: "Price", gofully: "100% Free", gofullpage: "Freemium", awesome: "Freemium ($6/mo)", fireshot: "Freemium ($39.95)", nimbus: "Freemium ($7/mo)" },
];

function Check({ text }: { text: string }) {
  const isPositive = text === "Yes" || text === "Free" || text === "100% Free" || text === "Zero (100% Local)" || text === "Yes, on-device";
  const isNegative = text === "No" || text.includes("Paid") || text === "Heavy Cloud" || text === "Cloud Sync";

  return (
    <span
      className="inline-block"
      style={{
        color: isPositive ? "var(--gf-color-accent)" : isNegative ? "rgba(29,31,32,.45)" : "rgba(29,31,32,.7)",
        fontWeight: isPositive ? 600 : 400,
      }}
    >
      {text}
    </span>
  );
}

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://gofully-extension.vercel.app/alternatives#collection",
  url: "https://gofully-extension.vercel.app/alternatives",
  name: "Best Chrome Screenshot Extension Alternatives (2026)",
  description: "Compare GoFully vs GoFullPage, Awesome Screenshot, FireShot, and Nimbus.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-08",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: ALTERNATIVES.map((alt, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://gofully-extension.vercel.app/alternatives/${alt.slug}`,
      name: `GoFully vs ${alt.name}`,
    })),
  },
};

export default function AlternativesIndexPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "40px 24px 10px" }}>
        <div className="mx-auto" style={{ maxWidth: 1080 }}>
          <Breadcrumbs items={[{ label: "Alternatives" }]} />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Comparison Guide 2026
          </span>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 22 }}>
            Best Chrome Screenshot Extension Alternatives
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.55)", maxWidth: 640, marginTop: 18 }}>
            Tired of surprise paywalls, forced account signups, and slow cloud uploads? Compare the top Chrome screenshot extensions and see why professionals choose GoFully for private, on-device capture and OCR.
          </p>
        </div>
      </div>

      {/* Competitor Cards */}
      <div style={{ padding: "0 24px 64px" }}>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 1080 }}>
          {ALTERNATIVES.map((alt) => (
            <BlueprintFrame key={alt.slug} className="bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>
                    GoFully vs {alt.name}
                  </h2>
                  <span className="text-[11px] font-semibold text-[var(--gf-color-accent)] bg-blue-50 border border-blue-200 px-2.5 py-1">
                    Direct Comparison
                  </span>
                </div>
                <p style={{ fontSize: "13.5px", color: "rgba(29,31,32,.5)", marginBottom: 16 }}>{alt.tagline}</p>

                <div className="space-y-2 mb-4" style={{ fontSize: "13px" }}>
                  <div>
                    <strong style={{ color: "rgba(29,31,32,.7)" }}>Where {alt.name} falls short: </strong>
                    <span style={{ color: "rgba(29,31,32,.5)" }}>{alt.cons}</span>
                  </div>
                  <div>
                    <strong style={{ color: "var(--gf-color-accent)" }}>Why GoFully wins: </strong>
                    <span style={{ color: "rgba(29,31,32,.65)" }}>{alt.verdict}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "rgba(29,31,32,.08)" }}>
                <Link
                  href={`/alternatives/${alt.slug}`}
                  className="inline-flex items-center gap-1.5 gf-heading-font font-semibold text-[13px] hover:underline"
                  style={{ color: "var(--gf-color-accent)" }}
                >
                  Read full GoFully vs {alt.name} comparison →
                </Link>
              </div>
            </BlueprintFrame>
          ))}
        </div>
      </div>

      {/* Master Matrix */}
      <div className="border-t" style={{ padding: "64px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 44 }}>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em" }}>
            Full Competitor Comparison Matrix
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 10 }}>
            Side-by-side feature and pricing breakdown of the top 5 Chrome screenshot tools.
          </p>
        </div>

        <div className="mx-auto overflow-x-auto" style={{ maxWidth: 1080 }}>
          <table className="w-full bg-white border" style={{ borderColor: "rgba(29,31,32,.12)", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(29,31,32,.12)", background: "rgba(29,31,32,.03)" }}>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Feature</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "var(--gf-color-accent)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>GoFully</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>GoFullPage</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Awesome</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>FireShot</th>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "14px 16px", color: "rgba(29,31,32,.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Nimbus</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: i < MATRIX.length - 1 ? "1px solid rgba(29,31,32,.08)" : undefined }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--gf-color-text)" }}>{row.feature}</td>
                  <td style={{ padding: "12px 16px", background: "rgba(22,103,242,.03)" }}><Check text={row.gofully} /></td>
                  <td style={{ padding: "12px 16px" }}><Check text={row.gofullpage} /></td>
                  <td style={{ padding: "12px 16px" }}><Check text={row.awesome} /></td>
                  <td style={{ padding: "12px 16px" }}><Check text={row.fireshot} /></td>
                  <td style={{ padding: "12px 16px" }}><Check text={row.nimbus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Ready for a faster, private screenshot extension?
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          No accounts, no paywalled annotation tools, and 100% on-device processing.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add GoFully to Chrome — Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
