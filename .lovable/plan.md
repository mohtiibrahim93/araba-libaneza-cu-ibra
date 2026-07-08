## Scope

Four separate changes, planned together, implemented in one pass.

---

### 1. End-to-end payment status page + webhook confirmation

**Route:** `/payment-status?payment_intent=...&registration_id=...` (also reachable via existing `/thank-you` when Stripe redirects back with `payment_intent` + `payment_intent_client_secret`).

**Flow:**
- `Checkout.tsx` `return_url` becomes `/payment-status?registration_id=...&courseType=...` (Stripe appends `payment_intent`, `payment_intent_client_secret`, `redirect_status`).
- New page polls `registrations` row (by `registration_id`) for `payment_status in ('paid','failed','refunded')` with a bounded retry (e.g. 10× / 1s) so the webhook has time to land, while also reading `stripe.retrievePaymentIntent(clientSecret)` for the Stripe-side status as a fallback.
- Shows one of three states: **Loading** ("Confirmăm plata..."), **Success** (green check + amount + link to `/thank-you`), **Failed/Canceled** (red + retry button back to `/checkout`).
- Fires `Purchase` tracking only on confirmed success.

**Webhook side:** `stripe-webhook` already updates `registrations.payment_status` on `payment_intent.succeeded` / `.payment_failed` — no change needed there.

---

### 2. Robust `/checkout` loading state + logging + guard

In `src/pages/Checkout.tsx`:
- Add explicit `phase` state: `initializing → ready → error`. Show a full-card skeleton with spinner + "Se pregătește plata securizată..." while `phase !== "ready"`.
- Guard render: the `PaymentElement` + submit button only mount when `clientSecret`, `stripePromise`, and `amount > 0` are all valid. Otherwise show an inline error card with a "Reîncearcă" button.
- Add `console.info("[checkout] payment-intent response", { amount, currency, hasClientSecret, publishableKeyPrefix })` (never log full clientSecret / full key — only prefix like `pk_live_…`) so the deployed contract is verifiable in the browser console.
- Submit button label always includes the formatted amount; button is disabled only while Stripe is confirming, not while amount is unknown (because we don't render it in that state).

---

### 3. Admin: manual signup offsets ("bookings from WhatsApp/TikTok/etc.")

Goal: let admin bump the "X / Y locuri ocupate" counter without inserting fake registrations.

**Schema (migration):**
- Add `manual_offset INT NOT NULL DEFAULT 0` to `public.group_capacities`.
- Add `manual_offset INT NOT NULL DEFAULT 0` to `public.group_cohorts`.
- Update `get_group_capacity_counts()` RPC to `SELECT form_type, level, count(*) + coalesce(manual_offset,0)` by joining `group_capacities` (LEFT JOIN so counts still appear when no manual row).
- Update `get_cohort_signup_counts()` RPC similarly (add offset from `group_cohorts`).
- Manual offsets are also folded into the value returned so the `/` denominator stays untouched — only `taken` grows.

**Admin UI (`CapacitiesAdmin.tsx`):**
- Reorganize each capacity card into three grouped controls:
  - **Min seats** / **Max seats** (as today).
  - **Manual signups** — number input with `+ / −` buttons and a small label "Din alte surse (WhatsApp, TikTok, direct)". Includes helper text explaining it adds to the online form count and updates `0/10 locuri ocupate` accordingly.
- New admin action in `admin-registrations`: `update_capacity` accepts an optional `manual_offset` field alongside `min_seats` / `max_seats`.
- A parallel small section on the Cohorts admin card (already exists in `CohortsAdmin.tsx`) to set `manual_offset` per cohort (WhatsApp signups tied to a specific start date).

**Result:** setting A1 `manual_offset = 3` on 10 August changes the public banner from `0/10` to `3/10` without lowering max.

---

### 4. Personalized inline forms from the "Alege calea de învățare" section

Currently `ProgramsSection.tsx` mounts `<RegistrationFormSection defaultCourseType="group" embedded />` and `<RegistrationFormSection defaultCourseType="private" embedded />` — the "Tip curs" dropdown still shows all three options.

**Change:**
- Pass `lockSelection` to both embedded mounts so the Tip curs dropdown is hidden (that prop already exists and hides the dropdown when `courseType` is preset).
- `RegistrationFormSection`: when `lockSelection && defaultCourseType === "group"` — course type row is hidden, format (fizic / online) remains with its per-cohort capacity counter (already wired via `useGroupCapacities` and `CohortPicker`).
- When `lockSelection && defaultCourseType === "private"` — course type row hidden; nothing else changes (fizic/online + lesson quantity fields stay as today).
- Adjust `onBack` label / helper text so it reads "Curs de grup" or "Lecții private" instead of the generic "Cursuri".
- Verify draft-restore logic doesn't reopen the wrong card (already guarded by `lockSelection`).

---

## Technical details

**Files touched:**
- `src/pages/Checkout.tsx` — phase state, guard, safe logging.
- `src/pages/PaymentStatus.tsx` (new) + route in `src/App.tsx`.
- `src/lib/i18n.tsx` — copy for payment-status states, manual-offset admin labels.
- `src/components/CapacitiesAdmin.tsx` — manual_offset input.
- `src/components/admin/CohortsAdmin.tsx` — manual_offset input per cohort.
- `src/hooks/useGroupCapacity.ts` — read updated RPC (no shape change; counts already opaque).
- `supabase/functions/admin-registrations/index.ts` — accept `manual_offset` in `update_capacity` + new `update_cohort_offset`.
- One migration:
  1. `ALTER TABLE public.group_capacities ADD COLUMN manual_offset INT NOT NULL DEFAULT 0 CHECK (manual_offset >= 0);`
  2. `ALTER TABLE public.group_cohorts ADD COLUMN manual_offset INT NOT NULL DEFAULT 0 CHECK (manual_offset >= 0);`
  3. Recreate `get_group_capacity_counts()` and `get_cohort_signup_counts()` to fold in the offset. Both remain `SECURITY DEFINER` with `search_path=public`.

**No backend logic change to registration insertion, pricing, or Stripe amount computation.**

**Verification:**
- Insert a test row → toggle A1 `manual_offset` to 3 in `/admin` → confirm `/` banner shows `3/10`, then reset to 0.
- Real registration → `/checkout` renders card fields + amount → complete Stripe test flow → `/payment-status` shows success and `registrations.payment_status = 'paid'`.
- Verify `console.info` log line appears exactly once on `/checkout` load.
