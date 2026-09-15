# Verification report + two small fixes + blog covers decision

## Part 1 — Verification results (already done, read-only)

Everything checked below passes:

| Check | Result |
|---|---|
| All 99 pages in the sitemap | load correctly, each with its own title, description and canonical address |
| All 12 old addresses | forward permanently to the right new page |
| `/arabizi-pentru-incepatori` | correctly not-found (as you asked) |
| 109 internal links | all work except one (see fix 1) |
| Test suite | 24 files, 312 tests, all pass |
| Latest build | successful |
| Stripe | live, 4 active products: group course, private lesson, kids course, free trial |
| Google Calendar | connected, 4 calendars readable |
| Booking availability | responds correctly |
| Calendar feed | correctly refuses an invalid token |
| Checkout, sign-in, admin, trial, booking pages | all load |

**Your question — is the game in the free resources?** Yes. "Jocul Yalla" is listed
on the free resources page and in the site menu, in both Romanian and English, and
`/joc` is in the sitemap.

## Part 2 — Two small fixes to make

1. **Three blog articles link to a retired address.**
   `Cât costă cursurile`, `Limbile vorbite în Liban` and `Lebanese Arabic learning
   resources` link to `/cursuri-araba`, which now forwards to
   `/cursuri-limba-araba`. Point them straight at the new address so readers and
   Google skip the extra hop. Text stays exactly as it is — only the link target
   changes.

2. **The game is missing from the AI-assistant page list.**
   `public/llms.txt` lists 60+ pages for AI assistants but not `/joc`. Add one line
   for it under "Ghiduri și resurse", matching the existing format.

Then re-run the full test suite and confirm the build is clean.

## Part 3 — The 19 blog cover images: needs your decision

The brief says the code already expects the images and that only the files need
producing. **That is not the case in this project.** I checked:

- there is no `public/blog/` folder
- there is no `BlogCover.tsx` component
- `blogPosts.ts` has no cover-image field
- every article currently uses the one site-wide social image

So if I only generate 19 image files, nothing would change on the site — no card
image, no article hero, no per-article link preview. The wiring has to be written
too, but the brief explicitly forbids touching those files.

Two options:

- **A — images plus wiring.** I generate the 19 images and write the wiring
  (cover on the blog card, hero on the article, per-article link preview). This
  means editing `blogPosts.ts`, `BlogIndex.tsx` and `BlogArticleLayout.tsx`,
  which the brief rules out — so I need you to lift that limit.
- **B — images only.** I generate the 19 files at the exact paths. They sit unused
  until the wiring is written in Claude Code.

Tell me A or B and I will do it. Parts 1 and 2 do not depend on this.

## Technical notes

- Fix 1: change `href="/cursuri-araba"` to `/cursuri-limba-araba` in
  `CatCostaCursurile.tsx`, `LimbileVorbiteInLiban.tsx`,
  `LebaneseArabicLearningResources.tsx`. The retired route, its redirect, and the
  tests that guard it stay untouched.
- Fix 2: `public/llms.txt` only. `scripts/seoPrerender.ts`, `robots.txt`,
  `sitemap.xml` and `supabase/functions/**` are not touched.
- Live card payment and a real calendar write still need your own action
  (Admin → Programări → "Test complet"); they cannot be triggered from here.
