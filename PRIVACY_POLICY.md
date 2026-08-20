# Privacy Policy for GoFully

**Effective Date:** August 20, 2026  
**Last Updated:** August 20, 2026  

GoFully ("we", "our", or "the extension") is a browser screenshot, optical character recognition (OCR), and visual annotation tool. We are fundamentally committed to protecting user privacy and ensuring full transparency regarding data handling.

---

### 1. 100% On-Device Processing Principle
GoFully operates on a **client-side only** architecture. All core features—including full-page capture, scrolling screenshot stitching, image editing, privacy redaction (blur/pixelate/blackout), optical character recognition (OCR), and PDF generation—execute **entirely on your local machine within your browser sandbox**.

- **No Remote Transmission**: Your screenshots, images, URLs, webpage text, and OCR outputs are never transmitted, uploaded, or synced to any external server, cloud storage, or third-party API.
- **No Account Required**: You do not need to create an account, log in, or provide personal information (such as your name, email address, or phone number) to use GoFully.

---

### 2. Information We Handle Locally
When you use GoFully, the following data types are processed strictly in local memory and are never collected by us:

1. **Screenshots & Canvas Data**: Generated temporary image bitmaps are stored in ephemeral browser memory (`OffscreenCanvas` and extension session memory) while you edit or view them. They are automatically cleared when you close the tab or dismiss the capture HUD.
2. **Extracted Text (OCR)**: Optical Character Recognition is computed on-device using local WebAssembly (Tesseract.js). Extracted text is placed directly into your local clipboard upon request and is not stored or logged.
3. **User Preferences**: Configuration choices (such as default export format, PDF page layout, and delay timers) are stored locally in your browser via Chrome's `chrome.storage.sync` API.
4. **Active Tab URLs**: URLs are examined locally strictly to determine capture compatibility (e.g., preventing capture on restricted browser internal pages). URL strings are never transmitted or logged.

---

### 3. Permissions & Justification
GoFully requests only the minimum permissions necessary for its single-purpose functionality:

- `activeTab`: Used to capture the visible contents of the active webpage and display the interactive selection interface upon user initiation.
- `scripting`: Used to inject local scripts for measuring page height, managing sticky headers during scrolling, and rendering the in-page result HUD.
- `debugger`: Used to interface with the Chrome DevTools Protocol (`Page.captureScreenshot`) for single-shot, pixel-perfect full-page captures.
- `offscreen`: Used to assemble multi-frame screenshots and host the WebAssembly OCR worker without blocking the main browser thread.
- `downloads`: Used solely when you click "Save PNG" or "Save PDF" to download the file directly to your device's Downloads folder.
- `storage`: Used to save your personal preferences (such as PDF page size and default actions) across browser sessions.

---

### 4. Third-Party Services & Analytics
- **Zero Third-Party Telemetry**: GoFully contains **no** analytics SDKs (such as Google Analytics, Mixpanel, or Segment), tracking pixels, error telemetry services (such as Sentry), or advertising networks.
- **No External CDN Scripts**: All script dependencies, fonts, and WebAssembly binaries are bundled locally within the extension package.

---

### 5. Data Retention & Deletion
Because GoFully does not collect or transmit your data, we maintain no database of user captures or personal records. When you download a PNG or PDF, the file resides exclusively on your local filesystem under your control.

---

### 6. Changes to This Privacy Policy
If we update this Privacy Policy to reflect future feature enhancements, we will update the "Last Updated" date at the top of this document. Any future updates will maintain our core commitment to on-device processing and user privacy.

---

### 7. Contact & Support
If you have questions or feedback regarding this Privacy Policy or GoFully's privacy practices, please contact us via our official repository:
- **GitHub Issues**: [https://github.com/MUZEEBURRAHAMAN/gofully-extension/issues](https://github.com/MUZEEBURRAHAMAN/gofully-extension/issues)
