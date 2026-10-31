import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Privacy-First Screenshot Tools" },
            ]}
          />
        </div>
      </div>

      <PageHeader
        title="Privacy-First Screenshot Tools: Why Offline Capture Matters"
        lede="Your screenshots contain more sensitive data than you think. Passwords, API keys, internal dashboards, customer PII, financial data — all visible in a single capture. Where that image goes next matters."
        meta={["By GoFully Security Team", "Published September 2026", "6 min read"]}
      />

      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            <section className="space-y-4">
              <h2>
                The Hidden Risk in Screenshot Extensions
              </h2>
              <p className="gf-p">
                Most popular screenshot extensions require you to create an account, upload your screenshots to their cloud, or both. This means every time you capture a page, a copy of your screen — including everything visible on it — potentially leaves your machine and lands on someone else&apos;s server.
              </p>
              <p className="gf-p">
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

            <section className="gf-sep">
              <h2>
                Cloud vs. Offline: What Actually Happens to Your Screenshots
              </h2>

              <div className="gf-vs">
                <div className="gf-tcard">
                  <h3>Cloud-Based Extensions</h3>
                  <ul className="gf-checks">
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-no-red flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Screenshots uploaded to external servers
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-no-red flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Account required — email and usage tracked
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-no-red flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      OCR and annotation processed server-side
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-no-red flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      Data retention policies vary and can change
                    </li>
                  </ul>
                </div>
                <div className="gf-tcard gf-tcard--accent">
                  <h3>Offline-First Extensions</h3>
                  <ul className="gf-checks">
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-yes flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      All processing happens in the browser tab
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-yes flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      No account, no tracking, no telemetry
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-yes flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      OCR runs via local WebAssembly — no server
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gf-yes flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                      Nothing to retain — data never leaves the device
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="gf-sep">
              <h2>
                How Popular Extensions Handle Your Data
              </h2>
              <div className="overflow-x-auto">
                <table className="gf-compare">
                  <thead>
                    <tr>
                      <th>Extension</th>
                      <th>Account Required</th>
                      <th>Cloud Upload</th>
                      <th>Works Offline</th>
                      <th>Local OCR</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr>
                      <td className="p-3 font-semibold">GoFully</td>
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

            <section className="gf-sep">
              <h2>
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
                      <h3 className="gf-h3">{item.title}</h3>
                      <p className="gf-small">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="gf-sep">
              <h2>
                How GoFully Handles Privacy
              </h2>
              <p className="gf-p">
                GoFully is built on a zero-upload architecture. Every feature — scroll capture, annotation, redaction, OCR text extraction, beautification, and PDF export — runs entirely within your browser tab using client-side JavaScript and WebAssembly. The extension declares only the minimum required Chrome permissions and makes no network requests during any operation.
              </p>
              <p className="gf-p">
                There is no account system, no cloud storage, no analytics SDK, and no telemetry. Your screenshots exist only in your browser&apos;s local memory until you choose to save or copy them. When you close the tab, they&apos;re gone — unless you explicitly downloaded them.
              </p>
              <p className="text-[14px] text-neutral-500">
                Read the full <Link href="/security" className="text-blue-600 underline">Security &amp; Privacy Policy</Link> or review the extension&apos;s permissions on the <a href={CWS_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline">Chrome Web Store listing</a>.
              </p>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="privacy-first-screenshot-tools" />

      <CtaBand
        title="Your screenshots should stay yours"
        sub="Free forever. No account. 100% offline."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
