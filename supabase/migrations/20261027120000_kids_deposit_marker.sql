-- Kids seat deposit, recorded on its own (owner's decision, 27 October 2026).
--
-- The deposit used to go through the ordinary checkout path, so paying it set
-- registrations.payment_status to 'paid' -- as if the course itself had been
-- paid -- and the course could then no longer be paid for. The deposit is not
-- the course: payment_status keeps tracking the course's money (unpaid until a
-- course payment is attempted), and the deposit gets its own marker here.
--
-- No payment_status value is added, renamed or merged (AGENTS.md).

alter table public.registrations
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists deposit_amount integer
    check (deposit_amount is null or deposit_amount > 0),
  add column if not exists deposit_session_id text;

comment on column public.registrations.deposit_paid_at is
  'When the refundable kids seat deposit was paid. Separate from payment_status, which tracks the course itself.';
comment on column public.registrations.deposit_amount is
  'Kids seat deposit actually paid, in bani.';
comment on column public.registrations.deposit_session_id is
  'Stripe Checkout session of the kids seat deposit (never stored in stripe_session_id).';

create index if not exists idx_registrations_deposit_session
  on public.registrations (deposit_session_id)
  where deposit_session_id is not null;
