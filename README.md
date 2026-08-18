# GoFully — Full Page Screenshot

A Chrome extension for capturing full pages, visible areas, selected regions, scrolling areas, and scrollable elements — with a built-in annotation editor and HD/4K export. Works 100% offline.

![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-blue?logo=googlechrome)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Capture Modes
| Mode | Description |
|---|---|
| **Full Page** | Captures the entire scrollable page using Chrome DevTools Protocol with scroll-stitch fallback |
| **Visible Area** | Captures exactly what's on screen |
| **Selected Area** | Drag to select any region |
| **Scrolling Area** | Drag a region and capture as the page scrolls |
| **Scrollable Element** | Click any scrollable element to capture its full content |

### Built-in Editor
- **Shapes** — Rectangle, Ellipse, Line, Arrow
- **Drawing** — Freehand pen
- **Annotation** — Text, Highlight, Step numbers
- **Blur / Redact** — Pixelate sensitive areas
- **Crop** — Live overlay with rule-of-thirds guides, apply with Enter
- **Undo / Redo** — Full history (up to 50 states)
- **Color picker** — 7 preset colors
- **Stroke width** — Adjustable slider

### Export
- **Copy to Clipboard** — PNG
- **Save PNG** — Native resolution, 1080p HD, or 4K UHD
- **Save PDF** — Auto-paginated A4

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `V` | Select tool |
| `R` | Rectangle |
| `E` | Ellipse |
| `A` | Arrow |
| `L` | Line |
| `P` | Pen |
| `T` | Text |
| `H` | Highlight |
| `B` | Blur |
| `N` | Step number |
| `C` | Crop |
| `Enter` | Apply crop |
| `Esc` | Cancel crop / deselect |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘Y` / `Ctrl+Y` | Redo |
| `⌫` | Delete selected |
| `Alt+S` | Open GoFully popup |
| `Alt+Shift+F` | Capture full page |
| `Alt+Shift+V` | Capture visible area |

---

## Tech Stack

- **Chrome Extension MV3** — Service worker, offscreen document, content scripts
- **TypeScript** — Full type coverage
- **Fabric.js 7** — Canvas rendering and annotation engine
- **Vite** — Build tooling
- **jsPDF** — PDF generation
- **Chrome DevTools Protocol (CDP)** — Full-page capture via `debugger` API

---

## Project Structure

```
src/
├── background/
│   ├── service-worker.ts      # Extension lifecycle, message routing
│   ├── capture-engine.ts      # Full page / visible / selected capture
│   ├── cdp-capture.ts         # CDP-based full-page capture
│   └── stitch-capture.ts      # Scroll-stitch fallback
├── capture-modes/
│   ├── scrolling-area.ts      # Region scroll capture
│   └── scrollable-element.ts  # Element scroll capture
├── content/
│   ├── region-selector.ts     # Drag-to-select UI
│   ├── scrolling-area-ui.ts   # Scrolling area selection UI
│   ├── element-selector.ts    # Element picker UI
│   ├── result-bar.ts          # In-page result bar
│   ├── page-analyzer.ts       # Page metrics
│   ├── sticky-manager.ts      # Sticky element handling
│   ├── lazy-loader.ts         # Lazy image loading trigger
│   └── scrollable-detector.ts # Scrollable element detection
├── editor/
│   ├── editor.html            # Editor page
│   └── canvas-editor.ts       # Fabric.js annotation editor
├── popup/
│   ├── popup.html
│   └── popup.ts
├── settings/
│   ├── settings.html
│   └── settings.ts
├── export/
│   ├── clipboard.ts
│   ├── pdf-generator.ts
│   └── save-png.ts
├── offscreen/
│   ├── offscreen.html
│   └── canvas-stitcher.ts
└── utils/
    ├── dpr-handler.ts
    ├── image.ts
    └── permissions.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Google Chrome

### Install & Build

```bash
git clone https://github.com/MUZEEBURRAHAMAN/gofully-extension.git
cd gofully-extension
npm install
node build.mjs
```

The built extension is output to `dist/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## Security

- All capture and annotation processing is done locally — no data leaves your device
- Screenshot data is passed between extension pages via Chrome message passing, never embedded in URLs or browser history
- Content script `tabId` is validated from the message sender, not the message payload
- Image URLs are validated to only accept `data:image/` URIs before loading

---

## License

[MIT](LICENSE) © 2026 Muzeeburrahaman
