CREATE TABLE public.resources (
  slug text PRIMARY KEY,
  title_ro text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ro text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  email_template text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resources TO anon;
GRANT SELECT ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active resources are publicly readable"
ON public.resources FOR SELECT
USING (is_active = true);

CREATE TRIGGER resources_set_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.resources (slug, title_ro, title_en, description_ro, description_en, file_url, email_template, sort_order) VALUES
('arabizi-cheat-sheet', 'Cheat-sheet Arabizi (PDF)', 'Arabizi cheat sheet (PDF)', 'Tabelul cifrelor, 20 de expresii libaneze și un mesaj real decodat. Gratuit, pe email.', 'The number table, 20 Lebanese phrases and a real message decoded. Free, by email.', '/arabizi-cheat-sheet.pdf', 'arabizi-cheat-sheet', 1),
('100-expresii-libaneze', '100 de expresii libaneze esențiale (PDF)', '100 essential Lebanese phrases (PDF)', 'Șapte situații de zi cu zi, cu pronunție în arabizi și traducere în română.', 'Seven everyday situations, with arabizi pronunciation and translation.', '/100-expresii-libaneze.pdf', 'expresii-libaneze', 2),
('plan-30-zile', 'Plan de 30 de zile (PDF)', '30-day plan (PDF)', 'Program zilnic de 15–20 min, cu obiective săptămânale și resurse gratuite recomandate.', 'Daily 15–20 min program, with weekly goals and recommended free resources.', '/plan-30-zile-araba-libaneza.pdf', 'plan-30-zile', 3);