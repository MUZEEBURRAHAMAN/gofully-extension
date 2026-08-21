"use client";

import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { useState } from "react";

const ALL_FAQS = [
  {
    category: "General",
    items: [
      {
        q: "What is GoFully?",
        a: "GoFully is an all-in-one Chrome extension that lets you capture full-height scrolling webpages, extract text with local OCR, annotate visuals with arrows and step markers, redact sensitive details, and export to 4K PNG or PDF.",
      },
      {
        q: "Is GoFully free to use?",
        a: "Yes. GoFully is free to install and use directly from the Chrome Web Store.",
      },
    ],
  },
  {
    category: "Privacy & Technical",
    items: [
      {
        q: "Does GoFully send my screenshots to any server?",
        a: "No. GoFully runs 100% locally in your browser sandbox using WebAssembly and HTML5 Canvas. No image data, extracted text, or user telemetry is transmitted.",
      },
      {
        q: "Does OCR require an internet connection?",
        a: "No. The WebAssembly OCR engine is completely self-contained in the extension and works offline with zero latency.",
      },
    ],
  },
  {
    category: "Capture & Export",
    items: [
      {
        q: "How does full-page stitching handle sticky headers?",
        a: "GoFully detects fixed and sticky navigation bars, temporarily hides them during scrolling captures, and renders a clean seamless full-height image.",
      },
      {
        q: "Can I export multi-page PDFs?",
        a: "Yes. You can export paginated standard A4/Letter PDFs or single full-height continuous document pages.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openMap, setOpenMap] = useState<{ [key: string]: boolean }>({
    "0-0": true,
  });

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8 flex-1">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            Knowledge Base
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base text-slate-400">
            Find answers to common questions about features, privacy, and workflows.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {ALL_FAQS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-sky-400">
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map((item, iIdx) => {
                  const id = `${gIdx}-${iIdx}`;
                  const isOpen = !!openMap[id];
                  return (
                    <div
                      key={iIdx}
                      className="rounded-lg border border-slate-800 bg-slate-900/40 backdrop-blur overflow-hidden transition-colors hover:border-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(id)}
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
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
