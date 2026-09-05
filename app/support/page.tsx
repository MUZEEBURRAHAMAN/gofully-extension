"use client";

import { useState } from "react";
import Link from "next/link";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";
const REPO_URL = "https://github.com/MUZEEBURRAHAMAN/gofully-extension";

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support", active: true },
  { label: "FAQ", href: "/faq" },
];

const CHANNELS = [
  {
    title: "Email support",
    body: "For anything not urgent — we typically reply within a day.",
    value: "rahamanmuzeeb1108@gmail.com",
    href: "mailto:rahamanmuzeeb1108@gmail.com",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" /><path d="m2 7 10 6 10-6" /></svg>,
  },
  {
    title: "GitHub",
    body: "Report bugs or request features in the open, alongside other users.",
    value: "github.com/MUZEEBURRAHAMAN/gofully-extension",
    href: REPO_URL,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>,
  },
];

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="gf-industry min-h-screen">
      <SiteNav links={NAV_LINKS} />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 64px" }}>
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Contact
          </span>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}>
            Get in touch
          </div>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 520, marginTop: 18 }}>
            Questions, feedback, or a bug to report — we read everything.
          </p>
        </div>
      </div>

      {/* Form + channels */}
      <div style={{ padding: "0 24px 100px" }}>
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] items-start" style={{ maxWidth: 1080, gap: 40 }}>
          {/* Form */}
          <BlueprintFrame className="bg-white" style={{ padding: 40 }}>
            {submitted ? (
              <div className="text-center" style={{ padding: "48px 0" }}>
                <div className="mx-auto flex items-center justify-center border" style={{ width: 56, height: 56, borderColor: "rgba(22,103,242,.3)", background: "rgba(22,103,242,.08)", color: "var(--gf-color-accent)", marginBottom: 16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="gf-heading-font font-semibold" style={{ fontSize: 22 }}>Thanks for reaching out</div>
                <p className="mt-2" style={{ fontSize: 14, color: "rgba(29,31,32,.5)" }}>We&apos;ve got your message and will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 18, marginBottom: 18 }}>
                  <div>
                    <label className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Name</label>
                    <input type="text" required placeholder="Your name" className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Bricolage Grotesque', system-ui, sans-serif", color: "#1d1f20", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Email</label>
                    <input type="email" required placeholder="you@example.com" className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Bricolage Grotesque', system-ui, sans-serif", color: "#1d1f20", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Topic</label>
                  <select className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Bricolage Grotesque', system-ui, sans-serif", color: "#1d1f20", boxSizing: "border-box" }}>
                    <option>General question</option>
                    <option>Bug report</option>
                    <option>Feature request</option>
                    <option>Security issue</option>
                  </select>
                </div>

                <div style={{ marginBottom: 26 }}>
                  <label className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Message</label>
                  <textarea required rows={5} placeholder="How can we help?" className="w-full border" style={{ padding: "12px 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px/1.5 'Bricolage Grotesque', system-ui, sans-serif", color: "#1d1f20", boxSizing: "border-box", resize: "vertical" }} />
                </div>

                <button
                  type="submit"
                  className="relative inline-flex items-center justify-center gap-2 gf-heading-font font-semibold cursor-pointer"
                  style={{ height: 46, padding: "0 26px", background: "var(--gf-color-accent)", color: "#fff", fontSize: "13.5px", letterSpacing: "0.02em", border: "none" }}
                >
                  Send Message
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              </form>
            )}
          </BlueprintFrame>

          {/* Alternate channels */}
          <div className="flex flex-col" style={{ gap: 16 }}>
            {CHANNELS.map((c) => (
              <BlueprintFrame key={c.title} className="bg-white flex gap-3.5 items-start" style={{ padding: "22px 24px" }}>
                <div className="flex items-center justify-center border flex-shrink-0" style={{ width: 36, height: 36, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                  {c.icon}
                </div>
                <div>
                  <div className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>{c.title}</div>
                  <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(29,31,32,.55)" }}>{c.body}</p>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noreferrer" : undefined} className="block mt-2" style={{ font: "12px ui-monospace, Menlo, monospace", color: "var(--gf-color-accent)", wordBreak: "break-all" }}>
                    {c.value}
                  </a>
                </div>
              </BlueprintFrame>
            ))}
            <BlueprintFrame className="bg-white flex gap-3.5 items-start" style={{ padding: "22px 24px" }}>
              <div className="flex items-center justify-center border flex-shrink-0" style={{ width: 36, height: 36, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <div>
                <div className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>Help center</div>
                <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(29,31,32,.55)" }}>
                  Guides for setup, permissions, and troubleshooting. See also the{" "}
                  <Link href="/faq" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>FAQ</Link>.
                </p>
              </div>
            </BlueprintFrame>
          </div>
        </div>
      </div>

      <SiteFooterIndustry activeHref="/support" />
    </div>
  );
}
