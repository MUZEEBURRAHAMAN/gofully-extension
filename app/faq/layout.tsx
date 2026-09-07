import type { Metadata } from "next";

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

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
