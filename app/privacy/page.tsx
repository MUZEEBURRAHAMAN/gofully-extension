import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto w-full max-w-5xl px-6 py-20 lg:px-8 flex-1">
        <span className="inline-block bg-[#000] border border-[#136CDE]/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[#D2E5FF]">
          Legal & Compliance
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
          Privacy Policy
        </h1>
        <div className="mt-3 flex items-center gap-4 text-xs font-mono uppercase text-slate-400">
          <span>Effective Date: August 21, 2026</span>
          <span>•</span>
          <span>Version 2.5</span>
          <span>•</span>
          <span className="text-[#D2E5FF]">100% On-Device Architecture</span>
        </div>

        <div className="mt-12 space-y-12 text-sm text-slate-300 leading-relaxed border border-slate-800 bg-[#0d1424] p-8 lg:p-14">
          {/* Executive Summary */}
          <div className="border-b border-slate-800/80 pb-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">§</span> Executive Privacy Commitment
            </h2>
            <p className="text-slate-300 leading-relaxed">
              GoFully ("we", "us", "our", or "the Extension") is engineered with an uncompromising privacy-first architecture. <strong>We do not collect, transmit, store, monetize, or share your screenshots, captured web content, extracted OCR text, or browsing history.</strong> Every computation, image stitching algorithm, optical recognition pass, and visual annotation occurs strictly within your local computer’s browser sandbox.
            </p>
          </div>

          {/* Section 1: Zero Personal Data Collection Policy */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">1.</span> Zero Personal Data Collection Policy
            </h2>
            <p className="mb-3">
              Unlike cloud-hosted screen recording or capture tools that upload your files to remote cloud servers, GoFully operates entirely in-memory on your client device:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong>Zero Image Uploads:</strong> Screenshots (full-page, visible area, or selected region) are generated and rendered directly into local HTML5 Canvas elements in your device's memory.</li>
              <li><strong>Zero Text or OCR Exfiltration:</strong> Text recognized by the embedded WebAssembly OCR engine is processed strictly on your local CPU. No extracted text strings are ever sent over the network.</li>
              <li><strong>Zero Tracking or Telemetry:</strong> We do not embed Google Analytics, Mixpanel, Segment, advertising trackers, fingerprinting scripts, or session recording SDKs in the extension.</li>
              <li><strong>Zero User Accounts:</strong> GoFully does not require account creation, logins, email addresses, passwords, or personal credentials to function.</li>
            </ul>
          </div>

          {/* Section 2: Browser Permissions & Technical Justifications */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">2.</span> Manifest V3 Scoped Permissions & Justifications
            </h2>
            <p className="mb-4">
              In accordance with Google Chrome Web Store Developer Program Policies, GoFully requests only the absolute minimum permissions strictly necessary to execute its primary features:
            </p>
            <div className="space-y-4">
              <div className="border border-slate-800 bg-[#070b14] p-4">
                <div className="font-mono text-xs font-bold text-[#D2E5FF]">activeTab</div>
                <p className="mt-1 text-xs text-slate-400">
                  Allows the extension to capture pixel data from the currently active browser tab solely when you explicitly initiate a capture action. It grants no access to other tabs or background browsing.
                </p>
              </div>

              <div className="border border-slate-800 bg-[#070b14] p-4">
                <div className="font-mono text-xs font-bold text-[#D2E5FF]">storage (Local)</div>
                <p className="mt-1 text-xs text-slate-400">
                  Used exclusively with `chrome.storage.local` to store your non-identifying tool settings (such as default export format PNG/PDF, canvas annotation colors, and screenshot quality options) on your local hard drive.
                </p>
              </div>

              <div className="border border-slate-800 bg-[#070b14] p-4">
                <div className="font-mono text-xs font-bold text-[#D2E5FF]">offscreen (Manifest V3)</div>
                <p className="mt-1 text-xs text-slate-400">
                  Used to create an isolated background document to handle multi-megapixel canvas stitching, blur/pixelation filters, and WebAssembly OCR execution without freezing your active webpage interface.
                </p>
              </div>

              <div className="border border-slate-800 bg-[#070b14] p-4">
                <div className="font-mono text-xs font-bold text-[#D2E5FF]">scripting / debugger (Optional / CDP Capture)</div>
                <p className="mt-1 text-xs text-slate-400">
                  Used exclusively when capturing high-resolution full-page screenshots to automate smooth viewport scroll positions, suppress fixed/sticky headers during scrolling, and ensure pixel-perfect image stitching.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Data Security & Sandboxing (Strong Absolute Language) */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">3.</span> 100% Local Processing & Client-Side Sandboxing
            </h2>
            <p className="mb-3 leading-relaxed">
              <strong>GoFully is strictly an on-device utility.</strong> Screenshot data, canvas annotations, image pixels, and OCR recognized text are never uploaded, streamed, cached, or transmitted to remote servers under any circumstances. There are zero remote cloud endpoints or backend databases connected to the extension runtime.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>All visual data created during your editing session (including drawings, arrows, text callouts, shapes, and redaction masks) is held strictly in transient browser RAM.</li>
              <li>When you close the GoFully editor tab, the temporary in-memory canvas is completely deallocated by your browser's garbage collector.</li>
              <li>Exported files (PNG, WebP, PDF) are downloaded directly to your local file system via browser Blob URLs (`blob:chrome-extension://...`).</li>
              <li>Data copied to the clipboard (such as extracted OCR text or images) is written directly using the standard browser Web Clipboard API without network calls.</li>
            </ul>
          </div>

          {/* Section 4: Global Privacy Regulations (GDPR, CCPA/CPRA, LGPD) */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">4.</span> Global Privacy Rights (GDPR, CCPA/CPRA, LGPD)
            </h2>
            <p className="mb-3">
              Because GoFully does not collect, process, or store personal data on any server, we naturally satisfy the highest global privacy requirements by design:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong>No Data Sales:</strong> We do not sell, rent, or trade user data under the California Consumer Privacy Act (CCPA) or California Privacy Rights Act (CPRA).</li>
              <li><strong>Right to Erasure & Access:</strong> Since zero personal data resides on remote infrastructure, there is no remote user data to delete, modify, or export. Clearing your browser cache or uninstalling the extension removes all local preferences immediately.</li>
              <li><strong>Data Minimization:</strong> GoFully strictly adheres to Article 5(1)(c) of the General Data Protection Regulation (GDPR) by collecting zero unnecessary data.</li>
            </ul>
          </div>

          {/* Section 5: Third-Party Links & Web Store */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">5.</span> Third-Party Links & Chrome Web Store
            </h2>
            <p>
              Our website and extension may contain links to third-party services, such as the Google Chrome Web Store. When you navigate to third-party websites, their respective privacy policies and terms of service govern your interactions.
            </p>
          </div>

          {/* Section 6: Children's Privacy */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">6.</span> Children's Online Privacy Protection (COPPA)
            </h2>
            <p>
              GoFully is not directed to children under 13 years of age, and we do not knowingly collect personal information from children. Because the extension operates entirely without remote data collection, no child data is ever harvested or stored.
            </p>
          </div>

          {/* Section 7: Updates to this Policy */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">7.</span> Amendments & Notifications
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect extension updates or evolving regulatory requirements. Any modifications will be posted directly to this page with an updated "Effective Date" at the top.
            </p>
          </div>

          {/* Section 8: Direct Contact & Developer Information */}
          <div className="border-t border-slate-800/80 pt-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">8.</span> Developer & Privacy Contact
            </h2>
            <p className="text-slate-400 mb-6">
              For any questions, privacy inquiries, developer verifications, or technical support regarding GoFully, please contact the primary developer directly:
            </p>
            
            <div className="border border-slate-800 bg-[#070b14] p-6 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-slate-500 uppercase">Developer / Publisher:</span>
                <span className="text-white font-bold">Muzeebur Rahaman</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-slate-500 uppercase">Direct Email:</span>
                <a href="mailto:rahamanmuzeeb1108@gmail.com" className="text-[#D2E5FF] underline font-bold hover:text-white">
                  rahamanmuzeeb1108@gmail.com
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-slate-500 uppercase">Support Desk:</span>
                <a href="https://gofully-extension.vercel.app/support" className="text-[#D2E5FF] underline hover:text-white">
                  https://gofully-extension.vercel.app/support
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-slate-500 uppercase">Response Time:</span>
                <span className="text-slate-300">Within 24–48 business hours</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
