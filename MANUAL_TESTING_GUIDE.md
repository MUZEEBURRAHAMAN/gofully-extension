# GoFully — End-to-End Manual Testing & Edge Case Matrix

> **Product Version**: `v1.1.1` (with `v1.1.2` roadmap preview specifications)  
> **Target Platforms**: Google Chrome / Chromium (macOS, Windows, Linux) & Live Marketing Site (`https://gofully-extension.vercel.app`)  
> **Document Purpose**: Exhaustive, step-by-step manual test cases covering every user flow, button, keyboard shortcut, rendering mode, and critical edge case.

---

## 📋 Table of Contents
1. [Test Environment & Prerequisites](#1-test-environment--prerequisites)
2. [Suite 1: Extension Popup & Global Controls](#suite-1-extension-popup--global-controls)
3. [Suite 2: Capture Mode — Full Page Scrolling](#suite-2-capture-mode--full-page-scrolling)
4. [Suite 3: Capture Mode — Visible Area](#suite-3-capture-mode--visible-area)
5. [Suite 4: Capture Mode — Selected Area (Region Selector)](#suite-4-capture-mode--selected-area-region-selector)
6. [Suite 5: Capture Mode — Scrolling Area (Nested Containers)](#suite-5-capture-mode--scrolling-area-nested-containers)
7. [Suite 6: Capture Mode — On-Device Text Extraction (OCR)](#suite-6-capture-mode--on-device-text-extraction-ocr)
8. [Suite 7: Post-Capture Action Bar (In-Page Result Bar)](#suite-7-post-capture-action-bar-in-page-result-bar)
9. [Suite 8: CleanShot-Grade Annotation Editor (All 12 Tools)](#suite-8-cleanshot-grade-annotation-editor-all-12-tools)
10. [Suite 9: Crop Studio (Cropper.js & Keyboard Nudging)](#suite-9-crop-studio-cropperjs--keyboard-nudging)
11. [Suite 10: Beautifier Studio & Multi-Image Collage](#suite-10-beautifier-studio--multi-image-collage)
12. [Suite 11: Export Engine (PNG, WebP, PDF, 4K & Resize)](#suite-11-export-engine-png-webp-pdf-4k--resize)
13. [Suite 12: Extension Settings, Localization & Themes](#suite-12-extension-settings-localization--themes)
14. [Suite 13: Live Website & SEO Architecture](#suite-13-live-website--seo-architecture)
15. [Critical Edge Cases & Stress Testing Matrix](#critical-edge-cases--stress-testing-matrix)

---

## 1. Test Environment & Prerequisites

### 1.1 Test Matrix Setup
* **Browsers to Test**:
  * Chrome Stable (Latest version)
  * Brave / Microsoft Edge (Chromium compatibility)
* **Display Settings**:
  * Standard DPI monitor (1.0x DPR)
  * Apple Retina or Windows High-DPI monitor (2.0x / 1.5x DPR)
* **Installation Step**:
  1. Open `chrome://extensions`.
  2. Enable **Developer mode** (top-right toggle).
  3. Click **Load unpacked** and select the extension directory (`dist/` or project root).
  4. Ensure GoFully appears with version `1.1.1` and its official logo.

---

## Suite 1: Extension Popup & Global Controls

### TC-POP-001: Popup UI Rendering & Dark/Light Theme
* **Precondition**: Extension installed, any regular webpage open (e.g. `https://en.wikipedia.org`).
* **Steps**:
  1. Click the GoFully toolbar icon or press `Alt + S`.
  2. Inspect the popup header, mode grid, and footer icon buttons.
* **Expected Result**:
  * Popup dimensions are fixed at `340px` width with zero layout jitter.
  * GoFully wordmark/logo renders cleanly.
  * All 5 capture cards render with icons and titles:
    * Full Page (`Cmd/Ctrl + Shift + F`)
    * Visible Area (`Cmd/Ctrl + Shift + V`)
    * Selected Area (`Cmd/Ctrl + Shift + A`)
    * Scrolling Area
    * Capture Text (OCR)
  * Theme respects system dark/light mode preference without color clash.

### TC-POP-002: Restricted Browser URL Handling
* **Precondition**: Chrome is on an internal page: `chrome://extensions`, `chrome://settings`, `edge://flags`, or `https://chromewebstore.google.com`.
* **Steps**:
  1. Click the GoFully toolbar icon on this restricted tab.
* **Expected Result**:
  * The standard capture mode grid is hidden.
  * An informative "Capture isn't available here" banner is shown explaining that Chromium extensions cannot inject content scripts into internal browser pages.
  * "Got it" dismiss button dismisses the popup cleanly without runtime JavaScript errors.

### TC-POP-003: Header Quick Actions
* **Steps**:
  1. In the popup header, click the **Settings** icon (gear).
     * *Expected*: Opens `settings.html` in an adjacent tab.
  2. Reopen popup and click the **Help** icon (question mark).
     * *Expected*: Opens `help.html` in an adjacent tab.

### TC-POP-004: Global Keyboard Shortcut Triggers
* **Steps**:
  1. Close the popup.
  2. On a regular website, press `Cmd + Shift + F` (macOS) or `Ctrl + Shift + F` (Windows).
     * *Expected*: Instantly initiates Full Page capture without opening the popup.
  3. Press `Cmd + Shift + V` / `Ctrl + Shift + V`.
     * *Expected*: Instantly captures the visible viewport.
  4. Press `Cmd + Shift + A` / `Ctrl + Shift + A`.
     * *Expected*: Instantly mounts the interactive region selector.

---

## Suite 2: Capture Mode — Full Page Scrolling

### TC-CAP-001: Standard Full-Page Scrolling Capture
* **Test URL**: Long content page (e.g., `https://news.ycombinator.com`, Stripe documentation, or an MDN article).
* **Steps**:
  1. Click GoFully popup -> Click **Full Page**.
  2. Observe the page during capture.
* **Expected Result**:
  * An unobtrusive progress bar/indicator displays the scroll percentage.
  * Viewport scrolls smoothly downwards.
  * Shutter sound plays upon completion (if sound is enabled in Settings).
  * In-page Result Bar or Editor opens showing a continuous, stitched graphic from top to bottom with zero white bands or duplicate frames.

### TC-CAP-002: Sticky & Fixed Headers Handling
* **Test URL**: Page with a fixed navigation bar that sticks to the top (e.g. GitHub, Twitter/X, Medium).
* **Precondition**: In Settings, verify "Skip sticky headers" is **Checked** (Default).
* **Steps**:
  1. Trigger **Full Page** capture.
  2. Inspect the resulting stitched screenshot.
* **Expected Result**:
  * The sticky navigation bar appears **only once** at the very top of the page.
  * The sticky bar does **not** appear repeatedly across every scroll tile/seam throughout the image.

### TC-CAP-003: Sticky Header Toggle Test (Off State)
* **Precondition**: Go to `settings.html` -> Uncheck "Skip sticky headers".
* **Steps**:
  1. Run Full Page capture on a site with a fixed header.
* **Expected Result**:
  * Setting is respected; sticky header is left untouched according to user configuration.

### TC-CAP-004: Lazy-Loaded Images & Dynamic Content
* **Test URL**: Image-heavy infinite scroll site (e.g., Unsplash, Pinterest, Reddit).
* **Steps**:
  1. Start Full Page capture from the top of the page.
* **Expected Result**:
  * The pre-scroll lazy loader triggers image loads before snapping each tile.
  * Images render fully loaded without blurred placeholder squares or missing images.

### TC-CAP-005: Manual Interruption / Cancellation
* **Steps**:
  1. Start Full Page capture on a page of 10,000+ pixels.
  2. Press `Esc` key halfway through the scrolling process.
* **Expected Result**:
  * Capture halts immediately.
  * Page scroll restores to original starting position.
  * No memory leaks or orphaned canvas elements left in the DOM.

---

## Suite 3: Capture Mode — Visible Area

### TC-VIS-001: Pixel-Perfect Viewport Snapshot
* **Steps**:
  1. Scroll to the middle of any webpage.
  2. Press `Cmd + Shift + V` / `Ctrl + Shift + V` or select **Visible Area** from popup.
* **Expected Result**:
  * Exactly what was visible within the browser chrome boundaries is captured.
  * Dimensions of captured image match `window.innerWidth * window.devicePixelRatio` and `window.innerHeight * window.devicePixelRatio`.
  * Shutter audio plays.
  * Result bar displays exact pixel dimensions.

### TC-VIS-002: Zoom Level Handling (DPR Variations)
* **Steps**:
  1. Zoom browser to 150% (`Cmd + +` / `Ctrl + +`).
  2. Capture Visible Area.
  3. Zoom browser to 75% (`Cmd + -` / `Ctrl + -`).
  4. Capture Visible Area.
* **Expected Result**:
  * Image is crisp without pixelation or clipping at all browser zoom factors.

---

## Suite 4: Capture Mode — Selected Area (Region Selector)

### TC-REG-001: Interactive Drag Selection & Dimensions Badge
* **Steps**:
  1. Click **Selected Area** (or `Cmd/Ctrl + Shift + A`).
  2. Observe cursor turns to a crosshair with a dimmed overlay across the screen.
  3. Click and drag diagonally across an arbitrary area.
* **Expected Result**:
  * A clear rectangular cutout appears revealing the underlying page.
  * Releasing mouse presents an adjustable framing box with 8 resize handles and a floating action bar (showing real-time pixel dimensions, **Capture** button, and **Cancel** button).
  * Pressing `Enter` or clicking **Capture** commits the selection and displays the Result Bar with the cropped graphic.
  * Pressing `Esc` or clicking **Cancel** dismisses the overlay cleanly.

### TC-REG-002: Inverted & Boundary Dragging Edge Cases
* **Edge Case Scenarios**:
  1. Drag from bottom-right to top-left (negative width/height).
     * *Expected*: Coordinates normalize properly; valid positive rectangle is captured.
  2. Drag off the edge of the screen into the browser window borders.
     * *Expected*: Selection automatically clamps to the viewport boundaries without throwing exceptions.
  3. Single-click without dragging (0x0 pixel selection).
     * *Expected*: Ignored safely; doesn't create corrupt 0-byte images.
  4. Press `Esc` while dragging.
     * *Expected*: Selection cancels immediately, overlay removes cleanly.

---

## Suite 5: Capture Mode — Scrolling Area (Nested Containers)

### TC-SCL-001: Nested Scrollable Div Capture
* **Test Setup**: Open a page containing an internal scrolling container:
  * Code editor block in GitHub/StackOverflow (`pre { overflow-y: auto; max-height: 300px }`)
  * Chat sidebar (Discord, Slack web, or Jira activity log).
* **Steps**:
  1. In popup, select **Scrolling Area**.
  2. Drag a rectangular bounding box around the internal scrollable container.
* **Expected Result**:
  * GoFully identifies the inner container with `overflow-y: auto/scroll`.
  * The inner element scrolls down programmatically while the parent window remains static.
  * All internal rows are stitched together into one continuous tall snapshot.
  * No duplicate ghost headers from inner scroll bars.

---

## Suite 6: Capture Mode — On-Device Text Extraction (OCR)

### TC-OCR-001: Standard English Text Extraction
* **Test Setup**: Webpage with an infographic, locked image, or HTML5 Canvas containing crisp typography.
* **Steps**:
  1. In popup, select **Capture Text (OCR)**.
  2. Drag selection box over the text in the image.
  3. Release the mouse.
* **Expected Result**:
  * A shutter sound plays.
  * A clean OCR modal appears with a spinner: "Processing OCR on-device...".
  * Extracted text populates an editable textarea within 500ms–1500ms.
  * Metadata bar displays: `Characters: X | Confidence: Y%`.
  * Zero network traffic is sent to external cloud APIs (verify via DevTools Network tab).

### TC-OCR-002: Action Buttons (Copy, Markdown, JSON)
* **Steps**:
  1. With text in the OCR result modal:
  2. Click **Copy Text** -> Paste in text editor.
     * *Expected*: Verifies plain text is on clipboard.
  3. Click **Copy as JSON** -> Paste in text editor.
     * *Expected*: Verifies valid JSON payload: `{"text": "...", "confidence": 95, "timestamp": "..."}`.
  4. Click **Markdown** -> Paste in text editor.
     * *Expected*: Verifies formatted Markdown block.
  5. Edit text inside the textarea, then click Copy.
     * *Expected*: Modified text is copied to clipboard.

### TC-OCR-003: Empty / Noisy Region Edge Cases
* **Edge Case Scenarios**:
  1. Select a solid blank white box.
     * *Expected*: Displays "No text detected in selected region" friendly notice; no app crash.
  2. Select blurry or degraded photo text.
     * *Expected*: Extracts available text with lower confidence indicator.

---

## Suite 7: Post-Capture Action Bar (In-Page Result Bar)

### TC-BAR-001: Result Bar Lifecycle
* **Steps**:
  1. Perform any capture (e.g. Visible Area).
* **Expected Result**:
  * A floating result card slides in at the top-right corner of the webpage.
  * Card shows:
    * Small preview thumbnail of the screenshot
    * Pixel dimensions (e.g. `1920 × 1080 px`)
    * Action buttons:
      * **Copy Image** (Primary button)
      * **PNG**
      * **WebP**
      * **PDF**
      * **Edit** (Pencil icon)
      * **Close (X)**
* **Steps**:
  2. Click **Copy Image**.
     * *Expected*: Button text changes to "Image Copied!" with checkmark; pasting into Slack/Figma/Docs works instantly.
  3. Click **PNG**.
     * *Expected*: Downloads `.png` file with sanitized timestamp filename.
  4. Click **Edit**.
     * *Expected*: Opens the full GoFully Annotation Editor in a new adjacent tab.
  5. Click **Close (X)**.
     * *Expected*: Bar dismisses immediately.

---

## Suite 8: CleanShot-Grade Annotation Editor (All 12 Tools)

### TC-ED-001: Tab Order & Canvas Mounting
* **Steps**:
  1. On Tab #2 of 5 open tabs, capture a screenshot and click **Edit**.
* **Expected Result**:
  * The GoFully Editor tab opens at Tab #3 (immediately adjacent to the source tab, not at the far end of the tab strip).
  * High-res canvas renders centered with a subtle drop shadow on an industrial light/dark background.
  * Canvas draw badge is hidden initially.

### TC-ED-002: Tool 1 — Select / Move / Transform (`V`)
* **Steps**:
  1. Draw an arrow, rectangle, and text box on canvas.
  2. Press `V` to switch to Select tool.
  3. Click any annotation.
* **Expected Result**:
  * Selection bounding box appears with corner resize handles and rotation knob.
  * Dragging moves the object.
  * Holding `Shift` while dragging corner handle preserves aspect ratio.
  * Pressing `Backspace` or `Delete` removes the selected object.
  * Pressing `Cmd + D` / `Ctrl + D` duplicates the selected object offset by 10px.

### TC-ED-003: Tool 2 — Straight & Curved Arrows (`A`)
* **Steps**:
  1. Press `A` or click the Arrow tool.
  2. Click and drag across the canvas.
* **Expected Result**:
  * Arrow points crisply towards mouse release coordinate.
  * Arrowhead scales proportionally with stroke width.
  * Clicking the center control point allows bending into a smooth CleanShot-style curved arrow.

### TC-ED-004: Tool 3 — Rectangle & Ellipse (`R` / `E`)
* **Steps**:
  1. Select Rectangle tool (`R`) -> Drag on canvas.
  2. Select Ellipse tool (`E`) -> Drag on canvas.
* **Expected Result**:
  * Shapes draw in real-time tracking the cursor pixel-perfectly.
  * Holding `Shift` constrains Rectangle to a square and Ellipse to a circle.

### TC-ED-005: Tool 4 — Callout Bubble (`C`)
* **Steps**:
  1. Select Callout tool (`C`) -> Drag on canvas.
* **Expected Result**:
  * Generates a callout speech container with an adjustable pointer tail pointing to the initial drag target.
  * Double-clicking allows typing text inside the bubble.

### TC-ED-006: Tool 5 — Line Tool (`L`)
* **Steps**:
  1. Select Line tool (`L`) -> Drag on canvas.
* **Expected Result**:
  * Crisp straight line.
  * Holding `Shift` snaps angle to 0°, 45°, and 90°.

### TC-ED-007: Tool 6 — Freehand Pen (`P`)
* **Steps**:
  1. Select Pen tool (`P`).
  2. Adjust stroke width slider to `8px`.
  3. Draw freehand curves.
* **Expected Result**:
  * Smooth bezier spline smoothing removes mouse jitter.
  * Color matches active palette swatch.

### TC-ED-008: Tool 7 — Typography & Text Styling (`T`)
* **Steps**:
  1. Select Text tool (`T`) -> Click anywhere on canvas.
  2. Type a sentence (e.g. "Bug found in login header").
  3. Test font options in the top toolbar:
     * Handwritten (`Caveat`)
     * Modern Sans (`Archivo` / `Barlow`)
     * Serif (`Georgia`)
     * Monospace (`Courier New`)
  4. Test font size slider (12px to 96px).
  5. Toggle Bold and Italic buttons.
* **Expected Result**:
  * Font rendering updates instantly without clipping bounding box.

### TC-ED-009: Tool 8 — Step Numbers (`N`)
* **Steps**:
  1. Select Step tool (`N`).
  2. Click spot #1 on canvas -> Click spot #2 -> Click spot #3.
* **Expected Result**:
  * Circular badge `1` is placed.
  * Next click places badge `2`.
  * Next click places badge `3`.
  * Badges have clean contrasting numbers and are selectable/movable individually.

### TC-ED-010: Tool 9 — Spotlight Mode (`S`)
* **Steps**:
  1. Select Spotlight tool (`S`).
  2. Drag across a UI element to emphasize.
* **Expected Result**:
  * Entire canvas darkens with a 50% black translucent scrim.
  * The selected box cuts out a crystal-clear hole, spotlighting the feature underneath.

### TC-ED-011: Tool 10 — Blur & Redaction Studio (`B`)
* **Steps**:
  1. Click Blur dropdown tool or press `B`.
  2. Test all 3 redaction modes:
     * **Glass Smooth Blur**: Applies smooth Gaussian-style blur over text/passwords.
     * **Pixelate**: Applies retro mosaic block pixelation.
     * **Redact Blackout**: Solid pitch-black security fill.
* **Expected Result**:
  * Redacted area completely conceals underlying text or credentials.
  * Redaction box moves, resizes, and deletes like any annotation object.

### TC-ED-012: Tool 11 — Smart Highlighter (`H`)
* **Steps**:
  1. Select Highlighter tool (`H`).
  2. Drag across a line of dark body text.
* **Expected Result**:
  * Applies `multiply` blend mode so underlying black typography remains pitch-black while background turns canary yellow (or active color).
  * Holding `Shift` snaps line to a ruler-straight horizontal level.

### TC-ED-013: Color Palette & Custom Swatch Picker
* **Steps**:
  1. Click each of the 8 default swatches: Red, Blue, Green, Amber, Purple, Pink, White, Black.
  2. Click the 9th swatch (Custom Color Picker with native color picker dialog).
  3. Choose `#00FFCC`.
  4. Draw a shape.
* **Expected Result**:
  * Active tool adopts the chosen custom hex color immediately.

### TC-ED-014: History Stack (Undo / Redo / Zoom)
* **Steps**:
  1. Draw 5 separate objects.
  2. Press `Cmd + Z` / `Ctrl + Z` 5 times.
     * *Expected*: Objects disappear one by one down to initial clean capture.
  3. Press `Cmd + Shift + Z` / `Ctrl + Y` 5 times.
     * *Expected*: Objects reappear in exact order with all styles preserved.
  4. Click Zoom Out (`Cmd -`), Zoom In (`Cmd +`), and click the `100%` badge.
     * *Expected*: Canvas smoothly scales from 10% to 500% and resets to 100%.

---

## Suite 9: Crop Studio (Cropper.js & Keyboard Nudging)

### TC-CRP-001: Aspect Ratio Presets & Nudging
* **Steps**:
  1. Click **Crop** (`X`) in the editor toolbar.
  2. Crop Studio modal launches with rule-of-thirds grid.
  3. Click each aspect ratio button:
     * **Free**
     * **16:9**
     * **4:3**
     * **1:1** (Square)
     * **3:2**
     * **2:1**
  4. Press keyboard arrow keys (`Up`, `Down`, `Left`, `Right`).
     * *Expected*: Nudges crop box by 1px.
  5. Hold `Shift` + Arrow keys.
     * *Expected*: Nudges crop box by 10px jumps.
  6. Press `Enter` to commit crop.
     * *Expected*: Canvas resizes to cropped boundaries; all annotations inside crop are maintained.

---

## Suite 10: Beautifier Studio & Multi-Image Collage

### TC-BTF-001: Background Gradients & Patterns
* **Steps**:
  1. In the Editor toolbar, click **Beautify**.
  2. The Beautifier side panel opens.
  3. Click different background options:
     * None / Transparent
     * Indigo Purple (`linear-gradient(135deg, #667eea, #764ba2)`)
     * Blue Cyan, Coral, Dark
     * Dot Grid pattern
     * Diagonal Stripes pattern
* **Expected Result**:
  * Canvas expands with padding, rendering the chosen gradient/pattern seamlessly behind the screenshot.
  * Switching between gradients **swaps** the background without nesting or creating multiple canvas layers.

### TC-BTF-002: Window Frames & Shadow Adjustments
* **Steps**:
  1. Under Window Frame, select:
     * **macOS**: Renders authentic rounded title bar with red/yellow/green traffic light buttons.
     * **Browser**: Renders URL address bar frame.
     * **Windows**: Renders Windows minimize/maximize/close icons.
     * **Phone**: Renders mobile device bezel.
     * **None**: Strips frame.
  2. Adjust **Padding** slider from 0px to 120px.
  3. Adjust **Corner Radius** slider from 0px to 32px.
  4. Adjust **Shadow Blur** slider from 0px to 80px.
* **Expected Result**:
  * All controls update canvas in real-time at 60fps.

### TC-BTF-003: Multi-Image Collage Layouts
* **Steps**:
  1. In Beautify panel, click **+ Add Image**.
  2. Select an additional screenshot or photo file.
  3. Toggle Layout: **Side by Side** (Row) vs. **Stacked** (Column).
* **Expected Result**:
  * Both screenshots arrange cleanly with matching padding and window frames.

### TC-BTF-004: Save & Load Reusable Preset
* **Steps**:
  1. Configure custom settings: 60px padding, 20px radius, macOS frame, Coral gradient.
  2. In "Preset name" input, type `My Brand Preset` -> Click **Save**.
  3. Change all sliders and background to something else.
  4. In the Presets dropdown, select `My Brand Preset`.
* **Expected Result**:
  * All previous settings are restored immediately from local storage.

---

## Suite 11: Export Engine (PNG, WebP, PDF, 4K & Resize)

### TC-EXP-001: Resolution Quality Scaling (Native, 1080p, 4K UHD)
* **Steps**:
  1. Click **Export ▾** dropdown menu.
  2. Under Quality, select **4K UHD** (Default).
  3. Click **Save as PNG**.
  4. Inspect the downloaded image properties.
* **Expected Result**:
  * Downloaded image is rendered at high DPI 4K fidelity.
  * All vector arrows, text, and step badges remain razor-sharp without pixelation.

### TC-EXP-002: Annotations Toggle
* **Steps**:
  1. Open Export dropdown -> Uncheck "Include Annotations".
  2. Click **Save as PNG**.
* **Expected Result**:
  * Exports only the clean, original background capture without any arrows, text, or shapes.
  * Re-checking "Include Annotations" restores annotations in export.

### TC-EXP-003: Dimension Resizing with Aspect Lock
* **Steps**:
  1. Open Export dropdown -> In Resize, enter `1200` in Width.
  2. Verify aspect-ratio lock is active (lock icon closed).
* **Expected Result**:
  * Height automatically calculates and updates proportionally.
  * Exported file matches the specified `1200px` width.

### TC-EXP-004: Multi-Page Paginated PDF Export
* **Steps**:
  1. Open a very long full-page capture (e.g. 5,000px height).
  2. Open Export dropdown -> Click **Save as PDF**.
* **Expected Result**:
  * A valid `.pdf` document is generated via `jsPDF`.
  * Long document is automatically divided across multiple A4 (or Letter) pages without text cutoffs or clipping mid-character.
  * Optional URL watermark appears in PDF footer if enabled in Settings.

### TC-EXP-005: Copy Image to System Clipboard
* **Steps**:
  1. In Export menu, click **Copy Image** (or press `Cmd + C` on canvas).
  2. Switch to another app: Apple Notes, Slack, Telegram, Figma, or Google Docs.
  3. Press `Cmd + V` / `Ctrl + V`.
* **Expected Result**:
  * Full composite image pastes with full transparency and annotation fidelity.

---

## Suite 12: Extension Settings, Localization & Themes

### TC-SET-001: Settings Persistence (`chrome.storage.local`)
* **Steps**:
  1. Open `settings.html`.
  2. Change:
     * Theme: **Dark**
     * Interface language: **Español**
     * Capture countdown: **2s**
     * Capture sound: **Disabled**
     * Skip sticky headers: **Checked**
     * Default export format: **WebP**
     * PDF page size: **Letter**
  3. Close the tab. Re-open `settings.html`.
* **Expected Result**:
  * All modified preferences remain selected.
  * "Settings saved" toast appears upon each change.

### TC-SET-002: Interface Localization (i18n)
* **Steps**:
  1. Switch language to **Français** in Settings.
  2. Open the extension popup.
* **Expected Result**:
  * All UI labels display in French (e.g. "Plein écran", "Zone visible", "Capturer le texte").
  * Switching back to English restores English strings immediately.

### TC-SET-003: Editor Tool Shortcut Customization
* **Steps**:
  1. In `settings.html` -> Scroll to "Editor Tool Shortcuts".
  2. Click the shortcut key for "Highlighter" (Default `H`).
  3. Press `Y`.
  4. Open the Editor, press `Y`.
* **Expected Result**:
  * Highlighter tool activates.
  * Clicking "Reset to defaults" restores `H`.

---

## Suite 13: Live Website & SEO Architecture

### TC-WEB-001: Homepage & Brand Integrity
* **URL**: `https://gofully-extension.vercel.app/`
* **Checks**:
  * Header navigation contains: Features, How It Works, Comparison, Guides, Alternatives, Install button.
  * "Add to Chrome" buttons link to correct Chrome Web Store URL (`id: akfbmhmdlbmljklgajkgoekobofhhofc`).
  * Hero preview renders interactive mockups.
  * Footer displays version, MIT license, GitHub, and documentation links.

### TC-WEB-002: Guides Hub & "Coming Soon" Badges
* **URL**: `https://gofully-extension.vercel.app/guides`
* **Checks**:
  * Guides collection displays all 8 articles:
    1. The Screenshot Workflow Built for Developers & QA
    2. Best Full Page Screenshot Extensions for Chrome (2026)
    3. How to Take a Full Page Screenshot in Chrome Without Cutting Off Content
    4. How to Blur or Redact Sensitive Information in Screenshots
    5. How to Extract and Copy Unselectable Text from Any Webpage or Image
    6. **How to Extract Text in Multiple Languages with On-Device OCR** (NEW)
    7. **How to Set Custom Keyboard Shortcuts for Fast Screen Capture** (NEW)
    8. **How to Use the Highlighter Tool in Screenshots Without Obscuring Text** (NEW)
  * All 3 upcoming feature guides have clear amber **"Coming Soon"** badges.
  * Card links read "Preview upcoming guide →".

### TC-WEB-003: Guide Pages Detail & Schema.org Validation
* **Steps**:
  1. Navigate to [`/guides/how-to-extract-text-in-multiple-languages-ocr`](https://gofully-extension.vercel.app/guides/how-to-extract-text-in-multiple-languages-ocr).
  2. View source / inspect head:
     * Breadcrumbs render: `Home > Guides > Multi-Language OCR Guide`.
     * `application/ld+json` contains valid `TechArticle` schema with publisher, author, and headline.
     * Header displays: `Coming Soon · Planned for v1.1.2` badge with pulsing dot.
  3. Repeat verification for:
     * [`/guides/custom-keyboard-shortcuts-for-screen-capture`](https://gofully-extension.vercel.app/guides/custom-keyboard-shortcuts-for-screen-capture)
     * [`/guides/how-to-use-highlighter-tool-in-screenshots`](https://gofully-extension.vercel.app/guides/how-to-use-highlighter-tool-in-screenshots)

### TC-WEB-004: Alternative Comparison Pages
* **URLs**:
  * `/alternatives/gofullpage`
  * `/alternatives/awesome-screenshot`
  * `/alternatives/fireshot`
  * `/alternatives/nimbus`
* **Checks**:
  * Feature comparison tables highlight GoFully advantages: 100% on-device OCR, free Glass blur, CleanShot annotation, zero cloud uploads.
  * Semantic `h1`, `h2` heading hierarchy.

### TC-WEB-005: Crawling & Sitemap Governance
* **URLs**:
  * `/robots.txt` -> Contains `Disallow: /uninstall-feedback` and points to `sitemap.xml`.
  * `/sitemap.xml` -> Lists all 21 indexable pages with `2026-09-11` timestamp and proper priorities.
  * `/uninstall-feedback` -> Verified to have `<meta name="robots" content="noindex, nofollow">`.

---

## Critical Edge Cases & Stress Testing Matrix

| ID | Test Scenario | Trigger / Condition | Expected Behavior |
|---|---|---|---|
| **EC-01** | **Massive Document Height** | Webpage with > 25,000px height (infinite document) | Offscreen Canvas tiles frames into sub-canvases without browser Out-Of-Memory (OOM) crash. |
| **EC-02** | **Horizontal Scrollbar** | Page with `overflow-x: scroll` | Captures document width cleanly without horizontal distortion. |
| **EC-03** | **Dynamic CSS Animations** | Page with looping CSS `@keyframes` animations | Freezes capture frames cleanly without visual glitching or ghost artifacts. |
| **EC-04** | **Fixed Video Players** | YouTube / Vimeo embedded player | Captures active frame without black video cutout. |
| **EC-05** | **Shadow DOM Elements** | Salesforce, Lit, or Web Components with Shadow Roots | Smart analyzer inspects nested elements and captures DOM tree accurately. |
| **EC-06** | **Incognito Window** | Extension enabled in Incognito mode | Runs captures with zero persistent storage leaks; respects private browsing session. |
| **EC-07** | **Offline Operation** | Computer disconnected from Wi-Fi/Internet | 100% of features (Capture, OCR, Annotate, Export PNG/PDF) work completely without network errors. |
| **EC-08** | **Zero-Byte / 1x1 Pixel Selection** | Region selector dragged for < 3px | Gracefully ignores tiny accidental click; prevents empty 0-byte corrupt exports. |
| **EC-09** | **Rapid Double-Clicking** | Rapid double-clicking capture buttons | Debounces trigger; prevents two concurrent overlapping capture workers. |
| **EC-10** | **Clipboard Permission Denied** | Browser blocks clipboard write permission | Fallback save toast notifies user; image automatically saves to Downloads folder. |

---

## 🏁 Summary Checklist for QA Sign-Off

- [ ] All 5 Popup Capture Modes function as documented
- [ ] Shutter audio & visual countdown timers respond accurately
- [ ] Full-page stitching suppresses sticky navigation bars
- [ ] On-device OCR extracts text locally with 0 cloud network calls
- [ ] All 12 Annotation Editor tools draw without cursor offset
- [ ] Glass Blur, Pixelate, and Redact Blackout obscure PII completely
- [ ] Crop Studio nudging functions with Arrow keys and Shift
- [ ] Beautifier frames, backgrounds, and presets load and export accurately
- [ ] Exports (PNG, WebP, PDF) generate with high DPI fidelity
- [ ] Website guides and alternatives load with valid JSON-LD schemas and Breadcrumbs
