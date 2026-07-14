# Payments — operations reference

Single source of truth for how billing works in production and how to
re-provision it from scratch. Supersedes the original go-live checklist
(steps 1–4 of that checklist were executed in July 2026; what remains is
listed at the bottom).

- Supabase project ref: `pzouzxgswccyhxhpgfwb`
- Stripe account: `acct_1KkpVEInUEhMEuJr` (live)
- Live site: https://centruldearabalibaneza.com (hosted by Lovable)

**Deploy topology (important):** pushing to `main` does NOT change the live
site. The frontend goes live only when the project is **Published in Lovable**.
Edge functions deploy separately (`supabase functions deploy <name>` with the
owner's token, or by asking Lovable). DB migrations are applied via the
Supabase SQL editor or Lovable. The code authority for money amounts is
`supabase/functions/_shared/prices.ts` (unit-tested in
`src/test/server-prices.test.ts`); the Stripe catalog is display/labels only —
no code path reads a Stripe Price object.

---

## 1. Pricing model (what customers are charged)

All amounts are computed **server-side** from `_shared/prices.ts`, keyed by the
`level` + `format` persisted on the registration row. Client-supplied amounts
are never trusted.

**Group courses (adults, A1–C2)** — two plans, chosen at registration:

- **Monthly subscription** (default): `groupMonthlyUnitAmount(level, format)`
  per month — online A1 500 → C2 1000 RON; fizic = online × 1.4. Billed
  monthly by a Stripe subscription that **stops automatically** after
  `groupMonthsFor(level)` charges via `cancel_at`.
- **Pay in full**: whole course upfront with **10% off** —
  `round(monthly × months × 0.9)` as one PaymentIntent.

A "month" = 8 lessons (2 lessons/week). Months per level = `ceil(lessons / 8)`:

| Level | Lessons | Monthly charges |
|---|---|---|
| A1 | 32 | 4 |
| A2 | 54 | 7 |
| B1 / B2 / C1 | 70 | 9 |
| C2 | 80 | 10 |

**Kids group** — 3-month course at 500 RON/month: monthly subscription
(3 × 500) or pay-in-full 1350 RON (−10%). Waitlist deposit stays a separate
125 RON hosted-checkout payment (`create-checkout`, `kids_deposit`).

**Private lessons** — one-time PaymentIntent, **150 RON flat per lesson in
every format** (the ×1.4 fizic surcharge applies to group only). Packs of
20+ lessons get **15% off**.

**Legacy note:** `create-subscription` still contains a `quantity >= 3 → −10%`
monthly discount branch. It is **dead code in practice** — production group
registrations always persist `quantity = 1` (PR #15). Do not "fix" prices by
touching it; if you remove it, remove it knowingly.

## 2. Payment flows (which function does what)

| Flow | Edge function | Stripe object |
|---|---|---|
| Group/kids **monthly** | `create-subscription` | Subscription (`payment_behavior: default_incomplete`, first invoice confirmed in-page; client secret read from `invoice.confirmation_secret` — API `2025-08-27.basil`) |
| Group/kids **pay-in-full**, **private** | `create-payment-intent` | PaymentIntent (embedded PaymentElement) |
| Kids waitlist **deposit** | `create-checkout` | Hosted Checkout Session (125 RON) |
| **Hosted fallback** (any flow) | `create-checkout-session` | Hosted Checkout Session on stripe.com |

The hosted fallback exists because ad blockers / privacy browsers can block
`js.stripe.com`, killing the embedded card form. `/checkout` detects the
failed load (including a 6 s watchdog for silent hangs, and `?fallback=1` to
force it) and offers "Continuă pe pagina securizată Stripe", which calls
`create-checkout-session` and redirects to Stripe's own page — a plain
navigation blockers don't touch. Amounts come from the same server price
table. For hosted **subscriptions**, the webhook (`checkout.session.completed`)
links the new subscription to the registration, sets `months_paid`, and sets
`cancel_at` anchored to the subscription's start, since hosted sessions can't
set a fixed end date at creation.

## 3. Cancellation & refund policy (group subscriptions)

Admin-only, via the **"Anulează abonament"** button in `/admin`
(`admin-registrations` actions `preview_cancel_subscription` /
`cancel_subscription`):

- Cancelling always stops all future charges immediately.
- The current already-paid month is refunded **only within a 5-calendar-day
  grace window** from the billing period start, prorated by unused days:
  `round(amount_paid × remainingDays / daysInPeriod)` — computed server-side
  against the latest paid invoice's charge. Outside the window: no refund.
- `canceled_at` and `refunded_amount` are recorded on the registration row.

## 4. Required configuration (recoverable nowhere else)

### Supabase edge-function secrets

| Secret | Used by | Value |
|---|---|---|
| `STRIPE_SECRET_KEY` | all payment functions | live `sk_…` (Stripe → Developers → API keys) |
| `STRIPE_PUBLISHABLE_KEY` | create-subscription / create-payment-intent | live `pk_…` |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook | `whsec_…` of the endpoint below — **never roll it without updating this secret in the same minute** |
| `STRIPE_GROUP_PRODUCT_ID` | create-subscription | `prod_UqzC8u35FCYFfy` ("Curs de grup — Araba Libaneză"). Group checkout errors clearly if unset. |
| `ADMIN_EMAILS` | admin-registrations | comma-separated Google-auth admin allowlist |
| `RESEND_API_KEY` (+ email config) | send-transactional-email | transactional email sending |

Set in Supabase → Edge Functions → Secrets. `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` are injected automatically.

### Stripe webhook endpoint (Dashboard → Developers → Webhooks)

- URL: `https://pzouzxgswccyhxhpgfwb.supabase.co/functions/v1/stripe-webhook`
- Events the handler consumes — the endpoint must deliver **all** of these:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `invoice.paid` ← marks subscription months paid ("Abonament: N/M luni")
  - `invoice.payment_failed` ← sets `past_due`
  - `customer.subscription.deleted` ← marks the subscription ended/canceled
  - `charge.refunded`
- Symptom when the three `invoice.*`/`subscription.*` events are missing: a
  paid monthly subscription stays "În așteptare / 0/N luni" in `/admin`.
  Fix: add the events to the existing endpoint (do **not** create a second
  endpoint or roll the signing secret), then Stripe → the event → "Resend".

### Stripe Dashboard settings (live values as configured)

- Public business name: **CENTRUL DE ARABA LIBANEZA**; support phone
  0763 124 514; website centruldearabalibaneza.com. (Support email: set to
  marhaba@centruldearabalibaneza.com when convenient — was still empty at the
  last check.)
- Statement descriptor: **CENTRUL ARABA LIBANEZA**, shortened descriptor
  **CEARLI**. (These are the production values — an older revision of this
  document listed `ARABA LIBANEZA`/`ARABALIB`, which was never final.)
- Branding: logo + cedar-green accent set. Customer emails for successful
  payments and refunds: enabled.
- Catalog (labels only, not read by code): `prod_UqzC8u35FCYFfy` group,
  `prod_Ur3Qtu1x1gHJRb` private, `prod_UrOsBMkkQDllxD` kids,
  `prod_Ur3GheCKkio8Ps` free trial (0 RON reference). Legacy products/prices
  are archived, not deleted (Stripe has no price-delete API).

### Database

Migration `supabase/migrations/20260710090000_group_subscription_columns.sql`
(applied; idempotent) adds to `registrations`: `stripe_subscription_id`,
`months_total`, `months_paid`, `subscription_status`, `canceled_at`,
`refunded_amount`.

## 5. Remaining verification before publishing the frontend

1. **Real-card test on the preview URL** (standalone browser tab, NOT inside
   the Lovable editor): group A1 online monthly → pay 500 RON → `/admin` shows
   "Plătit" + "Abonament: 1/4 luni" (proves the `invoice.paid` webhook) →
   "Anulează abonament" → near-full prorated refund (proves cancel + refund +
   `customer.subscription.deleted`).
2. Only after that passes: **Publish in Lovable** — this is what puts the plan
   selector, per-format prices, kids flow, GDPR page, and hosted fallback on
   the live domain. Until then the live site keeps the old one-time group
   charge; nothing breaks in the interim.
