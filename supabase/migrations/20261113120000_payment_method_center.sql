-- "Plătit la centru" as a payment method (owner, 13 Nov 2026).
--
-- Students of the in-person groups pay the centre (Raduga Creative Center),
-- not the school: in cash or by card there, which the school does not see.
-- The owner records only that the month was paid at the centre, so it is a
-- method of its own rather than "cash" or "card".
--
-- Additive: the two checks accept one more value; no row changes.

alter table public.registration_payments
  drop constraint if exists registration_payments_method_check;

alter table public.registration_payments
  add constraint registration_payments_method_check
    check (method in (
      'cash', 'transfer', 'card_terminal', 'paypal', 'other',
      'credit', 'card_online', 'center'
    ));

-- record_group_payment copies the method onto the registration.
alter table public.registrations
  drop constraint if exists registrations_payment_method_check;

alter table public.registrations
  add constraint registrations_payment_method_check
    check (
      payment_method is null
      or payment_method in (
        'cash', 'transfer', 'card', 'paypal', 'card_terminal', 'other',
        'center'
      )
    );
