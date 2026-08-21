import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto w-full max-w-5xl px-6 py-20 lg:px-8 flex-1">
        <span className="inline-block bg-[#000] border border-slate-700 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
          Legal
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-xs font-mono uppercase text-slate-400">Last updated: August 2026</p>

        <section className="mt-12 space-y-8 text-sm text-slate-300 leading-relaxed border border-slate-800 bg-[#0d1424] p-8 lg:p-12">
          <p>
            By installing or using GoFully ("the Software"), you agree to be bound by these Terms of Service.
          </p>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. License & Usage</h2>
            <p>
              GoFully grants you a personal, non-exclusive, revocable license to use the Software in compliance with applicable laws and Chrome Web Store policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. User Responsibility</h2>
            <p>
              You are solely responsible for all content, screenshots, and visual assets captured and exported using GoFully. You agree not to use the Software to infringe intellectual property rights or capture restricted sensitive information without appropriate authorization.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Disclaimer of Warranties</h2>
            <p>
              The Software is provided "as is" without warranty of any kind. We make no representations regarding 100% uptime, error-free captures on non-standard dynamic web layouts, or fitness for particular legal document workflows.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time by updating this document. Continued use of the Software constitutes agreement to updated terms.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
