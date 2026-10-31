import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader, CtaBand } from "@/components/site/content";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Full Page Capture & OCR",
  description:
    "Find answers to frequently asked questions about GoFully: full page scrolling screenshots, on-device OCR, redaction, browser permissions, and export formats.",
  alternates: { canonical: "https://gofully-extension.vercel.app/faq" },
  openGraph: {
    title: "Frequently Asked Questions — GoFully",
    description:
      "Find answers to common questions about GoFully full page screenshots, local OCR, and privacy.",
    url: "https://gofully-extension.vercel.app/faq",
    siteName: "GoFully",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions — GoFully",
    description:
      "Frequently asked questions about GoFully screenshot capture, on-device OCR, and export.",
  },
};

const FAQ_GROUPS = [
  {
    category: "General",
    items: [
      {
        q: "Is GoFully free?",
        a: "Yes — free forever, with no account required to use any feature.",
        plainAnswer: "Yes — free forever, with no account required to use any feature.",
      },
      {
        q: "Which browsers does it support?",
        a: "Chrome and other Chromium-based browsers, including Edge, Brave, and Opera.",
        plainAnswer: "Chrome and other Chromium-based browsers, including Edge, Brave, and Opera.",
      },
      {
        q: "Do I need to sign up?",
        a: "No. Install the extension and start capturing right away — there's no account system at all.",
        plainAnswer: "No. Install the extension and start capturing right away — there's no account system at all.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    items: [
      {
        q: "Does anything get uploaded to a server?",
        a: "No. Capture, OCR, and editing all run locally in your browser — nothing is transmitted.",
        plainAnswer: "No. Capture, OCR, and editing all run locally in your browser — nothing is transmitted.",
      },
      {
        q: "What permissions does the extension need?",
        a: (
          <>Just enough to capture the active tab, save exports, and copy to your clipboard. See the <Link href="/security">security page</Link> for the full breakdown.</>
        ),
        plainAnswer: "Just enough to capture the active tab, save exports, and copy to your clipboard. See the security page for the full breakdown.",
      },
      {
        q: "Is my captured data stored anywhere?",
        a: "Only on your device. The last capture sits in session memory until you close the browser. History keeps thumbnails, page titles, addresses and OCR text in local storage, and Clear All deletes them. Nothing is uploaded.",
        plainAnswer: "Only on your device. The last capture sits in session memory until you close the browser. History keeps thumbnails, page titles, addresses and OCR text in local storage, and Clear All deletes them. Nothing is uploaded.",
      },
    ],
  },
  {
    category: "Capture & Editing",
    items: [
      {
        q: "What capture modes are supported?",
        a: "Full page scrolling capture, visible area, a custom selected region, a single element, or a scrolling feed. You can also draw on a live page before you capture it.",
        plainAnswer: "Full page scrolling capture, visible area, a custom selected region, a single element, or a scrolling feed. You can also draw on a live page before you capture it.",
      },
      {
        q: "Can I redact sensitive information?",
        a: "Yes. Blur, pixelate or black out any region, or let Auto-redact find emails, card numbers and keys for you to review.",
        plainAnswer: "Yes. Blur, pixelate or black out any region, or let Auto-redact find emails, card numbers and keys for you to review.",
      },
      {
        q: "Can I draw on a live website?",
        a: "Yes. Draw on Page adds a toolbar to any site. Mark it up with a pen, highlighter, arrows, shapes, text and sticky notes, then capture the visible area or the full page with your marks in place.",
        plainAnswer: "Yes. Draw on Page adds a toolbar to any site. Mark it up with a pen, highlighter, arrows, shapes, text and sticky notes, then capture the visible area or the full page with your marks in place.",
      },
      {
        q: "Can I capture just one element?",
        a: "Yes. Capture Element outlines whatever is under your pointer. Use the arrow keys to pick a parent or child, then click to crop to it.",
        plainAnswer: "Yes. Capture Element outlines whatever is under your pointer. Use the arrow keys to pick a parent or child, then click to crop to it.",
      },
      {
        q: "Does Auto-redact catch everything?",
        a: "It finds emails, card numbers, phone numbers, ID numbers, IP addresses and API keys that OCR can read. Check each black box before you share, because text OCR misses stays visible.",
        plainAnswer: "It finds emails, card numbers, phone numbers, ID numbers, IP addresses and API keys that OCR can read. Check each black box before you share, because text OCR misses stays visible.",
      },
      {
        q: "Can I make a guide from several screenshots?",
        a: "Yes. Add up to 30 captures to a guide, write a line under each, and export a PDF or a Markdown ZIP with its images.",
        plainAnswer: "Yes. Add up to 30 captures to a guide, write a line under each, and export a PDF or a Markdown ZIP with its images.",
      },
      {
        q: "Can I search my past captures?",
        a: "Yes. History searches the words inside each screenshot, the page title and the address. GoFully reads each capture on your device. Turn it off with Search inside screenshots in Settings.",
        plainAnswer: "Yes. History searches the words inside each screenshot, the page title and the address. GoFully reads each capture on your device. Turn it off with Search inside screenshots in Settings.",
      },
      {
        q: "Can I reopen an old capture in the editor?",
        a: "Yes, if you turn on Keep recent captures in Settings. GoFully then stores the full image of your last 10 captures on your device. With it off, History keeps thumbnails and opens the source page.",
        plainAnswer: "Yes, if you turn on Keep recent captures in Settings. GoFully then stores the full image of your last 10 captures on your device. With it off, History keeps thumbnails and opens the source page.",
      },
      {
        q: "What export formats are available?",
        a: "Copy to clipboard, save as PNG, JPG or WebP, or export a paginated multi-page PDF.",
        plainAnswer: "Copy to clipboard, save as PNG, JPG or WebP, or export a paginated multi-page PDF.",
      },
    ],
  },
  {
    category: "New in 1.1.3",
    items: [
      {
        q: "Can I hide private details on the page before I capture it?",
        a: "Yes. Redact page covers emails, card numbers, phone numbers, ID numbers, IBANs, IP addresses and API keys on the live page, in text and form fields, plus anything you click. It keeps covering text that loads later, so full-page captures stay covered. Done puts the page back exactly as it was.",
        plainAnswer: "Yes. Redact page covers emails, card numbers, phone numbers, ID numbers, IBANs, IP addresses and API keys on the live page, in text and form fields, plus anything you click. It keeps covering text that loads later, so full-page captures stay covered. Done puts the page back exactly as it was.",
      },
      {
        q: "Can GoFully measure spacing and pick colors?",
        a: "Yes. Measure shows what an element is, its size, padding, margin and text style. Click one and hover another to see the gap, or drag a free ruler. Press C to pick any color on screen and copy its hex value.",
        plainAnswer: "Yes. Measure shows what an element is, its size, padding, margin and text style. Click one and hover another to see the gap, or drag a free ruler. Press C to pick any color on screen and copy its hex value.",
      },
      {
        q: "Can I capture a dropdown menu or a tooltip?",
        a: "Yes. Set Delay in the popup to 3, 5 or 10 seconds. The popup closes, a countdown shows on the page, and you open the menu or hover the tooltip before GoFully captures. Esc cancels.",
        plainAnswer: "Yes. Set Delay in the popup to 3, 5 or 10 seconds. The popup closes, a countdown shows on the page, and you open the menu or hover the tooltip before GoFully captures. Esc cancels.",
      },
      {
        q: "What happens after a capture?",
        a: "Quick captures stack in the top right corner of the page, each with its own Copy, Save, Edit and Pin buttons, and you can drag one onto your desktop or into a folder or an app that accepts files. In Settings, After a capture can copy, save as PNG or PDF, open the editor or pin the image instead.",
        plainAnswer: "Quick captures stack in the top right corner of the page, each with its own Copy, Save, Edit and Pin buttons, and you can drag one onto your desktop or into a folder or an app that accepts files. In Settings, After a capture can copy, save as PNG or PDF, open the editor or pin the image instead.",
      },
      {
        q: "Can GoFully read QR codes?",
        a: "Yes. QR codes and common barcodes in a capture are read on your device and listed on its card, and Find codes in the editor lists every code in a long capture. Only web links get an Open button.",
        plainAnswer: "Yes. QR codes and common barcodes in a capture are read on your device and listed on its card, and Find codes in the editor lists every code in a long capture. Only web links get an Open button.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    items: [
      {
        q: "The extension isn't capturing the full page",
        a: "Refresh the page and try again — some sites delay content until you scroll, which the first pass can miss.",
        plainAnswer: "Refresh the page and try again — some sites delay content until you scroll, which the first pass can miss.",
      },
      {
        q: "OCR isn't recognizing text correctly",
        a: "Accuracy depends on image clarity — zoom in on small or low-contrast text before extracting.",
        plainAnswer: "Accuracy depends on image clarity — zoom in on small or low-contrast text before extracting.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.plainAnswer,
      },
    }))
  ),
};

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FAQPage() {
  return (
    <div className="gf-industry min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
      </div>

      <PageHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        lede=<>Everything you need to know about capturing, editing, and exporting with GoFully. Can&apos;t find it here?{" "}
            <Link href="/support">Contact our team</Link>.</>
      />

      <div className="gf-faq">
        <nav className="gf-faq-nav" aria-label="FAQ topics">
          {FAQ_GROUPS.map((group) => (
            <a key={group.category} href={`#${slug(group.category)}`}>{group.category}</a>
          ))}
        </nav>
        <div className="gf-faq-groups">
          {FAQ_GROUPS.map((group) => (
            <section key={group.category} id={slug(group.category)} className="gf-faq-group">
              <h2>{group.category}</h2>
              <div className="gf-faq-list">
                {group.items.map((item) => (
                  <details key={item.q} className="gf-faq-item">
                    <summary>
                      <h3>{item.q}</h3>
                      <span className="gf-faq-icon" aria-hidden="true" />
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <CtaBand
        title="Still stuck?"
        sub="Email us or open an issue on GitHub. Both are on the Support page."
        action={{ href: "/support", label: "Contact support" }}
      />

      <SiteFooterIndustry activeHref="/faq" />
    </div>
  );
}
