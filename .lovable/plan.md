# Publish site and refresh Search Console sitemap

Publish the current build, then update Google Search Console so the new sitemap replaces the old one.

## Steps

1. **Pre-publish check**
   - Confirm the latest build is successful and no critical security findings block publishing.
   - Current scan shows only `warn`-level Supabase findings and no critical issues, so publishing is not blocked.

2. **Publish the site**
   - Call `preview_ui--publish` to deploy the current project.
   - Wait for the deployment to propagate, then confirm the live custom domain `https://centruldearabalibaneza.com/` responds.

3. **Google Search Console property resolution**
   - Use the already-linked "Ibrahim's Google Search Console" connection (`std_01ktxapacjfqwvwn39tagpxndh`).
   - Call `GET /webmasters/v3/sites` through the connector gateway.
   - Select the verified property that covers `https://centruldearabalibaneza.com/`; if multiple match, ask for a choice with no default.

4. **Submit the new sitemap**
   - Submit `https://centruldearabalibaneza.com/sitemap.xml` to the selected property with `PUT /webmasters/v3/sites/{siteUrl}/sitemaps/{sitemapUrl}`.

5. **Remove the old sitemap**
   - List existing sitemaps for the property with `GET /webmasters/v3/sites/{siteUrl}/sitemaps`.
   - Identify the outdated sitemap entry and delete it with `DELETE /webmasters/v3/sites/{siteUrl}/sitemaps/{sitemapUrl}`.
   - If more than one old entry exists, list them and ask which to remove before deleting.

6. **Verify final state**
   - Re-read the property's sitemap list to confirm only the new sitemap remains.
   - Report the live URL, submitted sitemap URL, and removed sitemap URL(s).

## Out of scope

- No code or content changes; only publishing and Search Console sitemap management.
- No Search Console setup or verification; the connection is already linked to the project.
