# Guide cover image prompts

The guides index currently uses real screenshots from the extension (`public/landing/*.webp`, mapped in `components/site/guide-browser.tsx`). If you want custom artwork instead, generate one image per guide with the prompts below (add two more rows for the keyboard-shortcuts and highlighter guides), export at 1600 x 1000 px (16:10), save as WebP in `public/guides/<slug>.webp`, and change the `COVERS` map to point at them.

## Shared style (paste before every prompt)

Flat product illustration on a soft off-white to pale blue gradient background. Brand colours only: deep navy #014073, sky blue #6AB0FF, white, light grey, and one small green accent #1F7A4D for success marks. Clean rounded rectangles, 12 px corner radius, thin 1 px light borders, soft shadow under floating cards. A simplified browser window with a rounded tab bar is the main object. No people, no logos, no real brand names, no photo textures, no gradients on text. Inter-style sans-serif UI text, kept minimal and legible. Generous empty space, subject slightly right of centre. 16:10, crisp at 2x.

## Prompts

| Guide slug | Subject to draw |
|---|---|
| how-to-draw-on-a-live-website | A browser window showing an article. A hand-drawn navy arrow and a yellow highlight sit on top of the text, with a small sticky note in the corner and a floating toolbar of pen, arrow and highlighter at the bottom. |
| how-to-capture-a-single-element | A web dashboard where one card is outlined by a sky-blue selection box with a small "Card" label and corner handles. The rest of the page is dimmed. |
| how-to-auto-redact-sensitive-info | A customer record with an email, card number and API key lines. Three of the values are covered by solid black bars. A small shield badge reads "Auto-redact". |
| how-to-make-a-step-by-step-guide-from-screenshots | Three small screenshot cards in a vertical row, numbered 1, 2, 3 with short caption lines, flowing into one document page with a PDF corner tag. |
| screenshot-tool-for-developers-and-qa | A browser window with a bug-report panel beside it. A red outline circles a broken button, and a small checklist and a code-style line sit under it. |
| best-full-page-screenshot-extensions | Five identical extension cards in a row. The middle one is larger, navy, and has a small green check. The others are white and muted. |
| how-to-take-full-page-screenshot-chrome | A very tall web page shrinking into one long thin image, with a downward arrow and a label "1280 x 4056 px, one image". |
| how-to-blur-sensitive-info-in-screenshots | A form with two fields. One field is pixel-blurred into mosaic blocks, the other is clear. A small blur-brush icon floats nearby. |
| how-to-extract-unselectable-text | An image of a chart with a dashed selection frame around a caption. A floating "Copy text" card shows the extracted words. |
| how-to-save-webpage-as-pdf | A web page turning into a stack of clean paginated PDF sheets, with a download arrow and a PDF tag. |
| how-to-beautify-screenshots | A plain screenshot placed on a soft sky-to-navy gradient background with padding, rounded corners, a browser frame and a drop shadow. A small swatch palette sits beside it. |
| privacy-first-screenshot-tools | A laptop outline holding a screenshot, with a padlock on it and a crossed-out cloud above it, to show nothing leaves the device. |
| how-to-extract-text-in-multiple-languages-ocr | One image with short lines of text in different scripts (Latin, accented Latin, Chinese characters) being turned into a single clean text block. |

