## Goal
Update the hero badge/pill text to communicate that the school offers all combinations: 1:1 / group and online / in-person.

## Changes
1. **i18n string update** — Edit `src/lib/i18n.tsx`:
   - `heroPill` (RO): `"Toate formatele: 1:1, grup, online, fizic"`
   - `heroPill` (EN): `"All formats: 1:1, group, online, in-person"`

No component or layout changes needed. The existing badge styling stays the same.

## Verification
- Reload homepage and confirm the pill text renders correctly in both Romanian and English.
- Ensure the badge does not wrap awkwardly on mobile (it’s a short phrase, should fit).