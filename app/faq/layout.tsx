import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — GoFully",
  description: "Find answers to common questions about full page capture, OCR text extraction, privacy redaction, and Chrome permissions in GoFully.",
  alternates: { canonical: "https://gofully-extension.vercel.app/faq" },
  openGraph: {
    title: "Frequently Asked Questions — GoFully",
    description: "Common questions about GoFully full page screenshot extension.",
    url: "https://gofully-extension.vercel.app/faq",
    siteName: "GoFully",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { q: "Is GoFully free?", a: "Yes — free forever, with no account required to use any feature." },
    { q: "Which browsers does it support?", a: "Chrome and other Chromium-based browsers, including Edge and Brave." },
    { q: "Do I need to sign up?", a: "No. Install the extension and start capturing right away — there's no account system at all." },
    { q: "Does anything get uploaded to a server?", a: "No. Capture, OCR, and editing all run locally in your browser — nothing is transmitted." },
    { q: "What permissions does the extension need?", a: "Just enough to capture the active tab, save exports, and copy to your clipboard. See the security page for the full breakdown." },
    { q: "Is my captured data stored anywhere?", a: "Only locally on your device, and only until you export or discard the result." },
    { q: "What capture modes are supported?", a: "Full page, visible area, a custom selected region, or a scrolling feed." },
    { q: "Can I redact sensitive information?", a: "Yes — blur or pixelate any region before you export or share the result." },
    { q: "What export formats are available?", a: "Copy to clipboard, save as PNG, or export a paginated PDF." },
    { q: "The extension isn't capturing the full page", a: "Refresh the page and try again — some sites delay content until you scroll, which the first pass can miss." },
    { q: "OCR isn't recognizing text correctly", a: "Accuracy depends on image clarity — zoom in on small or low-contrast text before extracting." },
  ].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <BreadcrumbJsonLd name="FAQ" path="/faq" />
      {children}
    </>
  );
}
