## Problem

On `/cursuri/grup/a1` (reached from the homepage "A1" tile), the URL has no `?mod=` param, so `posterFilter` is `null` and both posters render side by side. The filter I added only kicks in when the user arrives from `/cursuri` with `?mod=fizic` or `?mod=online`.

## Fix

Add a small **Fizic / Online** toggle on the level page so exactly one poster (and one cohort) is shown at a time, no matter how the user landed there.

### Behaviour

- Default selection:
  - If the URL has `?mod=fizic` or `?mod=online` → use it.
  - Else → default to `fizic` for A1 (both posters exist) and to whatever single format the level has for A2 (`fizic`).
- The toggle updates the `mod` query param (so the choice is shareable and the poster filter already in place keeps working).
- The poster grid becomes a single-column display since only one poster is shown at a time.
- The registration form's default format follows the toggle (pass `defaultFormat={selected}` to `RegistrationFormSection`, matching the prop it already accepts for the `lockSelection` flow — verify the prop name when implementing).

### File to edit

- `src/pages/courses/CursGrupLevel.tsx` only.
  - Compute `selectedFormat` from `mod` param with the default above.
  - Render a two-button pill toggle (Fizic / Online) above the poster block, disabled for formats that have no poster at this level (e.g. A2 online hides the Online button, or shows it as "în curând").
  - Change the poster grid from `sm:grid-cols-2` to a single centered image.
  - Pass the selected format down to the registration form.

No other files, no build, no data changes.
