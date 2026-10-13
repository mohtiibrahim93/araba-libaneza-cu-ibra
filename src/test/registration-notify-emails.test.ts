import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/**
 * A sign-up always reaches the admin inbox; the student's confirmation waits
 * for a verified email.
 *
 * On 8 Oct notify-registration began requiring a signed-in, verified caller
 * for everything it sends. The registration form submits anonymously, so from
 * then on group, kids and level-check sign-ups produced no email at all: the
 * 11 Oct group registration has no confirmation and no admin alert in
 * email_send_log, where the 30 Sep and 5 Oct ones had both.
 *
 * The admin alert has a fixed recipient, so it needs no ownership proof. The
 * student's copy goes to an address an anonymous visitor typed, so it keeps
 * the verified-email rule (AGENTS.md) and Checkout asks for it once
 * CheckoutEmailGate has verified the address. Source assertions: the function
 * runs on Deno and the failure mode is silence.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const fn = read("supabase/functions/notify-registration/index.ts");
const checkout = read("src/pages/Checkout.tsx");

describe("notify-registration", () => {
  it("does not make the admin alert depend on the caller's identity", () => {
    expect(fn).toContain(
      "const sendAdmin = fresh && !alreadyTried.has(`admin-reg-${reg.id}`);",
    );
    expect(code(fn)).toContain(
      code(
        'if (sendAdmin) await invokeEmail({ templateName: "admin-new-registration"',
      ),
    );
    // The anonymous path must not be refused outright.
    expect(fn).toContain("(!fresh && !verifiedOwner)");
  });

  it("sends the student confirmation only to a verified owner", () => {
    expect(fn).toContain("verifiedRegistrationOwner(req, reg, supabase.auth)");
    expect(fn).toContain(
      "const sendStudent = verifiedOwner && !alreadyTried.has(`reg-${reg.id}`);",
    );
    expect(fn).toContain("if (sendStudent && reg.email) {");
  });

  it("sends each email at most once per registration", () => {
    expect(fn).toContain("idempotencyKey: `reg-${reg.id}`");
    expect(fn).toContain("idempotencyKey: `admin-reg-${reg.id}`");
  });

  it("asks for the student confirmation once checkout has verified the email", () => {
    expect(checkout).toContain("onVerified={onEmailVerified}");
    // Matched with formatting removed (see helpers/sourceText.ts).
    expect(code(checkout)).toMatch(
      /onEmailVerified=useCallback\(\(\)=>\{[\s\S]*?invoke\("notify-registration",\{body:\{registrationId\}\}\)/,
    );
  });
});
