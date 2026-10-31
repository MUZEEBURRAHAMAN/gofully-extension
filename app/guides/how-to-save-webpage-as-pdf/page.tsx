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
  title: "How to Save a Full Webpage as PDF in Chrome (Without Cutting Off Content)",
  description:
    "Learn 3 ways to save an entire scrolling webpage as a clean, paginated PDF in Chrome — print dialog, DevTools, and one-click extension methods compared.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf" },
  openGraph: {
    title: "How to Save a Full Webpage as PDF in Chrome (2026)",
    description:
      "Stop getting cut-off PDFs. Capture the entire page — including lazy-loaded content — and export a properly paginated PDF.",
    url: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf",
  headline: "How to Save a Full Webpage as PDF in Chrome",
  description:
    "Three methods to export entire webpages as clean, paginated PDFs without cutting off content or repeating headers.",
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

export default function SaveWebpageAsPdfGuide() {
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
              { label: "Save Webpage as PDF" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        title="How to Save a Full Webpage as PDF in Chrome"
        lede="Chrome’s built-in &ldquo;Save as PDF&rdquo; cuts off content, breaks layouts, and strips interactive elements. Here are three better approaches — and the one that actually works for long, dynamic pages."
        meta={["By GoFully Team", "Published September 2026", "5 min read"]}
      />

      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            <section className="space-y-4">
              <h2 id="problem">
                Why &ldquo;Print &rarr; Save as PDF&rdquo; Fails on Modern Websites
              </h2>
              <p className="gf-p">
                When you press Ctrl+P (Cmd+P on Mac) and select &ldquo;Save as PDF,&rdquo; Chrome renders the page through its print stylesheet. This causes several problems:
              </p>
              <ul className="space-y-2 text-[14px] text-neutral-600 list-disc pl-5">
                <li><strong>Lazy-loaded images appear blank</strong> — content below the fold never loaded, so the PDF has empty rectangles where images should be.</li>
                <li><strong>Fixed/sticky elements repeat</strong> — headers and navigation bars print on every page, eating into your content area.</li>
                <li><strong>Dynamic content is missing</strong> — tabs, accordions, and infinite scroll content that wasn&apos;t expanded gets cut.</li>
                <li><strong>CSS layouts break</strong> — flexbox and grid layouts often render differently in print mode, causing overlapping text and misaligned columns.</li>
              </ul>
            </section>

            <section id="methods" className="space-y-6 pt-4 border-t border-neutral-200">
              <h2>
                Three Methods Compared
              </h2>

              <div className="overflow-x-auto">
                <table className="gf-compare">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Lazy Images</th>
                      <th>Pagination</th>
                      <th>Annotations</th>
                      <th>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr className="border-b border-neutral-100">
                      <td className="p-3 font-medium">Ctrl+P / Cmd+P</td>
                      <td className="p-3 text-center">Skipped</td>
                      <td className="p-3 text-center">Auto (often broken)</td>
                      <td className="p-3 text-center">None</td>
                      <td className="p-3 text-center">Easy</td>
                    </tr>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td className="p-3 font-medium">DevTools Screenshot</td>
                      <td className="p-3 text-center">Skipped</td>
                      <td className="p-3 text-center">None (one image)</td>
                      <td className="p-3 text-center">None</td>
                      <td className="p-3 text-center">Medium</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">GoFully Extension</td>
                      <td className="p-3 text-center font-medium">Loaded</td>
                      <td className="p-3 text-center font-medium">Auto A4 pages</td>
                      <td className="p-3 text-center font-medium">Full editor</td>
                      <td className="p-3 text-center font-medium">1 click</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="capture" className="gf-sep">
              <h2>
                Step-by-Step: Full Page to PDF in Under 30 Seconds
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="gf-num">1</div>
                  <div>
                    <h3 className="gf-h3">Install GoFully (2 seconds)</h3>
                    <p className="gf-small">
                      Add GoFully from the <a href={CWS_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline">Chrome Web Store</a>. No account needed — it works immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">2</div>
                  <div>
                    <h3 className="gf-h3">Capture the Full Page</h3>
                    <p className="gf-small">
                      Click the GoFully icon in your toolbar and select <strong>Full Page</strong>. The extension automatically scrolls through the entire page, waits for lazy-loaded images and iframes, then stitches everything into a single high-resolution image.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">3</div>
                  <div>
                    <h3 className="gf-h3">Annotate If Needed (Optional)</h3>
                    <p className="gf-small">
                      Click <strong>Edit</strong> to open the visual editor. Add arrows, callouts, or blur sensitive content before exporting. Everything stays local.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3" id="export">
                  <div className="gf-num">4</div>
                  <div>
                    <h3 className="gf-h3">Export as PDF</h3>
                    <p className="gf-small">
                      Click the <strong>PDF</strong> button in the result bar. GoFully splits the screenshot into properly paginated A4 pages with margins — ready to attach to an email, upload to a CMS, or archive.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="gf-sep">
              <h2>
                When to Use Each Format
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="gf-tcard">
                  <h3 className="gf-h3">PDF</h3>
                  <p className="gf-small">
                    Best for archival, legal documentation, client deliverables, and pages you need to print. Properly paginated with margins.
                  </p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">PNG</h3>
                  <p className="gf-small">
                    Best for bug reports, design reviews, and Slack/Teams sharing. Lossless quality, large file size for long pages.
                  </p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">WebP / JPG</h3>
                  <p className="gf-small">
                    Best for blog posts, social media, and documentation sites. Smaller file sizes with adjustable quality.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-neutral-200">
              <h2>
                FAQ
              </h2>
              <details className="text-[14px] text-neutral-600 border-b border-neutral-100 pb-3">
                <summary className="cursor-pointer font-medium text-neutral-800 py-2">Does GoFully&apos;s PDF export work offline?</summary>
                <p className="mt-1">Yes. The entire capture, annotation, and PDF conversion pipeline runs locally in your browser. No data is uploaded to any server.</p>
              </details>
              <details className="text-[14px] text-neutral-600 border-b border-neutral-100 pb-3">
                <summary className="cursor-pointer font-medium text-neutral-800 py-2">Can I control the PDF page size?</summary>
                <p className="mt-1">GoFully exports in standard A4 format with automatic pagination. The screenshot width maps to the page width, and content is split cleanly across pages.</p>
              </details>
              <details className="text-[14px] text-neutral-600 border-b border-neutral-100 pb-3">
                <summary className="cursor-pointer font-medium text-neutral-800 py-2">What about pages behind a login?</summary>
                <p className="mt-1">GoFully captures whatever is currently rendered in your browser tab, including authenticated dashboards, admin panels, and SaaS tools. Your session cookies stay local.</p>
              </details>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-save-webpage-as-pdf" />

      <CtaBand
        title="Ready to save full pages as clean PDFs?"
        sub="Free forever. No account. Works offline."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
