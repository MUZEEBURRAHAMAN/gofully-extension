import Link from "next/link";

export interface GuideMeta {
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  readTime: string;
}

export const ALL_GUIDES: GuideMeta[] = [
  {
    slug: "screenshot-tool-for-developers-and-qa",
    title: "The Screenshot Workflow Built for Developers & QA",
    subtitle:
      "Why full-page capture, redaction, OCR, and PDF export matter for bug reports and QA tickets.",
    tag: "Use Case",
    readTime: "5 min read",
  },
  {
    slug: "best-full-page-screenshot-extensions",
    title: "Best Full Page Screenshot Extensions for Chrome (2026)",
    subtitle:
      "A fact-checked comparison of GoFully, GoFullPage, Awesome Screenshot, FireShot, and Nimbus.",
    tag: "Comparison",
    readTime: "6 min read",
  },
  {
    slug: "how-to-take-full-page-screenshot-chrome",
    title: "How to Take a Full Page Screenshot in Chrome Without Cutting Off Content",
    subtitle:
      "Learn the 3 ways to capture an entire scrolling webpage in Google Chrome.",
    tag: "Capture Tutorial",
    readTime: "5 min read",
  },
  {
    slug: "how-to-blur-sensitive-info-in-screenshots",
    title: "How to Blur or Redact Sensitive Information in Screenshots",
    subtitle:
      "A complete guide to masking passwords, API tokens, and customer PII before sharing.",
    tag: "Privacy & Security",
    readTime: "4 min read",
  },
  {
    slug: "how-to-extract-unselectable-text",
    title: "How to Extract and Copy Unselectable Text from Any Webpage or Image",
    subtitle:
      "Extract text from infographics, charts, YouTube frames, or locked websites in seconds.",
    tag: "OCR & Productivity",
    readTime: "4 min read",
  },
  {
    slug: "how-to-save-webpage-as-pdf",
    title: "How to Save a Full Webpage as PDF in Chrome Without Cutting Off Content",
    subtitle:
      "Learn 3 ways to save an entire scrolling webpage as a clean, paginated PDF.",
    tag: "Export Tutorial",
    readTime: "5 min read",
  },
  {
    slug: "how-to-beautify-screenshots",
    title: "How to Beautify Screenshots for Social Media & Presentations",
    subtitle:
      "Turn raw browser screenshots into polished images with custom backgrounds and browser frames.",
    tag: "Design & Workflow",
    readTime: "4 min read",
  },
  {
    slug: "privacy-first-screenshot-tools",
    title: "Privacy-First Screenshot Tools: Why Offline Capture Matters in 2026",
    subtitle:
      "Learn why offline-first tools protect your confidential data — and which ones actually stay local.",
    tag: "Privacy & Security",
    readTime: "6 min read",
  },
  {
    slug: "how-to-extract-text-in-multiple-languages-ocr",
    title: "How to Extract Text in Multiple Languages with On-Device OCR",
    subtitle:
      "Extract Spanish, French, German, Portuguese, and Chinese text from images and locked web apps.",
    tag: "OCR & i18n",
    readTime: "4 min read",
  },
  {
    slug: "custom-keyboard-shortcuts-for-screen-capture",
    title: "How to Set Custom Keyboard Shortcuts for Fast Screen Capture",
    subtitle:
      "Trigger full page scrolling capture, visible area snapshots, or selected region OCR with shortcuts.",
    tag: "Workflow & Speed",
    readTime: "4 min read",
  },
  {
    slug: "how-to-use-highlighter-tool-in-screenshots",
    title: "How to Use the Highlighter Tool in Screenshots Without Obscuring Text",
    subtitle:
      "Emphasize key UI metrics and paragraphs with CleanShot-grade multiply blending.",
    tag: "Visual Annotation",
    readTime: "4 min read",
  },
];

export function RelatedGuides({ currentSlug }: { currentSlug: string }) {
  const currentIndex = ALL_GUIDES.findIndex((g) => g.slug === currentSlug);
  
  // Select 3 relevant guides in a circular offset so every guide gets linked evenly
  const otherGuides = ALL_GUIDES.filter((g) => g.slug !== currentSlug);
  const startIdx = currentIndex >= 0 ? currentIndex % otherGuides.length : 0;
  const related = [
    otherGuides[startIdx % otherGuides.length],
    otherGuides[(startIdx + 1) % otherGuides.length],
    otherGuides[(startIdx + 2) % otherGuides.length],
  ];

  return (
    <section
      className="border-t"
      style={{
        padding: "60px 24px",
        borderColor: "rgba(29,31,32,.08)",
        background: "rgba(29,31,32,.02)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <span
              className="inline-flex items-center gap-1.5 border gf-heading-font font-semibold uppercase"
              style={{
                borderColor: "rgba(22,103,242,.25)",
                background: "rgba(22,103,242,.06)",
                color: "var(--gf-color-accent)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                padding: "4px 10px",
              }}
            >
              Continue Learning
            </span>
            <h2
              className="gf-heading-font font-semibold text-2xl mt-2.5"
              style={{ color: "var(--gf-color-text)", letterSpacing: "-0.01em" }}
            >
              Related Guides &amp; Tutorials
            </h2>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold gf-heading-font hover:underline"
            style={{ color: "var(--gf-color-accent)" }}
          >
            <span>View all 11 guides</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {related.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group block relative border border-[rgba(29,31,32,.12)] bg-white p-6 transition-all duration-150 hover:-translate-y-1 hover:border-[rgba(22,103,242,.4)] hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="border text-[10.5px] uppercase font-semibold gf-heading-font px-2 py-0.5"
                    style={{
                      borderColor: "rgba(29,31,32,.1)",
                      color: "rgba(29,31,32,.5)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {guide.tag}
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(29,31,32,.4)" }}>
                    {guide.readTime}
                  </span>
                </div>
                <h3
                  className="gf-heading-font font-semibold text-[15px] leading-snug mb-2 group-hover:text-[var(--gf-color-accent)] transition-colors"
                  style={{ color: "var(--gf-color-text)" }}
                >
                  {guide.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed line-clamp-3" style={{ color: "rgba(29,31,32,.55)" }}>
                  {guide.subtitle}
                </p>
              </div>

              <div
                className="mt-4 pt-3 border-t border-[rgba(29,31,32,.08)] flex items-center gap-1.5 text-xs font-semibold gf-heading-font group-hover:text-[var(--gf-color-accent)]"
                style={{ color: "rgba(29,31,32,.6)" }}
              >
                <span>Read guide</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
