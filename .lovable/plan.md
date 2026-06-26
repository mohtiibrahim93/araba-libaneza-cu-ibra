## Goal

Slim down the bloated Group card on `ProgramsSection` (and the `/cursuri/grup` landing) by removing the full 6-level pricing breakdown, and surface the relevant pricing **only on each level page** (`/cursuri/grup/a1` … `/cursuri/grup/c2`), next to the curriculum and registration form.

## Changes

### 1. Homepage — `src/components/ProgramsSection.tsx` (Group card)
- Remove the per-level price accordion/table.
- Keep the level pills (A1–C2) as visual chips only, no expandable price rows.
- Show **one** headline price line: "De la 500 LEI/lună online · 700 LEI/lună fizic" (sourced from `pricing.ts`).
- Keep: image, badge, title, 1-line subtitle, 3 bullets, primary CTA, WhatsApp link, "Vezi pagina completă →" link.

### 2. Landing — `src/pages/courses/CursGrup.tsx`
- Keep the level-selection grid (each card links to its level page).
- Each grid card shows a compact price line (online / fizic) — not a full table.
- Remove any standalone "all levels pricing table" if present.

### 3. Level pages — `src/pages/courses/CursGrupLevel.tsx` (NEW pricing block)
- Add a small **pricing card** in the right column, above the sticky registration form:
  - Level name (e.g. "A1 — Începător")
  - Lessons count + total hours (from `curriculum.ts`)
  - Two price rows: **Online** `{onlinePrice} LEI/lună` · **Fizic (la centru)** `{fizicPrice} LEI/lună`
  - Small note: "Plata lunară · Fizic = online +40%"
- All values derived from `src/lib/pricing.ts` — no hardcoded numbers.

### 4. i18n — `src/lib/i18n.tsx`
- Add keys: `pricingOnline`, `pricingFizic`, `pricingMonthly`, `pricingNote`, `pricingLessons`, `pricingHours` (RO + EN).
- Remove now-unused per-level price strings from the homepage card.

## Out of scope
- No changes to Private, Kids, or Online pages.
- No changes to curriculum data, registration form logic, or pricing math.
- No visual restyle of the form or curriculum columns.

## Result
Homepage Group card shrinks to ~400 px (matches Private card). Users who want exact pricing click into the level page, where the price sits right next to the curriculum and the form they're about to fill — higher intent, less noise upfront.
