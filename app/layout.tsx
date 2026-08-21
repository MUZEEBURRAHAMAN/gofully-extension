import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/components/originkit/hero-26.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gofully-extension.vercel.app"),
  title: "GoFully — Full Page Screenshot, Local OCR & Annotation Studio",
  description:
    "GoFully is a powerful Chrome extension for capturing full webpages, extracting text with local WebAssembly OCR, annotating screenshots, and exporting in 4K or PDF — 100% on-device.",
  icons: {
    icon: "/assets/icon-32.png",
    apple: "/assets/icon-128.png",
  },
  openGraph: {
    title: "GoFully — Full Page Screenshot & Screen Capture Studio",
    description:
      "Capture entire webpages, extract text with local OCR, annotate visually, and export in 4K/PDF. 100% private and in-browser.",
    url: "https://gofully-extension.vercel.app",
    siteName: "GoFully",
    images: [
      {
        url: "https://gofully-extension.vercel.app/gofully-wordmark.png",
        width: 1200,
        height: 630,
        alt: "GoFully Screenshot Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoFully — Full Page Screenshot Studio",
    description: "Capture, OCR, annotate, redact, and export full webpages in seconds.",
    images: ["https://gofully-extension.vercel.app/gofully-wordmark.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
