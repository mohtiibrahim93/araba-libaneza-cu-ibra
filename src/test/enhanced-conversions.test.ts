// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  normalizeEmail,
  normalizePhone,
  trackGenerateLead,
  trackPurchase,
  trackRegistrationSubmit,
} from "@/lib/tracking";

// Enhanced conversions (owner, 4 Nov 2026): user_data only with "Acceptă
// toate", set immediately before the four conversions, never as a parameter.
const calls: unknown[][] = [];
beforeEach(() => {
  calls.length = 0;
  (window as any).gtag = (...a: unknown[]) => calls.push(a);
  localStorage.clear();
});
const user = { email: "  Ana@Example.COM ", phone: "+40 712 345 678" };

describe("user_data", () => {
  it("normalises email and phone, and drops a phone without a country code", () => {
    expect(normalizeEmail(" Ana@Example.COM ")).toBe("ana@example.com");
    expect(normalizePhone("+40 712-345-678")).toBe("+40712345678");
    expect(normalizePhone("0040712345678")).toBe("+40712345678");
    expect(normalizePhone("0712345678")).toBeUndefined();
  });

  it("sends nothing without 'Acceptă toate'", () => {
    localStorage.setItem("cookie_consent", "essential");
    trackRegistrationSubmit("group", user);
    expect(calls.some((c) => c[1] === "user_data")).toBe(false);
  });

  it("is set immediately before registration_submit, and never as a parameter", () => {
    localStorage.setItem("cookie_consent", "all");
    trackRegistrationSubmit("group", user);
    expect(calls[0]).toEqual([
      "set",
      "user_data",
      { email: "ana@example.com", phone_number: "+40712345678" },
    ]);
    expect(calls[1]?.[1]).toBe("registration_submit");
    expect(JSON.stringify(calls[1])).not.toMatch(/example|712345678/i);
  });

  it("generate_lead and purchase get it too, without it in their parameters", () => {
    localStorage.setItem("cookie_consent", "all");
    trackGenerateLead("group", undefined, user);
    trackPurchase({ transactionId: "t", value: 500, currency: "ron", user });
    const events = calls.filter((c) => c[0] === "event");
    expect(events.map((c) => c[1])).toEqual(["generate_lead", "purchase"]);
    expect(calls.filter((c) => c[1] === "user_data")).toHaveLength(2);
    expect(JSON.stringify(events)).not.toMatch(/example|712345678/i);
  });

  it("trial_booking_complete sets it on the page Stripe returns to", () => {
    const page = readFileSync("src/pages/TrialConfirmed.tsx", "utf8");
    expect(page).toContain("setUserData({ email })");
    expect(page.indexOf("setUserData")).toBeLessThan(
      page.indexOf('trackEvent("trial_booking_complete"'),
    );
  });
});
