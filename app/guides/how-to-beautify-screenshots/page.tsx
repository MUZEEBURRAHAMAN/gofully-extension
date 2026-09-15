import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "How to Beautify Screenshots for Social Media & Presentations (Free)",
  description:
    "Turn raw browser screenshots into polished, presentation-ready images with custom backgrounds, browser frames, padding, and shadows — no Photoshop or paid tools needed.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots" },
  openGraph: {
    title: "How to Beautify Screenshots for Social Media & Presentations",
    description:
      "Add gradient backgrounds, browser window frames, rounded corners, and drop shadows to any screenshot — free, in your browser.",
    url: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots",
    siteName: "GoFully",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Beautify Screenshots for Social Media and Presentations",
  description: "Step-by-step guide to transforming raw screenshots into polished images with backgrounds, frames, and effects.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      name: "Capture Your Screenshot",
      text: "Use GoFully to capture a full page, visible area, or selected region.",
      url: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots#capture",
    },
    {
      "@type": "HowToStep",
      name: "Open the Beautify Tab",
      text: "Click Edit in the result bar, then switch to the Beautify tab in the editor.",
      url: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots#beautify",
    },
    {
      "@type": "HowToStep",
      name: "Customize the Design",
      text: "Choose a background gradient, add a browser frame, adjust padding and corner radius, and apply a shadow.",
      url: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots#customize",
    },
    {
      "@type": "HowToStep",
      name: "Export the Polished Image",
      text: "Download as PNG, WebP, or JPG, or copy directly to clipboard.",
      url: "https://gofully-extension.vercel.app/guides/how-to-beautify-screenshots#export",
    },
  ],
};

export default function BeautifyScreenshotsGuide() {
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
              { label: "Beautify Screenshots" },
            ]}
          />
        </div>
      </div>

      <div className="text-center" style={{ padding: "40px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            How to Beautify Screenshots for Social Media &amp; Presentations
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Raw browser screenshots look like raw browser screenshots. Here&apos;s how to transform them into polished, share-ready images in seconds — without Photoshop, Figma, or a paid subscription to CleanShot.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Team</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Why Beautified Screenshots Matter
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                A raw screenshot of a product dashboard dropped into a pitch deck, blog post, or tweet looks unfinished. It screams &ldquo;I didn&apos;t care enough to make this look good.&rdquo; Beautified screenshots with backgrounds, frames, and shadows signal professionalism and draw attention to the content, not the browser chrome around it.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Without beautification</h3>
                  <ul className="text-[13px] text-neutral-500 space-y-1 list-disc pl-4">
                    <li>Bare browser toolbar and tabs visible</li>
                    <li>Hard edges with no padding</li>
                    <li>Flat, no depth or visual hierarchy</li>
                    <li>Looks like a dev screenshot, not a product image</li>
                  </ul>
                </div>
                <div className="border p-4" style={{ background: "rgba(22,103,242,.04)" }}>
                  <h3 className="font-semibold text-[15px] mb-1" style={{ color: "var(--gf-color-accent)" }}>With GoFully Beautify</h3>
                  <ul className="text-[13px] space-y-1 list-disc pl-4" style={{ color: "rgba(29,31,32,.6)" }}>
                    <li>Clean browser frame with your real URL</li>
                    <li>Custom gradient or solid background</li>
                    <li>Adjustable padding and rounded corners</li>
                    <li>Subtle drop shadow for depth</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="capture" className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Step-by-Step: From Raw to Polished in 4 Steps
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Capture Your Screenshot</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click the GoFully icon and choose your capture mode. For product screenshots and landing pages, <strong>Visible Area</strong> usually works best. For full documentation pages, use <strong>Full Page</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3" id="beautify">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Open the Beautify Tab</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      In the result bar, click <strong>Edit</strong> to open the visual editor. Then switch to the <strong>Beautify</strong> tab on the right panel. Your screenshot immediately previews with the default styling applied.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3" id="customize">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Customize the Look</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Fine-tune these controls to match your brand or content style:
                    </p>
                    <ul className="text-[14px] text-neutral-600 mt-2 space-y-1.5 list-disc pl-5">
                      <li><strong>Background</strong> — choose from preset gradients, solid colors, or custom hex values</li>
                      <li><strong>Browser frame</strong> — add a macOS-style window frame with your actual page URL and lock icon</li>
                      <li><strong>Padding</strong> — adjust the space between your screenshot and the background edge</li>
                      <li><strong>Corner radius</strong> — round the screenshot corners for a softer, more modern look</li>
                      <li><strong>Shadow</strong> — add a subtle drop shadow for depth and separation</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3" id="export">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-[15px]">Export &amp; Share</h3>
                    <p className="text-[14px] text-neutral-600 mt-1">
                      Click <strong>Copy</strong> to paste directly into Notion, Google Slides, or Twitter/X. Or download as PNG for the highest quality, WebP for smaller file sizes, or JPG with adjustable quality for blog posts.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                Use Cases for Beautified Screenshots
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Product Marketing</h3>
                  <p className="text-[13px] text-neutral-600">
                    Landing pages, Product Hunt launches, and investor decks. A gradient background with a browser frame makes your product look like it belongs in an App Store feature.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Blog Posts &amp; Documentation</h3>
                  <p className="text-[13px] text-neutral-600">
                    Tutorial screenshots with consistent styling. The browser frame adds context about what page the reader is looking at, and the background creates visual separation from your article text.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Social Media</h3>
                  <p className="text-[13px] text-neutral-600">
                    Twitter/X threads, LinkedIn posts, and Instagram carousels. Beautified screenshots stop the scroll — a raw browser window doesn&apos;t.
                  </p>
                </div>
                <div className="border p-4 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-1">Presentations</h3>
                  <p className="text-[13px] text-neutral-600">
                    Google Slides and Keynote decks. A shadowed screenshot on a gradient background matches your slide aesthetic without switching to Figma.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                GoFully vs. Paid Alternatives
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Tools like CleanShot X ($29 one-time), Screely (freemium with watermarks), and Shots.so (subscription) all offer screenshot beautification. GoFully includes the same core features — background gradients, browser frames, padding, corners, and shadows — built directly into the capture extension, completely free. No separate app, no watermark, no subscription.
              </p>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      <div className="text-center" style={{ background: "var(--gf-color-text)", padding: "56px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#fff", letterSpacing: "-0.01em" }}>
          Make every screenshot share-ready
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
