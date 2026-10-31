"use client";

import Link from "next/link";
import type { IconName } from "@/ui/ds/icons";
import { DuoGlyph } from "@/components/site/icon";
import { AddToChrome } from "@/components/site/chrome-button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const SUGGESTED_LINKS = [
  {
    title: "How It Works",
    desc: "From webpage capture to shareable mockup in three simple steps.",
    href: "/#how-it-works",
    tag: "Workflow",
    icon: "step" as IconName,
  },
  {
    title: "Core Features",
    desc: "Explore scrolling capture, local OCR, markup editor, and beautifier.",
    href: "/#features",
    tag: "Tools",
    icon: "sparkles" as IconName,
  },
  {
    title: "Security & Privacy",
    desc: "Learn why GoFully never sends pixels or OCR text to remote servers.",
    href: "/security",
    tag: "Offline",
    icon: "shield" as IconName,
  },
  {
    title: "FAQ & Support",
    desc: "Answers to common questions and quick help from our team.",
    href: "/faq",
    tag: "Help",
    icon: "help" as IconName,
  },
];

export default function NotFoundPage() {
  return (
    <div className="gf-industry min-h-screen flex flex-col">
      <SiteNav />

      <main className="gf-404">
        <div className="gf-404-art" aria-hidden="true">
          <span>4</span>
          <span className="gf-404-frame"><span>0</span></span>
          <span>4</span>
        </div>
        <div className="gf-head-in">
          <span className="gf-badge gf-badge--neutral">Page not found</span>
          <h1>This page couldn&apos;t be captured.</h1>
          <p className="gf-lede">
            Even 40 scroll passes won&apos;t find it. The page you&apos;re looking for doesn&apos;t exist, was moved, or the link may be broken.
          </p>
          <div className="gf-btn-row gf-btn-row--center">
            <Link href="/" className="gf-btn-p">
              <span className="gf-arrow" aria-hidden="true">←</span> Back to home
            </Link>
            <AddToChrome />
          </div>
        </div>

        <section className="gf-404-links" aria-labelledby="popular-title">
          <h2 id="popular-title" className="gf-404-label">Popular pages</h2>
          <div className="gf-404-grid">
            {SUGGESTED_LINKS.map((link) => (
              <Link key={link.title} href={link.href} className="gf-card-link">
                <span className="gf-duo gf-perm-ico"><DuoGlyph name={link.icon} size={18} /></span>
                <h3>{link.title}</h3>
                <p>{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooterIndustry />
    </div>
  );
}
