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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Capture a Single Element" },
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
            How to Capture a Single Element on a Webpage (Card, Table or Chat Message)
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Dragging a box around a card never comes out clean. Capture Element finds the edges for you.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>October 2026</span>
            <span>·</span>
            <span>3 min read</span>
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
                <strong>Capture Element</strong> is in the popup next to Selected Area. Hover, pick, click. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                How it works
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Open Capture Element</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Click the GoFully icon and choose Capture Element.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Hover</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">A blue outline follows the element under your pointer and shows its size.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Pick the right level</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Press the Up arrow to select the parent element or Down to step back in. Keep going until the outline matches what you want.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Click to capture</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">GoFully crops to that element. Press Esc to cancel.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                When to use it
              </h2>
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Pricing cards and feature tiles</h3>
                  <p className="text-[14px] text-neutral-600">One click, no dragging.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Tables and charts</h3>
                  <p className="text-[14px] text-neutral-600">Get the whole table without clipping a row.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Chat messages and comments</h3>
                  <p className="text-[14px] text-neutral-600">Capture a single message without the rest of the thread.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Bug reports</h3>
                  <p className="text-[14px] text-neutral-600">Show the exact component that is broken.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Limits
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">GoFully scrolls the element into view and captures what is visible. For an element taller than the window, use Full Page or Scrolling Area capture instead.</p>
            </section>

            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Related Guides
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Full Page Capture Guide →
                </Link>
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
              </div>
            </section>
          </BlueprintFrame>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-capture-a-single-element" />

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
