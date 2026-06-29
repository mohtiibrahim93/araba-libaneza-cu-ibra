## Goal
Make `/cursuri` look like the screenshot (the same tabbed Adulți/Copii cards from the homepage `ProgramsSection`), turn the navbar **Cursuri** dropdown into a single plain link, and ensure every course sub-page has a clear back button to `/cursuri`.

## Changes

### 1. `/cursuri` page (`src/pages/courses/Cursuri.tsx`)
Replace the current hero + audience grid + program grid with a layout that mirrors the homepage:
- Keep Navbar, breadcrumb, Helmet/SEO, Footer, WhatsApp, ScrollToTop, CookieConsent.
- Short heading block (`t.cursuriH1` + `t.cursuriIntro`).
- Render `<ProgramsSection />` (already exports the exact Cursuri Adulți / Cursuri Copii tabbed UI). It already includes the quiz link, level pills, dual pricing, CTAs — identical to the screenshot.
- Drop the audience cards (Adulți / Tineri / Copii) and the secondary 3-program grid — they are redundant with the tabbed cards.

### 2. Navbar (`src/components/Navbar.tsx`)
Replace the `DropdownMenu` "Cursuri" trigger with a plain `<Link to="/cursuri">{t.navCourses}</Link>`. Remove the `courseLinks` array, `DropdownMenu*` imports, and the `ChevronDown` next to it (keep ChevronDown for the language switcher).
- Mobile menu: replace the courses sub-list with a single `<Link to="/cursuri">` row. Remove the "See all programs" anchor row.

### 3. Back button on every course sub-page
A back link to `/cursuri` already exists on `CursGrupLevel.tsx`. Add the same compact back link (`← {t.levelPageBackToGrup}` or a new `t.courseBackToCursuri`) at the top of `main` on:
- `CursGrup.tsx`
- `CursPrivate.tsx`
- `CursCopii.tsx`
- `CursAdulti.tsx`
- `CursTineri.tsx`
- `CursOnline.tsx`

Use a small inline element styled like the existing one on `CursGrupLevel.tsx` (ArrowLeft icon + label, muted color, hover primary), placed right under the Navbar / above the breadcrumb or hero. Reuse i18n key `levelPageBackToGrup` (already "← Înapoi la cursuri" / equivalent EN) so no new strings are needed.

### 4. Cleanup
- Remove now-unused i18n usages on `/cursuri` (`cursuriPickAudience`, `cursuriPickProgram`, `trackViewLink`, `trackInPrepBadge`) only from the page imports — keep the strings in `i18n.tsx` untouched to avoid touching other files (cheap, low-risk).
- Keep audience routes (`/cursuri/adulti`, `/cursuri/tineri`) accessible by URL; they're just no longer surfaced from the navbar.

## Out of scope
No changes to homepage, ProgramsSection internals, pricing logic, forms, or curriculum data.
