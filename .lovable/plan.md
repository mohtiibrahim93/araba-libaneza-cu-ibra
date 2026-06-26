## Finding
The live site is still serving an older build:
- Published HTML contains `G-XXXXXXXXXX`, not `G-F167Y815JL`.
- The ConsentManager script is also missing from the published HTML.
- The source code shown in this project already contains the correct GA4 ID, so this is most likely a publish/deploy mismatch, not a code bug.

## Plan
1. **Do not change unrelated website code.**
2. **Confirm the current `index.html` has exactly one Google tag** using `G-F167Y815JL` and the ConsentManager script in `<head>`.
3. **Publish the latest project version** so the custom domain serves the updated `index.html` instead of the old placeholder build.
4. **Re-test the live domain** after publish:
   - `G-F167Y815JL` appears in page source.
   - `https://www.googletagmanager.com/gtag/js?id=G-F167Y815JL` loads.
   - Google’s “Test your website” detects the tag.
5. **If still not detected after publish**, adjust consent behavior so the Google tag loader is not blocked from being detected while still respecting consent for analytics storage/events.