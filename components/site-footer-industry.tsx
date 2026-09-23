"use client";

import Link from "next/link";

const ALL_LINKS = [
  { label: "Guides", href: "/guides" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
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
    <footer className="border-t" style={{ padding: "28px 24px", borderColor: "rgba(29,31,32,.08)" }}>
      <div className="mx-auto flex items-center justify-between flex-wrap" style={{ gap: 16, maxWidth: 1320 }}>
        <div className="flex items-center gap-3.5 flex-wrap">
          <div style={{ fontSize: 12, color: "rgba(29,31,32,.4)" }}>
            © {new Date().getFullYear()} GoFully — Screenshot Studio
          </div>
          <a
            href="//www.dmca.com/Protection/Status.aspx?ID=77c114b5-c41b-44ac-9991-85a94ab2a971"
            title="DMCA.com Protection Status"
            className="dmca-badge inline-flex items-center opacity-85 hover:opacity-100 transition-opacity"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://images.dmca.com/Badges/dmca_protected_sml_120c.png?ID=77c114b5-c41b-44ac-9991-85a94ab2a971"
              alt="DMCA.com Protection Status"
              width={120}
              height={24}
              style={{ height: 20, width: "auto" }}
            />
          </a>
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
    </footer>
  );
}
