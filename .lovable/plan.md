## Objective

Replace the three cohort poster images used on `/cursuri/grup/a1` and `/cursuri/grup/a2` with new versions the user is uploading one at a time.

## Files to replace (same filenames, no code changes)

1. `src/assets/poster-a1-online.webp` ← first upload (already provided)
2. `src/assets/poster-a1-fizic.webp` ← next upload
3. `src/assets/poster-a2-fizic.webp` ← final upload

## Steps

1. Wait for all three uploads before touching the repo.
2. For each uploaded PNG: convert/copy to the matching `.webp` path above, overwriting the existing file. Keep filenames identical so `CursGrupLevel.tsx` imports keep working with no code edits.
3. No changes to `CursGrupLevel.tsx`, alt text, routes, or the `?mod=` filter logic — the existing wiring already shows the right poster per mode.

## Not touched

- No code, no routes, no build, no publish.
- No new assets, no renames.

## Verification

- Visual check that the three files on disk are the new artwork.
- User previews `/cursuri/grup/a1?mod=online`, `?mod=fizic`, and `/cursuri/grup/a2` to confirm.
