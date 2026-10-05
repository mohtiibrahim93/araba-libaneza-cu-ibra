-- Students added by hand in the admin (owner, October 2026): a real
-- registration with where the student came from and, when paid outside the
-- site, how they paid.
--
-- registrations.source accepted only 'form', 'whatsapp' and 'admin'; the admin
-- now records TikTok, Instagram, direct, phone or another source too.
alter table public.registrations
  drop constraint if exists registrations_source_check;
alter table public.registrations
  add constraint registrations_source_check
  check (source = any (array['form', 'whatsapp', 'admin', 'tiktok', 'instagram', 'direct', 'telefon', 'other']));

-- How a payment made outside Stripe was made. NULL for Stripe payments and
-- unpaid rows.
alter table public.registrations
  add column if not exists payment_method text;
alter table public.registrations
  drop constraint if exists registrations_payment_method_check;
alter table public.registrations
  add constraint registrations_payment_method_check
  check (payment_method is null or payment_method = any (array['cash', 'transfer', 'card', 'paypal']));
