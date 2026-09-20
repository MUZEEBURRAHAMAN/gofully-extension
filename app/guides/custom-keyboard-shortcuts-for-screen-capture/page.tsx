import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { Breadcrumbs } from "@/components/breadcrumbs";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

export const metadata: Metadata = {
  title: "How to Set Custom Keyboard Shortcuts for Screen Capture",
  description:
    "Learn how to trigger full-page scrolling capture, visible area snapshots, or selected region capture with hotkeys in Chrome using GoFully.",
  alternates: { canonical: "https://gofully-extension.vercel.app/guides/custom-keyboard-shortcuts-for-screen-capture" },
  openGraph: {
    title: "How to Set Custom Keyboard Shortcuts for Fast Screen Capture — GoFully",
    description:
      "A complete guide to custom shortcut keybindings for browser screen capture and local OCR in GoFully.",
    url: "https://gofully-extension.vercel.app/guides/custom-keyboard-shortcuts-for-screen-capture",
    siteName: "GoFully",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://gofully-extension.vercel.app/guides/custom-keyboard-shortcuts-for-screen-capture#article",
  url: "https://gofully-extension.vercel.app/guides/custom-keyboard-shortcuts-for-screen-capture",
  headline: "How to Set Custom Keyboard Shortcuts for Fast Screen Capture",
  description:
    "Learn how to configure custom hotkeys for full page screenshots, region selection, and instant OCR text extraction without clicking extension icons.",
  isPartOf: { "@id": "https://gofully-extension.vercel.app/#website" },
  datePublished: "2026-09-11",
  dateModified: "2026-09-20",
  author: {
    "@type": "Organization",
    name: "GoFully",
    url: "https://gofully-extension.vercel.app/",
  },
  publisher: {
    "@type": "Organization",
    name: "GoFully",
    url: "https://gofully-extension.vercel.app/",
    logo: {
      "@type": "ImageObject",
      url: "https://gofully-extension.vercel.app/logo.png",
    },
  },
};

export default function CustomShortcutsGuidePage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "36px 24px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Custom Shortcuts Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center" style={{ padding: "36px 24px 44px" }}>
        <div className="mx-auto" style={{ maxWidth: 780 }}>
          <div className="inline-flex items-center gap-2 border border-emerald-300 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available Now
          </div>
          <h1
            className="gf-heading-font font-semibold"
            style={{ fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginTop: 16 }}
          >
            How to Set Custom Keyboard Shortcuts for Fast Screen Capture
          </h1>
          <p
            className="mx-auto"
            style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(29,31,32,.6)", maxWidth: 640, marginTop: 18 }}
          >
            Never break your development flow to click an extension icon. Trigger scrolling capture, regional snapshots, or instant OCR with one seamless keystroke.
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] text-neutral-400 mt-6">
            <span>By GoFully Engineering</span>
            <span>·</span>
            <span>Updated September 2026</span>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ padding: "0 24px 80px" }}>
        <div className="mx-auto" style={{ maxWidth: 840 }}>
          <BlueprintFrame className="bg-white p-8 md:p-12 space-y-10">

            {/* Feature Status Callout */}
            <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-none">
              <h2 className="gf-heading-font font-semibold text-[16px] text-emerald-900 mb-2">
                Native Keyboard Shortcuts Available Now
              </h2>
              <p className="text-[14px] leading-relaxed text-emerald-800/90">
                GoFully supports native Chrome shortcut commands out of the box (<kbd className="border bg-white px-1 py-0.5 text-xs font-mono">Alt+S</kbd> to open popup, <kbd className="border bg-white px-1 py-0.5 text-xs font-mono">Ctrl+Shift+F</kbd> for Full Page, <kbd className="border bg-white px-1 py-0.5 text-xs font-mono">Ctrl+Shift+V</kbd> for Visible Area, and <kbd className="border bg-white px-1 py-0.5 text-xs font-mono">Ctrl+Shift+A</kbd> for Selected Area). You can customize or rebind any of these commands anytime via Chrome&apos;s native shortcut manager. Check out our{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-emerald-950">
                  roadmap timeline
                </Link>{" "}
                for in-editor tool shortcuts coming in v1.2.0.
              </p>
            </div>

            {/* Why Shortcuts Matter for Power Users */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Why Keyboard Hotkeys Are Essential for QA &amp; Dev Workflows
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                When filing high-volume bug reports or documenting UI behavior across multiple viewport breakpoints, reaching for the mouse to click an extension icon causes micro-interruptions. Even worse: clicking the browser toolbar causes dropdown menus, hover tooltips, and modal states to immediately dismiss.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">Hover &amp; Flyout Preservation</h3>
                  <p className="text-neutral-600">Keyboard shortcuts capture the screen immediately without modifying DOM focus or closing active flyouts.</p>
                </div>
                <div className="border p-4 bg-neutral-50/70">
                  <h3 className="font-semibold text-neutral-800 mb-1">Single-Handed Repeat Captures</h3>
                  <p className="text-neutral-600">Capture successive user flows, animation states, and checkout funnels in rapid succession without mouse travel.</p>
                </div>
              </div>
            </section>

            {/* Default Shortcuts Table */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                Default Keybindings in GoFully
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                In GoFully, you can remap each of these commands to any key combination or single modifier you prefer via Chrome&apos;s native shortcut manager:
              </p>

              <div className="overflow-x-auto border border-neutral-200">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-neutral-100 text-neutral-800 border-b border-neutral-200">
                    <tr>
                      <th className="p-3 font-semibold">Action</th>
                      <th className="p-3 font-semibold">Windows / Linux Default</th>
                      <th className="p-3 font-semibold">macOS Default</th>
                      <th className="p-3 font-semibold">Customizable?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600">
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Full Page Screenshot</td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">Ctrl + Shift + F</kbd></td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">⌘ ⇧ F</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Visible Viewport Only</td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">Ctrl + Shift + V</kbd></td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">⌘ ⇧ V</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Selected Area Capture</td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">Ctrl + Shift + A</kbd></td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">⌘ ⇧ A</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Open GoFully Popup</td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">Alt + S</kbd></td>
                      <td className="p-3"><kbd className="border bg-neutral-50 px-2 py-0.5 font-mono text-xs">⌥ S</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* How to Configure in Chrome */}
            <section className="space-y-4">
              <h2 className="gf-heading-font font-semibold text-[24px] text-[var(--gf-color-text)]">
                How to Rebind Shortcuts in Google Chrome
              </h2>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                Chrome provides a dedicated, native settings page for managing extension commands. You can configure your bindings in four steps:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">1. Navigate to Extensions Shortcuts</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Enter <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">chrome://extensions/shortcuts</code> in your Chrome address bar.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">2. Locate GoFully</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Scroll to GoFully. You will see all 4 granular capture commands listed.
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">3. Record Your Custom Key Combo</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Click the pencil icon next to any command and press your desired key combination (e.g. <kbd className="border bg-neutral-100 px-1.5 py-0.5 text-xs font-mono">Ctrl+Shift+1</kbd>).
                  </p>
                </div>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  <h3 className="font-semibold text-neutral-800 text-[15px]">4. Choose Scope: &apos;In Chrome&apos; or &apos;Global&apos;</h3>
                  <p className="text-[14px] text-neutral-600 mt-1">
                    Set the scope dropdown to &apos;In Chrome&apos; to avoid conflict with operating system desktop shortcuts.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides & Early Access */}
            <section className="pt-6 border-t border-neutral-200">
              <h2 className="gf-heading-font font-semibold text-[20px] text-neutral-900 mb-3">
                Have Shortcut Suggestions?
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Tell us which keybindings you use most often in CleanShot X, Snipping Tool, or DevTools so we can set the best defaults for developers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/roadmap"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Request Shortcuts on Roadmap →
                </Link>
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Read Chrome Capture Guide →
                </Link>
              </div>
            </section>

          </BlueprintFrame>
        </div>
      </div>

      {/* Global CTA */}
      <div className="text-center" style={{ background: "#1d1f20", padding: "64px 24px" }}>
        <h2 className="gf-heading-font font-semibold" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
          Capture web pages at the speed of thought
        </h2>
        <p className="mx-auto" style={{ fontSize: "14.5px", color: "rgba(255,255,255,.55)", maxWidth: 500, marginTop: 12, lineHeight: 1.6 }}>
          100% free, on-device, and private. Install GoFully now to capture full pages with zero hassle.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gf-heading-font font-semibold"
          style={{ height: 44, padding: "0 24px", background: "var(--gf-color-accent)", color: "#fff", fontSize: 13, letterSpacing: "0.02em", marginTop: 22 }}
        >
          Add GoFully to Chrome — It&apos;s Free
        </a>
      </div>

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
