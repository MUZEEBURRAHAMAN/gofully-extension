import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa#article",
  url: "https://gofully-extension.vercel.app/guides/screenshot-tool-for-developers-and-qa",
  headline: "The Screenshot Workflow Built for Developers & QA",
  description:
    "Why GoFully fits developer and QA bug-report workflows: full-page capture for long dashboards, one-click redaction for secrets, OCR for error text, and PDF export straight into your ticket.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
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

function StepRow({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="gf-num">{n}</div>
      <div>
        <h3 className="gf-h3">{title}</h3>
        <p className="gf-small">{body}</p>
      </div>
    </div>
  );
}

function ReasonCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="gf-tcard">
      <h3 className="gf-h3">{title}</h3>
      <p className="text-neutral-600 text-[13.5px]">{body}</p>
    </div>
  );
}

export default function DevelopersQAGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }} />
      <SiteNav />

      {/* Breadcrumbs */}
      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Screenshot Tool for Developers & QA" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="The Screenshot Workflow Built for Developers & QA"
        lede="A bug report is only as useful as the screenshot attached to it. Here’s why full-page capture, redaction, OCR, and PDF export matter for the tickets you actually file."
        meta={["By GoFully Engineering", "Published September 2026", "5 min read"]}
      />

      {/* Article Body */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            <div className="gf-callout">
              <h2>
                The problem with a normal screenshot in a bug report
              </h2>
              <p className="text-[14px] leading-relaxed text-blue-950">
                A plain <kbd>PrtScn</kbd> or Cmd+Shift+4 only captures what&apos;s visible in the viewport. If the bug is in a long dashboard, a scrolling table, or a stack trace that runs off-screen, whoever reads the ticket doesn&apos;t see the whole picture — and now they&apos;re asking you to reproduce it and send a better one.
              </p>
            </div>

            <section className="space-y-4">
              <h2>
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

            <section className="gf-sep">
              <h2>
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
              <h2>
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

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="screenshot-tool-for-developers-and-qa" />

      {/* CTA */}
      <CtaBand
        title="Better bug reports start with a better screenshot"
        sub="Full-page capture, redaction, OCR, and PDF export — free, on-device, no account."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
