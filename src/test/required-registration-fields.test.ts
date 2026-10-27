import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/**
 * Owner's rule, 27 October 2026: no registration without name, email, phone,
 * course type and format — on every form, marked with *, and refused by the
 * database as well.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("required registration fields", () => {
  it("the database refuses a course registration without email or format", () => {
    const sql = read(
      "supabase/migrations/20261027121000_required_registration_fields.sql",
    );
    expect(sql).toContain('create policy "Anyone can submit a registration"');
    expect(sql).toContain(
      "form_type not in ('group', 'private', 'kids', 'trial')",
    );
    expect(sql).toContain("email is not null");
    expect(sql).toContain("format is not null");
    expect(sql).toContain("length(btrim(name)) >= 1");
    // Everything the previous policy enforced is still there.
    const previous = read(
      "supabase/migrations/20260902120000_rls_allow_incomplete_lead.sql",
    );
    const checks = previous
      .slice(previous.indexOf("with check ("))
      .split("\n")
      .map((l) => l.trim().replace(/^and /, ""))
      .filter((l) => l && !/^[()]+;?$/.test(l) && !l.startsWith("with check"));
    for (const line of checks) expect(sql).toContain(line);
  });

  it("the group/private/kids form requires a name and an email for everyone", () => {
    const form = code(read("src/components/RegistrationFormSection.tsx"));
    expect(form).toContain(code("if (!name.trim()) {"));
    expect(form).toContain(
      code("if (!email.trim() || !isValidEmail(email)) {"),
    );
    // The old private-only email rule is gone: it applies to every course now.
    expect(form).not.toContain(
      code('if (courseType === "private" && !email) {'),
    );
  });

  it("marks name, phone, email, course type and format with *", () => {
    const lead = read("src/components/RegistrationForm/LeadFields.tsx");
    expect(lead).toMatch(/t\.labelName\} \*/);
    expect(lead).toContain("{t.labelPhone} *");
    expect(lead).toContain("{t.labelEmail} *");
    const form = read("src/components/RegistrationFormSection.tsx");
    expect(form).toContain("{t.mainLeadCourseTypeLabel} *");
    expect(form).toContain("{t.labelFormat} *");
    const trial = read("src/components/NativeScheduler.tsx");
    for (const label of [
      "labelName",
      "labelEmail",
      "labelPhone",
      "labelFormat",
    ])
      expect(trial).toContain(`{t.${label}} *`);
  });

  it("the trial registration is written with its format", () => {
    const hook = read("src/hooks/useTrialRegistration.ts");
    expect(hook).toContain('format: d.format ?? "online"');
    const trial = read("src/components/NativeScheduler.tsx");
    expect(trial).toContain(
      'format: format === "physical" ? "fizic" : "online"',
    );
  });
});
