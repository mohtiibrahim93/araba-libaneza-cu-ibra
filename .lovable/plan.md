# Why the error appears even without a VPN

The message you're seeing ("Nu am putut încărca modulul de plată securizat…") is **our own fallback text** on `/checkout`. It fires whenever `loadStripe()` — the call that fetches `https://js.stripe.com/v3/` into the browser — resolves to `null` or throws.

There is no VPN check anywhere in Stripe or in our code. That copy just lists the *usual* culprits. In practice, `loadStripe()` also fails for other reasons that have nothing to do with a VPN:

- **Brave Shields** (default-on, blocks js.stripe.com as a tracker)
- **Firefox strict tracking protection / private mode**
- **Safari with "Prevent cross-site tracking"** on some networks
- **DNS-level ad blocking** on the router or ISP (NextDNS, Pi-hole, AdGuard DNS, some mobile carriers in RO)
- **Corporate / school Wi-Fi** with TLS inspection or category filtering
- **Browser extensions** (uBlock, Ghostery, Privacy Badger, Kaspersky, ESET, Malwarebytes Browser Guard, some antivirus web-shields)
- **A stale service worker** from an older deploy caching a failed js.stripe.com fetch

We already confirmed the backend side is healthy in the pre-launch check: `create-payment-intent` and `create-subscription` return valid `clientSecret` + `publishableKey`, and `STRIPE_PUBLISHABLE_KEY` starts with `pk_`. So this is purely a **browser-side load of `js.stripe.com`** failing on the user's device/network.

# Fix: add a hosted-Stripe-Checkout fallback

Right now `/checkout` only supports **embedded Stripe Elements**, which requires `js.stripe.com` to load in the visitor's browser. If that script is blocked, there is no way to pay. We'll add a second path that redirects to **Stripe's own hosted Checkout page** (`checkout.stripe.com`), which most blockers don't touch and which renders the card form on Stripe's domain instead of ours.

## Changes

1. **New edge function `create-checkout-session`** (Stripe Checkout Sessions API)
   - Accepts `{ registrationId }`.
   - Reads the registration row (same server-side price logic as `create-payment-intent` / `create-subscription`, no client-supplied amounts).
   - For `group` / `kids` monthly → `mode: "subscription"` with `cancel_at` after `groupMonthsFor(level)` months, same 3+ volume discount.
   - For `private` and pay-in-full → `mode: "payment"`.
   - `success_url` = `/payment-status?registrationId=…`, `cancel_url` = `/checkout?...&fallback=1`.
   - Reuses in-flight session via idempotency key `checkout_<registrationId>`.
   - Registered in `supabase/config.toml` with `verify_jwt = false`.

2. **`stripe-webhook`**: already handles `checkout.session.completed` and `checkout.session.async_payment_succeeded` — no change needed.

3. **`src/pages/Checkout.tsx`**
   - When `stripeLoadFailed === true` **or** when the URL has `?fallback=1`, show a big primary button: **"Continuă pe pagina securizată Stripe"** that calls `create-checkout-session` and does `window.location.href = data.url`.
   - Keep the current copy as a smaller secondary hint ("Dacă folosești Brave/adblock…").
   - Add a 6-second watchdog: if `stripePromise` hasn't resolved after 6 s, also flip to the fallback UI (covers slow-timeout blockers that never reject).
   - Log a single `console.warn` with `{ userAgent, cookieEnabled, online: navigator.onLine }` so future reports are diagnosable without exposing keys.

4. **`RegistrationForm/PostSubmitView.tsx`** (only if it currently deep-links straight into `/checkout` — I'll confirm during exploration): no behavior change, still lands on `/checkout`; the fallback is picked up there.

## What this does NOT change

- No pricing logic changes.
- No change to `create-payment-intent`, `create-subscription`, or webhook.
- Embedded Elements stays the default; hosted Checkout is only offered when the embedded path can't load.
- Frontend not published — you keep testing on preview first.

## Technical notes

- Hosted Checkout renders on `checkout.stripe.com`, which is a **first-party navigation**, so Brave Shields / tracker blockers that target third-party scripts don't block it. Users whose browser blocks *all* Stripe domains will still fail — for those we keep the WhatsApp fallback link, which stays visible on the error card.
- Subscription hosted-checkout uses `subscription_data.metadata.registration_id` so `invoice.paid` still matches by `stripe_subscription_id` in the webhook. One-time uses `payment_intent_data.metadata.registration_id` (already handled by the `payment_intent.succeeded` branch that matches on `registration_id`).
- Idempotency key on session create prevents duplicate sessions on double-click; if a prior session is still `open`, we return its `url` instead of creating a new one.
- No new secrets required; uses the existing `STRIPE_SECRET_KEY`, `STRIPE_GROUP_PRODUCT_ID`, and `STRIPE_WEBHOOK_SECRET`.

## Verification after implementation

1. Deploy `create-checkout-session`, redeploy `stripe-webhook` (no code change but re-verify).
2. On preview `/checkout?...&fallback=1`, click the fallback button → confirm redirect to `checkout.stripe.com`.
3. Complete a real-card test end-to-end; confirm `/payment-status` marks the row `paid`.
4. Delete the throwaway registration + cancel/refund the test payment in Stripe.

Then you can publish.
