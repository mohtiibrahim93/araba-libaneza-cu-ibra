
# Plan: cursuri restructure + form fixes

Scope is intentionally narrow — only the items you listed. No changes to other sections, no DB schema changes (cohorts already keyed by `cohort_kind` / age, we reuse what exists).

---

## 1. New `/cursuri` overview page (in the style of the screenshot)

Replace the current `/cursuri` redirect / placeholder with a real landing page:

```
Acasă > Cursuri
[Hero badge] Programele noastre
H1: Cursurile noastre de Arabă Libaneză
Sub: format online & fizic · grup sau 1:1
[CTA: Alege tipul de curs] [WhatsApp]
[Hero image]

── Alege publicul ──
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ADULȚI (18+) │ │ TINERI 11–17 │ │ COPII 6–10   │
│ Grup · 1:1   │ │ Grup · 1:1   │ │ Grup · 1:1   │
│ Vezi →       │ │ Vezi →       │ │ Vezi →       │
└──────────────┘ └──────────────┘ └──────────────┘

── Sub: cele 3 carduri din screenshotul actual ──
(Grup / Private / Copii — păstrate ca shortcut-uri rapide)

FAQ scurt + CTA WhatsApp
```

The 3 audience cards are the primary entry. The 3 program cards stay below as secondary, matching your "apoi opțiunea ca-n screenshot".

## 2. Age bracket model (Copii 6–10 / Tineri 11–17 / Adulți 18+)

Routes:
- `/cursuri/adulti` → hub for adulți (Grup + Private 1:1)
- `/cursuri/tineri` → hub for tineri 11–17 (Grup + Private 1:1)
- `/cursuri/copii` → hub for copii 6–10 (Grup + Private 1:1) — **rename current page semantics**
- Existing `/cursuri/grup`, `/cursuri/grup/:level`, `/cursuri/private` stay, but Private becomes adults-only (see §3).

Sub-routes for each audience hub (when needed):
- `/cursuri/adulti/grup` (= existing `/cursuri/grup`)
- `/cursuri/adulti/private` (= existing `/cursuri/private`)
- `/cursuri/tineri/grup`, `/cursuri/tineri/private`
- `/cursuri/copii/grup`, `/cursuri/copii/private`

To avoid route duplication, the "audience" pages render the same Grup/Private components with a `track` prop (`adulti | tineri | copii`) that pre-fills the form and filters cohorts by `cohort_kind` / age range.

i18n: add `trackAdulti`, `trackTineri`, `trackCopii` labels in `src/lib/i18n.tsx` (RO/EN).

## 3. Fix `/cursuri/private` form scope + pricing

Currently the form shows `Tip curs` with Grup/Private/Copii. On a "Lecții Private adulți" page that's wrong.

Changes in `src/components/RegistrationFormSection.tsx` + `RegistrationForm/`:
- Add prop `lockCourseType?: boolean` (already exists pattern via `defaultCourseType`). When embedded on `/cursuri/private` we hide `Tip curs` entirely — it's locked to `private`.
- On `/cursuri/private` the only audience-relevant field is `Format (online/fizic)` and `Plan de plată`. No age toggle (adults only — copiii 1:1 stay on `/cursuri/copii`).
- Pricing copy: **150 LEI / lecție 90 min (online)**, **210 LEI / lecție 90 min (fizic)**. Update `src/lib/pricing.ts` so the unit label says "90 min" instead of just "lecție", and confirm `physicalPrice(150) = 210` (round10 of 150*1.4 = 210 ✓).
- Same hidden-`Tip curs` treatment for `/cursuri/grup` (locked to `group`) and `/cursuri/copii` (locked to `kids`). Each page's form shows only the fields relevant to that course type.

## 4. Copii form = only Copii (Grup + 1:1)

On `/cursuri/copii` the form currently lets the user pick adult options. Lock `courseType = kids`, then show a sub-toggle **Grup copii / 1:1 copii** inside the form (since both are valid for copii). Pricing for copii 1:1: 150 online / 210 fizic per 90 min (same as adults — confirm with you below if different).

## 5. Phone & email validation

Add a zod schema to `LeadFields.tsx`:

- **Phone**: accept `+40 7XX XXX XXX`, `07XX XXX XXX`, or any valid E.164 (`^\+[1-9]\d{6,14}$`). Strip spaces before validating. Reject `+40 1234` etc.
- **Email**: zod `.email()` plus blocklist for obvious junk (`noreply@`, `no-reply@`, `test@test`, missing TLD). Display inline error under the field; submit button disabled until both valid.

Server-side: extend the same regex check in `notify-registration` and `booking-create` edge functions (defense in depth — your repo already has length limits there).

## 6. Back link on level pages (and other deep pages)

`/cursuri/grup/:level` (and any future `/cursuri/{track}/private` deep page) gets a sticky-ish top link:

```
← Înapoi la cursuri
```

Implemented in `CourseLayout.tsx` as an optional `backLink={{ to, label }}` prop rendered above the breadcrumb on mobile, inline with breadcrumb on desktop. The "Vezi pagina completă" link on the homepage Group card stays but its label changes to **"Vezi toate cursurile de grup →"** (your wording).

## 7. Files touched

- `src/App.tsx` — add `/cursuri`, `/cursuri/adulti`, `/cursuri/tineri` routes (copii route already exists).
- `src/pages/courses/Cursuri.tsx` *(new)* — overview page.
- `src/pages/courses/CursAdulti.tsx`, `CursTineri.tsx` *(new)* — audience hubs.
- `src/pages/courses/CursCopii.tsx` — adjust to new age bracket (6–10) + lock form to kids.
- `src/pages/courses/CursPrivate.tsx` — adults-only copy, hide Tip curs, update price line to "150 / 210 LEI · 90 min".
- `src/pages/courses/CursGrup.tsx`, `CursGrupLevel.tsx` — lock form to group, rename CTA, add back link via `CourseLayout`.
- `src/components/course/CourseLayout.tsx` — `backLink` prop.
- `src/components/RegistrationFormSection.tsx` + `RegistrationForm/LeadFields.tsx`, `PrivateFields.tsx`, `KidsFields.tsx`, `GroupFields.tsx` — `lockCourseType`, zod phone/email validation, kids sub-toggle.
- `src/lib/pricing.ts` — unit label "90 min".
- `src/lib/i18n.tsx` — new strings (RO + EN) for tracks, back link, validation errors, new page copy.
- `src/components/Navbar.tsx` — "Cursuri" dropdown updated with the 3 audience entries.
- `supabase/functions/notify-registration/index.ts`, `booking-create/index.ts` — server-side phone/email regex.

## 8. Out of scope (explicitly not touched)

- No changes to homepage sections other than the Group card link label.
- No DB migrations. Cohort filtering by age uses existing `cohort_kind` and metadata; if `tineri` needs a new kind, that's a follow-up I'll flag separately rather than do silently.
- No design overhaul — reuse `CourseLayout` shell, same tokens, same shadcn primitives.

---

**Open question before I build (1 only):** Pentru **Tineri 11–17 Grup**, refolosim cohortele actuale "adulți" sau vrei cohorte separate? Dacă vrei separate, e o migrare mică (`cohort_kind = 'teens'`) — confirmă și o adaug la plan; altfel îi grupez cu adulții (cum sunt acum) și marchez ca follow-up.
