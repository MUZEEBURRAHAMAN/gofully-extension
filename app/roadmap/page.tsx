import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Product Roadmap & Changelog — GoFully",
  description:
    "Explore the development roadmap and release history of GoFully: upcoming features, full-page scrolling engine enhancements, on-device OCR, and export additions.",
  alternates: { canonical: "https://gofully-extension.vercel.app/roadmap" },
  openGraph: {
    title: "Product Roadmap & Changelog — GoFully",
    description: "Follow what's shipping next and the full development journey of GoFully.",
    url: "https://gofully-extension.vercel.app/roadmap",
    siteName: "GoFully",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Roadmap & Changelog — GoFully",
    description: "What's shipping next and recent releases for the GoFully extension.",
  },
};

type Status = "next" | "upcoming" | "later" | "shipped" | "origin";
type Group = { title?: string; items: React.ReactNode[]; shots?: { src: string; alt: string; w: number; h: number; fit?: "cover" | "contain" }[] };
type Release = { id: string; tag: string; status: Status; title: string; summary: string; groups: Group[]; note?: React.ReactNode };

const STATUS: Record<Status, { label: string; tone: string }> = {
  next: { label: "In testing", tone: "new" },
  upcoming: { label: "Upcoming", tone: "blue" },
  later: { label: "Not scheduled", tone: "neutral" },
  shipped: { label: "Shipped", tone: "neutral" },
  origin: { label: "Where it started", tone: "neutral" },
};

const RELEASES: Release[] = [
  {
    id: "v1-1-3",
    tag: "v1.1.3",
    status: "next",
    title: "Draw, redact and measure on the live page, then finish with Beautify",
    summary: "The biggest release so far. Built, tested and packaged. Publishing to the Chrome Web Store next, with no new permissions.",
    groups: [
      {
        title: "Work on the live page",
        items: [
          "Draw on Page: pen, highlighter, arrows, shapes, text and sticky notes right on a website, then capture it with your marks in place. Marks are saved for each page address on your device.",
          "Redact page: hide emails, card numbers, phone numbers, ID numbers and API keys on the live page before you capture, at any length. Click anything else to hide it too. Done puts the page back.",
          "Measure: hover any element for a card that says what it is, its size, padding, margin and text style. Click one to see the gap to another, drag for a free ruler, and pick any color on screen.",
          "Capture Element: hover, use the arrow keys to pick a parent or child, and click.",
          "Delay: wait 3, 5 or 10 seconds before a full-page or visible capture, so you can open a menu or hover a tooltip first.",
        ],
      },
      {
        title: "After a capture",
        items: [
          "Recent captures stay in a small stack on the page. Copy, save, edit or pin any of them, or drag one onto your desktop or into a folder. The stack tucks away when you’re not using it.",
          "Choose what happens after a capture in Settings: show the card, copy, save as PNG or PDF, open the editor, or pin it on the page.",
          "QR codes and barcodes in a capture are read on your device and listed on its card. In the editor, Find codes lists every code in a long capture. Only web links get an Open button.",
          "Pin a capture over any page as a reference.",
          "Search past captures by the words inside them, the page title or the address. Switch it off in Settings.",
        ],
      },
      {
        title: "Editor, privacy and sharing",
        items: [
          "Auto-redact finds emails, card numbers, phone numbers, ID numbers, IP addresses and API keys, and covers them with boxes you review before export.",
          "Beautify: your own image as a background, a built-in set of generated wallpapers, border and text watermark, nine-point alignment, perspective mockups and progressive blur. Save, import and export presets as files you can share.",
          "Crop now carries your annotations into the cropped image so they stay editable, and undo and redo restore the image size too.",
          "Step-by-step guides: gather up to 30 captures, write a line under each, then export a PDF or a Markdown ZIP with its images.",
        ],
      },
      {
        title: "Capture engine",
        items: [
          "Landing-page mode for pages animated by scripts: GoFully photographs every half screen, keeps the middle of each photo and waits for the page to settle, so scroll effects no longer leave broken tiles. Automatic by default, or choose it in Settings.",
          "Scroll-driven animations and fade-in effects are put in their finished state before each photo, pinned sections are put back in the right place, and the page’s own behavior is restored afterwards.",
          "The editor zooms to 1000% and lets you scroll to every part of a tall page, from the very top to the very bottom.",
        ],
      },
      {
        title: "Redesign",
        items: [
          "One design system across the extension and the website: the same colors, type, spacing and icon set on the popup, editor, settings, help and guides, and on every page of the site. The extension keeps its light and dark themes.",
          "Settings and Help use the full width of the window, and the loading card is a small, quiet one.",
          "A confirmation before saving asks whether to include your annotations, and never drops a blur or redaction without telling you.",
        ],
      },
      {
        title: "Security and reliability",
        items: [
          "Extension pages can’t fetch from the internet, load remote images or scripts, or embed frames. Websites can read only the font and the shutter sound from the extension.",
          "Images passed between parts of the extension are checked to be plain raster images, and page text is never turned into markup.",
          "The release package is checked against a locked list of permissions and files before it can be built, and a test fails if anything outside the list sneaks in.",
          "No known vulnerabilities in any dependency, and hundreds of automated tests cover the extension, including tests that feed in hostile page content.",
          "Keyboard shortcuts always show a confirmation or a clear message when a capture can’t run, and Settings lists the shortcuts Chrome has bound and flags any that another extension took.",
          "The OCR engine starts reliably in more browser setups.",
        ],
      },
    ],
  },
  {
    id: "v1-2-0",
    tag: "v1.2.0",
    status: "upcoming",
    title: "A more personal editor",
    summary: "The next release after 1.1.3, in planning.",
    groups: [
      { title: "Editor tools", items: ["Upgraded text tool with color, font and size controls.", "Custom keyboard shortcuts for editor tools."] },
      { title: "Export & workflow", items: ["Export a capture with its OCR’d text as Markdown."] },
    ],
  },
  {
    id: "later",
    tag: "Later",
    status: "later",
    title: "Bigger bets, not scheduled yet",
    summary: "On the list, but further out.",
    groups: [
      {
        items: [
          <><strong>Multi-tab batch capture</strong> — capture several open tabs in one action, export as one file.</>,
          <><strong>Structured table extraction</strong> — detect tables in a capture and export as CSV, not just flat text.</>,
          <><strong>Screen recording</strong> — capture short clips, not just stills.</>,
          <><strong>GoFully Studio</strong> — a standalone workspace for organizing and editing captures beyond the popup.</>,
          <><strong>Video annotation</strong> — the same arrows, callouts, and blur tools, extended to recordings.</>,
        ],
      },
    ],
    note: (
      <>
        <strong>Have a request?</strong> This list is still forming. <Link href="/support">Tell us what you’d use next</Link>.
      </>
    ),
  },
  {
    id: "v1-1-2",
    tag: "v1.1.2",
    status: "shipped",
    title: "Capture reliability, history, and a better homepage",
    summary: "Competitive improvements across the extension and website — more reliable captures, a redesigned export flow, and a complete homepage overhaul.",
    groups: [
      {
        title: "Capture engine",
        items: [
          "One Image Quality setting (Low/Medium/High/Maximum) now controls both JPG and WebP exports, replacing the old JPG-only quality slider.",
          "Video auto-pause during capture — playing videos no longer corrupt stitched frames.",
          "Cookie banner and modal auto-dismiss before capture starts.",
          "Seam verification in scroll-stitch — detects and re-captures misaligned frame boundaries.",
          "Full-page capture now re-checks for sticky/fixed headers after every scroll step, fixing header duplication on sites where a header only becomes fixed after scrolling (a common WordPress/Shopify/Bootstrap pattern).",
          "Fixed a race where the in-page “Capturing page…” badge could occasionally get baked into the screenshot itself, across full-page, visible-area, and selected-area capture.",
          "Fixed the editor export crashing at 500%+ zoom — canvas.toDataURL() was multiplying from the already-zoomed display size instead of the base image.",
        ],
      },
      {
        title: "Editor & workflow",
        items: [
          "Screenshot history with thumbnail grid — browse and reopen past captures from the popup, stored locally on-device.",
          "Browser frame in Beautify now shows the real captured page URL with lock icon.",
          "Unsaved changes protection — warns before closing the editor with unfinished work.",
          "Editor toolbar now adapts to laptop/tablet widths — color swatches collapse into a popover instead of overflowing.",
          "Annotation color is now session-only and no longer carries over between unrelated captures.",
          "JPG added alongside PNG/WebP/PDF as a one-click quick-export option on the Visible Area and Selected Area result cards, not just the full editor.",
          "Popup and settings version number now reads live from the extension manifest instead of a hardcoded string that had drifted out of date.",
          "Rectangle and Ellipse tools consolidated into a single Shape button with a dropdown — now six shapes (Rectangle, Square, Circle, Ellipse, Triangle, Polygon), not two.",
          "Editor zoom raised from 500% to 1000% for pixel-precise annotation on large captures.",
          "Fixed the “Include Annotations” export toggle’s invisible hit-area covering the whole export panel and intercepting clicks on Save/PDF/WebP.",
        ],
      },
      {
        title: "Personalization & Beautify",
        items: [
          "Interface language and light/dark theme options in Settings.",
          "OCR language selection — recognize text in Spanish, French, German, Portuguese, or Simplified Chinese, still fully on-device.",
          "Highlighter tool, for drawing attention instead of hiding it.",
          "Save your own Beautify background, frame, and padding as a reusable preset.",
          "Multi-image collage layouts — arrange captures side-by-side or stacked in one composition.",
          "A gradient and pattern background library for Beautify.",
          "More device frames, including phone and Windows-style.",
          "Optional URL and timestamp stamp on capture.",
          "“Copy as JSON” quick action after OCR, alongside plain text.",
        ],
      },
      {
        title: "Website",
        items: [
          "New “Capture History” feature section on the homepage — highlighting local, on-device screenshot history with nothing ever uploaded.",
          "Rich structured data (JSON-LD) across all pages for better search visibility.",
          "Custom 404 page with helpful navigation.",
          "Social proof bar on homepage — CWS rating, trust signals.",
          "Competitor comparison table — 13 features across 4 extensions.",
          "User reviews section with testimonials.",
          "Strengthened final CTA with trust checkmarks.",
          "Three new SEO guides: full-page PDF export, screenshot beautification, and privacy-first tools.",
        ],
      },
    ],
  },
  {
    id: "v1-1-1",
    tag: "v1.1.1",
    status: "shipped",
    title: "A complete redesign, top to bottom",
    summary: "Every screen rebuilt on one consistent design system, refreshed onboarding, and export bugs that had been broken for a while.",
    groups: [
      {
        title: "Redesign",
        items: [
          "Editor, popup, and every screen rebuilt on one consistent design system — zero-radius corners, CleanShot-style interactivity, unified icons and spacing.",
          "New logo integrated everywhere it appears — popup, editor, toolbar icon, favicons, and the extensions page.",
          "An accessibility pass across the whole extension — fixed contrast, heading structure, and motion issues.",
        ],
      },
      {
        title: "Onboarding & polish",
        items: [
          "Fixed tooltip contrast and consistency, plus a shake bug on the help page.",
          "Fixed an onboarding overlap that could hide part of the first-run flow.",
          "Done and Cancel buttons no longer scroll off-screen during scrolling capture.",
        ],
      },
      {
        title: "Beautify & export",
        items: [
          "Beautify and crop are now correctly included in exports — previously dropped in some cases.",
          "4K UHD is now the default export and copy quality, in both the editor and the popup’s quick-copy.",
          "Fixed blurry exports caused by an image-caching bug.",
          "Fixed the export quality dropdown (Native / 1080p HD / 4K UHD) having no effect on the actual output.",
        ],
      },
      {
        title: "Bug fixes",
        items: [
          "Fixed full-page capture only grabbing the viewport on pages with nested scroll containers.",
          "Fixed capture sound being missing or broken across capture modes.",
          "Fixed uninstall-feedback links pointing at the wrong URL.",
          "Removed dead legacy marketing files that were being bundled into the extension package.",
        ],
      },
    ],
  },
  {
    id: "v1-0-0",
    tag: "v1.0.0",
    status: "shipped",
    title: "Capture, read, and mark it up — all on-device",
    summary: "The first release shipped the whole workflow at once: capture a page, pull text out of it, mark it up, and export — with zero server round-trip at any step.",
    groups: [
      {
        title: "Full-page capture",
        items: [
          "Full page, region, or scrolling-feed capture modes.",
          "Automatically manages sticky nav bars and pre-triggers lazy-loaded media; stitches long pages with zero overlap.",
        ],
        shots: [{ src: "/features/feature-1.webp", alt: "Full-page capture of a long webpage", w: 1536, h: 1024 }],
      },
      {
        title: "Read what’s on screen",
        items: ["A local WebAssembly model reads text and code out of any image and copies it straight to the clipboard."],
        shots: [{ src: "/features/feature-2.webp", alt: "On-device OCR text extraction result", w: 1536, h: 1024 }],
      },
      {
        title: "Mark it up, keep it private",
        items: [
          "Arrows, shapes, and callouts, plus one-click blur and pixelate for sensitive info.",
          "Export to clipboard, PNG, or a paginated PDF, straight from the result bar.",
        ],
        shots: [
          { src: "/features/feature-3.webp", alt: "Annotated screenshot with arrows and callouts", w: 1536, h: 1024 },
          { src: "/features/feature-4.webp", alt: "Export result card with copy, PNG, and PDF options", w: 923, h: 686, fit: "contain" },
        ],
      },
    ],
  },
  {
    id: "origin",
    tag: "Origin",
    status: "origin",
    title: "Cloud tools upload before you can even edit",
    summary:
      "Every other screenshot tool sends the capture to a server first — your screen, in someone else’s cloud, before you’ve even cropped it. GoFully started as a bet that the whole workflow could run locally instead.",
    groups: [],
  },
];

const SPOTLIGHT: Array<{ title: string; body: string; items: string[] }> = [
  { title: "Five new ways to work on the page", body: "Tools that act on the live page before you capture.", items: ["Draw on Page", "Redact page", "Measure", "Capture Element", "Delayed capture"] },
  { title: "A better after-capture", body: "Every capture stays one click away.", items: ["Capture stack with per-capture actions", "Your choice of after-capture action", "QR codes and barcodes read on device", "Pin, history search, guides"] },
  { title: "A stronger editor", body: "From raw screenshot to something worth posting.", items: ["Beautify with 3D mockups and presets", "Auto-redact with review", "Crop keeps annotations editable"] },
  { title: "A smarter capture engine", body: "Pages that animate as you scroll now capture cleanly.", items: ["Landing-page mode", "Animations settled before each photo", "Zoom to 1000% on tall pages"] },
  { title: "One design system", body: "The extension and the website now look and behave as one product.", items: ["Shared colors, type and icons", "Full-width Settings and Help", "Confirm before saving annotations"] },
  { title: "Hardened and tested", body: "Reviewed for security and tested against hostile input.", items: ["Locked permission list, no new permissions", "No remote code, no network from extension pages", "No known dependency vulnerabilities", "Hostile-content tests included"] },
];

function Spotlight() {
  return (
    <section className="gf-rm-spot" id="v1-1-3-overview" aria-labelledby="spot-title">
      <div className="gf-rm-spot-head">
        <span className="gf-badge gf-badge--new">Publishing next</span>
        <h2 id="spot-title">1.1.3 is the biggest release so far</h2>
        <p>Live-page tools, a new after-capture experience, a stronger editor, a smarter capture engine, a full redesign and a security review, all in one update. It adds no new permissions, and everything still runs on your device.</p>
      </div>
      <div className="gf-rm-spot-grid">
        {SPOTLIGHT.map((c) => (
          <article key={c.title} className="gf-rm-spot-card">
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <ul className="gf-list">
              {c.items.map((it) => (<li key={it}>{it}</li>))}
            </ul>
          </article>
        ))}
      </div>
      <a className="gf-rm-spot-link" href="#v1-1-3">See every change in the 1.1.3 entry below</a>
    </section>
  );
}

function ReleaseCard({ r }: { r: Release }) {
  const s = STATUS[r.status];
  return (
    <li className={`gf-rm-item gf-rm-item--${r.status}`} id={r.id}>
      <div className="gf-rm-rail" aria-hidden="true">
        <span className="gf-rm-dot" />
      </div>
      <div className="gf-rm-meta">
        <span className="gf-rm-tag">{r.tag}</span>
        <span className={`gf-badge gf-badge--sm gf-badge--${s.tone}`}>{s.label}</span>
      </div>
      <article className="gf-rm-card">
        <header>
          <h2>{r.title}</h2>
          <p className="gf-small">{r.summary}</p>
        </header>
        {r.groups.map((g, i) => (
          <section key={i} className="gf-rm-group">
            {g.title && <h3>{g.title}</h3>}
            <ul className="gf-list">
              {g.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
            {g.shots && (
              <div className={`gf-rm-shots gf-rm-shots--${g.shots.length}`}>
                {g.shots.map((sh) => (
                  <div key={sh.src} className={`gf-rm-shot${sh.fit === "contain" ? " gf-rm-shot--contain" : ""}`}>
                    <Image src={sh.src} alt={sh.alt} width={sh.w} height={sh.h} sizes="(max-width: 768px) 100vw, 640px" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
        {r.note && <div className="gf-callout gf-rm-note"><p>{r.note}</p></div>}
      </article>
    </li>
  );
}

export default function RoadmapPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "Roadmap" }]} />
      </div>

      <PageHeader
        eyebrow="Roadmap"
        title="The Complete Journey & Roadmap"
        lede="What’s shipping next, and the full journey that got GoFully here."
      >
        <nav className="gf-rm-jump" aria-label="Jump to release">
          {RELEASES.map((r) => (
            <a key={r.id} href={`#${r.id}`} className={`gf-rm-chip gf-rm-chip--${r.status}`}>
              {r.tag}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="gf-rm">
        <Spotlight />
        <ol className="gf-rm-list">
          {RELEASES.map((r) => (
            <ReleaseCard key={r.id} r={r} />
          ))}
        </ol>
      </div>

      <CtaBand title="Try it on your next screenshot" sub="Free, offline, and ready in one click — no account, no setup." />

      <SiteFooterIndustry activeHref="/roadmap" />
    </div>
  );
}
