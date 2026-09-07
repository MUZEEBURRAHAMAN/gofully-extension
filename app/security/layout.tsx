import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Security & Privacy Architecture — GoFully",
  description: "Learn how GoFully executes all screenshot processing, OCR, and editing 100% locally on your device with zero cloud transmission.",
  alternates: { canonical: "https://gofully-extension.vercel.app/security" },
  openGraph: {
    title: "Security & Privacy Architecture — GoFully",
    description: "100% on-device capture and OCR. No servers, no tracking.",
    url: "https://gofully-extension.vercel.app/security",
    siteName: "GoFully",
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd name="Security & Privacy" path="/security" />
      {children}
    </>
  );
}
