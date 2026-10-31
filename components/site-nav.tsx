"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AddToChrome } from "@/components/site/chrome-button";
import { Icon } from "@/components/site/icon";

export type NavLink = { label: string; href: string };

// Single source of truth for the header nav: every page renders the same set, in the same order.
const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "Guides", href: "/guides" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

/** Figma: Landing v2 › Nav. Sticky, blurs the page behind it once you scroll. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`gf-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="gf-nav-in">
        <Link href="/" className="gf-nav-brand" onClick={() => setOpen(false)} aria-label="GoFully home">
          <Image src="/brand/gofully-symbol.png" alt="" width={32} height={32} priority />
          <span>GoFully</span>
        </Link>

        <nav className="gf-nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className={pathname === l.href ? "is-active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="gf-nav-end">
          <span className="gf-nav-cta"><AddToChrome size="md" label="Add to Chrome" /></span>
          <button
            type="button"
            className="gf-nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "list"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="gf-nav-sheet">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className={pathname === l.href ? "is-active" : ""}>
              {l.label}
            </Link>
          ))}
          <div style={{ paddingTop: 12 }}><AddToChrome size="lg" /></div>
        </div>
      )}
    </header>
  );
}
