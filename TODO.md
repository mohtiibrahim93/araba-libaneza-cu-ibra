# To do — centruldearabalibaneza.com

The owner's list, in his order, plus what is already known about each from the
work so far. Kept here rather than in a chat so the next session starts from
it. Updated 2026-10-09.

---

## 1. Google Analytics conversions, Google Ads, and the cookie banner

Three things that are probably one thing. Consent was denied for every visitor
for as long as Adopt's trial was expired — no GA4, no `generate_lead`, no Ads
conversions — because the banner that was supposed to ask had stopped
rendering. The built-in banner (`CookieConsentBanner.tsx`, Consent Mode v2)
replaced it on 9 October, so measurement should have resumed from that publish;
nothing has verified that it did.

What is known:
- `src/lib/cookieConsent.ts` stores `"all"` / `"essential"` and updates consent;
  the gtag bootstrap re-grants a stored `"all"` before `config`.
- Still blocked on the owner: GA4 phase two needs the numeric property ID and a
  service-account JSON. Without them the admin cannot read GA4 back.
- Unverified: that `generate_lead` actually fires after consent, and that Ads
  sees a conversion. Needs a real visit with the network tab, or GA4 realtime.

## 2. The free trial — DONE, 9 October

Was unbookable by the public from 7 October (the `verifiedRegistrationOwner`
gate with no way for a first-time visitor to pass it). Now: a one-time code to
the address they type, then the card step. Verified end to end against
production — `403 → 200` with a live Stripe URL — and the owner confirms the
code works. Left here only so the history is not lost.

## 3. A list of what is left, and do it

This file. See also `HANDOFF-codex.md` for the environment notes and the
standing constraints.

## 4. Everything functional

Not a task; the acceptance bar for the rest. The honest position is that the
booking funnel is now verified end to end, and most of the admin is verified
only by reading it.

## 5. Cookies, privacy, consent form — verify properly, later

Deliberately after the functional work. Covers: the banner's own behaviour,
what `/privacy` and `/terms` now claim (the privacy page was rewritten on
9 October to say consent is asked by the site's own banner rather than Adopt),
and whether the consent choice is honoured by every script that reads it.

## 6. The authentication link

The confirmation email's button points at
`https://araba-libaneza-cu-ibra.lovable.app`, not `centruldearabalibaneza.com`,
so anyone who clicks the link instead of typing the code lands on the preview
domain. This is the Site URL / redirect allow-list in Supabase Auth settings,
not code — it cannot be fixed from the repository. The code path is unaffected,
which is why it is not urgent.

## 7. Booking students from the admin — DONE for private, 9 October

Was: a group signup could be added by hand, but a private lesson has a time, so
it could not be added at all. Now there are two controls on Programări:

- **Mută lecția** — move an existing booking, including to a time outside the
  published hours. Named warnings (another booking, Google Calendar, a group
  lesson) and a second click to override.
- **Programează o lecție privată** — book someone in from scratch.

Both go through the existing trusted paths (`booking-manage`, `booking-create`)
with the service-role key, so one code path still owns the calendar event and
the emails. Group courses are not bookings and are unaffected.

## 8. The trial lesson's own lifecycle — needs the owner's decision

His words: after the card is saved, cancelling does not let the trial be taken
again; it should count as taken if marked done, or if 24–72 hours pass without
anyone saying otherwise, and then automatically count as not taken.

This is a state machine nobody has designed yet, and it is worth doing
deliberately rather than inferring. See the question in the chat of 9 October:
the proposal was `confirmed → (done | no_show)` with a timer that only *asks*
rather than deciding by itself, because a lesson silently marked "taken"
removes a free trial from someone who may simply have been ill. The owner has
not chosen yet.

---

## Carried over, not blocked, nobody waiting on it

- Cohorte has roughly 12 unlabelled row controls (missing `aria-label`).
- `compatibility_date` in the generated `wrangler.json` is the build date.
- **Google Calendar → admin, for bookings.** Group lessons do pull back from
  Google (`sync_cohort_sessions`, on opening Grupe › Lecțiile grupelor).
  Bookings are write-only: nothing reads Google back into them, so a lesson
  moved or deleted in Google is invisible here and reminders still fire on the
  old time. There is no `events.watch` channel and no polling. Bookings do
  store `google_event_id`, so a pull-back can match exactly rather than by
  title — safer than the cohort path. The two admin controls above reduce how
  often this matters, since the reason to edit Google by hand is mostly gone.
- The embedded, no-redirect card form that private lessons now use, applied
  everywhere else that still redirects to Stripe (group checkout,
  subscriptions, the kids deposit). The owner asked for this; not started.

## Blocked on the owner

- GA4 numeric property ID + service-account JSON (item 1).
- The Supabase Site URL (item 6) and, if he wants it, the OTP length.
- The trial lifecycle decision (item 8).
