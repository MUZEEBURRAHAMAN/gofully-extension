"use client";

import { BlueprintFrame } from "@/components/blueprint-frame";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";
const ALTERNATIVETO_URL =
  "https://alternativeto.net/software/gofully/about/?utm_source=badge&utm_medium=referral";
const DOFOLLOW_TOOLS_URL = "https://dofollow.tools";
const UFIND_URL = "https://ufind.best/products/gofully";
const SAASFAME_URL = "https://saasfame.com/item/gofully";

const STEPS = [
  {
    n: 1,
    title: "CAPTURE THE PAGE",
    body: "Pick full page, visible area, a custom region, or a scrolling feed. GoFully stitches it into one clean image.",
    image: "/features/capture.webp",
    alt: "GoFully capture options showing full page, visible area, and scrolling area",
  },
  {
    n: 2,
    title: "ANNOTATE & REDACT",
    body: "Call out what matters with arrows, shapes, and text. Blur anything sensitive before it ships.",
    image: "/features/annotate.webp",
    alt: "GoFully annotation editor with redact, blur, and markup tools",
  },
  {
    n: 3,
    title: "EXPORT INSTANTLY",
    body: "Copy to clipboard, save as PNG, or export a PDF — straight from the result bar, no dialogs.",
    image: "/features/export.webp",
    alt: "GoFully result options with copy, PNG, WebP, PDF, and edit",
  },
];

const FEATURES = [
  {
    tag: "Capture Engine",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Full-page scrolling capture",
    body: "Seamlessly capture full-height websites, dashboards, and infinite feeds. GoFully scrolls the page, waits for lazy-loaded content, and stitches a pixel-perfect canvas with zero overlap.",
    image: "/features/feature-capture.webp",
    alt: "Full-page scrolling capture showing clean capture of a long webpage",
    reverse: false,
  },
  {
    tag: "Local OCR",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
        <path d="M8 9h8M12 9v7" />
      </svg>
    ),
    title: "On-device text extraction",
    body: "Extract readable text, code snippets, and structured tables from any region in milliseconds. Most screenshot tools that offer OCR send your image to a server first — GoFully runs a local WebAssembly model directly on your CPU, so a screenshot of a contract, a password field, or an internal dashboard never leaves your machine to get its text read.",
    image: "/features/feature-ocr.webp",
    alt: "On-device OCR text extraction with instant copy",
    reverse: true,
  },
  {
    tag: "Visual Editor",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    title: "Annotate & redact",
    body: "Mark up screenshots with arrows, callouts, and shapes. Instantly blur or pixelate sensitive API keys, passwords, and PII before you share — the kind of redaction most competitors either don't offer at all, or lock behind a paid plan.",
    image: "/features/feature-annotate.webp",
    alt: "Annotated screenshot showing markup, callouts, and redaction tools in GoFully editor",
    reverse: false,
  },
  {
    tag: "Beautify",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </svg>
    ),
    title: "Screenshot beautifier & mockups",
    body: "Transform raw screenshots into polished, presentation-ready assets. Customize vibrant backgrounds, add window frames, tweak padding and rounded corners, and apply soft drop shadows — the same kind of output tools like CleanShot charge a subscription for, included free.",
    image: "/features/feature-beautify.webp",
    alt: "GoFully screenshot beautifier with customizable backgrounds, padding, shadows, and frame mockups",
    reverse: true,
  },
  {
    tag: "Export",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: "Flexible export",
    body: "Generate a paginated PDF, download a crisp PNG or WebP, or copy straight to your clipboard — all from the result bar, right after you capture.",
    image: "/features/feature-export.webp",
    alt: "GoFully result bar with copy, PNG, WebP, and PDF export options",
    reverse: false,
  },
  {
    tag: "Capture History",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
    title: "Every capture, saved automatically",
    body: "GoFully keeps a rolling history of your recent screenshots right in the popup — thumbnail, site, and timestamp — so you can reopen, re-edit, or re-export a past capture in one click. Like everything else in GoFully, that history lives only in your browser's own local storage: nothing is uploaded, and Clear All wipes it instantly.",
    image: "/features/feature-history.webp",
    alt: "GoFully popup history screen showing recent screenshot thumbnails with site and timestamp",
    reverse: true,
  },
];

function Kicker({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border gf-heading-font font-semibold uppercase"
      style={{
        borderColor: "rgba(22,103,242,.25)",
        background: "rgba(22,103,242,.06)",
        color: "var(--gf-color-accent)",
        fontSize: "10.5px",
        letterSpacing: "0.06em",
        padding: "6px 14px",
      }}
    >
      {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

function SectionKicker({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border gf-heading-font font-semibold uppercase"
      style={{
        borderColor: "rgba(29,31,32,.15)",
        color: "rgba(29,31,32,.45)",
        fontSize: "10.5px",
        letterSpacing: "0.06em",
        padding: "5px 12px",
      }}
    >
      {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

function CTAButton({
  href,
  children,
  dark,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative inline-flex items-center justify-center gap-2 border gf-heading-font font-semibold cursor-pointer"
      style={{
        height: 48,
        padding: "0 26px",
        background: "var(--gf-color-accent)",
        color: "#fff",
        fontSize: 14,
        letterSpacing: "0.02em",
        borderColor: "rgba(29,31,32,.12)",
      }}
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5">
        <span className="absolute left-1 top-0 w-px h-full bg-white/40" />
        <span className="absolute top-1 left-0 w-full h-px bg-white/40" />
      </span>
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
        <span className="absolute right-1 top-0 w-px h-full bg-white/40" />
        <span className="absolute top-1 left-0 w-full h-px bg-white/40" />
      </span>
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5">
        <span className="absolute left-1 top-0 w-px h-full bg-white/40" />
        <span className="absolute bottom-1 left-0 w-full h-px bg-white/40" />
      </span>
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5">
        <span className="absolute right-1 top-0 w-px h-full bg-white/40" />
        <span className="absolute bottom-1 left-0 w-full h-px bg-white/40" />
      </span>
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      {/* Hero */}
      <ContainerScroll
        titleComponent={
          <div className="mx-auto" style={{ maxWidth: 720 }}>
            <Kicker
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
            >
              Chrome Extension · 100% On-Device
            </Kicker>
            <h1
              className="gf-heading-font font-semibold"
              style={{ fontSize: "clamp(34px, 7vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.02em", marginTop: 24, color: "var(--gf-color-text)" }}
            >
              One Extension.
              <br />
              Every Screenshot Job.
            </h1>
            <p className="mx-auto" style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(29,31,32,.6)", maxWidth: 600, marginTop: 20 }}>
              Capture full scrolling pages or any region, extract text with local WebAssembly OCR, annotate and redact sensitive info, then beautify and export in 4K or PDF — all in one browser extension, 100% free and offline.
            </p>
            <div className="flex justify-center gap-3.5" style={{ marginTop: 32 }}>
              <CTAButton href={CWS_URL}>Add to Chrome — It&apos;s Free</CTAButton>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center border gf-heading-font font-semibold cursor-pointer"
                style={{ height: 48, padding: "0 22px", borderColor: "rgba(29,31,32,.15)", color: "rgba(29,31,32,.6)", fontSize: 14, letterSpacing: "0.02em" }}
              >
                See how it works ↓
              </a>
            </div>
            <div style={{ fontSize: 12, color: "rgba(29,31,32,.35)", marginTop: 20 }}>
              Free forever &nbsp;·&nbsp; No account required &nbsp;·&nbsp; 100% offline
            </div>
          </div>
        }
      >
        {/* Hero tab mockup */}
        <img
          src="/features/hero_cover.webp"
          alt="GoFully Screenshot Beautifier interface with full annotation and styling tools"
          className="mx-auto object-contain h-full w-full object-center"
          draggable={false}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </ContainerScroll>

      {/* Social proof bar */}
      <div className="border-t border-b" style={{ borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.015)" }}>
        <div
          className="mx-auto flex flex-wrap items-center justify-center"
          style={{ maxWidth: 1320, padding: "18px 24px", gap: "8px 32px" }}
        >
          {/* CWS rating */}
          <a
            href={CWS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2"
            style={{ color: "rgba(29,31,32,.55)", fontSize: 13 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <circle cx="12" cy="12" r="11" fill="#4285F4" />
              <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 2.32a2.72 2.72 0 0 1 2.56 1.77H9.44A2.72 2.72 0 0 1 12 4.82z" fill="#EA4335" opacity="0.85" />
              <path d="M4.14 14.73a9.48 9.48 0 0 0 3.7 5.27l2.6-4.5a2.72 2.72 0 0 1-1.27-3.03H4.03a9.5 9.5 0 0 0 .11 2.26z" fill="#FBBC05" opacity="0.85" />
              <path d="M16.16 20a9.48 9.48 0 0 0 3.7-5.27 9.5 9.5 0 0 0 .11-2.26h-5.14a2.72 2.72 0 0 1-1.27 3.03L16.16 20z" fill="#34A853" opacity="0.85" />
            </svg>
            <span className="flex items-center gap-1">
              <span className="flex items-center" style={{ gap: 1 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= 5 ? "#F59E0B" : "none"} stroke={s <= 5 ? "#F59E0B" : "rgba(29,31,32,.2)"} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </span>
              <span className="font-medium" style={{ color: "rgba(29,31,32,.7)" }}>5.0</span>
            </span>
            <span>on Chrome Web Store</span>
          </a>

          <span style={{ width: 1, height: 16, background: "rgba(29,31,32,.1)" }} className="hidden sm:block" />

          {/* Trust signals */}
          {[
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
              text: "No data collection",
            },
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>,
              text: "Free forever",
            },
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
              text: "100% offline",
            },
          ].map((s) => (
            <span key={s.text} className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, color: "rgba(29,31,32,.45)" }}>
              {s.icon}
              {s.text}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="border-t" style={{ padding: "80px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 52 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h9" />
                <polyline points="16 15 19 18 16 21" />
              </svg>
            }
          >
            How It Works
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            From capture to shareable image in three steps
          </h2>
        </div>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-7" style={{ maxWidth: 1320 }}>
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
                <div
                  className="flex items-center justify-center flex-shrink-0 gf-heading-font font-bold"
                  style={{ width: 26, height: 26, background: "var(--gf-color-accent)", color: "#fff", fontSize: 12 }}
                >
                  {s.n}
                </div>
                <h3 className="gf-heading-font font-semibold" style={{ fontSize: 16, letterSpacing: "0.01em" }}>
                  {s.title}
                </h3>
              </div>
              <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(29,31,32,.5)", margin: "0 0 14px" }}>{s.body}</p>
              <BlueprintFrame className="p-2">
                <img
                  src={s.image}
                  alt={s.alt}
                  className="w-full block object-cover"
                  style={{ aspectRatio: "3/2" }}
                  loading="lazy"
                  decoding="async"
                />
              </BlueprintFrame>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="border-t" style={{ padding: "90px 24px", borderColor: "rgba(29,31,32,.08)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 64 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
              </svg>
            }
          >
            Core Features
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Everything you need to capture, clean up, and share
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            Five tools that cover the whole workflow — from first capture to final export.
          </p>
        </div>

        <div className="mx-auto flex flex-col" style={{ gap: 64, maxWidth: 1320 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="grid grid-cols-1 md:grid-cols-2 items-center" style={{ gap: 56 }}>
              <div className={f.reverse ? "md:order-2" : ""}>
                <Kicker icon={f.icon}>{f.tag}</Kicker>
                <h3 className="gf-heading-font font-semibold" style={{ fontSize: 26, letterSpacing: "-0.005em", marginTop: 14 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(29,31,32,.5)", marginTop: 12, maxWidth: 440 }}>{f.body}</p>
              </div>
              <BlueprintFrame className={`p-2.5 ${f.reverse ? "md:order-1" : ""}`}>
                <img
                  src={f.image}
                  alt={f.alt}
                  className="w-full block object-cover"
                  style={{ aspectRatio: "3/2" }}
                  loading="lazy"
                  decoding="async"
                />
              </BlueprintFrame>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="border-t" style={{ padding: "90px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 56 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          >
            Use Cases
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Built for how you actually work
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            One tool, four very different jobs.
          </p>
        </div>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ maxWidth: 1000 }}>
          {[
            {
              title: "Developers & QA",
              body: "Document a bug with a full-page capture, annotate exactly what's broken, and export a clean PDF for the ticket — no cropping five separate screenshots together.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
            },
            {
              title: "Writers & researchers",
              body: "Pull text out of a paywalled article screenshot, a scanned PDF page, or a chart nobody made selectable, and paste it straight into your notes.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
            },
            {
              title: "Privacy & compliance teams",
              body: "Redact account numbers, names, or internal URLs before a screenshot goes into a shared doc or a support ticket — done locally, so the unredacted version never touches a server in the first place.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
            },
            {
              title: "Anyone sharing screenshots publicly",
              body: "Run a raw capture through Beautify before it goes on social media or in a blog post, instead of pasting a bare browser window.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              ),
            },
          ].map((u) => (
            <BlueprintFrame key={u.title} className="bg-white p-7">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: "rgba(22,103,242,.08)", border: "1px solid rgba(22,103,242,.2)", marginBottom: 16 }}>
                {u.icon}
              </div>
              <h3 className="gf-heading-font font-semibold" style={{ fontSize: 17, letterSpacing: "-0.005em" }}>
                {u.title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(29,31,32,.55)", marginTop: 10 }}>
                {u.body}
              </p>
            </BlueprintFrame>
          ))}
        </div>
      </div>

      {/* Differentiation */}
      <div className="border-t" style={{ padding: "90px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 44 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          >
            Why GoFully
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Why not just use Chrome&apos;s built-in screenshot tool?
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            DevTools works, right up until it doesn&apos;t.
          </p>
        </div>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-px border" style={{ background: "rgba(29,31,32,.12)", borderColor: "rgba(29,31,32,.12)", maxWidth: 900 }}>
          <div className="bg-white p-7 md:p-8">
            <div className="gf-heading-font font-semibold uppercase" style={{ fontSize: 12, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)", marginBottom: 18 }}>
              Chrome DevTools
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "Skips images that load on scroll — they show up blank",
                "Ignores sticky headers, so they repeat down the page",
                "Exports a flat PNG and nothing else",
                "No text extraction, redaction, or annotation, at all",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.5)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-7 md:p-8" style={{ background: "rgba(22,103,242,.03)" }}>
            <div className="gf-heading-font font-semibold uppercase" style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--gf-color-accent)", marginBottom: 18 }}>
              GoFully
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "Waits for lazy-loaded content before it captures",
                "Auto-detects and hides repeating sticky elements",
                "Exports PNG, WebP, or a paginated PDF",
                "Local OCR, one-click redaction, and full annotation built in",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.7)", fontWeight: 500 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]"><path d="M20 6 9 17l-5-5" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Competitor comparison table */}
      <div className="border-t" style={{ padding: "90px 24px", borderColor: "rgba(29,31,32,.08)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 48 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
              </svg>
            }
          >
            Comparison
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            How GoFully stacks up
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            Feature-for-feature against the most popular screenshot extensions.
          </p>
        </div>
        <div className="mx-auto overflow-x-auto" style={{ maxWidth: 1000 }}>
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                <th className="text-left gf-heading-font font-semibold" style={{ padding: "12px 16px", borderBottom: "2px solid rgba(29,31,32,.1)", color: "rgba(29,31,32,.5)", fontSize: 12, letterSpacing: "0.03em" }}>
                  Feature
                </th>
                {["GoFully", "GoFullPage", "Awesome Screenshot", "FireShot"].map((name) => (
                  <th key={name} className="text-center gf-heading-font font-semibold" style={{
                    padding: "12px 14px",
                    borderBottom: "2px solid rgba(29,31,32,.1)",
                    fontSize: 12,
                    letterSpacing: "0.02em",
                    color: name === "GoFully" ? "var(--gf-color-accent)" : "rgba(29,31,32,.5)",
                    background: name === "GoFully" ? "rgba(22,103,242,.04)" : undefined,
                  }}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feat: "Full-page scroll capture", vals: [true, true, true, true] },
                { feat: "Selected region capture", vals: [true, false, true, false] },
                { feat: "Scrolling area capture", vals: [true, false, false, false] },
                { feat: "On-device OCR", vals: [true, false, false, false] },
                { feat: "Annotation & markup", vals: [true, false, true, false] },
                { feat: "Privacy redaction (blur/pixelate)", vals: [true, false, "Paid", false] },
                { feat: "Screenshot beautifier", vals: [true, false, false, false] },
                { feat: "PDF export", vals: [true, false, "Paid", true] },
                { feat: "JPG / WebP export", vals: [true, false, false, false] },
                { feat: "Screenshot history", vals: [true, false, true, false] },
                { feat: "No account required", vals: [true, true, false, true] },
                { feat: "100% free (no paid tier)", vals: [true, true, false, false] },
                { feat: "Works offline", vals: [true, true, false, true] },
              ].map((row, i) => (
                <tr key={row.feat} style={{ background: i % 2 === 0 ? "rgba(29,31,32,.015)" : undefined }}>
                  <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(29,31,32,.06)", color: "rgba(29,31,32,.7)", fontWeight: 500 }}>
                    {row.feat}
                  </td>
                  {row.vals.map((v, j) => (
                    <td key={j} className="text-center" style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(29,31,32,.06)",
                      background: j === 0 ? "rgba(22,103,242,.04)" : undefined,
                    }}>
                      {v === true ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={j === 0 ? "var(--gf-color-accent)" : "#22c55e"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M20 6 9 17l-5-5" /></svg>
                      ) : v === false ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(29,31,32,.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M5 12h14" /></svg>
                      ) : (
                        <span style={{ fontSize: 11.5, color: "rgba(29,31,32,.4)", fontWeight: 500 }}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto text-center" style={{ maxWidth: 600, marginTop: 20, fontSize: 12, color: "rgba(29,31,32,.35)" }}>
          Comparison based on free tiers as of September 2026. See the{" "}
          <a href="/guides/best-full-page-screenshot-extensions" style={{ color: "var(--gf-color-accent)", textDecoration: "underline" }}>
            full comparison guide
          </a>{" "}
          for details.
        </p>
      </div>

      {/* User reviews */}
      <div className="border-t" style={{ padding: "90px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 48 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          >
            Reviews
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            What users are saying
          </h2>
        </div>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ maxWidth: 1000 }}>
          {[
            {
              quote: "By far the best screenshot extension I've used. The OCR feature alone is worth it — I can pull text from any image without leaving the browser.",
              author: "Web Developer",
              stars: 5,
            },
            {
              quote: "Finally an extension that captures the full page without breaking lazy-loaded images. The beautifier makes my blog screenshots look professional.",
              author: "Content Creator",
              stars: 5,
            },
            {
              quote: "The privacy redaction is a game-changer for our QA team. We blur client data before attaching screenshots to tickets — no more manual editing in Photoshop.",
              author: "QA Engineer",
              stars: 5,
            },
          ].map((r) => (
            <BlueprintFrame key={r.author} className="bg-white p-6">
              <div className="flex items-center gap-0.5" style={{ marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.stars ? "#F59E0B" : "none"} stroke={s <= r.stars ? "#F59E0B" : "rgba(29,31,32,.15)"} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(29,31,32,.6)", marginBottom: 14 }}>
                &ldquo;{r.quote}&rdquo;
              </p>
              <div className="gf-heading-font font-medium" style={{ fontSize: 12, color: "rgba(29,31,32,.4)" }}>
                — {r.author}
              </div>
            </BlueprintFrame>
          ))}
        </div>
      </div>

      {/* Final CTA band */}
      <div className="text-center" style={{ background: "var(--gf-color-text)", padding: "90px 24px" }}>
        <span
          className="inline-flex items-center gap-1.5 border gf-heading-font font-semibold uppercase"
          style={{ borderColor: "rgba(255,255,255,.2)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.7)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>100% Offline</span>
        </span>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", color: "#fff", letterSpacing: "-0.01em", marginTop: 20 }}>
          Stop juggling three extensions for one job
        </h2>
        <p className="mx-auto" style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 560, marginTop: 14, lineHeight: 1.6 }}>
          Capture, annotate, redact, extract text, beautify, and export — all in one extension that never touches a server. No account, no subscription, no catch.
        </p>
        <div style={{ marginTop: 32 }}>
          <CTAButton href={CWS_URL}>Add to Chrome — It&apos;s Free</CTAButton>
        </div>
        <div className="flex flex-wrap items-center justify-center" style={{ gap: "6px 20px", marginTop: 22, fontSize: 12, color: "rgba(255,255,255,.35)" }}>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            2-second install
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Works immediately
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Remove anytime
          </span>
        </div>
      </div>

      {/* Featured On Badges */}
      <section className="border-t" style={{ padding: "64px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 840 }}>
          <SectionKicker
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            }
          >
            Directories & Recognition
          </SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(22px, 4vw, 28px)", letterSpacing: "-0.01em", marginTop: 14 }}>
            Featured On
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(29,31,32,.55)", marginTop: 8, marginBottom: 32 }}>
            GoFully is recognized across software directories and developer tools platforms.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <a
              href={DOFOLLOW_TOOLS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <img
                src="/badges/dofollow-tools.svg"
                alt="Featured on Dofollow.Tools"
                width={200}
                height={54}
                style={{ height: 50, width: "auto" }}
              />
            </a>

            <a
              href={ALTERNATIVETO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <img
                src="/badges/alternativeto.svg"
                alt="GoFully | AlternativeTo"
                width={166}
                height={54}
                style={{ height: 50, width: "auto" }}
              />
            </a>

            <a
              href={UFIND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <img
                src="/badges/ufind-best.svg"
                alt="Featured on ufind.best"
                width={150}
                height={48}
                style={{ height: 50, width: "auto" }}
              />
            </a>

            <a
              href={SAASFAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <img
                src="/badges/saasfame.svg"
                alt="Featured on saasfame.com"
                width={170}
                height={54}
                style={{ height: 50, width: "auto" }}
              />
            </a>
          </div>
        </div>
      </section>

      <SiteFooterIndustry />
    </div>
  );
}
