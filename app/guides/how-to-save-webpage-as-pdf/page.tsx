import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Save a Full Webpage as PDF in Chrome",
  description: "Three methods to export entire webpages as clean, paginated PDFs without cutting off content.",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      name: "Choose Your Method",
      text: "Decide between Chrome's Print dialog, DevTools full-page screenshot, or the GoFully extension based on your needs.",
      url: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf#methods",
    },
    {
      "@type": "HowToStep",
      name: "Capture the Full Page",
      text: "For GoFully: click the extension icon and select Full Page capture. The extension scrolls automatically and waits for lazy content.",
      url: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf#capture",
    },
    {
      "@type": "HowToStep",
      name: "Export as PDF",
      text: "Click the PDF button in the result bar. GoFully automatically paginates the screenshot into A4 pages with proper margins.",
      url: "https://gofully-extension.vercel.app/guides/how-to-save-webpage-as-pdf#export",
    },
  ],
};

export default function SaveWebpageAsPdfGuide() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <SiteNav />

      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Save Webpage as PDF" },
            ]}
          />
        </div>
      </div>

      <div className="text-center" style={{ padding: "40px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            How to Save a Full Webpage as PDF in Chrome
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Chrome&apos;s built-in &ldquo;Save as PDF&rdquo; cuts off content, breaks layouts, and strips interactive elements. Here are three better approaches — and the one that actually works for long, dynamic pages.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Team</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            <section className="space-y-4">
              <h2 id="problem" className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Why &ldquo;Print &rarr; Save as PDF&rdquo; Fails on Modern Websites
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
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
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Three Methods Compared
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Method</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Lazy Images</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Pagination</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Annotations</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Difficulty</th>
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
                    <tr style={{ background: "rgba(22,103,242,.04)" }}>
                      <td className="p-3 font-semibold" style={{ color: "var(--gf-color-accent)" }}>GoFully Extension</td>
                      <td className="p-3 text-center font-medium" style={{ color: "var(--gf-color-accent)" }}>Loaded</td>
                      <td className="p-3 text-center font-medium" style={{ color: "var(--gf-color-accent)" }}>Auto A4 pages</td>
                      <td className="p-3 text-center font-medium" style={{ color: "var(--gf-color-accent)" }}>Full editor</td>
                      <td className="p-3 text-center font-medium" style={{ color: "var(--gf-color-accent)" }}>1 click</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="capture" className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step-by-Step: Full Page to PDF in Under 30 Seconds
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Install GoFully (2 seconds)</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Add GoFully from the <a href={CWS_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline">Chrome Web Store</a>. No account needed — it works immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Capture the Full Page</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click the GoFully icon in your toolbar and select <strong>Full Page</strong>. The extension automatically scrolls through the entire page, waits for lazy-loaded images and iframes, then stitches everything into a single high-resolution image.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Annotate If Needed (Optional)</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click <strong>Edit</strong> to open the visual editor. Add arrows, callouts, or blur sensitive content before exporting. Everything stays local.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3" id="export">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Export as PDF</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click the <strong>PDF</strong> button in the result bar. GoFully splits the screenshot into properly paginated A4 pages with margins — ready to attach to an email, upload to a CMS, or archive.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                When to Use Each Format
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">PDF</h3>
                  <p className="text-[13px] text-neutral-600">
                    Best for archival, legal documentation, client deliverables, and pages you need to print. Properly paginated with margins.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">PNG</h3>
                  <p className="text-[13px] text-neutral-600">
                    Best for bug reports, design reviews, and Slack/Teams sharing. Lossless quality, large file size for long pages.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">WebP / JPG</h3>
                  <p className="text-[13px] text-neutral-600">
                    Best for blog posts, social media, and documentation sites. Smaller file sizes with adjustable quality.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
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

          </BlueprintFrame>
        </div>
      </div>

      <div className="text-center" style={{ background: "var(--gf-color-text)", padding: "56px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#fff", letterSpacing: "-0.01em" }}>
          Ready to save full pages as clean PDFs?
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 10 }}>
          Free forever. No account. Works offline.
        </p>
        <div style={{ marginTop: 24 }}>
          <a
            href={CWS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 gf-heading-font font-semibold"
            style={{ height: 48, padding: "0 26px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 14, letterSpacing: "0.02em" }}
          >
            Add to Chrome — It&apos;s Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </a>
        </div>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
