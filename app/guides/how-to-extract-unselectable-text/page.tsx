import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Extract & Copy Unselectable Text from Any Webpage (2026)",
  description:
    "Extract unselectable text from images, video frames, charts, or copy-protected websites in Chrome using 100% on-device WebAssembly OCR. Zero cloud uploads.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text" },
  openGraph: {
    title: "How to Extract & Copy Unselectable Text from Any Webpage (2026)",
    description:
      "A complete guide to extracting text from images, videos, canvas charts, and copy-protected web pages using local in-browser OCR.",
    url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text",
  headline: "How to Extract and Copy Unselectable Text from Any Webpage or Image",
  description:
    "Step-by-step instructions for extracting text from images, charts, videos, and locked web pages locally using in-browser WebAssembly OCR.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-08",
  dateModified: "2026-09-20",
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

export default function ExtractUnselectableTextGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Extract Unselectable Text Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="How to Extract & Copy Unselectable Text from Any Webpage"
        lede="Encountered text baked into an infographic, a code snippet inside a YouTube tutorial, an HTML5 canvas chart, or a site with right-click disabled? Here is how to copy it instantly."
        meta={["By GoFully Engineering", "Published September 2026", "4 min read"]}
      />

      {/* Article Body */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            {/* Why text is unselectable */}
            <section className="space-y-4">
              <h2>
                Why Can&apos;t I Copy This Text?
              </h2>
              <p className="gf-p">
                On the modern web, content is increasingly rendered in non-standard formats that your browser cursor cannot highlight:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="gf-tcard">
                  <h3 className="gf-h3">1. Raster Image Embeds</h3>
                  <p className="text-neutral-600">Infographics, diagrams, scanned PDFs, screenshots, and receipts are composed of pixel arrays, not DOM characters.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">2. Video Player Frames</h3>
                  <p className="text-neutral-600">Code walkthroughs, lecture slides, and presentations on YouTube, Loom, or Coursera cannot be selected with a mouse.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">3. CSS Protection Rules</h3>
                  <p className="text-neutral-600">Many documentation and paywalled portals use <code>user-select: none</code> or JavaScript event blockers like <code>contextmenu</code> to prevent copying.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">4. HTML5 Canvas &amp; WebGL</h3>
                  <p className="text-neutral-600">Figma mockups, interactive charts (Chart.js, D3), and games render directly to a graphics buffer with zero selectable HTML text nodes.</p>
                </div>
              </div>
            </section>

            {/* The Old Way vs The GoFully Way */}
            <div className="gf-callout">
              <h2>
                Why Cloud OCR Websites Are a Security Risk
              </h2>
              <p className="text-[14px] leading-relaxed text-blue-950">
                Most people take a screenshot and upload it to a free online OCR site. Those third-party cloud servers store your uploaded images on their disks — exposing company passwords, customer data, and internal code. GoFully runs a compiled WebAssembly model (Tesseract Wasm) <strong>completely inside your browser memory</strong>. No server ever receives your pixels.
              </p>
            </div>

            {/* Step-by-Step Walkthrough */}
            <section className="gf-sep">
              <h2>
                How to Extract Text in 3 Clicks
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="gf-num">1</div>
                  <div>
                    <h3 className="gf-h3">Trigger Region Capture</h3>
                    <p className="gf-small">
                      Click the GoFully icon or press the shortcut (<kbd>Ctrl+Shift+A</kbd> on Windows / <kbd>Cmd+Shift+A</kbd> on Mac).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">2</div>
                  <div>
                    <h3 className="gf-h3">Select the Area</h3>
                    <p className="gf-small">
                      Drag a box over the image, video frame, chart, or protected text.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">3</div>
                  <div>
                    <h3 className="gf-h3">Click &quot;Extract Text&quot; (OCR)</h3>
                    <p className="gf-small">
                      In the result bar, click the <strong>OCR</strong> button. The on-device engine extracts all readable characters, preserves spacing, and copies the clean text to your clipboard.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pro Tips */}
            <section className="gf-sep">
              <h2>
                Pro Tips for Maximum OCR Accuracy
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[14px] text-neutral-700">
                <li><strong>Zoom in on small fonts:</strong> If a video frame has tiny code characters, zoom the browser (<kbd>Cmd/Ctrl +</kbd>) before capturing. More pixels per character dramatically improves recognition accuracy.</li>
                <li><strong>Capture tight bounding boxes:</strong> Crop closely around the relevant text to avoid noisy background graphics or decorative borders.</li>
                <li><strong>High Contrast:</strong> Light text on dark backgrounds and dark text on light backgrounds are recognized with &gt;99% precision.</li>
              </ul>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-extract-unselectable-text" />

      {/* CTA */}
      <CtaBand
        title="Copy unselectable text effortlessly"
        sub="No accounts, no cloud uploads, and 100% on-device OCR. Extract text from any webpage or image."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
