import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { physicalTrialAllowed } from "../../supabase/functions/_shared/schedule-rules";

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

  it("follows the in-person weekend rule like the trial", () => {
    const wed = "2026-09-09T16:00:00.000Z";
    const sat = "2026-09-05T09:00:00.000Z";
    expect(physicalTrialAllowed("verificare-nivel", "physical", wed)).toBe(false);
    expect(physicalTrialAllowed("verificare-nivel", "physical", sat)).toBe(true);
    expect(physicalTrialAllowed("verificare-nivel", "online", wed)).toBe(true);
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
