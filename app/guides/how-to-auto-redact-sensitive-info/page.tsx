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
  title: "How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots",
  description: "GoFully's Auto-redact reads your screenshot on your device and covers emails, card numbers, phone numbers, ID numbers, IP addresses and API keys with black boxes you review before export.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-auto-redact-sensitive-info" },
  openGraph: {
    title: "How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots \u2014 GoFully",
    description: "GoFully's Auto-redact reads your screenshot on your device and covers emails, card numbers, phone numbers, ID numbers, IP addresses and API keys with black boxes you review before export.",
    url: "https://gofully-extension.vercel.app/guides/how-to-auto-redact-sensitive-info",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-auto-redact-sensitive-info#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-auto-redact-sensitive-info",
  headline: "How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots",
  description: "GoFully's Auto-redact reads your screenshot on your device and covers emails, card numbers, phone numbers, ID numbers, IP addresses and API keys with black boxes you review before export.",
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

export default function AutoRedactSensitiveInfoGuidePage() {
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
              { label: "Auto-Redact Sensitive Info" },
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
            How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Missing one email in a screenshot is how leaks happen. Auto-redact scans the whole image and boxes every match, and you check each box before you share.
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
                Open the <strong>Blur</strong> menu in the editor and choose <strong>Auto-redact sensitive info</strong>. Reading happens on your device with a bundled OCR engine. Nothing is uploaded. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                What it finds
              </h2>
              <div className="space-y-3 pt-2">
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Emails and phone numbers</h3>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Card numbers</h3>
                  <p className="text-[14px] text-neutral-600">Only numbers that pass the Luhn check, so order numbers are left alone.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">ID numbers and IBANs</h3>
                  <p className="text-[14px] text-neutral-600">US Social Security format and IBANs that pass the mod-97 check.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">IP addresses</h3>
                  <p className="text-[14px] text-neutral-600">IPv4 addresses with valid ranges.</p>
                </div>
                <div className="border border-neutral-200 p-4 bg-neutral-50/50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">API keys and tokens</h3>
                  <p className="text-[14px] text-neutral-600">Common formats such as Stripe, GitHub and AWS keys.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step by step
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 1: Capture the page</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Take any capture. It opens in the editor.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 2: Run Auto-redact</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Open the Blur menu and choose Auto-redact sensitive info. GoFully shows how many items it covered.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 3: Check every box</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Move, resize or delete any box you do not want. Add your own blur or blackout for anything it missed.</p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">Step 4: Export</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">Undo with Cmd/Ctrl+Z removes all the boxes at once if you want to start again.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                What it cannot do
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">Auto-redact finds text that OCR can read. Handwriting, very small type and text inside low-contrast images can slip through. Treat it as a first pass and look at the result before you share.</p>
            </section>

            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Related Guides
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/how-to-blur-sensitive-info-in-screenshots"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Blur &amp; Redaction Guide →
                </Link>
                <Link
                  href="/guides/privacy-first-screenshot-tools"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Privacy-First Tools →
                </Link>
              </div>
            </section>
          </BlueprintFrame>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-auto-redact-sensitive-info" />

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
