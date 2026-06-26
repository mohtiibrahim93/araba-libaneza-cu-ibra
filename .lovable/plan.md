## Phase 7 — Native RO/EN Copy Pass

### Goal
Make every piece of public-facing text sound native in Romanian and natural in English, with no awkward phrasing or leftover hardcoded strings.

### Scope
- `src/lib/i18n.tsx` — full sweep for mixed register, awkward phrasing, and untranslated fallback strings.
- Hero CTA labels — wire dynamic text to `cohort.status` so buttons read correctly (e.g. "Înscrie-te", "Listă de așteptare", "Grup în formare").
- Programs tabs, CohortPicker cards, Footer, Cookie banner, Quiz page, Auth page — verify all strings route through i18n.

### What we will NOT touch
- No new features, no new tables, no new routes.
- No visual design changes (colors, spacing, shadows).

### Deliverable
A single PR that updates `src/lib/i18n.tsx` and any hardcoded UI strings in the scoped components. After merge, the public site reads natively in both languages.

### Estimated effort
3–5 Lovable credits.