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
    image: "/features/feature-1.webp",
    alt: "Full-page capture in progress",
  },
  {
    n: 2,
    title: "ANNOTATE & REDACT",
    body: "Call out what matters with arrows, shapes, and text. Blur anything sensitive before it ships.",
    image: "/features/feature-3.webp",
    alt: "Annotated screenshot with arrows and callouts in the GoFully editor",
  },
  {
    n: 3,
    title: "EXPORT INSTANTLY",
    body: "Copy to clipboard, save as PNG, or export a PDF — straight from the result bar, no dialogs.",
    image: "/features/feature-4.webp",
    alt: "GoFully result bar with copy, PNG, and PDF export options",
    contain: true,
  },
];

const FEATURES = [
  {
    tag: "Capture Engine",
    title: "Full-page scrolling capture",
    body: "Seamlessly capture full-height websites, dashboards, and infinite feeds. GoFully scrolls the page, waits for lazy-loaded content, and stitches a pixel-perfect canvas with zero overlap.",
    image: "/features/feature-1.webp",
    alt: "Full-page scrolling capture of a long webpage",
    reverse: false,
  },
  {
    tag: "Local OCR",
    title: "On-device text extraction",
    body: "Extract readable text, code snippets, and structured tables from any region in milliseconds. A local WebAssembly model runs on your CPU — zero cloud transmission, zero latency.",
    image: "/features/feature-2.webp",
    alt: "On-device OCR text extraction result",
    reverse: true,
  },
  {
    tag: "Visual Editor",
    title: "Annotate & redact",
    body: "Mark up screenshots with arrows, callouts, and shapes. Instantly blur or pixelate sensitive API keys, passwords, and PII before you share.",
    image: "/features/feature-3.webp",
    alt: "Annotated screenshot showing arrows, callouts, and highlights in the GoFully editor",
    reverse: false,
  },
  {
    tag: "Export",
    title: "Flexible export",
    body: "Generate a paginated PDF, download a crisp PNG or WebP, or copy straight to your clipboard — all from the result bar, right after you capture.",
    image: "/features/feature-4.webp",
    alt: "GoFully result bar with copy, PNG, and PDF export options",
    reverse: true,
    contain: true,
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block border gf-heading-font font-semibold uppercase"
      style={{
        borderColor: "rgba(22,103,242,.25)",
        background: "rgba(22,103,242,.06)",
        color: "var(--gf-color-accent)",
        fontSize: "10.5px",
        letterSpacing: "0.06em",
        padding: "6px 14px",
      }}
    >
      {children}
    </span>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block border gf-heading-font font-semibold uppercase"
      style={{
        borderColor: "rgba(29,31,32,.15)",
        color: "rgba(29,31,32,.45)",
        fontSize: "10.5px",
        letterSpacing: "0.06em",
        padding: "5px 12px",
      }}
    >
      {children}
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
            <Kicker>Chrome Extension · 100% On-Device</Kicker>
            <div
              className="gf-heading-font font-semibold"
              style={{ fontSize: "clamp(34px, 9vw, 58px)", lineHeight: 1.05, letterSpacing: "-0.01em", marginTop: 24, color: "var(--gf-color-text)" }}
            >
              Capture anything.
              <br />
              Make it clear.
            </div>
            <p className="mx-auto" style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 560, marginTop: 20 }}>
              GoFully is a browser extension for capturing webpages, extracting text, annotating screenshots, protecting sensitive information, and exporting polished results — all from your browser.
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
        {/* Sample mockup image — swap for a real product screenshot when ready */}
        <img
          src="/features/feature-3.webp"
          alt="GoFully annotation editor showing arrows and callouts on a captured screenshot"
          className="mx-auto object-cover h-full w-full object-top"
          draggable={false}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </ContainerScroll>

      {/* How it works */}
      <div id="how-it-works" className="border-t" style={{ padding: "80px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 52 }}>
          <SectionKicker>How It Works</SectionKicker>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            From capture to shareable image in three steps
          </div>
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
                <div className="gf-heading-font font-semibold" style={{ fontSize: 16, letterSpacing: "0.01em" }}>
                  {s.title}
                </div>
              </div>
              <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(29,31,32,.5)", margin: "0 0 14px" }}>{s.body}</p>
              <BlueprintFrame className="p-2">
                <img
                  src={s.image}
                  alt={s.alt}
                  className={`w-full block ${s.contain ? "object-contain bg-white" : "object-cover"}`}
                  style={{ aspectRatio: "4/3" }}
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
          <SectionKicker>Core Features</SectionKicker>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 34px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Everything you need to capture, clean up, and share
          </div>
          <p style={{ fontSize: "14.5px", color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            Four tools that cover the whole workflow — from first capture to final export.
          </p>
        </div>

        <div className="mx-auto flex flex-col" style={{ gap: 64, maxWidth: 1320 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="grid grid-cols-1 md:grid-cols-2 items-center" style={{ gap: 56 }}>
              <div className={f.reverse ? "md:order-2" : ""}>
                <Kicker>{f.tag}</Kicker>
                <div className="gf-heading-font font-semibold" style={{ fontSize: 26, letterSpacing: "-0.005em", marginTop: 14 }}>
                  {f.title}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(29,31,32,.5)", marginTop: 12, maxWidth: 440 }}>{f.body}</p>
              </div>
              <BlueprintFrame className={`p-2.5 ${f.reverse ? "md:order-1" : ""}`}>
                <img
                  src={f.image}
                  alt={f.alt}
                  className={`w-full block ${f.contain ? "object-contain bg-white" : "object-cover"}`}
                  style={{ aspectRatio: "16/11" }}
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
          className="inline-block border gf-heading-font font-semibold uppercase"
          style={{ borderColor: "rgba(255,255,255,.2)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.7)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}
        >
          100% Offline
        </span>
        <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", color: "#fff", letterSpacing: "-0.01em", marginTop: 20 }}>
          Nothing you capture ever leaves your device
        </div>
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
