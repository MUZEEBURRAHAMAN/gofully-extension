import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

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
  { feature: "Local WebAssembly OCR", gofully: "Yes, 6 langs", gofullpage: "No", awesome: "No (Cloud/Paid)", fireshot: "No", nimbus: "No" },
  { feature: "Annotation & markup tools", gofully: "Free", gofullpage: "Paid ($12/yr)", awesome: "Limited Free", fireshot: "Paid ($39.95)", nimbus: "Limited Free" },
  { feature: "CleanShot-style highlighter", gofully: "Free", gofullpage: "No", awesome: "No", fireshot: "No", nimbus: "No" },
  { feature: "Privacy blur & redaction", gofully: "Free", gofullpage: "No", awesome: "Limited", fireshot: "Paid Pro", nimbus: "Paid Pro" },
  { feature: "Beautify & mockup frames", gofully: "Free", gofullpage: "No", awesome: "No", fireshot: "No", nimbus: "No" },
  { feature: "Video auto-pause on capture", gofully: "Yes", gofullpage: "No", awesome: "No", fireshot: "No", nimbus: "No" },
  { feature: "PNG, JPG, WebP & PDF export", gofully: "Free", gofullpage: "PNG/JPG/PDF", awesome: "Paid", fireshot: "Paid Pro", nimbus: "Paid" },
  { feature: "Account required", gofully: "No", gofullpage: "No (Yes for Pro)", awesome: "Yes", fireshot: "No", nimbus: "Yes" },
  { feature: "Cloud uploads / Tracking", gofully: "Zero (100% Local)", gofullpage: "Minimal", awesome: "Heavy Cloud", fireshot: "Local", nimbus: "Cloud Sync" },
  { feature: "Price", gofully: "100% Free", gofullpage: "Freemium", awesome: "Freemium ($6/mo)", fireshot: "Freemium ($39.95)", nimbus: "Freemium ($7/mo)" },
];

function Check({ text, invert = false }: { text: string; invert?: boolean }) {
  const isPositive = text === "Yes" || text === "Free" || text === "100% Free" || text === "Zero (100% Local)" || text === "Yes, on-device" || text === "Yes, 6 langs";
  const isNegative = text === "No" || text.includes("Paid") || text === "Heavy Cloud" || text === "Cloud Sync";

  // "Account required: Yes" is a drawback, so that row reads the other way round.
  const good = invert ? text === "No" : isPositive;
  const bad = invert ? text.startsWith("Yes") : isNegative;
  return <span className={good ? "gf-cell-yes" : bad ? "gf-cell-no" : "gf-cell-mid"}>{text}</span>;
}

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://gofully-extension.vercel.app/alternatives#collection",
  url: "https://gofully-extension.vercel.app/alternatives",
  name: "Best Chrome Screenshot Extension Alternatives (2026)",
  description: "Compare GoFully vs GoFullPage, Awesome Screenshot, FireShot, and Nimbus.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-20",
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "Alternatives" }]} />
      </div>

      {/* Hero */}
      <PageHeader
        eyebrow="Comparison Guide 2026"
        title="Best Chrome Screenshot Extension Alternatives"
        lede="Tired of surprise paywalls, forced account signups, and slow cloud uploads? Compare the top Chrome screenshot extensions and see why professionals choose GoFully for private, on-device capture and OCR."
      />

      <div className="gf-sec-plain">
        <div className="gf-alt-grid">
          {ALTERNATIVES.map((alt) => (
            <Link key={alt.slug} href={`/alternatives/${alt.slug}`} className="gf-card-link gf-alt-card">
              <div className="gf-card-top">
                <h2>GoFully vs {alt.name}</h2>
                <span className="gf-badge gf-badge--neutral gf-badge--sm">Comparison</span>
              </div>
              <p>{alt.tagline}</p>
              <dl className="gf-alt-dl">
                <div>
                  <dt>Where {alt.name} falls short</dt>
                  <dd>{alt.cons}</dd>
                </div>
                <div className="gf-alt-win">
                  <dt>Why GoFully wins</dt>
                  <dd>{alt.verdict}</dd>
                </div>
              </dl>
              <span className="gf-card-more">
                Read the full comparison <span className="gf-arrow" aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Master Matrix */}
      <div className="gf-sec gf-sec--sunken">
        <div className="gf-sec-head">
          <h2>
            Full Competitor Comparison Matrix
          </h2>
          <p className="gf-lede">
            Side-by-side feature and pricing breakdown of the top 5 Chrome screenshot tools.
          </p>
        </div>

        <div className="gf-table-wrap">
          <table className="gf-compare">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="gf-col-us">GoFully</th>
                <th>GoFullPage</th>
                <th>Awesome</th>
                <th>FireShot</th>
                <th>Nimbus</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td className="gf-col-us"><Check text={row.gofully} invert={row.feature === "Account required"} /></td>
                  <td><Check text={row.gofullpage} invert={row.feature === "Account required"} /></td>
                  <td><Check text={row.awesome} invert={row.feature === "Account required"} /></td>
                  <td><Check text={row.fireshot} invert={row.feature === "Account required"} /></td>
                  <td><Check text={row.nimbus} invert={row.feature === "Account required"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <CtaBand
        title="Ready for a faster, private screenshot extension?"
        sub="No accounts, no paywalled annotation tools, and 100% on-device processing."
      />

      <SiteFooterIndustry activeHref="/alternatives" />
    </div>
  );
}
