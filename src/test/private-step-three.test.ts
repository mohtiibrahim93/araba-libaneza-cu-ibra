import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A three-step flow that reaches step three.
 *
 * Private lessons are sold as "your details, the day and time, then payment",
 * and the heading above the scheduler said "Pasul 2 din 3 — alege ziua și ora"
 * the whole way through, payment screen included. You paid under a heading
 * telling you to pick a time, and the third step never appeared anywhere.
 *
 * The scheduler owns the screen and the form above owns the heading, so the
 * scheduler now says which screen it is on.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const scheduler = read("src/components/NativeScheduler.tsx");
const form = read("src/components/RegistrationFormSection.tsx");

describe("the scheduler", () => {
  it("reports which screen it is showing", () => {
    expect(scheduler).toContain("onPhaseChange");
    expect(scheduler).toContain('onPhaseChange?.(payPhase ? "pay" : "pick")');
  });

  it("derives that from the same condition that renders the card screen", () => {
    // If these two drift, the heading and the screen disagree, which is the
    // bug this file is about — in the other direction.
    expect(scheduler).toContain(
      'const payPhase = Boolean(selectedSlot) && mode === "create" && Boolean(purchase);',
    );
    expect(scheduler).toContain('if (selectedSlot && mode === "create" && purchase) {');
  });
});

describe("the private heading", () => {
  it("advances to step 3 on the payment screen", () => {
    expect(form).toContain("privatePayPhase");
    expect(form).toContain("onPhaseChange={setPrivatePayPhase}");
    expect(form).toContain('"Pasul 3 din 3"');
    expect(form).toContain('"Step 3 of 3"');
    // And still has a step 2 to come back to.
    expect(form).toContain('"Pasul 2 din 3"');
  });

  it("resets when the visitor goes back to change their details", () => {
    // Otherwise returning to the times would still be headed "step 3".
    const back = form.slice(form.indexOf("setPrivatePay(null);"));
    expect(back.slice(0, 120)).toContain('setPrivatePayPhase("pick")');
  });

  it("says the payment happens here rather than somewhere else", () => {
    // The embedded card form is the thing the owner liked about this flow;
    // the heading should not imply a hand-off to another page.
    expect(form).toContain("nu te trimitem pe altă pagină");
    expect(form).toContain("we don't send you anywhere else");
  });
});
