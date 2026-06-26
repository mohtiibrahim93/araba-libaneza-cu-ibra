# Curriculum restructure — align site with uploaded CEFR document

## Recommendation

**Option chosen: expand the existing accordion in place (no new pages).** Rationale:
- The doc is hierarchical (level → lessons/blocks) which maps perfectly to a single accordion with richer content. No new routes/SEO surface needed — `#curriculum-a1` deep links already work.
- Dedicated per-level pages would duplicate content (already linked from Programs cards) and burn credits on routing/SEO scaffolding without adding much. Can be added later if analytics show demand.
- Keeps the change frontend-only: data + i18n + one component. Low risk to other sections.

## What changes

### 1. Restructured curriculum data (`src/components/CurriculumSection.tsx`)

Replace the 3-module-per-level shape with per-level objects:

```ts
{ id, title, objective, lessons, hours, track, items: string[] }
```

- **A1 / A2**: `items` = full numbered lesson list (30 / 38 entries).
- **B1 / B2**: `items` = thematic blocks (e.g. "Lessons 2–6 — Verb system consolidation").
- **C1**: two sub-sections — *Spoken core* (38 lessons) + *Writing strand* (20 units, simultaneous), with a short intro paragraph about the two-track choice.
- **C2**: 8 modular blocks + design note; mark as "modular — pick your specialization".

### 2. Header stats row inside each accordion item

Right under the level title (still inside `AccordionContent`, above objective):

```
[30 lecții] · [45 ore] · [Track: Vorbit]
```

Small pill badges using existing `bg-primary/10 text-primary` style. No new components.

### 3. Intro paragraph above the accordion

Add one short paragraph (existing `curriculumDesc` slot or new key) summarizing: 90-min lessons, 2×/week, writing track optional from C1, C2 = academic/specialized Lebanese (not full fuṣḥā). Pulled verbatim from doc's intro.

### 4. i18n — RO + EN

In `src/lib/i18n.tsx`, replace the current `curriculumA1M1/M2/M3` (and same for A2–C2) with:
- `curriculumA1Lessons` (number), `curriculumA1Hours`, `curriculumA1Track`
- `curriculumA1Items` (string[] — lesson list)
- For C1: `curriculumC1SpokenItems[]`, `curriculumC1WritingItems[]`, `curriculumC1TracksIntro`
- For C2: `curriculumC2Blocks` (array of `{ title, items[] }`), `curriculumC2Note`

Both RO (verbatim from doc) and EN (translated). Delete the old `*M1/M2/M3` keys to keep i18n clean.

### 5. Accordion UX tweaks

- Lesson lists are long (30–80 items). Render as a 2-column grid on `sm+` (`grid sm:grid-cols-2 gap-x-6 gap-y-1.5`) to avoid a 30-row scroll wall.
- Keep existing `CheckCircle2` bullet style; reuse current padding/border tokens — no visual redesign.
- C2: render blocks as nested sub-headings (h4) with their item lists underneath.

### 6. Anchors & deep links

Keep existing `#curriculum-a1 … #curriculum-c2` IDs and the hash-open behavior — no changes to `ProgramsSection` / `CursGrup` links.

## Out of scope (not changing)

- No new routes, no per-level pages.
- No changes to `ProgramsSection`, registration form, pricing, or any other section.
- No design token / color / typography changes.
- Curriculum data stays the source of truth for the Group card accordion (preserved).

## Technical notes

- Pure presentation change: one component (`CurriculumSection.tsx`) + i18n strings. No DB, no edge functions, no schema.
- Estimated ~250–400 new i18n strings total across RO+EN (mostly short lesson titles). Single migration-free edit.
- No new dependencies.

## Verification

- Build passes (tsgo).
- Open `/#curriculum-c1` → C1 expands, both tracks visible.
- Language toggle swaps all lesson titles RO ↔ EN.
- Mobile: lesson list stacks single column, readable.
