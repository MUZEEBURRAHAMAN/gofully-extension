"use client";

import Link from "next/link";

const ALL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
  { label: "Roadmap", href: "/roadmap" },
];

export function SiteFooterIndustry({
  activeHref,
  showRoadmap = true,
}: {
  activeHref?: string;
  showRoadmap?: boolean;
}) {
  const links = showRoadmap ? ALL_LINKS : ALL_LINKS.filter((l) => l.href !== "/roadmap");

  return (
    <div className="border-t" style={{ padding: "28px 24px", borderColor: "rgba(29,31,32,.08)" }}>
      <div className="mx-auto flex items-center justify-between flex-wrap" style={{ gap: 16, maxWidth: 1320 }}>
        <div style={{ fontSize: 12, color: "rgba(29,31,32,.4)" }}>
          © {new Date().getFullYear()} GoFully — Screenshot Studio
        </div>
        <div className="flex flex-wrap" style={{ gap: 22, fontSize: 12, color: "rgba(29,31,32,.5)" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.href === activeHref ? "" : "hover:text-[var(--gf-color-text)] transition-colors"}
              style={l.href === activeHref ? { color: "var(--gf-color-accent)" } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
