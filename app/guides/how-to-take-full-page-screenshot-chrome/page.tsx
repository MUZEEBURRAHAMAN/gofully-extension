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
  title: "How to Take a Full Page Screenshot in Chrome Without Cutting Off (2026)",
  description:
    "Learn how to capture an entire scrolling webpage in Chrome without missing content or broken sticky headers. Compare Chrome DevTools vs the free 1-click GoFully extension.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome" },
  openGraph: {
    title: "How to Take a Full Page Screenshot in Chrome Without Cutting Off (2026)",
    description:
      "Step-by-step tutorial on taking full page scrolling screenshots in Google Chrome. Handles sticky headers, lazy-loaded images, and PDF exports.",
    url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome",
  headline: "How to Take a Full Page Screenshot in Chrome Without Cutting Off Content",
  description:
    "Step-by-step instructions for capturing entire scrolling webpages in Google Chrome without cutting off content or repeating sticky headers.",
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

export default function FullPageScreenshotGuidePage() {
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
              { label: "How to Take Full Page Screenshot" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="How to Take a Full Page Screenshot in Chrome Without Cutting Off Content"
        lede="Ever tried taking a full-page screenshot of a long website, only to find the bottom half cut off, images missing, or the fixed navigation bar repeating 20 times? Here is how to capture entire webpages perfectly."
        meta={["By GoFully Engineering", "Published September 2026", "5 min read"]}
      />

      {/* Article Content */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">
            
            {/* Quick Summary */}
            <div className="gf-callout">
              <h2>
                TL;DR: The Two Best Methods
              </h2>
              <ul className="list-disc list-inside text-[14px] leading-relaxed text-blue-950 space-y-1.5">
                <li>
                  <strong>Method 1 (Best for Everyday &amp; Long Pages):</strong> Use <Link href={CWS_URL} target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[var(--gf-color-accent)]">GoFully</Link> for automatic scrolling, sticky-element hiding, lazy-image loading, and instant PDF/PNG export.
                </li>
                <li>
                  <strong>Method 2 (No Extension Needed):</strong> Use Chrome&apos;s hidden DevTools shortcut (<kbd>Cmd+Shift+P</kbd> → &quot;Capture full size screenshot&quot;). Works for basic pages, but fails on infinite scroll, complex sticky headers, and heavy canvases.
                </li>
              </ul>
            </div>

            {/* Method 1 */}
            <section id="extension-method" className="space-y-4">
              <h2>
                Method 1: The 1-Click Extension Method (GoFully)
              </h2>
              <p className="gf-p">
                Modern websites use complex layouts: sticky headers that stay glued to the top of the viewport, lazy-loaded images that only trigger when scrolled into view, and animations. GoFully was designed specifically to handle these issues automatically.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="gf-num">1</div>
                  <div>
                    <h3 className="gf-h3">Install the Extension</h3>
                    <p className="gf-small">
                      Add <a href={CWS_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium underline">GoFully from the Chrome Web Store</a> (it is 100% free and requires no account registration).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">2</div>
                  <div>
                    <h3 className="gf-h3">Open the Webpage &amp; Click &quot;Full Page&quot;</h3>
                    <p className="gf-small">
                      Navigate to the target webpage. Click the GoFully icon in your toolbar (or use the shortcut <kbd>Ctrl+Shift+F</kbd> on Windows / <kbd>Cmd+Shift+F</kbd> on Mac).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">3</div>
                  <div>
                    <h3 className="gf-h3">Automatic Stitching</h3>
                    <p className="gf-small">
                      GoFully automatically scrolls down the page in increments, waits for lazy-loaded assets to render, hides repeating navigation banners, and stitches the viewports onto an in-memory canvas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">4</div>
                  <div>
                    <h3 className="gf-h3">Review, Annotate &amp; Export</h3>
                    <p className="gf-small">
                      The screenshot opens in the visual studio. You can blur confidential details, draw arrows or callouts, and save as 4K PNG or a paginated multi-page PDF.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Method 2 */}
            <section id="devtools-method" className="gf-sep">
              <h2>
                Method 2: Using Built-in Chrome DevTools (No Extension)
              </h2>
              <p className="gf-p">
                If you are on a restricted machine where you cannot install extensions, Google Chrome has a native capture tool buried inside Developer Tools:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-[14px] text-neutral-700">
                <li>Open Chrome DevTools by pressing <kbd>F12</kbd> (or <kbd>Cmd+Option+I</kbd> on Mac).</li>
                <li>Press <kbd>Cmd+Shift+P</kbd> (Mac) or <kbd>Ctrl+Shift+P</kbd> (Windows) to open the Command Palette.</li>
                <li>Type <code>screenshot</code> and select <strong>&quot;Capture full size screenshot&quot;</strong>.</li>
                <li>Chrome will render the page and download a PNG file directly to your Downloads folder.</li>
              </ol>

              <div className="gf-callout gf-callout--warn">
                <strong>Limitations of DevTools:</strong> Chrome DevTools bypasses lazy-loading scripts, meaning images further down the page will often appear blank. It also does not remove sticky headers, cannot paginate into PDFs, and cannot annotate or redact private data.
              </div>
            </section>

            {/* Why Screenshots Cut Off */}
            <section className="gf-sep">
              <h2>
                Why Do Full Page Screenshots Often Cut Off?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px]">
                <div className="gf-tcard">
                  <h3 className="gf-h3">1. CSS Overflow Properties</h3>
                  <p className="text-neutral-600">Many modern web applications set <code>overflow: hidden</code> on the <code>&lt;body&gt;</code> tag and place scrolling on an internal container (like a chat feed or modal). Standard capture tools fail because the document height is artificially reported as 100vh.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">2. Lazy Loaded Images</h3>
                  <p className="text-neutral-600">Sites like Medium, Substack, and Amazon use <code>loading=&quot;lazy&quot;</code> or IntersectionObservers. Unless a tool actually simulates user scroll events with appropriate render delays, those image tags never load.</p>
                </div>
              </div>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-take-full-page-screenshot-chrome" />

      {/* CTA */}
      <CtaBand
        title="Capture entire scrolling webpages in 1 click"
        sub="GoFully handles sticky elements, lazy-loaded images, on-device OCR, and multi-page PDF export — completely free."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
