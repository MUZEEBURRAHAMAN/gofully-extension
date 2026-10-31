import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Capture a Single Element on a Webpage (Card, Table or Chat Message)",
  description: "Capture just one card, table, chart or chat message in Chrome. GoFully's Capture Element outlines whatever is under your pointer and crops to it exactly.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-capture-a-single-element" },
  openGraph: {
    title: "How to Capture a Single Element on a Webpage (Card, Table or Chat Message) \u2014 GoFully",
    description: "Capture just one card, table, chart or chat message in Chrome. GoFully's Capture Element outlines whatever is under your pointer and crops to it exactly.",
    url: "https://gofully-extension.vercel.app/guides/how-to-capture-a-single-element",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-capture-a-single-element#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-capture-a-single-element",
  headline: "How to Capture a Single Element on a Webpage (Card, Table or Chat Message)",
  description: "Capture just one card, table, chart or chat message in Chrome. GoFully's Capture Element outlines whatever is under your pointer and crops to it exactly.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-10-18",
  dateModified: "2026-10-18",
  author: { "@type": "Organization", name: "GoFully", url: "https://gofully-extension.vercel.app/" },
  publisher: {
    "@type": "Organization",
    name: "GoFully",
    url: "https://gofully-extension.vercel.app/",
    logo: { "@type": "ImageObject", url: "https://gofully-extension.vercel.app/logo.png" },
  },
};

export default function CaptureASingleElementGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Capture a Single Element" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        eyebrow="New in v1.1.3"
        title="How to Capture a Single Element on a Webpage (Card, Table or Chat Message)"
        lede="Dragging a box around a card never comes out clean. Capture Element finds the edges for you."
        meta={["By GoFully Engineering", "October 2026", "3 min read"]}
      />

      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">
            <div className="gf-callout">
              <h2>
                New in GoFully v1.1.3
              </h2>
              <p>
                <strong>Capture Element</strong> is in the popup next to Selected Area. Hover, pick, click. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2>
                How it works
              </h2>
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Open Capture Element</h3>
                  <p className="gf-small">Click the GoFully icon and choose Capture Element.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Hover</h3>
                  <p className="gf-small">A blue outline follows the element under your pointer and shows its size.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Pick the right level</h3>
                  <p className="gf-small">Press the Up arrow to select the parent element or Down to step back in. Keep going until the outline matches what you want.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Click to capture</h3>
                  <p className="gf-small">GoFully crops to that element. Press Esc to cancel.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                When to use it
              </h2>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Pricing cards and feature tiles</h3>
                  <p className="gf-small">One click, no dragging.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Tables and charts</h3>
                  <p className="gf-small">Get the whole table without clipping a row.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Chat messages and comments</h3>
                  <p className="gf-small">Capture a single message without the rest of the thread.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Bug reports</h3>
                  <p className="gf-small">Show the exact component that is broken.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Limits
              </h2>
              <p className="gf-p">GoFully scrolls the element into view and captures what is visible. For an element taller than the window, use Full Page or Scrolling Area capture instead.</p>
            </section>

            <section className="gf-sep">
              <h2>Next steps</h2>
              <div className="gf-btn-row">
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="gf-btn-p"
                >
                  Full Page Capture Guide →
                </Link>
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="gf-btn-s"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-capture-a-single-element" />

      <CtaBand
        title="Capture, mark up and share. Free and on your device."
        sub="No account, no watermark, no uploads."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
