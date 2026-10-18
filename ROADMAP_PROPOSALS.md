# GoFully Product Roadmap & Feature Enhancements

A comprehensive blueprint of upcoming features, UX innovations inspired by Screendrop and CleanShot X, and surgical improvements to existing GoFully capabilities.

---

## 📌 Part 1: The 16 Features Adopted from Screendrop

| Category | Feature | Description | Target Release |
|---|---|---|:---:|
| **Core Capture** | **1. Smart Redaction (Auto-Blur)** | Uses on-device OCR regex to automatically detect and blur API keys, credit cards, emails, passwords, and tokens in 1 click. | v1.2.0 |
| **Core Capture** | **2. Capture Self-Timer (3s / 5s)** | Visual countdown timer to easily capture hover menus, tooltips, date pickers, and transient modals. | v1.2.0 |
| **Core Capture** | **3. Instant Text Grab Shortcut (`Alt+Shift+T`)** | Global hotkey to drag an area and immediately copy OCR text to clipboard without saving an image or opening editor. | v1.2.0 |
| **Workflow** | **4. Pinned Screenshot Widget** | Pin a thumbnail of the screenshot as an always-on-top floating reference card to compare against Figma or staging code. | v1.2.0 |
| **Export** | **5. Live File Size & Compression Slider** | Real-time byte estimation in the export dropdown ("PNG: 1.8 MB \| WebP 85%: 180 KB"). | v1.2.0 |
| **Beautify Studio** | **6. 3D Perspective Tilt & Camera Angles** | Rotates screenshot along X/Y axes with isometric drop shadows for social media and landing page mockups. | v1.3.0 |
| **Beautify Studio** | **7. Progressive Blur (Tilt-Shift)** | Directional and radial blur that gradually intensifies to draw focus to a specific UI section. | v1.3.0 |
| **Beautify Studio** | **8. Per-Corner Radius Controls** | Independent corner rounding (e.g. rounded top corners with flat bottom for browser windows). | v1.3.0 |
| **Beautify Studio** | **9. Curated Wallpaper Texture Packs** | High-resolution abstract 3D textures, studio meshes, and dark-mode gradient wallpapers. | v1.3.0 |
| **Beautify Studio** | **10. Custom Branding Watermarks** | Text/Logo watermarks placed on a 9-point grid with configurable opacity and typography. | v1.3.0 |
| **Storage & Sync** | **11. Non-Destructive Capture History** | Store Fabric vector JSON alongside image data URLs so arrows, text, and redactions remain editable later. | v1.3.0 |
| **Design Systems** | **12. Exportable / Importable Presets (`.json`)** | Save and share company/brand mockup styles (padding, shadow, background, frame) across team members. | v1.3.0 |
| **Library** | **13. Spacebar Quick Look & Bulk Actions** | Spacebar preview in History gallery; multi-select to bulk export, copy, or prune screenshots. | v1.3.0 |
| **Screen Video** | **14. Tab & Screen Recording (MP4/GIF)** | Record browser interactions, workflows, and animations with audio and export to MP4, WebM, or GIF. | v2.0.0 |
| **Screen Video** | **15. Webcam Bubble Overlay** | Floating, resizable circular webcam PiP over the recording tab for Loom-style asynchronous video updates. | v2.0.0 |
| **Cloud Sharing** | **16. Self-Hosted Cloudflare R2 / S3 Share Links** | Direct client-side upload to user's private S3/R2 bucket to generate instant shareable links with zero server costs. | v2.0.0 |

---

## 🚀 Part 2: Upgrades & Improvements to Existing GoFully Features

### 1. Full-Page & Scrolling Area Engine Improvements

#### A. Virtualized Table & Infinite List Recovery
- **The Problem:** Modern enterprise web applications (Salesforce, Airtable, Notion, TanStack Table, AG-Grid) use DOM virtualization—when you scroll down, rows above are destroyed from the DOM to save memory. Standard scroll-and-stitch can lose the top headers or duplicate rows.
- **The Upgrade:** Inject a temporary layout observer that detects virtual scroll containers (`overflow-y: scroll`), locks the container's virtualization viewport, or stitches chunks dynamically using an offscreen canvas buffer before DOM recycling occurs.

#### B. Intelligent Sticky & Floating Widget Handling
- **The Problem:** Floating Action Buttons (FABs), Intercom/Zendesk live chat widgets, and cookie banners often jump or leave vertical blur streaks during scroll capture.
- **The Upgrade:** Expand `sticky-manager.ts` to identify fixed elements not just by `position: fixed`, but also `position: sticky`, `z-index >= 1000`, and known chat bubble identifiers (`#intercom-container`, `[id*="zsiq"]`, `.crisp-client`), automatically fading them during stitching and restoring them post-capture.

#### C. Shadow DOM & Iframe Traversal
- **The Upgrade:** Traverse closed/open Shadow Roots (used extensively in Web Components, Shopify apps, and modern design systems) so nested scroll containers inside Shadow DOM are automatically identified in Scrolling Area mode.

---

### 2. Built-in Annotation Studio Improvements

#### A. Magnifying Loupe Tool
- **Concept:** A circular loupe that magnifies a specific section of the screenshot 2x or 4x with a sleek bezel border and leader line.
- **Use Case:** Crucial for QA testers and design reviewers pointing out micro-details (1px alignment errors, typography kerning, or subtle contrast defects).

#### B. Smart Measurement & Dimension Callout Tool
- **Concept:** Click between two elements to draw a red/blue dimension line showing the exact pixel distance (e.g. `24px` or `w: 320px × h: 48px`).
- **Use Case:** Designers and frontend engineers inspecting live sites can document spacing bugs without needing DevTools screenshots.

#### C. Connected Arrows with Anchor Snapping
- **The Upgrade:** Allow arrows to snap to the perimeter handles of rectangles, text boxes, and step badges so moving a shape automatically moves the attached arrow head/tail.

#### D. Multi-Style Step Badges
- **The Upgrade:** Add styling variants to auto-incrementing step numbers:
  - Numbers: `1, 2, 3...`
  - Letters: `A, B, C...`
  - Roman Numerals: `I, II, III...`
  - Inverted & Outline color themes.

---

### 3. Privacy & Redaction Improvements

#### A. Background-Matching Redaction ("Vanishing Box")
- **The Problem:** Blackout boxes draw attention to the fact that something was hidden, while Gaussian blur can sometimes look messy.
- **The Upgrade:** Add an eyedropper / auto-sample mode that samples the exact background color of the parent card/container. The redacted text is replaced with a box of the exact same color, making the text cleanly disappear as if it never existed.

#### B. Full Redaction Irreversibility Guarantee
- **The Security Measure:** Ensure that when blur or blackout is committed, the underlying image pixel data in the canvas ImageData buffer is permanently overwritten with computed noise/blur values before being converted to Blob, guaranteeing zero possibility of reverse-engineering hidden text.

---

### 4. Beautify & Mockup Studio Improvements

#### A. Real Browser Window Chrome (Safari, Chrome, Arc)
- **Current State:** GoFully has a dark macOS-style frame with 3 dots.
- **The Upgrade:** Provide realistic frame switchers:
  1. **Safari macOS:** Traffic lights + centered capsule URL pill.
  2. **Google Chrome:** Realistic active tab + omnibox with secure padlock icon.
  3. **Arc Browser:** Sidebar pill accent with subtle gradient border.
  4. **Custom URL & Title:** Let users type a custom clean URL (e.g., `mybrand.com/dashboard`) and upload a custom 16x16 favicon in the mockup header.

#### B. Social Media Card Simulation
- **The Upgrade:** Add a 1-click "Feed Preview" modal showing how the generated mockup will look when shared on X/Twitter (16:9 summary card), LinkedIn feed, or Slack message link.

---

### 5. Export & Sharing Workflow Improvements

#### A. Direct Drag-and-Drop from Result Bar
- **Current State:** Users click "Save PNG" or "Copy".
- **The Upgrade:** The floating capture card has a draggable thumbnail. Users can click and drag the thumbnail directly into Slack, Figma, Notion, Discord, or desktop Finder without saving a file to the Downloads folder first.

#### B. Full-Page Auto-Copy Toggle
- **The Upgrade:** An optional setting in `settings.html`: *"Automatically copy full-page screenshots to clipboard on capture completion"*.

#### C. Multi-Page Paginated PDF Customizer
- **The Upgrade:** In addition to standard A4 vertical pagination:
  - Option for Single Continuous Scroll PDF (used by lawyers and legal compliance for archiving full web documents without page breaks).
  - Configurable page margins (None, Normal, Wide).
  - Page header & footer stamp (Date, Page X of Y, Source URL).

---

### 6. Capture History & Searchability Improvements

#### A. OCR Full-Text Search in Capture History
- **Concept:** Whenever GoFully takes a screenshot, it already runs on-device WASM OCR. Storing the recognized text in an IndexedDB full-text index allows users to search:
  - Search `"invoice #1042"` → Instantly highlights the capture taken 2 weeks ago.
  - Search `"error 500"` → Finds the exact bug screenshot taken during QA testing.

#### B. Storage Quota & Auto-Pruning
- **The Upgrade:** Configurable storage ceiling in Settings (e.g. 50 MB, 100 MB, or 500 MB) with an option to automatically prune captures older than 30 days.
