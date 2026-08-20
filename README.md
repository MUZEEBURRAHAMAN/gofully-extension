# GoFully — Full Page Screenshot & Annotation Studio

A modern, high-performance Chrome extension for capturing full pages, viewports, custom selected areas, scrolling regions, and **extracting text (OCR)** — complete with a CleanShot X-inspired annotation editor and HD/4K/PDF export. Works 100% offline and preserves your privacy.

![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-blue?logo=googlechrome)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![Deployment](https://img.shields.io/badge/Live%20Website-gofully--extension.vercel.app-success?logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green)

**🌐 Official Website & Documentation**: [https://gofully-extension.vercel.app](https://gofully-extension.vercel.app)

---

## Comparison: GoFully vs. Other Tools

| Feature / Standard | GoFullPage | Awesome Screenshot | Lightshot | **GoFully** |
|---|:---:|:---:|:---:|:---:|
| **Full-Page CDP Capture** | ✅ | ⚠️ *(Scroll only)* | ❌ | **✅ (CDP + Scroll fallback)** |
| **On-Device OCR (Free)** | ❌ | ❌ *(Paid cloud)* | ❌ | **✅ (100% Local WASM)** |
| **Glass Blur / Redaction**| ❌ *(Paid)* | ⚠️ *(Basic pixel)* | ❌ | **✅ (Glass + Pixel + Redact)** |
| **Offline Privacy Guarantee** | ✅ | ❌ *(Uploads data)* | ❌ *(Public URL leaks)* | **✅ (Zero Cloud Uploads)** |
| **CleanShot-Style Markup**| ❌ | ❌ | ❌ | **✅ (Curved arrows, steps, spotlight)** |
| **Custom Aspect Ratio Crop** | ❌ | ❌ | ❌ | **✅ (Cropper.js presets + nudging)** |
| **Multi-Page PDF Export** | ❌ *(Paid)* | ❌ *(Paid)* | ❌ | **✅ (Free auto-paginated A4)** |

---

## Features

### 📸 Capture Modes
| Mode | Shortcut | Description |
|---|---|---|
| **Full Page** | `⌥⇧F` / `Alt+Shift+F` | Captures entire scrollable document with CDP & scroll-stitch fallback, smart sticky element handling, and lazy-load pre-triggering |
| **Visible Area** | `⌥⇧V` / `Alt+Shift+V` | Captures exactly what's visible in your current viewport instantly |
| **Selected Area** | — | Interactive overlay with precise dimensions & snap guides to drag-select any custom region |
| **Scrolling Area** | — | Select any fixed rectangular viewport area and automatically scroll-and-stitch its contents |
| **Capture Text (OCR)** | — | Drag-select any region on any webpage or image to extract and copy recognized text instantly via local OCR |

---

### 🎨 CleanShot X-Inspired Annotation Editor
- **Shapes & Lines**
  - **Straight & Curved Arrows** (with expandable curve controls)
  - **Rectangle** & **Ellipse**
  - **Line** tool
  - **Freehand Pen** with custom stroke width
- **Rich Annotations & Callouts**
  - **Text Tool** with handwriting font styling (`Caveat`)
  - **Callout Bubbles** with auto-styled text containers
  - **Step Numbers** (`1`, `2`, `3`…) with auto-increment counter
  - **Spotlight Mode** to dim background and highlight key areas
- **Blur & Redaction**
  - **Glass Smooth Blur** (Gaussian-style smooth blur)
  - **Pixelate** (Mosaic effect)
  - **Redact Blackout** (Solid security redaction)
- **Advanced Cropper (`Cropper.js`)**
  - Modal crop studio with aspect ratio presets (**Free**, **16:9**, **4:3**, **1:1**, **3:2**, **2:1**)
  - Keyboard nudge support (Arrow keys + Shift for 10px jumps)
  - Rule-of-thirds grid overlay
- **Color & Style Palette**
  - 8 curated color swatches + adjustable stroke width slider (2px–12px)
- **History & Canvas Controls**
  - Undo / Redo history stack (up to 50 states)
  - Header & toolbar zoom controls (0.1x to 5.0x zoom, reset to 100%)

---

### 💾 Export & Sharing
- **Copy to Clipboard** — Instant PNG copy
- **Save PNG** — Export in **Native Resolution**, **1080p HD**, or **4K UHD**
- **Export to PDF** — Auto-paginated A4 document generation with high DPI preservation
- **Quick In-Page Result Bar** — Instant copy, save, or edit directly on the captured page

---

### ⌨️ Keyboard Shortcuts

#### Global Shortcuts
| Shortcut | Action |
|---|---|
| `Alt+S` | Open GoFully popup |
| `Alt+Shift+F` / `⌥⇧F` | Capture full page |
| `Alt+Shift+V` / `⌥⇧V` | Capture visible viewport |

#### Annotation Editor Shortcuts
| Key | Action |
|---|---|
| `V` | Select tool |
| `A` | Arrow tool (Straight / Curved) |
| `R` | Rectangle tool |
| `E` | Ellipse tool |
| `C` | Callout bubble |
| `L` | Line tool |
| `P` | Freehand pen |
| `T` | Text annotation |
| `S` | Spotlight highlight |
| `B` | Blur / Pixelate / Redact |
| `N` | Step number badge |
| `X` | Open Crop Studio |
| `Enter` | Apply crop (in Crop Studio) |
| `Esc` | Cancel crop / dismiss |
| `Arrow Keys` | Nudge crop selection (Hold `Shift` for 10px) |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘⇧Z` / `⌘Y` / `Ctrl+Y` | Redo |
| `⌫` / `Delete` | Delete selected object |
| `⌘+` / `⌘-` | Zoom in / Zoom out |

---

## 🛠️ Tech Stack

- **Chrome Extension MV3** — Service Worker, Offscreen Documents, Content Scripts
- **TypeScript** — Full strict type safety
- **Fabric.js 7** — Annotation engine and canvas manipulation
- **Cropper.js** — Advanced interactive image cropping
- **StackBlur Canvas** — Smooth hardware-accelerated blur effects
- **Tesseract.js / OCR** — Local client-side optical character recognition
- **jsPDF** — Client-side PDF generation
- **Vite & Rollup** — Fast asset compilation and module bundling
- **Chrome DevTools Protocol (CDP)** — Pixel-perfect full page captures via `chrome.debugger`

---

## 📁 Project Structure

```
src/
├── background/
│   ├── service-worker.ts      # Extension lifecycle, message dispatch, capture orchestrator
│   ├── capture-engine.ts      # Full page / visible / region capture pipeline
│   ├── cdp-capture.ts         # CDP-based full page capture
│   └── stitch-capture.ts      # Viewport scroll-stitch fallback
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
│   └── canvas-editor.ts       # Fabric.js editor tools, blur filters & cropping logic
├── popup/
│   ├── popup.html             # Extension popup UI
│   └── popup.ts               # Mode triggers & status handling
├── settings/
│   ├── settings.html          # Extension preferences
│   └── settings.ts            # Options management
├── export/
│   ├── clipboard.ts           # Clipboard write helper
│   ├── pdf-generator.ts       # jsPDF paginated document creator
│   └── save-png.ts            # High-res file downloader
├── offscreen/
│   ├── offscreen.html         # Offscreen worker canvas host
│   └── canvas-stitcher.ts     # Offscreen canvas multi-frame stitcher
└── utils/
    ├── dpr-handler.ts         # Device pixel ratio calculations
    ├── image.ts               # Image format and blob transformations
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

- **100% Client-Side Processing**: All captures, OCR text extraction, and annotations are executed entirely inside your browser. No images or text are sent to external servers.
- **Secure Message Passing**: Capture payloads use internal Chrome extension channels and offscreen memory buffers.
- **Strict Content Security Policy**: Follows Chrome Manifest V3 security standards.

---

## 📄 License

[MIT](LICENSE) © 2026 Muzeeburrahaman
