# Remove /arabizi-pentru-incepatori completely

The /arabizi page already exists and covers the topic, so the old address
should return not-found again rather than forward anywhere.

## Changes

1. **Delete the redirect route** `src/routes/arabizi-pentru-incepatori.tsx`
   (created earlier today; it 301-forwards to /arabizi).
2. **Update the check** in `src/test/retired-duplicates.test.ts`: the
   "redirects to /arabizi" test goes back to the original "is not a route"
   test, and the sitemap check stays (the address was never in the sitemap).
3. **Re-run the suite** (`npx vitest run`) and the type check to confirm
   green, and verify `/arabizi-pentru-incepatori` serves the 404 page while
   `/arabizi` keeps working unchanged.

Nothing else changes — no SEO copy, no other redirects, no sitemap edits.

## Out of scope

- The remaining plan items (outside-world verification of Stripe / Google
  Calendar / email, sitemap handover confirmation) stay as previously
  reported and verified — already done in the previous turn.
