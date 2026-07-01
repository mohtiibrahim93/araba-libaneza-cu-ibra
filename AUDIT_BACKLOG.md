# Audit Backlog — Centrul de Araba Libaneza

Living backlog, updated across the audit passes below. Product scope: lead-gen + booking site (quiz → registration → Zoom-synced booking → Stripe payment → admin manages leads). No student login/LMS features exist or are in scope.

**Passes completed:** 2 full passes (this session + this morning's security-focused pass). Third pass not run — the second pass surfaced one new High finding (booking-create email relay), so per the stated stop condition ("iterate until a full pass produces no new Critical/High") one more pass would be warranted before calling this fully exhausted; noted as a gap below rather than silently stopping.

**Environment limitation (applies to every row marked "not independently verified live"):** this sandbox's network policy blocks all outbound calls to the live Supabase project, Stripe, Google OAuth, and reCAPTCHA (`ERR_TUNNEL_CONNECTION_FAILED` on every attempt). Real end-to-end submission-to-database persistence, real payments, and real Google admin login could not be tested from here. Screenshots and console captures below are real; anything needing live network is flagged.

---

## Sprint 1 — Launch Blockers

| Title | Evidence | Impact | Category | Effort | Recommendation |
|---|---|---|---|---|---|
| **Public booking endpoint can be used to spam-relay arbitrary emails** | `supabase/functions/booking-create/index.ts:39-51,140,196-198` + `supabase/migrations/20260626065955...sql` (open "Anyone can submit a registration" INSERT policy). Verified attack chain by reading both: (1) attacker calls the open, unauthenticated registration INSERT with a self-chosen `id` (client supplies the UUID) — no CAPTCHA or rate limit gates this; (2) attacker then calls `booking-create` (verify_jwt=false, no CAPTCHA, no rate limit) with that `registration_id` but an **arbitrary `student_email`** — the code only checks the registration exists by ID, never that the email matches the registration's own email; (3) `sendBookingEmail(...)` fires a real transactional "booking confirmed" email to that arbitrary address, impersonating the business. Repeatable with no limit. | High — reputational (sending-domain blacklisting), potential phishing-relay abuse, no cost to attacker | Security | M | Require `student_email` to match the registration's stored email (reject or ignore client-supplied email, pull it from the DB row instead), and add per-IP/per-registration rate limiting on `booking-create` (e.g. a `bookings` count-per-hour check, or Supabase's built-in rate limiting if available on this plan). |
| **reCAPTCHA on registration fails open** | `src/components/RegistrationFormSection.tsx:219-234` — explicit comment "soft — skip if unavailable"; if `getRecaptchaToken()` returns no token (which is the default state for any scripted/non-browser caller, or if the script fails to load for any reason) the code logs a warning and **proceeds with the insert anyway**. No server-side gate re-checks this. | High when combined with the above — a scripted abuser trivially gets zero bot-check by simply never invoking the reCAPTCHA script | Security | S–M | Either make verification a hard requirement server-side (edge function checks a verified-token flag before allowing high-value actions), or accept this is best-effort UX-friendly bot deterrence and rely on rate limiting instead — but the current state provides no real protection either way. Decide intentionally rather than leave as an accidental gap. |
| **No rate limiting on any public-facing endpoint** | Checked every edge function under `supabase/functions/*/index.ts` — the only "rate limit" hit is `process-email-queue`'s handling of *outbound* 429s from the email provider, unrelated to inbound abuse. `admin-registrations`, `create-payment-intent`, `create-checkout`, `booking-create`, `booking-manage`, `notify-registration`, `verify-recaptcha` all have zero inbound throttling. | High — enables the above spam-relay vector, plus registration-flood / booking-slot-exhaustion abuse, plus cost amplification (each spam registration can trigger a real transactional email send) | Security | M | Add basic per-IP rate limiting (Supabase Edge Functions support this via a KV/Redis-backed check, or a simple DB-backed sliding window on a new `rate_limit_log` table) to the highest-risk endpoints first: `booking-create`, registration insert (via a DB trigger or a wrapping edge function), `create-payment-intent`. |

---

## Sprint 2 — High-Value, Not Blocking

| Title | Evidence | Impact | Category | Effort | Recommendation |
|---|---|---|---|---|---|
| **Refreshing mid-registration silently erases visible progress** | `src/components/ProgramsSection.tsx` (`inlineForm` is a plain non-persisted `useState(null)`) + `src/components/RegistrationFormSection.tsx:81-133` (sessionStorage draft save/restore). Verified live: filled name+phone → `sessionStorage` confirmed to contain the correct draft (`registration_form_draft` key, dumped via `page.evaluate`) → reload → `#name` field gone entirely, form collapsed to course-picker cards → re-clicking the *same* course card correctly restores "Draft Persistence Test" / "0799999999". | High — real lead loss on a lead-gen site; mobile pull-to-refresh makes this a common accidental trigger | Bug / Conversion | S | Persist `inlineForm`'s selected value in the same sessionStorage draft object, or auto-detect an existing draft's `courseType` on mount and auto-open that form instead of the picker view. |
| **Format-selection validation error only shown as a transient toast** | `RegistrationFormSection.tsx:193` (`toast.error(t.mainLeadErrorFormat)`), no `aria-invalid`/inline-error styling on the format/level/location `Select` components (contrast with phone/email fields at `LeadFields.tsx:82-87,99-104`, which do have inline error text). | Medium-High — distracted/mobile users miss the toast, re-click submit with no visible cue why it's failing, abandon | UX / Conversion | S | Mirror the existing inline-error pattern (red border + text under the field) already used for phone/email onto format/level/location. |
| **No refund workflow** *(confirmed still open — from prior audit)* | Repo-wide search for "refund" returns zero matches in `src/` or `supabase/`. | High — manual Stripe-dashboard refunds have no link back to the registration record, no audit trail | Missing Feature | M | Add `refunded_at`/`refund_reason` columns + an admin action calling Stripe's refund API, logged against the registration. |
| **No coupon/promo-code system** *(confirmed still open — from prior audit)* | Same search — zero matches for "coupon"/"promo". Discounts remain hardcoded quantity thresholds (`PrivateFields.tsx` discount tiers, `groupMonths` 1|3 logic). | Medium — can't run a time-limited promo without a code change | Missing Feature | L | Defer past initial launch; build when an actual promo is planned. |
| **Kids-deposit checkout has no recoverable error path** *(confirmed still open — from prior audit, code-level only, not re-verified live this pass due to network block)* | `RegistrationFormSection.tsx` kids+`payDeposit` branch — registration is marked submitted/draft cleared before `create-checkout` resolves; a failure leaves the user on a success screen with no retry. | Medium — silent lead-loss point on a smaller slice of registrations | Bug | S | Don't clear the draft / mark complete until checkout-session creation succeeds; show a retry CTA on failure. |
| **`React does not recognize the fetchPriority prop` console warning** | Captured live via console listener on `/` and `/booking`: `HeroSection.tsx:84` passes `fetchPriority="high"` (camelCase) directly on an `<img>`; this React version expects lowercase `fetchpriority`. Full stack trace captured in this session's tool output. | Low-Medium — cosmetic console noise, but on every homepage load; signals the codebase isn't fully clean of build warnings | Tech Debt | XS | Change to lowercase `fetchpriority="high"` (may need a small TS workaround since React's type defs may not recognize the lowercase form either — verify after editing). |
| **Mobile menu button tap target is 36×36px** *(confirmed this pass, live measurement)* | `Navbar.tsx` mobile hamburger button, measured via headless mobile-viewport (375×667) `boundingBox()` call: 36×36px, below the 44×44px accessibility minimum. | Low-Medium — harder to tap accurately on real touchscreens | Accessibility | XS | Pad the button's hit area to ≥44×44px, keep icon visual size the same. |
| **Name field has no format validation** *(confirmed this pass, live)* | Submitted `🎉🎉🎉` through the live client form — accepted with no error. Cross-checked against `supabase/migrations/20260701121135...sql` — only `length(name) BETWEEN 1 AND 200`, no content/format check, inconsistent with the phone/email regex checks added the same day. | Low — cosmetic/data-quality (ugly admin lead list, ugly personalized emails), not a security issue | Bug / Data Quality | S | Add a minimal "contains at least one letter" CHECK constraint matching the existing phone/email pattern. |
| **`.env` is committed to git** *(confirmed still open — long-standing)* | `git ls-files | grep '^\.env$'` returns a match; `.gitignore` has no `.env` entry. Contents are the `VITE_SUPABASE_*`/anon publishable keys only (safe to expose by design), not a service-role key — so this is an anti-pattern, not a live credential leak, but still worth closing before it becomes one. | Low today, High if a real secret ever gets added to this file without checking `.gitignore` first | Security / Tech Debt | XS | Add `.env` to `.gitignore`, commit a `.env.example` with placeholder keys instead. |
| **No error-tracking/observability service** | Grep for Sentry/LogRocket/`@sentry` across `src/` and `package.json`: zero matches. Client-side errors only reach `console.error` (5 call sites checked) — invisible in production unless a user manually opens devtools and reports it. | Medium — you have no way to know a user hit a JS error unless they tell you | Observability | M | Add a lightweight error-tracking service (Sentry's free tier is the standard choice) — even just capturing unhandled exceptions and the toasted error messages would close most of the blind spot. |

---

## Sprint 3 — Post-Launch

| Title | Evidence | Impact | Category | Effort |
|---|---|---|---|---|
| Main JS bundle 978KB (287KB gzip), no code-splitting *(confirmed still open)* | Clean production build output, no `manualChunks` in `vite.config.ts` | Medium — homepage pays for admin/checkout-only code | Performance | M |
| Oversized hero PNG shipped alongside an already-optimized webp *(confirmed still open)* | Build output: 530.92KB PNG + 138.83KB webp both present | Medium | Performance | S |
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
| Admin panel used a single shared password, no rate limiting | `Admin.tsx`/`AdminLogin.tsx` — zero `password` references; Google sign-in + `ADMIN_EMAILS` allowlist confirmed in `admin-registrations/index.ts:56-66` |
| CORS wildcard (`*`) on all 26 edge functions | `_shared/cors.ts` origin allowlist confirmed applied across all functions; only two dead-internal-default wildcards remain in `auth-email-hook`, both overwritten before the response leaves the server |
| No Stripe idempotency key | Present in both `create-payment-intent:125` and `create-checkout:114` |
| DB validated email/phone length only, not format | `20260701121135...sql` — regex format checks confirmed live |
| Trial page skipped email/phone validation | `Trial.tsx:14,35,39` — `isValidEmail`/`isValidPhone` wired in |
| Meta Pixel was a dead `YOUR_PIXEL_ID` placeholder | Removed entirely from `index.html`, per your instruction |
| Test suite was 3/4 red | `Navbar.test.tsx` fixed (Router context + ResizeObserver stub + stale assertions rewritten); 3/3 passing |
| Duplicate/orphaned migration files | Cleaned up, single canonical migration remains (`20260701121135...`) |
