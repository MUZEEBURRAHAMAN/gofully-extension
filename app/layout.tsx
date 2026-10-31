import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif";
import "./globals.css";
import { serializeJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL("https://gofully-extension.vercel.app"),
  title: {
    default: "GoFully — The Private Screenshot Studio for Chrome",
    template: "%s | GoFully",
  },
  applicationName: "GoFully",
  description:
    "The screenshot studio that stays on your device. Full page, element and area capture, redact, measure, OCR, markup and export. Free, no account.",
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
  authors: [{ name: "Muzeeb Urrahaman", url: "https://github.com/MUZEEBURRAHAMAN" }],
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
    title: "GoFully — The Screenshot Studio That Stays on Your Device",
    description:
      "The screenshot studio that stays on your device. Full page, element and area capture, redact, measure, OCR, markup and export. Free, no account.",
    url: "https://gofully-extension.vercel.app",
    siteName: "GoFully",
    images: [
      {
        url: "https://gofully-extension.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoFully, the screenshot studio that stays on your device",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoFully — The Screenshot Studio That Stays on Your Device",
    description: "The screenshot studio that stays on your device. Full page, element and area capture, redact, measure, OCR, markup and export. Free, no account.",
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
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "ratingCount": "5",
        "bestRating": "5",
        "worstRating": "1"
      },
      "description":
        "The screenshot studio for Chrome that stays on your device: full page, element and area capture, redact before you capture, measure, on-device OCR, markup and PDF export.",
      "url": "https://gofully-extension.vercel.app/",
      "image": "https://gofully-extension.vercel.app/logo.png",
      "screenshot": "https://gofully-extension.vercel.app/og-image.png",
      "softwareVersion": "1.1.2",
      "installUrl": "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc",
      "author": { "@id": "https://gofully-extension.vercel.app/#person" },
      "publisher": { "@id": "https://gofully-extension.vercel.app/#organization" },
      "featureList": [
        "Full page scrolling screenshot capture",
        "Selected region and visible area capture",
        "Scrolling inner-element capture",
        "On-device WebAssembly OCR in 6 languages (English, Spanish, French, German, Portuguese, Chinese)",
        "CleanShot-grade highlighter tool with multiply-blending",
        "14 visual annotation tools — arrows, callouts, step badges, spotlight, 6 shapes",
        "Privacy redaction with blur, pixelate, and blackout",
        "Screenshot mockup beautifier with gradient backgrounds and real URL frames",
        "Instant export to PNG, JPG, WebP, 4K UHD, and paginated PDF",
        "Cookie banner and modal auto-dismiss during capture",
        "Video auto-pause during scroll capture",
        "Local screenshot history gallery stored on-device",
        "100% offline — zero data leaves your device"
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://gofully-extension.vercel.app/#website",
      "url": "https://gofully-extension.vercel.app/",
      "name": "GoFully",
      "alternateName": ["GoFully Extension", "GoFully Screenshot Tool", "GoFully Full Page Screenshot", "Go Fully"],
      "description":
        "The screenshot studio that stays on your device: capture, redact, measure, read text, mark up and share.",
      "publisher": { "@id": "https://gofully-extension.vercel.app/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://gofully-extension.vercel.app/#organization",
      "name": "GoFully",
      "alternateName": "Go Fully",
      "url": "https://gofully-extension.vercel.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gofully-extension.vercel.app/logo.png"
      },
      "founder": { "@id": "https://gofully-extension.vercel.app/#person" },
      "sameAs": [
        "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc",
        "https://github.com/MUZEEBURRAHAMAN/gofully-extension",
        "https://alternativeto.net/software/gofully/about/"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://gofully-extension.vercel.app/#person",
      "name": "Muzeeb Urrahaman",
      "url": "https://gofully-extension.vercel.app/",
      "sameAs": [
        "https://github.com/MUZEEBURRAHAMAN"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://gofully-extension.vercel.app/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://gofully-extension.vercel.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Guides",
          "item": "https://gofully-extension.vercel.app/guides"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Alternatives",
          "item": "https://gofully-extension.vercel.app/alternatives"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "FAQ",
          "item": "https://gofully-extension.vercel.app/faq"
        }
      ]
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
      data-theme="light"
    >
      <head>
        <meta name="google-site-verification" content="GjxLZnMKWrl0IzHC4J6K8B03R5riBt-uVERSerMOBF8" />
        <meta name="dmca-site-verification" content="akg5a25Ob21PL0dlSmMxam1jd2oxU25zWThJYktCOEJlSmpNelphMmgvYz01" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body>
        <ViewTransition default="gf-page">{children}</ViewTransition>
      </body>
    </html>
  );
}
