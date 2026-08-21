"use client";

import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { useState } from "react";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8 flex-1">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block bg-[#000] border border-slate-700 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            Help & Support Desk
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            How can we help you?
          </h1>
          <p className="mt-4 text-base text-slate-400">
            Have a question, feedback, or a feature suggestion? Our team is here to assist you.
          </p>
        </div>

        <div className="mt-16 border border-slate-800 bg-[#0d1424] p-8 lg:p-12">
          {submitted ? (
            <div className="text-center py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">Thank You!</h3>
              <p className="mt-2 text-sm text-slate-400">
                Your message has been received. Our team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="mt-2 w-full border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className="mt-2 w-full border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Topic / Category
                </label>
                <select className="mt-2 w-full border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white focus:border-sky-500 focus:outline-none">
                  <option>Technical Question / Troubleshooting</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                  <option>General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe your question or issue in detail..."
                  className="mt-2 w-full border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full border border-blue-500 bg-blue-600 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 cursor-pointer"
              >
                Submit Request →
              </button>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
