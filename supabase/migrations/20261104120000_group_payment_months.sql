-- Group payments month by month (owner, 4 Nov 2026).
--
-- Each registration_payments row now says which months of the course it
-- covers (month_from..month_to), and may carry a note. The methods are the
-- ones the owner uses: Revolut, bank transfer, a card terminal, cash, another
-- method, a month granted free ("credit"), and "card_online" for payments made
-- on the site through Stripe, which the webhook records itself (stripe_ref
-- keeps a redelivered event from recording the same money twice).
--
-- The rule built on it ("Plătit la zi" / "Neplătit") lives in
-- supabase/functions/_shared/group-months.ts.

alter table public.registration_payments
  add column if not exists month_from integer,
  add column if not exists month_to integer,
  add column if not exists note text,
  add column if not exists stripe_ref text;

create unique index if not exists registration_payments_stripe_ref_key
  on public.registration_payments (stripe_ref)
  where stripe_ref is not null;

alter table public.registration_payments
  drop constraint if exists registration_payments_method_check,
  drop constraint if exists registration_payments_amount_lei_check,
  drop constraint if exists registration_payments_months_check,
  drop constraint if exists registration_payments_note_check;

alter table public.registration_payments
  add constraint registration_payments_method_check
    check (method in (
      'cash', 'transfer', 'revolut', 'card_terminal', 'other',
      'credit', 'card_online'
    )),
  add constraint registration_payments_amount_lei_check
    check (
      (kind = 'credit' and method = 'credit' and amount_lei = 0)
      or (kind <> 'credit' and method <> 'credit'
          and amount_lei > 0 and amount_lei <= 100000)
    ),
  add constraint registration_payments_months_check
    check (
      (month_from is null and month_to is null)
      or (month_from >= 1 and month_to >= month_from and month_to <= 60)
    ),
  add constraint registration_payments_note_check
    check (note is null or char_length(note) <= 500);

-- Existing rows predate the months: give each the next months in the order
-- they were recorded (one month each, or every remaining month for "full").
do $$
declare
  p record;
  next_month integer;
  last_reg uuid := null;
  total integer;
begin
  for p in
    select rp.id, rp.registration_id, rp.kind,
           coalesce(r.months_total, 4) as months_total
      from public.registration_payments rp
      join public.registrations r on r.id = rp.registration_id
     where rp.month_from is null
     order by rp.registration_id, rp.created_at
  loop
    if last_reg is distinct from p.registration_id then
      next_month := 1;
      last_reg := p.registration_id;
    end if;
    total := greatest(p.months_total, next_month);
    if p.kind = 'full' then
      update public.registration_payments
         set month_from = next_month, month_to = total
       where id = p.id;
      next_month := total + 1;
    else
      update public.registration_payments
         set month_from = next_month, month_to = next_month
       where id = p.id;
      next_month := next_month + 1;
    end if;
  end loop;
end $$;

-- registrations.payment_method holds the method of the last payment the owner
-- recorded; it gains the new ones.
alter table public.registrations
  drop constraint if exists registrations_payment_method_check;
alter table public.registrations
  add constraint registrations_payment_method_check
  check (payment_method is null or payment_method = any (array[
    'cash', 'transfer', 'card', 'paypal', 'revolut', 'card_terminal', 'other'
  ]));

comment on column public.registration_payments.month_from is
  'First month of the course this payment covers (1-based).';
comment on column public.registration_payments.month_to is
  'Last month of the course this payment covers.';
comment on column public.registration_payments.stripe_ref is
  'Stripe invoice, session or payment-intent id for card_online rows; unique.';
