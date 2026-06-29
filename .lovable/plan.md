## Two fixes

### 1. Make the "Două formate" cards clickable (CursCopii)

File: `src/pages/courses/CursCopii.tsx` (lines 47–64).

Currently the two cards ("Privat 1:1" and "Grup (minim 4 copii)") are plain `<div>`s. Convert them to `<Link>`s matching the same hover style already used on `/cursuri/adulti` and `/cursuri/tineri` (border-primary/50 + shadow-md on hover, "Vezi pagina completă →" affordance):

- Privat 1:1 card → `<Link to="/cursuri/private">`
- Grup card → `<Link to="/cursuri/grup">`

Add a small primary-colored "Vezi pagina completă →" line at the bottom of each card for visual consistency with the Adulti/Tineri cards. No content/copy changes, no style overhaul.

I'll also grep the rest of the site for similar info cards that look clickable but aren't (e.g. any `rounded-2xl border bg-card` block whose title references another existing route) and convert those too. Known candidates to verify: kids program card on the homepage, audience cards on `/cursuri`, format blocks on `CursPrivate`/`CursOnline`. Only ones with an obvious target route get linked.

### 2. Remove the duplicate "back" navigation

Right now most course sub-pages show two back-affordances stacked on top of each other:

- A `← Înapoi la cursuri` arrow link (rendered by `CourseLayout`, lines 107–118).
- A `Acasă > Cursuri > …` breadcrumb directly below it (same file, lines 119–146), where "Cursuri" is also a back link.

Same issue on `/cursuri/grup/:level` (`CursGrupLevel.tsx` lines 68–86): breadcrumb + a separate "Înapoi la cursuri" link above the H1.

Fix: keep the breadcrumb (it carries SEO value via the JSON-LD `BreadcrumbList`) and remove the standalone `← Înapoi` arrow link in both places. The breadcrumb's "Cursuri" link already provides one-click back navigation, and on `CursGrupLevel` the breadcrumb already includes "Cursuri de grup" as a back step.

No other changes to navbar, layout, or styling.

### Out of scope

You mentioned "you still have missing things" without naming them — I'll ask in chat once these two land so I don't guess wrong.