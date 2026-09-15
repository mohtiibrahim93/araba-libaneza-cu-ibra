import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The language a student is taught in is not the language they read the site in.
 *
 * These were the same value until an English-taught cohort existed: the picker
 * passed the UI language straight into the query, so a Romanian reader could not
 * see an English class without switching the whole site over, and an English
 * reader was never shown Romanian classes even when those were the only ones
 * running. The two are now separate — the visitor chooses.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const picker = read("src/components/RegistrationForm/CohortPicker.tsx");
const form = read("src/components/RegistrationFormSection.tsx");

describe("teaching language is chosen, not inherited", () => {
  it("does not filter the query by the UI language", () => {
    // Passing `lang` here is the bug this replaced. Fetching every language is
    // also what lets the picker know whether there is a choice worth offering.
    expect(picker).not.toMatch(/useGroupCohorts\([^)]*format \?\? null,\s*lang\s*\)/s);
    expect(picker).toMatch(/useGroupCohorts\(\s*formType,\s*level \?\? null,\s*format \?\? null,\s*null,\s*\)/s);
  });

  it("filters the rendered list by the chosen teaching language", () => {
    expect(picker).toContain("c.teaching_language === teachingLanguage");
  });

  it("offers the choice only when more than one language has classes", () => {
    // A selector with one option is a dead control.
    expect(picker).toContain("languagesAvailable.length > 1");
  });

  it("defaults to the reading language when classes exist in it", () => {
    expect(picker).toMatch(/languagesAvailable\.includes\(lang\)/);
  });

  it("clears a selected cohort when the language changes under it", () => {
    // Otherwise a student could submit a Romanian cohort while the form shows
    // English selected.
    expect(picker).toContain("const switchLanguage");
    expect(picker).toMatch(/onSelect\(null\)/);
  });

  it("records the language of the class actually chosen", () => {
    // Not `lang` — someone reading Romanian can pick the English group, and the
    // registration has to say so.
    expect(form).toContain("teaching_language: cohortLanguage ?? lang");
    expect(form).toContain("setCohortLanguage(c?.teaching_language ?? null)");
  });

  it("keeps the reading language on its own column", () => {
    // Both are recorded. Collapsing them would lose the ability to tell "reads
    // English" from "wants to be taught in English".
    expect(form).toContain("language: lang,");
  });
});
