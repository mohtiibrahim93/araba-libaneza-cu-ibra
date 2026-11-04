/**
 * Meta (Facebook) Pixel, loaded only after the visitor accepts all cookies in
 * the cookie banner ("Acceptă toate" covers analytics and advertising).
 * "Doar esențiale" never loads it, and choosing it later revokes consent and
 * deletes Meta's cookies.
 *
 * Events, each sent where the GA4 equivalent is sent (src/lib/tracking.ts):
 *   PageView              first page after consent, then every SPA navigation
 *   CompleteRegistration  next to generate_lead
 *   Purchase              next to purchase, with the amount in RON
 *
 * Like the Google tag, nothing is sent on a page whose address holds a token
 * or record id (audit P0-3), and the URL the Pixel reports is the cleaned one.
 */
import { safeAnalyticsUrl } from "@/lib/analyticsUrl";

export const META_PIXEL_ID = "1844467906969399";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

type MetaWindow = Window & {
  fbq?: Fbq;
  _fbq?: Fbq;
  __metaPixelLoaded?: boolean;
};

function consentAll(): boolean {
  try {
    return window.localStorage.getItem("cookie_consent") === "all";
  } catch {
    return false;
  }
}

function pathIsSafe(): boolean {
  const path = window.location.pathname;
  return safeAnalyticsUrl(path) === path;
}

/** Load the Pixel and count this page. Safe to call more than once. */
export function loadMetaPixel() {
  if (typeof window === "undefined") return;
  const w = window as MetaWindow;
  if (!consentAll() || !pathIsSafe()) return;
  if (w.__metaPixelLoaded) {
    w.fbq?.("consent", "grant");
    return;
  }
  w.__metaPixelLoaded = true;

  // Meta's standard bootstrap: a queue that the real script drains on load.
  if (!w.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    w.fbq = fbq;
    w._fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  w.fbq!("consent", "grant");
  w.fbq!("init", META_PIXEL_ID);
  w.fbq!("track", "PageView");
}

export function isMetaPixelLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as MetaWindow).__metaPixelLoaded)
  );
}

/** Send a standard event, only with consent and on a page without a token. */
export function trackMeta(
  event: "PageView" | "CompleteRegistration" | "Purchase",
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  const w = window as MetaWindow;
  if (!w.__metaPixelLoaded || typeof w.fbq !== "function") return;
  if (!consentAll() || !pathIsSafe()) return;
  if (eventId) w.fbq("track", event, params ?? {}, { eventID: eventId });
  else w.fbq("track", event, params ?? {});
}

/** Meta's cookies: _fbp (browser id) and _fbc (ad click id). */
export const META_COOKIE = /^(_fbp|_fbc)$/;

/** "Doar esențiale" after "Acceptă toate": stop sending and drop the cookies. */
export function revokeMetaPixel(doc: Document = document) {
  const w = window as MetaWindow;
  w.fbq?.("consent", "revoke");
  const names = doc.cookie
    .split(";")
    .map((c) => c.split("=")[0]?.trim() ?? "")
    .filter((n) => META_COOKIE.test(n));
  if (names.length === 0) return;
  const parts = doc.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) {
    const d = parts.slice(i).join(".");
    domains.push(d, `.${d}`);
  }
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  for (const name of names)
    for (const domain of domains)
      doc.cookie = `${name}=; ${expired}; path=/${domain ? `; domain=${domain}` : ""}`;
}
