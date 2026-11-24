# GoFully website: SEO, AEO and GEO audit

Site: https://gofully-extension.vercel.app · Audited 15 Nov 2026 · Goal: more Chrome Web Store installs

## Summary

The site's technical base is solid: every page has its own title, description and canonical; robots.txt welcomes search and AI crawlers; there is an llms.txt, JSON-LD on most pages, Search Console is verified, and there are 17 guides and 4 comparison pages. The real problems are discoverability, not markup:

1. **The brand is drowned out.** A search for "GoFully full page screenshot chrome extension" returns GoFullPage (a different extension, 9 million users) almost everywhere. Only the Chrome Web Store listing and AlternativeTo mention GoFully.
2. **The site is on a vercel.app subdomain.** It has little authority of its own and is hard to build links to.
3. **The home page targeted a phrase nobody searches.** Its title was "The Private Screenshot Studio for Chrome"; the searched phrase is "full page screenshot extension for Chrome".
4. **AI engines were given stale facts.** llms.txt said v1.1.3 "publishes next" days after it went live.
5. **Installs couldn't be traced.** No link to the Web Store carried a source, so the Web Store dashboard couldn't say which page or button drives installs.

Score (guidance only): Technical 85 · Content 75 · On-page 60 → 80 after fixes · Schema 80 · Performance not measured · Images 80 · GEO 65 → 85 after fixes. **Overall about 74 before, 82 after the code fixes.**

## Findings

| # | Finding | Evidence | Impact | Status |
|---|---|---|---|---|
| 1 | Home title and description don't contain the main search phrase | `<title>GoFully — The Private Screenshot Studio for Chrome</title>` | Lower ranking and click-through for "full page screenshot extension" | **Fixed**: "GoFully: Free Full Page Screenshot Extension for Chrome" and a description that leads with it |
| 2 | Home heading reads "studiothat" to crawlers | Two `<span>`s with no space between them inside the `<h1>` | Search and AI engines read the heading as a non-word | **Fixed** |
| 3 | Sitemap missing three guides and dates frozen at 20 Sep | Hand-written `public/sitemap.xml`, 25 URLs | New pages found late; untrusted lastmod | **Fixed**: `app/sitemap.ts` lists every page (28) with the date of its last commit |
| 4 | llms.txt out of date | "v1.1.2 is live… v1.1.3 publishes next" | ChatGPT, Perplexity and others describe the product wrongly | **Fixed**: current status and a "Key facts" block |
| 5 | Name confused with GoFullPage | Search results; no page says they differ | Users and AI engines treat "GoFully" as a typo | **Fixed in part**: FAQ answer and llms.txt say clearly they are different products. A custom domain is the real fix (see plan) |
| 6 | Structured data says version 1.1.2 | `"softwareVersion": "1.1.2"` while the extension is 1.1.3 | Stale fact in rich data | **Fixed** |
| 7 | Doubled brand in titles | "Support & Help Desk — GoFully \| GoFully", same on Roadmap | Wasted title space, looks careless in results | **Fixed** |
| 8 | No install attribution | Store links had no `utm_*` | Can't tell which pages convert | **Fixed**: every button and in-guide link carries `utm_source=gofully-site&utm_medium=<placement>` |
| 9 | Rating markup must match the Store | `aggregateRating` 5.0 from 5 ratings, shown on the page as "5.0 on the Chrome Web Store" | If it drifts from the Store, Google can ignore or penalise review markup | **Check**: confirm the Store still shows 5 ratings at 5.0, and update both together |
| 10 | No custom domain | Site lives on `*.vercel.app` | Weak authority, hard to earn links, reinforces the name confusion | **Needs you** (see plan) |

## What was already good

- Unique title, description and self-referencing canonical on every page checked (14 pages).
- robots.txt allows Googlebot, Bingbot and the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others); `/uninstall-feedback` is excluded.
- Open Graph and Twitter cards with a 1200 × 630 image.
- JSON-LD: SoftwareApplication with offer, FAQ, breadcrumbs and article markup on guides.
- Google Search Console verification meta in place.
- 17 guides and 4 comparison pages aimed at real long-tail searches.

## Environment limitations

- PageSpeed Insights was rate-limited during the audit, so Core Web Vitals were not measured. Run it again or check Search Console's Core Web Vitals report.
- The Chrome Web Store page couldn't be read directly, so the current rating count is unconfirmed (finding 9).
- Index coverage can only be read in Search Console; web search results were used as a proxy.

Sources: [web search for the brand](https://alternativeto.net/software/gofully/about/), [Chrome Web Store listing](https://chromewebstore.google.com/detail/akfbmhmdlbmljklgajkgoekobofhhofc).
