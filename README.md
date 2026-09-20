# GoFully — Full Page Screenshot & Annotation Studio

A modern, high-performance Chrome extension for capturing full pages, viewports, custom selected areas, and scrolling regions — plus **on-device OCR text extraction** in six languages — complete with a CleanShot X-inspired annotation editor, screenshot history, and HD/4K/PDF export. Works 100% offline and preserves your privacy.

![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-blue?logo=googlechrome)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![Deployment](https://img.shields.io/badge/Live%20Website-gofully--extension.vercel.app-success?logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green)

**🌐 Official Website & Documentation**: [https://gofully-extension.vercel.app](https://gofully-extension.vercel.app)

---

## 📍 Status & Roadmap

**Current version: `v1.1.2`**

Recently shipped in `v1.1.2`:
- **Capture engine** — one Image Quality setting for both JPG and WebP exports, sticky/fixed headers re-checked on every scroll step (fixes header duplication on sites where a header only becomes fixed after scrolling), progress-badge race fixed across all capture modes, seam verification in scroll-stitch
- **Editor** — Rectangle/Ellipse consolidated into a single Shape button with six shapes (Rectangle, Square, Circle, Ellipse, Triangle, Polygon), zoom raised to 1000%, JPG export added to the quick-export result cards, editor toolbar adapts to laptop/tablet widths, export-at-high-zoom crash fixed
- **Personalization & Beautify** — interface language and light/dark theme, OCR language selection (English, Spanish, French, German, Portuguese, Simplified Chinese — still fully on-device), highlighter tool, saveable Beautify presets, multi-image collage layouts, gradient background library, more device frames, optional URL/timestamp capture stamp, "Copy as JSON" after OCR
- **Screenshot history** — thumbnail grid in the popup, browse and reopen past captures, stored locally on-device

Full detail and what's genuinely still ahead (custom editor keyboard shortcuts, Markdown export, multi-tab batch capture, auto-redact detection, screen recording) is on the **[public roadmap](https://gofully-extension.vercel.app/roadmap)**.

---

## Comparison: GoFully vs. Other Tools

| Feature / Standard | GoFullPage | FireShot | Awesome Screenshot | Nimbus | **GoFully** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Full-Page Capture** | ✅ | ✅ | ✅ | ✅ | **✅ (CDP single-shot + scroll-stitch fallback)** |
| **Scrolling-Area Capture** (chat, code panels, data tables) | ❌ | ❌ | ❌ | ❌ | **✅** |
| **On-Device OCR (Free)** | ❌ | ❌ | ❌ | ❌ | **✅ (100% local WASM, 6 languages)** |
| **Glass Blur / Pixelate / Redact** | ❌ *(Paid)* | ❌ | ⚠️ *(Basic)* | ⚠️ *(Basic)* | **✅ (Glass + Pixel + Redact)** |
| **Offline Privacy Guarantee** | ✅ | ✅ | ❌ *(Uploads data)* | ❌ | **✅ (Zero cloud uploads, zero network requests)** |
| **CleanShot-Style Markup** | ❌ | ❌ | ❌ | ❌ | **✅ (Curved arrows, step badges, spotlight)** |
| **Custom Aspect Ratio Crop** | ❌ | ❌ | ❌ | ❌ | **✅ (10 presets + nudging)** |
| **Multi-Page PDF Export** | ❌ *(Paid)* | ✅ | ❌ *(Paid)* | ✅ | **✅ (Free, auto-paginated A4)** |
| **Manifest V3** | ✅ | ⚠️ *(Partial)* | ⚠️ *(Partial)* | ❌ | **✅ (Native, not retrofitted)** |

---

## Features

### 📸 Capture Modes
| Mode | Shortcut | Description |
|---|---|---|
| **Full Page** | `Ctrl+Shift+F` (`⌘+Shift+F` on Mac) | Captures entire scrollable document via Chrome DevTools Protocol for pixel-perfect single-shot captures, with scroll-stitch fallback, smart sticky-header handling, and lazy-load pre-triggering |
| **Visible Area** | `Ctrl+Shift+V` (`⌘+Shift+V` on Mac) | Captures exactly what's visible in your current viewport instantly |
| **Selected Area** | `Ctrl+Shift+A` (`⌘+Shift+A` on Mac) | Interactive overlay with precise dimensions & snap guides to drag-select any custom region |
| **Scrolling Area** | — | Select any fixed rectangular viewport area (a chat panel, code block, or data table) and automatically scroll-and-stitch its contents |
| **Capture Text (OCR)** | — | Drag-select any region on any webpage or image to extract and copy recognized text instantly via local, offline OCR — English, Spanish, French, German, Portuguese, or Simplified Chinese |

---

### 🎨 CleanShot X-Inspired Annotation Editor
- **Shapes & Lines**
  - **Straight & Curved Arrows** (with expandable curve controls)
  - **Shape tool** — Rectangle, Square, Circle, Ellipse, Triangle, Polygon, one button with a dropdown
  - **Line** tool and **Freehand Pen** with custom stroke width
- **Rich Annotations & Callouts**
  - **Text Tool** with handwriting font styling (`Caveat`)
  - **Callout Bubbles** with auto-styled text containers
  - **Step Numbers** (`1`, `2`, `3`…) with auto-increment counter
  - **Highlighter** — draw attention instead of hiding it
  - **Spotlight Mode** to dim background and highlight key areas
- **Blur & Redaction**
  - **Glass Smooth Blur** (Gaussian-style smooth blur)
  - **Pixelate** (Mosaic effect)
  - **Redact Blackout** (Solid security redaction)
- **Advanced Cropper (`Cropper.js`)**
  - Modal crop studio with 10 aspect ratio presets: **Free, 1:1, 4:3, 3:2, 16:9, 9:16, 21:9, A4, Twitter, OG Image**
  - Keyboard nudge support (Arrow keys + Shift for 10px jumps)
  - Rule-of-thirds grid overlay
- **Beautify**
  - 11 gradient presets plus solid colors, dot-grid and diagonal-stripe patterns
  - macOS, browser, Windows, or phone frame overlays
  - Adjustable padding, corner radius, drop shadow
  - Save your own combination as a reusable preset
  - Multi-image collage — arrange captures side-by-side or stacked
- **Color & Style Palette**
  - 8 curated color swatches + adjustable stroke width slider (2px–12px)
- **History & Canvas Controls**
  - Undo / Redo history stack (up to 50 states)
  - Zoom up to **1000%** for pixel-precise annotation, header/zoom controls
  - Include Annotations export toggle — export the clean original or the annotated version, your choice

---

### 💾 Export & Sharing
- **Copy to Clipboard** — Instant PNG copy
- **Save PNG, JPG, or WebP** — Native Resolution, 1080p HD, or 4K UHD, with an adjustable Image Quality setting (Low/Medium/High/Maximum) for JPG and WebP
- **Export to PDF** — Auto-paginated A4 document generation with high DPI preservation
- **Quick In-Page Result Bar** — Instant copy, save, or edit directly on the captured page, without opening a new tab
- **Screenshot History** — every capture saved locally with a thumbnail, source site, and timestamp; reopen, re-edit, or re-export in one click from the popup

---

### ⌨️ Keyboard Shortcuts

#### Global Shortcuts
| Shortcut | Action |
|---|---|
| `Alt+S` | Open GoFully popup |
| `Ctrl+Shift+F` (`⌘+Shift+F`) | Capture full page |
| `Ctrl+Shift+V` (`⌘+Shift+V`) | Capture visible viewport |
| `Ctrl+Shift+A` (`⌘+Shift+A`) | Capture selected area |

#### Annotation Editor Shortcuts
| Key | Action |
|---|---|
| `V` | Select tool |
| `A` | Arrow tool (Straight / Curved) |
| `R` | Rectangle (Shape tool) |
| `E` | Ellipse (Shape tool) |
| `C` | Callout bubble |
| `L` | Line tool |
| `P` | Freehand pen |
| `T` | Text annotation |
| `S` | Spotlight highlight |
| `B` | Blur / Pixelate / Redact |
| `N` | Step number badge |
| `H` | Highlighter |
| `X` | Open Crop Studio |
| `Enter` | Apply crop (in Crop Studio) |
| `Esc` | Cancel crop / dismiss |
| `Arrow Keys` | Nudge crop selection (Hold `Shift` for 10px) |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘⇧Z` / `⌘Y` / `Ctrl+Y` | Redo |
| `⌘D` / `Ctrl+D` | Duplicate selected object |
| `⌫` / `Delete` | Delete selected object |
| `⌘+` / `⌘-` | Zoom in / Zoom out |

---

## 🛠️ Tech Stack

- **Chrome Extension MV3** — Service Worker, Offscreen Documents, Content Scripts
- **TypeScript** — Full strict type safety
- **Fabric.js 7** — Annotation engine and canvas manipulation
- **Cropper.js** — Advanced interactive image cropping
- **StackBlur Canvas** — Smooth hardware-accelerated blur effects
- **Tesseract.js / OCR** — Local client-side optical character recognition, 6 bundled languages
- **jsPDF** — Client-side PDF generation
- **Vite & Rollup** — Fast asset compilation and module bundling

---

## 📁 Project Structure

```
src/
├── background/
│   ├── service-worker.ts      # Extension lifecycle, message dispatch, capture orchestrator
│   ├── capture-engine.ts      # Full page / visible / region capture pipeline
│   └── stitch-capture.ts      # Full page scroll-stitch capture engine
├── capture-modes/
│   └── scrolling-area.ts      # Region scroll capture implementation
├── content/
│   ├── ocr-overlay.ts         # OCR drag-and-select area overlay & text extraction
│   ├── region-selector.ts     # Drag-to-select region UI with dimensions
│   ├── scrolling-area-ui.ts   # Interactive scrolling area boundary selector
│   ├── result-bar.ts          # In-page post-capture action bar
│   ├── page-analyzer.ts       # Document dimensions and layout metrics
│   ├── sticky-manager.ts      # Smart sticky/fixed element visibility management
│   └── lazy-loader.ts         # Viewport scroll trigger for lazy-loaded media
├── editor/
│   ├── editor.html            # CleanShot X-style editor interface
│   └── canvas-editor.ts       # Fabric.js editor tools, blur filters, cropping & Beautify logic
├── review/
│   ├── review.html            # Post-capture preview/export tab (Full Page & Scrolling Area)
│   └── review.ts
├── popup/
│   ├── popup.html             # Extension popup UI, capture modes & history
│   └── popup.ts
├── settings/
│   ├── settings.html          # Preferences: theme, language, OCR language, capture stamp
│   └── settings.ts
├── help/                      # In-extension help/onboarding page
├── welcome/                   # First-run onboarding page
├── locales/                   # en / es / fr interface translations
├── export/
│   ├── clipboard.ts           # Clipboard write helper
│   ├── pdf-generator.ts       # jsPDF paginated document creator
│   ├── exporter.ts            # Shared export orchestration
│   └── save-png.ts            # High-res file downloader
├── offscreen/
│   ├── offscreen.html         # Offscreen worker canvas host
│   └── canvas-stitcher.ts     # Offscreen canvas multi-frame stitcher + Tesseract OCR worker
└── utils/
    ├── dpr-handler.ts         # Device pixel ratio calculations
    ├── history.ts             # Screenshot history storage and thumbnail generation
    ├── image.ts               # Image format and blob transformations
    ├── i18n.ts                # Interface language / translation loading
    ├── theme.ts               # Light/dark theme application
    ├── url-validator.ts       # Blocks capture on restricted/internal Chrome pages
    ├── rate-nudge.ts          # Post-capture rating prompt
    └── permissions.ts         # Chrome permissions helpers
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+)
- Google Chrome (or Chromium-based browser)

### Install & Build

```bash
# Clone the repository
git clone git@github.com:MUZEEBURRAHAMAN/gofully-extension.git
cd gofully-extension

# Install dependencies
npm install

# Build the extension for production
node build.mjs
```

The output bundle will be generated in the `dist/` directory.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Toggle on **Developer mode** in the top-right corner
3. Click **Load unpacked**
4. Select the `dist/` folder inside this project directory

---

## 🔒 Privacy & Security

GoFully runs entirely inside your browser — no server in the loop, no account, nothing sent anywhere without your permission.

- **100% Client-Side Processing**: All captures, OCR text extraction, and annotations execute entirely on-device. No images or text are ever sent to external servers.
- **Sender-verified tab targeting**: Capture-critical messages resolve their target tab from the browser's own message sender, not from a value a page could hand the extension — a compromised content script can't redirect a capture to another tab.
- **Strict image-source validation**: Anything loaded into the editor canvas must be a `data:image/` URI — no remote or script-scheme sources are ever accepted.
- **Locked-down Content Security Policy**: `script-src 'self'` on every extension page — no remotely hosted or inline script can execute.
- **Manifest V3 native**: Built on a non-persistent service worker from day one, not a Manifest V2 extension retrofitted to pass review.

Full breakdown of every permission and why it's needed: **[gofully-extension.vercel.app/security](https://gofully-extension.vercel.app/security)**.

Found a security issue? Email **rahamanmuzeeb1108@gmail.com** or see the [support page](https://gofully-extension.vercel.app/support).

---

## 📄 License

[MIT](LICENSE) © 2026 Muzeeburrahaman
