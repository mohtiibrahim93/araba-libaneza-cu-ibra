import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hasRoute, routeFor } from "./helpers/routes";

/**
 * After a trial's card is saved on Stripe, the visitor lands on a confirmation
 * screen of its own, not a toast on the homepage (owner's request, 27 October
 * 2026): what was booked, when in Bucharest time, online or in person, what
 * happens next, the 24-hour rule and a link to manage the booking. RO and EN.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("trial confirmation screen", () => {
  it("exists in Romanian and English, kept out of search", () => {
    for (const path of ["/proba-confirmata", "/en/trial-confirmed"]) {
      expect(hasRoute(path), path).toBe(true);
      expect(routeFor(path)!.source).toContain('content: "noindex"');
      expect(routeFor(path)!.source).toContain("TrialConfirmed");
    }
  });

  it("is where Stripe sends the visitor back, in their language", () => {
    const fn = read("supabase/functions/create-checkout-session/index.ts");
    expect(fn).toContain('"/en/trial-confirmed"');
    expect(fn).toContain('"/proba-confirmata"');
    expect(fn).toContain(
      "success_url: `${origin}${confirmedPath}?${confirmed}`",
    );
    expect(fn).not.toContain("success_url: `${origin}/?trial_card=saved`");
  });

  it("shows the booking, Bucharest time, the place, the next steps, the 24 h rule and the manage link", () => {
    const page = read("src/pages/TrialConfirmed.tsx");
    expect(page).toContain('const TZ = "Europe/Bucharest";');
    expect(page).toContain("timeZone: TZ");
    expect(page).toContain("Online, pe Zoom");
    expect(page).toContain("Online, on Zoom");
    expect(page).toContain("Fizic: Raduga Creative Center");
    expect(page).toContain("Ce urmează");
    expect(page).toContain("What happens next");
    expect(page).toContain("Regula de 24 de ore");
    expect(page).toContain("The 24-hour rule");
    expect(page).toContain('en ? "/en/my-bookings" : "/rezervari"');
    expect(page).toContain("trial_booking_complete");
  });
});
