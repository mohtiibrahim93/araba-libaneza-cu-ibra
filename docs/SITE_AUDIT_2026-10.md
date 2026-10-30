# Site audit, October 2026: open to-do list

Full audit of code + live site done on 12 Oct 2026 (code at 124db82). Status
re-checked on 26 Oct against main and the live site.

## Status (update this block as items close)

- DONE P0-1 Stripe webhook lost events on failure: fixed (26b81146).
- DONE P0-2 sign-up emails: admin alert restored for anonymous sign-ups,
  student confirmation sent after checkout email verification (d86573e6).
  Confirmed live: the first group sign-up after 12 Oct produced the admin alert.
- DONE Lint crash (ajv override): fixed by another session on 12 Oct.
- DONE P0-3 Google receives no emails, names or tokens from URLs (30 Oct):
  every URL sent to GA goes through `src/lib/analyticsUrl.ts` (query dropped
  except utm_*/gclid/gbraid/wbraid/page; `/booking/manage/<token>`,
  `/private-status/<id>`, `/admin/private-leads/<id>` become `/:id`). Google Ads'
  remarketing tag (AW-18482373882) reports the real address bar (`top=`), so on
  those token paths the Google tag is not loaded and no event is sent. Checked
  in a browser against captured Google requests. Still in URLs (not sent to
  Google): `/checkout?email=&name=`, `?token=`, `?sig=`; moving them out
  belongs with P0-4/P0-5 (same files).
- OPEN P0-4 … P0-9 and everything below: still open as of 26 Oct.
- DONE One group registration from 11 Oct (A1 in person) had no group attached
  (`cohort_id` null), so it could not pay. Resolved (confirmed by the owner, 30 Oct).
- Suggested next order: P0-4 and P0-5 (the group payment flow), then P0-6 to P0-9.

Edge-function fixes go live only through a Lovable deploy (credits); pushing
to main does not deploy them. Bundle fixes into one deploy.

## Added 30 Oct 2026 (not in the 12 Oct audit)

Re-crawl of the live site on 30 Oct (135 sitemap pages, desktop + mobile):
all 200, no broken internal links or images, no mobile horizontal scroll, one
H1, description and correct canonical everywhere. Still live from the list
below: Romanian pages render in English after an /en visit (P1 broken #3), and
`/blog?page=2` repeats page 1's title (SEO #5). The reCAPTCHA `pat` 401 and
`requestStorageAccess` console lines are Google's own noise, not a bug.

**Deploy pending (blocked: Lovable out of credits, 30 Oct).** `main` 0e7fed41:
deploy 16 edge functions (admin-registrations, booking-create, booking-manage,
booking-reminders, calendar-sync, create-checkout, create-checkout-session,
create-payment-intent, create-subscription, gdpr-request, mcp,
notify-registration, preview-transactional-email, resource-download,
stripe-webhook, trial-followup), publish and compare the bundle hash, run
`20261027121000_required_registration_fields.sql` and record it, send one test
email for the sender name "Arabă Libaneză cu Ibra". Until then the P0-3 fix and
the 30 Oct admin changes (e.g. "Actualizează titlurile") are not live.

**Forming groups (owner, 30 Oct). Mock-up made, not built yet.**
1. Admin › Grupe: the first card, "Lecțiile grupelor", lists only groups with
   a calendar name (`sync_cohort_sessions`), so groups still forming are
   missing. The overview that has their numbers (`CourseOverviewAdmin`) is third
   in the tab, sorts oldest first, shows finished groups and leaves `free` /
   `expired` out of its payment chips. Proposed: a "Grupe în formare" card on
   top (seats, registrations by payment status, minimum to start, days to
   start). Frontend only.
2. Public: forming groups appear as two lines of text on `/cursuri/grup`, which
   count free seats rather than taken ones. There is no page per group: the old
   `/cursuri/curs/$slug` is Romanian only and both forming groups have no `slug`.
   Proposed: a "Grupe care se formează" section with "N din M locuri ocupate",
   plus a noindex page per group in RO and EN.
3. [DB] The A2 online group is still a `draft` with a past start (2 Sep).
4. Two or more ways to add a student by hand overlap in admin; the owner wants
   to keep only the newest one (which one to be confirmed).

**Still in URLs after P0-3** (no longer sent to Google): `/checkout?email=&name=`,
`?token=`, `?sig=`. Move them out together with P0-4 / P0-5.

---

## P0: money, lost emails, privacy (fix first)

1. **Stripe webhook can lose payments.**
   - The event id is saved _before_ processing. If processing fails, Stripe's retry is treated as a duplicate.
   - Result: the payment is never marked paid, or the booking is never made. Record the id only after success.
   - File: `stripe-webhook`.
2. **Group, kids and level-check sign-ups probably send no emails, to neither the student nor you.**
   - Since 8 Oct, `notify-registration` requires a verified login, but it is called after anonymous sign-ups.
   - To confirm, I need your OK to run one read-only query on `email_send_log`.
3. **Google Analytics receives personal data in URLs.** [VERIFIED in code]
   - It gets email and name (`/checkout?email=&name=`), access tokens (`/rezervari?token=`, `/booking/manage/<token>`) and `?sig=`.
   - This breaks Google's terms and GDPR. Strip query strings and token paths before sending, and stop putting PII in URLs.
4. **Embedded card payments are never confirmed on the status page.** [VERIFIED live]
   - The return URL has no `sig`, so `get-payment-status` always returns null and the `purchase` event never fires.
   - `/thank-you` (kids deposit) always shows "unconfirmed": it calls a function that requires login, without a login.
5. **Group sign-up dead end.**
   - Email is optional on the group form, but the payment gate requires it.
   - People without an email get stuck after the registration has already been saved. Going back creates duplicates.
6. **The `/api/chat` AI assistant has no rate limit.**
   - It spends paid Lovable AI credits, so anyone can run up the bill.
   - Invalid JSON returns a 500 HTML page. [VERIFIED]
7. **Booking times are not checked against your availability when paying.**
   - A tampered request can book a trial or paid lesson at 03:00, in 10 minutes, or months ahead.
   - Validate the slot in `create-checkout-session` and `create-payment-intent` (rescheduling already does this).
8. **The AI assistant sells kids courses that don't exist.** Its fact sheet (`askKnowledge.server.ts`) lists kids groups and prices.
9. **Kids sign-up and payment are still reachable**, through the quiz and the general form, although kids courses aren't running.
   - The kids deposit is still payable, even without a registration.
   - The quiz comparison still shows "Copii · 6 locuri".

## P1: security, legal, broken features

**Security**

1. **Spoofable per-IP rate limits.** They trust the first `X-Forwarded-For` entry, which a client can set.
   - Verify this, and what IP `trg_registration_rate_limit` reads.
2. **The free-PDF form can be used to email any third party.**
   - There is no confirmation step, and leads are stored as marketing consent without double opt-in.
3. **Stripe customers are matched by the email the browser sends**, not the verified registration email (create-subscription, create-checkout, create-payment-intent).
4. **Raw Stripe/internal error text is shown to visitors** (several payment functions).
5. **"Forțează ștergerea (test)" is visible in the production admin.** It deletes paid registrations and bookings.
6. **One shared Zoom link for every lesson** (env `ZOOM_MEETING_URL`). [OWNER] Confirm the waiting room or passcode is on.
7. **CORS allows any `*.lovable.app` site.** Low risk, but broader than needed.

**Legal [LAWYER] [OWNER]**

1. **No legal entity anywhere** (name, CUI, registered address), and **no ANPC SAL/SOL**. Ask about the 14-day withdrawal right too.
2. **The Terms are outdated.**
   - They say "pay after confirmation, LEI/EUR/USD", while the site charges cards in RON at sign-up.
   - Missing: monthly auto-billing, card on file for the trial plus the **150-lei no-show charge**, the 24h rule, group start/refund rules, the 5-day subscription grace, kids deposit refunds, and the "full refund 7 days before start" badge.
   - Billing starts at payment, not at cohort start. Confirm that's intended.
3. **RO and EN Terms contradict each other on kids courses** (in person vs online).
4. **The Privacy policy is missing:**
   - Google Fonts (Inter loads from Google before consent; self-host it).
   - reCAPTCHA on every page before consent.
   - Google Ads.
   - Student accounts with Google sign-in and stored game progress.
5. **Marketing consent is bundled with the PDF download** (one checkbox). Split it into two.
6. **The trial copy says "Fără nicio obligație" / "0 lei"** while a card is required and a no-show costs 150 lei.
7. **Choosing "essential" after "all" in the cookie banner doesn't delete existing `_ga` cookies.**

**Broken or visibly wrong** [VERIFIED live]

1. **The quiz's "Compară toate opțiunile" table is broken.** Cells land in the wrong columns.
2. **The mobile "Întreabă despre cursuri" button is hidden under the sticky "Înscrie-te rapid" bar.**
3. **After visiting any /en page, every Romanian URL (including the homepage) renders in English** with `<html lang="en">`. Correction: earlier I wrote that lang stays "ro". It actually switches to "en".
4. **`/en/arabic-tutor` says "0% off from ten lessons".**
5. **Soft 404s** (pages that return 200): `/en/blog/<anything>` and `/cursuri/curs/<anything>`.
6. **There is no English prices page.** `/en/prices` returns 404, then redirects to the Romanian `/cursuri`.
7. **Checkout, Payment status and Private status are Romanian only.**
8. **The `CheckoutEmailGate` screen is minified and unstyled.** It is the first screen of every group payment and shows raw Supabase errors.
9. **The trial booking form has no labels.** Choosing "fizic" after picking a weekday slot shows a false "slot was just taken".
10. **MyBookings / BookingManage:**
    - Past lessons show "too late to change" and "Join lesson".
    - The reschedule dialog's dismiss button is labelled "Anulează", the same label as cancelling the booking.

## P2: content accuracy (mostly [OWNER])

**Prices, sizes and schedules are hard-coded in about 10 places**, outside `pricing.ts` / `groupSize.ts`, and they drift:

- FindYourTrackQuiz, PostSubmitView ("150/210 lei"), the /preturi meta, CursGrup and CursPrivate JSON-LD, GroupFields fallbacks, BookingLanding, the MCP function, and the "open levels A1/A2" set (3 copies).
- Hand-written posters and "groups started in September" text.
- [DB] The A1 in-person cohort has `max_seats=10`, but the site says max 8.
- [DB] The location is named "Raduga **Cultural** Center" in the database but "Creative Center" on the site.
- [DB] The EN schedule label uses 12-hour time with a trailing space.

**Contradictions to settle** [OWNER]

- Kids course: online or in person (Terms, homepage JSON-LD, 3 articles, the teens page).
- Arabizi vs alphabet policy (the Arabizi article EN vs RO).
- Is MSA offered? (EN pages say it's optional; the RO page says Lebanese only.)
- Do teen courses exist?
- Opening/reply hours: 4 different sets (LocalBusiness, Contact, Level check, Meditații).
- "Up to six students" vs "6 online / 8 in person" on the same EN page.
- The 90-minute lesson structure is described 3 different ways.
- Time to reach a level: "3–6 months conversational" vs about 11 months to A2.

**Claims to substantiate or soften** [OWNER]

- "Singurul centru din București".
- "4,300+ expressions": the game has **2,768 cards**.
- "21 Preply reviews" is hard-coded, and two trust badges say the same thing.
- "profesori nativi" (plural).
- "12 locuri online", which sums cohorts while the maximum per group is 6.
- "10+ years in Bucharest, 5+ years teaching".
- Assessments every 8–10 lessons, the internal certificate, ALPT preparation, lesson recordings, "all levels online".
- The Bucharest market prices quoted.
- Unsourced statistics: speaker counts, diaspora, GDP, French/English percentages.
- Third-party resource names in two articles that I could not verify.

**Language and house-style corrections** [OWNER]

- Grammar article says Lebanese has no dual for nouns, but Levantine keeps it, and the family article uses the dual.
- "Addesh" vs "bikam".
- Arabizi spelling varies (Mnee7/mniih…, verb transliterations).
- The heading "E „barează”…" looks like a typo.
- Eastern Arabic numerals are also used in Lebanon.

**Stale copy**

- "We'll contact you on WhatsApp to finish payment / methods / IBAN".
- Payment "in lei, euros or dollars, PayPal".
- "© 2026" is hard-coded.
- The trial follow-up email goes to no-shows too.
- Auth emails have English-only subjects.
- The reCAPTCHA notice repeats its own wording.

## P3: design, accessibility, SEO, i18n, code

**Design**

1. The homepage course cards use stock photos. Use real photos of the centre.
2. Hero text is 8.5–11px.
3. The "Resurse gratuite" section is inset compared with the other sections.
4. The ProgramsSection inline form uses `col-span-3` in a 2-column grid.
5. BookingManage, CourseDetail and the legacy admin pages use the old styling.
6. The `/booking` page with a registration has no navbar or footer.
7. "Browse all resources" goes to /blog instead of /resurse.
8. Full cohorts on /booking are dead buttons with no waiting list.
9. ActiveCoursesBanner shows "0 / 6 ocupate".
10. "Test la centru" links to /trial instead of /verificare-nivel.

**Accessibility (axe, live)**

1. **Contrast fails sitewide** on 145 of 162 pages: the WhatsApp pill (1.98:1) and the gold "next course" text in the top bar.
2. The skip-link target is missing on 7 pages.
3. One unnamed link or button on about 27 pages.
4. aria-label on role-less divs (quiz steps, star rating).
5. Heading order on /invata-araba-gratis; an empty `<th>` on /preturi.
6. Missing aria-pressed on choice buttons; vague stepper labels "−/+".
7. Animated pulses with no reduced-motion guard.
8. Text set at 11px.

**SEO**

1. Every blog article (46 URLs) has **two Article JSON-LD blocks**.
2. BreadcrumbList points to Romanian `/blog`, `/cursuri` and `/` on English pages.
3. `dateModified` never changes.
4. HowTo anchors don't exist.
5. `/blog?page=2` duplicates page 1's title and description.
6. English URLs use Romanian blog slugs.
7. Crawl was clean otherwise: all pages 200, no broken links, single H1, valid JSON-LD, self-canonicals, lengths OK.

**i18n**

1. **19 of 63 English pages link to Romanian URLs** in the served HTML. Most common: /cursuri/grup, /trial and /privacy (10 each), then /cursuri.
   - Cause: about 60 files use the plain `Link`/`<a href>` instead of `LocalizedLink`.
2. Romanian-only WhatsApp prefill texts, aria-labels, the error page and iframe titles.
3. The German page leads into the Romanian funnel.
4. The `?payment=success` cleanup drops `/en`.

**Code, ops and tooling**

1. **`npm run lint` crashes.** The `ajv ^8` override breaks ESLint 9, so lint is effectively off.
2. `npm i` fails (next-themes peer dependency) while the README says to use it. bun works.
3. The knip config points to a deleted `src/main.tsx`.
4. drizzle is pinned to a loose `0.x`.
5. Two migration folders, and drizzle 0004/0005 duplicate supabase migrations.
6. Bundles over 500 kB: the chat (806 kB, including unused language grammars), admin (788 kB) and index (620 kB).
7. Each seat badge opens its own Supabase realtime channel.
8. reCAPTCHA is fail-open by design and checks neither action nor hostname.
9. Two auth-email hooks must be kept in sync by hand.
10. The admin tab isn't in the URL; admin lists have no pagination.
11. Unused: `admin/GroupOverview`, the private branch of `PostSubmitView`, the kids "online 10+" logic.
12. Stale comments: YallaGame says "no accounts", "8 digits", App.tsx, CourseLayout.
13. Romanian 03x landline numbers are rejected unless typed as +40.
14. HANDOFF §0/§1 are out of date: the live site is at 124db82.

---

**Decisions only you can make:**

- The P2 contradictions.
- The kids, teens and MSA offer.
- The billing start date.
- Zoom settings.
- The legal entity details and lawyer review.
- Real photos.

**Things that need your OK before I touch them:**

- The read-only `email_send_log` query (P0-2).
- [DB] fixes for seats, the location name and the schedule label.
