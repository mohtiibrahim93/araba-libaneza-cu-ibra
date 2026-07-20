## What I'm solving

Only the SEO items surfaced in your pasted text:

1. Homepage is the only page Google sees (pos. 32 for "cursuri araba"); inner pages need on-page SEO to start ranking.
2. English-market opportunity: "Lebanese Arabic" (~880/mo, KD 30) and "learn Lebanese Arabic" (~210/mo, KD 17) are viable, low-competition targets with no dedicated landing page today.
3. Romanian targeting should stay on "cursuri araba" and related broad terms — not "arabă libaneză".
4. Common tutor-vetting questions should be answered on-site to capture question-style queries and build topical authority.
5. Spammy PBN backlinks — action is off-site (disavow file), not code.

## Plan

### 1. Per-route head tags for the top inner pages (react-helmet-async)
Audit which route components already use `<Helmet>`; for those missing it, add a self-referencing `<title>`, `<meta name="description">`, `<link rel="canonical">`, and matching `og:title` / `og:description` / `og:url` for:
- `/cursuri` and each level page (A1, A2, …) — target "curs arabă [level]", "cursuri araba online/fizic"
- `/inscriere` variants — target "înscriere curs arabă"
- Existing blog posts — self-referencing canonical + Article JSON-LD with author = Ibra
- `/copii` (kids) — target "curs arabă copii București"

Anchor Romanian titles/descriptions on "cursuri araba" phrasing (per your Semrush note), not on "arabă libaneză".

### 2. New English landing page: `/en/learn-lebanese-arabic`
Single English route targeting "learn Lebanese Arabic" / "Lebanese Arabic":
- H1 + copy explaining Ibra's method, Lebanese vs MSA, online availability worldwide
- Course/Service JSON-LD, FAQPage schema for the 3–4 top English questions
- `hreflang` pair (`ro` ↔ `en`) on both this page and `/` so Google serves the right locale
- Add to sitemap + internal link from homepage footer

### 3. Expand FAQ with tutor-vetting questions
Add 6–8 Q&As to `FAQSection.tsx` (Romanian) covering the categories from your text — background, methodology, logistics, results, trial lesson — and include them in the existing FAQPage JSON-LD. Mirror the key ones in English on the new landing page.

### 4. Internal linking pass
From the homepage and blog posts, add contextual links to the level pages and the new English page so crawl equity flows inward. Update the navbar/footer to expose the English page.

### 5. Sitemap + robots
Regenerate `public/sitemap.xml` to include the new English route and any level pages missing today. No robots changes.

### 6. Disavow guidance (no code)
I'll prepare a `disavow.txt` you can upload in Google Search Console listing the PBN referring domains (8coint.com, cindylaup.com, toplikevideo.com and the .top/.xyz/.icu set from Semrush). Uploading it is a one-click action you do in GSC — I can't do it for you.

## Out of scope (from your text but not SEO code)
- Earning real editorial links, guest posts, directory submissions — outreach work, not something I implement.
- GA4 analytics reading — that's your dashboard, not the site code.

## Technical notes

- Per-route head requires `react-helmet-async` — already installed per project memory pattern; I'll verify before assuming.
- New `/en/*` route lives client-side; social crawlers see only `index.html` head, so the English landing's `og:*` fallback will still be the Romanian sitewide tags for LinkedIn/Slack previews. Google (JS-executing) reads the per-route tags fine.
- All canonicals self-reference `https://centruldearabalibaneza.com/<path>`.
- No backend changes; no migrations; no edge function redeploys.
