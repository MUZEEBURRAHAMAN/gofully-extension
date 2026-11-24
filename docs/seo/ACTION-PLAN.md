# GoFully: action plan for more installs

Ordered by how much each step is likely to move installs. Steps marked **Done** are in the code now (not yet deployed).

## This week

1. **Deploy the code fixes** (Done in code): keyword title and description, heading fix, generated sitemap, llms.txt facts, GoFullPage FAQ, version 1.1.3 in structured data, tagged install links.
2. **Search Console** (you, 10 minutes): submit `https://gofully-extension.vercel.app/sitemap.xml` again, then use URL Inspection → Request indexing for the home page, `/guides/how-to-take-full-page-screenshot-chrome`, `/guides/best-full-page-screenshot-extensions` and `/alternatives`.
3. **Chrome Web Store reviews** (you): installs come mostly from Web Store search, which ranks by rating count, installs and listing text. Ask your first users for a review; five ratings is a small base.
4. **Check the rating** (you): confirm the Store shows 5.0 from 5 ratings. If it changes, update `aggregateRating` in `app/layout.tsx` and the "5.0 on the Chrome Web Store" note on the home page together.
5. **Watch installs by page**: in the Web Store developer dashboard, Analytics → Installs, filter by source `gofully-site` and medium (`home-hero`, `nav`, `guide-…`, `faq`…).

## This month

6. **Move to your own domain** (you buy, I wire it up): for example gofully.app or getgofully.com. This is the biggest single SEO lever: it builds authority you keep, makes links worth earning, and separates the brand from GoFullPage. Keep the vercel.app address redirecting to it permanently (301).
7. **Get links from places people already trust**: finish the free directory submissions (tracker in `store-listing/directories/tracker.csv`), answer screenshot questions on Reddit and Stack Exchange where GoFully truly fits, and add the site link to the GitHub README and Product Hunt page.
8. **Publish the launch video on YouTube** with the Web Store link in the first line of the description. YouTube results show up for "how to take a full page screenshot in Chrome".
9. **Measure speed**: run PageSpeed Insights on mobile for the home page and the top guide; fix anything under "Good".

## Next

10. **Video pages** once the video recorder ships: "screen recorder for Chrome with camera", "record screen without an account", "Loom alternative that stays on your device". Each with a guide and a comparison page.
11. **More comparison pages** for searches with intent to switch: CleanShot X for Chrome, ShareX for Chrome, Lightshot alternative.
12. **Refresh dates** on the top guides when their content changes, so search engines see them as current.
