"use client";

import { BlueprintFrame } from "@/components/blueprint-frame";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "Roadmap", href: "/roadmap", active: true },
];

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[13px] leading-[1.55]" style={{ color: "rgba(29,31,32,.65)" }}>
      <span className="mt-[8px] h-[5px] w-[5px] flex-shrink-0" style={{ background: "var(--gf-color-accent)" }} />
      <span>{children}</span>
    </li>
  );
}

function OutlineBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[13px] leading-[1.55]" style={{ color: "rgba(29,31,32,.65)" }}>
      <span className="mt-[8px] h-[5px] w-[5px] flex-shrink-0 border" style={{ borderColor: "var(--gf-color-accent)" }} />
      <span>{children}</span>
    </li>
  );
}

function TimelineRow({
  tag,
  tagStyle,
  status,
  statusColor,
  dotStyle,
  connector = true,
  children,
}: {
  tag: string;
  tagStyle: React.CSSProperties;
  status?: string;
  statusColor?: string;
  dotStyle: React.CSSProperties;
  connector?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_28px_1fr] md:grid-cols-[108px_28px_1fr] gap-x-5">
      <div className="pt-1.5">
        <span
          className="inline-block border gf-heading-font font-semibold"
          style={{ padding: "4px 9px", fontSize: 11, letterSpacing: "0.04em", ...tagStyle }}
        >
          {tag}
        </span>
        {status && (
          <div className="mt-1.5 text-[10px] font-semibold" style={{ letterSpacing: "0.04em", color: statusColor }}>
            {status}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <div className="mt-2 h-[13px] w-[13px] flex-shrink-0 border" style={dotStyle} />
        {connector && <div className="mt-1.5 w-px flex-1" style={{ background: "rgba(29,31,32,.15)" }} />}
      </div>
      <div className="pb-9">{children}</div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav links={NAV_LINKS} />

      {/* Header + timeline share one centered column so the whole page
          doesn't read as flush-left with a large dead gap on wide screens. */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div className="px-6 md:px-20" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <span
          className="inline-block border gf-heading-font font-semibold uppercase"
          style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "5px 12px" }}
        >
          Roadmap
        </span>
        <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(28px, 7.5vw, 44px)", letterSpacing: "-0.01em", marginTop: 20 }}>
          The complete journey
        </div>
        <p style={{ fontSize: 15, color: "rgba(29,31,32,.55)", marginTop: 16, lineHeight: 1.6, maxWidth: 640 }}>
          From the problem that started GoFully to what&apos;s shipped today and what&apos;s coming next.
        </p>
      </div>

      {/* Timeline */}
      <div className="px-6 md:px-20" style={{ paddingTop: 8, paddingBottom: 90 }}>
        <div>

          {/* Origin */}
          <TimelineRow
            tag="ORIGIN"
            tagStyle={{ borderColor: "rgba(29,31,32,.2)", color: "#1d1f20" }}
            dotStyle={{ background: "#1d1f20", borderColor: "#1d1f20" }}
          >
            <BlueprintFrame className="p-6" style={{ background: "#fff", maxWidth: 600 }} markColor="rgba(29,31,32,.15)">
              <div className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>
                Cloud tools upload before you can even edit
              </div>
              <p className="mt-2" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.6)", lineHeight: 1.6 }}>
                Every other screenshot tool sends the capture to a server first — your screen, in someone else&apos;s
                cloud, before you&apos;ve even cropped it. GoFully started as a bet that the whole workflow could run
                locally instead.
              </p>
            </BlueprintFrame>
          </TimelineRow>

          {/* v1.0 shipped */}
          <TimelineRow
            tag="v1.0"
            tagStyle={{ borderColor: "rgba(29,31,32,.2)", color: "#1d1f20" }}
            status="SHIPPED"
            statusColor="rgba(29,31,32,.5)"
            dotStyle={{ background: "#1d1f20", borderColor: "#1d1f20" }}
          >
            <BlueprintFrame className="p-6" style={{ background: "#fff", maxWidth: 600 }} markColor="rgba(29,31,32,.15)">
              <div className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>
                Capture, read, and mark it up — all on-device
              </div>
              <p className="mt-2" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.6)", lineHeight: 1.6 }}>
                The first release shipped the whole workflow at once: capture a page, pull text out of it, mark it
                up, and export — with zero server round-trip at any step.
              </p>

              <div className="gf-heading-font font-semibold uppercase" style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--gf-color-accent)", marginTop: 20 }}>
                Full-page capture
              </div>
              <ul className="mt-2.5 flex flex-col gap-2">
                <Bullet>Full page, region, or scrolling-feed capture modes.</Bullet>
                <Bullet>Automatically manages sticky nav bars and pre-triggers lazy-loaded media; stitches long pages with zero overlap.</Bullet>
              </ul>
              <div className="mt-3 border overflow-hidden" style={{ borderColor: "rgba(29,31,32,.12)", height: 170 }}>
                <img src="/features/feature-1.webp" alt="Full-page capture of a long webpage" className="w-full h-full object-cover object-top" />
              </div>

              <div className="gf-heading-font font-semibold uppercase" style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--gf-color-accent)", marginTop: 22 }}>
                Read what&apos;s on screen
              </div>
              <ul className="mt-2.5 flex flex-col gap-2">
                <Bullet>A local WebAssembly model reads text and code out of any image and copies it straight to the clipboard.</Bullet>
              </ul>
              <div className="mt-3 border overflow-hidden" style={{ borderColor: "rgba(29,31,32,.12)", height: 170 }}>
                <img src="/features/feature-2.webp" alt="On-device OCR text extraction result" className="w-full h-full object-cover object-top" />
              </div>

              <div className="gf-heading-font font-semibold uppercase" style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--gf-color-accent)", marginTop: 22 }}>
                Mark it up, keep it private
              </div>
              <ul className="mt-2.5 flex flex-col gap-2">
                <Bullet>Arrows, shapes, and callouts, plus one-click blur and pixelate for sensitive info.</Bullet>
                <Bullet>Export to clipboard, PNG, or a paginated PDF, straight from the result bar.</Bullet>
              </ul>
              <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
                <div className="border overflow-hidden relative" style={{ borderColor: "rgba(29,31,32,.12)", height: 170 }}>
                  <img
                    src="/features/feature-3.webp"
                    alt="Annotated screenshot with arrows and callouts"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "18% 30%", transform: "scale(2)", transformOrigin: "18% 30%" }}
                  />
                </div>
                <div className="border overflow-hidden flex items-center justify-center p-2.5" style={{ borderColor: "rgba(29,31,32,.12)", height: 170, background: "#fff" }}>
                  <img src="/features/feature-4.webp" alt="Export result card with copy, PNG, and PDF options" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </BlueprintFrame>
          </TimelineRow>

          {/* v2.0 current */}
          <TimelineRow
            tag="v2.0"
            tagStyle={{ background: "var(--gf-color-accent)", color: "#fff", borderColor: "var(--gf-color-accent)" }}
            status="CURRENT"
            statusColor="var(--gf-color-accent)"
            dotStyle={{ background: "var(--gf-color-accent)", borderColor: "var(--gf-color-accent)", boxShadow: "0 0 0 4px rgba(22,103,242,.15)" }}
          >
            <div className="p-6 border" style={{ borderColor: "rgba(22,103,242,.3)", background: "rgba(22,103,242,.04)", maxWidth: 600 }}>
              <div className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>
                A complete redesign, top to bottom
              </div>
              <p className="mt-2" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.6)", lineHeight: 1.6 }}>
                Every screen rebuilt on one consistent design system, and a pass through the backlog to fix
                everything that had piled up.
              </p>
              <ul className="mt-3.5 flex flex-col gap-2">
                <Bullet>Popup, editor toolbar, and result screens redesigned with consistent icons, spacing, and type.</Bullet>
                <Bullet>Fixed the full backlog of reported bugs across capture, OCR, and export.</Bullet>
                <Bullet>Shareable capture links, and support for Firefox and Edge alongside Chrome.</Bullet>
              </ul>
            </div>
          </TimelineRow>

          {/* v3.0 next */}
          <TimelineRow
            tag="v3.0"
            tagStyle={{ borderColor: "var(--gf-color-accent)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)" }}
            status="NEXT"
            statusColor="var(--gf-color-accent)"
            dotStyle={{ background: "transparent", borderColor: "rgba(29,31,32,.4)", borderStyle: "dashed", borderWidth: 1.5 }}
            connector={false}
          >
            <div className="p-6 border" style={{ borderStyle: "dashed", borderColor: "rgba(22,103,242,.35)", background: "#fff", maxWidth: 600 }}>
              <div className="gf-heading-font font-semibold" style={{ fontSize: 20 }}>
                Screen recording, GoFully Studio, and more
              </div>
              <p className="mt-2" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.6)", lineHeight: 1.6 }}>
                Bigger bets further out — not scheduled yet.
              </p>
              <ul className="mt-3.5 flex flex-col gap-2">
                <OutlineBullet><strong style={{ color: "#1d1f20" }}>Screen recording</strong> — capture short clips, not just stills.</OutlineBullet>
                <OutlineBullet><strong style={{ color: "#1d1f20" }}>GoFully Studio</strong> — a standalone workspace for organizing and editing captures beyond the popup.</OutlineBullet>
                <OutlineBullet><strong style={{ color: "#1d1f20" }}>Video annotation</strong> — the same arrows, callouts, and blur tools, extended to recordings.</OutlineBullet>
              </ul>
              <div className="mt-4 p-3.5 border" style={{ borderColor: "rgba(22,103,242,.2)", background: "rgba(22,103,242,.05)", fontSize: "12.5px" }}>
                <strong style={{ color: "#1d1f20" }}>Have a request?</strong> This list is still forming — tell us what you&apos;d use next.
              </div>
            </div>
          </TimelineRow>

        </div>
      </div>

      </div>

      {/* CTA band */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "76px 24px" }}>
        <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(22px, 5.5vw, 30px)", color: "#fff", letterSpacing: "-0.01em" }}>
          Try it on your next screenshot
        </div>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 480, marginTop: 12 }}>
          Free, offline, and ready in one click — no account, no setup.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noreferrer"
          className="relative inline-flex items-center justify-center gap-2 border gf-heading-font font-semibold cursor-pointer"
          style={{ height: 46, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: "13.5px", letterSpacing: "0.02em", borderColor: "rgba(29,31,32,.12)", marginTop: 26 }}
        >
          Add to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/roadmap" />
    </div>
  );
}
