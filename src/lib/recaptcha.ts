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

export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.grecaptcha) return null;
  return new Promise((resolve) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token || null);
      } catch {
        resolve(null);
      }
    });
  });
}