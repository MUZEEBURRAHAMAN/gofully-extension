import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Auto-Redact Sensitive Info" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        eyebrow="New in v1.1.3"
        title="How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots"
        lede="Missing one email in a screenshot is how leaks happen. Auto-redact scans the whole image and boxes every match, and you check each box before you share."
        meta={["By GoFully Engineering", "October 2026", "4 min read"]}
      />

      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">
            <div className="gf-callout">
              <h2>
                New in GoFully v1.1.3
              </h2>
              <p>
                Open the <strong>Blur</strong> menu in the editor and choose <strong>Auto-redact sensitive info</strong>. Reading happens on your device with a bundled OCR engine. Nothing is uploaded. See the{" "}
                <Link href="/roadmap" className="underline font-semibold">
                  roadmap
                </Link>{" "}for the full v1.1.3 list.
              </p>
            </div>

            <section className="space-y-4">
              <h2>
                What it finds
              </h2>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Emails and phone numbers</h3>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Card numbers</h3>
                  <p className="gf-small">Only numbers that pass the Luhn check, so order numbers are left alone.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">ID numbers and IBANs</h3>
                  <p className="gf-small">US Social Security format and IBANs that pass the mod-97 check.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">IP addresses</h3>
                  <p className="gf-small">IPv4 addresses with valid ranges.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">API keys and tokens</h3>
                  <p className="gf-small">Common formats such as Stripe, GitHub and AWS keys.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                Step by step
              </h2>
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Capture the page</h3>
                  <p className="gf-small">Take any capture. It opens in the editor.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Run Auto-redact</h3>
                  <p className="gf-small">Open the Blur menu and choose Auto-redact sensitive info. GoFully shows how many items it covered.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Check every box</h3>
                  <p className="gf-small">Move, resize or delete any box you do not want. Add your own blur or blackout for anything it missed.</p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Export</h3>
                  <p className="gf-small">Undo with Cmd/Ctrl+Z removes all the boxes at once if you want to start again.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2>
                What it cannot do
              </h2>
              <p className="gf-p">Auto-redact finds text that OCR can read. Handwriting, very small type and text inside low-contrast images can slip through. Treat it as a first pass and look at the result before you share.</p>
            </section>

            <section className="gf-sep">
              <h2>Next steps</h2>
              <div className="gf-btn-row">
                <Link
                  href="/guides/how-to-blur-sensitive-info-in-screenshots"
                  className="gf-btn-p"
                >
                  Blur &amp; Redaction Guide →
                </Link>
                <Link
                  href="/guides/privacy-first-screenshot-tools"
                  className="gf-btn-s"
                >
                  Privacy-First Tools →
                </Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-auto-redact-sensitive-info" />

      <CtaBand
        title="Capture, mark up and share. Free and on your device."
        sub="No account, no watermark, no uploads."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
