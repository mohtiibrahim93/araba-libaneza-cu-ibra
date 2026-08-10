ALTER TABLE public.backlink_snapshots
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS metric_sources jsonb NOT NULL DEFAULT '{}'::jsonb;