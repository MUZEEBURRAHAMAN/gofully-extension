import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import "@/components/originkit/hero-26.css";

// Loaded (self-hosted at build time) via next/font instead of the old
// `@import url("https://fonts.googleapis.com/...")` in globals.css — Next's
// CSS bundler silently drops a remote @import that isn't first in the file
// (it lands after Tailwind's expanded output), so that import was never
// actually reaching the browser and the fonts were always falling back.
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gofully-extension.vercel.app"),
  title: "GoFully — Full Page Screenshot, Local OCR & Annotation Studio",
  description:
    "GoFully is a powerful Chrome extension for capturing full webpages, extracting text with local WebAssembly OCR, annotating screenshots, and exporting in 4K or PDF — 100% on-device.",
  icons: {
    // The nav/footer icon-XX.png files are the bare glyph (no fill) because
    // they sit inside their own blue badge container — dropped straight into
    // a browser tab or iOS home screen with no container of its own, that
    // same file all but disappears. These favicon-*.png files are the same
    // mark pre-composited onto the accent-blue background instead.
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-180.png",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://gofully-extension.vercel.app/#software",
      "name": "GoFully",
      "applicationCategory": "BrowserApplication",
      "operatingSystem": "Google Chrome, Chromium, Brave, Edge",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "High-performance Chrome extension for full-page scrolling screenshots, on-device WebAssembly OCR text extraction, CleanShot-grade visual annotations, and PDF/4K exports.",
      "url": "https://gofully-extension.vercel.app/",
      "installUrl": "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc",
    },
    {
      "@type": "WebSite",
      "@id": "https://gofully-extension.vercel.app/#website",
      "url": "https://gofully-extension.vercel.app/",
      "name": "GoFully",
      "description":
        "The complete web capture, local OCR, and visual annotation studio for Chrome.",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${bricolageGrotesque.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#070b14] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
