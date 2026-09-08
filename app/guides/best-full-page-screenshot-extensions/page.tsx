import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "Best Full Page Screenshot Chrome Extensions (2026)",
  description:
    "A fact-checked comparison of the best full page screenshot extensions for Chrome — GoFully, GoFullPage, Awesome Screenshot, FireShot, and Nimbus — by capture modes, OCR, pricing, and privacy.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions" },
  openGraph: {
    title: "Best Full Page Screenshot Chrome Extensions (2026)",
    description:
      "Five full page screenshot extensions compared feature-by-feature: capture modes, OCR, pricing, and privacy.",
    url: "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions",
    siteName: "GoFully",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions#webpage",
  url: "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions",
  name: "Best Full Page Screenshot Chrome Extensions (2026)",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-08",
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "GoFully", url: "https://gofully-extension.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "GoFullPage", url: "https://gofully-extension.vercel.app/alternatives/gofullpage" },
    { "@type": "ListItem", position: 3, name: "Awesome Screenshot", url: "https://gofully-extension.vercel.app/alternatives/awesome-screenshot" },
    { "@type": "ListItem", position: 4, name: "Nimbus Capture", url: "https://gofully-extension.vercel.app/alternatives/nimbus" },
    { "@type": "ListItem", position: 5, name: "FireShot", url: "https://gofully-extension.vercel.app/alternatives/fireshot" },
  ],
};

function Pro({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[13px] leading-[1.55]" style={{ color: "rgba(29,31,32,.7)" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[3px]"><path d="M20 6 9 17l-5-5" /></svg>
      <span>{children}</span>
    </li>
  );
}

function Con({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[13px] leading-[1.55]" style={{ color: "rgba(29,31,32,.5)" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[3px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      <span>{children}</span>
    </li>
  );
}

function ToolCard({
  rank,
  name,
  tagline,
  pros,
  cons,
  link,
  linkLabel,
  highlight = false,
}: {
  rank: number;
  name: string;
  tagline: string;
  pros: string[];
  cons: string[];
  link: string;
  linkLabel: string;
  highlight?: boolean;
}) {
  return (
    <BlueprintFrame
      className="bg-white p-6 md:p-8"
      style={highlight ? { borderColor: "var(--gf-color-accent)", borderWidth: 1.5 } : undefined}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span
            className="gf-heading-font font-semibold flex items-center justify-center flex-shrink-0"
            style={{ width: 30, height: 30, background: highlight ? "var(--gf-color-accent)" : "rgba(29,31,32,.06)", color: highlight ? "#fff" : "rgba(29,31,32,.5)", fontSize: 14 }}
          >
            {rank}
          </span>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>{name}</h2>
        </div>
        {highlight && (
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: 10, letterSpacing: "0.05em", padding: "4px 10px" }}>
            Our pick
          </span>
        )}
      </div>
      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)", marginBottom: 18 }}>{tagline}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ul className="flex flex-col gap-1.5">{pros.map((p) => <Pro key={p}>{p}</Pro>)}</ul>
        <ul className="flex flex-col gap-1.5">{cons.map((c) => <Con key={c}>{c}</Con>)}</ul>
      </div>
      <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(29,31,32,.08)" }}>
        <Link href={link} target={link.startsWith("http") ? "_blank" : undefined} rel={link.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 gf-heading-font font-semibold text-[13px] hover:underline" style={{ color: "var(--gf-color-accent)" }}>
          {linkLabel} →
        </Link>
      </div>
    </BlueprintFrame>
  );
}

export default function BestFullPageScreenshotExtensionsPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <BreadcrumbJsonLd name="Best Full Page Screenshot Extensions" path="/guides/best-full-page-screenshot-extensions" />
      <SiteNav />

      {/* Header */}
      <div className="text-center" style={{ padding: "80px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/guides" className="inline-block border gf-heading-font font-semibold uppercase hover:underline" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
              ← All Guides
            </Link>
          </div>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            Best Full Page Screenshot Extensions for Chrome
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Five extensions compared on what actually matters: capture modes, whether OCR exists at all, what&apos;s free versus paywalled, and what happens to your screenshot after you take it.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Updated September 2026</span>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div style={{ padding: "0 24px 40px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <div className="bg-blue-50/70 border border-blue-200/80 p-4" style={{ fontSize: "12.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
            <strong style={{ color: "#1d1f20" }}>Disclosure:</strong> we make GoFully, so take our #1 ranking with that in mind. Every claim below about the other four tools is sourced from their own public websites and Chrome Web Store listings as of September 2026, with dedicated fact-checked comparisons linked for each one — check those against the live product yourself before deciding.
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <div style={{ padding: "0 24px 60px" }}>
        <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 840 }}>
          <ToolCard
            rank={1}
            name="GoFully"
            tagline="Full page, visible area, and selected-region capture, plus local OCR, annotation, redaction, and a Beautify mode — free, with no account and no premium tier."
            pros={[
              "Local WebAssembly OCR, free",
              "Redaction and Beautify included free",
              "No account, ever",
              "4K UHD / WebP / paginated PDF export",
            ]}
            cons={[
              "Newer product, smaller install base",
              "Chrome, Edge, and Brave only",
            ]}
            link={CWS_URL}
            linkLabel="Add to Chrome — it's free"
            highlight
          />
          <ToolCard
            rank={2}
            name="GoFullPage"
            tagline="The most established one-click full page capture extension, with 11M+ users. Fast and simple, but editing is a paid add-on and OCR doesn't exist."
            pros={["Extremely fast one-click capture", "11M+ users, well-reviewed", "PNG, JPG, and PDF export"]}
            cons={["Annotation/editing requires Premium", "No OCR / text extraction", "No visible-area or region capture modes"]}
            link="/alternatives/gofullpage"
            linkLabel="Read the full GoFully vs GoFullPage comparison"
          />
          <ToolCard
            rank={3}
            name="Awesome Screenshot"
            tagline="A cloud-first capture and screen recording suite built around accounts and team sharing, with a capped free tier."
            pros={["Screen recording included", "Direct sharing to Slack, Trello, Drive"]}
            cons={["Account required for most features", "No OCR", "$6/mo+ for full annotation and unlimited storage"]}
            link="/alternatives/awesome-screenshot"
            linkLabel="Read the full GoFully vs Awesome Screenshot comparison"
          />
          <ToolCard
            rank={4}
            name="Nimbus Capture"
            tagline="Now part of the broader FuseBase workspace platform — capture is one piece of a much larger (and pricier) collaboration suite."
            pros={["Capture, video recording, and docs in one tool", "Good for teams already using FuseBase"]}
            cons={["Pushes account creation immediately", "No OCR", "Pricing now tied to FuseBase's team plans, from ~$5/mo"]}
            link="/alternatives/nimbus"
            linkLabel="Read the full GoFully vs Nimbus comparison"
          />
          <ToolCard
            rank={5}
            name="FireShot"
            tagline="One of the oldest full page capture extensions still active. Reliable core capture, but PDF export, editing, and redaction are all locked behind a one-time Pro purchase."
            pros={["Long track record, 5M+ users", "Batch capture and API for automation"]}
            cons={["No OCR", "PDF export and annotation require FireShot Pro ($39.95)", "Older, less modern editing UI"]}
            link="/alternatives/fireshot"
            linkLabel="Read the full GoFully vs FireShot comparison"
          />
        </div>
      </div>

      {/* Quick answer */}
      <div className="border-t" style={{ padding: "56px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: 22, marginBottom: 16 }}>
            Quick answer, by what you need
          </h2>
          <ul className="flex flex-col gap-2.5">
            <Bullet><strong>Need OCR / text extraction?</strong> Only GoFully offers this, free and on-device. None of the other four have it at any price.</Bullet>
            <Bullet><strong>Want to never create an account?</strong> GoFully and GoFullPage&apos;s core capture both work with zero sign-up; Awesome Screenshot and Nimbus push accounts early.</Bullet>
            <Bullet><strong>Editing sensitive screenshots for compliance or legal use?</strong> GoFully&apos;s free built-in redaction is the only option that&apos;s both free and doesn&apos;t require a paid tier.</Bullet>
            <Bullet><strong>Already deep in a team workspace tool?</strong> Nimbus/FuseBase or Awesome Screenshot make more sense if you need shared team storage and don&apos;t mind the subscription.</Bullet>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Try the free option first
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          No account, no premium tier — every feature above is included from install.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add GoFully to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[13.5px] leading-[1.6]" style={{ color: "rgba(29,31,32,.65)" }}>
      <span className="mt-[8px] h-[5px] w-[5px] flex-shrink-0" style={{ background: "var(--gf-color-accent)" }} />
      <span>{children}</span>
    </li>
  );
}
