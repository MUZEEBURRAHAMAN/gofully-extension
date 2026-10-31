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
    slug: "how-to-draw-on-a-live-website",
    title: "How to Draw on Any Live Website and Capture It with Your Marks",
    subtitle:
      "Use GoFully's Draw on Page to sketch arrows, highlight text and add sticky notes right on a live website, then capture the visible area or the full page with your marks in place.",
    tag: "Visual Annotation",
    readTime: "4 min read",
  },
  {
    slug: "how-to-capture-a-single-element",
    title: "How to Capture a Single Element on a Webpage (Card, Table or Chat Message)",
    subtitle:
      "Capture just one card, table, chart or chat message in Chrome.",
    tag: "Capture Tutorial",
    readTime: "3 min read",
  },
  {
    slug: "how-to-auto-redact-sensitive-info",
    title: "How to Auto-Redact Emails, Card Numbers and API Keys in Screenshots",
    subtitle:
      "GoFully's Auto-redact reads your screenshot on your device and covers emails, card numbers, phone numbers, ID numbers, IP addresses and API keys with black boxes you review before export.",
    tag: "Privacy & Security",
    readTime: "4 min read",
  },
  {
    slug: "how-to-make-a-step-by-step-guide-from-screenshots",
    title: "How to Build a Step-by-Step Guide from Screenshots (PDF or Markdown)",
    subtitle:
      "Turn several GoFully captures into one how-to document.",
    tag: "Workflow & Docs",
    readTime: "4 min read",
  },
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
    <section className="gf-related" aria-labelledby="related-guides">
      <div className="gf-related-in">
        <div className="gf-related-head">
          <div>
            <span className="gf-badge gf-badge--blue">Keep reading</span>
            <h2 id="related-guides">Related guides</h2>
          </div>
          <Link href="/guides" className="gf-link-arrow">
            All {ALL_GUIDES.length} guides <span className="gf-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="gf-grid-3">
          {related.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="gf-card-link">
              <div className="gf-card-top">
                <span className="gf-badge gf-badge--neutral gf-badge--sm">{guide.tag}</span>
                <span>{guide.readTime}</span>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.subtitle}</p>
              <span className="gf-card-more">
                Read guide <span className="gf-arrow" aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
