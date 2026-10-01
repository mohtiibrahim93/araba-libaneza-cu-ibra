# Remove the Google verification tag from the site

Delete the Google site-verification tag from the site's source, commit that single deletion for you to carry onto `main`, then publish so the live site stops serving the tag.

The domain stays verified in Google Search Console through the DNS record already on `centruldearabalibaneza.com` (a different token), so removing the tag does not lock anyone out of Search Console.

## Steps

1. Delete the one line carrying the tag from the shared page head.
2. Run the test suite and the type check to confirm nothing depended on it.
3. Commit the deletion on its own, as a single-line commit, so you can cherry-pick just that commit onto `main`.
4. Publish the site, then check the live pages over HTTPS to confirm the tag is really gone and nothing else in the head changed.

## Technical details

- The tag lives in exactly one place in the whole repository: `src/routes/__root.tsx` line 156,
  `{ name: "google-site-verification", content: "O4lPkW4s-d2rF0NNhpyeNU-6yhLxvox4c73Hz2lcoKU" }`.
  It is present on `main` (at `3e04db47`) in the identical form. Nothing else in the project —
  no other page, no offline game file, no prerender script, no test — mentions that token, so
  deleting the line removes the tag everywhere it is served.
- No test asserts the tag's presence, so the existing suite should stay green. The check after
  the edit is `npx vitest run` (currently 625 tests) plus the frontend type check.
- The commit is one line, touching only `src/routes/__root.tsx`. It is committed on this Lovable
  branch and not pushed to `main` — carrying it onto `main` stays your step, as usual.
- Publishing rebuilds the site, which is what actually stops the live pages from serving the tag;
  the source deletion alone would not change what visitors receive until the next publish.
- After publishing, verification is a plain fetch of `https://centruldearabalibaneza.com/` and of
  the English page, grepping the returned head for the token. The expected result is no match,
  with the neighbouring tags (the consent-tool id, title, description, social preview tags)
  unchanged.
- Not touched: the DNS record on the domain, the robots.txt file, the IndexNow key file, the
  prerender scripts, the edge functions, and every other line of the page head.
