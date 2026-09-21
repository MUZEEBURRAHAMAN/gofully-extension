# SEO Audit — GoFully (gofully-extension.vercel.app)

**Audit date:** 2026-09-20
**Scope:** Homepage deep-dive (`/`) + site-wide technical checks (robots.txt, sitemap.xml, llms.txt, security headers, schema, social meta, link health). Site is a Next.js 16 marketing site (25 routes: homepage, 11 `/guides` articles, 4 `/alternatives` comparisons + hub, FAQ, security, privacy, terms, roadmap, support) for the GoFully Chrome extension.

## Overall Score: 85/100 — **Good** (≈ 8.5/10)

| Category | Weight | Score | Confidence |
|---|---|---|---|
| Technical SEO | 25% | 90/100 | Confirmed |
| Content Quality | 20% | 85/100 | Likely |
| On-Page SEO | 15% | 88/100 | Confirmed |
| Schema / Structured Data | 15% | 85/100 | Confirmed |
| Performance (CWV) | 10% | 65/100 | Hypothesis (PSI API rate-limited) |
| Image Optimization | 10% | 80/100 | Confirmed |
| AI Search Readiness (GEO) | 5% | 95/100 | Confirmed |

---

## 🔴 Critical (0)
None found.

## ⚠️ Warnings

1. **`logo.png` referenced in Schema.org markup is 858 KB** (`public/logo.png`), used as the `SoftwareApplication.image` in the JSON-LD graph. It isn't rendered as a visible `<img>` (nav uses the 10 KB `logo-nav.png` instead), so it doesn't hit LCP, but it's fetched by crawlers/rich-result renderers and is 15-80x larger than it needs to be for a logo asset.
   - **Fix:** Compress/resize to a few hundred KB max, or point the schema `image` field at `og-image.png` (already 54 KB, correctly sized).

2. **2 broken external links found** (403 and connection_failed) on directory badge links: `alternativeto.net` badge and `ufind.best/products/gofully`. Low SEO impact (external, `rel=noreferrer`), but worth pruning or fixing since dead outbound badges look unmaintained.

3. **5 AI crawlers not explicitly managed** in `robots.txt` (Bytespider, CCBot, anthropic-ai, FacebookBot, Amazonbot) — they inherit the wildcard `Allow: /` rule, which is fine but undocumented. The major ones (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, ChatGPT-User) are already explicitly allowed — ahead of most sites.

4. **Core Web Vitals unverified.** PageSpeed Insights API was rate-limited without a key, so this audit could not pull live LCP/INP/CLS field or lab data. Given the homepage ships `framer-motion`, `fabric`, and `tesseract.js` as client dependencies, and `next.config.mjs` sets `images.unoptimized: true` (disabling Next's automatic AVIF/WebP + responsive `srcset` generation), there's real risk to LCP/INP that this audit can't confirm or rule out without a CWV run. **Recommend running `pagespeed.py` with an API key, or Lighthouse locally, before trusting this category's score.**

5. **`AggregateRating` schema shows `ratingCount: 5`.** Legitimate but thin — low sample size can look weak to both Google's review-snippet eligibility and to users if it renders as a rich result. Not a violation, just worth growing before leaning on it.

## ✅ Strengths

- **Security headers: 100/100** — HSTS (preload), CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all present.
- **llms.txt: 100/100 quality score** — well-structured, 21 links, 4 sections. Ahead of the vast majority of sites for GEO/AI-search readiness.
- **robots.txt / sitemap.xml** present and correct, sitemap referenced in robots.txt.
- **Rich JSON-LD `@graph`**: `SoftwareApplication`, `WebSite`, `Organization`, `Person`, `BreadcrumbList` — properly interlinked via `@id` references.
- **On-page fundamentals solid**: single H1 ("Full Page Screenshot Tool. One Extension. Every Job."), 8 well-structured H2s, title 62 chars, meta description 150 chars (both in safe SERP-display range), canonical set, `lang="en"`, viewport set, `meta robots: index, follow`.
- **17/17 images have alt text** — zero missing-alt issues on the homepage.
- **Social meta: 85/100** — full Open Graph (7/7) and Twitter Card (4/6, missing only optional `twitter:site`/`twitter:creator`).
- **Real content-marketing footprint**: 11 `/guides` articles + a 4-page `/alternatives` comparison hub (vs. GoFullPage, Awesome Screenshot, FireShot, Nimbus) — this is the kind of programmatic long-tail content that actually drives non-branded organic traffic for a Chrome extension, and most competitor extensions don't bother building it.
- **994 words on the homepage** — well above thin-content thresholds for a product page.

## Environment Limitations

- PageSpeed Insights (Core Web Vitals) calls were rate-limited by Google's API (no API key configured in this environment) after 2 retries, per the skill's bounded-retry rule. Performance category score above is a code-based estimate (Hypothesis), not measured CWV data.

---

## Evidence Log

- `robots.txt`: 200 OK, 1 sitemap declared, 8 user-agent blocks, major AI crawlers explicitly allowed.
- `llms.txt`: 200 OK, quality 100/100.
- Security headers: HTTPS yes, score 100/100.
- Social meta: score 85/100.
- Schema validator: 1 warning (wrapper object without explicit `@type` — cosmetic, the `@graph` container itself; all 5 real entities are correctly typed).
- Broken-link scan (homepage, 18 links checked): 15 healthy, 2 broken (external badges), 1 redirect.
- `next.config.mjs`: `images.unoptimized: true`.
- `public/logo.png`: 858 KB vs. `public/logo-nav.png`: 10 KB, `public/og-image.png`: 54 KB.
