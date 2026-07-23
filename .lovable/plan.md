## Where the English landing page lives

The page **is already built and wired up** — you just haven't seen it because (a) it's not linked from any prominent spot on the homepage, and (b) it may not be published yet.

### How to find it right now

- **URL (once published):** `https://centruldearabalibaneza.com/en/learn-lebanese-arabic`
- **In-app link today:** Footer → "English" column → "Learn Lebanese Arabic"
- **In the sitemap:** yes, listed with hreflang alternates

### Why you don't "see" it
1. Frontend changes only go live after you click **Publish → Update**. If you haven't republished since I added this page, the live domain still 404s on that URL.
2. It's only linked from the footer, so nothing on the homepage points a visitor (or you) at it.

### Proposed fix (small, UI-only)

1. **Add a subtle language switcher / EN entry point in the Navbar** — a small "EN" link next to the existing nav items that goes to `/en/learn-lebanese-arabic`. Mirrors what most bilingual sites do and makes the English page discoverable to real visitors, not just crawlers.
2. **Verify the page renders as described** by opening `/en/learn-lebanese-arabic` in the preview after publish — confirm:
   - `<html lang="en">`, self-canonical
   - H1 "Learn Lebanese Arabic online with a native teacher"
   - 6 FAQ items (dialect vs MSA, timeline, alphabet, online, teacher, pricing)
   - Course + FAQPage JSON-LD in the head
3. **Publish** so the URL becomes reachable on `centruldearabalibaneza.com`.

### Technical notes
- File: `src/pages/en/LearnLebaneseArabic.tsx` (already exists, 215 lines, all the schema + Q&As described).
- Route: `src/App.tsx` line 131 (already registered).
- Sitemap entry: `public/sitemap.xml` line 50 (already present).
- Only new edit needed: add one nav link in `src/components/Navbar.tsx`.

No backend, no data, no SEO regressions — just discoverability + publish.
