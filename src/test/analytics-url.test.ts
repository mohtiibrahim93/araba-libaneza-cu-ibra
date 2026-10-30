import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAFE_URL_INLINE_JS, safeAnalyticsUrl } from "@/lib/analyticsUrl";
import { trackEvent } from "@/lib/tracking";

// Audit P0-3: Google Analytics must not receive emails, names or tokens.

const CASES: Array<[string, string]> = [
  [
    "https://centruldearabalibaneza.com/checkout?courseType=group&registrationId=abc&email=a%40b.ro&name=Ana",
    "https://centruldearabalibaneza.com/checkout",
  ],
  [
    "https://centruldearabalibaneza.com/rezervari?token=secret123",
    "https://centruldearabalibaneza.com/rezervari",
  ],
  [
    "https://centruldearabalibaneza.com/payment-status?registration_id=r&sig=s&email=a%40b.ro",
    "https://centruldearabalibaneza.com/payment-status",
  ],
  [
    "https://centruldearabalibaneza.com/booking/manage/tok_abc?done=1",
    "https://centruldearabalibaneza.com/booking/manage/:id",
  ],
  [
    "https://centruldearabalibaneza.com/private-status/0b5c-uuid#x",
    "https://centruldearabalibaneza.com/private-status/:id",
  ],
  ["/booking/manage/tok_abc", "/booking/manage/:id"],
  ["/checkout?email=a%40b.ro", "/checkout"],
  // Campaign attribution and blog pagination survive.
  [
    "https://centruldearabalibaneza.com/?utm_source=google&gclid=X1&email=a%40b.ro",
    "https://centruldearabalibaneza.com/?utm_source=google&gclid=X1",
  ],
  ["/blog?page=2", "/blog?page=2"],
  // Ordinary pages are unchanged.
  ["/cursuri/grup/a1", "/cursuri/grup/a1"],
  ["/booking", "/booking"],
  ["", ""],
];

describe("safeAnalyticsUrl", () => {
  it.each(CASES)("%s", (input, expected) => {
    expect(safeAnalyticsUrl(input)).toBe(expected);
  });

  it("the inline bootstrap copy gives the same answers", () => {
    const w: { __gaSafeUrl?: (u: string) => string } = {};
    new Function("window", SAFE_URL_INLINE_JS)(w);
    for (const [input, expected] of CASES) {
      expect(w.__gaSafeUrl!(input)).toBe(expected);
    }
  });

  it("the bootstrap sets the cleaned location before gtag config", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    const boot = root.slice(
      root.indexOf("const gtagBootstrap"),
      root.indexOf("const organizationJsonLd"),
    );
    const inline = boot.indexOf("${SAFE_URL_INLINE_JS}");
    const set = boot.indexOf("page_location: window.__gaSafeUrl(location.href)");
    const cfg = boot.indexOf("gtag('config'");
    expect(inline).toBeGreaterThan(-1);
    expect(set).toBeGreaterThan(inline);
    expect(cfg).toBeGreaterThan(set);
  });
});

describe("trackEvent", () => {
  let gtag: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;
  });
  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("cleans every URL-valued parameter and leaves the rest alone", () => {
    trackEvent("cta_click", {
      link_url: "https://centruldearabalibaneza.com/checkout?email=a%40b.ro&name=Ana",
      cta_target: "/booking/manage/tok_abc",
      page_path: "/rezervari?token=secret",
      page_location: "https://centruldearabalibaneza.com/payment-status?sig=s",
      link_text: "Plătește",
    });
    expect(gtag).toHaveBeenCalledWith("event", "cta_click", {
      link_url: "https://centruldearabalibaneza.com/checkout",
      cta_target: "/booking/manage/:id",
      page_path: "/rezervari",
      page_location: "https://centruldearabalibaneza.com/payment-status",
      link_text: "Plătește",
    });
  });

  it("sends nothing while the address bar holds a token in its path", () => {
    // Google Ads' tag would report the real address bar (`top`) with it.
    window.history.pushState({}, "", "/booking/manage/tok_abc");
    try {
      trackEvent("page_view", { page_path: "/booking/manage/tok_abc" });
      expect(gtag).not.toHaveBeenCalled();
    } finally {
      window.history.pushState({}, "", "/");
    }
  });

  it("the bootstrap refuses to load Google's script on a token path", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    const loader = root.slice(root.indexOf("window.__loadGtag = function"));
    const guard = loader.indexOf(
      "if (window.__gaSafeUrl(location.pathname) !== location.pathname) return;",
    );
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(loader.indexOf("document.createElement"));
  });
});
