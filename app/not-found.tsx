"use client";

import Link from "next/link";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

const SUGGESTED_LINKS = [
  {
    title: "How It Works",
    desc: "From webpage capture to shareable mockup in three simple steps.",
    href: "/#how-it-works",
    tag: "Workflow",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h9" />
        <polyline points="16 15 19 18 16 21" />
      </svg>
    ),
  },
  {
    title: "Core Features",
    desc: "Explore scrolling capture, local OCR, markup editor, and beautifier.",
    href: "/#features",
    tag: "Tools",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
      </svg>
    ),
  },
  {
    title: "Security & Privacy",
    desc: "Learn why GoFully never sends pixels or OCR text to remote servers.",
    href: "/security",
    tag: "Offline",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "FAQ & Support",
    desc: "Answers to common questions and quick help from our team.",
    href: "/faq",
    tag: "Help",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function NotFoundPage() {
  return (
    <div className="gf-industry min-h-screen flex flex-col justify-between">
      <SiteNav />

      <main className="flex-1" style={{ padding: "80px 24px 96px" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 760 }}>
          {/* Error Tag */}
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
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>404 Error · Page Not Found</span>
          </span>

          {/* Large Code & Heading */}
          <div
            className="gf-heading-font font-bold select-none"
            style={{
              fontSize: "clamp(64px, 14vw, 120px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginTop: 20,
              color: "rgba(29,31,32,.12)",
            }}
          >
            404
          </div>

          <h1
            className="gf-heading-font font-semibold"
            style={{
              fontSize: "clamp(28px, 6vw, 44px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              marginTop: -12,
              color: "var(--gf-color-text)",
            }}
          >
            Captured nothing here.
          </h1>

          <p
            className="mx-auto"
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "rgba(29,31,32,.55)",
              maxWidth: 520,
              marginTop: 16,
            }}
          >
            The page you are looking for does not exist, was moved, or the link may be broken. Everything else in GoFully is right where you left it.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3.5" style={{ marginTop: 32 }}>
            <Link
              href="/"
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Back to Home</span>
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
            </Link>

            <a
              href={CWS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border gf-heading-font font-semibold cursor-pointer"
              style={{
                height: 48,
                padding: "0 22px",
                borderColor: "rgba(29,31,32,.15)",
                color: "rgba(29,31,32,.7)",
                fontSize: 14,
                letterSpacing: "0.02em",
                background: "rgba(255,255,255,.6)",
              }}
            >
              <span>Add to Chrome — It&apos;s Free</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Suggested Destinations Grid */}
        <div className="mx-auto" style={{ maxWidth: 1040, marginTop: 72 }}>
          <div className="text-center mb-6">
            <span
              className="gf-heading-font font-semibold uppercase text-xs"
              style={{ letterSpacing: "0.08em", color: "rgba(29,31,32,.4)" }}
            >
              Popular Destinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUGGESTED_LINKS.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group block transition-transform duration-150 hover:-translate-y-0.5"
              >
                <BlueprintFrame className="h-full p-5 bg-white/60 group-hover:bg-white/90 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex items-center justify-center rounded-sm"
                      style={{
                        width: 32,
                        height: 32,
                        background: "rgba(22,103,242,.08)",
                      }}
                    >
                      {link.icon}
                    </div>
                    <span
                      className="border text-[10px] uppercase font-semibold gf-heading-font px-2 py-0.5"
                      style={{
                        borderColor: "rgba(29,31,32,.1)",
                        color: "rgba(29,31,32,.45)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {link.tag}
                    </span>
                  </div>
                  <div
                    className="gf-heading-font font-semibold text-sm mb-1.5 group-hover:text-[var(--gf-color-accent)] transition-colors"
                    style={{ color: "var(--gf-color-text)" }}
                  >
                    {link.title}
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "rgba(29,31,32,.5)",
                      margin: 0,
                    }}
                  >
                    {link.desc}
                  </p>
                </BlueprintFrame>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooterIndustry />
    </div>
  );
}
