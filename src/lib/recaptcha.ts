/**
 * Google reCAPTCHA v3 helpers. Site key is public.
 */
export const RECAPTCHA_SITE_KEY = "6Le9mPssAAAAAOEV4BSPnuBGmJDDQiPtQgOwkzjc";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

async function waitForGrecaptcha(timeoutMs = 4000): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.grecaptcha?.execute) return true;
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (window.grecaptcha?.execute) return resolve(true);
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });
}

export async function getRecaptchaToken(action: string): Promise<string | null> {
  const ready = await waitForGrecaptcha();
  if (!ready) {
    console.warn("[recaptcha] grecaptcha not available — skipping verification");
    return null;
  }
  return new Promise((resolve) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token || null);
      } catch (e) {
        console.warn("[recaptcha] execute failed", e);
        resolve(null);
      }
    });
  });
}