"use client";

import { BlueprintFrame } from "@/components/blueprint-frame";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

const NAV_LINKS = [
  { label: "Product", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
  { label: "Roadmap", href: "/roadmap" },
];

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
    body: "Extract readable text, code snippets, and structured tables from any region in milliseconds. A local WebAssembly model runs on your CPU — zero cloud transmission, zero latency.",
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
    body: "Mark up screenshots with arrows, callouts, and shapes. Instantly blur or pixelate sensitive API keys, passwords, and PII before you share.",
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
    body: "Transform raw screenshots into polished, presentation-ready assets. Customize vibrant backgrounds, add window frames, tweak padding and rounded corners, and apply soft drop shadows.",
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
      <SiteNav links={NAV_LINKS} />

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
              Full Page Screenshot,
              <br />
              Scrolling Capture &amp; Local OCR
            </h1>
            <p className="mx-auto" style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(29,31,32,.6)", maxWidth: 580, marginTop: 20 }}>
              GoFully is the all-in-one browser extension for capturing full scrolling webpages, extracting text with local WebAssembly OCR, annotating with CleanShot precision, and exporting in 4K or PDF — 100% free &amp; offline.
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

      {/* Privacy band */}
      <div className="text-center" style={{ background: "var(--gf-color-text)", padding: "80px 24px" }}>
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
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", color: "#fff", letterSpacing: "-0.01em", marginTop: 20 }}>
          Nothing you capture ever leaves your device
        </h2>
        <p className="mx-auto" style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 520, marginTop: 14, lineHeight: 1.6 }}>
          No accounts, no cloud uploads, no telemetry. Every screenshot, extraction, and edit happens locally in your browser.
        </p>
        <div style={{ marginTop: 28 }}>
          <CTAButton href={CWS_URL}>Add to Chrome — It&apos;s Free</CTAButton>
        </div>
      </div>

      <SiteFooterIndustry />
    </div>
  );
}
