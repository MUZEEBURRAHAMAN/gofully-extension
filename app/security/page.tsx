import type { Metadata } from "next";
import type { IconName } from "@/ui/ds/icons";
import { DuoGlyph } from "@/components/site/icon";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Security & Permissions Architecture — 100% On-Device",
  description:
    "Learn how GoFully protects your privacy: 100% on-device WebAssembly OCR, zero cloud uploads, minimal Chrome permissions, and no user tracking.",
  alternates: { canonical: "https://gofully-extension.vercel.app/security" },
  openGraph: {
    title: "Security & Permissions Architecture — GoFully",
    description:
      "GoFully runs 100% on-device. Zero telemetry, no cloud uploads, and transparent browser permissions.",
    url: "https://gofully-extension.vercel.app/security",
    siteName: "GoFully",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security & Permissions Architecture — GoFully",
    description:
      "On-device screenshot capture, local OCR, and strict zero-telemetry architecture.",
  },
};

const STEPS = [
  {
    n: "CAPTURE",
    body: "The page is captured and stitched together directly in your browser tab. No screenshot ever crosses the network.",
    icon: "full-page" as IconName,
  },
  {
    n: "EXTRACT",
    body: "A local WebAssembly model reads text off the image on your CPU. Nothing is uploaded for recognition.",
    icon: "text-ocr" as IconName,
  },
  {
    n: "STORE",
    body: "Results stay in local browser storage until you export or discard them, and clear automatically when you close the tab.",
    icon: "history" as IconName,
  },
];

const PERMISSIONS = [
  {
    name: "activeTab",
    body: "Lets GoFully read the current tab only when you click capture — never in the background, never on tabs you haven't opened it on.",
    icon: "mouse" as IconName,
  },
  {
    name: "tabs",
    body: "Coordinates a capture against the specific tab you started it on, and reads that tab's title/URL for export metadata.",
    icon: "layers" as IconName,
  },
  {
    name: "scripting",
    body: "Injects the page-measurement, sticky-header, and lazy-load helper scripts needed to stitch a full-page capture — only on the tab you're capturing.",
    icon: "scroll" as IconName,
  },
  {
    name: "offscreen",
    body: "Runs canvas stitching and the local WebAssembly OCR engine in a background document — still entirely on your machine.",
    icon: "image" as IconName,
  },
  {
    name: "downloads",
    body: "Needed so a PNG, JPG, WebP, or PDF export can save straight to your downloads folder when you choose to save one.",
    icon: "download" as IconName,
  },
  {
    name: "storage",
    body: "Keeps your editor preferences, capture history, and in-progress result on your machine only — never synced to a server.",
    icon: "history" as IconName,
  },
  {
    name: "host_permissions (all sites)",
    body: "Full-page and scrolling-area capture need to run on whatever site you're actively viewing when you invoke them — this is user-initiated per page, never a background scan.",
    icon: "language" as IconName,
  },
];

const DONT_DO = [
  "No cloud uploads of captures, ever",
  "No account or sign-in required",
  "No analytics or usage tracking",
  "No ads or third-party trackers",
];

export default function SecurityPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "Security & Privacy" }]} />
      </div>

      <PageHeader
        eyebrow="Security & Privacy"
        title="Nothing you capture ever leaves your device"
        lede="GoFully runs entirely inside your browser. Capture, text extraction, and editing all happen on-device — there’s no server in the loop, no account to create, and nothing sent anywhere without your permission."
      />

      <section className="gf-sec gf-sec--sunken">
        <div className="gf-sec-head">
          <span className="gf-badge gf-badge--blue">On-device by design</span>
          <h2>Every step of the workflow runs locally</h2>
        </div>
        <ol className="gf-flow">
          {STEPS.map((s) => (
            <li key={s.n} className="gf-flow-item">
              <span className="gf-duo gf-flow-ico"><DuoGlyph name={s.icon} size={22} /></span>
              <h3>{s.n.charAt(0) + s.n.slice(1).toLowerCase()}</h3>
              <p className="gf-small">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="gf-sec">
        <div className="gf-sec-head">
          <span className="gf-badge gf-badge--blue">Permissions</span>
          <h2>Every permission has a job, and only that job</h2>
          <p className="gf-lede">Chrome requires extensions to declare access up front. Here&apos;s exactly what GoFully asks for and why.</p>
        </div>
        <div className="gf-perm-grid">
          {PERMISSIONS.map((p) => (
            <div key={p.name} className="gf-perm">
              <span className="gf-duo gf-perm-ico"><DuoGlyph name={p.icon} size={18} /></span>
              <div>
                <h3><code>{p.name}</code></h3>
                <p className="gf-small">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gf-sec gf-sec--tight">
        <div className="gf-panel">
          <h2>Technical safeguards</h2>
          <p className="gf-small">For the technically curious — specific defenses in how GoFully is built, not just what it promises.</p>
          <div className="gf-panel-grid">
            <p className="gf-small"><strong>Sender-verified tab targeting.</strong> Capture-critical messages resolve the target tab from the browser&apos;s own message sender, not from a value a page could hand the extension — a compromised content script can&apos;t redirect a capture to another tab.</p>
            <p className="gf-small"><strong>Strict image-source validation.</strong> Anything loaded into the editor canvas must be a <code>data:image/</code> URI — no remote or script-scheme sources are ever accepted.</p>
            <p className="gf-small"><strong>Locked-down content security policy.</strong> <code>script-src &apos;self&apos;</code> on every extension page — no remotely hosted or inline script can execute.</p>
            <p className="gf-small"><strong>Manifest V3 native.</strong> Built on a non-persistent service worker from day one — not a Manifest V2 extension retrofitted to pass review.</p>
          </div>
        </div>

        <div className="gf-panel gf-panel--sunken">
          <h2>What GoFully doesn&apos;t do</h2>
          <ul className="gf-nolist">
            {DONT_DO.map((d) => (
              <li key={d}>
                <span className="gf-x" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Found a security vulnerability?"
        sub="Report it directly to our maintainers through the Support page."
        action={{ href: "/support", label: "Report it on the Support page" }}
      />

      <SiteFooterIndustry activeHref="/security" />
    </div>
  );
}
