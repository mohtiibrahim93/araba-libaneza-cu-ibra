import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { levelCheckTimeAllowed, physicalTrialAllowed } from "../../supabase/functions/_shared/schedule-rules";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * The free level check with Ibra (October 2026): up to 30 minutes, on Zoom or
 * at the center, booked three ways from /verificare-nivel and linked from the
 * homepage, the booking page, the FAQ, the footer and the level test page.
 */
describe("level check with Ibra", () => {
  it("can be stored: the form type and the event type exist", () => {
    const mig = read("supabase/migrations/20261006120000_level_check.sql");
    expect(mig).toContain("'level_check'::text");
    expect(mig).toContain("('verificare-nivel', 'Verificare de nivel cu Ibra'");
  });

  it("offers all three ways: calendar, call back, WhatsApp", () => {
    const page = read("src/pages/VerificareNivel.tsx");
    expect(page).toContain('<NativeScheduler eventType="verificare-nivel"');
    expect(page).toContain('form_type: "level_check"');
    expect(page).toContain("WHATSAPP_CONTACT_URL}?text=");
  });

  it("is offered weekdays 12:00–13:00 only, at the center on any of those days", () => {
    // Bucharest is UTC+3 in September: 09:00Z = 12:00 local.
    const wedNoon = "2026-09-09T09:00:00.000Z";
    const wedHalfPast = "2026-09-09T09:30:00.000Z";
    const wedLate = "2026-09-09T09:45:00.000Z"; // would end 13:15
    const wedEvening = "2026-09-09T16:00:00.000Z";
    const satNoon = "2026-09-05T09:00:00.000Z";
    expect(levelCheckTimeAllowed(wedNoon, 30)).toBe(true);
    expect(levelCheckTimeAllowed(wedHalfPast, 30)).toBe(true);
    expect(levelCheckTimeAllowed(wedLate, 30)).toBe(false);
    expect(levelCheckTimeAllowed(wedEvening, 30)).toBe(false);
    expect(levelCheckTimeAllowed(satNoon, 30)).toBe(false);
    // No weekend-only rule for an in-person level check.
    expect(physicalTrialAllowed("verificare-nivel", "physical", wedNoon)).toBe(true);
  });

  it("is linked from everywhere the owner asked", () => {
    for (const f of [
      "src/components/ProgramsSection.tsx",
      "src/components/booking/BookingLanding.tsx",
      "src/components/Footer.tsx",
      "src/pages/TestDeNivel.tsx",
    ]) {
      expect(read(f), f).toContain("/verificare-nivel");
    }
    expect(read("src/data/faq.ts")).toContain("verificarea de nivel cu Ibra");
  });
});
