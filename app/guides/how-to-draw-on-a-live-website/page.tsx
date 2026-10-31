import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Draw on Any Live Website and Capture It with Your Marks",
  description: "Use GoFully's Draw on Page to sketch arrows, highlight text and add sticky notes right on a live website, then capture the visible area or the full page with your marks in place.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-draw-on-a-live-website" },
  openGraph: {
    title: "How to Draw on Any Live Website and Capture It with Your Marks \u2014 GoFully",
    description: "Use GoFully's Draw on Page to sketch arrows, highlight text and add sticky notes right on a live website, then capture the visible area or the full page with your marks in place.",
    url: "https://gofully-extension.vercel.app/guides/how-to-draw-on-a-live-website",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-draw-on-a-live-website#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-draw-on-a-live-website",
  headline: "How to Draw on Any Live Website and Capture It with Your Marks",
  description: "Use GoFully's Draw on Page to sketch arrows, highlight text and add sticky notes right on a live website, then capture the visible area or the full page with your marks in place.",
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

export default function DrawOnALiveWebsiteGuidePage() {
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
              { label: "Draw on a Live Website" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        eyebrow="New in v1.1.3"
        title="How to Draw on Any Live Website and Capture It with Your Marks"
        lede="Most screenshot tools make you capture first and mark up later. Draw on Page flips that. You mark the real site, then capture it, so your arrows and highlights land exactly where the content sits."
        meta={["By GoFully Engineering", "October 2026", "4 min read"]}
      />

      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">
            <div className="gf-callout">
              <h2>
                New in GoFully v1.1.3
              </h2>
              <p>
                <strong>Draw on Page</strong> adds a toolbar to any website. Press <kbd>Cmd/Ctrl+Shift+H</kbd> or click <strong>Draw on Page</strong> in the popup to start. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2>
                What you can draw with
              </h2>
              <p className="gf-p">The toolbar sits at the bottom of the page and holds nine tools. Each has a one-key shortcut.</p>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Pen (P)</h3>
                  <p className="gf-small">Freehand lines in your chosen colour and width.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Highlighter (H)</h3>
                  <p className="gf-small">A translucent marker that leaves the text readable.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Highlight text (T)</h3>
                  <p className="gf-small">Select words on the page and GoFully paints a marker over them.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Arrow (A), Rectangle (R), Ellipse (O)</h3>
                  <p className="gf-small">Point at things and box them in.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Text (X) and Sticky note (N)</h3>
                  <p className="gf-small">Type a label or leave a note on the page.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Eraser (E)</h3>
                  <p className="gf-small">Remove a single mark. Press V to go back to using the page normally.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Step by step
              </h2>
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Start Draw on Page</h3>
                  <p className="gf-small">Open the popup and choose Draw on Page, or press Cmd/Ctrl+Shift+H on the site.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Mark the page</h3>
                  <p className="gf-small">Pick a tool and drag. Undo with Cmd/Ctrl+Z and redo with Cmd/Ctrl+Shift+Z.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Capture</h3>
                  <p className="gf-small">Click Visible or Full page in the toolbar. GoFully hides the toolbar first, so it never shows in the image.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Finish</h3>
                  <p className="gf-small">Press Esc to leave Draw on Page. Your marks stay saved for that page address.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Good to know
              </h2>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Marks are saved per page</h3>
                  <p className="gf-small">They live in your browser, keyed to the page address, and return when you reopen Draw on Page there. The trash button clears them.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Marks stay where you put them</h3>
                  <p className="gf-small">They follow the page as it scrolls. Content that scrolls inside its own box, which some web apps use, does not carry marks along.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Nothing leaves your device</h3>
                  <p className="gf-small">GoFully stores marks locally and never uploads them.</p>
                </div>
              </div>
            </section>

            <section className="gf-sep">
              <h2>Next steps</h2>
              <div className="gf-btn-row">
                <Link
                  href="/guides/how-to-use-highlighter-tool-in-screenshots"
                  className="gf-btn-p"
                >
                  Highlighter Guide →
                </Link>
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="gf-btn-s"
                >
                  Full Page Capture Guide →
                </Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-draw-on-a-live-website" />

      <CtaBand
        title="Capture, mark up and share. Free and on your device."
        sub="No account, no watermark, no uploads."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
