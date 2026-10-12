-- The free level check with Ibra (October 2026): up to 30 minutes, on Zoom or
-- at the center, oral and written (arabizi). Separate from the trial lesson.
--
-- Three ways to ask for it, all from /verificare-nivel:
-- 1. a time in the booking calendar (event type 'verificare-nivel', no card —
--    booking-create treats it as free);
-- 2. "Ibra calls you back" — a registration row with form_type 'level_check';
-- 3. WhatsApp — nothing stored.
-- Both 1 and 2 write a registration, so form_type needs the new value.

alter table public.registrations drop constraint if exists registrations_form_type_check;
alter table public.registrations add constraint registrations_form_type_check
  check (form_type = any (array['group'::text, 'private'::text, 'kids'::text, 'trial'::text, 'level_check'::text]));

insert into public.booking_event_types
  (slug, name_ro, name_en, description_ro, description_en, duration_min, buffer_before_min, buffer_after_min, min_notice_hours, max_advance_days, price_cents, requires_payment)
values
  ('verificare-nivel', 'Verificare de nivel cu Ibra', 'Level check with Ibra',
   'Până la 30 de minute, gratuit: o discuție și câteva întrebări scrise în arabizi.',
   'Up to 30 minutes, free: a conversation and a few written questions in Arabizi.',
   30, 5, 5, 12, 30, 0, false)
on conflict (slug) do nothing;
