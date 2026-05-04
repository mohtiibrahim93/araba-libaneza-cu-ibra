## Scope

Add the missing items from the mockups, keeping current "Cu Ibra" branding, red accents, and no marketplace/AI features.

---

## 1. Curriculum: extend to C1 + C2 (bookable)

**`src/components/PricingSection.tsx`**
- Extend the level pills and per-level totals from `["A1","A2","B1","B2"]` → `["A1","A2","B1","B2","C1","C2"]`.
- Add 2 new monthly prices to `GROUP_LEVEL_PRICES` (proposed: C1 = 900, C2 = 1000 LEI/month — confirm at implementation, easy to tweak).

**`src/components/RegistrationFormSection.tsx`**
- `LevelType` → adds `"C1" | "C2"`.
- Two new `<SelectItem>` entries for C1 and C2.
- Extend the local `monthly` price map with C1/C2 (matches PricingSection).

**`src/lib/i18n.tsx`** (RO + EN)
- Add `levelC2`, `levelC2Subtitle`.
- Update curriculum copy keys to include modules 13–18 with the exact text from the mockups:
  - C1 "Avansat (Competență Operațională Efectivă)" — Modul 13 Analiză Critică, 14 Literatură & Film, 15 Dialecte (libanez/sirian/iordanian).
  - C2 "Masterat (Aproape Nativ)" — Modul 16 Domenii de Nișă, 17 Traducere, 18 Perfecționare.

**Curriculum display**
- The existing curriculum lives inside `PricingSection`'s level pills/totals (no dedicated accordion component). Add a new lightweight `CurriculumSection.tsx` with an Accordion (we already have `ui/accordion`) listing all 6 levels with their modules — anchored at `#curriculum` so the new hero CTA "Vezi curriculum" can scroll there. Render between `WhySection` and `PricingSection` in `src/pages/Index.tsx`.

---

## 2. New section: "O Perspectivă Mai Largă"

New file **`src/components/CulturalValueSection.tsx`** — 3 cards:
- Conexiunea cu Moștenirea
- Oportunități Profesionale
- Fluență Autentică

CTA button "Începe Călătoria" → `#inscriere`. Inserted in `Index.tsx` between `WhySection` and the new `CurriculumSection`. New i18n keys (RO + EN).

---

## 3. Hero polish

**`src/components/HeroSection.tsx`**
- Keep existing badge, but add a small secondary pill row: "Lecții 1:1 • Online & Fizic" (single instructor — no plural "tutori nativi").
- Add a 4-item trust strip below current 3 stats: ⭐ rating, students, verified instructor, secure payment. Pull from existing testimonial/instructor i18n keys where possible; add new keys for the missing ones.
- No structural rework — same layout, same image, same CTAs.

---

## 4. Footer cleanup

**`src/components/Footer.tsx`**
- Replace Quick Links with: De Ce Noi (`#why`) · Curriculum (`#curriculum`) · Recenzii (`#testimonials`) · Înscrie-te (`#inscriere`).
- Keep all existing real contact info (WhatsApp, email, address) — do NOT use mockup placeholders.
- Add new i18n key `navWhy` if missing.

---

## Files to change

```text
src/components/HeroSection.tsx              edit
src/components/Footer.tsx                   edit
src/components/PricingSection.tsx           edit (+C1, +C2)
src/components/RegistrationFormSection.tsx  edit (+C1, +C2 in select)
src/components/CulturalValueSection.tsx     new
src/components/CurriculumSection.tsx        new
src/pages/Index.tsx                         edit (mount 2 new sections)
src/lib/i18n.tsx                            edit (RO + EN keys)
mem://course/curriculum-levels              update memory (C1/C2 now bookable)
```

No backend/database changes. No edge function changes. No new dependencies.

---

## Out of scope (confirmed)

Tutor marketplace · "Selectează Tutorul Preferat" dropdown · Devino Tutor flow · AI Virtual Tutor · green-only repalette · per-tutor pricing.