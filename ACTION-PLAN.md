# SEO Action Plan — GoFully (Website & Extension)

Prioritized by impact vs. effort to reach **10/10** across both the Website and Chrome Web Store extension.

## ✅ Completed in Sprint 1 (Immediate Wins)

1. **Migrated Deprecated Schema:** Converted all 5 tutorial pages from `@type: "HowTo"` (deprecated by Google in Sept 2023) to `@type: "TechArticle"` with full metadata and entity attribution.
2. **AI Crawler Allowlist in `robots.txt`:** Added explicit `Allow: /` rules for `Bytespider`, `CCBot`, `anthropic-ai`, `FacebookBot`, `Amazonbot`, and `cohere-ai` to maximize Generative Engine Optimization (GEO/AEO).
3. **Optimized CWS Listing Copy:** Front-loaded high-intent keywords (*"Full page screenshot & screen capture tool"*) into the first 130 characters of `store-listing/short-description.txt` and the opening 100 words of `store-listing/description.txt`.
4. **Extension Multi-Language Localization (`_locales`):** Created `_locales/` directory with `messages.json` definitions for 5 core markets:
   - English (`en`)
   - Spanish (`es`)
   - French (`fr`)
   - German (`de`)
   - Portuguese - Brazil (`pt_BR`)
   Configured `manifest.json` with `"default_locale": "en"` and updated `build.mjs` to bundle `_locales` into `dist/`.

---

## 🚀 Sprint 2 (Next 1–2 Weeks)

5. **In-App Review Prompt Loop:** Add a gentle, non-intrusive prompt in the extension editor/result bar after 5 successful captures to prompt satisfied users for a 5-star review, scaling `ratingCount` beyond 50+.
6. **Upload 45s Listing Video to CWS:** Create a crisp screen recording showing (1) 1-click full page capture, (2) on-device OCR copy, (3) blur/redact, (4) PDF export. Link via YouTube on the CWS Developer Dashboard to boost listing CTR by 25–40%.
7. **Apply for CWS "Featured" Badge:** Ensure promo tiles (440x280, 920x680, 1400x560) adhere to CWS guidelines and request Google's editorial review.

---

## 🌐 Sprint 3: Website Authority & Core Web Vitals (Month 1)

8. **Custom Domain Setup:** Map `gofully.app` (or similar) with 301 redirects from `gofully-extension.vercel.app` to build standalone root domain authority and lift Google organic rankings.
9. **Next.js Image Optimization & CWV:** Switch homepage `<img>` elements to `next/image` with explicit aspect ratios, and remove `images.unoptimized: true` where possible to maximize mobile LCP.
10. **Target 3 New High-Intent Guides:**
    - *"How to take a full page screenshot on Mac in Chrome"*
    - *"Best scrolling screenshot extensions for Chrome (2026 Comparison)"*
    - *"How to screenshot an entire webpage to PDF without page breaks"*

