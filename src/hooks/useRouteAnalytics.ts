import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/router-compat";
import { trackEvent } from "@/lib/tracking";
import { safeAnalyticsUrl } from "@/lib/analyticsUrl";
import { readConsent } from "@/lib/cookieConsent";

/**
 * Fires a GA4 `page_view` on every SPA route change. Skips the initial mount —
 * the static index.html already fires the first page_view via the inline GA
 * snippet, so the first emit happens on the *next* navigation. Consent is
 * enforced by CookieConsentBanner through Google Consent Mode.
 *
 * URLs reach Google only through safeAnalyticsUrl (no emails, names, tokens).
 */
export function useRouteAnalytics() {
  const location = useLocation();
  const firstRun = useRef(true);
  const lastPath = useRef<string>("");
  const lastLocation = useRef<string>("");

  useEffect(() => {
    const path = location.pathname + location.search;

    if (firstRun.current) {
      firstRun.current = false;
      lastPath.current = path;
      lastLocation.current =
        typeof window !== "undefined" ? window.location.href : "";
      return;
    }

    if (path === lastPath.current) return;
    lastPath.current = path;

    // The bootstrap does not load Google's script on a page whose path holds
    // a token (see __loadGtag in __root.tsx); load it on the first page that
    // doesn't. __loadGtag ignores repeat calls and refuses a token path itself.
    if (readConsent() === "all") {
      (window as { __loadGtag?: () => void }).__loadGtag?.();
    }

    const title = typeof document !== "undefined" ? document.title : undefined;
    const url =
      typeof window !== "undefined" ? window.location.href : undefined;

    const referrer = lastLocation.current;
    lastLocation.current = url ?? "";

    // Later automatic events (scroll, clicks, forms) read these too, so the
    // cleaned values are set, not only passed with this page_view.
    const gtag = typeof window !== "undefined" ? (window as any).gtag : undefined;
    if (typeof gtag === "function") {
      gtag("set", {
        page_location: safeAnalyticsUrl(url),
        page_referrer: safeAnalyticsUrl(referrer),
      });
    }

    // GA4 — standard SPA page_view (trackEvent cleans the URL parameters)
    trackEvent("page_view", {
      page_path: path,
      page_title: title,
      page_location: url,
      page_referrer: referrer,
    });
  }, [location.pathname, location.search]);
}
