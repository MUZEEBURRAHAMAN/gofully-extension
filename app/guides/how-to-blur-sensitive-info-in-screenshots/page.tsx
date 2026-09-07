import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

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

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Guides", href: "/guides" },
  { label: "FAQ", href: "/faq" },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Blur or Redact Sensitive Information in Screenshots",
  description: "Step-by-step instructions for masking private data in screenshots safely.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      name: "Capture the Webpage or Window",
      text: "Use GoFully to take a full-page, visible area, or selected region screenshot.",
      url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots#capture",
    },
    {
      "@type": "HowToStep",
      name: "Select the Redaction Tool",
      text: "Click the 'Redact' icon in the GoFully annotation toolbar. Choose between Smooth Glass Blur, Mosaic Pixelation, or Solid Blackout.",
      url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots#select-tool",
    },
    {
      "@type": "HowToStep",
      name: "Drag Over Confidential Content",
      text: "Drag a box over confidential API tokens, customer names, credit card numbers, or passwords. The pixels are permanently altered in client-side memory.",
      url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots#drag-box",
    },
    {
      "@type": "HowToStep",
      name: "Export Clean Screenshot",
      text: "Copy to clipboard or download as PNG. The original sensitive data cannot be recovered.",
      url: "https://gofully-extension.vercel.app/guides/how-to-blur-sensitive-info-in-screenshots#export",
    },
  ],
};

export default function RedactScreenshotGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <BreadcrumbJsonLd name="How to Blur Screenshots Guide" path="/guides/how-to-blur-sensitive-info-in-screenshots" />
      <SiteNav links={NAV_LINKS} />

      {/* Header */}
      <div className="text-center" style={{ padding: "80px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/guides" className="inline-block border gf-heading-font font-semibold uppercase hover:underline" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
              ← All Guides
            </Link>
          </div>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            How to Blur or Redact Sensitive Information in Screenshots
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Sharing a bug report, documentation guide, or customer support ticket? Never leak API keys, auth tokens, email addresses, or internal metrics. Here is how to redact screenshots safely.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Security Team</span>
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

            {/* The Danger of Marker / Highlighter */}
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-none">
              <h2 className="gf-heading-font font-semibold text-[16px] text-rose-950 mb-2">
                ⚠️ Critical Warning: Do Not Use Translucent Digital Highlighters
              </h2>
              <p className="text-[14px] leading-relaxed text-rose-900">
                A common and dangerous mistake on iOS and Mac is scribbling over text with the default black digital highlighter or marker tool. Because digital highlighters have opacity levels (e.g., 85%), anyone who downloads your image can adjust brightness, contrast, and exposure to reveal the hidden text underneath in seconds.
              </p>
            </div>

            {/* The 3 Proper Redaction Methods */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                The 3 Safe Methods to Mask Information
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                To truly protect private information, the underlying pixel values must be mathematically rewritten or replaced before the image leaves your machine:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">1. Glass Blur</h3>
                  <p className="text-[13px] text-neutral-600">
                    Calculates a Gaussian or Box blur matrix over the bounding box. Retains the aesthetic layout of the page while rendering text completely illegible.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">2. Mosaic Pixelation</h3>
                  <p className="text-[13px] text-neutral-600">
                    Downsamples the selected region into chunky color blocks. This is the industry standard for developer logs, Jira tickets, and bug reports.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">3. Solid Blackout</h3>
                  <p className="text-[13px] text-neutral-600">
                    Replaces the entire bounding box with 100% opaque black pixels. Recommended for HIPAA, PCI-DSS compliance, credit cards, and master passwords.
                  </p>
                </div>
              </div>
            </section>

            {/* Step-by-Step with GoFully */}
            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step-by-Step: Redacting in Chrome in 10 Seconds
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Capture the Screen with GoFully</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click the GoFully extension icon and choose your capture mode (Full Page, Visible Area, or Selected Region).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Select the Redaction Tool</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      In the toolbar at the top of the editor, click the <strong>Redact</strong> button. Choose your style: Blur, Pixelate, or Blackout.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Draw Across Sensitive Fields</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click and drag over passwords, auth tokens, database credentials, or personal names. The blur is processed in local browser memory with zero cloud uploads.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Copy or Save</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click <strong>Copy to Clipboard</strong> (Ctrl+C / Cmd+C) to paste directly into Slack, Linear, or GitHub, or download as a high-resolution PNG.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Checklist */}
            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
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

          </BlueprintFrame>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Protect your team&apos;s data with GoFully
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          100% on-device capture, instant blur redaction, and local OCR. Never leak confidential details again.
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
