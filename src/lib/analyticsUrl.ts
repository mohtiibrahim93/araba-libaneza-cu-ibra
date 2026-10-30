// What Google Analytics may see of a URL (audit P0-3, October 2026).
//
// Several of our URLs carry personal data or secrets: /checkout?email=&name=,
// /rezervari?token=, /payment-status?sig=, /booking/manage/<token>,
// /private-status/<registration id>. GA's terms forbid sending personal data,
// and a token in GA is a working link in someone else's reports.
//
// Rule: the query string is dropped except for campaign attribution (utm_*,
// Google Ads click ids) and blog pagination; path segments that are tokens or
// record ids are replaced by a placeholder. The hash is dropped.
//
// The inline gtag bootstrap in __root.tsx runs before any bundle loads, so it
// carries a plain-JS copy of this function (SAFE_URL_INLINE_JS below).
// src/test/analytics-url.test.ts runs both on the same cases.

const KEPT_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "page",
]);

const SECRET_SEGMENT =
  /^(\/(?:en\/)?(?:booking\/manage|private-status|admin\/private-leads))\/[^/?#]+/;

/**
 * Accepts an absolute URL ("https://…/x?y") or a path ("/x?y") and returns the
 * same shape with personal data removed. Unparseable input yields "".
 */
export function safeAnalyticsUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  const isPath = raw.startsWith("/");
  let url: URL;
  try {
    url = new URL(raw, "https://x.invalid");
  } catch {
    return "";
  }
  const path = url.pathname.replace(SECRET_SEGMENT, "$1/:id");
  const kept = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (KEPT_PARAMS.has(key)) kept.append(key, value);
  });
  const query = kept.toString();
  const rest = path + (query ? `?${query}` : "");
  return isPath ? rest : url.origin + rest;
}

/** Event parameters that hold a URL or path; trackEvent cleans these. */
export const URL_PARAMS = [
  "page_location",
  "page_referrer",
  "page_path",
  "link_url",
  "cta_target",
] as const;

// Plain-JS twin of safeAnalyticsUrl for the inline bootstrap. Defines
// window.__gaSafeUrl. Keep the two in step; the test compares them.
export const SAFE_URL_INLINE_JS = `
window.__gaSafeUrl = function (raw) {
  if (!raw) return "";
  var isPath = raw.charAt(0) === "/";
  var url;
  try { url = new URL(raw, "https://x.invalid"); } catch (e) { return ""; }
  var keep = ${JSON.stringify([...KEPT_PARAMS])};
  var path = url.pathname.replace(${SECRET_SEGMENT.toString()}, "$1/:id");
  var kept = new URLSearchParams();
  url.searchParams.forEach(function (value, key) {
    if (keep.indexOf(key) !== -1) kept.append(key, value);
  });
  var query = kept.toString();
  var rest = path + (query ? "?" + query : "");
  return isPath ? rest : url.origin + rest;
};
`;
