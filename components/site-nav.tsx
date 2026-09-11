"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ALTERNATIVETO_URL =
  "https://alternativeto.net/software/gofully/about/?utm_source=badge&utm_medium=referral";

export type NavLink = { label: string; href: string };

// Single source of truth for the header nav — every page renders the exact
// same set, in the exact same order. Do not let individual pages define
// their own copy; that's how this drifted into 5 different variants before.
const NAV_LINKS: NavLink[] = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Guides", href: "/guides" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border-b relative" style={{ padding: "0 24px", borderColor: "rgba(29,31,32,.1)", zIndex: 50 }}>
      <div className="mx-auto flex items-center justify-between" style={{ height: 72, maxWidth: 1320 }}>
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src="/logo-nav.png"
            alt="GoFully — Full Page Screenshot Chrome Extension"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="gf-heading-font font-semibold" style={{ fontSize: 18, letterSpacing: "-0.01em" }}>
            GoFully
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-9 text-[13px] font-medium" style={{ color: "rgba(29,31,32,.55)" }}>
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                className="transition-colors"
                style={isActive ? { color: "var(--gf-color-accent)", fontWeight: 600 } : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={ALTERNATIVETO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center"
            style={{ height: 38 }}
          >
            <img
              src="https://alternativeto.net/static/badges/badge-compact-color.svg"
              alt="GoFully | AlternativeTo"
              width={117}
              height={38}
              style={{ height: 38, width: 117 }}
            />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex items-center justify-center border"
            style={{ width: 38, height: 38, borderColor: "rgba(29,31,32,.15)", color: "var(--gf-color-text)", background: "transparent" }}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden absolute left-0 right-0 top-full border-t"
          style={{ background: "var(--gf-color-bg)", borderColor: "rgba(29,31,32,.1)", zIndex: 40 }}
        >
          <div className="flex flex-col" style={{ padding: "8px 24px 20px" }}>
            {NAV_LINKS.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b"
                  style={{
                    padding: "14px 4px",
                    borderColor: "rgba(29,31,32,.06)",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--gf-color-accent)" : "var(--gf-color-text)",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
            <a
              href={ALTERNATIVETO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center"
              style={{ height: 42, marginTop: 16 }}
            >
              <img
                src="https://alternativeto.net/static/badges/badge-compact-color.svg"
                alt="GoFully | AlternativeTo"
                width={130}
                height={42}
                style={{ height: 42, width: 130 }}
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
