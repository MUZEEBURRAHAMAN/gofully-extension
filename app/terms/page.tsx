import { SiteNav } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-between">
      <SiteNav />

      <main className="mx-auto w-full max-w-5xl px-6 py-20 lg:px-8 flex-1">
        <span className="inline-block bg-[#000] border border-[#136CDE]/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[#D2E5FF]">
          Legal & Compliance
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
          Terms of Service
        </h1>
        <div className="mt-3 flex items-center gap-4 text-xs font-mono uppercase text-slate-400">
          <span>Effective Date: August 21, 2026</span>
          <span>•</span>
          <span>Version 2.4</span>
          <span>•</span>
          <span className="text-[#D2E5FF]">Binding Legal Agreement</span>
        </div>

        <div className="mt-12 space-y-12 text-sm text-slate-300 leading-relaxed border border-slate-800 bg-[#0d1424] p-8 lg:p-14">
          {/* Introduction */}
          <div className="border-b border-slate-800/80 pb-8">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">§</span> Agreement to Terms
            </h2>
            <p className="text-slate-300">
              These Terms of Service ("Terms", "Agreement") constitute a legally binding contract between you ("User", "you", or "your") and GoFully ("GoFully", "we", "us", or "our") governing your installation, access, and use of the GoFully Chrome browser extension, website (<a href="https://gofully-extension.vercel.app" className="text-[#D2E5FF] underline">https://gofully-extension.vercel.app</a>), and associated software products (collectively, the "Software" or "Service").
            </p>
            <p className="mt-3 text-slate-400">
              By downloading, installing, enabling, or using GoFully from the Google Chrome Web Store or our website, you expressly agree to be bound by these Terms. If you do not agree to all terms and conditions herein, you must immediately uninstall and discontinue use of the Software.
            </p>
          </div>

          {/* Section 1: License Grant & Scope */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">1.</span> License Grant & Permitted Use
            </h2>
            <p className="mb-3">
              Subject to your compliance with these Terms, GoFully grants you a revocable, non-exclusive, non-transferable, non-sublicensable, limited personal and commercial license to install and use the Software on devices owned or controlled by you:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong>Personal & Commercial Use:</strong> You are permitted to use the Software for personal workflows, educational projects, and internal commercial/business screenshot captures, annotations, and document exports.</li>
              <li><strong>Free License:</strong> The Software is provided free of charge subject to these terms and applicable Google Chrome Web Store policies.</li>
            </ul>
          </div>

          {/* Section 2: Restrictions & Prohibited Conduct */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">2.</span> Use Restrictions & Prohibited Conduct
            </h2>
            <p className="mb-3">
              You agree that you will NOT, under any circumstances, engage in or assist any third party with the following prohibited activities:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of any non-open-source component of the Software.</li>
              <li>Circumvent, disable, or tamper with security features, sandboxing mechanisms, or permissions scoped within the browser environment.</li>
              <li>Redistribute, sell, lease, sublicense, repackage, or distribute the extension bundle under unauthorized brand names.</li>
              <li>Use the Software to capture, OCR extract, annotate, or transmit copyrighted materials, trade secrets, confidential documents, or proprietary graphics without explicit legal authorization or fair use rights.</li>
              <li>Use the Software to bypass paywalls, digital rights management (DRM) restrictions, or content protection mechanisms on third-party websites.</li>
              <li>Use the Software for any unlawful, harassing, defamatory, fraudulent, or malicious purpose.</li>
            </ul>
          </div>

          {/* Section 3: Intellectual Property & User Generated Content */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">3.</span> Intellectual Property & Ownership of Captures
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong>GoFully Intellectual Property:</strong> All trademarks, logos, visual assets, software architecture, user interface designs, codebases, and brand elements associated with GoFully are the exclusive intellectual property of GoFully and its licensors, protected under copyright and trademark laws.
              </p>
              <p>
                <strong>User Content Ownership:</strong> You retain 100% full ownership, rights, and title to all screenshots, visual annotations, drawings, redacted graphics, extracted OCR text, and exported PDF/PNG documents created using the Software. GoFully claims zero ownership, license, or access to your generated files. Because all processing occurs locally on your machine, we never receive or store copies of your work.
              </p>
            </div>
          </div>

          {/* Section 4: Privacy & Client-Side Execution */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">4.</span> Privacy & On-Device Processing
            </h2>
            <p>
              Your privacy is of paramount importance. Our data practices are governed by our <a href="/privacy" className="text-[#D2E5FF] underline">Privacy Policy</a>, which is incorporated into these Terms by reference. You acknowledge and agree that GoFully operates locally within your browser sandbox and transmits zero image, video, or extracted text data to our servers.
            </p>
          </div>

          {/* Section 5: Disclaimer of Warranties */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">5.</span> Disclaimer of Warranties ("AS IS" & "AS AVAILABLE")
            </h2>
            <div className="border border-slate-800 bg-[#070b14] p-5 text-xs text-slate-400 space-y-3 font-mono leading-relaxed">
              <p className="uppercase text-slate-300 font-bold">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <p>
                THE SOFTWARE, WEBSITE, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, OR FREEDOM FROM COMPUTER VIRUSES OR BUGS.
              </p>
              <p>
                WE DO NOT WARRANT THAT (A) THE SOFTWARE WILL MEET YOUR SPECIFIC REQUIREMENTS, (B) SCREENSHOT STITCHING OR OCR EXTRACTION WILL BE 100% ERROR-FREE ACROSS ALL COMPLEX WEB ARCHITECTURES (E.G. VIRTUALIZED DOMS, CROSS-ORIGIN IFRAMES, OR HEAVY CANVAS ANIMATIONS), (C) DEFECTS WILL BE IMMEDIATELY CORRECTED, OR (D) THE OPERATION OF THE EXTENSION WILL BE UNINTERRUPTED.
              </p>
            </div>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">6.</span> Limitation of Liability
            </h2>
            <div className="border border-slate-800 bg-[#070b14] p-5 text-xs text-slate-400 space-y-3 font-mono leading-relaxed">
              <p>
                IN NO EVENT SHALL GOFULLY, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, BUSINESS INTERRUPTION, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>YOUR ACCESS TO, USE OF, OR INABILITY TO ACCESS OR USE THE SOFTWARE;</li>
                <li>ANY INACCURACIES IN CAPTURED IMAGES, EXTRACTED OCR TEXT, OR GENERATED PDFS;</li>
                <li>UNINTENTIONAL EXPOSURE OF UNREDACTED SENSITIVE INFORMATION SHARED BY YOU TO THIRD PARTIES;</li>
                <li>ANY THIRD-PARTY WEBPAGE BEHAVIOR, SCRIPT INTERFERENCE, OR BROWSER CRASHES.</li>
              </ul>
              <p>
                IN ALL CASES, OUR AGGREGATE TOTAL LIABILITY UNDER THESE TERMS SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO GOFULLY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (OR $50.00 USD IF NO PAYMENTS WERE MADE).
              </p>
            </div>
          </div>

          {/* Section 7: Indemnification */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">7.</span> Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless GoFully and its officers, directors, employees, and agents from and against any third-party claims, damages, obligations, losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising from: (a) your use of or access to the Software, (b) your violation of any provision of these Terms, (c) your violation of any third-party right (including copyright, trademark, privacy, or proprietary rights) in connection with captured web visuals, or (d) any claim that content captured or distributed by you caused damage to a third party.
            </p>
          </div>

          {/* Section 8: Termination */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">8.</span> Termination & Survival
            </h2>
            <p>
              You may terminate this Agreement at any time by uninstalling the GoFully extension and discontinuing all use of our services. We reserve the right to suspend, terminate, or discontinue the Software, with or without cause or notice, at any time. All provisions of these Terms which by their nature should survive termination shall survive (including ownership provisions, warranty disclaimers, indemnity, and limitations of liability).
            </p>
          </div>

          {/* Section 9: Governing Law & Jurisdiction */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">9.</span> Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms or the Software shall be instituted exclusively in the federal or state courts located in Delaware, and you consent to personal jurisdiction and venue in such courts.
            </p>
          </div>

          {/* Section 10: Entire Agreement & Contact */}
          <div className="border-t border-slate-800/80 pt-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#136CDE]">10.</span> Entire Agreement & Contact Inquiries
            </h2>
            <p className="text-slate-400 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and GoFully regarding the Software. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase">
              <a
                href="/support"
                className="border border-[#136CDE] bg-[#136CDE]/15 px-4 py-2 text-[#D2E5FF] hover:bg-[#136CDE] hover:text-white transition-colors"
              >
                GoFully Legal & Support Desk →
              </a>
              <span className="text-slate-400 font-mono">Legal Contact: <a href="mailto:rahamanmuzeeb1108@gmail.com" className="text-[#D2E5FF] underline">rahamanmuzeeb1108@gmail.com</a></span>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
