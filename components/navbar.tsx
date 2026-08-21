"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/gofully-wordmark-dark.png"
            alt="GoFully"
            className="h-8 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#features"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/security"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
          >
            Security
          </Link>
          <Link
            href="/support"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
          >
            Support
          </Link>
          <Link
            href="/faq"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
          >
            FAQ
          </Link>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-[#0b43a2] bg-[#0b43a2] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0b43a2]/20 transition-all hover:bg-[#0d52c9]"
          >
            <span>Add to Chrome</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center border border-slate-700 bg-slate-800/50 text-slate-300 md:hidden"
          aria-label="Toggle Navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-slate-800 bg-[#070b14] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              Security
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              Support
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              FAQ
            </Link>
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 border border-[#0b43a2] bg-[#0b43a2] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-[#0d52c9]"
            >
              <span>Add to Chrome</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
