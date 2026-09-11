import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service and usage conditions for the GoFully Chrome Extension.",
  alternates: { canonical: "https://gofully-extension.vercel.app/terms" },
  openGraph: {
    title: "Terms of Service — GoFully",
    description: "Terms of service and usage conditions for GoFully.",
    url: "https://gofully-extension.vercel.app/terms",
    siteName: "GoFully",
  },
};

function SectionNum({ n }: { n: string }) {
  return (
    <span className="gf-heading-font font-semibold" style={{ color: "var(--gf-color-accent)" }}>
      {n}
    </span>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
      <span className="mt-[9px] h-[5px] w-[5px] flex-shrink-0" style={{ background: "var(--gf-color-accent)" }} />
      <span>{children}</span>
    </li>
  );
}

function LegalBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3.5" style={{ border: "1px solid rgba(29,31,32,.12)", background: "rgba(29,31,32,.03)", padding: "20px 24px" }}>
      {children}
    </div>
  );
}

function LegalP({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 first:mt-0" style={{ font: "12px/1.65 ui-monospace, Menlo, monospace", color: "rgba(29,31,32,.6)", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

export default function TermsPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <Breadcrumbs items={[{ label: "Terms of Service" }]} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center" style={{ padding: "36px 24px 48px" }}>
        <div className="mx-auto" style={{ maxWidth: 760 }}>
          <span
            className="inline-block border gf-heading-font font-semibold uppercase"
            style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}
          >
            Legal &amp; Compliance
          </span>
          <div
            className="gf-heading-font font-semibold"
            style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}
          >
            Terms of Service
          </div>
          <div
            className="flex items-center justify-center flex-wrap gf-heading-font font-semibold uppercase"
            style={{ gap: 10, marginTop: 18, fontSize: 11, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)" }}
          >
            <span>Effective Date: August 21, 2026</span>
            <span>&middot;</span>
            <span>Version 2.4</span>
            <span>&middot;</span>
            <span style={{ color: "var(--gf-color-accent)" }}>Binding Legal Agreement</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0 24px 100px" }}>
        <BlueprintFrame className="mx-auto bg-white" style={{ maxWidth: 880, padding: "0" }}>
          <div style={{ padding: "40px 40px 8px" }}>
            <div className="pb-9" style={{ borderBottom: "1px solid rgba(29,31,32,.08)" }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 19 }}>
                <span style={{ color: "var(--gf-color-accent)" }}>&sect;</span> Agreement to Terms
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                These Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Agreement&rdquo;) constitute a legally binding contract between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and GoFully (&ldquo;GoFully&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) governing your installation, access, and use of the GoFully Chrome browser extension, website (
                <a href="https://gofully-extension.vercel.app" style={{ color: "var(--gf-color-accent)", textDecoration: "underline" }}>https://gofully-extension.vercel.app</a>
                ), and associated software products (collectively, the &ldquo;Software&rdquo; or &ldquo;Service&rdquo;).
              </p>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                By downloading, installing, enabling, or using GoFully from the Google Chrome Web Store or our website, you expressly agree to be bound by these Terms. If you do not agree to all terms and conditions herein, you must immediately uninstall and discontinue use of the Software.
              </p>
            </div>
          </div>

          <div className="flex flex-col" style={{ padding: "0 40px", gap: 40 }}>
            {/* 1 */}
            <div style={{ paddingTop: 32 }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="1." /> License Grant &amp; Permitted Use
              </div>
              <p className="mt-3 mb-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                Subject to your compliance with these Terms, GoFully grants you a revocable, non-exclusive, non-transferable, non-sublicensable, limited personal and commercial license to install and use the Software on devices owned or controlled by you:
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet><strong style={{ color: "#1d1f20" }}>Personal &amp; Commercial Use:</strong> You are permitted to use the Software for personal workflows, educational projects, and internal commercial/business screenshot captures, annotations, and document exports.</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Free License:</strong> The Software is provided free of charge subject to these terms and applicable Google Chrome Web Store policies.</Bullet>
              </ul>
            </div>

            {/* 2 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="2." /> Use Restrictions &amp; Prohibited Conduct
              </div>
              <p className="mt-3 mb-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                You agree that you will NOT, under any circumstances, engage in or assist any third party with the following prohibited activities:
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet>Reverse engineer, decompile, disassemble, or attempt to derive the source code of any non-open-source component of the Software.</Bullet>
                <Bullet>Circumvent, disable, or tamper with security features, sandboxing mechanisms, or permissions scoped within the browser environment.</Bullet>
                <Bullet>Redistribute, sell, lease, sublicense, repackage, or distribute the extension bundle under unauthorized brand names.</Bullet>
                <Bullet>Use the Software to capture, OCR extract, annotate, or transmit copyrighted materials, trade secrets, confidential documents, or proprietary graphics without explicit legal authorization or fair use rights.</Bullet>
                <Bullet>Use the Software to bypass paywalls, digital rights management (DRM) restrictions, or content protection mechanisms on third-party websites.</Bullet>
                <Bullet>Use the Software for any unlawful, harassing, defamatory, fraudulent, or malicious purpose.</Bullet>
              </ul>
            </div>

            {/* 3 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="3." /> Intellectual Property &amp; Ownership of Captures
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                <strong style={{ color: "#1d1f20" }}>GoFully Intellectual Property:</strong> All trademarks, logos, visual assets, software architecture, user interface designs, codebases, and brand elements associated with GoFully are the exclusive intellectual property of GoFully and its licensors, protected under copyright and trademark laws.
              </p>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                <strong style={{ color: "#1d1f20" }}>User Content Ownership:</strong> You retain 100% full ownership, rights, and title to all screenshots, visual annotations, drawings, redacted graphics, extracted OCR text, and exported PDF/PNG documents created using the Software. GoFully claims zero ownership, license, or access to your generated files. Because all processing occurs locally on your machine, we never receive or store copies of your work.
              </p>
            </div>

            {/* 4 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="4." /> Privacy &amp; On-Device Processing
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                Your privacy is of paramount importance. Our data practices are governed by our{" "}
                <a href="/privacy" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>Privacy Policy</a>, which is incorporated into these Terms by reference. You acknowledge and agree that GoFully operates locally within your browser sandbox and transmits zero image, video, or extracted text data to our servers.
              </p>
            </div>

            {/* 5 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="5." /> Disclaimer of Warranties (&ldquo;AS IS&rdquo; &amp; &ldquo;AS AVAILABLE&rdquo;)
              </div>
              <LegalBox>
                <div className="gf-heading-font font-semibold" style={{ fontSize: 12, letterSpacing: "0.03em", marginBottom: 10 }}>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
                </div>
                <LegalP>
                  The Software, website, and services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, or freedom from computer viruses or bugs.
                </LegalP>
                <LegalP>
                  We do not warrant that (a) the software will meet your specific requirements, (b) screenshot stitching or OCR extraction will be 100% error-free across all complex web architectures (e.g. virtualized DOMs, cross-origin iframes, or heavy canvas animations), (c) defects will be immediately corrected, or (d) the operation of the extension will be uninterrupted.
                </LegalP>
              </LegalBox>
            </div>

            {/* 6 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="6." /> Limitation of Liability
              </div>
              <LegalBox>
                <LegalP>
                  In no event shall GoFully, its directors, employees, partners, agents, or affiliates be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, data, use, goodwill, business interruption, or other intangible losses resulting from:
                </LegalP>
                <ul className="mt-3 flex flex-col gap-1.5">
                  <li style={{ font: "11.5px/1.6 ui-monospace, Menlo, monospace", color: "rgba(29,31,32,.6)", textTransform: "uppercase", paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, background: "var(--gf-color-accent)" }} />
                    Your access to, use of, or inability to access or use the Software;
                  </li>
                  <li style={{ font: "11.5px/1.6 ui-monospace, Menlo, monospace", color: "rgba(29,31,32,.6)", textTransform: "uppercase", paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, background: "var(--gf-color-accent)" }} />
                    Any inaccuracies in captured images, extracted OCR text, or generated PDFs;
                  </li>
                  <li style={{ font: "11.5px/1.6 ui-monospace, Menlo, monospace", color: "rgba(29,31,32,.6)", textTransform: "uppercase", paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, background: "var(--gf-color-accent)" }} />
                    Unintentional exposure of unredacted sensitive information shared by you to third parties;
                  </li>
                  <li style={{ font: "11.5px/1.6 ui-monospace, Menlo, monospace", color: "rgba(29,31,32,.6)", textTransform: "uppercase", paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, background: "var(--gf-color-accent)" }} />
                    Any third-party webpage behavior, script interference, or browser crashes.
                  </li>
                </ul>
                <LegalP>
                  In all cases, our aggregate total liability under these Terms shall not exceed the total amount paid by you to GoFully in the twelve (12) months preceding the claim (or $50.00 USD if no payments were made).
                </LegalP>
              </LegalBox>
            </div>

            {/* 7 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="7." /> Indemnification
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                You agree to defend, indemnify, and hold harmless GoFully and its officers, directors, employees, and agents from and against any third-party claims, damages, obligations, losses, liabilities, costs, or expenses (including reasonable attorneys&rsquo; fees) arising from: (a) your use of or access to the Software, (b) your violation of any provision of these Terms, (c) your violation of any third-party right (including copyright, trademark, privacy, or proprietary rights) in connection with captured web visuals, or (d) any claim that content captured or distributed by you caused damage to a third party.
              </p>
            </div>

            {/* 8 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="8." /> Termination &amp; Survival
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                You may terminate this Agreement at any time by uninstalling the GoFully extension and discontinuing all use of our services. We reserve the right to suspend, terminate, or discontinue the Software, with or without cause or notice, at any time. All provisions of these Terms which by their nature should survive termination shall survive (including ownership provisions, warranty disclaimers, indemnity, and limitations of liability).
              </p>
            </div>

            {/* 9 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="9." /> Governing Law &amp; Dispute Resolution
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms or the Software shall be instituted exclusively in the federal or state courts located in Delaware, and you consent to personal jurisdiction and venue in such courts.
              </p>
            </div>

            {/* 10 */}
            <div className="pt-2" style={{ paddingBottom: 40, borderTop: "1px solid rgba(29,31,32,.08)", paddingTop: 32 }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="10." /> Entire Agreement &amp; Contact Inquiries
              </div>
              <p className="mt-3 mb-5" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and GoFully regarding the Software. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
              <div className="flex items-center flex-wrap" style={{ gap: 18 }}>
                <a
                  href="/support"
                  className="inline-flex items-center justify-center gf-heading-font font-semibold"
                  style={{ height: 40, padding: "0 18px", background: "var(--gf-color-accent)", color: "#fff", fontSize: "12.5px", letterSpacing: "0.02em" }}
                >
                  GoFully Legal &amp; Support Desk &rarr;
                </a>
                <span style={{ fontSize: 12, color: "rgba(29,31,32,.5)" }}>
                  Legal Contact:{" "}
                  <a href="mailto:rahamanmuzeeb1108@gmail.com" style={{ color: "var(--gf-color-accent)", fontFamily: "ui-monospace, Menlo, monospace" }}>
                    rahamanmuzeeb1108@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>
        </BlueprintFrame>
      </div>

      <SiteFooterIndustry activeHref="/terms" />
    </div>
  );
}
