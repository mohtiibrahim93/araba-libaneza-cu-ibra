# Plan — what is done, what is left

Last verified against the repo on 2026-10-07, `main` at `90addb2`:
704 tests passing, `tsc` clean, zero edge-function drift.

---

## Done

### Two live bugs, both found by the owner

**Unpaid registrants were being given the Zoom link.** `notify-registration`
fires the moment a registration row is written, which is before any payment
exists, and it had never read `payment_status`. It attached the room under a
heading saying *"save this link — you will use it for every online lesson"*,
plus an `.ics` calendar invite. One static `ZOOM_MEETING_URL` serves every
online lesson, so that link is not a detail about the class, it is the class.
Reported for the group form; the same leak was also in the private and kids
paths. Gated on payment in all three. Deployed.

**Bad input to the payment functions returned 500.** `create-checkout-session`,
`create-payment-intent` and `create-subscription` threw on a missing
`registrationId` or an invalid `courseType`. They now return 400 with the CORS
headers attached. This work arrived on the `lovable-sync` branch and was merged
before that branch was deleted — deleting first would have lost it.

### Booking rules

The 24-hour change window is enforced in `booking-manage`, not just stated in
four places. Inside the window the student's link refuses, and the blocked
screen offers WhatsApp so a genuine emergency reaches a person — the rule
protects the slot without turning into a dead end. `internalCall` exempts the
admin panel, so the rule never blocks the owner. Availability slots are now
sorted chronologically; Friday had been listing 09:30 after 17:00 because
candidates came out in the order the rules happened to be stored.

### Public site

The homepage paints its full title in both languages instead of overwriting it
with the short brand on mount. `/` stays Romanian — it is the canonical RO URL
and the RO half of the hreflang pair — and sends a reader whose saved language
is English to `/en` rather than repainting itself.

### The admin panel

- **Analiză** — a time window, which nothing else in the panel had. Every other
  number counted all of time.
- **Structure** — ten sections became twenty. "Grupe" had been five screens
  stacked on one scrolling page and "Programări" three.
- **Azi** — a worklist home screen: lessons today and tomorrow, people nobody
  has answered, people who said yes and never paid, groups starting soon, and
  anything broken. It replaced four all-time totals.
- **Consistency pass** — one shared `ui.tsx` vocabulary across the screens, and
  dark mode fixed in five places that hardcoded light-only amber.
- **Three new screens** — kids' slots, the audit log and the game's card editor,
  for actions that had working backends and no way in. Every admin action now
  has a screen, pinned by a test.

### Review and housekeeping

Caught `payment_status: "unpaid"` in new code — a seventh value in a column with
no constraint, which would have put a hand-added student and an identical one
from the site under two names for the same state. Fixed before it deployed.
`lovable-sync` merged then deleted. All eleven edge functions deployed and
current. The recurring `preview-transactional-email` type error fixed.

---

## The admin needs a real design pass

What shipped was a **consistency** pass, not a **design** pass, and the
difference shows. The panel is tidy and generic: it could belong to any
product.

Specifically, from the code and the rendered screens:

**It uses none of the brand.** The site is deep green (`--brand-green`), cream
(`--cream`) and red, with Lora as its display face. The admin is grey Inter on
white and never touches any of it. Nothing about the panel says whose it is.

**There is no typographic scale.** Almost everything is `text-sm` or `text-xs`.
A screen title, a section title and a table cell are nearly the same size, so
the eye has nothing to anchor on.

**Everything has the same visual weight.** Identical radius, identical border,
identical padding on every card, so an urgent warning and a quiet list compete
for attention instead of ranking.

**It is too loose for a data tool.** Generous padding everywhere means few rows
fit on screen. An admin panel is read, scanned and acted on, not browsed.

**The tables are unstyled.** No hover, no zebra, no sticky header, no alignment
rules for numbers against text.

**The sidebar is a plain list in a white box** rather than a navigation surface.

### What the redesign should do

1. **Adopt the brand.** Cream canvas, green sidebar and structural surfaces, red
   reserved for primary actions and genuine alerts. Lora for screen titles so
   the panel reads as part of the same product as the site.
2. **Establish a type scale** with real steps between screen title, section
   title, body, and meta — and use tabular figures everywhere numbers line up.
3. **Rank by weight.** Alerts loud, data neutral, chrome quiet. Not every box
   needs a border.
4. **Tighten density** for rows and tables while keeping phone width usable;
   the shell was already rebuilt once because ten tabs were unusable at 400px.
5. **Treat tables properly** — hover, aligned numerics, sticky headers on long
   lists, sensible truncation.
6. **Keep every data path untouched.** `docs/admin-redesign-brief.md` lists what
   must not move: the action-name strings, the two-step preview flows, the
   destructive confirmations, and both login paths.

---

## Left

### Needs the owner — cannot be done from here

1. **Verify the two Google Business links** in `src/lib/googleBusiness.ts`. They
   are short-links that cannot be checked from here, and a wrong review link
   sends customers to another business.
2. **Test an admin cancel inside 24 hours.** The `internalCall` exemption that
   lets the owner override the block has never been exercised live — verified by
   reading and by test, never by use.
3. **`ADMIN_EMAILS`** — add a non-Google address if one is wanted. The email
   magic-link path already exists and the gate is provider-agnostic.
4. **Stripe Dashboard** — which payment methods appear at checkout is a Dashboard
   setting. No code sets `payment_method_types`; `create-payment-intent` uses
   `automatic_payment_methods: { enabled: true }`.
5. **Audit Azi.** It was built to a proposed shape, not to an answer about the
   owner's actual morning. It loads properly now, so it can be judged.

### Blocked on information

6. **GA4 in the Analiză tab.** There is no service account in this project:
   Google Calendar goes through Lovable's OAuth connector and there is a
   `GOOGLE_CALENDAR_API_KEY`, and the GA4 Data API accepts neither. It needs the
   **numeric GA4 property ID** (not the `G-` measurement ID) and a service-account
   JSON key placed in Supabase secrets — never pasted into a chat.

### Queued work

7. **The admin design pass** described above.
8. **`admin-trial-booking-failed`** is bundled into `booking-manage` and
   `booking-reminders`, whose deployed copies carry an older copy of that
   template. Judged harmless because only `stripe-webhook` sends that email —
   not independently verified. A redeploy of those two closes it for free.

---

## Standing constraints

- `public/4ce740356d5ab7d75677bda846853184.txt` (IndexNow key) — do not touch.
- `public/robots.txt` — the single wildcard group is deliberate.
- `scripts/seoPrerender.ts`, `scripts/prerenderBody.tsx` — not without instruction.
- RO ↔ EN reciprocity: a new or changed route needs both halves.
- The full Vitest suite must stay green.
