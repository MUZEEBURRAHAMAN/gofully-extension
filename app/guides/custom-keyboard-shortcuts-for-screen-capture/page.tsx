import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RelatedGuides } from "@/components/related-guides";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <SiteNav />

      {/* Breadcrumbs */}
      <div className="gf-crumbs">
        <div>
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Custom Shortcuts Guide" },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Available Now"
        title="How to Set Custom Keyboard Shortcuts for Fast Screen Capture"
        lede="Never break your development flow to click an extension icon. Trigger scrolling capture, regional snapshots, or instant OCR with one seamless keystroke."
        meta={["By GoFully Engineering", "Updated September 2026", "4 min read"]}
      />

      {/* Article Body */}
      <div className="gf-article-wrap">
        <div>
          <article className="gf-article">

            {/* Feature Status Callout */}
            <div className="gf-callout gf-callout--green">
              <h2>
                Native Keyboard Shortcuts Available Now
              </h2>
              <p className="text-[14px] leading-relaxed text-emerald-800/90">
                GoFully supports native Chrome shortcut commands out of the box (<kbd>Alt+S</kbd> to open popup, <kbd>Ctrl+Shift+F</kbd> for Full Page, <kbd>Ctrl+Shift+V</kbd> for Visible Area, and <kbd>Ctrl+Shift+A</kbd> for Selected Area). You can customize or rebind any of these commands anytime via Chrome&apos;s native shortcut manager. Check out our{" "}
                <Link href="/roadmap" className="underline font-semibold hover:text-emerald-950">
                  roadmap timeline
                </Link>{" "}
                for in-editor tool shortcuts coming in v1.2.0.
              </p>
            </div>

            {/* Why Shortcuts Matter for Power Users */}
            <section className="space-y-4">
              <h2>
                Why Keyboard Hotkeys Are Essential for QA &amp; Dev Workflows
              </h2>
              <p className="gf-p">
                When filing high-volume bug reports or documenting UI behavior across multiple viewport breakpoints, reaching for the mouse to click an extension icon causes micro-interruptions. Even worse: clicking the browser toolbar causes dropdown menus, hover tooltips, and modal states to immediately dismiss.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[13.5px]">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Hover &amp; Flyout Preservation</h3>
                  <p className="text-neutral-600">Keyboard shortcuts capture the screen immediately without modifying DOM focus or closing active flyouts.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Single-Handed Repeat Captures</h3>
                  <p className="text-neutral-600">Capture successive user flows, animation states, and checkout funnels in rapid succession without mouse travel.</p>
                </div>
              </div>
            </section>

            {/* Default Shortcuts Table */}
            <section className="space-y-4">
              <h2>
                Default Keybindings in GoFully
              </h2>
              <p className="gf-p">
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
                      <td className="p-3"><kbd>Ctrl + Shift + F</kbd></td>
                      <td className="p-3"><kbd>⌘ ⇧ F</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Visible Viewport Only</td>
                      <td className="p-3"><kbd>Ctrl + Shift + V</kbd></td>
                      <td className="p-3"><kbd>⌘ ⇧ V</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Selected Area Capture</td>
                      <td className="p-3"><kbd>Ctrl + Shift + A</kbd></td>
                      <td className="p-3"><kbd>⌘ ⇧ A</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-800">Open GoFully Popup</td>
                      <td className="p-3"><kbd>Alt + S</kbd></td>
                      <td className="p-3"><kbd>⌥ S</kbd></td>
                      <td className="p-3 text-emerald-600 font-semibold">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* How to Configure in Chrome */}
            <section className="space-y-4">
              <h2>
                How to Rebind Shortcuts in Google Chrome
              </h2>
              <p className="gf-p">
                Chrome provides a dedicated, native settings page for managing extension commands. You can configure your bindings in four steps:
              </p>
              
              <div className="space-y-4">
                <div className="gf-step">
                  <h3 className="gf-h3">Navigate to Extensions Shortcuts</h3>
                  <p className="gf-small">
                    Enter <code>chrome://extensions/shortcuts</code> in your Chrome address bar.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Locate GoFully</h3>
                  <p className="gf-small">
                    Scroll to GoFully. You will see all 4 granular capture commands listed.
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Record Your Custom Key Combo</h3>
                  <p className="gf-small">
                    Click the pencil icon next to any command and press your desired key combination (e.g. <kbd>Ctrl+Shift+1</kbd>).
                  </p>
                </div>
                <div className="gf-step">
                  <h3 className="gf-h3">Choose Scope: &apos;In Chrome&apos; or &apos;Global&apos;</h3>
                  <p className="gf-small">
                    Set the scope dropdown to &apos;In Chrome&apos; to avoid conflict with operating system desktop shortcuts.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Guides & Early Access */}
            <section className="gf-sep">
              <h2>
                Have Shortcut Suggestions?
              </h2>
              <p className="text-[14.5px] text-neutral-600 mb-6">
                Tell us which keybindings you use most often in CleanShot X, Snipping Tool, or DevTools so we can set the best defaults for developers.
              </p>
              <div className="gf-btn-row">
                <Link
                  href="/roadmap"
                  className="gf-btn-p"
                >
                  Request Shortcuts on Roadmap →
                </Link>
                <Link
                  href="/guides/how-to-take-full-page-screenshot-chrome"
                  className="gf-btn-s"
                >
                  Read Chrome Capture Guide →
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="gf-badge gf-badge--blue">New in v1.1.3</div>
              <h2>
                Shortcut changes in v1.1.3
              </h2>
              <p className="gf-p">Chrome allows an extension four default shortcuts. GoFully handles the rest so nothing is lost.</p>
              <div className="space-y-3 pt-2">
                <div className="gf-tcard">
                  <h3 className="gf-h3">Draw on Page</h3>
                  <p className="gf-small">Press Cmd/Ctrl+Shift+H on a site, or use the popup tile. Assign your own key in Chrome if you want one.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">In-page defaults</h3>
                  <p className="gf-small">On a normal web page the capture keys also work through GoFully itself: Cmd/Ctrl+Shift+F, V, A and H.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">See what is bound</h3>
                  <p className="gf-small">Settings lists the key Chrome has bound to each GoFully command. It flags any key another extension took and links to chrome://extensions/shortcuts so you can pick a new one.</p>
                </div>
                <div className="gf-tcard">
                  <h3 className="gf-h3">Clear messages</h3>
                  <p className="gf-small">If a shortcut cannot run, GoFully now says why. On pages that cannot show a message, the toolbar icon shows a badge.</p>
                </div>
              </div>
            </section>

          </article>
        </div>
      </div>

      <RelatedGuides currentSlug="custom-keyboard-shortcuts-for-screen-capture" />

      {/* Global CTA */}
      <CtaBand
        title="Capture web pages at the speed of thought"
        sub="100% free, on-device, and private. Install GoFully now to capture full pages with zero hassle."
      />

      <SiteFooterIndustry activeHref="/guides" />
    </div>
  );
}
