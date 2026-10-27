import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const terms = readFileSync(resolve(process.cwd(), "src/pages/Terms.tsx"), "utf8");

describe("Terms: company details (owner's text, 27 October 2026)", () => {
  it("states them exactly in Romanian", () => {
    for (const line of [
      "Firma: E-SERVICES TODAY S.R.L.",
      "Sediu social: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
      "CUI: 52051074",
      "Nr. de ordine în registrul comerțului: J2025046577002",
      "EUID: ROONRC.J2025046577002",
    ])
      expect(terms).toContain(`"${line}"`);
  });

  it("translates only the labels in English, keeping the Romanian address", () => {
    for (const line of [
      "Company: E-SERVICES TODAY S.R.L.",
      "Registered office: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
      "Tax ID (CUI): 52051074",
      "Trade Register No.: J2025046577002",
      "EUID: ROONRC.J2025046577002",
    ])
      expect(terms).toContain(`"${line}"`);
  });
});

describe("Terms: monthly group refunds", () => {
  it("carries the worked example the calculation is tested against", () => {
    // src/test/group-refund.test.ts asserts the same numbers.
    for (const figure of ["500 lei/lun", "8 lec", "337,50 lei", "450 lei"])
      expect(terms).toContain(figure);
    for (const figure of ["500 lei/month", "8 lessons", "337.50 lei", "450 lei"])
      expect(terms).toContain(figure);
  });

  it("says cancelling stops every future charge, in both languages", () => {
    expect(terms).toContain("anularea oprește întotdeauna toate plățile lunare viitoare");
    expect(terms).toContain("cancelling always stops all future monthly charges");
  });
});

describe("Terms: the trial no-show fee", () => {
  it("says it is charged and may be refunded on appeal", () => {
    expect(terms).toContain("se încasează de pe card 150 lei");
    expect(terms).toContain("Taxa poate fi rambursată dacă o contești");
    expect(terms).toContain("150 lei is charged to the card");
    expect(terms).toContain("The fee may be refunded if you appeal it");
  });
});
