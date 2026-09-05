"use client";

import Link from "next/link";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";

const CWS_URL =
  "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc";

const NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq", active: true },
];

const FAQ_GROUPS = [
  {
    category: "General",
    items: [
      { q: "Is GoFully free?", a: "Yes — free forever, with no account required to use any feature." },
      { q: "Which browsers does it support?", a: "Chrome and other Chromium-based browsers, including Edge and Brave." },
      { q: "Do I need to sign up?", a: "No. Install the extension and start capturing right away — there's no account system at all." },
    ],
  },
  {
    category: "Privacy & Security",
    items: [
      { q: "Does anything get uploaded to a server?", a: "No. Capture, OCR, and editing all run locally in your browser — nothing is transmitted." },
      {
        q: "What permissions does the extension need?",
        a: (
          <>Just enough to capture the active tab, save exports, and copy to your clipboard. See the <Link href="/security" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>security page</Link> for the full breakdown.</>
        ),
      },
      { q: "Is my captured data stored anywhere?", a: "Only locally on your device, and only until you export or discard the result." },
    ],
  },
  {
    category: "Capture & Editing",
    items: [
      { q: "What capture modes are supported?", a: "Full page, visible area, a custom selected region, or a scrolling feed." },
      { q: "Can I redact sensitive information?", a: "Yes — blur or pixelate any region before you export or share the result." },
      { q: "What export formats are available?", a: "Copy to clipboard, save as PNG, or export a paginated PDF." },
    ],
  },
  {
    category: "Troubleshooting",
    items: [
      { q: "The extension isn't capturing the full page", a: "Refresh the page and try again — some sites delay content until you scroll, which the first pass can miss." },
      { q: "OCR isn't recognizing text correctly", a: "Accuracy depends on image clarity — zoom in on small or low-contrast text before extracting." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav links={NAV_LINKS} />

      {/* Hero */}
      <div className="text-center" style={{ padding: "88px 24px 64px" }}>
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            FAQ
          </span>
          <div className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}>
            Questions, answered
          </div>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 520, marginTop: 18 }}>
            Everything you need to know about capturing, editing, and exporting with GoFully. Can&apos;t find it here?{" "}
            <Link href="/support" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>Contact us</Link>.
          </p>
        </div>
      </div>

      {/* FAQ categories */}
      <div style={{ padding: "0 24px 90px" }}>
        <div className="mx-auto flex flex-col" style={{ maxWidth: 880, gap: 40 }}>
          {FAQ_GROUPS.map((group) => (
            <BlueprintFrame key={group.category} className="bg-white">
              <div className="gf-heading-font font-semibold uppercase border-b" style={{ padding: "22px 32px", borderColor: "rgba(29,31,32,.1)", fontSize: 13, letterSpacing: "0.06em", color: "var(--gf-color-accent)" }}>
                {group.category}
              </div>
              <div style={{ padding: "8px 32px 8px" }}>
                {group.items.map((item, i) => (
                  <div key={item.q} style={{ padding: "18px 0", borderBottom: i < group.items.length - 1 ? "1px solid rgba(29,31,32,.08)" : undefined }}>
                    <div className="gf-heading-font font-semibold" style={{ fontSize: 16 }}>{item.q}</div>
                    <p className="mt-1.5" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)" }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </BlueprintFrame>
          ))}
        </div>
      </div>

      <SiteFooterIndustry activeHref="/faq" />
    </div>
  );
}
