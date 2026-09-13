# Align `/joaca` with the site

## Changes
- Match the established `/blog` page header spacing, typography, and content width.
- Reframe the self-hosted game as an integrated full-width page section, with responsive height and lighter desktop/mobile framing.
- Align the explanatory content and calls to action with the site’s normal section rhythm and controls.
- Preserve all game behavior, copy facts, metadata, routes, links, and files under `public/yalla/`.

## Validation
- Compare `/joaca`, `/cursuri/grup`, and `/blog` at 390px and desktop using screenshots.
- Run `npx vitest run` and `npm run build`.
- Edit only `src/pages/Joaca.tsx` and `src/components/YallaGame.tsx`; do not publish.

## Technical details
- Keep the same-origin iframe and deferred mounting behavior.
- Replace the fixed inline iframe sizing with responsive utility classes and stable viewport-aware dimensions.
- Use existing semantic tokens, typography utilities, and layout spacing already used by the site.
