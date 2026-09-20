# Security Policy

## Supported Versions

We actively release security patches and bug fixes for the current and recent minor versions of GoFully.

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## GoFully Privacy & Security Architecture

GoFully is engineered with a strict **Local-First, Privacy-First Architecture**:
- **Zero Remote Storage**: All screenshot stitching, canvas editing, and PDF exports are processed locally in your browser sandbox using Canvas APIs and WebAssembly.
- **Client-Side OCR**: Text extraction runs via WebAssembly-compiled Tesseract.js directly inside your browser session. Your images and extracted text never touch external servers or third-party AI APIs.
- **No Telemetry Tracking**: GoFully does not collect, log, or transmit your captured screenshots or personal browsing data.
- **Minimal Chrome Permissions**: We request only the permissions strictly required to capture the active tab (`activeTab`, `tabs`, `scripting`, `storage`).

## Reporting a Vulnerability

We take the security of GoFully and the trust of our users seriously. If you discover a security vulnerability or potential leak:

1. **Do NOT open a public GitHub issue.**
2. Report the vulnerability privately via [GitHub Security Advisories](https://github.com/MUZEEBURRAHAMAN/gofully-extension/security/advisories/new) or by emailing the maintainer directly at **security@gofully.app** (or via GitHub profile contact).
3. Please include:
   - A detailed description of the vulnerability.
   - Exact steps to reproduce or proof-of-concept (PoC) code.
   - The impact of the vulnerability.
   - Your name or handle for attribution in the security release notes (optional).

## Response Timelines

- **Initial Acknowledgement**: Within 48 hours of report receipt.
- **Assessment & Confirmation**: Within 5 business days.
- **Fix & Public Disclosure**: We coordinate disclosure with you once a patch is prepared and published to the Chrome Web Store.
