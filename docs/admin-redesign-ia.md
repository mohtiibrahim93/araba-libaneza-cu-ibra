# Admin redesign — the proposed structure

Stage 1 of the re-think: what the sections should be, before any pixel moves.
Read `admin-redesign-brief.md` alongside this — it lists what must not break.

---

## What is wrong with the current structure

Not opinion — these are things the code does today.

**Five screens are stacked on one page.** "Grupe" renders `GroupOverview`,
`CapacitiesAdmin`, `CourseRequestsAdmin`, `ManualSignupsAdmin` and
`CohortsAdmin` one after another, ~1,100 lines of UI in a single scroll. "Lecții"
stacks three the same way. Finding the capacity editor means scrolling past a
cohort list.

**The home screen answers a question nobody asks.** "Panou general" shows four
all-time totals and two all-time funnels. "How many registrations have there
ever been" is not a thing you need on opening the panel. What you need is what
changed since yesterday and what is waiting on you.

**It duplicates the analytics tab.** Since Analiză exists, the funnels on the
home screen are a second, worse answer to the same question — and the home
screen's version has no time window at all.

**Three different headers.** `AdminShell` wraps `/admin`, `AdminNav` wraps
`/admin/notifications` and `/admin/private-leads/:id`. Two of the panel's
screens look like a different product.

**Two features exist in the backend and nowhere in the UI.** The kids'-slot CRUD
(`list_kids_slots`, `upsert_kids_slot`, `delete_kids_slot`) and the audit log
(`list_audit_logs`) are implemented and deployed, and no screen calls them. The
audit log is *recording every destructive action* and nobody can read it.

**One admin screen lives inside the public game.** `YallaGame.tsx` reveals card
editing when signed in, and publishes via `save_card_overrides`. Reached at
`/joc`, never from `/admin`.

---

## The proposed structure

Organised by what you actually do, in the order you do it.

### 1. Astăzi — the home screen

Replaces "Panou general". Not statistics: a worklist. Everything here is
something that may need an action from you today, and each line clicks through
to where you do it.

- **Lecțiile de azi și mâine** — time, student, online/at the centre, the Zoom
  link, and whether the calendar sync is healthy
- **Lead-uri necontactate** — registrations with no `whatsapp_sent_at`, oldest
  first. This is `list_notifications`, which today is hidden on its own route.
- **Înscrieri neplătite** — `payment_status` not `paid`, with how many days have
  passed. Directly actionable: these are people who said yes and have not paid.
- **Grupe la limită** — cohorts within one or two seats of their minimum (at
  risk) or of their maximum (nearly full)
- **Ce nu merge** — calendar sync errors (`google_sync_error`), failed payments,
  anything that needs a human

When there is nothing to do, it says so. An empty worklist is a good day, and
the screen should look like one.

### 2. Cursanți

Everything about people, in one place.

- **Înscrieri** — the registrations table, filters and the three exports
- **Fișa cursantului** — the private-lead detail, moved inside the shell
  instead of living on its own route with its own header
- **Parcurs** — the student journey and trial funnel, moved out of the home
  screen to where they belong

### 3. Program

Everything about time.

- **Lecții** — the bookings list
- **Disponibilitate** — the availability rules
- **Sloturi copii** — the orphaned CRUD finally gets a screen
- **Sănătate calendar** — diagnostics, collapsed by default; it matters when it
  is broken and is noise when it is not

### 4. Grupe

The five-deep stack, split into sub-screens with their own in-page nav.

- **Cohorte** · **Capacități** · **Cereri de curs** · **Înscrieri externe**

### 5. Analiză

As built. No change — it is the newest screen and already has the time window
the rest of the panel lacks.

### 6. Conținut

- **Blog** · **Resurse** · **Pagini** · **Texte site**
- **Cartonașe joc** — a link out to `/joc`, so the game's editor is at least
  discoverable from the panel. Not moved: it has to run inside the game frame.

### 7. Sistem

- **Setări** — email, payments, account
- **SEO** — backlinks and domain health
- **Jurnal** — the audit log, finally readable. Who deleted what, when.

---

## What this changes, and what it does not

**Does not change:** any `invokeAdmin` action name, any request or response
shape, any destructive confirmation, the two-step preview flows, or the login
screen's two paths. The brief lists all of these. A section moving to a new
place in the nav is a `value` string and a `TabsContent`, nothing more.

**Does change:** `AdminShell`'s nav tree; the home screen, which is rewritten
rather than restyled; and two routes (`/admin/notifications`,
`/admin/private-leads/:id`) folded into the shell so `AdminNav` can be retired.
Both keep working as URLs — they are linked from emails.

**Needs new backend work:** only the home screen. Everything it lists exists in
the database; what does not exist is one action that returns it in a single
call instead of five. One new read-only action, `list_today`, shaped like
`list_analytics`.

**Needs your decision:** surfacing the kids'-slot CRUD and the audit log means
building two screens for features you may not want. The alternative is deleting
the four server actions. Either is fine; leaving them implemented and invisible
is the only bad option.

---

## Order of work

Each stage is reviewable on its own and leaves the panel working.

1. **The shell and the nav tree** — new structure, existing screens moved into
   it unchanged. Nothing is restyled yet, so if a section breaks it is because
   it moved, which is easy to see.
2. **Astăzi** — the new home screen plus its `list_today` action.
3. **The split screens** — Grupe and Program broken into sub-screens.
4. **The visual pass** — typography, spacing, tables, empty and loading states,
   phone width. The part that makes it look like one product.
5. **The two orphans** — kids' slots and the audit log, if you want them.
6. **Retiring `AdminNav`** — once nothing renders it.

Stage 1 is the risky one and comes first on purpose: it is the stage where a
screen can silently stop being reachable, and it is much easier to spot that
while everything still looks the same.
