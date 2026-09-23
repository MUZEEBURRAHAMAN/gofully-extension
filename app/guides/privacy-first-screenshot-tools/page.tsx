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
  title: "Privacy-First Screenshot Tools: Why Offline Capture Matters in 2026",
  description:
    "Most screenshot extensions upload your images to external servers. Learn why offline-first tools protect your data — and which Chrome extensions actually keep everything local.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/privacy-first-screenshot-tools" },
  openGraph: {
    title: "Privacy-First Screenshot Tools: Why Offline Capture Matters",
    description:
      "Your screenshots contain passwords, API keys, internal dashboards, and customer data. Here's why the tool you use to capture them matters.",
    url: "https://gofully-extension.vercel.app/guides/privacy-first-screenshot-tools",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Privacy-First Screenshot Tools: Why Offline Capture Matters in 2026",
  description: "An analysis of screenshot extension privacy practices and why offline-first architecture protects sensitive data.",
  author: { "@type": "Organization", name: "GoFully" },
  publisher: { "@type": "Organization", name: "GoFully" },
  datePublished: "2026-09-15",
  dateModified: "2026-09-15",
  url: "https://gofully-extension.vercel.app/guides/privacy-first-screenshot-tools",
};

export default function PrivacyFirstScreenshotToolsGuide() {
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
              { label: "Privacy-First Screenshot Tools" },
            ]}
          />
        </div>
      </div>

      <div className="text-center" style={{ padding: "40px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            Privacy-First Screenshot Tools: Why Offline Capture Matters
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            Your screenshots contain more sensitive data than you think. Passwords, API keys, internal dashboards, customer PII, financial data — all visible in a single capture. Where that image goes next matters.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Security Team</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                The Hidden Risk in Screenshot Extensions
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Most popular screenshot extensions require you to create an account, upload your screenshots to their cloud, or both. This means every time you capture a page, a copy of your screen — including everything visible on it — potentially leaves your machine and lands on someone else&apos;s server.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                For a personal blog post, that&apos;s probably fine. But for these everyday scenarios, it&apos;s a real risk:
              </p>
              <ul className="space-y-2 text-[14px] text-neutral-600 list-disc pl-5">
                <li><strong>Bug reports with dev tools open</strong> — console logs often contain auth tokens, session IDs, and API responses with customer data</li>
                <li><strong>Admin dashboard screenshots</strong> — revenue figures, user counts, internal metrics visible in the capture</li>
                <li><strong>Support ticket documentation</strong> — customer names, email addresses, account numbers shown on screen</li>
                <li><strong>Code review screenshots</strong> — environment variables, database connection strings, API keys in config files</li>
                <li><strong>Medical or legal portals</strong> — HIPAA-covered patient data or attorney-client privileged information</li>
              </ul>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Cloud vs. Offline: What Actually Happens to Your Screenshots
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px border" style={{ background: "rgba(29,31,32,.1)", borderColor: "rgba(29,31,32,.1)" }}>
                <div className="bg-white p-5">
                  <h3 className="font-semibold text-neutral-800 text-[15px] mb-3">Cloud-Based Extensions</h3>
                  <ul className="space-y-2 text-[13.5px] text-neutral-500">
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Screenshots uploaded to external servers
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Account required — email and usage tracked
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      OCR and annotation processed server-side
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Data retention policies vary and can change
                    </li>
                  </ul>
                </div>
                <div className="p-5" style={{ background: "rgba(22,103,242,.03)" }}>
                  <h3 className="font-semibold text-[15px] mb-3" style={{ color: "var(--gf-color-accent)" }}>Offline-First Extensions</h3>
                  <ul className="space-y-2 text-[13.5px]" style={{ color: "rgba(29,31,32,.6)" }}>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      All processing happens in the browser tab
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      No account, no tracking, no telemetry
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      OCR runs via local WebAssembly — no server
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      Nothing to retain — data never leaves the device
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                How Popular Extensions Handle Your Data
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Extension</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Account Required</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Cloud Upload</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Works Offline</th>
                      <th className="text-center p-3 border-b-2 border-neutral-200 font-semibold text-neutral-500" style={{ fontSize: 12 }}>Local OCR</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr style={{ background: "rgba(22,103,242,.04)" }}>
                      <td className="p-3 font-semibold" style={{ color: "var(--gf-color-accent)" }}>GoFully</td>
                      <td className="p-3 text-center font-medium text-green-600">No</td>
                      <td className="p-3 text-center font-medium text-green-600">Never</td>
                      <td className="p-3 text-center font-medium text-green-600">Yes</td>
                      <td className="p-3 text-center font-medium text-green-600">Yes (WASM)</td>
                    </tr>
                    <tr className="border-b border-neutral-100">
                      <td className="p-3 font-medium">GoFullPage</td>
                      <td className="p-3 text-center text-green-600">No</td>
                      <td className="p-3 text-center text-green-600">No</td>
                      <td className="p-3 text-center text-green-600">Yes</td>
                      <td className="p-3 text-center text-neutral-400">N/A</td>
                    </tr>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td className="p-3 font-medium">Awesome Screenshot</td>
                      <td className="p-3 text-center text-red-500">Yes</td>
                      <td className="p-3 text-center text-red-500">By default</td>
                      <td className="p-3 text-center text-red-500">No</td>
                      <td className="p-3 text-center text-neutral-400">No</td>
                    </tr>
                    <tr className="border-b border-neutral-100">
                      <td className="p-3 font-medium">Nimbus</td>
                      <td className="p-3 text-center text-red-500">Yes</td>
                      <td className="p-3 text-center text-red-500">By default</td>
                      <td className="p-3 text-center text-red-500">No</td>
                      <td className="p-3 text-center text-neutral-400">No</td>
                    </tr>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td className="p-3 font-medium">FireShot</td>
                      <td className="p-3 text-center text-green-600">No</td>
                      <td className="p-3 text-center text-green-600">No</td>
                      <td className="p-3 text-center text-green-600">Yes</td>
                      <td className="p-3 text-center text-neutral-400">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[12.5px] text-neutral-400">
                Based on Chrome Web Store listings and published privacy policies as of September 2026.
              </p>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                What to Look for in a Privacy-Respecting Screenshot Tool
              </h2>
              <div className="space-y-3">
                {[
                  { title: "No account required", desc: "If an extension asks you to sign up before you can take a screenshot, your usage is being tracked. An extension that works immediately after install has no reason to know who you are." },
                  { title: "No network requests during capture", desc: "Open Chrome DevTools (Network tab) while using the extension. A privacy-first tool should make zero HTTP requests during the capture and editing process." },
                  { title: "Local-only OCR", desc: "If the extension offers text extraction (OCR), check whether it ships a local model (like Tesseract.js via WebAssembly) or sends your image to a server for processing. The difference matters when your screenshot contains confidential text." },
                  { title: "No cloud storage defaults", desc: "Some extensions save screenshots to their cloud by default and offer local download as an option. Look for tools where local storage is the default and only behavior." },
                  { title: "Transparent permissions", desc: "Check the extension's Chrome Web Store listing for its declared permissions. A screenshot tool needs 'activeTab' and possibly 'storage' — not 'identity', 'webRequest', or access to all URLs." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5" /></svg>
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-[15px]">{item.title}</h3>
                      <p className="text-[14px] text-neutral-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[22px] text-[var(--gf-color-text)]">
                How GoFully Handles Privacy
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                GoFully is built on a zero-upload architecture. Every feature — scroll capture, annotation, redaction, OCR text extraction, beautification, and PDF export — runs entirely within your browser tab using client-side JavaScript and WebAssembly. The extension declares only the minimum required Chrome permissions and makes no network requests during any operation.
              </p>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                There is no account system, no cloud storage, no analytics SDK, and no telemetry. Your screenshots exist only in your browser&apos;s local memory until you choose to save or copy them. When you close the tab, they&apos;re gone — unless you explicitly downloaded them.
              </p>
              <p className="text-[14px] text-neutral-500">
                Read the full <Link href="/security" className="text-blue-600 underline">Security &amp; Privacy Policy</Link> or review the extension&apos;s permissions on the <a href={CWS_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline">Chrome Web Store listing</a>.
              </p>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      <RelatedGuides currentSlug="privacy-first-screenshot-tools" />

      <div className="text-center" style={{ background: "var(--gf-color-text)", padding: "56px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#fff", letterSpacing: "-0.01em" }}>
          Your screenshots should stay yours
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 10 }}>
          Free forever. No account. 100% offline.
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
