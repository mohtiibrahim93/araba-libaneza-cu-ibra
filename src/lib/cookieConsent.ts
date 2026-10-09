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

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

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
}
