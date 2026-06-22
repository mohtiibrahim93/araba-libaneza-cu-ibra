Implementation Plan — Centrul de Arabă Libaneză

Source of Truth

Before implementing any feature, read:

docs/PRODUCT_QA_STANDARD.md (v1.1, 56 sections)

It defines: product logic, cohort-based enrollment model, the five status families (lead / cohort / enrollment / payment / communication — §9–14), counter logic (§15), track logic (§22), schedule and location rules (§18–20), admin workflows (§27–41), form QA (§43), data integrity rules (§44), CTA rules (§46), the target data model (§53), build priorities (§54), and the final approval standard (§55).

This file (plan.md) is the active execution plan only. If plan.md and the standard ever disagree, the standard wins.

Note: this file (.lovable/plan.md) previously held the old "Site Audit Fix Plan" (Batches 1–4), now fully replaced by this plan. Any unshipped Batch 1 items (honest stats, anchor renames, capacity copy softening, cookie bar) fold into Phase 0 below.

Core Rule

Do not blindly add new features. For every requested change:

Inspect the current implementation first.

If the feature exists and is equal or better, keep it and say why.

If it exists but is weaker or partial, improve it in place.

If it conflicts with the QA standard, refactor it.

If it does not exist, implement it per the standard.

Never create duplicate components, database fields, statuses, forms, counters, or admin workflows.

After every change, report: existed / kept / changed / added / removed / files modified / needs manual review.

Architecture Rule

React/Vite/TypeScript frontend + Supabase (tables, migrations, RLS, RPCs, Edge Functions) + Stripe. The Node tsconfig covers Vite tooling only — there is NO Node/Express backend. "Backend task" always means Supabase work. Admin data access flows through the admin-registrations Edge Function pattern; never weaken RLS to enable direct client reads.

Known Codebase Facts (do not rebuild these)

Registrations spine: registrations table (group/private/kids), with lead_status, payment_status, paid_at, cohort_id, kids_slot_id, is_waitlist_deposit, whatsapp_sent_at, referral_code + lead_status_history audit table.

Cohorts: group_cohorts + get_cohort_signup_counts RPC + realtime refresh in src/hooks/useGroupCohorts.ts. Seat counts are computed, never stored. Keep it that way.

Formation logic: group_capacities (min/max per level) in src/hooks/useGroupCapacity.ts. KNOWN DESIGN DEBT: capacities count per level, cohorts count per cohort — two counting systems. Resolution: the cohort is the unit of truth for seats; level capacity supplies only the formation threshold until min_students moves onto cohorts (§37).

Admin exists: registrations table + filters + export (CSV/PDF), CohortsAdmin, CapacitiesAdmin, AvailabilityAdmin, BookingsAdmin, StudentJourneyAdmin (reg→booking→payment→class), TrialFunnelAdmin (reg→booked→attended→converted), email settings, notifications page.

Infrastructure exists: Stripe checkout + webhook, full private/trial booking system with reschedule/cancel/reminders, email queue with suppression + unsubscribe + transactional templates, reCAPTCHA + honeypot, GDPR checkbox, i18n RO/EN in src/lib/i18n.tsx, tracking in src/lib/tracking.ts, timezone utils.

Migration Discipline (critical)

§53 describes the TARGET entity model (Tutor, Course, Cohort, Lead, Course Request, Enrollment, Communication Log, Payment). The current schema is simpler. Do NOT attempt a one-shot migration to §53. Evolve incrementally:

Statuses first: extend existing columns + check constraints on registrations and group_cohorts.

New tables only where nothing exists: course_requests, locations, tutors.

The Lead/Enrollment split and Communication Log are later structural migrations (Phase 6+), done only when the simpler model demonstrably blocks a workflow.

Every migration is additive and reversible; frontend types (src/integrations/supabase/types.ts, src/components/admin/types.ts) update in the same change; exports absorb new fields in the same change.

Product Rule

Form-backed WhatsApp-first enrollment (§7–8). WhatsApp converts; the database tracks. Every serious WhatsApp lead enters registrations (manual "Add WhatsApp Lead" + source field). Counters display only what the database can justify (§15, §44). CTA wording matches real cohort status (§32, §46).

Implementation Priority (mirrors §54)

Phase 0 — Hygiene: PREREQUISITE — publish the current unpublished preview first; the live site lags behind it, and publishing alone resolves most of the visible launch bugs (duplicate id="courses", #inscriere dead anchor, stats inflation, hero alt text, "vorbitori nativi", C1/C2 gating, quiz collapse, "de la 500 LEI/lună", Preply badge, meta title, JSON-LD, WebP photo). After publishing, close out the remaining old Site Audit Fix Plan Batch 1 leftovers that publishing does NOT fix (single source of truth for stats, any still-dead anchors, empty-capacity copy softening to "Grup în formare — primii N cursanți confirmă startul", slim cookie bar that doesn't cover the CTA); verify .env holds only public anon keys (rotate anything else); confirm no hardcoded counters anywhere.

Phase 1 — Statuses & data model: cohort status enum beyond is_active (§11) · extend lead_status vocabulary (§10) · track_preference on registrations + track on cohorts (§22) · source column (form/whatsapp/admin) · structured schedule fields on cohorts (§19) · locations + tutors tables with current defaults (Raduga; one tutor) (§17, §20) · course_requests table (§53). Constraints + types + exports updated together.

Phase 2 — Counters: formation counter vs seat counter per §15 (qualified statuses only; forming shows interest progress, confirmed shows seats left) · resolve the capacities/cohorts duality per §37 · honest empty-state copy.

Phase 3 — WhatsApp + structured tracking: WhatsApp click events everywhere via tracking.ts · admin "Add WhatsApp Lead" · manual "mark WhatsApp sent / replied / no reply" workflow (§14, §30–31) · follow-up dates + notes.

Phase 4 — Request-a-course: student form with predefined schedule blocks (§35) · admin clustering view · "create cohort from requests" · forming interest cards public (§34).

Phase 5 — Schedule visibility: public Current Groups section (render from existing useGroupCohorts) high on homepage (§48) · dedicated schedule page with filters (§49) · Raduga address on every physical cohort (§20).

Phase 6 — Arabizi/script surface: homepage chooser section, course cards, quiz output, form field, cohort cards, admin columns (§22, §50).

Phase 7 — Bilingual/native copy: RO and EN written natively, not translated; language switch preserves the current page/task (§25–26). Copy after structure, never before.

Phase 8 — Admin dashboard: action cards (new leads, follow-ups due, cohorts near minimum, minimum reached, pending payments, upcoming classes) (§27–28) · lead detail page (§39) · archive instead of delete (§29, §44).

One phase per task. QA pass (§51 scenarios + §55 approval standard) after every phase before starting the next.

QA Approval Standard (every change)

Improves student clarity, admin management, data accuracy, or maintainability — name which.

Counters trace to database records; admin numbers match public numbers (§44).

One closed vocabulary per status family; transitions logged (§9–14).

Every student action trackable, including WhatsApp paths (§7, §30–31).

CTA wording matches cohort status (§46); payment copy matches actual Stripe/manual flow (§47).

No duplication; no Node-backend assumptions; RLS/Edge Function boundary respected (§4–5, §41).

All student-facing strings in i18n.tsx, RO + EN, native phrasing (§25).

Mobile checklist passes (§45); forms pass §43.

Change report delivered.
