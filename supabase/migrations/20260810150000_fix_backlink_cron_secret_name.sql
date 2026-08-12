-- Fix: the weekly backlink cron was silently returning 403 every Monday.
--
-- The job built its x-cron-secret header from
--   (select decrypted_secret from vault.decrypted_secrets where name = 'BACKLINK_CRON_SECRET')
-- but the secret is actually stored as 'backlink_cron_secret' (lowercase).
-- Postgres string comparison is case-sensitive, so the subquery returned NULL,
-- the header was sent empty, the edge function's fail-closed check treated the
-- call as unauthenticated, and it answered 403 "Neautorizat" — before ever
-- reaching the Open PageRank request.
--
-- That is why backlink_snapshots contains only the manual 8 Aug 2026 import:
-- the scheduled refresh never actually ran. Setting the Open PageRank key had
-- no effect because the request died one step earlier.
--
-- Verified after this change by invoking the same net.http_post by hand: the
-- call now passes the auth gate and reaches the provider.
--
-- cron.schedule() upserts by job name, so this replaces the existing job
-- rather than adding a second one (confirmed: a single backlink job remains).

SELECT cron.schedule(
  'backlink-snapshot-weekly',
  '0 4 * * 1',
  $job$
  select net.http_post(
    url := 'https://pzouzxgswccyhxhpgfwb.supabase.co/functions/v1/backlink-snapshot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'backlink_cron_secret')
    ),
    body := '{"action":"fetch_free"}'::jsonb
  );
  $job$
);
