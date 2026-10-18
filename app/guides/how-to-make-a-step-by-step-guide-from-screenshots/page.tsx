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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Step-by-Step Guide Builder" },
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
            How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            A good how-to is a sequence of screenshots with one sentence under each. GoFully collects the screenshots as you go and exports the finished guide.
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
                Click <strong>Guide</strong> on the capture card, or choose <strong>Add to guide</strong> in the editor's Export menu. Open your guide from the list icon in the popup. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Build the guide
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Capture the first screen</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Take a screenshot as usual.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Add it to the guide</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Click Guide on the capture card, or Export, then Add to guide in the editor.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Repeat</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">A guide holds up to 30 steps.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Write captions</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Open the guide, name it and type a line under each step.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 5: Reorder or delete</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Use the arrows to move a step and the cross to remove it.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Export
              </h2>
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">PDF</h3>
                  <p className="text-[14px] text-neutral-600">One A4 PDF with each step headed, captioned and illustrated.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Markdown + images</h3>
                  <p className="text-[14px] text-neutral-600">A ZIP holding guide.md and one JPG per step, ready for a docs repo or wiki.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Where it lives
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">GoFully keeps the guide in your browser&apos;s local storage. Images are shrunk to fit, so thirty steps stay well inside the storage limit. Clear removes the guide.</p>
            </section>

            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Related Guides
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/screenshot-tool-for-developers-and-qa"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  QA &amp; Bug Report Workflow →
                </Link>
                <Link
                  href="/guides/how-to-save-webpage-as-pdf"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Save as PDF Guide →
                </Link>
              </div>
            </section>
          </BlueprintFrame>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-make-a-step-by-step-guide-from-screenshots" />

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
