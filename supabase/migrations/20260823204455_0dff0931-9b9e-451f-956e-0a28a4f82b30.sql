CREATE TABLE public.site_texts (
  key text PRIMARY KEY,
  value_ro text NOT NULL DEFAULT '',
  value_en text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_texts TO anon, authenticated;
GRANT ALL ON public.site_texts TO service_role;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_texts public read" ON public.site_texts FOR SELECT USING (true);

CREATE TABLE public.page_contents (
  path text PRIMARY KEY,
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  h1 text NOT NULL DEFAULT '',
  lead text NOT NULL DEFAULT '',
  body_md text NOT NULL DEFAULT '',
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_contents TO anon, authenticated;
GRANT ALL ON public.page_contents TO service_role;
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_contents public read published" ON public.page_contents FOR SELECT USING (is_published = true);

CREATE TRIGGER site_texts_set_updated_at BEFORE UPDATE ON public.site_texts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER page_contents_set_updated_at BEFORE UPDATE ON public.page_contents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();