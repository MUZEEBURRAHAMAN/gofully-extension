import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" /><path d="M2 9h20" /></svg>
    ),
  },
  {
    n: "EXTRACT",
    body: "A local WebAssembly model reads text off the image on your CPU. Nothing is uploaded for recognition.",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h7" /></svg>
    ),
  },
  {
    n: "STORE",
    body: "Results stay in local browser storage until you export or discard them, and clear automatically when you close the tab.",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="20" height="6" /><rect x="2" y="4" width="20" height="6" /><path d="M6 7h.01M6 17h.01" /></svg>
    ),
  },
];

const PERMISSIONS = [
  {
    name: "activeTab",
    body: "Lets GoFully read the current tab only when you click capture — never in the background, never on tabs you haven't opened it on.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>,
  },
  {
    name: "tabs",
    body: "Coordinates a capture against the specific tab you started it on, and reads that tab's title/URL for export metadata.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>,
  },
  {
    name: "scripting",
    body: "Injects the page-measurement, sticky-header, and lazy-load helper scripts needed to stitch a full-page capture — only on the tab you're capturing.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  },
  {
    name: "offscreen",
    body: "Runs canvas stitching and the local WebAssembly OCR engine in a background document — still entirely on your machine.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 9h20" /></svg>,
  },
  {
    name: "downloads",
    body: "Needed so a PNG, JPG, WebP, or PDF export can save straight to your downloads folder when you choose to save one.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  },
  {
    name: "storage",
    body: "Keeps your editor preferences, capture history, and in-progress result on your machine only — never synced to a server.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="20" height="6" /><rect x="2" y="4" width="20" height="6" /><path d="M6 7h.01M6 17h.01" /></svg>,
  },
  {
    name: "host_permissions (all sites)",
    body: "Full-page and scrolling-area capture need to run on whatever site you're actively viewing when you invoke them — this is user-initiated per page, never a background scan.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  },
];

const DONT_DO = [
  "No cloud uploads of captures, ever",
  "No account or sign-in required",
  "No analytics or usage tracking",
  "No ads or third-party trackers",
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block border gf-heading-font font-semibold uppercase"
      style={{ borderColor: "rgba(29,31,32,.15)", color: "rgba(29,31,32,.45)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "5px 12px" }}
    >
      {children}
    </span>
  );
}

export default function SecurityPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      {/* Breadcrumb Navigation */}
      <div style={{ padding: "40px 24px 10px" }}>
        <div className="mx-auto" style={{ maxWidth: 1000 }}>
          <Breadcrumbs items={[{ label: "Security & Privacy" }]} />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center" style={{ padding: "30px 24px 72px" }}>
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Security &amp; Privacy
          </span>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}>
            Nothing you capture ever leaves your device
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 580, marginTop: 18 }}>
            GoFully runs entirely inside your browser. Capture, text extraction, and editing all happen on-device — there&apos;s no server in the loop, no account to create, and nothing sent anywhere without your permission.
          </p>
        </div>
      </div>

      {/* How your data stays local */}
      <div className="border-t" style={{ padding: "64px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 48 }}>
          <SectionKicker>On-Device by Design</SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Every step of the workflow runs locally
          </h2>
        </div>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-7" style={{ maxWidth: 1320 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border p-6" style={{ borderColor: "rgba(29,31,32,.12)" }}>
              <div className="flex items-center justify-center border mb-4" style={{ width: 40, height: 40, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                {s.icon}
              </div>
              <h3 className="gf-heading-font font-semibold" style={{ fontSize: 16, letterSpacing: "0.01em" }}>{s.n}</h3>
              <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(29,31,32,.55)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div className="border-t" style={{ padding: "80px 24px", borderColor: "rgba(29,31,32,.08)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 52 }}>
          <SectionKicker>Permissions</SectionKicker>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Every permission has a job, and only that job
          </h2>
          <p style={{ fontSize: 14, color: "rgba(29,31,32,.5)", marginTop: 12 }}>
            Chrome requires extensions to declare access up front. Here&apos;s exactly what GoFully asks for and why.
          </p>
        </div>
        <div
          className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-px border"
          style={{ background: "rgba(29,31,32,.12)", borderColor: "rgba(29,31,32,.12)", maxWidth: 1000 }}
        >
          {PERMISSIONS.map((p) => (
            <div key={p.name} className="bg-white flex gap-4" style={{ padding: "24px 28px" }}>
              <div className="flex items-center justify-center border flex-shrink-0" style={{ width: 34, height: 34, borderColor: "rgba(29,31,32,.15)" }}>
                {p.icon}
              </div>
              <div>
                <h3 className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>{p.name}</h3>
                <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(29,31,32,.55)" }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical safeguards */}
      <div className="border-t" style={{ padding: "0 24px 90px", borderColor: "rgba(29,31,32,.08)" }}>
        <div className="mx-auto border" style={{ maxWidth: 1000, borderColor: "rgba(29,31,32,.12)", padding: "40px 32px" }}>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: 22, letterSpacing: "-0.005em", marginBottom: 8 }}>
            Technical safeguards
          </h2>
          <p style={{ fontSize: "13.5px", color: "rgba(29,31,32,.55)", marginBottom: 22, maxWidth: 640, lineHeight: 1.6 }}>
            For the technically curious — specific defenses in how GoFully is built, not just what it promises.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "18px 40px" }}>
            <div style={{ fontSize: "13.5px", color: "rgba(29,31,32,.7)", lineHeight: 1.6 }}>
              <strong className="gf-heading-font font-semibold" style={{ color: "var(--gf-color-text)" }}>Sender-verified tab targeting.</strong> Capture-critical messages resolve the target tab from the browser&apos;s own message sender, not from a value a page could hand the extension — a compromised content script can&apos;t redirect a capture to another tab.
            </div>
            <div style={{ fontSize: "13.5px", color: "rgba(29,31,32,.7)", lineHeight: 1.6 }}>
              <strong className="gf-heading-font font-semibold" style={{ color: "var(--gf-color-text)" }}>Strict image-source validation.</strong> Anything loaded into the editor canvas must be a <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12.5px" }}>data:image/</code> URI — no remote or script-scheme sources are ever accepted.
            </div>
            <div style={{ fontSize: "13.5px", color: "rgba(29,31,32,.7)", lineHeight: 1.6 }}>
              <strong className="gf-heading-font font-semibold" style={{ color: "var(--gf-color-text)" }}>Locked-down content security policy.</strong> <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12.5px" }}>script-src &apos;self&apos;</code> on every extension page — no remotely hosted or inline script can execute.
            </div>
            <div style={{ fontSize: "13.5px", color: "rgba(29,31,32,.7)", lineHeight: 1.6 }}>
              <strong className="gf-heading-font font-semibold" style={{ color: "var(--gf-color-text)" }}>Manifest V3 native.</strong> Built on a non-persistent service worker from day one — not a Manifest V2 extension retrofitted to pass review.
            </div>
          </div>
        </div>
      </div>

      {/* What we don't do */}
      <div style={{ padding: "0 24px 90px" }}>
        <div className="mx-auto border" style={{ maxWidth: 1000, borderColor: "rgba(29,31,32,.12)", background: "rgba(29,31,32,.02)", padding: "40px 32px" }}>
          <h2 className="gf-heading-font font-semibold" style={{ fontSize: 22, letterSpacing: "-0.005em", marginBottom: 22 }}>
            What GoFully doesn&apos;t do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "14px 40px" }}>
            {DONT_DO.map((d) => (
              <div key={d} className="flex items-center gap-2.5" style={{ fontSize: "13.5px", color: "rgba(29,31,32,.65)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vulnerability report band */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Found a security vulnerability?
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          Report it directly to our maintainers. See the{" "}
          <Link href="/support" className="underline text-white">support page</Link> for other contact channels.
        </p>
        <div className="inline-flex items-center justify-center border" style={{ height: 44, padding: "0 22px", borderColor: "rgba(255,255,255,.25)", color: "#fff", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, marginTop: 22 }}>
          rahamanmuzeeb1108@gmail.com
        </div>
      </div>

      <SiteFooterIndustry activeHref="/security" />
    </div>
  );
}
