"use client";

import { useState } from "react";
import { BlueprintFrame } from "@/components/blueprint-frame";

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
  const [submitted, setSubmitted] = useState(false);

  function toggle(reason: string) {
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="gf-industry min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="flex items-center justify-center border"
            style={{ width: 28, height: 28, background: "var(--gf-color-accent)", borderColor: "rgba(29,31,32,.12)" }}
          >
            <img src="/assets/icon-48.png" alt="GoFully" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="gf-heading-font font-semibold" style={{ fontSize: 16, color: "rgba(29,31,32,.4)" }}>
            GoFully
          </span>
        </div>

        {submitted ? (
          <div className="text-center py-12">
            <BlueprintFrame
              className="mx-auto flex items-center justify-center mb-4"
              style={{ width: 56, height: 56, color: "var(--gf-color-accent)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </BlueprintFrame>
            <h2 className="gf-heading-font font-semibold" style={{ fontSize: 22 }}>
              Thanks for your feedback
            </h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(29,31,32,.5)" }}>
              It helps us improve GoFully for everyone.
            </p>
            <p className="mt-6 text-sm" style={{ color: "rgba(29,31,32,.4)" }}>
              Changed your mind?{" "}
              <a
                href="https://chromewebstore.google.com/detail/gofully-full-page-screens/bjnhkdgbhajlhbcheoppbblbbgdbdbpl"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--gf-color-accent)" }}
                className="underline"
              >
                Reinstall GoFully
              </a>
            </p>
          </div>
        ) : (
          <>
            <h1 className="gf-heading-font font-semibold" style={{ fontSize: 26, letterSpacing: "-0.01em", marginBottom: 6 }}>
              Sorry to see you go
            </h1>
            <p className="text-sm mb-6" style={{ color: "rgba(29,31,32,.45)" }}>
              Why did you uninstall GoFully? Select all that apply.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-1.5">
                {reasons.map((reason) => {
                  const checked = selected.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggle(reason)}
                      className="flex items-center gap-2.5 border text-left cursor-pointer transition-colors"
                      style={{
                        padding: "12px 14px",
                        borderColor: checked ? "var(--gf-color-accent)" : "rgba(29,31,32,.12)",
                        background: checked ? "rgba(22,103,242,.06)" : "transparent",
                      }}
                    >
                      <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 16,
                          height: 16,
                          border: `1px solid ${checked ? "var(--gf-color-accent)" : "rgba(29,31,32,.2)"}`,
                          background: checked ? "var(--gf-color-accent)" : "transparent",
                        }}
                      >
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: "12.5px", color: checked ? "var(--gf-color-text)" : "rgba(29,31,32,.6)" }}>
                        {reason}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selected.includes("Other") && (
                <textarea
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  rows={3}
                  placeholder="Tell us more..."
                  className="w-full border px-4 py-3 text-sm focus:outline-none"
                  style={{ borderColor: "rgba(29,31,32,.15)", background: "var(--gf-color-surface)", color: "var(--gf-color-text)" }}
                />
              )}

              <button
                type="submit"
                disabled={selected.length === 0}
                className="relative w-full border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  height: 44,
                  background: "var(--gf-color-accent)",
                  borderColor: "rgba(29,31,32,.12)",
                  color: "#fff",
                  fontFamily: "var(--gf-font-heading)",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                }}
              >
                SEND FEEDBACK
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5">
                  <span className="absolute left-1 top-0 w-px h-full bg-white/30" />
                  <span className="absolute top-1 left-0 w-full h-px bg-white/30" />
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
                  <span className="absolute right-1 top-0 w-px h-full bg-white/30" />
                  <span className="absolute top-1 left-0 w-full h-px bg-white/30" />
                </span>
                <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5">
                  <span className="absolute left-1 top-0 w-px h-full bg-white/30" />
                  <span className="absolute bottom-1 left-0 w-full h-px bg-white/30" />
                </span>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5">
                  <span className="absolute right-1 top-0 w-px h-full bg-white/30" />
                  <span className="absolute bottom-1 left-0 w-full h-px bg-white/30" />
                </span>
              </button>

              <p className="text-center text-xs" style={{ color: "rgba(29,31,32,.35)" }}>
                No account needed · Anonymous · Takes 10 seconds
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
