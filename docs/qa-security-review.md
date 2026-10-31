# GoFully v1.1.3: QA and security review

Scope: the extension (manifest, service worker, content scripts, editor, popup, offscreen OCR), the Next.js marketing site, the build and packaging pipeline, and every change made in the v1.1.3 redesign, capture-robustness and landing-page-mode work.

## How to re-run

```bash
node build.mjs                      # dev build into dist/
npx tsc --noEmit                    # types
node scripts/ds-lint.mjs            # design-system rules
npm audit                           # dependencies
npx playwright test                 # unit + security + e2e (real extension in Chromium)
npm run package:extension           # release build, zip, and verification of the zip itself
```

## Threat model

| Boundary | Attacker | What they want |
|---|---|---|
| Web page, content script | A website the person captures | Read captures, run code in the extension, learn the extension exists |
| Page-controlled text (titles, URLs, OCR output) | A website | Turn text into markup in an extension page (stored XSS) |
| Imported files (presets, settings) | A file the person was tricked into opening | Run script, trigger network requests |
| Extension pages | Any injected script | Send captures to a server |
| Build and package | Our own mistakes | Ship test shims, a wider permission set, or a remote script |
| Marketing site | A visitor or a third-party script | Frame the site, run injected script, leak the opener |

## Findings and status

| ID | Severity | Finding | Status |
|---|---|---|---|
| F-01 | High | Extension pages had no restrictive CSP for network egress. Injected script could have posted captures anywhere. | Fixed: `connect-src 'self' data: blob:`, `img-src`, `font-src`, `frame-src 'none'`, `base-uri 'none'`, `form-action 'none'`. Tested in TC-SEC-001. |
| F-02 | High | Design-preview shim (`ds/chrome-stub.js`), sample images and `robots.txt`/`sitemap.xml` shipped in the package. | Fixed: `GF_RELEASE=1` build strips them; `verify-package.mjs --release` fails if any remain; packaging runs it on the zip. |
| F-03 | Medium | Web-accessible resources let any site fetch more extension files than needed and fingerprint the extension. | Fixed: only the font and shutter sound, with `use_dynamic_url`. Tested in SEC-REL-003 and TC-SEC-002. |
| F-04 | Medium | Image data URLs from messages were put into `innerHTML` attributes after a weak `startsWith("data:image/")` check (could carry SVG or a quote that breaks out of the attribute). | Fixed: strict raster-only validator (`src/utils/safe-image.ts`); `src` set through the DOM. Tested in SEC-SINK-002 and TC-SEC-003. |
| F-05 | Medium | Popup status line and editor swatch tooltips built markup from strings (label, preset name). | Fixed: `textContent`/DOM construction. |
| F-06 | Medium | A remembered "Without annotations" silently dropped blur and redaction marks, and a mark added after answering was never asked about. | Fixed: remembered "without" is ignored (and never stored) when privacy marks exist; new marks re-open the question. Tested in TC-SEC-004 and TC-SEC-005. |
| F-07 | Medium | Known-vulnerable dependencies reported by `npm audit`. | Fixed with `npm audit fix` (non-breaking). `npm audit`: 0 vulnerabilities. |
| F-08 | Medium | Site CSP allowed `'unsafe-eval'` in production, lacked `object-src`, `frame-src`, `worker-src`, `media-src`, `manifest-src`, no `upgrade-insecure-requests`, no HSTS or COOP. | Fixed. Tested in SEC-WEB-001..003. |
| F-09 | Low | JSON-LD built with bare `JSON.stringify` inside `<script>` (a `</script>` in any value would end the tag). 25 files. | Fixed: `serializeJsonLd` escapes `<` and line separators. Tested in SEC-WEB-004/005. |
| F-10 | Low | One `target="_blank"` link without `rel`. | Fixed. Guarded by SEC-WEB-006. |
| F-11 | Low | If a full-page capture died midway (tab closed, worker killed) the page stayed frozen by the animation-pinning stylesheet. | Fixed: 20 s watchdog restores it. |
| F-12 | Low | Landing mode keeps about twice as many frames in memory; a very long page could exhaust service-worker memory. | Fixed: above 120 photos it falls back to standard mode and says why in `stitch.reasons`. |
| F-13 | Low | `fullPageMode` was trusted as stored. | Fixed: anything but "standard" or "landing" means "auto". |
| F-14 | Info | New permissions or hosts could be added without review. | Fixed: `security/package-policy.json` is the approved list; manifest and zip must match it (SEC-REL-001..005). |
| F-15 | Medium | The capture stack kept each capture only in the service worker's memory. Chrome stops that worker after about 30 seconds idle, so a card left open could then Pin, Edit, Save or add to a guide a different capture from the one it showed. | Fixed: each card sends its own image and details with every action (validated as a plain raster image); an unknown capture is refused with a clear message instead of falling back to another. Tested in TC-V12-011. |
| F-16 | Medium | History indexing, QR reading and OCR can ask for the offscreen page in the same moment after a capture. Two parallel creations make Chrome reject the second, which failed that caller silently (and could drop a history search entry). | Fixed: one creation at a time. The test fails against the old code (TC-V12-010). |
| F-17 | Medium | Reading the QR codes of an older card made that card the "current" capture, so a later Edit or Save could act on the wrong image. | Fixed: code reading is read-only. Covered by TC-V12-001. |
| F-18 | Low | The service worker and the offscreen page both answered a message named `SCAN_CODES`; the offscreen page answered first with nothing, so QR reading always returned no codes. | Fixed: the offscreen message has its own name. |
| F-19 | Low | Messages meant only for GoFully's own pages (start a delayed capture, run an after-capture action) were gated by `sender.id`, which content scripts share. | Fixed: gated by the sender's address being inside the extension (`fromExtensionPage`). Reviewed in code; a web page cannot send these messages at all (no `externally_connectable`), so this is defense in depth and has no direct test. |
| F-20 | Low | GoFully's own on-page UI (capture stack, toasts, countdown) could appear in the next photo, including a previous capture's preview. | Fixed: all of it is hidden and restored around every shutter, including scrolling-area captures. Tested in TC-V12-002 and TC-V12-003. |
| F-21 | Info | Copy said a capture could be dragged "into a chat or an email". The drag hands over a file for the desktop or a folder; web mail and chat pages may not accept it, and OS-level drops cannot be tested here. | Fixed in the copy: "onto your desktop or into a folder". |
| F-22 | Info | `CONTRIBUTING.md` linked to a local file path on the maintainer's computer and to a Code of Conduct that did not exist; CI built the code but ran no tests, type check, lint or audit. | Fixed: link and `CODE_OF_CONDUCT.md` added; CI now type-checks, lints, audits (high and critical), builds, runs the unit and security tests, packages and verifies the zip, and attaches it. |

## Residual risks and decisions for the owner

1. **Third-party script on the site.** Removed on 22 Oct 2026: the DMCA badge helper script and its CSP allowance are gone. The static badge image and link stay. The site now loads no external script.
2. **Site `'unsafe-inline'` for scripts and styles.** Next.js injects inline bootstrap scripts. Removing it needs per-request nonces. Eval is already gone in production. Scheduled work, not a release blocker for a static marketing site.
3. **`tabs` permission.** Used for the captured tab's title and URL in history and file names. It could shrink to `activeTab` plus an explicit title request. The Chrome Web Store reviewer may ask; the rationale is in the policy file.
4. **`<all_urls>` host access.** Required to capture any page. Nothing is read until the person starts a capture. Cannot be narrowed without breaking the product.
5. **Redact page on framework-built pages.** It wraps matched text in small elements and unwraps them on Done. On pages that re-render their own text with a framework, an update while it is on can briefly look odd; Done restores the page. Names and street addresses are not found automatically, and the Help and store text say so.
6. **Measure's color picker** uses Chrome's own screen picker (`EyeDropper`), which needs a click and no permission. It cannot be driven by automated tests, so it is covered by a manual check.
7. **Spanish and French strings** were added by machine. A native-speaker pass is recommended before release.
8. **Personal email on the site** (support and privacy pages). Consider a role address.

## Test matrix

| Area | Tests |
|---|---|
| Manifest and package gate | `tests/security/release-gate.spec.ts` (5) |
| Site headers, JSON-LD, links, HTML sinks | `tests/security/site-headers.spec.ts` (6) |
| Extension HTML sinks and image validation | `tests/security/extension-sinks.spec.ts` (2) |
| Existing security suites | content-lint, extension-hardening, guide-export, HIPAA PHI, SOC2, sensitive-detect, zip |
| Hostile input and privacy, real extension | `tests/e2e/27-hostile-input-and-privacy.spec.ts` (5) |
| Capture stack, delay, QR, Measure, Redact page, stale-card safety | `tests/e2e/28-v12-capture-tools.spec.ts` (11), unit `v12-helpers.spec.ts` (4) |
| Capture robustness | `24-landing-scroll-effects`, `25-landing-page-mode`, unit `tile-plan` |
| Editor | `26-editor-zoom-tall-page`, `06-exports`, `03-canvas-editor`, `13-beautify-v113` |

## Verification results

**22 Oct 2026 (first pass)**

- `npx tsc --noEmit`, `node scripts/ds-lint.mjs`: clean. `npm audit`: 0 vulnerabilities.
- Full Playwright run: 207 passed, 4 failed with "browser closed" crashes under load. All four passed when run alone.
- Production `next start`: CSP, HSTS and COOP headers present, no CSP violations or console errors on `/`, `/faq` and a guide.

**31 Oct 2026 (final, 1.1.3 as packaged)**

- `npx tsc --noEmit` and `node scripts/ds-lint.mjs` clean. `npm audit`: 0 vulnerabilities (including jsQR 1.4.0, added for QR reading).
- **Full Playwright run: 226 passed, 0 failed** (11.4 minutes, one worker).
- After the full run, a few wording changes were made in the extension source (the drag-out description, the Help text). The suites that cover them were re-run on the rebuilt extension: 112 tests in one run with 1 intermittent failure that was not reproduced in 7 further runs (the new capture-tools spec 4 times and the rest 3 times, all green). The failing test was not identified. The only assertions of that kind sit in the pixel checks of `28-v12-capture-tools.spec.ts`. If it appears in CI, start there.
- `npm run package:extension`: release build, zip and package check all pass. The zip holds version 1.1.3, the same six permissions as 1.1.2 and all-sites access, 80 files, 18.5 MB, and none of the preview or source files.
- **The zip itself was unzipped and loaded in a real browser** (not the build folder): the shortcut capture shows the card, the capture is read, a full-page capture completes, Redact page covers 4 items on the test page, Measure starts, the editor, Settings, Help and Guide pages open with no errors, and no preview shim is present.
- Not covered by automated tests: Measure's color picker (Chrome's own picker), dragging a capture into other apps, and Redact page on framework-built pages. Check these by hand before submitting.

## Sign-off checklist

- [x] `npx tsc --noEmit`, `node scripts/ds-lint.mjs`, `npm audit` clean
- [x] Full Playwright run green (226 of 226)
- [x] `npm run package:extension` passes, including the check of the zip
- [x] Zip unzipped and loaded in a real browser: capture, full page, Redact page, Measure, extension pages
- [ ] Owner decision recorded on residual risks 2 and 3 (inline scripts on the site, the `tabs` permission)
- [ ] By hand in your own Chrome: the color picker, OCR on a real page, a save to disk, dragging a capture to the desktop
