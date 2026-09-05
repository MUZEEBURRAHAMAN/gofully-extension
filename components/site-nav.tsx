"use client";

import { useState } from "react";
import Link from "next/link";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export type NavLink = { label: string; href: string; active?: boolean };

export function SiteNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b relative" style={{ padding: "0 24px", borderColor: "rgba(29,31,32,.1)" }}>
      <div className="mx-auto flex items-center justify-between" style={{ height: 72, maxWidth: 1320 }}>
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div
            className="flex items-center justify-center border"
            style={{ width: 28, height: 28, background: "var(--gf-color-accent)", borderColor: "rgba(29,31,32,.12)" }}
          >
            <img src="/assets/icon-48.png" alt="GoFully" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="gf-heading-font font-semibold" style={{ fontSize: 18, letterSpacing: "-0.01em" }}>
            GoFully
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-9 text-[13px] font-medium" style={{ color: "rgba(29,31,32,.55)" }}>
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors"
              style={l.active ? { color: "var(--gf-color-accent)", fontWeight: 600 } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={CWS_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex relative items-center justify-center gap-1.5 border gf-heading-font font-semibold cursor-pointer"
            style={{ height: 38, padding: "0 18px", background: "var(--gf-color-accent)", color: "#fff", fontSize: "12.5px", letterSpacing: "0.02em", borderColor: "rgba(29,31,32,.12)" }}
          >
            Add to Chrome
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
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b"
                style={{
                  padding: "14px 4px",
                  borderColor: "rgba(29,31,32,.06)",
                  fontSize: 14,
                  fontWeight: l.active ? 600 : 500,
                  color: l.active ? "var(--gf-color-accent)" : "var(--gf-color-text)",
                }}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={CWS_URL}
              target="_blank"
              rel="noreferrer"
              className="relative inline-flex items-center justify-center gap-1.5 border gf-heading-font font-semibold cursor-pointer"
              style={{ height: 42, marginTop: 16, background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", borderColor: "rgba(29,31,32,.12)" }}
            >
              Add to Chrome
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
