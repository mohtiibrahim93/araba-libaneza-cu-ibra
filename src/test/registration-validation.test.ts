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
 * GA4 conversions fire once, from a confirmation, never from a click.
 *
 * Three faults, all live:
 *   - `Lead` and `Purchase` (Meta Pixel spellings) were each mirrored inside
 *     trackEvent to their GA4 name, so one action sent two events and the
 *     mirror was invisible at the call site.
 *   - ThankYou fired Purchase on mount, before the session was fetched: simply
 *     opening or reloading the page recorded a sale that may never have
 *     completed.
 *   - Index fired it again off the ?payment=success URL parameter, which is a
 *     URL anyone can type, so every real sale was also counted twice.
 */
describe("GA4 conversions", () => {
  const tracking = readFileSync(resolve(process.cwd(), "src/lib/tracking.ts"), "utf8");
  const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");

  it("fires the GA4 names directly, with no mirroring", () => {
    expect(tracking).not.toMatch(/eventName === "Lead"/);
    expect(tracking).not.toMatch(/eventName === "Purchase"/);
    expect(tracking).toContain("trackGenerateLead");
    expect(tracking).toContain("trackPurchase");
  });

  it("has retired the Meta Pixel spellings from every call site", () => {
    for (const f of [
      "src/components/RegistrationFormSection.tsx",
      "src/components/NotifyMeForm.tsx",
      "src/pages/Trial.tsx",
      "src/pages/Index.tsx",
      "src/pages/ThankYou.tsx",
      "src/pages/PaymentStatus.tsx",
    ]) {
      const src = read(f);
      expect(src, `${f} still sends "Lead"`).not.toMatch(/trackEvent\(\s*"Lead"/);
      expect(src, `${f} still sends "Purchase"`).not.toMatch(/trackEvent\(\s*"Purchase"/);
    }
  });

  it("sends purchase as a real ecommerce event", () => {
    for (const k of ["transaction_id", "value", "currency", "items"]) {
      expect(tracking, `purchase is missing ${k}`).toContain(k);
    }
  });

  it("never fires purchase from a URL parameter or on mount", () => {
    // Index handles the ?payment=success redirect; it must not report a sale.
    expect(read("src/pages/Index.tsx")).not.toContain("trackPurchase");
    // ThankYou must read Stripe's status before sending anything.
    const ty = read("src/pages/ThankYou.tsx");
    expect(ty).toContain('data.paymentStatus === "paid"');
    expect(ty).toContain("purchaseSent");
  });

  it("guards both purchase call sites against a second send", () => {
    expect(read("src/pages/ThankYou.tsx")).toContain("purchaseSent.current");
    expect(read("src/pages/PaymentStatus.tsx")).toContain("!trackedRef");
  });

  it("cannot send the two key events nothing implements", () => {
    // close_convert_lead and qualify_lead are GA4 defaults the site never
    // fired; no code path may introduce them.
    const all = ["src/lib/tracking.ts", "src/pages/ThankYou.tsx", "src/pages/PaymentStatus.tsx",
                 "src/pages/Index.tsx", "src/components/NotifyMeForm.tsx"].map(read).join("\n");
    expect(all).not.toContain("close_convert_lead");
    expect(all).not.toContain("qualify_lead");
  });

  it("keeps booking and payment as separate events", () => {
    // A trial can be booked without paying, so the two must never be merged.
    expect(tracking).toContain("trial_booking_complete");
    expect(tracking).toContain("paid_booking_complete");
  });
});

