"use client";

import Hero26 from "@/components/originkit/hero-26";
import { SiteFooter } from "@/components/footer";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Is GoFully really 100% on-device and private?",
    a: "Yes. GoFully runs entirely in your local browser sandbox using Manifest V3 and WebAssembly. Your screenshots, extracted text, and annotations never touch any external server or third-party cloud. You can verify this anytime via Chrome DevTools Network Tab.",
  },
  {
    q: "How does Full-Page Capture work on infinite feeds?",
    a: "GoFully uses automated viewport stitching combined with lazy-load detection. It simulates smooth scrolling, waits for dynamic media or virtual lists to settle, and composes a pixel-perfect canvas in memory with zero overlap.",
  },
  {
    q: "How fast is the local WebAssembly OCR?",
    a: "Our embedded OCR engine runs directly on your CPU/WASM threads in milliseconds. It extracts paragraphs, tables, and code snippets from any screenshot with zero network latency.",
  },
  {
    q: "Can I redact sensitive tokens, API keys, or personal details?",
    a: "Yes. The built-in CleanShot-grade visual studio includes both pixelation and gaussian blur tools, as well as step markers, callout arrows, spotlight highlights, and shapes.",
  },
  {
    q: "What export formats are supported?",
    a: "You can export single or stitched full-height captures as 4K lossless PNG, WebP, multi-page paginated PDF, or copy directly to your clipboard in a single keystroke.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100">
      {/* NATIVE ORIGINKIT HERO 26 */}
      <Hero26 />

      {/* CORE FEATURES BENTO SECTION */}
      <section id="features" className="relative py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-[#070b14]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Complete Capture Studio
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Engineered for Speed, Privacy & Precision
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Everything you need to capture, parse, annotate, and deliver high-impact visuals without ever leaving your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Full-Height CDP Capture */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Full-Page Capture</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Seamlessly scroll and stitch full-length websites, dashboards, and feeds with automated sticky header suppression.
              </p>
            </div>

            {/* Feature 2: Local WASM OCR */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">On-Device OCR</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Extract readable text, code, or data tables from any graphic instantly using embedded local WebAssembly models.
              </p>
            </div>

            {/* Feature 3: Visual Annotation Studio */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">CleanShot Studio</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Mark up screenshots with auto-incrementing numbered steps, curved arrows, spotlight magnifiers, and text callouts.
              </p>
            </div>

            {/* Feature 4: Privacy & Redaction */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Security & Redaction</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Blur or pixelate passwords, credentials, tokens, and personal identifying information before sharing.
              </p>
            </div>

            {/* Feature 5: Multi-Format 4K Export */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">4K & PDF Export</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Generate paginated multi-page PDF documents or download 4K crisp PNG/WebP files ready for reports and presentations.
              </p>
            </div>

            {/* Feature 6: Zero Latency Performance */}
            <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-900/70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Zero Cloud Latency</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                No uploads, no waiting for remote server queues, and no rate limits. Works even when you are completely offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY GUARANTEE BANNER */}
      <section className="py-20 px-6 lg:px-8 bg-[#0a1020] border-y border-slate-800">
        <div className="mx-auto max-w-5xl rounded-2xl border border-sky-500/30 bg-sky-950/20 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy & Local Guarantee
            </div>
            <h3 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              100% In-Browser. No Cloud Storage.
            </h3>
            <p className="mt-3 text-sm text-slate-300 max-w-xl leading-relaxed">
              Unlike cloud capture tools that upload your private screenshots to remote servers, GoFully operates entirely within your browser sandbox. Your data remains strictly on your device.
            </p>
          </div>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-md bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 shadow-xl transition-all hover:bg-slate-200"
          >
            Add to Chrome Free →
          </a>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-900/40 backdrop-blur overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium text-white"
                >
                  <span className="text-base font-semibold">{item.q}</span>
                  <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-sm font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-6 lg:px-8 text-center border-t border-slate-800 bg-gradient-to-b from-[#070b14] to-[#040812]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Capture Smarter?
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Install GoFully on Chrome in seconds. 100% free, private, and on-device.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500"
            >
              <span>Add to Chrome — It's Free</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
