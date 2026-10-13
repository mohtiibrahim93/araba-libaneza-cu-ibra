-- "Am vorbit cu el" on the admin's Acasă list: someone who said yes and has
-- not paid is hidden from the list until this time, then comes back if they
-- still have not paid. It says nothing about the money (payment_status).
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS followup_snoozed_until timestamptz;
