# Centrul de Arabă Libaneză cu Ibra

Bilingual (RO/EN) website and enrollment platform for a Lebanese Arabic
language school in Bucharest: course discovery → registration → Stripe
payment → native booking scheduler → admin lead management.

- **Live site:** https://centruldearabalibaneza.com
- **Stack:** Vite + React + TypeScript + Tailwind + shadcn/ui, Supabase
  (Postgres, Auth, Edge Functions), Stripe, Resend (email), managed by
  [Lovable](https://lovable.dev).
- **Supabase project ref:** `pzouzxgswccyhxhpgfwb`

## How deployment actually works (read this first)

Merging to `main` does **not** change production. Three separate surfaces:

| Surface | How it goes live |
|---|---|
| Frontend | **Publish** in Lovable (syncs two-way with this repo's `main`) |
| Edge functions (`supabase/functions/`) | `supabase functions deploy <name>` with the owner's token, or ask Lovable |
| DB migrations (`supabase/migrations/`) | Supabase SQL editor (all migrations are idempotent), or Lovable |

The Lovable **preview URL** rebuilds from `main` automatically; the production
domain only updates on Publish.

## Where the truth lives

- **Money:** `supabase/functions/_shared/prices.ts` — every amount charged is
  computed server-side here, unit-tested in `src/test/server-prices.test.ts`.
  The Stripe catalog is labels only. Full billing model, webhook + secrets
  configuration, and refund policy: **`docs/GO_LIVE_subscriptions.md`**.
- **Schema:** `supabase/migrations/` (not the product spec — see below).
- **Product intent / QA standard:** `docs/PRODUCT_QA_STANDARD.md` (partly
  aspirational; the status note at its top says what's implemented).
- **Audit history & known gaps:** `AUDIT_BACKLOG.md`.
- **Edge functions:** one directory per function under `supabase/functions/`;
  JWT verification flags in `supabase/config.toml`.

## Local development

```sh
npm i
npm run dev        # vite dev server
npm run build      # production build
npx vitest run     # unit tests (includes the money/price table tests)
npx tsc --noEmit -p .
```

`.env` intentionally contains only the public Supabase URL + anon key so a
fresh clone runs with zero setup. Never put a service-role key or any secret
in it — server secrets live in Supabase → Edge Functions → Secrets.

## Standing rules

`AGENTS.md` is binding (the ownership gate, the `payment_status` vocabulary,
migrations only in `supabase/migrations/`). The owner's standing rules, kept
here from the old handoff:

- Do not modify `public/4ce740356d5ab7d75677bda846853184.txt` (IndexNow key)
  or `public/robots.txt` (one `User-agent: *` group, deliberately; no per-bot
  groups).
- Do not modify `scripts/seoPrerender.ts` or `scripts/prerenderBody.tsx`
  without explicit instruction.
- Keep RO ↔ EN reciprocity: a new or changed route needs both halves.
- All Vitest tests stay green. Never weaken the ownership gate to fix a 403:
  add the step that lets an honest visitor through.
- Do not submit forms with real personal data. Admin screenshots contain real
  names, emails and phones: blur before committing.
- Never put a Supabase access token, a service-role key, a GA4
  service-account JSON or admin credentials in chat or in the repo; they
  belong in Supabase secrets.

## Deploying (the procedure)

Three agents work on this repo (Claude Code, Codex, Lovable) and `main` moves
under a session: always `git fetch` before assuming anything. Lovable credits
are scarce, so bundle a deploy into one request, and check what is already
live first (both checks below are free).

1. **Merge to `main`.** Lovable picks up a push to `main`; its editor must be
   on `main`'s HEAD before anything is deployed or published. Lovable
   **publishes the workspace HEAD at Publish time**; it is not a branch
   watcher. If Lovable warns that a repository push replaced its work, compare
   first: restoring an older Lovable version rolls the editor back and drops
   whatever `main` added since.
2. **Migrations.** Run each new file of `supabase/migrations/` in order
   (Lovable's database tool or the Supabase SQL editor). Production is the
   only database: wrap anything exploratory in `BEGIN; … ROLLBACK;`. Check
   the objects, not the migrations table:

   ```sql
   select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and proname in ('move_booking_atomically', 'trial_already_used');
   select jobname, schedule, active from cron.job order by jobname;
   ```

3. **Edge functions.** Ask Lovable, as a deploy-only message: "DEPLOY ONLY —
   do not edit any code and do not run migrations. Sync the workspace to
   `main` <commit> (verify byte-identical), then deploy: <names>. Reply with
   whether each deployed." A change to a shared module (`_shared/…`) needs
   every function that imports it redeployed.
4. **Publish** the site in Lovable, then **verify the publish**: Vite hashes
   are content-derived, so the live bundle must match a local build of the
   same commit.

   ```bash
   npm run build
   ls .output/public/assets/ | grep '^Trial-'
   curl -s https://centruldearabalibaneza.com/trial \
     | grep -ao '/assets/Trial-[A-Za-z0-9_-]*\.js' | sort -u
   # same hash → published from this commit; different → not published
   ```

   "Publishing was requested" is not "published": compare the hash.
5. **Cron.** `booking-reminders` runs every 15 minutes, and so does
   `booking-calendar-sync` (`20261012140000_calendar_sync_every_15_min`).
   The calendar-sync job clones the reminders job's command, so it silently
   does nothing if that job is removed: after any change there, read
   `cron.job` itself.

An anonymous visitor's view of an edge function (only the public key):

```bash
set -a && . ./.env && set +a
U="$VITE_SUPABASE_URL"; K="$VITE_SUPABASE_PUBLISHABLE_KEY"
curl -s -w '\nHTTP %{http_code}\n' -X POST "$U/functions/v1/<fn>" \
  -H "apikey: $K" -H "Authorization: Bearer $K" -H 'Content-Type: application/json' -d '{}'
```

## Environment notes

- Gates: `npx vitest run`, `npx tsc --noEmit -p .`, `npm run build`. ESLint
  has failed in the cloud container (`ajv` / `defaultMeta` TypeError).
- `npm run build` also regenerates `public/sitemap.xml` from git dates; a
  local build rewrites the dates, so do not commit that file unless a route
  changed.
- `npm run build` runs `scripts/guardWorkerRuntime.mjs`, which patches
  `createRequire(import.meta.url)` in `.output/server`. Not cosmetic: without
  it every SSR route 500s on Lovable's host while static assets still serve.
- The site's tsc does not cover the Deno edge functions. Check them with
  `deno check` where Deno is available, or at least with
  `supabase/functions/tsconfig.check.json` (name resolution, see
  `src/test/edge-function-names.test.ts`).
- Two copies of the email templates are both live-capable:
  `src/lib/email-templates/` (site route `src/routes/lovable/email/auth/webhook.ts`,
  the one configured in Supabase for auth emails) and
  `supabase/functions/_shared/transactional-email-templates/` (the edge
  functions). Change both.
- Supabase treats a first-time visitor's email code as a **signup**, so the
  signup template carries the code too; the code length (6) is a Supabase
  dashboard setting. `auth.users.confirmation_token` is a hash, not the code.
- reCAPTCHA v3 lives in Google Cloud project `1060524901775`. If it breaks
  again, a new key needs the site key in `src/lib/recaptcha.ts` and
  `__root.tsx`, and `RECAPTCHA_SECRET_KEY` set through Lovable. The form only
  blocks on Google's own low score; a verify error lets the visitor through.
- Lovable project `b6dbaaf5-f5c4-4603-a0e4-cbbbddd78e67`, workspace
  `h4MoYRUNZUYzXyaEnLT2`; Supabase project ref `pzouzxgswccyhxhpgfwb`.
- The connected Gmail is `marhaba@centruldearabalibaneza.com`; a `+alias` of
  it receives test codes. Two confirmed test users are the owner's on
  purpose: `marhaba+e2etrial@…` and `mohtiibrahim+e2etrial@gmail.com`.
- The cloud container's proxy refuses `maps.app.goo.gl` and `g.page`: a
  `000` / `curl: (56)` there means blocked, not dead. Chromium and
  Playwright are preinstalled; do not run `playwright install`.
- The lockfile is `bun.lock`.
