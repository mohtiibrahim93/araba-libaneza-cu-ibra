## Restructure: course pages, level pages, pricing

### 1. Centralize pricing — `src/lib/pricing.ts` (new)

Single source of truth. Online prices stored; physical auto-derived = `round(online × 1.4)` to nearest 10.

```ts
export const ONLINE_PRICES = {
  groupMonthly: { A1: 500, A2: 600, B1: 700, B2: 800, C1: 900, C2: 1000 },
  privateLesson: 150,                  // → fizic 210
  kidsPrivateLesson: 150,              // → fizic 210
  kidsGroupMonthly: 500,               // → fizic 700 (min 4 kids)
};
export const physical = (online: number) => Math.round(online * 1.4 / 10) * 10;
export const formatPrice = (online: number, format: "online"|"fizic") =>
  format === "fizic" ? physical(online) : online;
```

Replace every hardcoded `150 / 210 / 500 / 700 / 800` literal in `ProgramsSection.tsx`, `i18n.tsx` price strings, `quiz`, `compare*`, `PrivateFields`, `GroupFields`, `KidsFields`, `coursePrivatePriceLine`, `courseGrupPriceLine`, etc. with `formatPrice()` + i18n templates `{onlinePrice}/{physicalPrice}`.

Show both prices everywhere a course is shown:
> Online: 150 LEI · Fizic: 210 LEI (+40%)

### 2. Course landing pages — simplify (remove embedded form)

These become **descriptions only**, not registration screens.

**`/cursuri/grup`** — description + “Choose your level” grid (A1…C2 cards linking to `/cursuri/grup/[level]`) + “Don't know your level?” block with 3 actions: take quiz (`/quiz`), book test at center (`/trial`), WhatsApp.

**`/cursuri/private`** — description, pricing (online 150 / fizic 210), copy: *“We test your level and personalize for your goals (travel, family, work). If you need Modern Standard Arabic instead of Lebanese, we recommend trusted partners — same pricing.”* + single inline registration form (no level chooser — handled in intake).

**`/cursuri/copii`** — description + two format cards:
- *Private 1:1* — 150 online / 210 fizic, any age
- *Group (min 4)* — 500/mo online (from age 10) / 700/mo fizic at center, any age
+ single registration form.

**`/cursuri/online`** — keep as thin landing: short intro (“Every course is available online”) + links to grup / private / copii. No form.

### 3. New per-level pages — `/cursuri/grup/:level` (a1…c2)

New file `src/pages/courses/CursGrupLevel.tsx` (one component, reads `:level` param). Layout:

```text
┌─────────── Hero: "Nivel A1 — Începător" ──┐
│ Objective · Lessons · Hours · Track       │
├──────────────────┬────────────────────────┤
│ FULL curriculum  │  Registration form     │
│ (all items from  │  (defaultCourseType=   │
│  curriculum.ts:  │   group, defaultLevel= │
│  items / spoken+ │   A1, defaultFormat    │
│  writing / blocks│   chooser online|fizic │
│  for C1/C2)      │   with live price)     │
└──────────────────┴────────────────────────┘
```

- Pulls level data straight from `src/data/curriculum.ts` (already complete) — renders `items`, `spokenCore + writingStrand` for C1, `blocks` for C2. No truncation.
- Price block reacts to format toggle.
- Pre-fills `RegistrationFormSection` with `defaultCourseType="group"` + new `defaultLevel` prop.
- Routes added in `App.tsx`. Sitemap entries added.
- `CurriculumSection` on the homepage keeps its accordion preview (unchanged) but each level’s “Vezi tot →” deep-links to `/cursuri/grup/[level]#register`.

### 4. Navbar / dropdown / homepage links

- “Cursuri” dropdown gets a nested “Grup” submenu listing A1–C2 (or a single “Curs de grup” item + the level grid lives on the page).
- Homepage Programs tabs “Vezi pagina completă →” links unchanged.
- Footer “Cursuri” unchanged.

### 5. i18n additions

New keys (RO/EN): `chooseYourLevel`, `dontKnowYourLevel`, `takeQuiz`, `bookTestAtCenter`, `partnersMsaNote`, `formatOnline`, `formatFizic`, `priceOnlineLabel`, `priceFizicLabel`, `physicalSurcharge`, per-level meta titles/descriptions, level-page register heading.

Delete now-unused: `kidsPhysicalOnly` (replaced by new copy), `pricingGroupLevelPrices` literal, etc. — only after grep confirms no other usage.

### 6. Files

**New**
- `src/lib/pricing.ts`
- `src/pages/courses/CursGrupLevel.tsx`
- (route added to `App.tsx`, 6 paths)

**Modified**
- `src/pages/courses/CursGrup.tsx` — remove `<RegistrationFormSection>`, add level grid + “don’t know” block
- `src/pages/courses/CursPrivate.tsx` — add partners/MSA copy, dual pricing
- `src/pages/courses/CursCopii.tsx` — add format cards (private 1:1 vs group min 4), dual pricing
- `src/pages/courses/CursOnline.tsx` — strip down to thin landing
- `src/components/RegistrationFormSection.tsx` + `RegistrationForm/GroupFields.tsx` — accept `defaultLevel`, hide level chooser when fixed
- `src/components/ProgramsSection.tsx` — use `formatPrice()`, dual-price display, level CTAs link to `/cursuri/grup/[level]`
- `src/lib/i18n.tsx` — new/updated keys (RO + EN)
- `src/components/Navbar.tsx` + `Footer.tsx` — links
- `public/sitemap.xml` — add 6 level URLs

**Untouched**
- `src/data/curriculum.ts` (already complete from your DOCX)
- Admin, booking, payments, edge functions, DB schema

### Out of scope (call out, do not change)
- Stripe price objects — still amount-from-frontend; if you want server-trusted pricing later, that’s a separate pass.
- Kids age gating in form logic (online ≥10) — only copy change in this pass unless you ask for hard validation.
