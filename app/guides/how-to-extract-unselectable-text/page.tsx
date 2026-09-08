import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Extract and Copy Unselectable Text from Any Webpage or Image",
  description: "Step-by-step instructions for extracting text from images and locked web pages locally.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      name: "Activate GoFully Capture",
      text: "Open the webpage containing unselectable text or an image. Click the GoFully icon or press Alt+S.",
      url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text#activate",
    },
    {
      "@type": "HowToStep",
      name: "Select the Region",
      text: "Choose 'Selected Region' and draw a bounding box around the image, video player, or locked text area.",
      url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text#select-region",
    },
    {
      "@type": "HowToStep",
      name: "Click 'Extract Text (OCR)'",
      text: "The built-in WebAssembly OCR engine parses pixels directly on your CPU in milliseconds.",
      url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text#run-ocr",
    },
    {
      "@type": "HowToStep",
      name: "Copy Formatted Text",
      text: "Click 'Copy Text' to paste directly into your editor, IDE, or document. Zero cloud transmission.",
      url: "https://gofully-extension.vercel.app/guides/how-to-extract-unselectable-text#copy",
    },
  ],
};

export default function ExtractUnselectableTextGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <BreadcrumbJsonLd name="Extract Unselectable Text Guide" path="/guides/how-to-extract-unselectable-text" />
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
            How to Extract &amp; Copy Unselectable Text from Any Webpage
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Encountered text baked into an infographic, a code snippet inside a YouTube tutorial, an HTML5 canvas chart, or a site with right-click disabled? Here is how to copy it instantly.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            {/* Why text is unselectable */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Why Can&apos;t I Copy This Text?
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                On the modern web, content is increasingly rendered in non-standard formats that your browser cursor cannot highlight:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">1. Raster Image Embeds</h3>
                  <p className="text-neutral-600">Infographics, diagrams, scanned PDFs, screenshots, and receipts are composed of pixel arrays, not DOM characters.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">2. Video Player Frames</h3>
                  <p className="text-neutral-600">Code walkthroughs, lecture slides, and presentations on YouTube, Loom, or Coursera cannot be selected with a mouse.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">3. CSS Protection Rules</h3>
                  <p className="text-neutral-600">Many documentation and paywalled portals use <code>user-select: none</code> or JavaScript event blockers like <code>contextmenu</code> to prevent copying.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">4. HTML5 Canvas &amp; WebGL</h3>
                  <p className="text-neutral-600">Figma mockups, interactive charts (Chart.js, D3), and games render directly to a graphics buffer with zero selectable HTML text nodes.</p>
                </div>
              </div>
            </section>

            {/* The Old Way vs The GoFully Way */}
            <div className="bg-blue-50/70 border border-blue-200/80 p-5">
              <h2 className="gf-heading-font font-semibold text-[16px] text-blue-900 mb-2">
                Why Cloud OCR Websites Are a Security Risk
              </h2>
              <p className="text-[14px] leading-relaxed text-blue-950">
                Most people take a screenshot and upload it to a free online OCR site. Those third-party cloud servers store your uploaded images on their disks — exposing company passwords, customer data, and internal code. GoFully runs a compiled WebAssembly model (Tesseract Wasm) <strong>completely inside your browser memory</strong>. No server ever receives your pixels.
              </p>
            </div>

            {/* Step-by-Step Walkthrough */}
            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                How to Extract Text in 3 Clicks
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Trigger Region Capture</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click the GoFully icon or press the shortcut (<kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Ctrl+Shift+A</kbd> on Windows / <kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Cmd+Shift+A</kbd> on Mac).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Select the Area</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Drag a box over the image, video frame, chart, or protected text.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Click &quot;Extract Text&quot; (OCR)</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      In the result bar, click the <strong>OCR</strong> button. The on-device engine extracts all readable characters, preserves spacing, and copies the clean text to your clipboard.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pro Tips */}
            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                Pro Tips for Maximum OCR Accuracy
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[14px] text-neutral-700">
                <li><strong>Zoom in on small fonts:</strong> If a video frame has tiny code characters, zoom the browser (<kbd className="bg-neutral-100 border px-1.5 py-0.5 text-xs font-mono">Cmd/Ctrl +</kbd>) before capturing. More pixels per character dramatically improves recognition accuracy.</li>
                <li><strong>Capture tight bounding boxes:</strong> Crop closely around the relevant text to avoid noisy background graphics or decorative borders.</li>
                <li><strong>High Contrast:</strong> Light text on dark backgrounds and dark text on light backgrounds are recognized with &gt;99% precision.</li>
              </ul>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Copy unselectable text effortlessly
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          No accounts, no cloud uploads, and 100% on-device OCR. Extract text from any webpage or image.
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
