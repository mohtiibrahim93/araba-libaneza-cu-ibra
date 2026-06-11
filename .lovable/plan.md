# Site Audit Fix Plan

Work is grouped into 4 batches by priority. I'll start Batch 1 immediately after you approve.

---

## Batch 1 — Critical bugs (trust + navigation breakage)
1. **Rename Programs anchor** `id="courses"` → `id="programs"`; rename quiz to `id="quiz"`. Update Hero CTA, Navbar links, MobileEnrollmentCTA, Footer, quiz "back" links.
2. **Fix dead `#inscriere` anchor** in CulturalValueSection → point to `#programs`.
3. **Single source of truth for stats**: use "21 recenzii Preply · 5.0★" everywhere (Hero badge, stats grid, reviews heading, trust pills). Remove "50+" and "100+ cursanți" inflation.
4. **Hero image alt** → "Ibra — instructor de arabă libaneză".
5. **"Vorbitori nativi"** → singular "cu un vorbitor nativ".
6. **Kids format copy** — purge any remaining "Doar online (Zoom)" wording site-wide; align with physical-first / online from age 10.
7. **Group schedule label** — mark "Marți și joi 19:00–20:30" as "A1 (curent)" or move to per-level row.
8. **Navbar duplicate "Cursuri"** — change the red pill to "Înscrie-te" (links to `#programs`).
9. **Capacity copy** when empty — soften to "Grup în formare — primii 4 cursanți confirmă startul" (hide raw 0/10 until taken ≥ 1).
10. **Cookie banner** — convert from card to slim bottom bar so it doesn't cover the floating CTA.

## Batch 2 — UX friction ✅
11. ✅ Quiz section removed from home; lives at `/quiz` route. Inline link in Programs points there.
12. ✅ "de la 500 LEI/lună" added to hero trust badges (replaced redundant reviews badge).
13. ✅ C1/C2 rows in price-table accordion show "în pregătire" tag; per-level view already gates CTA.
14. ✅ Trial CTA promoted to outlined secondary button in hero.
15. ✅ Preply 5.0★ badge added under Ibra's photo.
16. ✅ Slim Preply social-proof strip added below hero.

## Batch 3 — SEO & structured data
17. Title-case + diacritics meta title: "Centrul de Arabă Libaneză cu Ibra — Cursuri Online & București".
18. Add Course + LocalBusiness JSON-LD in Index.tsx Helmet.
19. Add Google Maps embed/link for "Strada Icoanei 80" in contact/footer.

## Batch 4 — Polish
20. Instructor photo: serve 2x WebP at rendered dimensions.
21. Hero trust badges row — better mobile wrap (2x2 grid <sm).
22. Footer — dedupe phone number.
23. Dark-mode AA contrast audit for primary red on dark bg; bump lightness if <4.5:1.

## Technical notes
- Anchor rename is the riskiest step: must grep ALL `#courses` and `#inscriere` usages (Hero, Navbar, Footer, MobileEnrollmentCTA, CulturalValueSection, CTASection, scrollToAnchor calls, sitemap).
- All copy changes go through `src/lib/i18n.tsx` (RO + EN).
- Cookie banner restyle stays inside `CookieConsent.tsx` — no consent-logic changes.
- Quiz collapse (Batch 2) needs your call: remove section vs. move to `/quiz` route — will ask before implementing.

I'll start Batch 1 now once you approve.
