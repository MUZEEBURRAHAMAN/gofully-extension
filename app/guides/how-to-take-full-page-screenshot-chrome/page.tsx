import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Take a Full Page Screenshot in Chrome Without Cutting Off Content",
  description: "Step-by-step instructions for capturing entire scrolling webpages in Google Chrome.",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      name: "Install a Full Page Screenshot Extension",
      text: "Install GoFully from the Chrome Web Store for automated scrolling and sticky header handling.",
      url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome#extension-method",
    },
    {
      "@type": "HowToStep",
      name: "Trigger Full Page Capture",
      text: "Press Alt+Shift+F (or Command+Shift+F on Mac) or click the GoFully extension icon and choose 'Full Page'.",
      url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome#trigger-capture",
    },
    {
      "@type": "HowToStep",
      name: "Let GoFully Auto-Scroll and Stitch",
      text: "The tool automatically scrolls through the webpage, waits for lazy-loaded images to load, hides repeating sticky navigation bars, and stitches the canvas.",
      url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome#auto-scroll",
    },
    {
      "@type": "HowToStep",
      name: "Annotate, Redact or Export to PDF/PNG",
      text: "Review the full-length capture in the editor. Add annotations, blur sensitive data, and export in 4K PNG or paginated PDF.",
      url: "https://gofully-extension.vercel.app/guides/how-to-take-full-page-screenshot-chrome#export",
    },
  ],
};

export default function FullPageScreenshotGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <BreadcrumbJsonLd name="Full Page Screenshot Chrome Guide" path="/guides/how-to-take-full-page-screenshot-chrome" />
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
            How to Take a Full Page Screenshot in Chrome Without Cutting Off Content
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Ever tried taking a full-page screenshot of a long website, only to find the bottom half cut off, images missing, or the fixed navigation bar repeating 20 times? Here is how to capture entire webpages perfectly.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">
            
            {/* Quick Summary */}
            <div className="bg-blue-50/70 border border-blue-200/80 p-5">
              <h2 className="gf-heading-font font-semibold text-[16px] text-blue-900 mb-2">
                TL;DR: The Two Best Methods
              </h2>
              <ul className="list-disc list-inside text-[14px] leading-relaxed text-blue-950 space-y-1.5">
                <li>
                  <strong>Method 1 (Best for Everyday &amp; Long Pages):</strong> Use <Link href={CWS_URL} target="_blank" className="underline font-semibold text-[var(--gf-color-accent)]">GoFully</Link> for automatic scrolling, sticky-element hiding, lazy-image loading, and instant PDF/PNG export.
                </li>
                <li>
                  <strong>Method 2 (No Extension Needed):</strong> Use Chrome&apos;s hidden DevTools shortcut (<kbd className="bg-white border px-1.5 py-0.5 rounded text-xs font-mono">Cmd+Shift+P</kbd> → &quot;Capture full size screenshot&quot;). Works for basic pages, but fails on infinite scroll, complex sticky headers, and heavy canvases.
                </li>
              </ul>
            </div>

            {/* Method 1 */}
            <section id="extension-method" className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Method 1: The 1-Click Extension Method (GoFully)
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Modern websites use complex layouts: sticky headers that stay glued to the top of the viewport, lazy-loaded images that only trigger when scrolled into view, and animations. GoFully was designed specifically to handle these issues automatically.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Install the Extension</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Add <a href={CWS_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium underline">GoFully from the Chrome Web Store</a> (it is 100% free and requires no account registration).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Open the Webpage &amp; Click &quot;Full Page&quot;</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Navigate to the target webpage. Click the GoFully icon in your toolbar (or use the shortcut <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Alt+Shift+F</kbd> on Windows / <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Cmd+Shift+F</kbd> on Mac).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Automatic Stitching</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      GoFully automatically scrolls down the page in increments, waits for lazy-loaded assets to render, hides repeating navigation banners, and stitches the viewports onto an in-memory canvas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Review, Annotate &amp; Export</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      The screenshot opens in the visual studio. You can blur confidential details, draw arrows or callouts, and save as 4K PNG or a paginated multi-page PDF.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Method 2 */}
            <section id="devtools-method" className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Method 2: Using Built-in Chrome DevTools (No Extension)
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                If you are on a restricted machine where you cannot install extensions, Google Chrome has a native capture tool buried inside Developer Tools:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-[14px] text-neutral-700">
                <li>Open Chrome DevTools by pressing <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">F12</kbd> (or <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Cmd+Option+I</kbd> on Mac).</li>
                <li>Press <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Cmd+Shift+P</kbd> (Mac) or <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Ctrl+Shift+P</kbd> (Windows) to open the Command Palette.</li>
                <li>Type <code className="bg-neutral-100 px-1 text-xs">screenshot</code> and select <strong>&quot;Capture full size screenshot&quot;</strong>.</li>
                <li>Chrome will render the page and download a PNG file directly to your Downloads folder.</li>
              </ol>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded text-[13.5px] text-amber-900 mt-3">
                <strong>Limitations of DevTools:</strong> Chrome DevTools bypasses lazy-loading scripts, meaning images further down the page will often appear blank. It also does not remove sticky headers, cannot paginate into PDFs, and cannot annotate or redact private data.
              </div>
            </section>

            {/* Why Screenshots Cut Off */}
            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                Why Do Full Page Screenshots Often Cut Off?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px]">
                <div className="border p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 mb-1">1. CSS Overflow Properties</h3>
                  <p className="text-neutral-600">Many modern web applications set <code>overflow: hidden</code> on the <code>&lt;body&gt;</code> tag and place scrolling on an internal container (like a chat feed or modal). Standard capture tools fail because the document height is artificially reported as 100vh.</p>
                </div>
                <div className="border p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 mb-1">2. Lazy Loaded Images</h3>
                  <p className="text-neutral-600">Sites like Medium, Substack, and Amazon use <code>loading=&quot;lazy&quot;</code> or IntersectionObservers. Unless a tool actually simulates user scroll events with appropriate render delays, those image tags never load.</p>
                </div>
              </div>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Capture entire scrolling webpages in 1 click
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          GoFully handles sticky elements, lazy-loaded images, on-device OCR, and multi-page PDF export — completely free.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
