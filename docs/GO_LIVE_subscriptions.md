# Go live: group monthly subscriptions

Everything in code is merged to `main` (PRs #11, #12). These steps activate it.
They run against **your** Supabase project and **your** Stripe account, so they
need your credentials — none of this requires Lovable except re-publishing the
frontend (last section).

Supabase project ref: `pzouzxgswccyhxhpgfwb`

---

## 1. Apply the DB migration

Supabase → **SQL Editor** → run (idempotent, safe to re-run):

```sql
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS months_total integer,
  ADD COLUMN IF NOT EXISTS months_paid integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_amount integer;

CREATE INDEX IF NOT EXISTS registrations_stripe_subscription_id_idx
  ON public.registrations (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
```

(Source file: `supabase/migrations/20260710090000_group_subscription_columns.sql`.)

## 2. Deploy the 3 edge functions

New: `create-subscription`. Updated: `stripe-webhook`, `admin-registrations`.

```bash
supabase login          # paste a token from Supabase → Account → Access Tokens
supabase link --project-ref pzouzxgswccyhxhpgfwb
supabase functions deploy create-subscription stripe-webhook admin-registrations
```

## 3. Create the Stripe product + set the secret

`create-subscription` bills each subscription with an inline monthly price against
one shared product, so you only need **one** product (no Price objects).

- Stripe (**Test** mode) → Products → create **"Curs de grup — Araba Libaneză"**
  (no fixed price needed) → copy its `prod_…` id.
- Supabase → Edge Functions → **Secrets** → add `STRIPE_GROUP_PRODUCT_ID = prod_…`.
- Repeat in **Live** mode when ready and swap the secret to the live `prod_…`.

Until this secret is set, group checkout returns a clear error and nothing charges.

## 4. Stripe Dashboard branding

Set in **both Test and Live** mode (Stripe → Settings):

- **Public details:** public business name `Centrul de Araba Libaneză`, support
  email, support phone `0763 124 514`, website `centruldearabalibaneza.com`.
- **Statement descriptor:** full `ARABA LIBANEZA` (≤22 chars), short/prefix
  `ARABALIB` (≤10, used for subscriptions).
- **Branding:** square logo/icon, brand accent color (cedar green).
- **Customer emails:** enable *Successful payments* and *Refunds*.
- **Invoice template:** memo/footer with the school name + contact.

The subscription already carries the description
"Curs de grup Araba Libaneză — abonament lunar" on every invoice.

## 5. Verify in TEST mode before Live

1. Create an A2 group registration and run checkout — first month should charge
   (A2 online 600 / fizic 840 RON).
2. Use a **Stripe test clock** to advance months: confirm it bills 7 times
   (A2 = ceil(54 lessons / 8)) then auto-cancels via `cancel_at`, and each
   `invoice.paid` bumps `months_paid`.
3. Admin → **Anulează abonament**: on day 2 of a period a prorated refund is
   issued; on day 20 no refund (5-day grace window).

Month counts per level: A1 4, A2 7, B1/B2/C1 9, C2 10 (= ceil(lessons / 8)).

## 6. Publish the frontend

The live site must be re-published so group checkout calls the new subscription
flow. This is the only Lovable-dependent step (or move hosting to another static
host serving the Vite build). Until then the live site keeps charging group
courses the old one-time way — nothing breaks.

---

**Safety:** private one-time lessons are unchanged throughout. The subscription
path is inert until steps 1–3 are done, so deploying the backend early cannot
break the current site.
