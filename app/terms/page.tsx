import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-6 py-20 lg:px-8 flex-1 prose prose-invert prose-slate">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Terms of Service</h1>
        <p className="text-xs font-mono uppercase text-slate-400">Last updated: August 2026</p>

        <section className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            By installing or using GoFully ("the Software"), you agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-white">1. License & Usage</h2>
          <p>
            GoFully grants you a personal, non-exclusive, revocable license to use the Software in compliance with applicable laws and Chrome Web Store policies.
          </p>

          <h2 className="text-xl font-bold text-white">2. User Responsibility</h2>
          <p>
            You are solely responsible for all content, screenshots, and visual assets captured and exported using GoFully. You agree not to use the Software to infringe intellectual property rights or capture restricted sensitive information without appropriate authorization.
          </p>

          <h2 className="text-xl font-bold text-white">3. Disclaimer of Warranties</h2>
          <p>
            The Software is provided "as is" without warranty of any kind. We make no representations regarding 100% uptime, error-free captures on non-standard dynamic web layouts, or fitness for particular legal document workflows.
          </p>

          <h2 className="text-xl font-bold text-white">4. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time by updating this document. Continued use of the Software constitutes agreement to updated terms.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
