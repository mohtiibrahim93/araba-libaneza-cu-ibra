# From landing page to multi-page course site

You currently have one indexable page (`/`). Splitting Group, Private, and Kids into their own URLs unlocks three things at once: each course can rank for its own keywords, Search Console can show per-page impressions/clicks, and your analytics can show which course pulls the most traffic.

## What is Google Search Console?

Free Google tool (you already verified the site there earlier). It shows, per URL:
- Which Google searches you appear for, how many impressions, how many clicks, average position.
- Indexing status — is the page in Google or not, and why.
- Mobile usability and Core Web Vitals.
- Sitemap submission so Google discovers new pages fast.

Once we ship dedicated course pages, GSC will start reporting them within a few days. That's your "traffic per page" view for organic search.

## Scope

### 1. New course routes (4 dedicated pages)

```text
/cursuri/grup       → Group course (adults)
/cursuri-private    → 1-on-1 course (adults, online/physical)
/cursuri-copii      → Kids course
/cursuri-online     → Online-only landing (cross-cuts the above)
```

Each page contains:
- Hero with course-specific H1, price, format, start date.
- Long-form content: curriculum (CEFR levels), schedule, who it's for, methodology, FAQ subset.
- Cohort picker / inline registration form pre-filled for that course type (reuses existing `RegistrationForm`).
- Per-page `<Helmet>` with unique title, description, canonical, `og:*`, and `Course` JSON-LD.
- Breadcrumb (Home → Cursuri → [course]) with `BreadcrumbList` JSON-LD.

### 2. Trim the homepage

`/` becomes a true overview:
- Hero, social proof, instructor, trust band stay.
- `ProgramsSection` tabs stay but each card becomes a teaser (3–4 bullets + "Vezi detalii →" linking to its dedicated page) instead of holding the full curriculum/price table.
- FAQ trimmed to top 5; full FAQ moves to each course page.

Keeps the homepage scannable, pushes deep content where it can rank.

### 3. Internal linking

- Navbar: replace single "Cursuri" anchor with a dropdown (Grup / Private / Copii / Online).
- Footer: add the 4 course links under a "Cursuri" column.
- Each course page links to the other three at the bottom ("Vezi și…").

### 4. SEO infrastructure

- **sitemap.xml**: add the 4 new routes with weekly changefreq, priority 0.9.
- **robots.txt**: confirm `Sitemap:` directive points at the new sitemap (it does).
- **JSON-LD per course**: `Course` schema with `name`, `description`, `provider`, `offers.price`, `courseMode` (onsite/online), `educationalLevel` (CEFR).
- **Hreflang**: each course page gets `<link rel="alternate" hreflang="ro">` and `hreflang="en">` so Google serves the right language. (Single-URL i18n — we already toggle in-page.)
- **Resubmit sitemap** to Search Console after deploy.

### 5. Per-page analytics

You already have GA4 + Meta Pixel via `tracking.ts` (opt-in). What's missing is **per-route pageview firing** on SPA navigation — currently it only fires on hard load.

- Add a `useRouteAnalytics()` hook in `App.tsx` that calls `gtag('event','page_view', { page_path, page_title })` and `fbq('track','PageView')` on every `useLocation()` change.
- Then in GA4: Reports → Engagement → Pages and screens shows per-page traffic.
- In Search Console: Performance → Pages shows per-URL impressions/clicks/CTR/position.

## File-level breakdown (technical)

| Area | Files | Change |
|---|---|---|
| New pages | `src/pages/CursGrup.tsx`, `CursPrivate.tsx`, `CursCopii.tsx`, `CursOnline.tsx` | New, one per course |
| Shared layout | `src/components/course/CourseLayout.tsx`, `CourseHero.tsx`, `CourseDetails.tsx`, `CourseBreadcrumb.tsx` | New shared building blocks so the 4 pages stay consistent |
| Routing | `src/App.tsx` | Add 4 lazy routes |
| i18n | `src/lib/i18n.tsx` | ~40 new keys (hero titles, meta descriptions, CTAs, breadcrumb labels) per language |
| Homepage trim | `src/components/ProgramsSection.tsx`, `src/pages/Index.tsx` | Cards become teasers with "Vezi detalii →" links; full FAQ moved |
| Nav | `src/components/Navbar.tsx`, `Footer.tsx` | Dropdown / footer column |
| Analytics | `src/lib/tracking.ts`, `src/App.tsx` (new `useRouteAnalytics` hook) | SPA pageview firing |
| SEO | `public/sitemap.xml` | Add 4 entries |
| Helmet | `src/main.tsx` already has `HelmetProvider` — verify | Each new page ships `<Helmet>` |

No DB schema changes. No edge-function changes. `RegistrationForm` is reused as-is with a `defaultCourseType` prop on each page.

## Open questions before I build

1. **URL slugs** — happy with the Romanian slugs above (`/cursuri/grup`, `/cursuri-copii`, etc.) or prefer something different (`/grup-arabic`, `/kids`, English slugs)?
2. **Online page** — is `/cursuri-online` worth a dedicated page (cross-cuts group + private, good for the "arabic online" keyword), or skip it and link to the format toggles on the other pages?
3. **Homepage trimming aggression** — keep the current tabs intact and just add "Vezi detalii →" links, or fully replace with 4 teaser cards (one per course, no tabs)?
4. **Scope of this batch** — do all four items in one go (new pages + SEO + analytics + nav rework), or ship in two passes (pass 1: pages + sitemap + nav; pass 2: analytics + homepage trim)?

Answer these and I'll execute.
