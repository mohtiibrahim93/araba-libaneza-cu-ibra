-- Second half of the "rezervarea a eșuat" outage.
--
-- Fixing registrations_lead_status_check was necessary but not sufficient: the
-- RLS policy that lets a visitor submit a registration also pins the value,
-- with `lead_status = 'new'` in its WITH CHECK. Trial step 1 writes
-- 'incomplete' from the browser under the anon role, so the INSERT was still
-- rejected — by RLS this time instead of by the constraint — and the visitor
-- still never reached the scheduling step.
--
-- The clause exists so an anonymous submitter cannot write themselves in as
-- 'qualified' or 'converted'. 'incomplete' is strictly less privileged than
-- 'new', so allowing it keeps that guarantee intact. Everything else in the
-- policy is reproduced unchanged.
drop policy if exists "Anyone can submit a registration" on public.registrations;

create policy "Anyone can submit a registration"
  on public.registrations
  for insert
  to authenticated, anon
  with check (
    (length(name) >= 1 and length(name) <= 200)
    and name ~ '[[:alpha:]]'
    and (length(phone) >= 3 and length(phone) <= 40)
    and regexp_replace(phone, '[\s().-]', '', 'g') ~ '^(\+[1-9][0-9]{6,14}|0[27][0-9]{8})$'
    and (
      email is null
      or (
        length(email) <= 320
        and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'
      )
    )
    and (notes is null or length(notes) <= 2000)
    and lead_status = any (array['new'::text, 'incomplete'::text])
    and payment_status = any (array['unpaid'::text, 'pending'::text])
    and is_waitlist_deposit = false
    and paid_at is null
    and stripe_session_id is null
    and whatsapp_sent_at is null
    and (quantity >= 1 and quantity <= 100)
  );
