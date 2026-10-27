-- The free trial's no-show fee (owner's decision, 27 October 2026): when the
-- owner marks a trial as a no-show or a late cancellation (< 24 h), the admin
-- can charge the card saved at booking 150 lei, after one confirmation. It
-- may be refunded, case by case, with the existing refund button.
--
-- Recorded on the trial's registration (one trial per registration), apart
-- from payment_status: that column tracks the money for lessons, and a trial
-- marked "paid" would read as a student and would refuse the same person's
-- later payment for lessons ("Already paid"). No payment_status value is
-- added, renamed or merged (AGENTS.md).
--
-- no_show_fee_status   'paid' (charged), 'failed' (the card was declined or
--                      needed the cardholder; nothing was charged), 'refunded'
-- no_show_fee_booking_id  the trial booking it was charged for; the Stripe
--                      idempotency key is per booking
-- no_show_fee_intent_id   the Stripe PaymentIntent (what a refund goes against)

alter table public.registrations
  add column if not exists no_show_fee_status text
    check (no_show_fee_status is null or no_show_fee_status in ('paid', 'failed', 'refunded')),
  add column if not exists no_show_fee_booking_id uuid,
  add column if not exists no_show_fee_intent_id text,
  add column if not exists no_show_fee_amount integer
    check (no_show_fee_amount is null or no_show_fee_amount > 0),
  add column if not exists no_show_fee_at timestamptz,
  add column if not exists no_show_fee_error text,
  add column if not exists no_show_fee_refunded_amount integer;
