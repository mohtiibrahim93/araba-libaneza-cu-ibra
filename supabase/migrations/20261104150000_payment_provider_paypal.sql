-- How the money came, beside the method (owner, 4 Nov 2026).
--
-- A bank is not a method: a transfer or a card outside the site can say which
-- bank or app it went through (Revolut, ING, Banca Transilvania, UniCredit,
-- bunq, or another one typed in). PayPal is a method of its own.

alter table public.registration_payments
  add column if not exists provider text;

alter table public.registration_payments
  drop constraint if exists registration_payments_method_check,
  drop constraint if exists registration_payments_provider_check;

alter table public.registration_payments
  add constraint registration_payments_method_check
    check (method in (
      'cash', 'transfer', 'card_terminal', 'paypal', 'other',
      'credit', 'card_online'
    )),
  add constraint registration_payments_provider_check
    check (
      provider is null
      or (method in ('transfer', 'card_terminal')
          and char_length(provider) between 1 and 60)
    );

comment on column public.registration_payments.provider is
  'Bank or app a transfer or an outside card payment went through (e.g. Revolut). Optional.';
