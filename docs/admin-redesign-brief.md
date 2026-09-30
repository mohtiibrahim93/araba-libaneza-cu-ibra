# Admin redesign — what must not move

A brief for whoever restyles the admin section. Written from the code as it
stands on `main`, not from memory.

**The one rule:** this is a *presentation* pass. Change layout, spacing,
typography, colour, component choice, navigation shape, empty states, loading
states — anything a visitor sees. Do not change what gets sent to the server,
what comes back, or when. Every item below is something that looks like markup
and is not.

**Why this brief exists:** the admin surface is about 8,060 lines across 28
files — 21 components in `src/components/admin/`, four more outside it, and
three route pages — and it has **no UI test coverage at all**. The Vitest suite (637 tests)
checks source *text* — that a name is present, that an order is preserved — not
that a button still works. So a redesign that breaks a data path will pass
every test and show up the first time Ibra tries to refund someone.

---

## 1. The admin surface is bigger than `src/components/admin/`

Four admin screens live outside that folder, and one is hidden inside a
public-facing component. A redesign that globs `src/components/admin/**` will
leave these behind and the panel will end up half-restyled.

| File | What it is |
|---|---|
| `src/pages/Admin.tsx` | The shell, the nav groups, the tab bodies, refunds, subscription cancellation, delete/anonymise |
| `src/components/admin/*` (21 files) | Most sections |
| `src/components/AvailabilityAdmin.tsx` | Availability rules |
| `src/components/BookingsAdmin.tsx` | Bookings list, and the admin cancel |
| `src/components/CapacitiesAdmin.tsx` | Seat capacities |
| `src/components/ManualSignupsAdmin.tsx` | Externally-sourced signup counts |
| `src/pages/AdminNotifications.tsx` | Notifications screen, its own route |
| `src/pages/PrivateLead.tsx` | Single private-lead view, its own route |
| `src/components/YallaGame.tsx` | **Contains an admin editor** — `save_card_overrides`, behind a lazy `import("@/lib/adminAuth")` at line ~138. It is a game component; do not restyle it as part of the admin pass, and do not remove that import. |

---

## 2. Action names are an API. They are strings, and they are load-bearing.

Every admin screen talks to one edge function, `admin-registrations`, through
`invokeAdmin({ action: "...", ... })` in `src/lib/adminAuth.ts`. The action name
is matched server-side by exact string. **Rename one and the call silently
returns `{"error":"Neautorizat"}` or nothing — no type error, no failing test.**

Do not rename, reword, or "tidy" any of these, and do not change the shape of
the object they travel in:

```
anonymize                     list_bookings                 update_capacity
attempts                      list_capacities               update_email_settings
calendar_health               list_card_overrides           update_status
cancel_booking                list_cohorts                  upload_blog_media
cancel_subscription           list_course_requests          upload_resource_file
delete                        list_kids_slots               upsert_availability_rule
delete_availability_rule      list_manual_signups           upsert_blog_article
delete_blog_article           list_notifications            upsert_cohort
delete_cohort                 list_page_contents            upsert_kids_slot
delete_kids_slot              list_resources                upsert_manual_signup
delete_manual_signup          list_site_texts               upsert_page_content
delete_page_content           list_student_journey          upsert_resource
delete_resource               list_trial_funnel             upsert_site_text
delete_site_text              mark_whatsapp_sent            get_blog_article
fetch_free                    preview_cancel_subscription   get_private_lead
fetch_live                    preview_refund                get_private_status
list                          refund                        save_card_overrides
list_analytics                resend_confirmation           list_audit_logs
list_availability_rules       send_test_email               list_blog_articles
```

Two call sites do not use an object literal and are easy to miss when grepping:

- `src/components/admin/CohortsAdmin.tsx` — a local `call("upsert_cohort", row)`
  helper.
- `src/components/admin/BacklinksAdmin.tsx` — `invokeBacklinks`, imported from
  `src/lib/backlinks.ts`, which targets a **different** edge function (`backlink-snapshot`) with its own action names
  (`list`, `attempts`, `fetch_free`, `fetch_live`, `upsert_manual`, `delete`).
  Those short names collide with `admin-registrations` names; keep the two
  helpers distinct.

---

## 3. Two-step flows: the preview is not a formality

Three actions are irreversible and are deliberately split into *preview, show
the consequence, then confirm*. The preview call returns real numbers that the
confirmation screen must display before the second call fires.

| Flow | Preview | Commit | What the preview returns |
|---|---|---|---|
| Refund | `preview_refund` | `refund` | `{ success, data: RefundBreakdown + refund_label }` |
| Subscription cancel | `preview_cancel_subscription` | `cancel_subscription` | `{ within_grace, grace_days, refund_amount, currency }` |
| Booking cancel | — | `cancel_booking` | (no preview; the dialog is the guard) |

**The two previews return different shapes — do not unify them.** The refund
preview returns a `RefundBreakdown` (see
`supabase/functions/_shared/refund.ts`): `tier`, `daysBeforeStart`,
`pricePerLessonBani`, `lessonsRemaining`, `nonRefundableBani`,
`remainingValueBani`, `feeBani`, `refundBani`, plus a pre-formatted
`refund_label`. Every amount is in **bani**, not lei — divide by 100 for
display, and prefer the server's `refund_label` where there is one. The
subscription preview is the flat four-field shape above, and
`RegistrationsTable.tsx`'s local `CancelPreview` interface describes *that*
one, not the refund.

Do not collapse a preview and its commit into one button, and do not fire the
preview eagerly on hover or on row render — it is cheap but it is not free, and
a preview rendered without the user asking reads as "this already happened".

---

## 4. Destructive confirmations that must survive

Every one of these currently sits behind an `AlertDialog` or a
`window.confirm`. A restyle that swaps a dialog for an inline button, or that
turns a two-click action into one, removes the only thing standing between a
mis-click and permanent data loss.

Files holding them: `BookingsAdmin.tsx`, `admin/BlogAdmin.tsx`,
`admin/CohortsAdmin.tsx`, `admin/PagesAdmin.tsx`, `admin/RegistrationsTable.tsx`,
`admin/ResourcesAdmin.tsx`, `admin/SiteTextsAdmin.tsx`, `pages/Admin.tsx`.

**`delete` and `anonymize` are not the same button.** They sit next to each
other in `Admin.tsx` and do different things:

- `delete` removes the registration rows entirely.
- `anonymize` strips the personal data and **keeps the payment and history** —
  it is the GDPR-erasure path, and the toast says so ("Datele personale au fost
  șterse; plățile și istoricul rămân"). It also sets `anonymized_at`, which the
  analytics tab reads to exclude those rows from its counts.

Merging them, or giving them the same visual weight and adjacent placement
without distinct labels, is a data-loss bug wearing a design change.

---

## 5. Validation lives on the server — keep its error visible

`src/components/CapacitiesAdmin.tsx` does **not** validate
`min_seats ≤ max_seats` in the browser. The inputs only carry `min={1}`; the
real rule is enforced in `admin-registrations`, which rejects the save with
`"Valori invalide (min ≤ max, ambele ≥ 1)"`, and the only way the user learns
this is the destructive toast raised by the `save` handler.

So: whatever the redesign does with toasts and error surfaces, this message has
to stay visible. If it is swallowed, the form will appear to accept a bad value
and silently keep the old one.

(Adding a matching client-side check would be a genuine improvement — but it is
new behaviour, not a restyle. Raise it rather than slipping it in.)

---

## 6. Auth: do not touch the login screen's second path

`src/components/admin/AdminLogin.tsx` offers Google sign-in **and** an email
magic link (`signInWithOtp`). The email link is not a fallback nicety — Google
sign-in opens a sized popup, and mobile Safari and Chrome routinely block it,
so on a phone the Google button can appear to do nothing at all. The comment at
the top of that file says this; read it before changing the layout.

Both paths are equally secure: the gate is server-side in
`admin-registrations/index.ts` (line 152) and checks only whether the caller's
email is in the `ADMIN_EMAILS` secret. It never checks *how* they signed in.

---

## 7. The analytics tab's colours are validated values

`src/styles.css` defines `--series-1` through `--series-4` twice: once for the
light surface, once under `.dark` for the dark surface. These are not theme
knobs. They were checked with a palette validator for colour-blind separation
and contrast against each surface (worst adjacent pair yellow/aqua: CVD ΔE 9.1
light, 8.4 dark). **Re-stepping one by hand voids that**, and
`src/test/admin-analytics.test.ts` pins the exact hex values, so it will fail
loudly — which is the intent.

Two of the four fall below 3:1 contrast on the light surface. That is allowed
only because the chart ships a legend *and* a table of the exact numbers
underneath it. If you restyle that section, the table stays.

One geometry note, because it already went wrong once: the bars take a
percentage height, so their column needs a resolved height
(`flex h-full … flex-col justify-end`) for the percentage to resolve against.
On an auto-height column every bar collapses to a 2px sliver, and it looks like
"no data" rather than like a bug.

---

## 8. Things that are safe — and welcome — to change

- The nav grouping and labels in `Admin.tsx` (`navGroups`). The `value` strings
  are internal tab keys; renaming a `label` is fine, renaming a `value` means
  updating the matching `<TabsContent value="...">`.
- All spacing, typography, colour, borders, radii, icons.
- Table layouts, card layouts, responsive behaviour. The shell
  (`AdminShell.tsx`) was already rebuilt once because ten tabs in a scrolling
  strip were unusable at 400px — phone width is a real constraint, not a
  hypothetical.
- Empty states, loading states, error states. Several sections currently render
  a bare `—` or nothing on failure.
- The Romanian copy, as long as it stays Romanian. The admin is single-language
  by design; do not add an EN dictionary to it.

---

## 9. How to check the work

There is no UI test to lean on, so:

1. `npx tsc --noEmit -p tsconfig.json` — catches renamed props, not renamed
   action strings.
2. `npx vitest run` — 637 tests. Green means nothing was renamed that a test
   pins; it does **not** mean a button works.
3. `npm run build` — the admin is code-split; a build error here is the only
   place some failures surface.
4. Then actually sign in and click through, at desktop and at 400px width:
   load every tab, run one `preview_refund` without confirming, open (and
   cancel) one destructive dialog in each file listed in §4.

Step 4 is the one that matters. Steps 1–3 will pass on a broken panel.
