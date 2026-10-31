import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc";

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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions#article",
  url: "https://gofully-extension.vercel.app/guides/best-full-page-screenshot-extensions",
  headline: "Best Full Page Screenshot Chrome Extensions (2026)",
  description:
    "A fact-checked comparison of the best full page screenshot extensions for Chrome — GoFully, GoFullPage, Awesome Screenshot, FireShot, and Nimbus.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-08",
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
    <li>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-yes"><path d="M20 6 9 17l-5-5" /></svg>
      <span>{children}</span>
    </li>
  );
}

function Con({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-no"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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
    <article className={`gf-tool${highlight ? " gf-tool--pick" : ""}`}>
      <header className="gf-tool-head">
        <span className="gf-tool-rank">{rank}</span>
        <h2>{name}</h2>
        {highlight && <span className="gf-badge gf-badge--blue">Our pick</span>}
      </header>
      <p className="gf-small">{tagline}</p>
      <div className="gf-tool-cols">
        <ul className="gf-checks" aria-label="Strengths">{pros.map((p) => <Pro key={p}>{p}</Pro>)}</ul>
        <ul className="gf-checks" aria-label="Weaknesses">{cons.map((c) => <Con key={c}>{c}</Con>)}</ul>
      </div>
      <Link href={link} target={link.startsWith("http") ? "_blank" : undefined} rel={link.startsWith("http") ? "noopener noreferrer" : undefined} className="gf-link-arrow gf-tool-link">
        {linkLabel} <span className="gf-arrow" aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default function BestFullPageScreenshotExtensionsPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }} />
      <SiteNav />

      {/* Breadcrumbs */}
      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Best Full Page Screenshot Extensions" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="Best Full Page Screenshot Extensions for Chrome"
        lede="Five extensions compared on what actually matters: capture modes, whether OCR exists at all, what’s free versus paywalled, and what happens to your screenshot after you take it."
        meta={["By GoFully Engineering", "Updated September 2026", "6 min read"]}
      />

      {/* Disclosure */}
      <div className="gf-sec-plain gf-sec-plain--sm">
        <div className="gf-narrow">
          <div className="gf-callout gf-callout--neutral">
            <p><strong>Disclosure:</strong> we make GoFully, so take our #1 ranking with that in mind. Every claim below about the other four tools is sourced from their own public websites and Chrome Web Store listings as of September 2026, with dedicated fact-checked comparisons linked for each one — check those against the live product yourself before deciding.</p>
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <div className="gf-sec-plain">
        <div className="gf-narrow gf-tool-list">
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
      <div className="gf-sec gf-sec--sunken">
        <div className="gf-narrow gf-quick">
          <h2>
            Quick answer, by what you need
          </h2>
          <ul className="gf-list">
            <Bullet><strong>Need OCR / text extraction?</strong> Only GoFully offers this, free and on-device. None of the other four have it at any price.</Bullet>
            <Bullet><strong>Want to never create an account?</strong> GoFully and GoFullPage&apos;s core capture both work with zero sign-up; Awesome Screenshot and Nimbus push accounts early.</Bullet>
            <Bullet><strong>Editing sensitive screenshots for compliance or legal use?</strong> GoFully&apos;s free built-in redaction is the only option that&apos;s both free and doesn&apos;t require a paid tier.</Bullet>
            <Bullet><strong>Already deep in a team workspace tool?</strong> Nimbus/FuseBase or Awesome Screenshot make more sense if you need shared team storage and don&apos;t mind the subscription.</Bullet>
          </ul>
        </div>
      </div>

      <RelatedGuides currentSlug="best-full-page-screenshot-extensions" />

      {/* CTA */}
      <CtaBand
        title="Try the free option first"
        sub="No account, no premium tier — every feature above is included from install."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li>{children}</li>
  );
}
