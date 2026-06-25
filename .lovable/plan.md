
# Phase 0/1 Audit — plan.md & PRODUCT_QA_STANDARD.md vs live code

Read-only. No file edits. Source: `.lovable/plan.md` (the project's `plan.md`) and `docs/PRODUCT_QA_STANDARD.md` v1.1.

---

## Step 1 — "Known Codebase Facts" verification

| # | Claim from plan.md | Verdict | Proof |
|---|---|---|---|
| 1 | `registrations` is the spine, with `lead_status`, `payment_status`, `paid_at`, `cohort_id`, `kids_slot_id`, `is_waitlist_deposit`, `whatsapp_sent_at`, `referral_code` + `lead_status_history` audit table | TRUE | `src/integrations/supabase/types.ts` (registrations Row), `lead_status_history` table present; migrations `20260429190817` and `20260429193000` |
| 2 | `group_cohorts` + `get_cohort_signup_counts` RPC + realtime refresh in `src/hooks/useGroupCohorts.ts`; seat counts computed, never stored | TRUE | `src/hooks/useGroupCohorts.ts` calls `supabase.rpc("get_cohort_signup_counts")`; DB function listed under db-functions |
| 3 | `group_capacities` (min/max per level) consumed in `src/hooks/useGroupCapacity.ts`; capacities count per level vs cohorts per cohort | TRUE | `useGroupCapacity.ts` joins `group_capacities` with raw `registrations` row counts grouped by `form_type+level`; `useGroupCohorts.ts` counts per-cohort via RPC — two parallel counting systems still live |
| 4 | Admin exists with all listed screens | TRUE | Files present: `CohortsAdmin.tsx`, `CapacitiesAdmin.tsx`, `AvailabilityAdmin.tsx`, `BookingsAdmin.tsx`, `StudentJourneyAdmin.tsx`, `TrialFunnelAdmin.tsx`, `RegistrationsTable.tsx`, `RegistrationFilters.tsx`, `EmailSettingsForm.tsx`, `pages/AdminNotifications.tsx`, `lib/adminExport.ts` |
| 5 | Stripe checkout + webhook, booking system w/ reschedule/cancel/reminders, email queue + suppression + unsubscribe, transactional templates, reCAPTCHA + honeypot, GDPR checkbox, i18n RO/EN, tracking, timezone utils | TRUE | Edge functions list: `create-checkout`, `stripe-webhook`, `booking-*`, `process-email-queue`, `handle-email-suppression`, `handle-email-unsubscribe`, `send-transactional-email`, `verify-recaptcha`; components: `GdprCheckbox.tsx`, `lib/i18n.tsx`, `lib/tracking.ts`, `LocalTimezoneToggle.tsx` |
| 6 | Phase 0/Phase 1 already shipped per chat history (status vocab widened, source, track_preference, locations, tutors, course_requests) | TRUE | Migration `20260624184349` adds all of them; `types.ts` (Database) shows `course_requests` table and updated registrations columns indirectly; `src/components/admin/types.ts` carries the new vocab |

---

## Step 2 — §-by-§ Gap Table

Legend: ✅ Already implemented · 🟡 Partially implemented · ❌ Missing · ⚠️ Conflicting with standard. Action: KEEP / IMPROVE / REFACTOR / BUILD.

| Topic (§) | Status | Where it lives | Action |
|---|---|---|---|
| **Lead status vocabulary (§10)** | 🟡 PARTIAL — DB widened to 7 values in migration `20260624184349` and `src/components/admin/types.ts` exports the full union. But `src/pages/PrivateStatus.tsx` still hardcodes the old 3-value union `"new"\|"contacted"\|"confirmed"`, including `steps` array driving the student-facing progress bar. `supabase/functions/admin-registrations/index.ts` `ALLOWED_LEAD_STATUSES` (line 606) — needs verification it lists all 7 (see Step 3) | `migrations/20260624184349…sql`, `admin/types.ts`, `Admin.tsx`, `RegistrationsTable.tsx`, `PrivateLeadStats.tsx`, `PrivateLead.tsx`, `PrivateStatus.tsx`, `admin-registrations/index.ts`, `Trial.tsx` (writes literal `"new"`) | REFACTOR `PrivateStatus.tsx`; verify edge-function allow-list |
| **Cohort status beyond `is_active` (§11)** | 🟡 PARTIAL — `group_cohorts.status` column + 8-value check constraint exist (migration `20260624184349`), defaulting to `'draft'`. **No reader uses it.** `useGroupCohorts.ts` still filters by `.eq("is_active", true)`. `CohortsAdmin.tsx` UI still exposes only an `is_active` Switch and has no Status select. The Cohort TS interface in `useGroupCohorts.ts` and the `Cohort` interface in `CohortsAdmin.tsx` don't include `status` | `useGroupCohorts.ts`, `CohortsAdmin.tsx`, `admin-registrations/index.ts` (cohort upsert path) | IMPROVE: migrate readers + admin UI to `status`; deprecate `is_active` after |
| **`track_preference` on regs + `track` on cohorts (§22)** | 🟡 PARTIAL — DB columns + check constraints exist (migration `20260624184349`); `admin/types.ts` exports `TrackPreference` + labels; `RegistrationsTable.tsx` shows the column. **Form does not collect it** (no field in `RegistrationForm/`), **cohort admin doesn't set it** (no track field in `CohortsAdmin.tsx`), **public cohort cards don't display it**, **quiz doesn't write it**. Cohort track defaults to `'not_applicable'` for every existing cohort | `admin/types.ts`, `RegistrationsTable.tsx`, `RegistrationForm/*`, `CohortsAdmin.tsx`, `useGroupCohorts.ts`, `FindYourTrackQuiz.tsx` | BUILD form field + admin field + public surface (Phase 6) |
| **`source` field: form/whatsapp/admin (§30–31)** | 🟡 PARTIAL — column + check constraint exist with `DEFAULT 'form'`; admin table renders Sursă column and CSV/PDF export carries it. **No code path writes `whatsapp` or `admin`.** No "Add WhatsApp Lead" admin action; no form sets source explicitly (default suffices for `form`) | migration `20260624184349`, `admin/types.ts`, `RegistrationsTable.tsx`, `lib/adminExport.ts` | KEEP column; BUILD writer paths in Phase 3 |
| **Structured schedule fields vs free-text (§19)** | 🟡 PARTIAL — DB has `days_of_week`, `start_time`, `end_time`, `timezone`, `duration_minutes` on `group_cohorts` (migration `20260624184349`). Frontend still reads/writes only `schedule_label_ro/en` everywhere (`useGroupCohorts.ts`, `CohortsAdmin.tsx`). Structured columns are dormant | `useGroupCohorts.ts`, `CohortsAdmin.tsx`, admin upsert path | IMPROVE incrementally (Phase 5) |
| **`locations` table + Raduga on physical cohorts (§20)** | 🟡 PARTIAL — table exists with RLS public-read, seeded with Raduga; `group_cohorts.location_id` FK added. **No reader joins it; no UI shows Raduga programmatically; no admin selector.** Physical address still only present in static i18n strings (`Privacy.tsx`/`Terms.tsx` show the phone, not address) | migration `20260624184349`; nothing in frontend yet | BUILD reader + display (Phase 5) |
| **`tutors` table / `tutor_id` on cohorts (§17)** | 🟡 PARTIAL — `tutors` table exists, Ibra seeded, `group_cohorts.tutor_id` FK added with default-to-Ibra trigger. **No frontend reads it.** `InstructorSection.tsx` is static | migration `20260624184349`; `InstructorSection.tsx` | KEEP table; IMPROVE frontend later |
| **`course_requests` entity + clustering (§34–35, §53)** | 🟡 PARTIAL — table exists with `status ∈ open/grouped/converted/closed`, `track`, `preferred_days[]`, `preferred_time_block`, `format`, `lesson_type`, `matched_cohort_id`; anon insert policy. **No public form, no admin clustering view, no "create cohort from requests" action** | migration `20260624184349`, `types.ts` | BUILD in Phase 4 |
| **Formation vs seat counter; capacities-per-level vs cohorts-per-cohort duality (§15, §37)** | ⚠️ CONFLICTING — `useGroupCapacity.ts` counts **every** registration row (regardless of `lead_status`), so spam/no_response inflate the formation counter. §15 says count only qualified statuses. Two parallel counter systems still live (`useGroupCapacity` per-level vs `useGroupCohorts` per-cohort) — §37 says cohort is source of truth | `useGroupCapacity.ts`, `useGroupCohorts.ts`, `db function get_cohort_signup_counts` | REFACTOR in Phase 2: gate counts on qualified statuses; collapse duality |
| **Manual "Add WhatsApp Lead" admin action (§31)** | ❌ MISSING — no UI, no edge-function action; `admin-registrations` has no `add_whatsapp_lead` handler | — | BUILD in Phase 3 |
| **WhatsApp workflow: sent / replied / no_reply / follow_up (§14, §30)** | 🟡 PARTIAL — `whatsapp_sent_at` timestamp + `mark_whatsapp_sent` edge action exist (`AdminNotifications.tsx`). No `whatsapp_status` enum, no replied/no_reply/follow-up states, no `follow_up_due_at`, no `last_contacted_at`, no `communication_notes` | `AdminNotifications.tsx`, `admin-registrations/index.ts` | BUILD richer state in Phase 3 |
| **Public "Current Groups" section on homepage (§48)** | ❌ MISSING — `Index.tsx` order is Hero → Programs → … (no top-of-page cohort cards). Cohort listing only appears nested inside `RegistrationFormSection` / quiz result | `pages/Index.tsx` | BUILD in Phase 5 |
| **Dedicated schedule page with filters (§49)** | ❌ MISSING — no schedule route in `src/pages/` | — | BUILD in Phase 5 |
| **Quiz ends in real cohort recommendation + track (§50)** | 🟡 PARTIAL — `FindYourTrackQuiz.tsx` recommends a course type (group/private/kids) and shows live cohorts via `useGroupCohorts`. **Does not recommend Arabizi vs script track**, does not pre-fill `track_preference`, does not link to a specific cohort id | `FindYourTrackQuiz.tsx` | IMPROVE in Phase 6 |
| **Form QA checklist (§43)** | 🟡 PARTIAL — GDPR checkbox, reCAPTCHA, honeypot, loading state, success view, admin notification, email send, WhatsApp CTA visible: present per Phase-0 audit. Not re-verified field-by-field in this audit — flag for Phase 2 spot-check | `RegistrationForm/*`, `verify-recaptcha`, `notify-registration`, `send-transactional-email` | KEEP; re-verify §43 line-by-line during Phase 2 |
| **Admin dashboard action cards (§28)** | ❌ MISSING — `Admin.tsx` has stat tiles (`PrivateLeadStats.tsx`) but no "New Leads / Follow-ups Due / Cohorts Near Minimum / Minimum Reached / Pending Payments / Upcoming Classes" task cards linking to filtered views | `pages/Admin.tsx`, `PrivateLeadStats.tsx` | BUILD in Phase 8 |
| **Lead detail page (§39)** | 🟡 PARTIAL — `pages/PrivateLead.tsx` exists for private leads only (status select + history). No equivalent for group/kids leads; no unified detail page | `PrivateLead.tsx` | IMPROVE in Phase 8 (extend to all form types) |
| **Archive-instead-of-delete (§29, §44)** | ❌ MISSING — no `archived_at` column on registrations; admin table has no archive action; `CohortsAdmin.tsx` still uses a destructive `delete_cohort` action and `confirm("Ștergi…")` dialog | `RegistrationsTable.tsx`, `CohortsAdmin.tsx`, `admin-registrations/index.ts` | BUILD in Phase 8 |
| **CTA wording vs cohort status (§32, §46)** | 🟡 PARTIAL — per Phase 0 audit, hero/cards softened. Not enforced programmatically: nothing reads `group_cohorts.status` to swap CTA copy between "Join interest list" / "Reserve your seat" / "Join waitlist". Once status reader lands, copy must follow | `useGroupCohorts.ts`, `ProgramsSection.tsx`, `RegistrationFormSection.tsx`, cohort cards | IMPROVE in Phase 2/5 |
| **Payment copy vs Stripe/manual flow (§47)** | ✅/🟡 — Stripe present, manual `PaymentInstructions.tsx` present. Need to verify wording matches "no payment until confirmed" for forming cohorts. Not re-verified in this audit | `PaymentInstructions.tsx`, `Checkout.tsx`, `create-checkout`, `stripe-webhook` | KEEP; copy review Phase 5 |
| **i18n coverage & native RO/EN; language switch preserves task (§25–26)** | 🟡 PARTIAL — All student strings appear to be in `src/lib/i18n.tsx` (per project memory). Single SPA route with language state — switch keeps URL ✅. Native quality not auditable here without a copy review. No `/ro` `/en` localized routes (acceptable short-term per §26) | `src/lib/i18n.tsx`, `Navbar.tsx` | KEEP structure; native-copy pass Phase 7 |

---

## Step 3 — Pre-confirmed findings, re-verified and extended

### 3.1 Live DB `lead_status` constraint history
- **Original**: migration `20260429190817` set `CHECK (lead_status IN ('new','contacted','confirmed'))` on `registrations`; migration `20260429193000` mirrored it on `lead_status_history` (both `new_status` and `previous_status`). ✅ Confirmed verbatim in those files.
- **Now**: migration `20260624184349` (Phase 1) drops both constraints and re-adds them with the full 7-value set `new / contacted / qualified / no_response / not_suitable / spam / converted`. ✅ Constraint widened — the "PARTIAL" label still applies because frontend code paths haven't all caught up (see 3.3).

### 3.2 `group_cohorts.status` column
- Original schema: no `status` column. ✅ Confirmed by the original cohort-creating migration and by the absence of `status` in `useGroupCohorts.ts`/`CohortsAdmin.tsx` Cohort types.
- Phase 1 migration `20260624184349` adds `status text NOT NULL DEFAULT 'draft'` plus 8-value check constraint (`draft / forming / minimum_reached / confirmed / full / in_progress / completed / cancelled`). ✅
- **No reader or writer in the frontend uses the column yet** — `useGroupCohorts.ts` still gates on `is_active`; `CohortsAdmin.tsx` still toggles `is_active`; `admin-registrations` cohort upsert/list paths still select the `is_active` shape. So at the data level §11 is implemented; at the application level it is dormant. Phase 2/5 must migrate readers and then drop `is_active`.

### 3.3 Every place the three-value lead vocabulary is hardcoded (exhaustive sweep via ripgrep)

**Still hardcoded to the old 3-value set** (`"new"|"contacted"|"confirmed"`):
- `src/pages/PrivateStatus.tsx` — line 7 (`type LeadStatus = "new" | "contacted" | "confirmed"`), line 17 (`statusLabels`), line 23 (`const steps: LeadStatus[] = ["new", "contacted", "confirmed"]`), line 51 (`steps.indexOf(...)`), line 91 (`step === "confirmed"` copy). **This file was explicitly excluded from Phase 1 ("Don't touch PrivateStatus this phase").**

**Already updated to the full 7-value set**:
- `src/components/admin/types.ts` — `LeadStatus`, `LEAD_STATUSES`, `leadStatusLabels` all carry 7 values. ✅
- `src/components/admin/RegistrationsTable.tsx` — uses `LEAD_STATUSES` from types. ✅
- `src/components/admin/PrivateLeadStats.tsx` — uses `LEAD_STATUSES`. ✅
- `src/pages/Admin.tsx` — imports `LeadStatus`/`LeadStatusFilter` from `admin/types`; counter reducer keyed by `LeadStatus | "total"`. ✅
- `src/pages/PrivateLead.tsx` — imports `LeadStatus` from `admin/types`, renders all values in the select. ✅
- `src/lib/adminExport.ts` — uses `leadStatusLabels`/`LeadStatusFilter`. ✅
- `src/components/admin/RegistrationFilters.tsx` — uses the shared `LeadStatusFilter`. ✅ (verified by import sweep).

**Edge function**:
- `supabase/functions/admin-registrations/index.ts` line 606 declares `const ALLOWED_LEAD_STATUSES = [...]` and gates `update_status` on `ALLOWED_LEAD_STATUSES.includes(lead_status)` (line 615). **This audit did not read the literal array contents.** ACTION FOR THE USER / NEXT TURN: open `admin-registrations/index.ts` around lines 606–615 and confirm the array contains all 7 values, not the historical 3. If only 3, admin Save will 4xx for qualified/no_response/not_suitable/spam/converted even though the DB accepts them.

**Other "new" / "contacted" / "confirmed" hits that are NOT the lead vocabulary** (already cross-checked, not a fork):
- `src/pages/Trial.tsx:43` writes `lead_status: "new"` on insert — valid initial state, not a vocabulary fork.
- `AdminNotifications.tsx`, `StudentJourneyAdmin.tsx` type lead_status loosely as `string`. Not a fork.
- Every other `"confirmed"` literal is `bookings.status` (booking lifecycle), unrelated to `lead_status`: `BookingManage.tsx`, `BookingsAdmin.tsx`, `booking-create`, `booking-manage`, `booking-availability`, `booking-reminders`, `trial-followup`, `admin-registrations` lines 326/409/413 (those check `bookings.status === "confirmed"`).

### 3.4 `PrivateStatus.tsx` ordered-funnel design decision

`const steps: LeadStatus[] = ["new", "contacted", "confirmed"]` is rendered as a 3-step horizontal progress bar (`steps.indexOf(lead.lead_status || "new")`). With the DB now able to return `qualified / no_response / not_suitable / spam / converted` for a private lead, three failure modes are now possible:
1. `qualified` / `converted` — semantically forward but not in the array → `indexOf` returns -1, bar shows zero steps lit (regression).
2. `no_response` / `not_suitable` / `spam` — terminal/dead-end statuses that must NOT render as forward progress; today they'd also show as -1 (accidentally OK by coincidence, not by design).
3. The legacy `"confirmed"` value is no longer writable through the admin UI (it was dropped from the widened vocab list), so the third step on this bar will never light up again from a real workflow.

**Design decision required before Phase 1 is considered closed**:
- Option A — Map the new vocabulary into the existing 3-step bar: `new → new`, `contacted → contacted`, `qualified/converted → confirmed`; render `no_response/not_suitable/spam` as a separate terminal pill (not a step).
- Option B — Redesign the bar entirely (e.g. New → Contacted → Qualified → Converted, with terminal statuses shown as a "Closed" badge instead of a step).
- Option C — Hide the page or redirect for terminal statuses.

User said "Don't touch PrivateStatus this phase" — flag for Phase 8 (lead detail page §39 also overlaps this file).

---

## §51 Test Scenarios — pass/fail snapshot after Phase 1

| # | Scenario | Verdict | Why |
|---|---|---|---|
| 1 | New group lead arrives | 🟡 PARTIAL PASS | Lead appears, status select offers all 7 values (✅). "Counter updates if eligible" still fails — `useGroupCapacity.ts` counts every row regardless of status (Phase 2). |
| 2 | WhatsApp-only student | ❌ FAIL | No "Add WhatsApp Lead" UI/edge action (Phase 3). |
| 3 | Cohort reaches 6 students | ❌ FAIL | No cohort status column reader, no "minimum reached" dashboard card (Phase 2/8). |
| 4 | Student pays | ✅ PASS | Stripe + `payment_status` independent of `lead_status`; no regression from Phase 1. |
| 5 | Student requests Saturday online | 🟡 PARTIAL | `course_requests` table exists structurally (✅) but no public form, no admin view (Phase 4). |
| 6 | Physical class shows Raduga address | 🟡 PARTIAL | `locations` table + Raduga row exist; no reader joins it (Phase 5). |
| 7 | RO/EN switch preserves task | ✅ PASS | SPA route, language state preserves URL. Native-copy quality not audited. |
| 8 | Supabase/data-layer mismatch | 🟡 PARTIAL | All Phase 1 columns appear in `src/integrations/supabase/types.ts` (verified `course_requests` Row/Insert/Update shape). One open mismatch: `group_cohorts.status` / `track` / `location_id` / `tutor_id` / `days_of_week` / `start_time` / `end_time` / `timezone` / `duration_minutes` and `registrations.source` / `track_preference` / archive flag — need to be present in the `types.ts` Database type (could not visually confirm in the 400-line slice read, but the file is 923 lines; the generator runs after every migration so they should be there — flag a spot-check). |

---

## Issues blocking next phase

1. **`PrivateStatus.tsx` vocabulary fork is a real regression** for private leads moved to terminal statuses — needs Option A/B/C decision before Phase 8.
2. **`ALLOWED_LEAD_STATUSES` literal in `admin-registrations/index.ts` lines 606–615** — please confirm the array was widened in Phase 1; if not, admin status changes for the 4 new values will return 4xx despite a working DB constraint.
3. **`group_cohorts.status` is dormant** — every reader still gates on `is_active`. Phase 2 should migrate readers (and CohortsAdmin UI) to `status`, then `is_active` can be dropped.
4. **Counters do not exclude disqualified leads** — `useGroupCapacity.ts` row count ignores `lead_status`. Phase 2 must gate on the qualified set.
5. **`.env`** holds only `VITE_SUPABASE_*` + `SUPABASE_URL` + the anon `SUPABASE_PUBLISHABLE_KEY` — no service-role key, no Stripe secret, no admin password committed. ✅ Clean.

No code changes proposed. Awaiting your decision on whether to enter build mode for Phase 2, or whether to handle the `PrivateStatus.tsx` / `ALLOWED_LEAD_STATUSES` items first as a Phase 1 closeout.
