-- Cash and bank-transfer payments for group courses (owner, 1 Nov 2026).
--
-- A card payment is recorded by Stripe (months_paid / months_total through the
-- subscription webhook). A student paying the owner in cash or by transfer
-- could only be marked "Plătit" as a whole, with no month count, no
-- "paid in full" and no amount. Each such payment is one row here: one month
-- or the whole course (-15%), cash or transfer, and the amount received.
-- admin-registrations: record_group_payment writes it and advances
-- registrations.months_paid; the admin list shows the plan and the total.
--
-- Only the admin's service role reads or writes it: RLS on, no policies.
create table if not exists public.registration_payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  kind text not null check (kind in ('month', 'full')),
  method text not null check (method in ('cash', 'transfer')),
  amount_lei numeric(10, 2) not null check (amount_lei > 0 and amount_lei <= 100000),
  recorded_by text not null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists registration_payments_registration_id_idx
  on public.registration_payments (registration_id);

alter table public.registration_payments enable row level security;

comment on table public.registration_payments is
  'Cash/transfer payments for group courses recorded by the owner: one month or the whole course, with the amount received. Service role only.';
