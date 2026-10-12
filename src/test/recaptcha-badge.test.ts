import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The badge is hidden, and the words that allow that are shown.
 *
 * reCAPTCHA v3's badge is fixed to the bottom-right corner at a z-index of
 * two billion. That is the corner the WhatsApp and phone buttons live in, so
 * it floated on top of the one control the site most wants tapped.
 *
 * Google's terms permit hiding it only if the sentence "This site is
 * protected by reCAPTCHA and the Google Privacy Policy and Terms of Service
 * apply", with both links, is visible in the user flow instead. The two are
 * one decision, not two, and the pair is easy to half-undo later: delete the
 * footer line and the site is in breach while still looking fine. So this
 * file asserts both halves together.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const css = read("src/styles.css");
const notice = read("src/components/RecaptchaNotice.tsx");
const i18n = read("src/lib/i18n.tsx");

describe("the badge", () => {
  it("is hidden on every route, not only the admin", () => {
    expect(css).toMatch(/^\.grecaptcha-badge \{/m);
    expect(css).not.toContain("data-admin-chrome");
  });

  it("is hidden rather than removed from the layout", () => {
    // The badge is an iframe the API talks to; display:none has been reported
    // to break the v2 challenge fallback. Hidden cannot be seen or clicked,
    // which is all that was wrong with it.
    const rule = css.slice(css.indexOf("\n.grecaptcha-badge {"));
    expect(rule.slice(0, 80)).toContain("visibility: hidden");
    expect(rule.slice(0, 80)).not.toContain("display: none");
  });
});

describe("the rest of that corner", () => {
  it("keeps the consent banner off the WhatsApp buttons", () => {
    // Same corner, same mistake: the banner sits at z-60 over a stack pinned
    // at bottom-6 right-6, so it covered both buttons until dismissed. The
    // offset starts at md, which is where `hidden md:flex` puts them.
    const banner = read("src/components/CookieConsentBanner.tsx");
    expect(banner).toContain("md:bottom-32");
    expect(read("src/components/WhatsAppButton.tsx")).toContain("hidden flex-col items-end gap-2 md:flex");
  });
});

describe("the disclosure that pays for it", () => {
  it("carries Google's wording and both links", () => {
    expect(notice).toContain("t.recaptchaNotice");
    expect(notice).toContain("https://policies.google.com/privacy");
    expect(notice).toContain("https://policies.google.com/terms");
  });

  it("says it in both languages", () => {
    for (const key of ["recaptchaNotice", "recaptchaPrivacyShort", "recaptchaTermsShort"]) {
      expect(i18n.split(`${key}:`).length - 1, `${key} needs RO and EN`).toBe(2);
    }
    // The required sentence, verbatim, in English.
    expect(i18n).toContain(
      "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
    );
  });

  it("is in the footer, so it is present wherever the script is", () => {
    const footer = read("src/components/Footer.tsx");
    expect(footer).toContain("RecaptchaNotice");
  });

  it("is also beside the form where reCAPTCHA actually runs", () => {
    const gdpr = read("src/components/GdprCheckbox.tsx");
    expect(gdpr).toContain("RecaptchaNotice");
    // The old markup built the sentence by splitting on the word "Google" and
    // appending English labels, so the Romanian read "...și Termenii Google
    // Privacy Policy / Terms of Service."
    expect(gdpr).not.toContain('split("Google")');
  });
});
