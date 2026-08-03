CREATE TABLE public.backlink_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  domain text NOT NULL,
  authority_score integer,
  trust_score integer,
  backlinks_total integer,
  referring_domains integer,
  follow_links integer,
  nofollow_links integer,
  top_referring_domains jsonb DEFAULT '[]'::jsonb,
  anchor_distribution jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.backlink_snapshots TO authenticated;
GRANT ALL ON public.backlink_snapshots TO service_role;

ALTER TABLE public.backlink_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage backlink snapshots"
ON public.backlink_snapshots
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email IN (
        SELECT trim(lower(email))
        FROM unnest(string_to_array(current_setting('app.settings.admin_emails', true), ',')) AS email
        WHERE email <> ''
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email IN (
        SELECT trim(lower(email))
        FROM unnest(string_to_array(current_setting('app.settings.admin_emails', true), ',')) AS email
        WHERE email <> ''
      )
  )
);

CREATE INDEX idx_backlink_snapshots_domain_date ON public.backlink_snapshots(domain, snapshot_date DESC);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at_backlink_snapshots()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_backlink_snapshots_updated_at
BEFORE UPDATE ON public.backlink_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at_backlink_snapshots();