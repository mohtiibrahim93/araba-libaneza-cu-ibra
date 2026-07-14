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
npx tsc --noEmit -p tsconfig.app.json
```

`.env` intentionally contains only the public Supabase URL + anon key so a
fresh clone runs with zero setup. Never put a service-role key or any secret
in it — server secrets live in Supabase → Edge Functions → Secrets.
