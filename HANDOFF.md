# Handoff — centruldearabalibaneza.com

Written 2026-10-12, at the end of a long Claude Code session. Supersedes
`HANDOFF-codex.md` (9 October), which is still accurate about the environment
but out of date about the work. Read this one first.

Repo `mohtiibrahim93/araba-libaneza-cu-ibra`. Owner/teacher: Ibrahim Gabriel
Mohti ("Ibra"). Lebanese Arabic school in Bucharest. Site is RO/EN, admin is
Romanian only.

---

## 0. State right now

- Branch `claude/blog-cms-migration-tli9p7` and `main` are both at **`e9c76e3`**.
  Working tree clean.
- **972 tests pass** (`npx vitest run`), `npx tsc --noEmit -p tsconfig.json`
  clean, `npm run build` clean.
- **A deploy is in flight.** See §1 — this is the first thing to check.
- Three remote branches are fully merged into `main` and safe to delete:
  `gpt-work`, `codex/admin-course-clarity`, `codex/audit-booking-reliability`.
  (`yalla-app-ios` and `yalla-app-ios-screenshots` were not touched and were
  not assessed.)

Three agents have been working on this repo: this Claude session, a Codex
session (two merged PRs, #47 and #48), and Lovable (which both edits and
deploys). `main` moved 9 commits under this session at one point. Always
`git fetch` and check before assuming anything.

## 1. FIRST: the deploy outcome, verified

A deploy-only request went to Lovable at 07:54 UTC on 12 October. It completed
and cost 0.7 credits. Three parts; two landed and one did not, so do not
take the reply as one result:

**Edge functions: DEPLOYED.** All twelve, from a workspace at `0a75fe99`:
`admin-registrations`, `auth-email-hook`, `booking-availability`,
`booking-create`, `booking-manage`, `booking-reminders`, `calendar-feed`,
`calendar-sync` (**first deploy ever**), `create-checkout`,
`create-checkout-session`, `create-payment-intent`, `create-subscription`.
The whole set was asked for because Codex changed three shared modules that most
functions bundle (`_shared/booking.ts`, the new `_shared/calendar-reconciliation.ts`,
the new `_shared/group-enrolment.ts`), so naming a short list would have shipped
a stale bundle somewhere.

**Site publish: STILL NOT LANDED**, rechecked after the later commits. Lovable said "publishing was requested", which is
not the same as published, and the evidence says it has not taken effect. Checked
after the deploy finished:

| | Trial chunk |
|---|---|
| local build of current HEAD | `Trial-Bv3dzkBz.js` |
| live `centruldearabalibaneza.com` | `Trial-BZ1dsUQq.js` |

Vite hashes are content-derived, so different hash means different content. Also
checked: `araba-libaneza-cu-ibra.lovable.app` and `www.` do not respond at all,
so this is not a custom-domain cache showing a stale copy of a good publish.
**Everything this session built is still not live.** Re-run the comparison in
§4 before concluding anything; if it still mismatches, the publish needs doing
again, and it is worth watching the Lovable UI rather than trusting the reply.

**The cron migration: APPLIED, and verified.** The owner told Lovable to apply
it after the deploy, in commit `db6be98` "Applied calendar-sync schedule".
Confirmed against the database rather than taken from the commit message:

```
jobname                         schedule        target
backlink-snapshot-weekly        0 4 * * 1       other
booking-calendar-sync           */5 * * * *     calendar-sync   ← new
booking-reminders-every-15-min  */15 * * * *    booking-reminders
trial-followup-twice-daily      0 9,18 * * *    other
```

So `calendar-sync` is deployed and is now scheduled every five minutes, and the
ordering risk is gone — the function existed before the schedule was created.

Two things to keep in mind about it rather than forget:

- `*/5` is 288 runs a day, each waking the database even with nothing to sync.
  Lovable raised the cost before applying it and the owner accepted that cadence.
  If it ever wants trimming, `*/15` would quarter it and still be well inside
  useful; change it with `cron.alter_job` or reschedule the same job name.
- The migration *clones the `booking-reminders` job's command* rather than
  inventing a secret, so it silently does nothing if that job is ever removed —
  the `RAISE NOTICE` branch. After any change in that area, check `cron.job`
  itself, not the migration's exit status.

## 2. The owner's own to-do list

`TODO.md` is in the repo and holds his eight items in his order, with what is
known about each. It is the authoritative list; this file does not repeat it.
Two of the eight were completed during this session and are marked so.

His item 8 is **an open question he has not answered**, and it should not be
implemented by guessing. He asked what should happen to a free trial after the
card is saved: if he cancels, the trial currently cannot be taken again. My
proposal, which he has not accepted or rejected: `confirmed → done | no_show`,
with a timer that only *asks* (after 24h the lesson appears in "Azi" with two
buttons) rather than deciding by itself — because auto-marking "taken" removes
a free trial from someone who may simply have been ill, and auto-marking "not
taken" hands a second free trial to a no-show. Both fail silently; asking costs
him five seconds. **Get his decision before building it.**

## 3. What this session did, in order, and why

Every item below is pushed to `main`. The reasoning matters more than the diff
in several of these, so it is given.

### The free trial was unbookable by the public — fixed
From 7 October, `create-checkout-session` and `booking-create` both required an
Auth-confirmed email matching the registration (`verifiedRegistrationOwner`,
which Lovable added in `518b6b3`, live from the `0d27a4a` deploy). A first-time
visitor has no account, so the card step answered **403** and nobody outside the
office could complete a free trial. Verified against the live function with the
published anon key, not inferred from the code.

`AGENTS.md` mandates that gate, so it was not removed. The owner chose to keep
it and add the missing step. The fix is a one-time code emailed to the address
the visitor types, then the card step — no account, no password, no sign-in
screen, and no second form: the code screen is a *branch of the same render* in
`NativeScheduler`, so the slot, name, phone, notes and format survive it with
nothing re-entered. Done through Supabase Auth (`signInWithOtp` / `verifyOtp`)
rather than a homemade code table, which is why it works: Auth's own expiry and
rate limits apply, and the session it returns is exactly what the two edge
functions already accept. **Neither edge function's security changed**, and
`src/test/trial-email-verification.test.ts` fails if someone "fixes" a future
403 by weakening them.

Two traps found here, both worth knowing:

1. **Supabase calls a first-time visitor's confirmation a *signup*, not a magic
   link**, so it sends the signup email. The obvious place for a one-time code
   is the magic-link template, and putting it only there would have covered
   everyone *except* the people the change was for. Both templates carry it now,
   each keeping its button below the code, because the admin fallback sign-in and
   the student account send the same emails and expect a link.
2. **The code was eight digits and the screen accepted six.** Found only by
   running the real flow against production — a real code arrived reading
   `20137377`. The length is a Supabase dashboard setting (6–10), not something
   in the repo, so no unit test could have caught it. The screen now accepts the
   whole range and lets the server judge the code. The owner has since set the
   length to 6 and confirmed "codul merge", so this is now insurance rather than
   a live fix.

Verified end to end at the protocol level as a first-time visitor with no prior
session: `POST /auth/v1/otp` → 200 and email delivered; the email's subject and
code correct in HTML and plain text; `POST /auth/v1/verify` (type `"email"`) →
200 with `email_confirmed_at` set; `POST /rest/v1/registrations` as anon → 201;
`POST /functions/v1/create-checkout-session` → **200 with a live Stripe URL**,
where it returned 403 that morning.

### Two admin controls that did not exist
The panel could cancel a booking and nothing else. Changing a time meant
cancelling and asking the student to rebook, or editing Google Calendar by hand
— and that second one is the direction that does not sync back, so the admin's
calendar view went stale *because of the owner doing the only thing left to him*.
Fixing the controls is the root of the "calendar does not sync back" complaint,
not a detour from it.

- **Mută lecția** — move a booking, including outside published hours.
- **Programează o lecție privată** — book someone in from scratch. Private
  lessons only; group courses are not bookings.

Both route through `booking-manage` / `booking-create` with the service-role key,
exactly as `cancel_booking` already did, so one code path still owns the calendar
event (patched in place, so the Meet link survives) and the emails. Nothing about
bookings is reimplemented.

The design point: **a student stays bound by the published availability and the
12-hour notice; the owner does not.** "Nine on Sunday, just this once" is a
normal arrangement, and a panel that refuses it is what sends him back to Google.
The exemption is earned by the service-role key, the same way the existing
24-hour cancellation exemption was, and a test exists to catch it leaking.
Not bound is not unwarned: the first attempt *reports* and names the cause —
another booking, Google Calendar, or a group lesson, three causes with three
different answers where "slot taken" said nothing actionable — and only a second,
deliberate click overrides it. Times in the past are still refused for everyone.

Both dialogs convert Bucharest civil time with `bucharestCivilToUtc`, not an
offset, because an hour out books a real student at the wrong time and a
hand-rolled offset is wrong twice a year.

### A fresh registration per hand-made booking — deliberate
`booking-create` caps bookings at the number of lessons the registration bought,
on purpose, so a redelivered Stripe event cannot over-book a package. Attaching
an admin booking to an existing registration would silently consume someone's
paid lesson and make the money and the lessons disagree. If the booking is
refused the registration is deleted again, so a rejected slot leaves nothing in
Înscrieri. `payment_status` is `unpaid`, never `pending`, when it has not been
paid for — see §5.

### Sănătate calendar now names the drift
Upcoming lessons whose Google event disagrees with the panel: moved (both times
shown), cancelled in Google, or gone. **Read-only on purpose** — it reports, it
never rewrites a booking's time from a calendar match, because a wrong match
rewrites a real lesson and that should not arrive as a side effect of opening a
health screen. One paginated `events.list`, not one fetch per booking;
`showDeleted` on, because a cancelled event is exactly what is sought and the
API omits it otherwise; instants compared with a minute of slack, since Google
returns its own offset format and string equality flags everything as moved.
A failed read returns `null`, not `[]`, and the panel says it could not check —
"nothing to report" and "I could not look" must not print identically.

### reCAPTCHA badge, and the corner it was in
The badge is fixed bottom-right at z-index two billion — the corner the WhatsApp
and phone buttons occupy — so it floated on top of the control the site most
wants tapped. It is now hidden on every route, and Google's required sentence
("This site is protected by reCAPTCHA…", with both links) is in the footer and
beside the consent box instead, as `RecaptchaNotice`. **Hiding the badge and
showing the notice are one decision**: delete the footer line and the site is in
breach while still looking fine, so one test asserts both halves together.
`visibility: hidden`, not `display: none` — the badge is an iframe the API talks
to. `AdminChromeMarker` was deleted; the rule is global now and nothing read the
flag. Lovable's new cookie banner had the same problem (z-60 over the buttons
from 768px up) and got `md:bottom-32`.

### Smaller, all with tests
- **Private lessons never reached step 3.** The heading said "Pasul 2 din 3 —
  alege ziua și ora" while you were paying. The scheduler now reports which of
  its two screens it is on, derived from the same condition that renders the card
  step so the two cannot drift.
- **Disponibilitate showed 12:00 PM.** `<input type="time">` renders in the
  *browser's* locale, not the page's, and no attribute forces 24-hour. The only
  reliable fix is not to ask the browser for a clock: `TimeField` is two selects.
  A stored minute off the 15-minute grid is offered as itself, not snapped.
  Kids slots had the same control and the same problem. A test fails if any
  admin component reintroduces a native time input.
- **Cash / transfer / PayPal** read as though any of them held your place. The
  three methods stay exactly where they were — an earlier pass of mine started
  deleting them, which was wrong and was reverted before anything was committed —
  and they now carry the condition that was missing: the place is not held until
  the money arrives, plus a seat-cap sentence where there is a cap.
- **Admin tables** declared up to ~980px of minimum column widths inside boxes
  that always scrolled sideways and never said so. They now show a fade and
  become a focusable labelled region *only while they overflow*. The keyboard
  half is not decoration: an unfocusable scroll div is unreachable without a
  pointer.
- **Two unverifiable Google links** became one verified identity. CID
  `0x652fb90494e1566b` = `7291249751064925803` was already on the site in the map
  embed; the profile link is built from it, the structured data imports that
  constant instead of a second pasted copy, and the review link's `g.page` key is
  checked by decoding it to the same CID — arithmetically, because this sandbox
  cannot reach `goo.gl` at all. Saying "verified" off a blocked request would
  have been worth nothing.
- **Yalla corrections.** Lovable separated published card text from correction
  records but wrote the migration only to `drizzle/migrations/`, which this repo
  does not read; `supabase/migrations/` still said the opposite, so a fresh
  database would have re-opened the public read it had just closed. Recorded
  properly, plus a revoke Lovable's version left off. Verified with the published
  anon key: the function returns exactly `card_id, ar, ro, variants`; direct
  reads of both tables return `42501`. **This item is closed** — the owner never
  saw a security warning; that phrasing was mine, and Lovable's scan is clean.
  Do not reopen it.

### The other agents' work
- **`gpt-work`** added the one-time code to the *other* copy of the templates
  (`supabase/functions/_shared/email-templates/`). My first read called it a dead
  copy; **that was wrong** — `auth-email-hook/index.ts:237` has always passed the
  token, so on that path the template was the only missing piece. Both auth-email
  implementations are live-capable and only one is configured in Supabase (the
  **site route** is the live one — its subject appeared on the real email), so
  both now carry the code and the same subjects. Its
  `auth-email-code-render.test.ts` is **better than my own test** — it actually
  renders the email and strips the hidden preheader before asserting — and was
  kept and extended with the real 8-digit case.
- **Codex** merged two PRs covering admin contact editing, group-enrolment
  validation, atomic booking moves, calendar reconciliation and a new
  `calendar-sync` function. I verified my features survived the merge and the
  suite is green, but **I have not reviewed Codex's work line by line.** There is
  likely conceptual overlap between its `move_booking_atomically` /
  `calendar-reconciliation` and my `reschedule_booking` / `calendarDrift`. Worth
  a deliberate look before building more in that area.

## 4. Known-good verification recipes (no credits, no browser)

**Is the site actually published from this commit?** Vite hashes are content
derived, so a build here and the live HTML settle it without asking Lovable:

```bash
npm run build
ls .output/public/assets/ | grep '^Trial-'
curl -s https://centruldearabalibaneza.com/trial \
  | grep -ao '/assets/Trial-[A-Za-z0-9_-]*\.js' | sort -u
# same hash → published from this commit; different → not published
```

**Are the repo's migrations applied?** Ask the database for the objects, not the
migrations table — Lovable and Codex both write migrations, and one of Codex's
three was never applied despite the other two being live:

```sql
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and proname in
   ('admin_update_registration_contact','move_booking_atomically','get_published_card_overrides');
select jobname, schedule, active from cron.job order by jobname;
```


The browser could not be made to trust the egress proxy for this host, and TLS
verification must not be disabled, so the live checks were done over HTTP:

```bash
set -a && . ./.env && set +a        # anon/publishable key only; no secrets in repo
U="$VITE_SUPABASE_URL"; K="$VITE_SUPABASE_PUBLISHABLE_KEY"
# an anonymous visitor's view of any edge function
curl -s -w '\nHTTP %{http_code}\n' -X POST "$U/functions/v1/<fn>" \
  -H "apikey: $K" -H "Authorization: Bearer $K" -H 'Content-Type: application/json' -d '{}'
```

Database inspection went through Lovable's `query_database` (production; there is
no staging — wrap anything exploratory in `BEGIN; … ROLLBACK;`).

The connected Gmail is **`marhaba@centruldearabalibaneza.com`**, *not*
`mohtiibrahim@gmail.com` — a `+alias` of it is how the OTP email was read. Two
confirmed auth users were left behind on purpose, both the owner's own aliases:
`marhaba+e2etrial@…` and `mohtiibrahim+e2etrial@gmail.com`. The test
registration row was deleted.

## 5. Hard constraints — read before changing anything

`AGENTS.md` is binding, including for Lovable. Two rules matter most:

1. **The ownership gate.** Verify subscription, checkout and visitor booking
   ownership with an Auth-confirmed email matched to the stored registration
   email; preserve only the existing trusted webhook path. **Never weaken it to
   fix a 403** — add the step that lets an honest visitor through, as above.
2. **`registrations.payment_status`.** `unpaid`, `pending` and `failed` are
   distinct states and must never be merged or migrated into one another.
   `unpaid` = no payment attempted; `pending` = an attempt is open; `failed` =
   declined. The vocabulary is documented above `paymentStatusLabels` in
   `src/components/admin/types.ts` and enforced by
   `src/test/payment-status-vocabulary.test.ts`. I got this wrong once and wrote
   a migration merging `unpaid` into `pending`; it was deleted before it ran.

Also standing, from the owner:
- Do **not** modify `public/4ce740356d5ab7d75677bda846853184.txt` (IndexNow key).
- Do **not** modify `public/robots.txt` — the single `User-agent: *` group is
  deliberate; no per-bot groups.
- Do **not** modify `scripts/seoPrerender.ts` or `scripts/prerenderBody.tsx`
  without explicit instruction.
- Keep RO ↔ EN reciprocity: any new or changed route needs both halves.
- All existing Vitest tests must stay green.
- Do not submit forms with real personal data.
- Never put a Supabase personal access token, GA4 service-account JSON or admin
  credentials in chat — they belong in Supabase secrets. Never disable TLS
  verification or unset `HTTPS_PROXY`.
- Admin screenshots contain real student names, emails and phones.

## 6. Environment notes that save time

- `npm run build` runs `scripts/guardWorkerRuntime.mjs`, which patches
  `createRequire(import.meta.url)` → `createRequire(import.meta.url || "file:///")`
  in `.output/server`. **Not cosmetic:** unguarded, `import.meta.url` is undefined
  on Lovable's host, the module throws at load, and **every SSR route 500s** while
  static assets keep serving. Not reproducible under `wrangler dev`, which defines
  `import.meta.url`. Leave it wired into `build`.
- **ESLint is broken in this container** (`ajv` / `defaultMeta` TypeError). Use
  `tsc --noEmit` + `vitest` as the gates.
- **Nothing type-checks the Deno edge functions.** Syntax-check them with:
  `npx tsc --noEmit --noResolve --skipLibCheck --target es2022 --module esnext --moduleResolution bundler supabase/functions/<fn>/index.ts`
  and grep for `error TS1`.
- The outbound proxy **403s `maps.app.goo.gl` and `g.page` on CONNECT**. A `000`
  or `curl: (56)` there means the proxy blocked it, not that the link is dead.
- Lockfile is `bun.lock`, not `bun.lockb`.
- Lovable project `b6dbaaf5-f5c4-4603-a0e4-cbbbddd78e67`, workspace
  `h4MoYRUNZUYzXyaEnLT2`. Supabase project ref `pzouzxgswccyhxhpgfwb`.
- **Lovable publishes workspace HEAD at Publish time** — it is not a branch
  watcher, so it must sync to `main` first. There is no branch setting.
- **Credits are scarce.** Bundle everything into one deploy request. Before
  spending one, check whether the site is already current using the hash
  comparison in §1, and check whether migrations are already applied with SQL —
  both are free and both saved a wasted credit this session.

## 7. Still open

Not blocked, nobody waiting:
- Cohorte has ~12 unlabelled row controls (missing `aria-label`).
- `compatibility_date` in the generated `wrangler.json` is the build date.
- A **"Măsurare" self-check** for the analytics screen — reports whether gtag
  loaded, whether consent was granted and how many events fired, in the browser
  you are in. It was written in this session and **deliberately not pushed**: the
  edit that mounts it was interrupted, which left a dangling import, so both
  halves were reverted rather than put half a feature on `main`. ~140 lines and
  one edit to redo.
- The embedded, no-redirect card form that private lessons use, applied to the
  places that still redirect to Stripe (group checkout, subscriptions, the kids
  deposit). The owner asked for this. Not started.

Blocked on the owner:
- GA4 phase two needs the numeric property ID and a service-account JSON.
- The confirmation email's button points at
  `https://araba-libaneza-cu-ibra.lovable.app`, not the real domain — Supabase
  Auth's Site URL / redirect allow-list, a setting, not code.
- The trial lifecycle decision (§2).

On his item 1 (GA conversions / Ads / cookie banner), established by reading:
the **root cause was consent, not the tags** — while Adopt's trial was expired
its banner never rendered, so Consent Mode stayed `denied` for every visitor and
GA4, `generate_lead` and the Ads conversions recorded nothing. Lovable's new
banner should have restarted it; **unverified**. `__ANALYTICS_ENABLED__` is *not*
the problem (it only switches off in Lovable previews and iframes). The Ads
account is `AW-18482373882` but the bootstrap configures only `G-F167Y815JL`;
the code's comment says the Ads conversion action was created against the site's
existing Google tag, which Google does support, **so do not call it broken
without checking Google Ads → Conversions.** A real gap that can be named: only
`begin_checkout` has an Ads conversion — there is none for `generate_lead` or
`purchase`, and for a lead-gen site the lead is what Ads should bid on. Adding
those needs conversion action names created in the owner's Ads account.
