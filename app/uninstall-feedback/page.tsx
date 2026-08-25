"use client";

import { useState } from "react";

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="mb-10">
          <img src="/gofully-wordmark-dark.png" alt="GoFully" className="h-8 w-auto" />
        </div>

        {submitted ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#136CDE]/50 bg-[#136CDE]/15 text-[#D2E5FF] mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Thanks for your feedback</h2>
            <p className="mt-3 text-sm text-slate-400">
              It helps us improve GoFully for everyone.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Changed your mind?{" "}
              <a
                href="https://chromewebstore.google.com/detail/gofully-full-page-screens/bjnhkdgbhajlhbcheoppbblbbgdbdbpl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#136CDE] underline"
              >
                Reinstall GoFully
              </a>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">
              Sorry to see you go
            </h1>
            <p className="text-sm text-slate-400 mb-8">
              Why did you uninstall GoFully? Select all that apply.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => toggle(reason)}
                    className={`w-full text-left px-4 py-3 border text-sm transition-colors ${
                      selected.includes(reason)
                        ? "border-[#136CDE] bg-[#136CDE]/10 text-white"
                        : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="mr-3">{selected.includes(reason) ? "✓" : "○"}</span>
                    {reason}
                  </button>
                ))}
              </div>

              {selected.includes("Other") && (
                <textarea
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  rows={3}
                  placeholder="Tell us more..."
                  className="w-full border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#136CDE] focus:outline-none"
                />
              )}

              <button
                type="submit"
                disabled={selected.length === 0}
                className="w-full border border-[#136CDE] bg-[#136CDE] px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-[#136CDE]/25 transition-all hover:bg-[#177BF7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Send Feedback
              </button>

              <p className="text-center text-xs text-slate-600">
                No account needed · Anonymous · Takes 10 seconds
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
