-- Credit a student holds with the school (owner, 14 and 16 November 2026).
--
-- When a student leaves a group after the second lesson, the unused lessons
-- of the month in progress become credit instead of money (Terms, section 4).
-- Credit is valid 6 months; it can pay for a later group, be passed to
-- another person, or become private lessons at 150 lei each. The student is
-- reminded 30 days before it runs out, and what is still unused then is
-- refunded in money, minus the Stripe fee, by the owner pressing "refund now"
-- in the admin: nothing is refunded by itself.
--
-- One row per credit, one row per use of it. What is left of a credit is its
-- amount minus its uses; nothing stores the balance twice.
--
-- Months the owner grants for free ("lună acordată") are NOT credit and are
-- not kept here: they stay in registration_payments (kind = 'credit').
--
-- Written so it can run again without harm: the tables were created by hand
-- on 16 November 2026, ahead of the deploy that records this file.

create table if not exists public.student_credits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  -- the sign-up the credit came from
  registration_id uuid references public.registrations(id) on delete set null,
  -- who holds it now (the student, or the person it was passed to)
  holder_name text not null check (char_length(holder_name) between 1 and 160),
  holder_email text check (holder_email is null or char_length(holder_email) <= 255),
  amount_lei numeric(10, 2) not null check (amount_lei > 0),
  -- where it came from, in the owner's words
  origin text not null check (char_length(origin) between 1 and 300),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  -- under the Terms of 16 November 2026 unused credit comes back in money at
  -- expiry; credit given under the earlier Terms simply ends
  refund_at_expiry boolean not null default true,
  -- the card payment the money sits on, when there is one, so a refund at
  -- expiry can go back to the same card
  stripe_payment_id text check (stripe_payment_id is null or char_length(stripe_payment_id) <= 120),
  reminder_sent_at timestamptz,
  created_by text not null check (char_length(created_by) between 1 and 255),
  note text check (note is null or char_length(note) <= 500),
  check (expires_at > created_at)
);

create table if not exists public.student_credit_uses (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid not null references public.student_credits(id) on delete cascade,
  -- group: paid towards a later group; private: private lessons at 150 lei;
  -- transfer: passed to another person; refund: returned in money
  kind text not null check (kind in ('group', 'private', 'transfer', 'refund')),
  amount_lei numeric(10, 2) not null check (amount_lei > 0),
  note text check (note is null or char_length(note) <= 500),
  -- the Stripe refund, when the money went back to a card
  refund_ref text check (refund_ref is null or char_length(refund_ref) <= 120),
  used_at timestamptz not null default now(),
  recorded_by text not null check (char_length(recorded_by) between 1 and 255)
);

create index if not exists student_credits_student_idx
  on public.student_credits (student_id);
create index if not exists student_credits_registration_idx
  on public.student_credits (registration_id);
create index if not exists student_credits_expires_idx
  on public.student_credits (expires_at);
create index if not exists student_credit_uses_credit_idx
  on public.student_credit_uses (credit_id);

-- Only the server reads and writes these (the admin function and the
-- student's account route, both with the service role): no policy is given
-- to visitors or signed-in students.
alter table public.student_credits enable row level security;
alter table public.student_credit_uses enable row level security;

comment on table public.student_credits is
  'Credit a student holds: amount, origin, expiry. What is left = amount_lei minus student_credit_uses. Granted months are not credit.';
comment on table public.student_credit_uses is
  'Each use of a credit: a later group, private lessons, a transfer to another person, or a refund in money.';

-- Belt and braces: with row level security on and no policy, visitors and
-- signed-in students already see nothing; they are given no table rights
-- either.
revoke all on public.student_credits, public.student_credit_uses
  from anon, authenticated;
