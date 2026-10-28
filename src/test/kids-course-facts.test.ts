import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASK_SYSTEM_PROMPT } from "@/lib/askKnowledge.server";
import { translations } from "@/lib/i18n";

/**
 * The kids course, as the owner states it (27 October 2026): groups of up to
 * 6 children, 60-minute lessons, up to 8 lessons a month, and NOT open yet —
 * "notify me" only. Every place that describes it has to agree.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("kids course facts", () => {
  it("the chat assistant knows all four", () => {
    expect(ASK_SYSTEM_PROMPT).toContain("NU este încă deschis");
    expect(ASK_SYSTEM_PROMPT).toContain("maximum 6 copii");
    expect(ASK_SYSTEM_PROMPT).toContain("60 de minute");
    expect(ASK_SYSTEM_PROMPT).toContain("maximum 8 lecții pe lună");
    expect(ASK_SYSTEM_PROMPT).not.toContain(
      "grup de minimum 4 copii, sau privat",
    );
  });

  it("the site copy says 60 minutes and at most 6 children, in both languages", () => {
    for (const lang of ["ro", "en"] as const) {
      const t = translations[lang];
      expect(t.kidsGroupDuration).toMatch(/^60 /);
      expect(t.compareKidsStudents).toBe("max. 6");
      expect(t.copiiFormatGroupTitle).toMatch(/6/);
      expect(t.copiiFormatGroupTitle).not.toMatch(/8/);
      expect(t.compareKidsBestFor).toMatch(/6–11/);
    }
  });

  it("picking the kids course on the sign-up form offers 'notify me', not a sign-up", () => {
    const form = read("src/components/RegistrationFormSection.tsx");
    expect(form).toContain("!kidsCourseClosed(courseType)");
    expect(form).toMatch(
      /courseType === "kids" && \(\s*<div[\s\S]{0,1200}<NotifyMeForm/,
    );
  });

  it("the Terms describe the kids course the same way in RO and EN", () => {
    const terms = read("src/pages/Terms.tsx");
    expect(terms).toContain("Cursurile pentru copii nu sunt încă deschise");
    expect(terms).toContain("Kids' courses are not open yet");
    // The English version used to say online while the Romanian said in person.
    expect(terms).not.toContain("when they run, are online");
  });
});
