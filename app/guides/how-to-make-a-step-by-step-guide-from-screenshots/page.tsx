import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)",
  description: "Turn several GoFully captures into one how-to document. Add captions, reorder steps and export a PDF or a Markdown ZIP, all on your device.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-make-a-step-by-step-guide-from-screenshots" },
  openGraph: {
    title: "How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown) \u2014 GoFully",
    description: "Turn several GoFully captures into one how-to document. Add captions, reorder steps and export a PDF or a Markdown ZIP, all on your device.",
    url: "https://gofully-extension.vercel.app/guides/how-to-make-a-step-by-step-guide-from-screenshots",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-make-a-step-by-step-guide-from-screenshots#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-make-a-step-by-step-guide-from-screenshots",
  headline: "How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)",
  description: "Turn several GoFully captures into one how-to document. Add captions, reorder steps and export a PDF or a Markdown ZIP, all on your device.",
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

export default function MakeAStepByStepGuideFromScreenshotsGuidePage() {
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
              { label: "Step-by-Step Guide Builder" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        eyebrow="New in v1.1.3"
        title="How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)"
        lede="A good how-to is a sequence of screenshots with one sentence under each. GoFully collects the screenshots as you go and exports the finished guide."
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
                Click <strong>Guide</strong> on the capture card, or choose <strong>Add to guide</strong> in the editor's Export menu. Open your guide from the list icon in the popup. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2>
                Build the guide
              </h2>
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Capture the first screen</h3>
                  <p className="gf-small">Take a screenshot as usual.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Add it to the guide</h3>
                  <p className="gf-small">Click Guide on the capture card, or Export, then Add to guide in the editor.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Repeat</h3>
                  <p className="gf-small">A guide holds up to 30 steps.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Write captions</h3>
                  <p className="gf-small">Open the guide, name it and type a line under each step.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Reorder or delete</h3>
                  <p className="gf-small">Use the arrows to move a step and the cross to remove it.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Export
              </h2>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">PDF</h3>
                  <p className="gf-small">One A4 PDF with each step headed, captioned and illustrated.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Markdown + images</h3>
                  <p className="gf-small">A ZIP holding guide.md and one JPG per step, ready for a docs repo or wiki.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Where it lives
              </h2>
              <p className="gf-p">GoFully keeps the guide in your browser&apos;s local storage. Images are shrunk to fit, so thirty steps stay well inside the storage limit. Clear removes the guide.</p>
            </section>

            <section className="gf-sep">
              <h2>Next steps</h2>
              <div className="gf-btn-row">
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="gf-btn-p"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
                <Link
                  href="/guides/how-to-save-webpage-as-pdf"
                  className="gf-btn-s"
                >
                  Save as PDF Guide →
                </Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-make-a-step-by-step-guide-from-screenshots" />

      <CtaBand
        title="Capture, mark up and share. Free and on your device."
        sub="No account, no watermark, no uploads."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
