-- Withdrawal, cancellation and move requests sent from "Contul meu" (owner,
-- 17 November 2026: "the cancel button if they want to cancel yes"; Terms,
-- section 4).
--
-- One row per request a student sends with the buttons in their account:
--   withdrawal   - the legal right of withdrawal, within 14 days of signing
--                  up (OUG 34/2014; the withdrawal function of Directive (EU)
--                  2023/2673, art. 11a, applied from 19 June 2026: "Retrage-te
--                  din contract aici", then "Confirmă retragerea", then an
--                  acknowledgement by email with the date and time);
--   cancellation - after the 14 days, under the cancellation rules;
--   transfer     - instead of cancelling, the student asks to move to another
--                  group of the same level.
--
-- The time of the request is the database's own, and it is the cancellation
-- date the refund rules use ("Data anulării este data la care ai trimis...").
-- The owner handles each request in the admin; nothing here moves money.
--
-- Additive: one new table, read and written only by the server (row level
-- security on, no policy), like student_credits. Written so it can run again.

create table if not exists public.cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  kind text not null check (kind in ('withdrawal', 'cancellation', 'transfer')),
  requested_at timestamptz not null default now(),
  -- the address the acknowledgement goes to: the signed-in student's own,
  -- confirmed by Supabase Auth and equal to the sign-up's address
  email text check (email is null or char_length(email) <= 255),
  -- the name as the student confirmed it in the statement
  name text check (name is null or char_length(name) <= 160),
  -- the statement exactly as sent, repeated in the acknowledgement
  statement text not null check (char_length(statement) between 1 and 2000),
  -- for a move: the group asked for
  target_cohort_id uuid references public.group_cohorts(id) on delete set null,
  -- what the student was shown before confirming (amounts in lei), kept so
  -- the owner sees the same numbers
  shown jsonb,
  -- a card subscription told to stop its future charges
  subscription_stopped_at timestamptz,
  acknowledged_at timestamptz,
  owner_notified_at timestamptz,
  handled_at timestamptz,
  handled_by text check (handled_by is null or char_length(handled_by) <= 255),
  handled_note text check (handled_note is null or char_length(handled_note) <= 500)
);

create index if not exists cancellation_requests_registration_idx
  on public.cancellation_requests (registration_id);

-- One open request per sign-up: a second press of the button finds the first.
create unique index if not exists cancellation_requests_one_open_idx
  on public.cancellation_requests (registration_id)
  where handled_at is null;

alter table public.cancellation_requests enable row level security;

comment on table public.cancellation_requests is
  'Withdrawal (14 days), cancellation and move requests sent by students from Contul meu. requested_at is the cancellation date. Handled by the owner in the admin.';

-- Belt and braces: with row level security on and no policy, visitors and
-- signed-in students already see nothing; they are given no table rights
-- either.
revoke all on public.cancellation_requests from anon, authenticated;
