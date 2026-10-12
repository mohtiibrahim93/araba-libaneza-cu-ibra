# Handoff — centruldearabalibaneza.com

Written 2026-10-09. Repo `mohtiibrahim93/araba-libaneza-cu-ibra`.
Owner/teacher: Ibrahim Gabriel Mohti ("Ibra"). Lebanese Arabic school, Bucharest.

## State

- Branch `claude/blog-cms-migration-tli9p7` and `main` are both at **`8a4854c`**. Working tree clean, everything pushed.
- `842` tests pass (`npx vitest run`), `npx tsc --noEmit -p tsconfig.json` clean, `npm run build` clean.
- One untracked file: this one. Not committed on purpose.

## ⚠️ The one thing that must happen first

**Nothing from the last three commits is live.** The site was last published from `3d72ba2`;
edge functions were last deployed from `3d72ba2` (five of them: `admin-registrations`,
`booking-manage`, `booking-availability`, `notify-registration`, `booking-reminders`).

To go live from `8a4854c`:

1. Deploy **`create-checkout-session`** — the only thing under `supabase/functions/` that changed
   since `3d72ba2` (verify with `git diff --name-only 3d72ba2..HEAD -- supabase/functions/`).
   Do **not** redeploy the other four; they are current.
2. **Publish the site.** This half matters more than usual: the auth email hook is a *site route*
   (`src/routes/lovable/email/auth/webhook.ts`), not an edge function, so the six-digit code does
   not reach anybody's inbox until the site is published.

Deploys go through Lovable (project `b6dbaaf5-f5c4-4603-a0e4-cbbbddd78e67`, workspace
`h4MoYRUNZUYzXyaEnLT2`). Lovable publishes **workspace HEAD at Publish time** — it is not a branch
watcher, so it has to sync to `main` first. There is no branch setting to configure.

I was mid-way through sending that deploy request when the owner stopped me. It was never sent.

## The live bug this was all about: the free trial

**The public cannot book a free trial, and has not been able to since 7 October.**

`create-checkout-session` and `booking-create` both call `verifiedRegistrationOwner`, which requires
a Supabase Auth session whose confirmed email matches the registration's email. Lovable added that in
`518b6b3` (7 Oct 15:24); it went live with the `0d27a4a` deploy on 8 Oct. A first-time visitor has no
account at all, so the card step answers **403 "Sign in with your verified registration email to
continue"** and the trial cannot be completed.

Verified against the live function, not inferred:

```
POST $SUPABASE_URL/functions/v1/create-checkout-session
  (anon key as bearer, a real registration id, setup:true)
→ 403 {"error":"Sign in with your verified registration email to continue"}
```

The 403 happens before the Stripe client is constructed, so that probe has no Stripe side effect.

Corroborating data: the last trial that completed end-to-end was 7 Oct (`b6aa621b`, `card_saved`,
1 booking). The owner's two attempts on 9 Oct are both in `registrations`: `644a33a2` has a Stripe
session (he was signed in as himself), `a58dd642` has none (he was not). Nothing since has booked.

### The decision the owner made

He was offered three options and chose: **keep the gate, add an email-code step.** Verbatim:

> Option B — Email code before the card step, but optimize it for minimal friction.
> Do not require visitors to create an account or sign in. Send a 6-digit verification code to the
> email entered during registration. Preserve the selected trial slot and all registration
> information during verification. Allow code resending, with expiration and rate limiting. Once
> verified, continue automatically to the card step without asking the visitor to repeat anything.
> Verify the code securely on the server, not just in the frontend. Ensure visitors cannot bypass
> verification by directly calling the booking or checkout functions. Prevent duplicate free-trial
> registrations and apply reasonable abuse protection. Do not introduce unnecessary friction into
> the booking funnel. Test the complete process in a fresh incognito session as a first-time public
> visitor, without an existing login.

Note the constraint behind it: `AGENTS.md` mandates the gate ("Verify subscription, checkout and
visitor booking ownership with Auth-confirmed email matched to stored registration email; preserve
only the existing trusted webhook booking path"). **Do not weaken either edge function to fix this.**
`src/test/trial-email-verification.test.ts` fails if you do.

### What is already implemented (commit `157e1bf`)

Done through Supabase Auth OTP rather than a homemade code table — that is what makes it work:
`verifyOtp` is the server-side check, Auth's own expiry and per-address rate limits apply, and the
session it returns is exactly what the two edge functions already accept. Neither function's
security changed.

- `src/components/NativeScheduler.tsx`
  - `alreadyVerified(addr)` — skips the screen when Auth already holds a confirmed matching session.
    Signs out a session for a *different* address first (Supabase keeps one per client; this does log
    an admin out of the panel in the same browser if they book under another address — known, noted
    in a comment, judged the rarer case).
  - `sendCode(addr)` → `supabase.auth.signInWithOtp({ shouldCreateUser: true })`, 60s resend cooldown.
  - A `verifyFor` render branch: the code screen. It is a **branch of the same component, not a
    route**, which is how the slot/name/phone/notes/format survive with nothing re-entered. It shows
    the chosen slot so it is visible nothing was lost. `autoComplete="one-time-code"`,
    `inputMode="numeric"`, `maxLength=6`.
  - `startTrialCardStep(regId, slotIso)` — extracted, called on success and when already verified.
  - `readFunctionError` — pulls the JSON body off a `FunctionsHttpError` so `trial_used` / `conflict`
    survive instead of degrading to a generic toast.
- `supabase/functions/create-checkout-session/index.ts` — one free trial per person is now checked
  **before** the Stripe call. `booking-create`'s check runs on the webhook, i.e. after the card is
  saved, so a second attempt used to pay the whole friction, save a card, then be refused.
- `src/lib/email-templates/signup.tsx` **and** `magic-link.tsx` + `src/routes/lovable/email/auth/webhook.ts`
  — both now render the six-digit code above their existing button.

**The non-obvious part, do not undo it:** Supabase treats a first-time visitor's confirmation as a
**signup**, not a magic link, so it sends the *signup* email. Putting the code only in the
magic-link template — the obvious place — would have covered everyone except the people the change
is for. Confirmed from the live DB: after `POST /auth/v1/otp` for a brand-new address,
`auth.users.confirmation_token` and `confirmation_sent_at` were set and `email_confirmed_at` was
null, which is the signup flow. Both templates keep their link, because `AdminLogin.tsx` and
`StudentAccount.tsx` send the same emails and expect one.

`auth.users.confirmation_token` is a 56-char **hash**, not the six digits — you cannot read the code
out of the database. You need the inbox.

### What is NOT done

**The end-to-end run the owner explicitly asked for.** It needs the publish first (see above),
because the email hook is a site route. Then:

- Chromium + Playwright are preinstalled; `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`. **Do not run `playwright install`.** A fresh browser context
  is the incognito equivalent.
- Use an address on a mailbox you can actually read. The connected Gmail in my session was
  **`marhaba@centruldearabalibaneza.com`**, *not* `mohtiibrahim@gmail.com` — I wasted a round trip on
  that. A `+alias` of the readable mailbox (e.g. `marhaba+e2etrial@…`) keeps the registration row and
  the Auth user distinct and avoids tripping the duplicate-trial check.
- Stop at "the Stripe page loaded". That alone proves the 403 is gone. Saving a card is a real
  (0-lei) setup on their Stripe account.
- Also worth checking once live: Supabase Auth's OTP expiry setting, and that the Romanian copy on
  the code screen reads properly on a phone.

### Loose ends I created, deliberately left

- `auth.users` has `mohtiibrahim+e2etrial@gmail.com` (id `779d58c4-d203-4aa2-88eb-b2729fab67fc`) from
  my OTP probe. `email_confirmed_at` was set at 09:26 — somebody followed the link in that email, so
  I did not delete a row the owner may have just interacted with. Safe to remove if he confirms it
  was him testing.
- Four `registrations` rows from the owner's own attempts this morning (2 `trial`, 2 `private`, all
  `lead_status: incomplete`). Not mine to delete.

## Everything else that shipped today, for context

All pushed, all unpublished until the deploy above.

- **`03134aa` Yalla corrections.** Lovable separated the published card text from the correction
  records, but wrote the migration only to `drizzle/migrations/`, which this repo does not read.
  `supabase/migrations/` still said the opposite, so a fresh DB would have re-opened the public read.
  Added `supabase/migrations/20261009070000_yalla_card_overrides_private.sql`, and revoked
  `anon`/`authenticated` on `yalla_card_override_history` (Supabase grants those by default, so
  RLS-with-no-policy was the only thing denying them) — applied to the live DB too. Verified with the
  published anon key: `get_published_card_overrides()` → 200 with exactly `card_id, ar, ro, variants`;
  direct reads of both tables → `42501`. The overlay table holds **0 rows**, so nothing was at risk
  either way. **The owner's position: this item is closed.** He never saw a security warning — that
  phrasing came from me, and Lovable's own scan returns no findings. Do not reopen it.
- **`a2074ce` admin tables.** `useHorizontalOverflow` + a fade + a focusable labelled region when a
  row continues past the right edge. The keyboard half is not decoration: an unfocusable scroll div is
  genuinely unreachable without a pointer. "Lecții" and "Parcurs" were named in the same complaint but
  have no table — they are grid-based, nothing to do.
- **`bdaa085`** four unrelated fixes: private lessons now reach "Pasul 3 din 3" on the payment screen
  (the heading said step 2 while you paid); `src/components/admin/TimeField.tsx` replaces
  `<input type="time">` in Disponibilitate and kids slots, because the native input renders in the
  *browser's* locale and showed `12:00 PM` — no attribute forces 24-hour, so the only fix is not to
  ask the browser for a clock; the cash/transfer/PayPal alternatives now say the place is not held
  until the money arrives (**the three methods themselves stay — an earlier pass of mine started
  deleting them, which was wrong and was reverted; nothing was committed**); and the two Google
  Business links are now one verified identity, CID `0x652fb90494e1566b` = `7291249751064925803`,
  with `g.page/r/<key>` decoded arithmetically because this sandbox cannot reach `goo.gl` at all.
- **`6f48986` reCAPTCHA.** Badge hidden on every route; Google's required sentence now lives in the
  footer and beside the consent box (`src/components/RecaptchaNotice.tsx`). Hiding the badge and
  showing the notice are one decision and easy to half-undo — `src/test/recaptcha-badge.test.ts`
  asserts both halves. `visibility: hidden`, not `display: none` (the badge is an iframe the API
  talks to). `AdminChromeMarker` was deleted: the rule is global now and nothing read the flag.
- **`8a4854c`** Lovable's new cookie banner sat at z-60 over the WhatsApp/phone buttons from 768px up;
  added `md:bottom-32`. Same corner, same complaint the owner raised about the badge.

Lovable also pushed `535b9ff` + `2f3757c` mid-session (built-in consent banner with Google Consent
Mode v2, replacing the expired Adopt CMP, plus a privacy-policy update). I rebased onto them; the
merge was clean.

## Still open

Not blocked, just not done:

- Cohorte has roughly 12 unlabelled row controls (missing `aria-label`).
- `compatibility_date` in the generated `wrangler.json` is the build date (nitro generates it; there
  is no `wrangler.toml` in the repo).

Blocked on the owner:

- GA4 phase two needs the numeric property ID and a service-account JSON.
- Google Business short-links: he said drop it if unimportant. I solved it instead (see `bdaa085`).
- "Admin cancel inside 24h": the 24-hour rule exempts him so he can always cancel. Never tested in
  the real panel — and his attempt to test it is what surfaced the trial 403, so retest after deploy.
- He asked for the embedded, no-redirect payment (which private lessons now have) **everywhere on the
  site instead of Stripe redirects**. Not started. Scope it before building: group checkout,
  subscriptions and the kids deposit all currently redirect.

## Environment notes that will save you time

- `npm run build` runs `scripts/guardWorkerRuntime.mjs`, which patches
  `createRequire(import.meta.url)` → `createRequire(import.meta.url || "file:///")` in
  `.output/server`. That is not cosmetic: unguarded, `import.meta.url` is undefined on Lovable's host,
  the module throws at load, and **every SSR route 500s** while static assets keep serving. It is not
  reproducible under `wrangler dev`, which defines `import.meta.url`. The script lives in the repo so a
  workspace reset cannot delete it. Leave it wired into `build`.
- **ESLint is broken in this container** (`ajv` / `defaultMeta` TypeError from `@eslint/eslintrc`).
  Use `tsc --noEmit` + `vitest` as the gates.
- The outbound proxy **403s `maps.app.goo.gl` and `g.page` on CONNECT**. A `000`/`curl: (56)` there
  means the proxy blocked it, not that the link is dead. Don't report it as verified either way.
- Supabase project ref `pzouzxgswccyhxhpgfwb`. `.env` is committed and holds only the anon/publishable
  key (deliberate — see `AUDIT_BACKLOG.md`); there is no service-role key in the repo and there must
  never be.
- Lockfile is `bun.lock`, not `bun.lockb`.
- Live SQL and one-off DB checks went through Lovable's `query_database` against the production
  database. There is no staging. Wrap anything exploratory in `BEGIN; … ROLLBACK;`.

## Hard constraints (standing, from the owner)

- Do **not** modify `public/4ce740356d5ab7d75677bda846853184.txt` (IndexNow verification key).
- Do **not** modify `public/robots.txt` — the single wildcard `User-agent: *` group is deliberate;
  no per-bot groups like `Google-Extended` or `GPTBot`.
- Do **not** modify `scripts/seoPrerender.ts` or `scripts/prerenderBody.tsx` without explicit
  instruction.
- Keep RO ↔ EN reciprocity: any new or changed route needs both halves.
- All existing Vitest tests must stay green.
- The assistant must not submit forms with real personal data.
- Never paste a Supabase personal access token, GA4 service-account JSON or admin credentials into
  chat — they belong in Supabase secrets. Never disable TLS verification or unset `HTTPS_PROXY`.
- Admin screenshots contain real student names/emails/phones; blur before committing.
- `AGENTS.md` is binding, including for Lovable. Two rules matter most: the ownership gate above, and
  `registrations.payment_status` — `unpaid`, `pending` and `failed` are **distinct states, never
  merged or migrated into one another**. The full vocabulary is documented above `paymentStatusLabels`
  in `src/components/admin/types.ts` and enforced by `src/test/payment-status-vocabulary.test.ts`.
  I got this wrong once and wrote a migration merging `unpaid` into `pending`; it was deleted before
  it ran. Don't repeat it.
