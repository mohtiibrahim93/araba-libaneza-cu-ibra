# Finish the migration: game rename, full verification, sitemap handover

## 1. The game becomes "Jocul Yalla" at /joc

- Rename the page address from `/joaca` to `/joc`, and keep `/joaca` working with a permanent forward so old links and search results are not lost.
- Change the visible wording everywhere the game is named: "Joacă și învață" becomes "Jocul Yalla", the button becomes "Joacă Yalla", English becomes "The Yalla game" / "Play". Same on the free-resources card, the menu and the footer.
- Add the game to the free-resources page (Resurse gratuite) as its own item in the "Resurse gratuite direct pe site" list, named Yalla, next to the level test.
- Update the sitemap, the language pairing map and the page-info file so the new address is listed and the old one is not.

No design, no course copy, no prices touched.

## 2. Can the game replace the level test?

Short answer, so you can decide later: partly.

- Feasible: the game already tracks which expressions you get right and which need review, so after roughly 20-30 prompts it can print a rough starting level (A1 vs A2 vs B1) and link to the matching course.
- Not feasible today as a full replacement: the game only tests recognising and recalling vocabulary. The current test also asks about your goal (family, work, travel), your available time and your reading of the Arabic alphabet — none of that comes out of gameplay, and those answers are what the course recommendation is built on.
- Recommended shape if you want it: keep the 30-second test as the recommender, and add a "check your level in the game" entry that starts a fixed 25-prompt run and ends with a suggested level plus a link to the test. That is a separate piece of work; this plan does not build it.

## 3. /arabizi-pentru-incepatori

Why it is not-found today: it was one of nine old addresses that were replaced by better ones. During the migration its forward was dropped together with the old build script, so the address now falls through to the not-found page. It is not in the sitemap and nothing on the site links to it, so no visitor path is broken — but an old external link or an old search result would land on nothing.

Fix: restore it as a permanent forward to `/arabizi`, and cover it with a test so it cannot silently disappear again.

## 4. Verification with nothing skipped

- Build the site first, then run the whole suite. The two tests you saw skipped are the ones that read the built output; they only skip on a fresh checkout with no build present. After building they run, so the report reads 309 passed / 0 skipped.
- Re-run the address sweep over every page and every old forwarding address, checking that each page loads, carries its own title, description, social preview, canonical and language links, and that every internal link resolves.
- Check the pages that talk to the outside world, and report each one's state plainly:
  - Payments: the checkout, payment-status and group-subscription paths, including that they still reach the payment provider and the right product.
  - Google Calendar: read access, plus what still needs one click from you (the "Test complet" sync in Admin - Programari) because only you can authorise a live write.
  - Email sending, enrolment notifications, the level test, the download forms and the admin dashboard.
- Report anything that cannot be verified without your action, instead of claiming it works.

## 5. Sitemap handover

Only after the above is green: confirm the new sitemap is complete and correct so you can remove the old one and submit the new one. I will list the exact file and address to submit.

## Technical notes

- New route file `src/routes/joc.tsx` carrying the existing `Joaca` page; `src/routes/joaca.tsx` reduced to a permanent redirect; new `src/routes/arabizi-pentru-incepatori.tsx` redirect to `/arabizi`.
- Updates to `src/lib/seoHead.ts` (STATIC_ROUTES), `src/lib/languageRoutes.ts`, `src/lib/pageMeta.ts`, `src/lib/siteNav.ts`, `public/sitemap.xml`, `src/components/ResourcesTeaser.tsx`, `src/components/Footer.tsx`, `src/pages/seo/Resurse.tsx`, `src/pages/Joaca.tsx`.
- Redirect tests added to `src/test/retired-duplicates.test.ts` (or the redirect helper already in `src/test/helpers/routes.ts`).
- `npm run build` then `npx vitest run` then `npx tsgo --noEmit`; `scripts/seoPrerender.ts` and `scripts/prerenderBody.tsx` stay untouched — they are unused and safe for you to delete from CloudCode.
