"use client";

import Hero26 from "@/components/originkit/hero-26";
import { SiteFooter } from "@/components/footer";

const STEPS = [
  {
    stepNumber: "01",
    stepTag: "Step: 1",
    title: "Full-Page Scrolling Capture",
    description:
      "Seamlessly capture full-height websites, dashboards, and long articles. GoFully automatically scrolls the page, waits for lazy-loaded images, suppresses sticky headers, and composes a pixel-perfect canvas in memory.",
    footerPill: "AUTOMATED VIEWPORT STITCHING • ZERO OVERLAP",
    icon: (
      <svg className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    stepNumber: "02",
    stepTag: "Step: 2",
    title: "Local WebAssembly OCR",
    description:
      "Instantly extract text, code snippets, and data tables from any graphic or captured region. Powered by an embedded WebAssembly model running 100% locally on your CPU with zero cloud transmission.",
    footerPill: "ON-DEVICE WASM ENGINE • ZERO LATENCY • 100% OFFLINE",
    icon: (
      <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    stepNumber: "03",
    stepTag: "Step: 3",
    title: "CleanShot Visual Studio",
    description:
      "Mark up captures with auto-incrementing numbered step bubbles, smooth curved arrows, spotlight magnifiers, and text callouts. Blur or pixelate sensitive tokens, passwords, and personal details in one click.",
    footerPill: "STEP MARKERS • ARROWS • SENSITIVE DATA REDACTION",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    stepNumber: "04",
    stepTag: "Step: 4",
    title: "4K Lossless & PDF Export",
    description:
      "Generate clean paginated multi-page PDF documents or download 4K crisp PNG and WebP files ready for slide decks, customer reports, and documentation. Or copy directly to your clipboard in a single stroke.",
    footerPill: "4K PNG • LOSSLESS WEBP • PAGINATED MULTI-PAGE PDF",
    icon: (
      <svg className="h-10 w-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100">
      {/* NATIVE ORIGINKIT HERO 26 */}
      <Hero26 />

      {/* STEP-BY-STEP CAPTURE STUDIO SECTION */}
      <section id="features" className="relative py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-[#070b14]">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block bg-[#000] border border-slate-700 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Complete Capture Studio
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
              How GoFully Works
            </h2>
            <p className="mt-4 text-base text-slate-400">
              A complete end-to-end capture, OCR extraction, annotation, and export workflow designed for high-performance teams.
            </p>
          </div>

          {/* Sequential Step Showcases */}
          <div className="space-y-12">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="border border-slate-800 bg-[#0a0f1d] grid grid-cols-1 lg:grid-cols-12 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                {/* Left Column: Content */}
                <div className="relative p-8 lg:p-14 flex flex-col justify-between lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-800/80">
                  <div>
                    {/* Step Tag */}
                    <div className="inline-block border border-slate-700 bg-black/60 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      {step.stepTag}
                    </div>

                    {/* Step Title */}
                    <h3 className="mt-6 text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="mt-4 text-sm lg:text-base text-slate-400 leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>

                  {/* Watermark Number & Footer Ticker */}
                  <div className="mt-12">
                    <div className="text-6xl lg:text-8xl font-extrabold font-mono text-slate-800/40 select-none tracking-tighter">
                      {step.stepNumber}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <span className="text-slate-600">|</span>
                      <span>{step.footerPill}</span>
                      <span className="text-slate-600">|</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Matrix Showcase */}
                <div className="relative p-8 lg:p-14 flex items-center justify-center bg-[#070b14] lg:col-span-6 overflow-hidden">
                  {/* Subtle Grid / Matrix Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Central Visual Card */}
                  <div className="relative z-10 w-full max-w-md border border-slate-800 bg-[#0d1424]/90 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                    <div className={`flex h-20 w-20 items-center justify-center border ${step.badgeColor} mb-6`}>
                      {step.icon}
                    </div>

                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      {step.title}
                    </div>
                    <div className="mt-2 text-xs font-mono text-slate-400">
                      100% IN-BROWSER EXECUTION
                    </div>

                    <div className="mt-6 w-full border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
                      <span>Status: Ready</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY GUARANTEE BANNER */}
      <section className="py-20 px-6 lg:px-8 bg-[#0a1020] border-y border-slate-800">
        <div className="mx-auto max-w-6xl border border-sky-500/30 bg-sky-950/20 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy & Local Guarantee
            </div>
            <h3 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl tracking-tight">
              100% In-Browser. No Cloud Storage.
            </h3>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unlike cloud capture tools that upload your private screenshots to remote servers, GoFully operates entirely within your browser sandbox. Your data remains strictly on your device.
            </p>
          </div>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap border border-white bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 shadow-xl transition-all hover:bg-slate-200 cursor-pointer"
          >
            Add to Chrome Free →
          </a>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-6 lg:px-8 text-center border-t border-slate-800 bg-gradient-to-b from-[#070b14] to-[#040812]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
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
              className="inline-flex items-center gap-2 border border-blue-500 bg-blue-600 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 cursor-pointer"
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
