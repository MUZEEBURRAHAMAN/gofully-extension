import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-6 py-20 lg:px-8 flex-1 prose prose-invert prose-slate">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="text-xs font-mono uppercase text-slate-400">Last updated: August 2026</p>

        <section className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            GoFully ("we", "our", or "the Extension") is dedicated to protecting your privacy. This Privacy Policy explains our practices regarding user data and information security.
          </p>

          <h2 className="text-xl font-bold text-white">1. Core Privacy Principle: 100% On-Device Processing</h2>
          <p>
            GoFully does not collect, transmit, store, or sell any personal data, browsing history, screenshot images, or extracted text. All computations, OCR recognition, image stitching, and editor operations take place locally on your computer inside the isolated Google Chrome extension sandbox.
          </p>

          <h2 className="text-xl font-bold text-white">2. Permissions & Scope</h2>
          <p>
            The Extension requires minimal browser permissions strictly to perform requested user actions:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li><strong>activeTab</strong>: Used to capture the visible tab when you click the extension action.</li>
            <li><strong>storage</strong>: Used to persist your local user preferences (such as default export format or image quality) on your device.</li>
            <li><strong>offscreen</strong>: Used for hardware-accelerated image stitching and OCR processing in isolated sandboxes without disrupting your browsing.</li>
          </ul>

          <h2 className="text-xl font-bold text-white">3. Third-Party Services</h2>
          <p>
            GoFully does not integrate third-party analytics, user trackers, advertisement SDKs, or cloud storage providers.
          </p>

          <h2 className="text-xl font-bold text-white">4. Contact Information</h2>
          <p>
            For privacy inquiries or technical questions, please reach out via our <a href="/support" className="text-sky-400 underline">Support Desk</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
