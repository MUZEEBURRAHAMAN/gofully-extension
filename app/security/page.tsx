"use client";

import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security", active: true },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
];

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
    name: "downloads",
    body: "Needed so a PNG or PDF export can save straight to your downloads folder when you choose to save one.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  },
  {
    name: "clipboardWrite",
    body: "Powers the one-click \"copy to clipboard\" action for both screenshots and extracted text.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>,
  },
  {
    name: "storage",
    body: "Keeps your editor preferences and in-progress result on your machine only — never synced to a server.",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="20" height="6" /><rect x="2" y="4" width="20" height="6" /><path d="M6 7h.01M6 17h.01" /></svg>,
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
      <SiteNav links={NAV_LINKS} />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 72px" }}>
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Security &amp; Privacy
          </span>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}>
            Nothing you capture ever leaves your device
          </div>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 580, marginTop: 18 }}>
            GoFully runs entirely inside your browser. Capture, text extraction, and editing all happen on-device — there&apos;s no server in the loop, no account to create, and nothing sent anywhere without your say-so.
          </p>
        </div>
      </div>

      {/* How your data stays local */}
      <div className="border-t" style={{ padding: "64px 24px", borderColor: "rgba(29,31,32,.08)", background: "rgba(29,31,32,.02)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 48 }}>
          <SectionKicker>On-Device by Design</SectionKicker>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Every step of the workflow runs locally
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-7" style={{ maxWidth: 1320 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border p-6" style={{ borderColor: "rgba(29,31,32,.12)" }}>
              <div className="flex items-center justify-center border mb-4" style={{ width: 40, height: 40, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                {s.icon}
              </div>
              <div className="gf-heading-font font-semibold" style={{ fontSize: 16, letterSpacing: "0.01em" }}>{s.n}</div>
              <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(29,31,32,.55)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div className="border-t" style={{ padding: "80px 24px", borderColor: "rgba(29,31,32,.08)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 640, marginBottom: 52 }}>
          <SectionKicker>Permissions</SectionKicker>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(24px, 6vw, 32px)", letterSpacing: "-0.01em", marginTop: 16 }}>
            Every permission has a job, and only that job
          </div>
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
                <div className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>{p.name}</div>
                <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(29,31,32,.55)" }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What we don't do */}
      <div style={{ padding: "0 24px 90px" }}>
        <div className="mx-auto border" style={{ maxWidth: 1000, borderColor: "rgba(29,31,32,.12)", background: "rgba(29,31,32,.02)", padding: "40px 32px" }}>
          <div className="gf-heading-font font-semibold" style={{ fontSize: 22, letterSpacing: "-0.005em", marginBottom: 22 }}>
            What GoFully doesn&apos;t do
          </div>
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
        <div className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Found a vulnerability?
        </div>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 460, marginTop: 12, lineHeight: 1.6 }}>
          Report it directly and we&apos;ll respond quickly. See the{" "}
          <Link href="/support" className="underline text-white">contact page</Link> for other ways to reach us.
        </p>
        <div className="inline-flex items-center justify-center border" style={{ height: 44, padding: "0 22px", borderColor: "rgba(255,255,255,.25)", color: "#fff", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, marginTop: 22 }}>
          rahamanmuzeeb1108@gmail.com
        </div>
      </div>

      <SiteFooterIndustry activeHref="/security" />
    </div>
  );
}
