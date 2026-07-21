## Goal

Rank across every Romanian course-intent term (not just "cursuri araba") and expand the English footprint from "Lebanese Arabic" up to "Levantine Arabic" (2× volume) and "Arabic tutor" (easy win), plus capture question-style searches with authoritative dialect-family content built from your expertise.

## Romanian — new landing pages (target one keyword cluster each)

Uses the existing `LandingLayout` chrome (already used by `/cursuri-araba`, `/araba-online`, `/araba-pentru-incepatori`). Each page = self-canonical, Course + BreadcrumbList + FAQPage JSON-LD, breadcrumb, EN link, trial CTA.

| Route | Primary keyword | Secondary keywords |
|---|---|---|
| `/cursuri-limba-araba` | cursuri limba araba (260) | cursuri de limba araba (170), limba araba (210) |
| `/meditatii-araba` | meditatii araba (260) | meditatii limba araba, profesor araba |
| `/invata-araba` | invata araba (140) | cum sa inveti araba, invata limba araba |
| `/cursuri-araba-bucuresti` | cursuri araba bucuresti (20, very easy) | scoala araba bucuresti, profesor araba bucuresti |
| `/curs-araba-copii` | curs araba copii | cursuri araba pentru copii, araba copii bucuresti |

Copy angle per page matches the search intent (formal wording for "limba araba" pages, 1:1 tutoring angle for "meditatii", beginner/how-to for "invata araba", local proof + address for the Bucharest page, kids-specific for the copii page). Each internally links to `/cursuri`, the relevant `/cursuri/*` format page, and 1–2 blog posts.

Homepage strategy: keep `/` targeting the brand + "cursuri araba libaneza"; add contextual internal links from hero/programs/footer to the new RO landing pages so crawl equity flows in.

## English — expand beyond "Lebanese Arabic"

1. **Rework `/en/learn-lebanese-arabic`** to also naturally include "Levantine Arabic" (H2: "Lebanese is North Levantine Arabic — here's how the family fits together"), so one page can rank for both without splitting authority.
2. **New `/en/learn-levantine-arabic`** — dedicated page targeting "Levantine Arabic" (1,900/mo, KD 35). Explains North Levantine (Lebanon, Syria) vs South Levantine (Jordan, Palestine), border overlap (Tripoli ↔ Syria, southern Lebanon ↔ Palestine), and why learning Lebanese gets you ~90% of Levantine comprehension. Canonical self-references; hreflang pair with a future RO equivalent (or `x-default` to `/`).
3. **New `/en/arabic-tutor`** — targets "Arabic tutor" (480/mo, KD 12). 1:1 positioning, Ibra's credentials, online worldwide + Bucharest in-person, trial CTA. Links to `/en/learn-lebanese-arabic` and `/en/learn-levantine-arabic`.
4. **New `/en/arabic-dialects-guide`** — pillar page for the whole taxonomy you described. Captures "is lebanese arabic", "do lebanese speak arabic", "arabic dialects", "levantine vs egyptian arabic" style queries. Structure:
   - Levantine (North: LB, SY · South: JO, PS · border overlap notes)
   - Egyptian–Sudanese
   - Maghrebi (Libya → Mauritania; Tunisia as transitional)
   - Peninsular (Gulf subgroup: UAE, Kuwait, Bahrain, Qatar · Saudi · South Arabian: Yemen, Oman)
   - Mesopotamian (Iraq + border areas)
   - Peripheral Arabic-official (Chad Arabic ≈ Libyan; Djibouti, Somalia, Comoros — noted as unclear classification, likely South Arabian influence via historical Yemeni/Omani presence)
   - MSA vs dialects
   FAQPage JSON-LD covering the top question queries. Internally links to `/en/learn-levantine-arabic` and `/en/learn-lebanese-arabic`.

Framing on the dialects guide flags Djibouti/Somalia/Comoros classification as debated (matches your uncertainty) so we don't overstate.

## Sitemap, hreflang, internal linking

- Add all new routes to `public/sitemap.xml`.
- Add hreflang pairs where a natural RO↔EN twin exists (`/cursuri-araba` ↔ `/en/learn-lebanese-arabic`; leave the dialects guide EN-only with `x-default` → `/`).
- Update `Footer.tsx` with a compact "Cursuri" column linking the 5 new RO pages, and an "English" column linking the 4 EN pages.
- Add 2–3 contextual internal links from the existing homepage sections (WhySection / CurriculumSection) into the new RO pages.

## Out of scope

- No new blog posts this round (landing pages come first — they convert; blog can follow).
- No robots.txt changes, no backend, no migrations, no edge functions.
- Disavow file already exists at `public/disavow.txt` — upload is still a manual GSC action on your side.

## Technical notes

- All new pages use `react-helmet-async` via the existing `LandingLayout` (RO) / a mirrored `EnLandingLayout` (EN) so per-route title/description/canonical/og:* ship correctly for JS-executing crawlers. Sitewide `og:*` in `index.html` stays as fallback for social crawlers.
- No changes to `index.html` sitewide tags.
- Client-side routing only; social previews for new pages will still fall back to the Romanian sitewide og until SSR is added (unchanged from current setup).
- Total: ~9 new page files, 1 new EN layout, 3 edits (App.tsx routes, Footer.tsx, sitemap.xml).
