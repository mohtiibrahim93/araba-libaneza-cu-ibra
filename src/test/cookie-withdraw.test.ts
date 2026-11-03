import { describe, expect, it } from "vitest";
import {
  GOOGLE_COOKIE,
  deleteGoogleCookies,
  saveConsent,
} from "@/lib/cookieConsent";

// Audit P1 legal #7: choosing "essential" after "all" left the _ga cookies.
describe("withdrawing cookie consent", () => {
  it("recognises Google's cookies and nothing else", () => {
    for (const n of ["_ga", "_ga_ABC123", "_gid", "_gat_UA1", "_gcl_au"])
      expect(GOOGLE_COOKIE.test(n)).toBe(true);
    for (const n of ["site-language", "sb-access", "ga", "_gax"])
      expect(GOOGLE_COOKIE.test(n)).toBe(false);
  });

  it("deletes them when the visitor chooses essential", () => {
    document.cookie = "_ga=GA1.1.1; path=/";
    document.cookie = "_ga_XYZ=GS1; path=/";
    document.cookie = "keep=1; path=/";
    saveConsent("essential");
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toContain("keep=1");
  });

  it("leaves nothing to do when there are none", () => {
    expect(() => deleteGoogleCookies()).not.toThrow();
  });
});
