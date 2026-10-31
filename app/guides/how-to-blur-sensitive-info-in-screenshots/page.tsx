import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How to Blur Text & Redact Sensitive Info in Screenshots (2026)",
  description:
    "Learn how to properly blur, pixelate, or redact passwords, API keys, and customer data in screenshots before sharing. Avoid reversible highlighter mistakes.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots" },
  openGraph: {
    title: "How to Blur Text & Redact Sensitive Info in Screenshots (2026)",
    description:
      "A complete guide to masking confidential data in screenshots using blur, mosaic pixelation, and solid blackouts on Mac, Windows, and Chrome.",
    url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots#article",
  url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots",
  headline: "How to Blur or Redact Sensitive Information in Screenshots",
  description:
    "A complete technical guide to masking confidential data in screenshots using blur, mosaic pixelation, and solid blackouts on Mac, Windows, and Chrome.",
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

export default function RedactScreenshotGuidePage() {
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
              { label: "How to Blur & Redact Screenshots" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="How to Blur or Redact Sensitive Information in Screenshots"
        lede="Sharing a bug report, documentation guide, or customer support ticket? Never leak API keys, auth tokens, email addresses, or internal metrics. Here is how to redact screenshots safely."
        meta={["By GoFully Security Team", "Published September 2026", "4 min read"]}
      />

      {/* Article Body */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            {/* The Danger of Marker / Highlighter */}
            <div className="gf-callout gf-callout--danger">
              <h2>
                Critical warning: don’t hide text with a translucent highlighter
              </h2>
              <p>
                A common and dangerous mistake on iOS and Mac is scribbling over text with the default black digital highlighter or marker tool. Because digital highlighters have opacity levels (e.g., 85%), anyone who downloads your image can adjust brightness, contrast, and exposure to reveal the hidden text underneath in seconds.
              </p>
            </div>

            {/* The 3 Proper Redaction Methods */}
            <section className="space-y-4">
              <h2>
                The 3 Safe Methods to Mask Information
              </h2>
              <p className="gf-p">
                To truly protect private information, the underlying pixel values must be mathematically rewritten or replaced before the image leaves your machine:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">1. Glass Blur</h3>
                  <p className="gf-small">
                    Calculates a Gaussian or Box blur matrix over the bounding box. Retains the aesthetic layout of the page while rendering text completely illegible.
                  </p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">2. Mosaic Pixelation</h3>
                  <p className="gf-small">
                    Downsamples the selected region into chunky color blocks. This is the industry standard for developer logs, Jira tickets, and bug reports.
                  </p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">3. Solid Blackout</h3>
                  <p className="gf-small">
                    Replaces the entire bounding box with 100% opaque black pixels. Recommended for HIPAA, PCI-DSS compliance, credit cards, and master passwords.
                  </p>
                </div>
              </div>
            </section>

            {/* Step-by-Step with GoFully */}
            <section className="gf-sep">
              <h2>
                Step-by-Step: Redacting in Chrome in 10 Seconds
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="gf-num">1</div>
                  <div>
                    <h3 className="gf-h3">Capture the Screen with GoFully</h3>
                    <p className="gf-small">
                      Click the GoFully extension icon and choose your capture mode (Full Page, Visible Area, or Selected Region).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">2</div>
                  <div>
                    <h3 className="gf-h3">Select the Redaction Tool</h3>
                    <p className="gf-small">
                      In the toolbar at the top of the editor, click the <strong>Redact</strong> button. Choose your style: Blur, Pixelate, or Blackout.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">3</div>
                  <div>
                    <h3 className="gf-h3">Draw Across Sensitive Fields</h3>
                    <p className="gf-small">
                      Click and drag over passwords, auth tokens, database credentials, or personal names. The blur is processed in local browser memory with zero cloud uploads.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="gf-num">4</div>
                  <div>
                    <h3 className="gf-h3">Copy or Save</h3>
                    <p className="gf-small">
                      Click <strong>Copy to Clipboard</strong> (Ctrl+C / Cmd+C) to paste directly into Slack, Linear, or GitHub, or download as a high-resolution PNG.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Checklist */}
            <section className="gf-sep">
              <h2>
                Pre-Sharing Security Checklist
              </h2>
              <div className="space-y-2 text-[14px] text-neutral-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked disabled className="accent-blue-600" />
                  <span>API keys and Bearer tokens in headers or code snippets</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked disabled className="accent-blue-600" />
                  <span>Personally Identifiable Information (Full names, emails, phone numbers)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked disabled className="accent-blue-600" />
                  <span>Browser bookmark bar or open tabs revealing private projects</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked disabled className="accent-blue-600" />
                  <span>Internal staging URLs, IP addresses, or database connection strings</span>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="gf-badge gf-badge--blue">New in v1.1.3</div>
              <h2>
                Auto-redact finds the sensitive text for you
              </h2>
              <p className="gf-p">Open the Blur menu in the editor and choose Auto-redact sensitive info. GoFully reads the screenshot on your device and covers what it finds.</p>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">What it covers</h3>
                  <p className="gf-small">Emails, card numbers, phone numbers, ID numbers, IP addresses and API keys.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">You stay in control</h3>
                  <p className="gf-small">Each match gets a black box. Move or delete any box, then add your own blur for anything it missed.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Undo in one step</h3>
                  <p className="gf-small">Cmd/Ctrl+Z removes every auto-redact box at once.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Read the full walkthrough</h3>
                  <p className="gf-small">See How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots in the guides list.</p>
                </div>
              </div>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="how-to-blur-sensitive-info-in-screenshots" />

      {/* CTA */}
      <CtaBand
        title="Protect your team’s data with GoFully"
        sub="100% on-device capture, instant blur redaction, and local OCR. Never leak confidential details again."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
