"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type GuideCard = { slug: string; title: string; subtitle: string; tag: string; readTime: string; comingSoon?: boolean };

/** Real product screenshots from the extension, one per guide. */
const COVERS: Record<string, string> = {
  "how-to-draw-on-a-live-website": "draw-1",
  "how-to-capture-a-single-element": "element-1",
  "how-to-auto-redact-sensitive-info": "redact-1",
  "how-to-make-a-step-by-step-guide-from-screenshots": "full-page-4",
  "screenshot-tool-for-developers-and-qa": "region-1",
  "best-full-page-screenshot-extensions": "full-page-1",
  "how-to-take-full-page-screenshot-chrome": "full-page-3",
  "how-to-blur-sensitive-info-in-screenshots": "redact-2",
  "how-to-extract-unselectable-text": "text-3",
  "how-to-save-webpage-as-pdf": "full-page-2",
  "how-to-beautify-screenshots": "beautify-1",
  "privacy-first-screenshot-tools": "redact-3",
  "how-to-extract-text-in-multiple-languages-ocr": "text-2",
  "custom-keyboard-shortcuts-for-screen-capture": "region-3",
  "how-to-use-highlighter-tool-in-screenshots": "draw-2",
};

/** Guides index grid with topic filter chips. */
export function GuideBrowser({ guides }: { guides: GuideCard[] }) {
  const tags = useMemo(() => Array.from(new Set(guides.map((g) => g.tag))), [guides]);
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? guides.filter((g) => g.tag === active) : guides;

  return (
    <div className="gf-guides">
      <div className="gf-chips" role="toolbar" aria-label="Filter guides by topic">
        <button type="button" className="gf-chip" aria-pressed={active === null} onClick={() => setActive(null)}>
          All <span>{guides.length}</span>
        </button>
        {tags.map((t) => (
          <button key={t} type="button" className="gf-chip" aria-pressed={active === t} onClick={() => setActive(t)}>
            {t} <span>{guides.filter((g) => g.tag === t).length}</span>
          </button>
        ))}
      </div>
      <div className="gf-grid-3" key={active ?? "all"}>
        {shown.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="gf-card-link">
            {COVERS[g.slug] && (
              <div className="gf-card-cover">
                <Image src={`/landing/${COVERS[g.slug]}.webp`} alt="" fill sizes="(min-width: 1000px) 340px, (min-width: 640px) 50vw, 100vw" />
              </div>
            )}
            <div className="gf-card-top">
              <span className="gf-badge gf-badge--neutral gf-badge--sm">{g.tag}</span>
              <span>{g.comingSoon ? "Coming soon" : g.readTime}</span>
            </div>
            <h2 className="gf-card-title">{g.title}</h2>
            <p>{g.subtitle}</p>
            <span className="gf-card-more">
              {g.comingSoon ? "Preview the guide" : "Read the guide"} <span className="gf-arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
