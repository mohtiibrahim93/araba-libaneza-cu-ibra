import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/lib/tracking";

/**
 * Fires a GA4 `page_view` on every SPA route change. Skips the initial mount —
 * the static index.html already fires the first page_view via the inline GA
 * snippet, so the first emit happens on the *next* navigation. Consent is
 * enforced by the Adopt CMP through Google Consent Mode.
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

    const title = typeof document !== "undefined" ? document.title : undefined;
    const url = typeof window !== "undefined" ? window.location.href : undefined;

    // GA4 — standard SPA page_view
    trackEvent("page_view", {
      page_path: path,
      page_title: title,
      page_location: url,
    });
  }, [location.pathname, location.search]);
}