"use client";

import { useState } from "react";
import { BlueprintFrame } from "@/components/blueprint-frame";

export function SupportForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
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
              <label htmlFor="support-name" className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Name</label>
              <input id="support-name" type="text" required placeholder="Your name" className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Inter', sans-serif", color: "#1d1f20", boxSizing: "border-box" }} />
            </div>
            <div>
              <label htmlFor="support-email" className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Email</label>
              <input id="support-email" type="email" required placeholder="you@example.com" className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Inter', sans-serif", color: "#1d1f20", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="support-topic" className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Topic</label>
            <select id="support-topic" className="w-full border" style={{ height: 44, padding: "0 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px 'Inter', sans-serif", color: "#1d1f20", boxSizing: "border-box" }}>
              <option>General question</option>
              <option>Bug report</option>
              <option>Feature request</option>
              <option>Security issue</option>
            </select>
          </div>

          <div style={{ marginBottom: 26 }}>
            <label htmlFor="support-message" className="gf-heading-font font-semibold uppercase block" style={{ fontSize: 12, letterSpacing: "0.03em", color: "rgba(29,31,32,.5)", marginBottom: 8 }}>Message</label>
            <textarea id="support-message" required rows={5} placeholder="How can we help?" className="w-full border" style={{ padding: "12px 14px", borderColor: "rgba(29,31,32,.18)", background: "#fff", font: "13.5px/1.5 'Inter', sans-serif", color: "#1d1f20", boxSizing: "border-box", resize: "vertical" }} />
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
  );
}
