"use client";

import Hero26 from "@/components/originkit/hero-26";
import { SiteFooter } from "@/components/footer";

const FEATURES = [
  {
    number: "01",
    tag: "CAPTURE ENGINE",
    title: "Full-Page Scrolling Capture",
    description:
      "Seamlessly capture full-height websites, complex dashboards, and infinite scroll feeds. GoFully automatically scrolls the page, waits for lazy-loaded content, suppresses sticky navigation bars, and composes a pixel-perfect high-res canvas with zero overlap.",
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
    number: "02",
    tag: "LOCAL OCR & WASM",
    title: "On-Device Text & Code Extraction",
    description:
      "Extract readable text, code snippets, and structured tables from any graphic or screen region in milliseconds. Embedded local WebAssembly models execute directly on your CPU with zero cloud transmission or network latency.",
    footerPill: "ON-DEVICE WASM ENGINE • ZERO LATENCY • 100% OFFLINE",
    icon: (
      <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    number: "03",
    tag: "VISUAL EDITOR & REDACTION",
    title: "CleanShot-Grade Annotation Studio",
    description:
      "Mark up screenshots with auto-incrementing step bubbles, curved arrows, spotlight magnifiers, callouts, and geometric shapes. Instantly blur or pixelate sensitive API keys, passwords, and PII before sharing.",
    footerPill: "STEP MARKERS • ARROWS • SENSITIVE DATA REDACTION",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    number: "04",
    tag: "EXPORT & INTEGRATIONS",
    title: "4K Lossless & Multi-Page PDF Export",
    description:
      "Generate clean paginated multi-page PDF documents or download 4K crisp PNG and WebP files ready for presentations and client reports. Or copy directly to your system clipboard in a single stroke.",
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

      {/* CORE FEATURES SHOWCASE SECTION */}
      <section id="features" className="relative py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-[#070b14]">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block bg-[#000] border border-slate-700 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Core Features
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
              Powerful Features for Modern Workflows
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Engineered from the ground up to capture, extract, annotate, and deliver pixel-perfect visual intelligence with zero cloud latency.
            </p>
          </div>

          {/* Sequential Feature Showcases */}
          <div className="space-y-12">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="border border-slate-800 bg-[#0a0f1d] grid grid-cols-1 lg:grid-cols-12 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                {/* Left Column: Content */}
                <div className="relative p-8 lg:p-14 flex flex-col justify-between lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-800/80">
                  <div>
                    {/* Feature Tag */}
                    <div className="inline-block border border-slate-700 bg-black/60 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                      {feature.tag}
                    </div>

                    {/* Feature Title */}
                    <h3 className="mt-6 text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {feature.title}
                    </h3>

                    {/* Feature Description */}
                    <p className="mt-4 text-sm lg:text-base text-slate-400 leading-relaxed max-w-lg">
                      {feature.description}
                    </p>
                  </div>

                  {/* Watermark Number & Footer Ticker */}
                  <div className="mt-12">
                    <div className="text-6xl lg:text-8xl font-extrabold font-mono text-slate-800/40 select-none tracking-tighter">
                      {feature.number}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <span className="text-slate-600">|</span>
                      <span>{feature.footerPill}</span>
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
                    <div className={`flex h-20 w-20 items-center justify-center border ${feature.badgeColor} mb-6`}>
                      {feature.icon}
                    </div>

                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      {feature.title}
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

      {/* UNIFIED CALL TO ACTION & PRIVACY SECTION */}
      <section className="py-28 px-6 lg:px-8 text-center border-t border-slate-800 bg-gradient-to-b from-[#070b14] via-[#080e1c] to-[#040812]">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#000] border border-sky-500/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400 mb-6">
            100% In-Browser • Zero Cloud Storage
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            Ready to Capture Smarter?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unlike cloud tools that upload your private screenshots to remote servers, GoFully operates entirely within your browser sandbox. 100% free, private, and on-device.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-blue-500 bg-blue-600 px-8 py-4 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 cursor-pointer"
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
