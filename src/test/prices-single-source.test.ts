import { describe, expect, it } from "vitest";
import { translations } from "@/lib/i18n";
import { PRICE } from "@/lib/pricing";
import { isOpenLevel } from "@/lib/openLevels";

// Audit P2: prices typed into ~30 strings drifted. They now come from
// pricing.ts; today's values must read exactly as before.
describe("prices in the copy come from pricing.ts", () => {
  it("today's values", () => {
    expect(PRICE).toMatchObject({
      groupFromOnline: 500,
      groupFromFizic: 700,
      groupToOnline: 1000,
      privateOnline: 150,
      privateFizic: 210,
      kidsMonthly: 500,
      noShowFee: 150,
    });
  });

  it("render as they did", () => {
    expect(translations.ro.comparePrivatePrice).toBe(
      "150 LEI online · 210 LEI fizic / ședință",
    );
    expect(translations.ro.compareGroupPrice).toBe("500–1.000 LEI / lună");
    expect(translations.en.compareGroupPrice).toBe("500–1,000 LEI / month");
    expect(translations.en.heroTrustStudents).toBe("from 500 LEI/month");
  });

  it("open levels have one definition", () => {
    expect(isOpenLevel("a1")).toBe(true);
    expect(isOpenLevel("A2")).toBe(true);
    expect(isOpenLevel("B1")).toBe(false);
  });
});
