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
    shortcut: "/favicon.ico",
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
      "installUrl": "https://chromewebstore.google.com",
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
    <html lang="en" className="dark">
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
