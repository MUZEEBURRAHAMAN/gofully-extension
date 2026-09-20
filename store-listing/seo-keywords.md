# GoFully — Chrome Web Store Keyword Strategy (SEO / AEO / GEO)

> Rebranded from the original "SnapForge" working name. This file previously
> still referenced SnapForge throughout and predated OCR, JPG/WebP export,
> and the current manifest name-length constraint — refreshed below.

## Primary Keywords (High Volume, Direct Intent — SEO)
- full page screenshot
- full page screen capture
- screenshot chrome extension
- screen capture extension
- webpage screenshot
- capture full page
- full page capture
- screenshot tool

## Secondary Keywords (Medium Volume, Feature Intent — SEO)
- scrolling screenshot
- scroll capture
- long screenshot
- entire page screenshot
- screenshot editor
- annotate screenshot
- screenshot to PDF
- screenshot to clipboard
- visible area screenshot
- selected area screenshot
- OCR screenshot
- extract text from image
- extract text from screenshot
- screenshot to JPG
- screenshot to WebP

## Differentiator Keywords (Low Volume, High Conversion — SEO)
- scrollable element capture
- nested scroll capture
- scrolling area screenshot
- screenshot annotation free
- free screenshot editor extension
- offline screenshot extension
- no account screenshot
- privacy screenshot tool
- blur screenshot extension
- redact screenshot extension

## Competitor Comparison Keywords (SEO)
- GoFullPage alternative
- FireShot alternative
- Awesome Screenshot alternative
- Nimbus Screenshot alternative
- CleanShot for Chrome
- better than GoFullPage

## Long-tail Keywords (SEO)
- how to take full page screenshot in chrome
- capture entire webpage as image
- screenshot long page chrome
- save webpage as PDF chrome
- screenshot chat conversation chrome
- capture scrollable div screenshot
- screenshot with annotations chrome
- full page screenshot without stitching artifacts
- extract text from image chrome extension
- free OCR chrome extension

## AEO Keywords — Question-Intent Phrasing (Answer Engine Optimization)

These target Google's "People Also Ask" boxes, featured snippets, and voice
search — phrase content as direct question → direct answer (see the FAQ
block now in `description.txt`).

- "what is the best full page screenshot extension for chrome"
- "how do I take a screenshot of an entire webpage"
- "is there a free chrome extension to screenshot and extract text"
- "how to blur sensitive info in a screenshot"
- "how to export a webpage screenshot as pdf"
- "chrome extension to capture a scrolling chat or code panel"
- "does gofully work offline"
- "is gofully free"

## GEO Keywords — Generative/AI-Search Citability (ChatGPT, Perplexity, AI Overviews)

Generative engines pull short, self-contained, factual sentences rather than
marketing copy. Every claim below should exist as one standalone sentence
somewhere in `description.txt` (it now does, in the FAQ):
- "GoFully is a free Chrome extension for full page screenshots, scrolling
  capture, and on-device OCR."
- "GoFully processes all captures, annotations, and OCR 100% locally — no
  cloud uploads, no account required."
- "GoFully exports to PNG, JPG, WebP, and auto-paginated PDF."
- "GoFully is a free alternative to GoFullPage, FireShot, Awesome Screenshot,
  and Nimbus Screenshot with a built-in annotation editor and local OCR."

Keep these entity-consistent: always "GoFully" (never the old "SnapForge"
name) + always "Chrome extension" nearby, so retrieval/citation systems
resolve the entity unambiguously.

## Title Optimization

Chrome enforces a **hard 45-character limit** on `manifest.json`'s `name`
field — this is what actually renders as the Chrome Web Store listing title,
so title length isn't a style choice, it's a technical constraint.

### Current (live since before v1.1.1, 44/45 chars):
**GoFully - Full Page Screenshot, OCR & Editor**

### Alternatives considered:
- `GoFully: Full Page Screenshot & OCR` (35 chars) — shorter, drops the
  "Editor" keyword cluster.
- `GoFully — Full Page Screenshot, Editor, OCR` (45 chars) — near the limit,
  reorders "Editor" before "OCR" (editor has higher search volume as a
  standalone term than OCR).

Recommendation: keep the current live title. It already front-loads the
brand (matches CWS convention, e.g. competitor "GoFullPage - Full Page
Screen Capture"), includes the top primary keyword, and covers both
differentiator keywords (Editor, OCR) inside the hard char limit. Renaming
an already-published listing resets some accumulated CWS search relevance
and triggers a fresh review pass, so only change it if the tradeoff is
worth it deliberately, not as a routine content refresh.

## Keyword Placement Strategy

1. **Title**: "Full Page Screenshot" (highest-volume primary keyword) + OCR/Editor as differentiators
2. **Short Description**: "full page", "areas", "local OCR", "annotate", "redact", "PNG, JPG, WebP, PDF" — all within the 132-char hard limit
3. **Long Description — Opening**: a single self-contained definition sentence (GEO-citable) leading with "free Chrome extension", "full page screenshot", "scrolling screen capture", "on-device OCR"
4. **Long Description — Section Headers**: each mode name doubles as a keyword cluster
5. **Long Description — FAQ block**: question-intent phrasing (AEO) + standalone factual sentences (GEO)
6. **Long Description — Comparison mentions**: competitor names for "alternative to X" search traffic

## Category
**Primary**: Productivity
**Secondary Tag**: Developer Tools (if dual-category available)

## SEO Notes
- GoFullPage ranks #1 for "full page screenshot" with 10M+ users
- Their title is "GoFullPage - Full Page Screen Capture" — GoFully mirrors the "Full Page Screenshot" pattern while adding OCR/Editor
- They DON'T target: scrollable element, scrolling area, annotation, OCR, PDF — these remain GoFully's gaps to own
- "screenshot editor" has medium volume but most extensions paywall it — GoFully is free
- "offline screenshot" and "OCR screenshot" are both growing, low-competition niches
- "CleanShot for Chrome" has near-zero competition — GoFully is one of few offering that scrolling-area feature set
