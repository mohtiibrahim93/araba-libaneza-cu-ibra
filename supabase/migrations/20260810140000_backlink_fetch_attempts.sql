-- Backlink refresh observability.
--
-- fetch_live already fails safely: when Semrush returns a non-OK status it
-- returns early, so it never fabricates a snapshot and never overwrites the
-- last successful one. What was missing is a record THAT an attempt happened
-- and why it failed, so the admin dashboard can distinguish "the API is not
-- available on this plan" from "the weekly job silently stopped running".
--
-- Additive: a pure append-only log. No existing table is touched.

CREATE TABLE IF NOT EXISTS public.backlink_fetch_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  domain text NOT NULL,
  -- Which surface asked for the refresh.
  trigger_source text NOT NULL DEFAULT 'manual'
    CHECK (trigger_source IN ('manual', 'cron')),
  provider text NOT NULL DEFAULT 'semrush'
    CHECK (provider IN ('semrush', 'open_pagerank')),
  outcome text NOT NULL
    CHECK (outcome IN ('success', 'not_configured', 'api_unavailable', 'parse_error', 'error')),
  http_status integer,
  -- Truncated upstream message; never contains credentials.
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backlink_attempts_recent
  ON public.backlink_fetch_attempts (domain, attempted_at DESC);

ALTER TABLE public.backlink_fetch_attempts ENABLE ROW LEVEL SECURITY;

-- Same posture as backlink_snapshots: admins read, service role writes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'backlink_fetch_attempts'
      AND policyname = 'Admins read backlink fetch attempts'
  ) THEN
    CREATE POLICY "Admins read backlink fetch attempts"
      ON public.backlink_fetch_attempts FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND u.email IN (
              SELECT trim(lower(email))
              FROM unnest(string_to_array(current_setting('app.settings.admin_emails', true), ',')) AS email
              WHERE email <> ''
            )
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'backlink_fetch_attempts'
      AND policyname = 'Service role manages backlink fetch attempts'
  ) THEN
    CREATE POLICY "Service role manages backlink fetch attempts"
      ON public.backlink_fetch_attempts FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

COMMENT ON TABLE public.backlink_fetch_attempts IS
  'Append-only log of every automatic/manual backlink refresh attempt, including failures. A failed attempt never writes a snapshot.';
