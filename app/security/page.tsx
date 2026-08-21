import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8 flex-1">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block bg-[#000] border border-[#0b43a2]/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[#9fc7ff]">
            Security & Privacy Architecture
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
            100% On-Device. Zero Cloud Transmission.
          </h1>
          <p className="mt-4 text-base text-slate-400">
            GoFully was architected with a strict privacy-first model: your data never leaves your browser sandbox.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          <div className="border border-slate-800 bg-[#0d1424] p-8 lg:p-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-[#0b43a2]/50 bg-[#0b43a2]/15 text-[#9fc7ff] font-mono text-xs font-bold">01</span>
              Local WebAssembly Execution
            </h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Optical Character Recognition (OCR), image stitching, and visual annotation rendering are executed directly via WebAssembly (WASM) and HTML5 Canvas inside your local Chrome sandbox. No images or text are streamed to cloud endpoints.
            </p>
          </div>

          <div className="border border-slate-800 bg-[#0d1424] p-8 lg:p-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-[#0b43a2]/50 bg-[#0b43a2]/15 text-[#9fc7ff] font-mono text-xs font-bold">02</span>
              Manifest V3 Security Compliance
            </h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              GoFully adheres strictly to Google Chrome Manifest V3 standards. It requires no background telemetry permissions, does not inject trackers, and uses minimal scoped permissions for active tab captures.
            </p>
          </div>

          <div className="border border-slate-800 bg-[#0d1424] p-8 lg:p-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-[#0b43a2]/50 bg-[#0b43a2]/15 text-[#9fc7ff] font-mono text-xs font-bold">03</span>
              How to Verify In Chrome DevTools
            </h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Open Chrome DevTools (`F12` or `Cmd+Option+I`), navigate to the **Network** tab, and perform a full-page capture or OCR extraction. You will observe zero outgoing requests containing screenshot binaries or text data.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
