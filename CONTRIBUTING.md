# Contributing to GoFully

Thank you for your interest in contributing to GoFully! GoFully is an open-source, privacy-first full-page screenshot and screen capture Chrome extension with OCR, canvas editing, and PDF export.

Whether you are fixing a bug, improving documentation, or proposing new features, your help is welcome!

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to project maintainers.

---

## Project Architecture

This repository contains both the Chrome extension (Manifest V3) and the official documentation/landing page:

- `src/` — Chrome Extension source code (content scripts, service worker, editor UI, OCR workers, capture engine).
- `app/` — Next.js documentation and landing page (`https://gofully-extension.vercel.app/`).
- `public/` — Static assets, icons, manifest template, and metadata.
- `tests/` — Playwright end-to-end and security tests.
- `build.mjs` — Extension bundler and packaging script.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer)
- `npm` (v9 or higher)
- Google Chrome (or any Chromium-based browser like Brave or Edge)

### Setup

1. Fork the repository and clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/gofully-extension.git
   cd gofully-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Development Workflows

### 1. Developing the Chrome Extension

To build the extension into the `dist/` directory:
```bash
npm run build:extension
```

To load the extension in Chrome:
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `dist/` folder in your repository.
4. After making changes to extension code in `src/`, rerun `npm run build:extension` and click the refresh icon on the GoFully card in `chrome://extensions/`.

To package a release zip ready for the Chrome Web Store:
```bash
npm run package:extension
```

### 2. Developing the Landing Page & Docs

To run the Next.js landing page locally with hot reload:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify production builds:
```bash
npm run build
```

### 3. Running Tests

Build the extension first (`npm run build:extension`): the tests load `dist/` in a real Chromium.

```bash
npx tsc --noEmit            # types
node scripts/ds-lint.mjs    # design-system rules
npm audit                   # dependencies

npm test                    # everything (about 11 minutes)
npm run test:security       # security and policy checks only
npm run test:e2e            # end-to-end tests only

# While working on one feature, run just its spec:
npx playwright test tests/e2e/28-v12-capture-tools.spec.ts
```

Add a test with every change. For anything that touches page content, messages between the extension's parts, or the manifest, also read the [security review](docs/qa-security-review.md) and keep `security/package-policy.json` in step with `manifest.json`: `npm run package:extension` fails if they disagree.

---

## Pull Request Guidelines

1. **Create a branch**:
   Use descriptive branch names:
   - `fix/issue-description` for bug fixes
   - `feat/feature-name` for new features
   - `docs/page-or-topic` for documentation updates

2. **Keep PRs focused**:
   A pull request should address a single concern or feature. Keep diffs as concise as possible.

3. **Verify locally before pushing**:
   - Ensure `npm run build` passes with zero errors.
   - If modifying the extension, verify `npm run build:extension` builds cleanly and test the unpacked extension in Chrome.
   - Run `npx tsc --noEmit`, `node scripts/ds-lint.mjs` and the tests for what you changed (or `npm test` for everything).
   - If you changed a permission, host access, web-accessible file or CSP, update `security/package-policy.json` and say why in the pull request.

4. **Write clear commit messages**:
   Follow conventional commits when possible (e.g., `feat: add keyboard shortcut for visible area capture`, `fix: handle sticky headers during vertical scrolling`).

5. **Submit your Pull Request**:
   Fill in all fields of the provided [Pull Request Template](.github/pull_request_template.md).

---

## Questions & Discussions

Have questions or need help?
- Open a discussion or question in the [GitHub Issues](https://github.com/MUZEEBURRAHAMAN/gofully-extension/issues).
- Check the official guides on our [Documentation Site](https://gofully-extension.vercel.app/guides).
