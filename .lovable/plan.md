## Goal

Make the scheduler behave differently per course type:

- **Group** → student picks one of 1–3 admin-defined cohorts per level, with live remaining-spots count.
- **Private** → student picks any free slot from `availability_rules`, with already-booked slots blocked in real-time.
- **Kids** → parent picks a weekly recurring class time + format (online / Bucharest), with seats tracked per slot.

## Schema changes (one migration)

1. **`group_cohorts`** — new table
   - `id uuid pk`, `form_type text` ('group'|'kids'), `level text null`
   - `start_date date`, `schedule_label_ro text`, `schedule_label_en text`
   - `max_seats int default 10`, `is_active bool default true`
   - RLS: public SELECT where `is_active`; service role ALL.

2. **`kids_class_slots`** — new table
   - `id uuid pk`, `weekday smallint` (1=Mon…7=Sun), `start_time time`, `duration_min int default 60`
   - `format text` ('online'|'physical'), `location text null`
   - `max_seats int default 8`, `is_active bool default true`
   - RLS: public SELECT where `is_active`; service role ALL.

3. **`registrations`** — add nullable columns
   - `cohort_id uuid` (group bookings)
   - `kids_slot_id uuid` (kids bookings)
   - Used for live-seat counting; no FK constraint (admin can delete cohorts without orphan blocking).

## Frontend

### `useGroupCohorts(level)` hook
Loads active cohorts for a level + counts confirmed registrations per `cohort_id`. Subscribes to realtime on `registrations` + `group_cohorts`. Returns `[{ id, startDate, scheduleLabel, seatsLeft, max, full }]`.

### `useKidsSlots()` hook
Same shape for `kids_class_slots` keyed by `kids_slot_id`.

### `CohortPicker` component (Group)
Replaces the current "months" toggle position in `GroupFields.tsx`:
- Renders after a level is chosen.
- Shows 1–3 cards: start date (localized), schedule label, "X locuri rămase" badge (uses existing `SpotsBadge` style).
- Full cohorts show "Lista de așteptare" and route to waitlist deposit flow.
- Selected cohort id flows up to registration submit → `cohort_id` column.

### `KidsSlotPicker` component
Used in `KidsFields.tsx`:
- Grouped by weekday, with format tabs (Online / Fizic Bucharest).
- Each slot card: "Miercuri 16:00 · Online" + seats-left badge.
- Selected slot id → `kids_slot_id`.

### Private flow
Already uses `NativeScheduler` + `booking-availability` edge function which reads `availability_rules` and excludes booked slots. Verify that:
- `booking-availability` filters out conflicting `bookings` rows for the right `event_type` (it already does via the conflict check in `booking-create`; if availability function doesn't subtract booked slots, add that).
- Real-time blocking: subscribe to `bookings` table inserts in `NativeScheduler` when `mode==='create'` and re-fetch slots on change. Show toast "Acest slot tocmai a fost rezervat" if the selected slot disappears.

### Admin
Extend `CapacitiesAdmin.tsx`:
- New "Cohorte" subsection per group level: add up to 3 cohort rows (date picker + schedule text RO/EN + max seats + active toggle).
- New "Sloturi copii" subsection: add weekday + time + format + location + max seats rows.

## Technical notes

- `cohort_id` / `kids_slot_id` columns make per-cohort seat counts trivial: `SELECT cohort_id, count(*) FROM registrations WHERE cohort_id = ANY(...) GROUP BY cohort_id`.
- Existing `group_capacities` (per level) becomes the **default fallback** when no active cohorts exist for that level — don't delete it.
- Realtime: reuse the existing capacity channel pattern (`postgres_changes` on `registrations`).
- i18n: add ~12 new keys (cohort labels, kids slot labels, waitlist, format Online/Bucharest).
- Types: after migration approval, `src/integrations/supabase/types.ts` regenerates automatically; components import the new tables from there.

## Files touched

- `supabase/migrations/<ts>_cohorts_kids_slots.sql` (new)
- `src/hooks/useGroupCohorts.ts` (new)
- `src/hooks/useKidsSlots.ts` (new)
- `src/components/RegistrationForm/CohortPicker.tsx` (new)
- `src/components/RegistrationForm/KidsSlotPicker.tsx` (new)
- `src/components/RegistrationForm/GroupFields.tsx` (edit)
- `src/components/RegistrationForm/KidsFields.tsx` (edit)
- `src/components/RegistrationFormSection.tsx` (pass cohort_id / kids_slot_id into insert)
- `src/components/RegistrationForm/types.ts` (extend form state)
- `src/components/CapacitiesAdmin.tsx` (admin editors for cohorts + kids slots)
- `src/components/NativeScheduler.tsx` (realtime subscription on bookings, refresh on insert)
- `supabase/functions/booking-availability/index.ts` (verify booked-slot subtraction; patch if missing)
- `src/lib/i18n.tsx` (new keys, RO + EN)

## Out of scope

- Stripe per-cohort pricing variations — pricing stays per-level as today.
- Email template changes — confirmations still send; cohort/slot label can be appended in a follow-up.
