import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "Best Screenshot Tool for Developers & QA Teams (2026)",
  description:
    "Why GoFully fits developer and QA bug-report workflows: full-page capture for long dashboards, one-click redaction for secrets, OCR for error text, and PDF export straight into your ticket.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa" },
  openGraph: {
    title: "Best Screenshot Tool for Developers & QA Teams (2026)",
    description:
      "Full-page capture, redaction, local OCR, and PDF export built for bug reports and QA tickets — free, on-device, no account.",
    url: "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa",
    siteName: "GoFully",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa#webpage",
  url: "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa",
  name: "Best Screenshot Tool for Developers & QA Teams",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  dateModified: "2026-09-08",
};

function StepRow({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">{n}</div>
      <div>
        <h3 className="font-semibold text-neutral-800 text-[15px]">{title}</h3>
        <p className="text-[14px] text-neutral-600 mt-1">{body}</p>
      </div>
    </div>
  );
}

function ReasonCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border p-4 bg-neutral-50/50">
      <h3 className="font-semibold text-neutral-800 mb-1">{title}</h3>
      <p className="text-neutral-600 text-[13.5px]">{body}</p>
    </div>
  );
}

export default function DevelopersQAGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <BreadcrumbJsonLd name="Screenshot Tool for Developers & QA" path="/guides/screenshot-tool-for-developers-and-qa" />
      <SiteNav />

      {/* Header */}
      <div className="text-center" style={{ padding: "80px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/guides" className="inline-block border gf-heading-font font-semibold uppercase hover:underline" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
              ← All Guides
            </Link>
          </div>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 12 }}>
            The Screenshot Workflow Built for Developers & QA
          </h1>
          <p className="mx-auto" style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}>
            A bug report is only as useful as the screenshot attached to it. Here&apos;s why full-page capture, redaction, OCR, and PDF export matter for the tickets you actually file.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Published September 2026</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            <div className="bg-blue-50/70 border border-blue-200/80 p-5">
              <h2 className="gf-heading-font font-semibold text-[16px] text-blue-900 mb-2">
                The problem with a normal screenshot in a bug report
              </h2>
              <p className="text-[14px] leading-relaxed text-blue-950">
                A plain <kbd className="bg-white border px-1.5 py-0.5 text-xs font-mono">PrtScn</kbd> or Cmd+Shift+4 only captures what&apos;s visible in the viewport. If the bug is in a long dashboard, a scrolling table, or a stack trace that runs off-screen, whoever reads the ticket doesn&apos;t see the whole picture — and now they&apos;re asking you to reproduce it and send a better one.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                What actually matters for a dev/QA screenshot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ReasonCard
                  title="Full-page capture, not just the viewport"
                  body="GoFully scrolls and stitches the entire page — long admin panels, infinite log views, and tables that run past the fold all come through in one image."
                />
                <ReasonCard
                  title="Annotate exactly what's broken"
                  body="Arrows, callouts, and step numbers point straight at the failing element instead of a paragraph explaining where to look."
                />
                <ReasonCard
                  title="Redact secrets before they hit a shared ticket"
                  body="Bearer tokens, API keys, staging URLs, and internal IPs show up in screenshots constantly. One-click blur or blackout removes them before the ticket goes to a shared tracker or a public GitHub issue."
                />
                <ReasonCard
                  title="Pull error text out with OCR instead of retyping it"
                  body="A stack trace or console error trapped in an image is useless for searching or pasting into Slack. Local OCR extracts the actual text in seconds — no cloud upload, since that trace might contain internal paths or tokens."
                />
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                A typical bug-report workflow with GoFully
              </h2>
              <div className="space-y-4 pt-2">
                <StepRow n={1} title="Capture the full page" body="Press Ctrl+Shift+F (Cmd+Shift+F on Mac) to grab the whole scrolling page — no manual scroll-and-stitch." />
                <StepRow n={2} title="Annotate the failing element" body="Drop an arrow or callout directly on the broken UI, or a step number if the bug needs a sequence of clicks to reproduce." />
                <StepRow n={3} title="Redact anything sensitive" body="Blur out auth tokens, internal URLs, or customer data visible in the capture before it goes anywhere." />
                <StepRow n={4} title="Extract error text if needed" body="Run OCR over a stack trace or console panel to get searchable, pasteable text instead of a screenshot of text." />
                <StepRow n={5} title="Export straight into the ticket" body="Copy to clipboard for Slack or Linear, or export a paginated PDF for a longer QA report — no dialogs, no account, no upload step." />
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-[var(--gf-color-text)]">
                Quick questions
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-neutral-800 text-[14.5px]">Does it work on localhost and internal/staging URLs?</h3>
                  <p className="text-[13.5px] text-neutral-600 mt-1">Yes — capture runs entirely in your browser tab, so it works on localhost, VPN-gated internal tools, and staging environments the same as any public page.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 text-[14.5px]">Will the OCR see my API keys or tokens if I don&apos;t redact them?</h3>
                  <p className="text-[13.5px] text-neutral-600 mt-1">OCR only runs on the region you select, and processing stays on your device — nothing is uploaded either way. Redact first if the capture might get shared further than you intend.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 text-[14.5px]">Can I attach the export directly to Jira, Linear, or GitHub Issues?</h3>
                  <p className="text-[13.5px] text-neutral-600 mt-1">Copy to clipboard pastes directly into any of those tools&apos; comment boxes. PNG and paginated PDF exports work the same as any file attachment.</p>
                </div>
              </div>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Better bug reports start with a better screenshot
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          Full-page capture, redaction, OCR, and PDF export — free, on-device, no account.
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
