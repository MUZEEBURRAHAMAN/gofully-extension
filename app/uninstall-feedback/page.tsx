"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { AddToChrome } from "@/components/site/chrome-button";

const SUPPORT_EMAIL = "rahamanmuzeeb1108@gmail.com";

const reasons = [
  "It didn't work as expected",
  "Too many bugs or crashes",
  "Missing features I need",
  "Found a better alternative",
  "Only needed it temporarily",
  "Privacy concerns",
  "Other",
];

export default function UninstallFeedbackPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [sent, setSent] = useState(false);

  function toggle(reason: string) {
    setSelected((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  }

  // No backend: the answers go out as an email the visitor sends from their own mail app.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = [`Reasons: ${selected.join(", ") || "none picked"}`, other && `\n${other}`].filter(Boolean).join("\n");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("[GoFully] Uninstall feedback")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <div className="gf-industry min-h-screen flex flex-col">
      <SiteNav />

      <main className="gf-bye">
        {sent ? (
          <div className="gf-form-card gf-bye-card gf-form-done" role="status">
            <span className="gf-form-done-ico" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <h1>Thanks for telling us</h1>
            <p className="gf-small">Press Send in your email app and it reaches the developer directly. Changed your mind?</p>
            <div className="gf-btn-row gf-btn-row--center">
              <AddToChrome label="Reinstall GoFully" />
              <button type="button" className="gf-btn-s" onClick={() => setSent(false)}>Edit my answers</button>
            </div>
          </div>
        ) : (
          <form className="gf-form-card gf-bye-card" onSubmit={handleSubmit}>
            <header className="gf-bye-head">
              <span className="gf-badge gf-badge--neutral">GoFully was removed</span>
              <h1>Sorry to see you go</h1>
              <p className="gf-small">Why did you uninstall? Pick any that apply. It helps decide what to fix next.</p>
            </header>

            <fieldset className="gf-reasons">
              <legend className="sr-only">Reasons for uninstalling</legend>
              {reasons.map((reason) => (
                <label key={reason} className="gf-reason">
                  <input type="checkbox" checked={selected.includes(reason)} onChange={() => toggle(reason)} />
                  <span className="gf-reason-box" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {reason}
                </label>
              ))}
            </fieldset>

            <label className="gf-field">
              <span>Anything else? (optional)</span>
              <textarea rows={3} value={other} onChange={(e) => setOther(e.target.value)} placeholder="What would have made you stay?" />
            </label>

            <div className="gf-form-foot">
              <button type="submit" className="gf-btn-p" disabled={selected.length === 0 && !other.trim()}>
                Send feedback by email
              </button>
              <Link href="/" className="gf-link-arrow">Skip</Link>
            </div>
            <p className="gf-footnote gf-bye-note">Opens your email app with your answers filled in. Nothing is sent until you press Send.</p>
          </form>
        )}
      </main>

      <SiteFooterIndustry />
    </div>
  );
}
