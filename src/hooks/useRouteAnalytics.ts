import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, hasConsent } from "@/lib/tracking";

/**
 * Fires a GA4 `page_view` and Meta Pixel `PageView` on every SPA route change.
 * Skips the initial mount — the static index.html already fires the first PageView
 * via the inline GA/Pixel snippets, so the first emit happens on the *next* navigation.
 * Respects cookie consent via tracking.ts.
 */
export function useRouteAnalytics() {
  const location = useLocation();
  const firstRun = useRef(true);
  const lastPath = useRef<string>("");

  useEffect(() => {
    const path = location.pathname + location.search;

    if (firstRun.current) {
      firstRun.current = false;
      lastPath.current = path;
      return;
    }

    if (path === lastPath.current) return;
    lastPath.current = path;

    if (!hasConsent()) return;

    const title = typeof document !== "undefined" ? document.title : undefined;
    const url = typeof window !== "undefined" ? window.location.href : undefined;

    // GA4 — standard SPA page_view
    trackEvent("page_view", {
      page_path: path,
      page_title: title,
      page_location: url,
    });

    // Meta Pixel — PageView (trackEvent uses fbq("track", ...))
    trackEvent("PageView");
  }, [location.pathname, location.search]);
}