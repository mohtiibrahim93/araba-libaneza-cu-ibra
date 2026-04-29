ALTER TABLE public.registrations
ADD COLUMN sms_confirmation_opt_in boolean NOT NULL DEFAULT false;