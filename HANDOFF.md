# Handoff — centruldearabalibaneza.com

The single handoff for this repo. It merges three earlier files — `HANDOFF.md`
(12 Oct 2026), `HANDOFF-codex.md` (9 Oct) and `docs/CLAUDE_HANDOFF.md` (SEO,
1 Sep, originally in Romanian) — without repeating anything. The originals are
in git history at `124db82`.

Repo `mohtiibrahim93/araba-libaneza-cu-ibra`. Owner/teacher: Ibrahim Gabriel
Mohti ("Ibra"). Lebanese Arabic school in Bucharest. Site is RO/EN, admin is
Romanian only. Stack: Vite + React + TS + Tailwind, backend Supabase via
Lovable Cloud.

Three agents work on this repo: Claude Code, Codex (merged PRs #47 and #48) and
Lovable (which both edits and deploys). `main` has moved under a session more
than once. Always `git fetch` and check before assuming anything.

---

## 1. Hard constraints — read before changing anything

`AGENTS.md` is binding, including for Lovable. Two rules matter most:

1. **The ownership gate.** Verify subscription, checkout and visitor booking
   ownership with an Auth-confirmed email matched to the stored registration
   email; preserve only the existing trusted webhook path. **Never weaken it to
   fix a 403** — add the step that lets an honest visitor through (see §4).
   `src/test/trial-email-verification.test.ts` fails if either edge function is
   weakened.
2. **`registrations.payment_status`.** `unpaid`, `pending` and `failed` are
   distinct states and must never be merged or migrated into one another.
   `unpaid` = no payment attempted; `pending` = an attempt is open; `failed` =
   declined. Documented above `paymentStatusLabels` in
   `src/components/admin/types.ts`, enforced by
   `src/test/payment-status-vocabulary.test.ts`. A migration merging `unpaid`
   into `pending` was once written by mistake and deleted before it ran.

Standing, from the owner:
- Do **not** modify `public/4ce740356d5ab7d75677bda846853184.txt` (IndexNow key).
- Do **not** modify `public/robots.txt` — the single `User-agent: *` group is
  deliberate; no per-bot groups like `Google-Extended` or `GPTBot`.
- Do **not** modify `scripts/seoPrerender.ts` or `scripts/prerenderBody.tsx`
  without explicit instruction.
- Keep RO ↔ EN reciprocity: any new or changed route needs both halves.
- All existing Vitest tests must stay green.
- Do not submit forms with real personal data.
- Never put a Supabase personal access token, GA4 service-account JSON or admin
  credentials in chat — they belong in Supabase secrets. Never disable TLS
  verification or unset `HTTPS_PROXY`.
- Admin screenshots contain real student names, emails and phones; blur before
  committing.

## 2. State as of 12 October 2026

- `main` at `124db82`. 972 tests passed (`npx vitest run`) at `e9c76e3`;
  `tsc --noEmit` and `npm run build` clean.
- Three remote branches are fully merged into `main` and safe to delete:
  `gpt-work`, `codex/admin-course-clarity`, `codex/audit-booking-reliability`.
  (`yalla-app-ios` and `yalla-app-ios-screenshots` were not assessed.)

### The 12 Oct deploy (Lovable, 0.7 credits) — three parts, judge separately

**Edge functions: DEPLOYED.** All twelve, from workspace `0a75fe99`:
`admin-registrations`, `auth-email-hook`, `booking-availability`,
`booking-create`, `booking-manage`, `booking-reminders`, `calendar-feed`,
`calendar-sync` (first deploy ever), `create-checkout`,
`create-checkout-session`, `create-payment-intent`, `create-subscription`. The
whole set was deployed because Codex changed shared modules most functions
bundle (`_shared/booking.ts`, `_shared/calendar-reconciliation.ts`,
`_shared/group-enrolment.ts`).

**Site publish: UNCERTAIN.** After the deploy, the live Trial chunk was
`Trial-BZ1dsUQq.js` against a local `Trial-Bv3dzkBz.js`, i.e. not published
from HEAD; `araba-libaneza-cu-ibra.lovable.app` and `www.` did not respond at
all. Later the same day the live home page contained `cookie_consent` and no
`goadopt`, so a publish carrying the new cookie banner had landed. **Re-run the
hash comparison in §8 before concluding anything**; if it mismatches, publish
again and watch the Lovable UI rather than trusting its reply ("publishing was
requested" is not "published").

**Cron: APPLIED, verified against `cron.job`** (commit `db6be98`):

```
jobname                         schedule        target
backlink-snapshot-weekly        0 4 * * 1       other
booking-calendar-sync           */5 * * * *     calendar-sync   ← new
booking-reminders-every-15-min  */15 * * * *    booking-reminders
trial-followup-twice-daily      0 9,18 * * *    other
```

- `*/5` is 288 runs a day; the owner accepted that cost. `*/15` would quarter it
  (`cron.alter_job` or reschedule the same job name).
- The migration *clones the `booking-reminders` job's command* rather than
  holding a secret, so it silently does nothing (`RAISE NOTICE`) if that job is
  removed. After any change there, check `cron.job` itself.

## 3. The owner's to-do list and his open decision

`TODO.md` holds his eight items in his order and is the authoritative list.

His item 8 is **an open question he has not answered — do not build it by
guessing.** What should happen to a free trial after the card is saved? If he
cancels, the trial currently cannot be taken again. Proposed, not accepted or
rejected: `confirmed → done | no_show`, with a timer that only *asks* (after
24h the lesson appears in "Azi" with two buttons) rather than deciding, because
auto-"taken" removes a trial from someone who was ill and auto-"not taken" gives
a no-show a second free trial. Both fail silently; asking costs five seconds.

## 4. What has been built, and why

All on `main`. The reasoning matters more than the diff in several of these.

### Free trial was unbookable by the public — fixed (`157e1bf` and later)
From 7 Oct, `create-checkout-session` and `booking-create` required an
Auth-confirmed email matching the registration (`verifiedRegistrationOwner`,
Lovable `518b6b3`, live from the `0d27a4a` deploy). A first-time visitor has no
account, so the card step answered **403 "Sign in with your verified
registration email to continue"**. The 403 fires before the Stripe client is
built, so probing it has no Stripe side effect.

The owner chose to keep the gate and add an email-code step. His spec,
verbatim:

> Option B — Email code before the card step, but optimize it for minimal
> friction. Do not require visitors to create an account or sign in. Send a
> 6-digit verification code to the email entered during registration. Preserve
> the selected trial slot and all registration information during
> verification. Allow code resending, with expiration and rate limiting. Once
> verified, continue automatically to the card step without asking the visitor
> to repeat anything. Verify the code securely on the server, not just in the
> frontend. Ensure visitors cannot bypass verification by directly calling the
> booking or checkout functions. Prevent duplicate free-trial registrations and
> apply reasonable abuse protection. Do not introduce unnecessary friction into
> the booking funnel. Test the complete process in a fresh incognito session as
> a first-time public visitor, without an existing login.

Implemented through Supabase Auth (`signInWithOtp` / `verifyOtp`), not a
homemade code table: Auth's expiry and per-address rate limits apply, and the
session it returns is exactly what the two edge functions already accept.
**Neither edge function's security changed.**

- `src/components/NativeScheduler.tsx`:
  - `alreadyVerified(addr)` skips the screen when Auth already holds a confirmed
    matching session. It signs out a session for a *different* address first
    (Supabase keeps one per client) — this logs an admin out of the panel in the
    same browser if they book under another address; known, judged rarer.
  - `sendCode(addr)` with a 60s resend cooldown.
  - The code screen is a `verifyFor` **branch of the same render, not a route**,
    so slot, name, phone, notes and format survive with nothing re-entered; it
    shows the chosen slot.
  - `startTrialCardStep(regId, slotIso)` runs on success and when already
    verified. `readFunctionError` pulls the JSON body off a `FunctionsHttpError`
    so `trial_used` / `conflict` survive instead of a generic toast.
- `create-checkout-session` checks one-free-trial-per-person **before** the
  Stripe call. `booking-create`'s check runs on the webhook, after the card is
  saved, so a repeat attempt used to go through the whole card step and then be
  refused.

Traps found here:
1. **Supabase treats a first-time visitor's confirmation as a *signup*, not a
   magic link**, so it sends the signup email. Both `signup.tsx` and
   `magic-link.tsx` carry the code, each keeping its button below it, because
   `AdminLogin.tsx` and `StudentAccount.tsx` send the same emails and expect a
   link.
2. **The code was eight digits and the screen accepted six** (a real code read
   `20137377`). Length is a Supabase dashboard setting (6–10), not repo code.
   The screen accepts the whole range and lets the server judge. The owner has
   since set 6 and confirmed "codul merge".
3. `auth.users.confirmation_token` is a hash, not the code — you need the inbox.

Two template copies exist and both are live-capable:
`src/lib/email-templates/` (site route `src/routes/lovable/email/auth/webhook.ts`
— **the one configured in Supabase**, its subject appeared on the real email)
and `supabase/functions/_shared/email-templates/` (`auth-email-hook`, which has
always passed the token — the `gpt-work` branch added the code there). Both
carry the code and the same subjects. `auth-email-code-render.test.ts` (from
`gpt-work`) renders the email and strips the hidden preheader before asserting;
it was kept and extended with the 8-digit case.

Verified end to end in production as a first-time visitor: `POST /auth/v1/otp` →
200 and email delivered; subject and code correct in HTML and plain text;
`POST /auth/v1/verify` (type `"email"`) → 200 with `email_confirmed_at`;
`POST /rest/v1/registrations` as anon → 201; `create-checkout-session` → **200
with a live Stripe URL**.

### Admin: move a lesson and book one by hand
The panel could only cancel. Changing a time meant editing Google Calendar by
hand, which does not sync back — the root of the "calendar does not sync back"
complaint.

- **Mută lecția** — move a booking, including outside published hours.
- **Programează o lecție privată** — book someone in from scratch (private only;
  group courses are not bookings).

Both go through `booking-manage` / `booking-create` with the service-role key,
like `cancel_booking`, so one code path owns the calendar event (patched in
place, Meet link survives) and the emails. **A student stays bound by published
availability and 12-hour notice; the owner does not** — exempted by the
service-role key, like the 24-hour cancellation exemption; a test catches it
leaking. The first attempt reports the conflict and names the cause (another
booking, Google Calendar, or a group lesson); a second deliberate click
overrides. Past times are refused for everyone. Both dialogs use
`bucharestCivilToUtc`, not an offset (a hand-rolled offset is wrong twice a
year).

Each hand-made booking gets a **fresh registration**, deliberately:
`booking-create` caps bookings at the lessons a registration bought (so a
redelivered Stripe event cannot over-book), and attaching to an existing one
would consume a paid lesson. A refused booking deletes its registration again.
`payment_status` is `unpaid`, never `pending`, when not paid.

### Sănătate calendar names the drift
Upcoming lessons whose Google event disagrees: moved (both times shown),
cancelled in Google, or gone. **Read-only on purpose** — it never rewrites a
booking from a calendar match. One paginated `events.list`; `showDeleted` on;
instants compared with a minute of slack (Google's offset format breaks string
equality). A failed read returns `null`, not `[]`, and the panel says it could
not check.

### Forms were silently blocked by reCAPTCHA (`a80a85a`)
No group/private/kids registration had ever been saved: the Google Cloud
project behind the reCAPTCHA key (project number `1060524901775`) had been
deleted by mistake, `verify-recaptcha` returned `success:false`, and
`RegistrationFormSection` stopped every submit at step 1. Trials use another
path and were unaffected. Fixes: the form now blocks only on Google's own low
score — a verify error or any `errors[]` lets the visitor through
(`configProblem`); and the owner restored the project (a dummy token now gets
`invalid-input-response`). First non-trial registration ever: a group sign-up
on 11 Oct (unpaid). If it breaks again, a new v3 key needs the site key in
`src/lib/recaptcha.ts` + `__root.tsx` and `RECAPTCHA_SECRET_KEY` via Lovable.

Other Google Cloud projects the owner asked about: three `gen-lang-client-*`
(AI Studio / Gemini keys) and "My Project 31793" are not used by the site;
`top-splice-8v9wh` belongs to Google DeepMind's "Gemini API Tenant Sandbox" org,
not the owner's.

### reCAPTCHA badge (`6f48986`)
The badge sat bottom-right at z-index two billion over the WhatsApp/phone
buttons. Hidden on every route; Google's required sentence is in the footer and
beside the consent box (`src/components/RecaptchaNotice.tsx`). **Hiding the
badge and showing the notice are one decision** — `src/test/recaptcha-badge.test.ts`
asserts both. `visibility: hidden`, not `display: none` (the badge is an iframe
the API talks to). `AdminChromeMarker` deleted; nothing read it.

### Cookie consent
Lovable (`535b9ff`, `2f3757c`) replaced the expired Adopt CMP with a built-in
banner and Consent Mode v2; it was then completed: Adopt removed entirely
(injector, meta, CSS, footer hook). `CookieConsentBanner` +
`src/lib/cookieConsent.ts`, localStorage `cookie_consent` = `all|essential`;
the gtag bootstrap re-grants a stored `all` *before* `gtag('config')`; footer
"Setări cookies" fires `cookie-consent:open`; "Doar esențiale" after "all" sends
`denied`. Tests in `src/test/cookie-consent.test.tsx`. The banner sat at z-60
over the WhatsApp/phone buttons from 768px up; `md:bottom-32` fixed it
(`8a4854c`).

Privacy policy (RO+EN, §4 and §7): Adopt removed, "Google Ads campaign
measurement" added next to Analytics, banner described, dated October 2026.
**Owner to confirm** GA4 is linked to Google Ads; if not, drop the Ads wording.

### Smaller fixes, all with tests
- **Private lessons reach "Pasul 3 din 3"** while paying (it said step 2). The
  scheduler reports its screen from the same condition that renders the card
  step.
- **Disponibilitate showed 12:00 PM.** `<input type="time">` uses the browser's
  locale and no attribute forces 24-hour; `src/components/admin/TimeField.tsx`
  is two selects. Off-grid stored minutes are shown as-is. Kids slots too. A
  test fails if an admin component reintroduces a native time input.
- **Cash / transfer / PayPal** now say the place is not held until the money
  arrives, plus a seat-cap sentence where there is a cap. **The three methods
  stay** — an earlier pass started deleting them, wrongly; reverted uncommitted.
- **Admin tables** (`a2074ce`): `useHorizontalOverflow` + a fade + a focusable
  labelled region only while they overflow (an unfocusable scroll div is
  unreachable without a pointer). "Lecții" and "Parcurs" are grids, no table.
- **Google Business links**: one verified identity, CID `0x652fb90494e1566b` =
  `7291249751064925803` (already in the map embed); structured data imports the
  constant; the review link's `g.page` key decoded arithmetically to the same
  CID, since this sandbox cannot reach `goo.gl`.
- **Yalla corrections** (`03134aa`): Lovable wrote the migration only to
  `drizzle/migrations/`, which this repo does not read. Recorded as
  `supabase/migrations/20261009070000_yalla_card_overrides_private.sql`, plus
  revoking `anon`/`authenticated` on `yalla_card_override_history`. Verified:
  `get_published_card_overrides()` returns exactly `card_id, ar, ro, variants`;
  direct reads of both tables → `42501`. **Closed — do not reopen.** The owner
  never saw a security warning; Lovable's scan is clean.

### Codex's work — not reviewed line by line
Admin contact editing, group-enrolment validation, atomic booking moves,
calendar reconciliation and `calendar-sync`. Suite is green and Claude's
features survived the merge, but there is likely overlap between
`move_booking_atomically` / `calendar-reconciliation` and `reschedule_booking` /
`calendarDrift`. Look before building more there. One of Codex's three
migrations was once found unapplied while the other two were live.

### SEO metadata (Lovable, 1 Sep)
Based on a GSC export (11 Jun → 22 Aug 2026, Web) and GA4 (1 Jan → 1 Sep 2026).
Key figures are in `docs/SEO_AUDIT.md` §2–3; the full plan is
`docs/SEO_ACTION_PLAN.md`.

| File | Change | Why |
|---|---|---|
| `src/lib/tracking.ts` | `email_click` for `mailto:`; `cta_click` with `cta_target` for internal links to `/trial`, `/inscriere`, `/checkout`, `/booking` (one global listener) | GA4 had no contact/CTA events |
| `src/pages/seo/CursuriArabaBucuresti.tsx` | title + description (year, address, price, free trial) | 85 impressions, CTR 2.35%, position 40 |
| `src/pages/seo/CursuriArabaAdolescenti.tsx` | title + description aligned to "cursuri adolescenti araba" | 466 impressions, 0 clicks |
| `src/pages/seo/MeditatiiAraba.tsx` | title with price and "probă gratuită" | 473 impressions on "meditatii araba", 0 clicks |
| `src/pages/seo/Resurse.tsx` | clearer title + internal links to `/cursuri-araba`, `/cursuri-araba-bucuresti`, `/meditatii-araba` | ranks 6.6; passes authority to commercial pages |
| `src/pages/seo/CeArabaSaInveti.tsx` | title with year | position 5.2, CTR 10% |

Metadata only, deliberately: reversible and measurable on its own; content
rewrites are separate tasks (§6) so their effect can be attributed.

## 5. Still open

Not blocked:
- Cohorte has ~12 unlabelled row controls (missing `aria-label`).
- `compatibility_date` in the generated `wrangler.json` is the build date (nitro
  generates it; there is no `wrangler.toml`).
- **"Măsurare" self-check** for the analytics screen (whether gtag loaded,
  consent granted, events fired, in the current browser): written, **not
  pushed** — the mounting edit was interrupted, so both halves were reverted.
  ~140 lines and one edit to redo.
- **Embedded no-redirect card form everywhere** (private lessons have it; group
  checkout, subscriptions and the kids deposit still redirect to Stripe). Owner
  asked for it. Not started; scope it first.
- **Private-lesson paid path has never run live end to end.** The owner agreed
  to book one with his own card and refund it, then check the registration is
  `paid`, the booking exists with a `google_event_id`, and it shows in admin.
- **Admin cancel inside 24h** has never been tested in the real panel.
- **`cohort_calendar.members`** ("Cursanții grupei"): verify once by adding a
  lesson to A1 online and checking bandaricaefrem@gmail.com is on the invite.
- SEO tasks T1–T5 (§6).

Blocked on the owner:
- GA4 phase two: numeric property ID and a service-account JSON.
- Confirmation email button points at `https://araba-libaneza-cu-ibra.lovable.app`,
  not the real domain — Supabase Auth Site URL / redirect allow-list (a setting).
- The trial lifecycle decision (§3).
- Whether GA4 is linked to Google Ads (privacy policy wording, §4).
- Google UI steps in §7.

### Analytics / Ads (his item 1), established by reading
The **root cause was consent, not the tags**: while Adopt's trial was expired
its banner never rendered, Consent Mode stayed `denied`, and GA4,
`generate_lead` and Ads conversions recorded nothing. The new banner should
have restarted it; **unverified**. `__ANALYTICS_ENABLED__` is not the problem
(it only switches off in Lovable previews and iframes). The Ads account is
`AW-18482373882` but the bootstrap configures only `G-F167Y815JL`; the code
says the Ads conversion was created against the site's existing Google tag,
which Google supports — **check Google Ads → Conversions before calling it
broken.** A real gap: only `begin_checkout` has an Ads conversion — none for
`generate_lead` or `purchase`. Adding them needs conversion actions created in
his Ads account.

## 6. SEO tasks remaining

**T1 — Rewrite the teens page (P1, highest).** `src/pages/seo/CursuriArabaAdolescenti.tsx`.
466 impressions, 0 clicks, position 33.5; GA4: 5 sessions with 4s engagement on
`/cursuri/tineri` (redirects here). Steps: above the fold answers age, format,
price, where, how to start; "Pentru părinți" (schedule, group, safety,
communication); "Pentru adolescenți" (what they say after 4 weeks, examples);
FAQ from the GSC teen queries; `/trial` CTA top and bottom. Accept: single H1,
≥ 900 words, valid `Course` JSON-LD, internal links to `/cursuri-araba-bucuresti`
and `/trial`.

**T2 — Homepage vs `/cursuri-araba` cannibalisation (P1).** `src/pages/Index.tsx`
(or its sections), `src/pages/seo/CursuriAraba.tsx`. Homepage becomes brand +
formats and stops targeting exactly "cursuri arabă" in H1/title; `/cursuri-araba`
is the main commercial page for the generic query, linked from the homepage with
anchor "cursuri de arabă"; self-referential canonical on both, no
cross-canonical. Accept: distinct title/H1, one main internal link from the
homepage. **Risk:** homepage positions may dip before `/cursuri-araba` rises —
publish T2 on its own so the effect is attributable.

**T3 — `/cursuri/grup` (P1).** 449 impressions, CTR 0.22%, position 31.9. Title
and first paragraph on the intent "curs de arabă în grupă"; visible table of
levels, start dates and price. Accept: title ≤ 60 chars, description ≤ 155,
first paragraph answers price + start + format.

**T4 — CTAs in ranking blog posts (P2).** `alfabetul-arab-pentru-incepatori` and
the other GSC top-10 posts: end-of-article CTA to `/trial` and the relevant
course page. Accept: every top-10 post has at least one internal CTA.

**T5 — Form abandonment (P3).** GA4: 27 `form_start` → 14 `Lead` (~48%
abandon). `src/components/RegistrationFormSection.tsx`, `src/pages/Trial.tsx`:
minimum required fields, inline validation, visible errors on mobile, loading
state on the button. Accept: completable at 390px with no horizontal scroll;
every error has visible text next to its field.

(T6, "measure the Adopt consent rate", is superseded by the consent work in §4.)

Risk: `cta_click` can be high volume — do not make it a key event unless needed.
Data limit: no GSC history before June 2026, so no year-on-year comparison for
12 months.

## 7. Google UI steps (cannot be done from code)

1. GA4 → Admin → Events → mark as **key events**: `generate_lead`,
   `trial_booking_complete`, `paid_booking_complete` (optionally `cta_click`).
   Until then every GA4 conversion report shows 0, and T5 cannot be validated.
2. GA4 → Admin → Product links → link Search Console.
3. GSC → check the indexed pages report for the new routes.

After publishing SEO changes: changed routes answer 200; new title/description
in the served HTML; `public/sitemap.xml` contains them; JSON-LD valid; GA4
DebugView receives `email_click` and `cta_click`; sitemap resubmitted in GSC.

KPIs to compare at 14 / 30 / 60 days (use complete windows of equal length):

| KPI | Source | Baseline |
|---|---|---|
| Organic clicks | GSC | 34 (10 weeks) |
| Average CTR | GSC | ~1.1% |
| Average position | GSC | ~26 |
| "cursuri araba bucuresti" position | GSC | 16.93 |
| "meditatii araba bucuresti" position | GSC | 14.91 |
| "cursuri adolescenti araba" position | GSC | 33.52 |
| `/meditatii-araba` CTR | GSC | 0.91% |
| `/cursuri/grup` CTR | GSC | 0.22% |
| Organic Search sessions | GA4 | 50 |
| `Lead` events | GA4 | 14 |
| `form_start` | GA4 | 27 |
| Key events | GA4 | 0 (to enable) |

## 8. Verification recipes and environment

**Is the site published from this commit?** Vite hashes are content-derived:

```bash
npm run build
ls .output/public/assets/ | grep '^Trial-'
curl -s https://centruldearabalibaneza.com/trial \
  | grep -ao '/assets/Trial-[A-Za-z0-9_-]*\.js' | sort -u
# same hash → published from this commit; different → not published
```

**Are migrations applied?** Ask for the objects, not the migrations table:

```sql
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and proname in
   ('admin_update_registration_contact','move_booking_atomically','get_published_card_overrides');
select jobname, schedule, active from cron.job order by jobname;
```

**An anonymous visitor's view of an edge function** (the browser could not be
made to trust the egress proxy, so live checks were done with curl):

```bash
set -a && . ./.env && set +a        # anon/publishable key only
U="$VITE_SUPABASE_URL"; K="$VITE_SUPABASE_PUBLISHABLE_KEY"
curl -s -w '\nHTTP %{http_code}\n' -X POST "$U/functions/v1/<fn>" \
  -H "apikey: $K" -H "Authorization: Bearer $K" -H 'Content-Type: application/json' -d '{}'
```

Environment:
- Gates: `npx vitest run`, `npx tsc --noEmit -p tsconfig.json`, `npm run build`.
  **ESLint is broken in this container** (`ajv` / `defaultMeta` TypeError).
- **Nothing type-checks the Deno edge functions.** Syntax-check with
  `npx tsc --noEmit --noResolve --skipLibCheck --target es2022 --module esnext --moduleResolution bundler supabase/functions/<fn>/index.ts`
  and grep for `error TS1`.
- `npm run build` runs `scripts/guardWorkerRuntime.mjs`, patching
  `createRequire(import.meta.url)` → `createRequire(import.meta.url || "file:///")`
  in `.output/server`. **Not cosmetic:** without it `import.meta.url` is
  undefined on Lovable's host and **every SSR route 500s** while static assets
  still serve. Not reproducible under `wrangler dev`. Leave it in `build`.
- Database: Lovable's `query_database` against **production** (no staging) —
  wrap anything exploratory in `BEGIN; … ROLLBACK;`.
- `.env` is committed and holds only the anon/publishable key (deliberate — see
  `AUDIT_BACKLOG.md`); no service-role key in the repo, ever.
- The outbound proxy **403s `maps.app.goo.gl` and `g.page` on CONNECT** — a
  `000` / `curl: (56)` means blocked, not dead.
- Chromium + Playwright are preinstalled (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`);
  do not run `playwright install`. A fresh context is the incognito equivalent.
- Connected Gmail is **`marhaba@centruldearabalibaneza.com`**, not
  `mohtiibrahim@gmail.com`; a `+alias` of it receives test OTPs. Two confirmed
  auth users were left on purpose, both the owner's aliases:
  `marhaba+e2etrial@…` and `mohtiibrahim+e2etrial@gmail.com`.
- Lockfile is `bun.lock`, not `bun.lockb`.
- Lovable project `b6dbaaf5-f5c4-4603-a0e4-cbbbddd78e67`, workspace
  `h4MoYRUNZUYzXyaEnLT2`. Supabase project ref `pzouzxgswccyhxhpgfwb`.
- **Lovable publishes workspace HEAD at Publish time** — not a branch watcher;
  it must sync to `main` first.
- **Credits are scarce.** Bundle everything into one deploy request. Check the
  hash (above) and migrations (SQL) first — both free.
