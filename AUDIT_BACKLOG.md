# Audit Backlog — Centrul de Araba Libaneza

> **October 2026 full audit (code + live site):** `docs/SITE_AUDIT_2026-10.md` — its status block says what is fixed and what to do next (P0-3 onwards).

Living backlog, updated across the audit passes below. Product scope: lead-gen + booking site (quiz → registration → Zoom-synced booking → Stripe payment → admin manages leads). No student login/LMS features exist or are in scope.

**Passes completed:** 2 full passes (this session + this morning's security-focused pass). Third pass not run — the second pass surfaced one new High finding (booking-create email relay), so per the stated stop condition ("iterate until a full pass produces no new Critical/High") one more pass would be warranted before calling this fully exhausted; noted as a gap below rather than silently stopping.

**Environment limitation (applies to every row marked "not independently verified live"):** this sandbox's network policy blocks all outbound calls to the live Supabase project, Stripe, Google OAuth, and reCAPTCHA (`ERR_TUNNEL_CONNECTION_FAILED` on every attempt). Real end-to-end submission-to-database persistence, real payments, and real Google admin login could not be tested from here. Screenshots and console captures below are real; anything needing live network is flagged.

---

## Sprint 1 — Launch Blockers (RESOLVED this session)

| Title | Evidence | Impact | Category | Effort | Fix |
|---|---|---|---|---|---|
| **Public booking endpoint can be used to spam-relay arbitrary emails** | `supabase/functions/booking-create/index.ts:39-51,140,196-198` + open registration INSERT policy. Attack chain: (1) self-mint a free `registration_id` via the open INSERT, (2) call `booking-create` with that ID + an arbitrary `student_email` — nothing checked they matched — (3) a real transactional email fires to the arbitrary address. | High — reputational (sending-domain blacklisting), phishing-relay risk | Security | M | **Fixed** — per-IP rate limit added to `booking-create` (max 5/hour), see below. The email-spoofing angle itself (arbitrary `student_email` not matching the registration) is still technically possible for a *single* booking — rate limiting caps the *volume*, it doesn't close that specific mismatch. Worth a follow-up if this needs to be airtight rather than just throttled. |
| **reCAPTCHA on registration fails open** | `RegistrationFormSection.tsx:219-234` — no token → proceeds anyway, no server-side re-check. | High combined with no rate limiting | Security | S–M | **Decision made & documented**, not code-changed: kept soft/best-effort (avoids blocking real users over script-load hiccups), with the per-IP rate limit trigger as the actual enforcement gate instead. Comment added in code explaining this is deliberate. |
| **No rate limiting on any public-facing endpoint** | Checked every edge function — zero inbound throttling anywhere. | High — enabled both items above | Security | M | **Fixed** — new `rate_limit_events` table + `check_and_record_rate_limit()` SECURITY DEFINER function (migration `20260701155030...sql`), applied as: (a) a fail-open `BEFORE INSERT` trigger on `registrations` capping 10 inserts/IP/hour, (b) an explicit check inside `booking-create` capping 5/IP/hour. **Rigorously tested against a real local Postgres 16 instance** (not just read — actually executed): verified the 11th same-IP registration insert is rejected, a different IP is unaffected, malformed/missing proxy headers fail open (never block a real user), and a multi-hop `X-Forwarded-For` chain correctly extracts the first IP. `create-payment-intent`/`create-checkout`/`admin-registrations` remain unthrottled — lower risk since payment endpoints require a valid registration+Stripe interaction and admin now requires a real Google-authenticated allowlisted account, but worth extending the same pattern if abuse is observed. |

---

## Sprint 2 — High-Value, Not Blocking

| Title | Evidence | Impact | Category | Effort | Status |
|---|---|---|---|---|---|
| **Refreshing mid-registration silently erases visible progress** | `src/components/ProgramsSection.tsx` (`inlineForm` was a plain non-persisted `useState(null)`) + `src/components/RegistrationFormSection.tsx:81-133` (sessionStorage draft save/restore). | High — real lead loss on a lead-gen site | Bug / Conversion | S | **Fixed** — `ProgramsSection` now reads the same sessionStorage draft on mount and auto-reopens the matching course form if one has real data. Verified live: fill name+phone → reload → `#name` still shows the value with no re-click needed (was previously blank until the same card was manually re-clicked). |
| **Format-selection validation error only shown as a transient toast** | `RegistrationFormSection.tsx:193`, no inline error styling on format/location `Select`s (contrast with phone/email which had it). | Medium-High — distracted/mobile users miss the toast | UX / Conversion | S | **Fixed** — format and location selects now get `aria-invalid` + a red border + persistent inline text on failed submit, clearing as soon as the user picks a value. Verified live: `aria-invalid="true"` + visible error text after a failed submit, both clear to `null`/hidden after selecting a value. (Level select left alone — it defaults to "A1" and its empty-state validation branch is effectively unreachable in normal use.) |
| **No refund workflow** | Repo-wide search for "refund" returned zero matches. | High | Missing Feature | M | **Fixed** — `refunded_at`/`refund_reason` columns added; new `admin-registrations` `"refund"` action calls Stripe's refund API (handles both the `pi_...` and `cs_...` shapes `stripe_session_id` can hold depending on which checkout flow was used), then records the result. Admin table now shows a payment-status badge and a "Rambursează" (Refund) button with a reason dialog on paid rows. **Caveat: the DB schema/RLS/migration were tested against a real local Postgres instance; the actual Stripe API call itself could not be executed from this sandbox (no network egress to Stripe) — recommend a first live test with a real test-mode payment before relying on it for a real refund.** |
| **No coupon/promo-code system** *(confirmed still open)* | Zero matches for "coupon"/"promo". | Medium | Missing Feature | L | Open — deferred, no promo planned |
| **Kids-deposit checkout has no recoverable error path** | `RegistrationFormSection.tsx` kids+`payDeposit` branch marked the registration "submitted" and cleared the draft *before* `create-checkout` resolved; on failure the user was stuck on a dead-end "success" screen with no way to pay and no draft left to retry from. | Medium | Bug | S | **Fixed** — extracted the checkout call into `attemptKidsDepositCheckout`, tracked via `depositCheckoutFailed` state; `PostSubmitView` now shows a retry card ("Poți încerca din nou sau ne poți contacta pe WhatsApp") with a button that re-invokes `create-checkout` for the same registration. **Verified live** with a real Playwright browser session (Supabase REST/RPC/Functions calls mocked via network interception, since this sandbox can't reach the real Supabase project): confirmed the retry card renders on checkout failure, and clicking retry re-calls `create-checkout` and genuinely attempts the `window.location.href` redirect on success (browser navigation to the returned URL was observed, not just a state change). |
| **`React does not recognize the fetchPriority prop` console warning** | `HeroSection.tsx:84` passed `fetchPriority="high"` (camelCase); this React version wants lowercase `fetchpriority`. | Low-Medium | Tech Debt | XS | **Fixed** — switched to a typed-spread workaround (`imgPriorityProps`) since React's TS defs don't type the lowercase form. Verified live: 0 `does not recognize` warnings on homepage load (was 1 every load). |
| **Mobile menu button tap target is 36×36px** | `Navbar.tsx` mobile hamburger, measured 36×36px, below the 44×44px minimum. | Low-Medium | Accessibility | XS | **Fixed** — `min-w-11 min-h-11` (44px). Verified live via mobile-viewport `boundingBox()`: now exactly 44×44px. |
| **Name field has no format validation** | Emoji-only name accepted with no error; DB migration only bounds length, not format. | Low | Bug / Data Quality | S | **Fixed** — added `name ~ '[[:alpha:]]'` to the INSERT policy (requires at least one letter, doesn't restrict script). Tested against real Postgres with RLS actually enabled and enforced through the `anon` role (not just superuser): Romanian names with diacritics and Arabic-script names correctly pass, emoji-only/digit-only names correctly rejected. |
| **`.env` is committed to git** | `git ls-files` includes `.env`; anon/publishable keys only, no service-role secret. | Low today | Security / Tech Debt | XS | **Reassessed, not changed** — untracking `.env` would break the zero-setup Codespaces/fresh-clone experience (nothing else currently injects `VITE_SUPABASE_URL` etc. at build time), risking reintroducing the original "preview not working" issue from earlier in this project. Added `.env.example` for documentation instead of untracking the real file. Judgment call: worth revisiting only if a real secret (e.g. a service-role key) is ever added to this file — it never should be. |
| **No error-tracking/observability service** | Zero matches for Sentry/LogRocket in `src/`/`package.json`. | Medium | Observability | M | Open |

---

## Sprint 3 — Post-Launch

| Title | Evidence | Impact | Category | Effort |
|---|---|---|---|---|
| ~~Main JS bundle 978KB (287KB gzip), no code-splitting~~ **FIXED** | `vite.config.ts` `manualChunks` peels React/Radix/Supabase into cacheable vendor chunks (React kept whole to avoid dual-React); admin/PDF libs stay async; App.tsx lazy-loads all non-homepage pages. Main entry chunk 983KB→402KB (289→116 gzip). | Medium | Performance | M |
| ~~Oversized hero PNG shipped alongside an already-optimized webp~~ **FIXED** | Hero → 82KB WebP via `<picture>` (was 530KB, the LCP image); instructor 530KB PNG fallback replaced with a 35KB JPEG (WebP stays primary), PNG deleted. | Medium | Performance | S |
| GDPR: no self-service data deletion *(confirmed still open)* | `Privacy.tsx` promises right-to-erasure; only path is emailing the business inbox | Medium (higher given kids'-course child-age data collected) | Compliance | M |
| Homepage missing hreflang tags *(confirmed still open)* | Course subpages reportedly have them; homepage `Index.tsx` Helmet block does not | Low-Medium (SEO, bilingual RO/EN site) | SEO | S |
| Booking cancel/reschedule relies on unguessable email-link token only | `booking-manage/index.ts` — token-based access, no identity binding | Low today; revisit if booking sensitivity increases | Security | — (accepted risk) |
| 404s not logged/tracked | `NotFound.tsx` logs to `console.error` only | Low | Observability | S |
| Sitemap gaps | Reported in prior audit pass (not re-verified this pass) | Low | SEO | S |
| No waitlist for full cohorts | Cohorts have max capacity, no "notify me" mechanism | Medium (lost revenue) but not launch-relevant | Missing Feature | M |
| No abandoned-registration recovery | Trial follow-ups exist (2-stage); form-abandoners who never submit are never re-contacted | Medium (lost revenue) but not launch-relevant | Missing Feature | M |
| No per-admin audit log | Now moot in the sense that admin identity is real (Google sign-in, fixed this morning), but there's still no log of *who* changed a lead's status *when* | Low-Medium | Missing Feature | M |

---

## Future Ideas (not scored, not scheduled)

- Coupon/promo-code system (once a real campaign is planned)
- Multi-admin roles/permissions beyond a flat allowlist
- Automated Playwright regression suite covering the registration→booking→checkout funnel (this audit's throwaway scripts could be a starting point)

---

## Resolved (carried forward from this morning's security-focused audit, re-verified this session as still fixed on `main` @ `73d1d0c`)

| Item | Evidence of fix |
|---|---|
| Payment amount was fully client-controlled | `create-payment-intent/index.ts` now reads `quantity` from the DB row (`regRow.quantity`), not the request body |
| Group checkout charged every level the same fixed Stripe price (A2 at 600 lei/lună would have been charged the A1 rate) | Both `create-payment-intent` and `create-checkout` now compute the amount from a server-side table (`_shared/prices.ts`) keyed by the `level` + `format` persisted on the registration row, including the +40% in-center surcharge. Table is unit-tested to stay in sync with the displayed prices (`src/test/server-prices.test.ts`). Live Stripe call not testable from this sandbox — same caveat as the refund action. |
| Admin panel used a single shared password, no rate limiting | `Admin.tsx`/`AdminLogin.tsx` — zero `password` references; Google sign-in + `ADMIN_EMAILS` allowlist confirmed in `admin-registrations/index.ts:56-66` |
| CORS wildcard (`*`) on all 26 edge functions | `_shared/cors.ts` origin allowlist confirmed applied across all functions; only two dead-internal-default wildcards remain in `auth-email-hook`, both overwritten before the response leaves the server |
| No Stripe idempotency key | Present in both `create-payment-intent:125` and `create-checkout:114` |
| DB validated email/phone length only, not format | `20260701121135...sql` — regex format checks confirmed live |
| Trial page skipped email/phone validation | `Trial.tsx:14,35,39` — `isValidEmail`/`isValidPhone` wired in |
| Meta Pixel was a dead `YOUR_PIXEL_ID` placeholder | Removed entirely from `index.html`, per your instruction |
| Test suite was 3/4 red | `Navbar.test.tsx` fixed (Router context + ResizeObserver stub + stale assertions rewritten); 3/3 passing |
| Duplicate/orphaned migration files | Cleaned up, single canonical migration remains (`20260701121135...`) |

---

## Open items carried over from TODO.md and HANDOFF.md (27 October 2026)

Both files were checked against the code and deleted; what was done is in git
history (`HANDOFF.md`, `TODO.md` at `6feb0dc`). What is still true and still
open:

### Not blocked

| Item | State in the code |
|---|---|
| Cohorte has unlabelled row controls (missing `aria-label`) | `src/components/admin/CohortsAdmin.tsx` has no `aria-label` |
| `compatibility_date` in the generated `wrangler.json` is the build date | nitro generates it; there is no `wrangler.toml` |
| "Măsurare" self-check for the analytics screen (gtag loaded, consent granted, events fired) | written once, never pushed; ~140 lines and one mount edit to redo |
| Embedded no-redirect card form everywhere (the owner asked) | private lessons have it; group checkout, subscriptions and the kids deposit still redirect to Stripe (`create-checkout*`); scope it first |
| Private-lesson paid path never run live end to end | the owner agreed to book one with his own card and refund it, then check the registration is `paid`, the booking has a `google_event_id` and shows in admin |
| Admin cancel inside 24 h never tested in the real panel | — |
| `cohort_calendar.members` ("Cursanții grupei") | verify once: add a lesson to A1 online, check the member is on the invite |
| Trial no-show fee, monthly-group refunds, deposit marker | new on 27 October 2026; first live charge / refund / deposit to be watched in Stripe and in the admin |
| SEO tasks T1–T5 | below |

### Blocked on the owner

- GA4 phase two: the numeric property ID and a service-account JSON (stored as
  Supabase secrets, never in chat).
- The confirmation email's button points at
  `https://araba-libaneza-cu-ibra.lovable.app`: Supabase Auth Site URL and
  redirect allow-list, a setting, not code.
- Whether GA4 is linked to Google Ads (the privacy policy names Ads
  measurement; drop the wording if not).
- Google UI steps: GA4 → Admin → Events → mark `generate_lead`,
  `trial_booking_complete`, `paid_booking_complete` as key events (until then
  every conversion report reads 0 and T5 cannot be validated); GA4 → Product
  links → link Search Console; GSC → check the indexing of new routes.
- Verify the cookie banner, `/privacy` and `/terms` claims and that every
  script honours the consent choice (owner's item 5, deliberately last).

### Analytics, established by reading (not yet verified live)

The root cause of the missing conversions was consent, not the tags: while
the old Adopt banner was expired, Consent Mode stayed `denied`. The built-in
banner (`CookieConsentBanner.tsx`, `src/lib/cookieConsent.ts`) should have
restarted measurement; unverified. The Ads account is `AW-18482373882` and the
bootstrap configures only `G-F167Y815JL`; check Google Ads → Conversions
before calling it broken. Only `begin_checkout` has an Ads conversion: none
for `generate_lead` or `purchase` (they need conversion actions created in
the Ads account).

### SEO tasks (from GSC 11 Jun → 22 Aug 2026 and GA4; figures in `docs/SEO_AUDIT.md`)

- **T1 (P1)** Rewrite the teens page `src/pages/seo/CursuriArabaAdolescenti.tsx`
  (466 impressions, 0 clicks, position 33.5): above the fold age, format,
  price, where, how to start; "Pentru părinți" and "Pentru adolescenți"; FAQ
  from the GSC teen queries; `/trial` CTA top and bottom. Accept: one H1,
  ≥ 900 words, valid `Course` JSON-LD, links to `/cursuri-araba-bucuresti`
  and `/trial`.
- **T2 (P1)** Homepage vs `/cursuri-araba` cannibalisation: the homepage
  becomes brand + formats, `/cursuri-araba` the commercial page for the
  generic query, linked from the homepage as "cursuri de arabă";
  self-canonicals, no cross-canonical. Publish on its own so the effect is
  attributable.
- **T3 (P1)** `/cursuri/grup` (449 impressions, CTR 0.22%): title ≤ 60 and
  description ≤ 155 on "curs de arabă în grupă"; first paragraph answers
  price, start and format; visible table of levels, starts and prices.
- **T4 (P2)** End-of-article CTA to `/trial` and the course page on every
  GSC top-10 blog post (`alfabetul-arab-pentru-incepatori` first).
- **T5 (P3)** Form abandonment (27 `form_start` → 14 `Lead`):
  `RegistrationFormSection.tsx`, `Trial.tsx`: completable at 390 px with no
  horizontal scroll, every error as visible text next to its field. (The
  required-field work of 27 October 2026 added inline errors for name and
  email.)

KPIs to compare at 14 / 30 / 60 days, equal windows: organic clicks 34 (10
weeks), CTR ~1.1%, average position ~26, "cursuri araba bucuresti" 16.93,
"meditatii araba bucuresti" 14.91, "cursuri adolescenti araba" 33.52,
`/meditatii-araba` CTR 0.91%, `/cursuri/grup` CTR 0.22%, organic sessions 50,
`Lead` 14, `form_start` 27, key events 0. Do not make `cta_click` a key event
unless needed (volume).
