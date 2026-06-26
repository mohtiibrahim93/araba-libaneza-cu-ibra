## Goal

Reschedule three `pg_cron` jobs and extend two edge functions so their staged-reminder logic matches the new cadences.

---

## 1. `process-email-queue` — cadence only

- Unschedule existing job (jobid 2, schedule `5 seconds`, currently inactive).
- Reschedule as `*/2 * * * *` (every 2 minutes), calling the same `process-email-queue` function with the existing headers/body pattern used in other cron jobs.
- No function code changes.

## 2. `booking-reminders-every-15-min` — keep `*/15 * * * *`, extend stages

Currently the function sends only two reminders: **24h before** and **1h before**, tracked via `bookings.reminder_24h_sent_at` and `bookings.reminder_1h_sent_at`.

The requested stages are: **~2 days before**, **day-of (morning)**, **3h before**, **1h before**, **30 min before**.

### Schema changes (migration)

Add nullable timestamp columns to `public.bookings` to dedupe each new stage:

- `reminder_2d_sent_at`
- `reminder_day_of_sent_at`
- `reminder_3h_sent_at`
- `reminder_30m_sent_at`

(`reminder_24h_sent_at` is left in place for historical data; the new code will not write or read it. `reminder_1h_sent_at` is reused as-is.)

### Function changes (`supabase/functions/booking-reminders/index.ts`)

Replace the two-window loop with five windows, each ±7.5 minutes around the target offset (so a 15-min cron tick catches every booking exactly once):

| Stage     | Target offset before `start_at` | Window                         | Flag column                |
| --------- | ------------------------------- | ------------------------------ | -------------------------- |
| 2 days    | 48h                             | now + [47h52m30s, 48h07m30s]   | `reminder_2d_sent_at`      |
| Day-of    | sent on the calendar day of the booking, at the first cron tick on/after 08:00 local | `start_at::date = today_local AND now_local >= 08:00` | `reminder_day_of_sent_at`  |
| 3 hours   | 3h                              | now + [2h52m30s, 3h07m30s]     | `reminder_3h_sent_at`      |
| 1 hour    | 1h                              | now + [52m30s, 1h07m30s]       | `reminder_1h_sent_at` (reused) |
| 30 min    | 30m                             | now + [22m30s, 37m30s]         | `reminder_30m_sent_at`     |

Each stage:
1. Selects `status='confirmed'` bookings inside its window where the corresponding flag is `NULL`.
2. Sends a `booking-reminder` email via `sendBookingEmail` with a stage-specific `inLabel` (RO/EN) and idempotency key `booking-reminder-<stage>-<booking_id>`.
3. Updates the stage's flag to `now()` so future runs skip it.

This guarantees each stage fires **at most once per booking** even if the cron runs late or a booking is rescheduled.

## 3. `trial-followup-hourly` → twice daily, two-stage

- Unschedule existing job (jobid 4, `0 * * * *`, inactive).
- Reschedule as `0 9,18 * * *` with name `trial-followup-twice-daily`.

### Schema change (migration)

Add `reminder_trial_followup_2_sent_at TIMESTAMPTZ` to `public.bookings` for the second-stage dedupe (the existing `trial_followup_sent_at` continues to dedupe stage 1).

### Function changes (`supabase/functions/trial-followup/index.ts`)

Process exactly two stages per run:

| Stage                | Window (relative to `end_at`) | Flag column                            |
| -------------------- | ----------------------------- | -------------------------------------- |
| 1 — after the lesson | ended between 1h and 18h ago  | `trial_followup_sent_at` (existing)    |
| 2 — couple days later | ended between 48h and 72h ago | `reminder_trial_followup_2_sent_at`    |

Both stages filter `status='confirmed' AND event_type_slug='trial'` and the corresponding `*_sent_at IS NULL`, send via `send-transactional-email` with idempotency keys `trial-followup-<id>` and `trial-followup-2-<id>`, then stamp the flag. The 18h upper bound on stage 1 and 24h gap on stage 2 fit comfortably inside the 9-hour cron interval, so each booking receives **exactly one** stage-1 and **exactly one** stage-2 email.

---

## Execution order

1. Migration: add new `bookings.*_sent_at` columns.
2. Update `booking-reminders/index.ts` and `trial-followup/index.ts`.
3. Data migration via `supabase--insert`: `cron.unschedule(...)` the three existing jobs by name, then `cron.schedule(...)` the new ones using the project's stored cron secret pattern (`SUPABASE_URL` + anon key in headers, matching the existing job 3 definition).
4. Query `cron.job` and report the final `jobname / schedule / active` for the three jobs.

## Open question

For the **day-of** reminder I'm assuming "morning of the lesson, at/after 08:00 in the booking's local timezone". If you'd prefer a fixed offset instead (e.g. exactly 12h before `start_at`), say so and I'll swap that stage's window — everything else stays the same.
