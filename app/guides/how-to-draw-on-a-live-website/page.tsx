import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";

const CWS_URL =
  "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc";

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Draw on a Live Website" },
            ]}
          />
        </div>
      </div>

      <div className="text-center" style={{ padding: "36px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="inline-flex items-center gap-2 border border-blue-300 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold text-blue-700 tracking-wide uppercase">
            New in v1.1.3
          </div>
          <h1
            className="gf-heading-font font-semibold"
            style={{ fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 16 }}
          >
            How to Draw on Any Live Website and Capture It with Your Marks
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Most screenshot tools make you capture first and mark up later. Draw on Page flips that. You mark the real site, then capture it, so your arrows and highlights land exactly where the content sits.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>October 2026</span>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">
            <div className="border border-blue-200 bg-blue-50/50 p-5 rounded-none">
              <h2 className="gf-heading-font font-semibold text-[16px] text-blue-900 mb-2">
                New in GoFully v1.1.3
              </h2>
              <p className="text-[14px] leading-relaxed text-blue-900/90">
                <strong>Draw on Page</strong> adds a toolbar to any website. Press <kbd>Cmd/Ctrl+Shift+H</kbd> or click <strong>Draw on Page</strong> in the popup to start. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                What you can draw with
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">The toolbar sits at the bottom of the page and holds nine tools. Each has a one-key shortcut.</p>
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Pen (P)</h3>
                  <p className="text-[14px] text-neutral-600">Freehand lines in your chosen colour and width.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Highlighter (H)</h3>
                  <p className="text-[14px] text-neutral-600">A translucent marker that leaves the text readable.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Highlight text (T)</h3>
                  <p className="text-[14px] text-neutral-600">Select words on the page and GoFully paints a marker over them.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Arrow (A), Rectangle (R), Ellipse (O)</h3>
                  <p className="text-[14px] text-neutral-600">Point at things and box them in.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Text (X) and Sticky note (N)</h3>
                  <p className="text-[14px] text-neutral-600">Type a label or leave a note on the page.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Eraser (E)</h3>
                  <p className="text-[14px] text-neutral-600">Remove a single mark. Press V to go back to using the page normally.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step by step
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Start Draw on Page</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Open the popup and choose Draw on Page, or press Cmd/Ctrl+Shift+H on the site.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Mark the page</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Pick a tool and drag. Undo with Cmd/Ctrl+Z and redo with Cmd/Ctrl+Shift+Z.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Capture</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Click Visible or Full page in the toolbar. GoFully hides the toolbar first, so it never shows in the image.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Finish</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Press Esc to leave Draw on Page. Your marks stay saved for that page address.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Good to know
              </h2>
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Marks are saved per page</h3>
                  <p className="text-[14px] text-neutral-600">They live in your browser, keyed to the page address, and return when you reopen Draw on Page there. The trash button clears them.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Marks stay where you put them</h3>
                  <p className="text-[14px] text-neutral-600">They follow the page as it scrolls. Content that scrolls inside its own box, which some web apps use, does not carry marks along.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Nothing leaves your device</h3>
                  <p className="text-[14px] text-neutral-600">GoFully stores marks locally and never uploads them.</p>
                </div>
              </div>
            </section>

            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Related Guides
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/how-to-use-highlighter-tool-in-screenshots"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Highlighter Guide →
                </Link>
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Full Page Capture Guide →
                </Link>
              </div>
            </section>
          </BlueprintFrame>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-draw-on-a-live-website" />

      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Capture, mark up and share. Free and on your device.
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          No account, no watermark, no uploads.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add GoFully to Chrome
        </a>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
