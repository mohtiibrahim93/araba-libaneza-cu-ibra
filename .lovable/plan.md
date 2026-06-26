## Problem
Google Analytics reports "No data received" because:
1. `index.html` sets `gtag('consent', 'default', { analytics_storage: 'denied' })` on load.
2. `src/lib/tracking.ts` `initTracking()` has an inverted `!gaId` guard, so the `gtag('consent', 'update', { analytics_storage: 'granted' })` call is unreachable.
3. `CookieConsent.tsx` only calls `initTracking()` on the Accept button click, but never on mount for returning visitors who already have `cookie_consent=accepted` in localStorage.

## Fix
1. Remove the incorrect `!gaId &&` condition in `initTracking()` so the consent update always fires when `window.gtag` exists.
2. In `CookieConsent.tsx`, add a `useEffect` that calls `initTracking()` on mount if `localStorage.getItem(COOKIE_KEY) === "accepted"`.
3. Add `gtag('event', 'page_view')` inside `initTracking()` after consent is granted, to force-send the first hit for SPA navigations.

## Technical details
- File: `src/lib/tracking.ts` — change `if (!gaId && typeof window !== "undefined")` to `if (typeof window !== "undefined")`.
- File: `src/components/CookieConsent.tsx` — add mount-time `initTracking()` call when consent already exists.
- No new dependencies or UI changes.

## Validation
- Publish the site.
- Use GA4 DebugView or the browser Network tab (filter "collect") to confirm a `page_view` event fires immediately after the page loads.
