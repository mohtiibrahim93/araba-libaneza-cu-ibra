ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'monthly';
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_plan_check;
ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_plan_check CHECK (plan IN ('monthly', 'full'));
UPDATE public.registrations SET plan = 'full'
 WHERE form_type IN ('group', 'kids') AND notes LIKE '%Plată: integrală în avans%';