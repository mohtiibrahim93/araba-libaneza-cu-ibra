# Site audit, October 2026: open to-do list

Full audit of code + live site done on 12 Oct 2026 (code at 124db82). Status
re-checked on 26 Oct against main and the live site.

## Status (update this block as items close)

- DONE 9 Nov 2026 (handoff of 9 Nov, on main): Lovable's 12 editor commits of
  5–8 Nov merged into main (they had never reached GitHub). Owner decisions:
  the 8 Nov refund rule stands (Stripe fee kept; after lesson 2 the running
  month becomes 6-month credit or private lessons at 150 lei; future months
  come back to the card), and the manual WhatsApp reminder button for trials
  stays. Built: no email address in auth-email-hook or sync logs; booking-create
  mails and invites only the address saved on the registration
  (contact_email, else email); taking a student off a group's calendar list
  removes them from the group's lessons still to come (quietly, no email);
  kids sign-up says "in person only, 6–11" first; /de/arabisch-lernen → 301 to
  /; colour settings (hairline, top-bar, top-bar-gold, whatsapp) replace the
  hex in the menu, Why section, landing layout and booking page; the two
  photos of Ibra on blog articles have a description.
  OPEN: "article under review" waits for the owner to name the dialect drafts
  (none is marked in the code).
- VERIFIED 11 Nov 2026: main holds every change of Lovable's 5–8 Nov commits
  (110 changed blocks checked one by one) and Lovable's 9 Nov platform update
  to src/integrations/supabase/previewAuthStorage.ts. NOT LIVE: Lovable's
  editor is still on its own history (23cfae2f) and has pulled nothing from
  GitHub since e3ce69c0 (4 Nov, 23:30 UTC); the live site and the live `mcp`
  function are Lovable's version, so nothing pushed to GitHub since 5 Nov is
  live (payment note 24–48 h and cash rule, "(0 lei)" undone, "Pentru cine?",
  floating buttons, catch-up fee by missed lessons, trial screen text,
  assistant end dates, and the 9 Nov items above). The 8 Nov refund rule is
  live (it was made in Lovable). Once the editor is on main: publish, and
  deploy admin-registrations, auth-email-hook, booking-create, booking-manage,
  booking-reminders, calendar-sync, mcp. No database migration is pending
  (last recorded: 20261104150000).
- OWNER, 11 Nov 2026: the two in-person groups running since September are
  500 lei (A1) and 600 lei (A2) a month; the price list stays 700 / 840 in
  person. BUILT, not live: a group's own price (group_cohorts.price_lei,
  "Preț (LEI)" in the group editor) replaces the list price for that group in
  the catch-up cost of "Grupe în desfășurare" and in the admin's payment
  amounts; the level page no longer quotes the list price as "this group's"
  price. OPEN: write 500 and 600 on the two groups (no value is set yet); the
  card checkout still charges the list price by level and format (payment
  code, not touched).
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
- DONE P0-4 to P0-9 (live 2 Nov 2026): P0-4, P0-6, P0-7 in 5be22d98; P0-9 in
  b82f0209; P0-5 and P0-8 were fixed on 27 Oct by another session.
- DONE 2 Nov 2026: four lesson types in the admin form (Plătită, Probă
  gratuită, Recuperare, Bonus); website trial sign-ups with no time chosen can
  be booked from the admin form (7b5c0f53).
- BUILT, NOT LIVE 2 Nov 2026: group seats (2-hour hold for unfinished
  payments, finish-payment and seat-released emails, over-capacity alert,
  "1 lună acordată"), b0fb8efc. Needs migration 20261103090000 and a deploy
  of admin-registrations, booking-reminders, stripe-webhook,
  create-checkout-session, create-payment-intent, create-subscription.
- BUILT 3 Nov 2026, not live until deployed and published (commits 538b8eaf..eacea8b4):
  - Admin (Chrome pass #1-#12): #1 one way to add a student, #3 seat split,
    #4 24-hour times, #7 floating selection bar, #8 sidebar name, #9 tab
    name, #10 trial funnel counts, #12 "Mută în altă grupă". #2 was already
    done. #5 no longer reproduces (no "incomplete" rows). #6 is by design (a
    make-up lesson or a new package is its own registration). #11 is an owner
    decision: owner, 3 Nov: A2 online is not live yet; the only A2 running is
    the in-person one, so the draft is correct.
  - Public (Chrome pass #13-#35): done except #16 (covered by the forming
    groups section), #18 (already fixed), #22 (no longer in the code), #32
    (now "yalla, I'm in", owner 3 Nov). #15 already showed dates.
  - Payment links carry no email or name. ?token= and ?sig= stay: they are
    the access keys of those pages, and P0-3 keeps them away from Google.
  - P1 security: #2, #3, #4, #5, #7 done. #1 (which header holds the real
    visitor IP behind Supabase) needs a live request to confirm. #6 is the
    owner's Zoom setting.
  - P1 broken: all done (#1 table columns, #5 real 404s for unknown blog and
    course addresses, #7 Checkout / Payment status / Private status in
    English, #9 notes label and an honest message when a time is not offered
    in person).
  - P1 legal: owner and lawyer.
- DONE 4 Nov 2026 (owner answers): one set of hours, 09:00–18:00 every day,
  weekends mostly online, in person by arrangement (private lessons; groups
  keep their own schedule); MSA is not offered (FAQ, English pages, German
  page, assistant); ANPC SAL link in the footer and Terms section 10.
- DONE 4 Nov 2026, P3: a11y #5 heading order on /invata-araba-gratis; SEO #3
  dateModified (an article's `updated` date in src/lib/blogPosts.ts, set by
  hand when its content changes); i18n #2 WhatsApp texts, the logo label, the
  error page and the game frame title in English; i18n #3 the German page
  leads to /en and /en/trial and no longer promises MSA; code #4 drizzle
  pinned, #7 one shared realtime channel (src/lib/sharedRealtime.ts), #11
  GroupOverview, the private branch of PostSubmitView and the kids "online
  10+" rule removed, #12 stale comments, #14 HANDOFF no longer exists.
  Still open: code #9 (two auth-email hooks: Lovable platform files, left as
  they are), SEO #6 (English blog slugs: renaming 46 URLs without
  server-side 301s would lose their search history), code #13 (03x numbers).
- Everything else below is still open unless marked.
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

**Queued by the owner, 1 Nov 2026**

1. **A1 in-person group: Wednesday lessons move to 18:30** (were 19:00), from
   Wednesday 4 Nov onward. Monday 2 Nov stays at 19:00. DONE 1 Nov: weekly
   pattern (`cohort_meetings`, Wednesday) set to 18:30–20:00; schedule labels
   "Luni la 19:00 & Miercuri la 18:30" / "Monday at 7:00 pm & Wednesday at
   6:30 pm". OPEN: the owner adds the missing lessons L18–L32 from Lecțiile
   grupelor (none existed after L17, 28 Oct).
2. **Calendar sync is wrong for some lessons** (owner: about 90% correct). One
   private student's lessons (named by the owner) do not match Google Calendar.
   Verify the sync lesson by lesson against the calendar, find why the rest
   drift, and fix the cause, not only these rows.

**Claude in Chrome pass, 1 Nov 2026 (admin signed in, public site at ~500 px for mobile)**

Admin:
1. [high] Three ways to change a group's seats compete: "Adaugă un cursant
   manual" (Cursanți › Înscrieri externe; a real person in a group, the one to
   keep), "Înscrieri manuale (alte surse)" (a number per level and format), and
   the "Înscrieri manuale" field per group in Cohorte grupe (a number, shown on
   the cards as "Ajustare de locuri"). Keep the first; retire or relabel the two
   number-only ones without losing the counts they hold today.
2. [high] Editing any group row whose capacity is above the later 8/6 rule
   fails (constraints `group_cohorts_fizic_max_seats` /
   `group_cohorts_online_max_seats`, NOT VALID but checked on update). Hits the
   three groups started before October with 10 places. Owner: the 10 places are
   real. DONE 1 Nov: `20261101170000_seat_cap_exempts_existing_groups`.
3. [medium] "Locuri ocupate" mixes real registrations with hand-added numbers
   (A1 online 15 Aug: 12/10 with 0 registrations).
4. [medium] Lecțiile grupelor: the A2 in-person group's last lesson shows
   "3 nov, 07:00" while it runs at 19:00 (time-zone or 12-hour problem).
5. [medium] Student sheet "Stare" shows "Incomplet — fără interval ales" while
   the table shows Convertit/Contactat (2 students).
6. [medium] One private student appears twice (×3 marker).
7. [medium] Ticking a row in Înscrieri inserts the delete bar above the table
   and shifts the rows under the cursor, next to the red Șterge.
8. [low] Brand in the admin sidebar says "Arabă cu Ibra"; should be "Arabă
   Libaneză cu Ibra".
9. [low] Capacități text points to an "Înscrieri manuale" panel that is not on
   that tab.
10. [low] Parcurs: 0 slots booked, 0 trials held, but 3 converted (50%).
11. [low] A2 online is still Draft with a past start (2 Sep).
12. No control moves an existing registration into a group.

Public site (each line: page — problem):
13. [medium] /en header — Contact goes to the Romanian /#contact, not /en/contact.
14. [medium] /en top bar — shows the Romanian 7 Nov group; the English group is 21 Nov.
15. [medium] /en homepage "Group Classes" — no dates, unlike the Romanian card.
16. [medium] /cursuri/grup and level pages (RO+EN) — no upcoming dates outside
    the sign-up form (covered by the forming-groups section and group pages).
17. [medium] /quiz — "10 locuri online" adds the RO (4) and EN (6) groups; the
    badge also overlaps the A1 arrow.
18. [medium] /trial — in-person offered on a weekday slot although the page
    says weekends only.
19. [medium] Mobile homepage — phone mock-up text 8.5–10 px; small tap targets
    (top-bar pill and Programare ~28 px, level chips ~29 px, "Programează o
    discuție" and "Toate grupele →" ~20 px).
20. [low] /trial — slots take ~5 s with only a spinner.
21. [low] Trial "0 lei" on /preturi and the homepage; the 150 lei no-show charge
    only on /trial.
22. [low] /preturi — "plătești la rezervare" vs "te contactăm pe WhatsApp pentru plată".
23. [low] /cursuri/grup — B1 "fără alfabet arab" vs C1 "scrisul din B1 sau B2".
24. [low] /quiz — "30 de secunde" vs "sub două minute"; promises motivation/time
    questions but has 3; result says "profesori nativi" (plural).
25. [low] /en/quiz — one level-test link goes to /test-de-nivel.
26. [low] /en FAQ "42 questions" vs RO "44".
27. [low] /en/courses/group/a1 — "1.700 LEI" (RO number format); British and
    American spelling mixed.
28. [low] /test-de-nivel — "Nu ai nevoie de cont" next to "Progresul se
    salvează în cont" (signed in).
29. [low] /cursuri — "Test la centru (gratuit)" described as "fizic sau online".
30. [low] /cursuri/grup/a1 form — cohort card repeats schedule and start date.
31. [low] /blog — images are grey boxes for 2–3 s.
32. [low] Homepage mock-up — "yalla, I m in" lacks the apostrophe.
33. [low] Mobile — sticky "Înscrie-te rapid" bar covers the group card's own button.
34. [low] Mobile /cursuri/grup/a1 — unlabelled "Fizic / Online" toggle.
35. [low] Mobile top bar — "A1 online · 7 nov" with no seats or language; no
    "Lecție gratuită" in the header.

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
