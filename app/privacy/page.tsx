import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Privacy Policy — GoFully Screenshot Extension",
  description:
    "GoFully does not collect, track, or transmit any user data. All screenshot capture, annotation, and OCR runs 100% locally on your machine.",
  alternates: { canonical: "https://gofully-extension.vercel.app/privacy" },
  openGraph: {
    title: "Privacy Policy — GoFully Screenshot Extension",
    description: "100% private and on-device. No telemetry, no tracking, no cloud servers.",
    url: "https://gofully-extension.vercel.app/privacy",
    siteName: "GoFully",
  },
};

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
];

const PERMISSIONS = [
  {
    name: "activeTab",
    body: "Allows the extension to capture pixel data from the currently active browser tab solely when you explicitly initiate a capture action. It grants no access to other tabs or background browsing.",
  },
  {
    name: "storage (Local)",
    body: "Used exclusively with chrome.storage.local to store your non-identifying tool settings (such as default export format PNG/PDF, canvas annotation colors, and screenshot quality options) on your local hard drive.",
  },
  {
    name: "offscreen (Manifest V3)",
    body: "Used to create an isolated background document to handle multi-megapixel canvas stitching, blur/pixelation filters, and WebAssembly OCR execution without freezing your active webpage interface.",
  },
  {
    name: "scripting / debugger (Optional / CDP Capture)",
    body: "Used exclusively when capturing high-resolution full-page screenshots to automate smooth viewport scroll positions, suppress fixed/sticky headers during scrolling, and ensure pixel-perfect image stitching.",
  },
];

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

export default function PrivacyPage() {
  return (
    <div className="gf-industry min-h-screen">
      <BreadcrumbJsonLd name="Privacy Policy" path="/privacy" />
      <SiteNav links={NAV_LINKS} />

      {/* Header */}
      <div className="text-center" style={{ padding: "72px 24px 48px" }}>
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
            Privacy Policy
          </div>
          <div
            className="flex items-center justify-center flex-wrap gf-heading-font font-semibold uppercase"
            style={{ gap: 10, marginTop: 18, fontSize: 11, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)" }}
          >
            <span>Effective Date: August 21, 2026</span>
            <span>&middot;</span>
            <span>Version 2.5</span>
            <span>&middot;</span>
            <span style={{ color: "var(--gf-color-accent)" }}>100% On-Device Architecture</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0 24px 100px" }}>
        <BlueprintFrame className="mx-auto bg-white" style={{ maxWidth: 880, padding: "0" }}>
          <div style={{ padding: "40px 40px 8px" }}>
            <div className="pb-9" style={{ borderBottom: "1px solid rgba(29,31,32,.08)" }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 19 }}>
                <span style={{ color: "var(--gf-color-accent)" }}>&sect;</span> Executive Privacy Commitment
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(29,31,32,.6)" }}>
                GoFully (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Extension&rdquo;) is engineered with an uncompromising privacy-first architecture.{" "}
                <strong style={{ color: "#1d1f20" }}>We do not collect, transmit, store, monetize, or share your screenshots, captured web content, extracted OCR text, or browsing history.</strong>{" "}
                Every computation, image stitching algorithm, optical recognition pass, and visual annotation occurs strictly within your local computer&rsquo;s browser sandbox.
              </p>
            </div>
          </div>

          <div className="flex flex-col" style={{ padding: "0 40px", gap: 40 }}>
            {/* 1 */}
            <div style={{ paddingTop: 32 }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="1." /> Zero Personal Data Collection Policy
              </div>
              <p className="mt-3 mb-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                Unlike cloud-hosted screen recording or capture tools that upload your files to remote cloud servers, GoFully operates entirely in-memory on your client device:
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet><strong style={{ color: "#1d1f20" }}>Zero Image Uploads:</strong> Screenshots (full-page, visible area, or selected region) are generated and rendered directly into local HTML5 Canvas elements in your device&rsquo;s memory.</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Zero Text or OCR Exfiltration:</strong> Text recognized by the embedded WebAssembly OCR engine is processed strictly on your local CPU. No extracted text strings are ever sent over the network.</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Zero Tracking or Telemetry:</strong> We do not embed Google Analytics, Mixpanel, Segment, advertising trackers, fingerprinting scripts, or session recording SDKs in the extension.</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Zero User Accounts:</strong> GoFully does not require account creation, logins, email addresses, passwords, or personal credentials to function.</Bullet>
              </ul>
            </div>

            {/* 2 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="2." /> Manifest V3 Scoped Permissions &amp; Justifications
              </div>
              <p className="mt-3 mb-4" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                In accordance with Google Chrome Web Store Developer Program Policies, GoFully requests only the absolute minimum permissions strictly necessary to execute its primary features:
              </p>
              <div className="flex flex-col" style={{ gap: 10 }}>
                {PERMISSIONS.map((p) => (
                  <div key={p.name} className="border" style={{ padding: "14px 16px", borderColor: "rgba(29,31,32,.12)", background: "rgba(29,31,32,.02)" }}>
                    <div className="gf-heading-font font-semibold" style={{ fontSize: "12.5px", color: "var(--gf-color-accent)" }}>{p.name}</div>
                    <p className="mt-1.5" style={{ fontSize: "12.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)" }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="3." /> 100% Local Processing &amp; Client-Side Sandboxing
              </div>
              <p className="mt-3 mb-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                <strong style={{ color: "#1d1f20" }}>GoFully is strictly an on-device utility.</strong> Screenshot data, canvas annotations, image pixels, and OCR recognized text are never uploaded, streamed, cached, or transmitted to remote servers under any circumstances. There are zero remote cloud endpoints or backend databases connected to the extension runtime.
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet>All visual data created during your editing session (including drawings, arrows, text callouts, shapes, and redaction masks) is held strictly in transient browser RAM.</Bullet>
                <Bullet>When you close the GoFully editor tab, the temporary in-memory canvas is completely deallocated by your browser&rsquo;s garbage collector.</Bullet>
                <Bullet>Exported files (PNG, WebP, PDF) are downloaded directly to your local file system via browser Blob URLs (blob:chrome-extension://...).</Bullet>
                <Bullet>Data copied to the clipboard (such as extracted OCR text or images) is written directly using the standard browser Web Clipboard API without network calls.</Bullet>
              </ul>
            </div>

            {/* 4 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="4." /> Global Privacy Rights (GDPR, CCPA/CPRA, LGPD)
              </div>
              <p className="mt-3 mb-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                Because GoFully does not collect, process, or store personal data on any server, we naturally satisfy the highest global privacy requirements by design:
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet><strong style={{ color: "#1d1f20" }}>No Data Sales:</strong> We do not sell, rent, or trade user data under the California Consumer Privacy Act (CCPA) or California Privacy Rights Act (CPRA).</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Right to Erasure &amp; Access:</strong> Since zero personal data resides on remote infrastructure, there is no remote user data to delete, modify, or export. Clearing your browser cache or uninstalling the extension removes all local preferences immediately.</Bullet>
                <Bullet><strong style={{ color: "#1d1f20" }}>Data Minimization:</strong> GoFully strictly adheres to Article 5(1)(c) of the General Data Protection Regulation (GDPR) by collecting zero unnecessary data.</Bullet>
              </ul>
            </div>

            {/* 5 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="5." /> Third-Party Links &amp; Chrome Web Store
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                Our website and extension may contain links to third-party services, such as the Google Chrome Web Store. When you navigate to third-party websites, their respective privacy policies and terms of service govern your interactions.
              </p>
            </div>

            {/* 6 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="6." /> Children&rsquo;s Online Privacy Protection (COPPA)
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                GoFully is not directed to children under 13 years of age, and we do not knowingly collect personal information from children. Because the extension operates entirely without remote data collection, no child data is ever harvested or stored.
              </p>
            </div>

            {/* 7 */}
            <div>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="7." /> Amendments &amp; Notifications
              </div>
              <p className="mt-3" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                We may update this Privacy Policy from time to time to reflect extension updates or evolving regulatory requirements. Any modifications will be posted directly to this page with an updated &ldquo;Effective Date&rdquo; at the top.
              </p>
            </div>

            {/* 8 */}
            <div className="pt-2" style={{ paddingBottom: 40, borderTop: "1px solid rgba(29,31,32,.08)", paddingTop: 32 }}>
              <div className="gf-heading-font font-semibold flex items-center gap-2" style={{ fontSize: 16 }}>
                <SectionNum n="8." /> Developer &amp; Privacy Contact
              </div>
              <p className="mt-3 mb-5" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.6)" }}>
                For any questions, privacy inquiries, developer verifications, or technical support regarding GoFully, please contact the primary developer directly:
              </p>

              <div className="border flex flex-col" style={{ borderColor: "rgba(29,31,32,.12)", background: "rgba(29,31,32,.02)", padding: "20px 22px", gap: 12 }}>
                <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 6 }}>
                  <span className="gf-heading-font font-semibold uppercase" style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)", minWidth: 150 }}>Developer / Publisher</span>
                  <span className="gf-heading-font font-semibold" style={{ fontSize: 13 }}>Muzeebur Rahaman</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 6 }}>
                  <span className="gf-heading-font font-semibold uppercase" style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)", minWidth: 150 }}>Direct Email</span>
                  <a href="mailto:rahamanmuzeeb1108@gmail.com" style={{ fontSize: 13, fontWeight: 600, color: "var(--gf-color-accent)" }}>
                    rahamanmuzeeb1108@gmail.com
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 6 }}>
                  <span className="gf-heading-font font-semibold uppercase" style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)", minWidth: 150 }}>Support Desk</span>
                  <a href="/support" style={{ fontSize: 13, fontWeight: 600, color: "var(--gf-color-accent)" }}>
                    gofully-extension.vercel.app/support
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 6 }}>
                  <span className="gf-heading-font font-semibold uppercase" style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "rgba(29,31,32,.4)", minWidth: 150 }}>Response Time</span>
                  <span style={{ fontSize: 13, color: "rgba(29,31,32,.6)" }}>Within 24&ndash;48 business hours</span>
                </div>
              </div>
            </div>
          </div>
        </BlueprintFrame>
      </div>

      <SiteFooterIndustry activeHref="/privacy" />
    </div>
  );
}
