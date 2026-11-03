/**
 * Cookie consent (October 2026), replacing the Adopt CMP whose trial expired:
 * without its banner Google Consent Mode v2 stayed "denied" for everyone.
 *
 * The choice lives in localStorage under `cookie_consent`:
 *  - "all"       → analytics + ads granted (gtag consent update)
 *  - "essential" → everything optional stays denied
 *  - missing     → the banner asks.
 *
 * The gtag bootstrap in __root.tsx sets the denied defaults and, before
 * `config`, re-grants a stored "all" so the first page view already counts.
 */
export const CONSENT_KEY = "cookie_consent";
/** Fired by "Setări cookies" in the footer to reopen the banner. */
export const OPEN_CONSENT_EVENT = "cookie-consent:open";

export type ConsentChoice = "all" | "essential";

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  __loadGtag?: () => void;
};

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

function updateGoogleConsent(state: "granted" | "denied") {
  const w = window as GtagWindow;
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }
}

/** Store the visitor's choice and tell Google Consent Mode. */
export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked (private mode): the choice still applies to this page.
  }
  // "essential" after an earlier "all" (reopened from the footer) withdraws it.
  updateGoogleConsent(choice === "all" ? "granted" : "denied");
  // Withdrawing consent also removes what Analytics and Ads already stored
  // (audit P1 legal #7: the _ga cookies stayed after "essential").
  if (choice === "essential") deleteGoogleCookies();
  // Google's script is fetched only now, on "all" (see the bootstrap in
  // __root.tsx). "essential" never loads it.
  if (choice === "all") (window as GtagWindow).__loadGtag?.();
}

/** Analytics and Ads cookies: _ga, _ga_<id>, _gid, _gat*, _gcl_* (Ads). */
export const GOOGLE_COOKIE = /^(_ga(_.+)?|_gid|_gat(_.+)?|_gcl_.+)$/;

/**
 * Delete Google's cookies on every domain form they can be set on: the host
 * itself, ".host", and each parent domain (gtag sets them on the top
 * domain, e.g. ".centruldearabalibaneza.com").
 */
export function deleteGoogleCookies(doc: Document = document) {
  const names = doc.cookie
    .split(";")
    .map((c) => c.split("=")[0]?.trim() ?? "")
    .filter((n) => GOOGLE_COOKIE.test(n));
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
