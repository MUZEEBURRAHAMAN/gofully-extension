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
  title: {
    default: "GoFully — Full Page Screenshot Tool, Visual Editor & Local OCR",
    template: "%s | GoFully",
  },
  applicationName: "GoFully",
  description:
    "GoFully is a powerful full page screenshot tool, scrolling screen capture, and visual editor Chrome extension. Capture entire webpages, edit & annotate, blur sensitive data, extract text with local OCR, and export in 4K or PDF — 100% free & offline.",
  keywords: [
    "full page screenshot",
    "screenshot",
    "scrolling screenshot",
    "screen capture",
    "screenshot tool",
    "screenshot editor",
    "chrome screenshot editor",
    "annotate screenshot",
    "blur screenshot",
    "redact screenshot",
    "chrome screenshot extension",
    "how to take full page screenshot",
    "screenshot entire webpage",
    "entire webpage screenshot",
    "capture full page chrome",
    "free screenshot extension",
    "scrolling screen capture",
    "scrolling screenshot chrome",
    "screen grabber",
    "screenshot to pdf",
    "ocr screenshot",
    "extract text from image",
    "extract text from screenshot",
    "screenshot markup tool",
    "screen capture and editor",
    "clean screenshot tool",
    "best screenshot chrome extension",
    "fireshot alternative",
    "gofullpage alternative",
    "awesome screenshot alternative",
    "nimbus alternative",
    "webpage capture tool",
    "go fully",
    "gofully extension",
    "gofully chrome extension",
    "gofully screenshot",
  ],
  authors: [{ name: "GoFully", url: "https://gofully-extension.vercel.app" }],
  creator: "GoFully",
  publisher: "GoFully",
  category: "Productivity",
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://gofully-extension.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    title: "GoFully",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "GoFully — Full Page Screenshot, Visual Editor & Local OCR Studio",
    description:
      "Capture entire webpages, annotate visually with arrows and callouts, blur sensitive data, extract text with local OCR, and export in 4K or PDF — 100% private and in-browser.",
    url: "https://gofully-extension.vercel.app",
    siteName: "GoFully",
    images: [
      {
        url: "https://gofully-extension.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoFully — Full Page Screenshot Tool, Visual Editor & Local OCR",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoFully — Full Page Screenshot, Visual Editor & Local OCR Studio",
    description: "Capture, annotate, redact, OCR, and export full scrolling webpages in seconds. Free, offline & 100% on-device.",
    images: ["https://gofully-extension.vercel.app/og-image.png"],
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
      "name": "GoFully: Full Page Screenshot, OCR & Visual Editor",
      "alternateName": [
        "GoFully Screenshot Tool",
        "Go Fully",
        "GoFully Extension",
        "Full Page Screenshot Chrome Extension",
        "Scrolling Screenshot Tool",
        "Chrome Screenshot Editor",
        "Screenshot Annotate Tool",
        "Chrome Screenshot Extension"
      ],
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Google Chrome, Chromium, Brave, Microsoft Edge",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "High-performance Chrome extension for full-page scrolling screenshots, on-device WebAssembly OCR text extraction, CleanShot-grade visual annotations, and PDF/4K exports.",
      "url": "https://gofully-extension.vercel.app/",
      "image": "https://gofully-extension.vercel.app/logo.png",
      "screenshot": "https://gofully-extension.vercel.app/og-image.png",
      "softwareVersion": "1.1.1",
      "installUrl": "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc",
      "featureList": [
        "Full page scrolling screenshot capture",
        "Selected region and visible area capture",
        "On-device WebAssembly OCR text extraction",
        "Visual annotation studio with arrows, callouts, and step numbers",
        "Privacy redaction with blur and pixelation",
        "Screenshot mockup beautifier with gradient backgrounds",
        "Instant export to PNG, WebP, 4K UHD, and paginated PDF"
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://gofully-extension.vercel.app/#website",
      "url": "https://gofully-extension.vercel.app/",
      "name": "GoFully",
      "alternateName": ["GoFully Extension", "GoFully Screenshot Tool", "GoFully Full Page Screenshot", "Go Fully"],
      "description":
        "The complete web capture, full page screenshot, local OCR, and visual annotation studio for Chrome.",
      "publisher": {
        "@type": "Organization",
        "@id": "https://gofully-extension.vercel.app/#organization",
        "name": "GoFully",
        "alternateName": "Go Fully",
        "url": "https://gofully-extension.vercel.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gofully-extension.vercel.app/logo.png"
        },
        "sameAs": [
          "https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc",
          "https://github.com/MUZEEBURRAHAMAN/gofully-extension",
          "https://alternativeto.net/software/gofully/about/"
        ]
      }
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
        <meta name="google-site-verification" content="GjxLZnMKWrl0IzHC4J6K8B03R5riBt-uVERSerMOBF8" />
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
