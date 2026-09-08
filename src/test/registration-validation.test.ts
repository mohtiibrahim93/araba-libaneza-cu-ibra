import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Every validation failure has to be visible on the field, and countable.
 *
 * Submit ran seven sequential checks and only two of them marked the offending
 * field — the rest fired a toast and returned. On a phone, a toast naming a
 * field that is scrolled off screen is close to no error at all: you press
 * submit, something flashes, nothing you can see changes, and you leave. That
 * is a plausible share of the registrations that start and never finish.
 *
 * The funnel numbers had the same problem from the other side: GA4's automatic
 * `form_start` counts interaction with any form on the site, while `Lead` counts
 * only a completed course registration, so comparing them measured nothing.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");
const form = read("src/components/RegistrationFormSection.tsx");
const tracking = read("src/lib/tracking.ts");

describe("registration validation", () => {
  const FIELDS = ["course_type", "format", "level", "center", "gdpr", "phone", "email"] as const;

  it("routes every check through fail(), not a bare toast", () => {
    for (const field of FIELDS) {
      // fail( may wrap onto the next line when the message is long.
      const call = new RegExp(`fail\\(\\s*"${field}"`);
      expect(form, `${field} does not call fail()`).toMatch(call);
    }
  });

  it("leaves no validation branch that only toasts and returns", () => {
    // A `toast.error(...)` immediately followed by `return;` inside the submit
    // handler is the old shape. fail() does the toast itself.
    const submit = form.slice(form.indexOf("const handleSubmit"));
    const bare = submit.match(/toast\.error\([^)]*\);\s*\n\s*return;/g) ?? [];
    expect(bare, bare.join("\n")).toEqual([]);
  });

  it("reveals errors on fields the visitor never blurred", () => {
    expect(form).toContain("submitAttempted");
    expect(form).toContain("showErrors={submitAttempted}");
    const lead = read("src/components/RegistrationForm/LeadFields.tsx");
    expect(lead).toContain("showErrors");
    expect(lead).toMatch(/phoneTouched \|\| showErrors/);
  });

  it("marks the field visually and moves focus to it", () => {
    expect(form).toContain("border-destructive");
    expect(form).toContain("scrollIntoView");
    expect(form).toContain("aria-invalid");
    // The two components that own their own fields take an error prop. Assert
    // the wiring, not the exact expression: GdprCheckbox takes `string |
    // undefined`, so the value passed is the message, not the boolean.
    expect(form).toMatch(/error=\{invalidField === "gdpr"/);
    expect(form).toMatch(/levelError=\{invalidField === "level"/);
    expect(read("src/components/RegistrationForm/GroupFields.tsx")).toContain("levelError");
  });

  it("reports which field failed, so drop-off can be read not guessed", () => {
    expect(tracking).toContain("registration_validation_failed");
    expect(tracking).toContain("field,");
    for (const e of [
      "registration_start",
      "registration_step",
      "registration_submit",
      "registration_validation_failed",
    ]) {
      expect(tracking, `${e} missing`).toContain(e);
    }
  });

  it("fires registration_start once, not on every keystroke", () => {
    expect(form).toContain("startedRef");
    expect(form).toMatch(/if \(startedRef\.current\) return;/);
  });
});

/**
 * GA4 event names are case-sensitive, and that one letter cost every
 * conversion number on the property.
 *
 * The GA4 property has three key events configured — close_convert_lead,
 * qualify_lead and purchase. The site fires none of them: the first two are
 * Google's default lead-gen suggestions that no code path emits, and the third
 * is spelled `Purchase` here (the Meta Pixel convention) on three pages. So the
 * key event never matched an event, and every channel reported 0 conversions
 * while leads were in fact arriving.
 *
 * `Lead` was already mirrored to `generate_lead` for the same reason. This
 * asserts `Purchase` is mirrored too, and that the mirror keeps GA4's spelling.
 */
describe("GA4 event names match what the property counts", () => {
  const tracking = readFileSync(
    resolve(process.cwd(), "src/lib/tracking.ts"),
    "utf8",
  );

  it("mirrors Lead to GA4's generate_lead", () => {
    expect(tracking).toContain('eventName === "Lead"');
    expect(tracking).toContain('"generate_lead"');
  });

  it("mirrors Purchase to GA4's lowercase purchase", () => {
    expect(tracking).toContain('eventName === "Purchase"');
    expect(tracking).toMatch(/gtag\("event", "purchase"/);
  });

  it("keeps the two spellings distinct rather than renaming one", () => {
    // The capitalised names stay for Meta Pixel and reporting continuity; the
    // lowercase ones exist so GA4's reserved events and key events fire.
    for (const name of ['"Lead"', '"Purchase"', '"generate_lead"', '"purchase"']) {
      expect(tracking, `${name} missing`).toContain(name);
    }
  });
});
