"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FooterMark } from "@/components/site/footer-mark";

const DMCA_ID = "77c114b5-c41b-44ac-9991-85a94ab2a971";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  { title: "Product", links: [
    { label: "Features", href: "/#features" },
    { label: "Use cases", href: "/#use-cases" },
    { label: "Security", href: "/security" },
    { label: "Roadmap", href: "/roadmap" },
  ] },
  { title: "Guides", links: [
    { label: "Full page screenshot", href: "/guides/how-to-take-full-page-screenshot-chrome" },
    { label: "Blur sensitive info", href: "/guides/how-to-blur-sensitive-info-in-screenshots" },
    { label: "Extract text (OCR)", href: "/guides/how-to-extract-unselectable-text" },
    { label: "Beautify screenshots", href: "/guides/how-to-beautify-screenshots" },
    { label: "All guides", href: "/guides" },
  ] },
  { title: "Compare", links: [
    { label: "vs GoFullPage", href: "/alternatives/gofullpage" },
    { label: "vs Awesome Screenshot", href: "/alternatives/awesome-screenshot" },
    { label: "vs FireShot", href: "/alternatives/fireshot" },
    { label: "vs Nimbus", href: "/alternatives/nimbus" },
    { label: "All alternatives", href: "/alternatives" },
  ] },
  { title: "Help", links: [{ label: "FAQ", href: "/faq" }, { label: "Support", href: "/support" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
];

const REPO_URL = "https://github.com/MUZEEBURRAHAMAN/gofully-extension";

const BADGES = [
  { href: "https://dofollow.tools", src: "/badges/dofollow-tools.svg", alt: "Featured on Dofollow.Tools", w: 200, h: 54 },
  { href: "https://alternativeto.net/software/gofully/about/?utm_source=badge&utm_medium=referral", src: "/badges/alternativeto.svg", alt: "GoFully on AlternativeTo", w: 166, h: 54 },
  { href: "https://ufind.best/products/gofully", src: "/badges/ufind-best.svg", alt: "Featured on ufind.best", w: 150, h: 48 },
  { href: "https://saasfame.com/item/gofully-gofully-extensionvercelapp", src: "/badges/saasfame.svg", alt: "Featured on SaaSFame", w: 170, h: 54 },
  { href: "https://productfame.com", src: "/badges/productfame.svg", alt: "Featured on ProductFame", w: 195, h: 54 },
  { href: "https://www.tinyshelf.co/?ref=gofully-extension.vercel.app", src: "/badges/tinyshelf.svg", alt: "Featured on TinyShelf", w: 216, h: 64 },
];

/** Figma: Landing v2 › Footer. Same on every page. */
export function SiteFooterIndustry({ activeHref }: { activeHref?: string; showRoadmap?: boolean }) {
  const [currentUrl, setCurrentUrl] = useState("https://gofully-extension.vercel.app/");
  useEffect(() => { setCurrentUrl(window.location.href); }, []);

  return (
    <footer className="gf-foot">
      <div className="gf-foot-in">
        <div className="gf-foot-top">
          <div className="gf-foot-brand">
            <Link href="/" className="gf-nav-brand" aria-label="GoFully home">
              <Image src="/brand/gofully-symbol.png" alt="" width={28} height={28} />
              <span>GoFully</span>
            </Link>
            <p>Full-page screenshots, editing and OCR that stay on your device. Free, with no account.</p>
          </div>
          <div className="gf-foot-cols">
            {COLUMNS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2>{c.title}</h2>
                {c.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className={l.href === activeHref ? "is-active" : ""}>{l.label}</Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <div className="gf-foot-badges">
          <span>Featured on</span>
          {BADGES.map((b) => (
            <a key={b.src} href={b.href} target="_blank" rel="noopener noreferrer">
              <Image src={b.src} alt={b.alt} width={b.w} height={b.h} style={{ height: 30, width: "auto" }} />
            </a>
          ))}
        </div>
        <div className="gf-foot-bottom">
          <span>© {new Date().getFullYear()} GoFully. All rights reserved.</span>
          <div className="gf-foot-end">
            <a
              href={`https://www.dmca.com/Protection/Status.aspx?ID=${DMCA_ID}&refurl=${encodeURIComponent(currentUrl)}`}
              title="DMCA.com Protection Status"
              className="dmca-badge"
              target="_blank"
              rel="noreferrer"
            >
              <Image src="/badges/dmca_protected_sml_120c.png" alt="DMCA.com Protection Status" width={120} height={21} style={{ height: 20, width: "auto" }} />
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="gf-foot-social" aria-label="GoFully on GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <FooterMark />
    </footer>
  );
}
