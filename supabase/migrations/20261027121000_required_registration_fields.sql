-- No registration from the site without name, email, phone, course type and
-- format (owner's rule, 27 October 2026). The forms ask for all five and mark
-- them with *; this is the same rule where the browser cannot skip it.
--
-- The policy below is the one from 20260902120000_rls_allow_incomplete_lead
-- reproduced unchanged, with three additions:
--   1. name must contain something besides spaces (it already had to contain
--      a letter; this keeps the same check explicit after trimming);
--   2. for the four course forms -- group, private, kids, trial -- email and
--      format are required (form_type is already NOT NULL; phone was already
--      required by the pattern). Other form types (the level-check call-back)
--      keep their current rule;
--   3. a visitor cannot write the kids deposit marker
--      (20261027120000_kids_deposit_marker) or the trial no-show fee
--      (20261027115000_trial_no_show_fee) themselves, as with paid_at.
--
-- Only INSERTs from anon/authenticated are affected: rows already stored are
-- not re-checked, and the owner's tools (service role) are unchanged.
drop policy if exists "Anyone can submit a registration" on public.registrations;

create policy "Anyone can submit a registration"
  on public.registrations
  for insert
  to authenticated, anon
  with check (
    (length(name) >= 1 and length(name) <= 200)
    and name ~ '[[:alpha:]]'
    and length(btrim(name)) >= 1
    and (length(phone) >= 3 and length(phone) <= 40)
    and regexp_replace(phone, '[\s().-]', '', 'g') ~ '^(\+[1-9][0-9]{6,14}|0[27][0-9]{8})$'
    and (
      email is null
      or (
        length(email) <= 320
        and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'
      )
    )
    and (
      form_type not in ('group', 'private', 'kids', 'trial')
      or (
        email is not null
        and length(btrim(email)) > 0
        and format is not null
        and length(btrim(format)) > 0
      )
    )
    and (notes is null or length(notes) <= 2000)
    and lead_status = any (array['new'::text, 'incomplete'::text])
    and payment_status = any (array['unpaid'::text, 'pending'::text])
    and is_waitlist_deposit = false
    and paid_at is null
    and stripe_session_id is null
    and whatsapp_sent_at is null
    and deposit_paid_at is null
    and deposit_session_id is null
    and no_show_fee_status is null
    and no_show_fee_intent_id is null
    and (quantity >= 1 and quantity <= 100)
  );
