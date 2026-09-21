# SEO Action Plan — GoFully

Prioritized by impact vs. effort. See `FULL-AUDIT-REPORT.md` for evidence.

## Do now (low effort, real payoff)

1. **Shrink `public/logo.png`** from 858 KB to <100 KB (or just swap the schema `image` field to reuse `og-image.png`, 54 KB). One-line/one-file fix.
2. **Fix or remove the 2 broken outbound badge links** (`alternativeto.net`, `ufind.best`) — either update the URLs or drop the badges if those listings are stale.
3. **Run a real Core Web Vitals check** — get a free PageSpeed Insights API key (or run Lighthouse locally / `npx lighthouse`) and re-run:
   `python3 <SKILL_DIR>/scripts/pagespeed.py https://gofully-extension.vercel.app --strategy mobile`
   This is the one category this audit couldn't verify — worth closing the gap given the site ships `framer-motion` + `fabric` + `tesseract.js` client-side.

## Do this month

4. **Explicitly add the remaining AI crawlers to `robots.txt`** (Bytespider, CCBot, anthropic-ai, FacebookBot, Amazonbot) — even just `Allow: /` blocks for each, to match the documented pattern already used for GPTBot/ClaudeBot/etc. Cosmetic but keeps the crawler policy self-documenting.
5. **Grow `AggregateRating` sample size** (currently `ratingCount: 5`) — more real Chrome Web Store reviews reflected in the schema strengthens rich-result eligibility and trust signal.
6. **Add optional Twitter Card fields** `twitter:site` / `twitter:creator` if there's a brand Twitter/X handle — small completeness win on the 85/100 social score.

## Longer-term / worth monitoring

7. Verify `images.unoptimized: true` in `next.config.mjs` isn't silently bloating any *visible* on-page images beyond the ones already checked — audit any new images added to guide/alternatives pages against the same size discipline seen in `logo-nav.png`/`og-image.png`.
8. Keep expanding `/guides` and `/alternatives` — this is currently the strongest lever in the whole site (11 guides + 4 comparison pages already outperform most competing extensions on content depth) and compounds over time.
