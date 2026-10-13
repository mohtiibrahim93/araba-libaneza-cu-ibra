import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Every public payment call has the email-code step in front of it.
 *
 * The four payment functions accept only a caller whose Auth-confirmed email
 * matches the registration (AGENTS.md). PR #48 moved create-payment-intent onto
 * that rule and deployed it on 12 October, but the private-lesson card form in
 * NativeScheduler and the kids deposit in RegistrationFormSection still called
 * payment straight away. A visitor without a session got 404 / 403 and could
 * not pay at all.
 *
 * The fix is on the client, never on the server: the gate stays, and every
 * page that calls a gated function first shows CheckoutEmailGate (or the
 * trial's own code screen). This file fails if a new caller skips it.
 */
const GATED = [
  "create-checkout",
  "create-checkout-session",
  "create-payment-intent",
  "create-subscription",
];
const root = resolve(process.cwd(), "src");
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory())
      return name === "test" ? [] : sources(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const callers = sources(root).filter((file) => {
  const src = readFileSync(file, "utf8");
  return GATED.some(
    (fn) => src.includes(`invoke("${fn}"`) || src.includes(`"${fn}",`),
  );
});

describe("payment callers", () => {
  it("are the three known pages", () => {
    const rel = callers.map((f) => f.slice(process.cwd().length + 1)).sort();
    expect(rel).toEqual([
      "src/components/NativeScheduler.tsx",
      "src/components/RegistrationFormSection.tsx",
      "src/pages/Checkout.tsx",
    ]);
  });

  it("each render the email-code step", () => {
    for (const file of callers) {
      expect(readFileSync(file, "utf8"), file).toContain("<CheckoutEmailGate");
    }
  });
});

describe("private lesson purchase (NativeScheduler)", () => {
  const scheduler = read("src/components/NativeScheduler.tsx");
  const purchase = scheduler.slice(
    scheduler.indexOf('if (selectedSlot && mode === "create" && purchase)'),
  );

  it("shows the gate before the card form or the pay button", () => {
    const gate = purchase.indexOf("<CheckoutEmailGate");
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(purchase.indexOf("<Elements"));
    expect(gate).toBeLessThan(purchase.indexOf("onClick={handlePay}"));
  });

  it("verifies the purchase email, not a different one", () => {
    expect(purchase).toContain("email={purchase.email}");
    expect(purchase).toContain("purchaseVerifiedEmail !== purchase.email");
  });
});

describe("kids deposit (RegistrationFormSection)", () => {
  const form = read("src/components/RegistrationFormSection.tsx");

  it("no longer redirects to Stripe straight after submit", () => {
    const submit = form.slice(
      form.indexOf('if (courseType === "kids" && payDeposit) {'),
    );
    const block = submit.slice(0, submit.indexOf("}"));
    expect(block).toContain("setDepositNeedsVerify(true)");
    expect(block).not.toContain("attemptKidsDepositCheckout");
  });

  it("starts the deposit checkout only from the gate's onVerified", () => {
    const gate = form.slice(form.indexOf("<CheckoutEmailGate"));
    const onVerified = gate.slice(
      gate.indexOf("onVerified"),
      gate.indexOf("/>"),
    );
    expect(onVerified).toContain("attemptKidsDepositCheckout");
    expect(onVerified).toContain("submittedData.email");
  });
});

describe("the server gate", () => {
  it("is unchanged in all four payment functions", () => {
    for (const fn of GATED) {
      expect(read(`supabase/functions/${fn}/index.ts`), fn).toContain(
        "verifiedRegistrationOwner",
      );
    }
  });
});
