# GoFully — Chrome Web Store Listing Metadata

## Extension Name
GoFully - Full Page Screenshot, OCR & Editor

(44/45 chars — this is pulled directly from `manifest.json`'s `name` field;
Chrome Web Store shows that field verbatim as the listing title, it cannot
be set separately in the dashboard. This value has been live since before
v1.1.1 — see `seo-keywords.md` § Title Optimization for the SEO/AEO/GEO
rationale and alternatives considered.)

## Short Description (132 chars max — Chrome Web Store limit)
Capture full pages or areas, extract text with local OCR, annotate, redact sensitive details, and export to PNG, JPG, WebP, or PDF.

## Category
Productivity

## Language
English

## Website
https://gofully-extension.vercel.app/

## Support & Privacy URL
- **Website**: https://gofully-extension.vercel.app/
- **Help Center**: https://gofully-extension.vercel.app/help.html
- **Privacy Policy**: https://gofully-extension.vercel.app/privacy.html
- **Repository**: https://github.com/MUZEEBURRAHAMAN/gofully-extension

## Privacy Practices
- **Single Purpose**: Complete browser screenshot capture, on-device OCR text extraction, and privacy-focused visual annotation.
- **Data Usage**: Does not collect, transmit, or monetize any user data. All processing is strictly local.
- **Permissions Justification**:
  - `activeTab`: Capture visible tab content and inject selection interfaces on the tab the user actively invoked the extension on.
  - `tabs`: Query and update tab state (e.g. tab title/URL for export metadata, coordinating capture across the active tab).
  - `scripting`: Inject page-dimension measurement, sticky element management, and lazy-loading scripts.
  - `offscreen`: Perform canvas stitching and host local WebAssembly OCR workers in the background.
  - `downloads`: Save high-resolution PNG, JPG, WebP, and PDF files to user's Downloads directory.
  - `storage`: Store user preferences (zoom defaults, format choices, hotkeys). Per-edit choices like annotation color are intentionally NOT persisted here — session only.
  - `host_permissions <all_urls>`: Full-page and scrolling-area capture must run on whatever site the user is actively viewing when they invoke the extension; this is user-initiated per-page and no page is accessed in the background.

## Promotional Tile Text

### Small Tile (440x280)
**Headline**: Full Page Capture. Local OCR. Free Editor.
**Subline**: Complete browser screenshot studio — 100% on-device.

### Large Tile (920x680)
**Headline**: Full Page. Scrolling Area. Selected Region. Local OCR.
**Subline**: 5 capture modes, CleanShot-grade annotation studio, privacy redaction, and PDF export.

### Marquee (1400x560)
**Headline**: GoFully — Full Page Screenshot & Annotation Studio
**Subline**: Capture full webpages, extract text from images with local OCR, redact sensitive details, and export in 4K or PDF.

## 5-Screenshot Store Gallery Strategy (1280x800)

1. **Full Page & Scrolling Capture** — "Capture entire scrollable webpages, visible viewports, or custom regions with automated sticky header handling."
2. **Annotation & Visual Feedback Studio** — "Annotate with curved arrows, callout bubbles, step numbers (1, 2, 3), and spotlight highlights."
3. **Privacy Redaction & Data Protection** — "Redact sensitive information with Glass Smooth Blur, Mosaic Pixelation, or Solid Blackout."
4. **On-Device OCR Text Extraction** — "Extract and copy unselectable text from images, charts, and video frames instantly."
5. **High-Res Export & PDF Generation** — "Export in Native, 1080p HD, 4K UHD, or multi-page paginated PDF — 100% client-side."

## Store Tags / Search Terms
- Full Page Screenshot
- Screenshot Extension
- Scrolling Screenshot
- Screenshot Editor
- OCR Screenshot
- Annotate Screenshot
- Blur Screenshot
- Screen Capture
- Webpage to PDF
- Productivity
