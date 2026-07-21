-- Blog CMS (override model): the owner edits articles in the admin; a saved,
-- published row REPLACES the code-shipped version of that article on the
-- public site. Articles without a row keep rendering the code version, so
-- nothing changes until an article is actually edited. Bodies are Markdown
-- (RO + EN). Media (images/audio) lives in the public 'blog-media' bucket,
-- uploaded through the admin edge function (service role).
-- Idempotent; safe to re-run.

CREATE TABLE IF NOT EXISTS public.blog_articles (
  slug text PRIMARY KEY,
  title_ro text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ro text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  lead_ro text NOT NULL DEFAULT '',
  lead_en text NOT NULL DEFAULT '',
  body_ro text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  reading_minutes integer NOT NULL DEFAULT 5,
  -- When true the DB version replaces the code version on the public site.
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Public site reads only published overrides; writes go through the admin
-- edge function with the service role.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='blog_articles' AND policyname='Anyone reads published article overrides'
  ) THEN
    CREATE POLICY "Anyone reads published article overrides"
      ON public.blog_articles FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='blog_articles' AND policyname='Service role manages article overrides'
  ) THEN
    CREATE POLICY "Service role manages article overrides"
      ON public.blog_articles FOR ALL
      TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER trg_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Public-read media bucket for article images/audio (writes: service role only).
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;
