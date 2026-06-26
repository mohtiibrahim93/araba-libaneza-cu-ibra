# Launch-Ready Checklist — Arabă Libaneză cu Ibra

Consolidated todo derived from `.lovable/plan.md` (Phases 0–8) + the most recent gap audit. Phases 0, 1, 2 are already shipped — listed here only as "done" reference.

---

## Already shipped ✅
- **Phase 0** — Hygiene: removed hardcoded counters, mobile cookie banner above CTA, env audit clean.
- **Phase 1** — Status vocabulary (`lead_status` ×7), `group_cohorts.status`, `track_preference`, `source`, new tables `locations` / `tutors` / `course_requests`, admin status select.
- **Phase 2** — Counters gated to `qualified + converted`, public `get_group_capacity_counts` RPC, cohort `status` drives UI with dual-write to `is_active`, color-coded cohort badges.

---

## Still to do — ordered by value/credit

### 1. Phase 7 — Native RO/EN copy pass *(quick win, 3–5 cr)*
- Sweep `src/lib/i18n.tsx` for awkward phrasing, mixed register, leftover hardcoded strings.
- Wire dynamic CTA labels to `cohort.status` (e.g. "Înscrie-te" vs "Listă de așteptare" vs "Grup în formare").
- Verify Hero, Programs tabs, CohortPicker, Footer, Cookie banner, Quiz, Auth page.

### 2. Phase 6 — Track selector (Arabizi vs Script) *(6–9 cr)*
- New `<TrackSelector>` in `RegistrationForm`.
- Persist to `registrations.track_preference` + show on admin table.
- Surface result of `/quiz` so it pre-selects the track on the form.
- Display track badge on cohort cards.

### 3. Phase 3 — WhatsApp lead workflow *(8–11 cr)*
- Migration: `whatsapp_status`, `follow_up_due_at`, `notes` on registrations.
- Edge function actions: `add_whatsapp_lead`, `mark_replied`, `mark_no_reply`.
- Admin `<AddLeadDialog>` + filters + due-date column in `RegistrationsTable`.
- Admin notification when a WhatsApp lead is overdue.

### 4. Phase 8 — Admin polish & tech-debt *(10–14 cr)*
- Fix `PrivateStatus.tsx` regression (terminal statuses render empty progress).
- Archive-vs-delete: `archived_at` column, edge function archive action, disable destructive delete (§29/§44).
- Unified lead detail view (§39) shared by Group + Private.
- Admin dashboard summary cards (§28): leads by status, cohort fill %, this-week funnel.

### 5. Phase 4 — Public course-request form + admin clustering *(9–13 cr)* — optional, only if demand signals
- Public `<RequestForm>` writing to `course_requests`.
- Admin cluster view (group requests by level/track/city) + "convert cluster to cohort" action.

### 6. Phase 5 — Structured schedule + locations + `/schedule` page *(12–16 cr, most expensive)* — last
- Back-fill `schedule_label` into structured day/time/location fields.
- Public `<CurrentGroupsSection>` on homepage + dedicated `/schedule` route.
- `<LocationBadge>` reading from `locations` table.
- Admin cohort editor uses structured fields, drops free-text `schedule_label`.

---

## Cross-cutting pre-launch QA (run after Phase 7)
- Re-run `docs/PRODUCT_QA_STANDARD.md` §51 scenarios end-to-end.
- Lighthouse pass (mobile): LCP < 2.5 s, no CLS on Hero, image dimensions present.
- Verify SEO: title casing, JSON-LD LocalBusiness + Course, sitemap submitted in GSC ✅, no duplicate `#programs` / `#quiz` IDs.
- Verify analytics opt-in: GA4 + Pixel only after cookie consent; `<noscript>` Pixel at start of `<body>`.
- Test all 4 Program CTAs → form opens with correct `courseType` / `format` / `lessonType`.
- Test `/auth` Google sign-in + `/admin` gating.
- Mobile: cards stack, price table scrolls, cookie bar doesn't cover sticky CTA.
- Dark mode contrast check on red accent.

---

## Budget snapshot
- Path A (must-ship): Phases 7 + 6 + 3 + 8 = **~27–39 credits**
- Path B (full plan): + 4 + 5 = **~48–68 credits**
- Recommendation: ship Path A, then decide on 4/5 based on real demand.

## Suggested next action
Start with **Phase 7** (cheapest, finishes what's already shipped) so the public surface reads natively before adding more features.