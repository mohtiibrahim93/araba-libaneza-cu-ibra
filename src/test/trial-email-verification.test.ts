import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The free trial, bookable by a first-time visitor again.
 *
 * `create-checkout-session` and `booking-create` both require an
 * Auth-confirmed email matching the registration — the rule in AGENTS.md,
 * added on 7 October. A first-time visitor has no account, so the card step
 * answered 403 and the public could not finish a free trial at all. The last
 * trial that completed did so on 7 October, before the gate went live; the
 * owner's own attempt two days later worked only because he happened to be
 * signed in as himself.
 *
 * The gate is right and stays. What was missing is the step that lets an
 * honest visitor pass it: a six-digit code to the address they just typed.
 * No account to create, no password, and no second form — the slot and the
 * details stay in the scheduler's own state while they read their email.
 *
 * This file guards the shape of that, and above all guards the thing it would
 * be tempting to do instead: weaken the gate.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const scheduler = read("src/components/NativeScheduler.tsx");
const checkout = read("supabase/functions/create-checkout-session/index.ts");
const booking = read("supabase/functions/booking-create/index.ts");

describe("the ownership gate", () => {
  it("is still enforced by both functions", () => {
    // If this ever fails, the trial was "fixed" by opening the hole instead.
    for (const [name, src] of [
      ["create-checkout-session", checkout],
      ["booking-create", booking],
    ] as const) {
      expect(src, `${name} must still verify the registration's owner`).toContain(
        "verifiedRegistrationOwner",
      );
      expect(src).toContain("Sign in with your verified registration email to continue");
    }
  });

  it("still exempts only the trusted webhook path", () => {
    // booking-create's exemption is the service-role call from stripe-webhook,
    // and nothing else. AGENTS.md says "preserve only the existing trusted
    // webhook booking path".
    expect(booking).toContain("const internalCall = serviceRoleKey.length > 0 && bearer === serviceRoleKey");
    expect(booking).toContain("if (!internalCall && (!reg || !(await verifiedRegistrationOwner(");
  });
});

describe("the confirmation step", () => {
  it("asks for a code before the card step, not after", () => {
    const branch = scheduler.slice(
      scheduler.indexOf('if (eventType === "trial" && mode === "create" && resolvedRegistrationId) {'),
    );
    const head = branch.slice(0, 900);
    expect(head).toContain("await alreadyVerified(addr)");
    expect(head).toContain("setVerifyFor(");
    // The card step is reached only past that check.
    expect(head.indexOf("alreadyVerified")).toBeLessThan(head.indexOf("startTrialCardStep"));
  });

  it("skips the screen when Auth already holds a confirmed session", () => {
    // Otherwise the owner, and anyone returning inside their session, is asked
    // to confirm an address that is already confirmed.
    expect(scheduler).toContain("user?.email_confirmed_at");
    expect(scheduler).toContain("user.email?.trim().toLowerCase() === addr");
  });

  it("verifies the code on the server", () => {
    // Not a comparison in the browser: the code is checked by Auth, which is
    // also what makes the session the two edge functions will accept.
    expect(scheduler).toContain("supabase.auth.verifyOtp(");
    expect(scheduler).toContain('type: "email"');
    expect(scheduler).not.toMatch(/code\s*===\s*expected/);
  });

  it("sends the code through Auth, so its own rate limits apply", () => {
    expect(scheduler).toContain("supabase.auth.signInWithOtp(");
    expect(scheduler).toContain("shouldCreateUser: true");
  });

  it("allows a resend, behind a cooldown", () => {
    expect(scheduler).toContain("setResendIn(60)");
    expect(scheduler).toContain("disabled={resendIn > 0 || submitting}");
  });

  it("continues to the card step with the same slot, asking for nothing again", () => {
    // The screen is a branch of the same component, so the slot, name, phone,
    // notes and format are still in state. If this ever became a route, the
    // visitor would land back on an empty form.
    expect(scheduler).toContain("await startTrialCardStep(verifyFor.registrationId, selectedSlot ?? \"\")");
    expect(scheduler).toContain("if (verifyFor) {");
    const screen = scheduler.slice(scheduler.indexOf("if (verifyFor) {"), scheduler.indexOf("if (loading) {"));
    expect(screen).not.toContain("navigate(");
    expect(screen).not.toContain("window.location.href");
    // And it shows the slot, so nothing looks lost.
    expect(screen).toContain("fmtFullLocal(selectedSlot, lang)");
  });

  it("is a numeric field a phone can autofill", () => {
    const screen = scheduler.slice(scheduler.indexOf("if (verifyFor) {"), scheduler.indexOf("if (loading) {"));
    expect(screen).toContain('autoComplete="one-time-code"');
    expect(screen).toContain('inputMode="numeric"');
    expect(screen).toContain("maxLength={CODE_MAX_DIGITS}");
  });

  it("accepts the code length Supabase is actually set to send", () => {
    // This is the bug a real end-to-end run caught and no unit test could:
    // the screen hardcoded six digits, the project sends eight, so the
    // visitor could type only the first six and then not submit them. The
    // length is a Supabase dashboard setting, so the range is what belongs
    // in the code -- the server decides whether the code is right.
    expect(scheduler).toContain("const CODE_MIN_DIGITS = 6;");
    expect(scheduler).toContain("const CODE_MAX_DIGITS = 10;");
    expect(scheduler).toContain("code.length < CODE_MIN_DIGITS");
    expect(scheduler).not.toContain("code.length !== 6");
    // And the copy must not promise a count the setting can change.
    expect(scheduler).not.toContain("șase cifre");
    expect(scheduler).not.toContain("six-digit code to");
  });

  it("says plainly that no account is being created", () => {
    expect(scheduler).toContain("Fără cont și fără parolă");
    expect(scheduler).toContain("No account, no password");
  });
});

describe("the email", () => {
  const template = read("src/lib/email-templates/magic-link.tsx");
  const hook = read("src/routes/lovable/email/auth/webhook.ts");

  it("carries the code in the signup template, which is the one a visitor gets", () => {
    // Supabase calls a first-time visitor's confirmation a *signup*, not a
    // magic link. Putting the code only where it looks like it belongs would
    // have covered everyone except the people this change is for.
    const signup = read("src/lib/email-templates/signup.tsx");
    expect(signup).toContain("token?: string | undefined");
    expect(signup).toContain("<Text style={codeStyle}>{token}</Text>");
    const hookSignup = hook.slice(hook.indexOf("signup: {"), hook.indexOf("invite: {"));
    expect(hookSignup).toContain("token: data.token ?? undefined");
  });

  it("carries it in the magic-link template too, for a returning address", () => {
    expect(template).toContain("token?: string | undefined");
    expect(template).toContain("<Text style={codeStyle}>{token}</Text>");
    const hookMagic = hook.slice(hook.indexOf("magiclink: {"), hook.indexOf("recovery: {"));
    expect(hookMagic).toContain("token: data.token ?? undefined");
  });

  it("is rendered the same by both auth hooks, whichever one Supabase calls", () => {
    // There are two implementations: the site route and the auth-email-hook
    // edge function, each with its own copy of the templates. Only one is
    // configured in Supabase, and nothing in the repo says which -- so both
    // have to carry the code, and both have to say the same thing in the
    // subject, which is what someone waiting for a code scans for.
    const edgeHook = read("supabase/functions/auth-email-hook/index.ts");
    expect(edgeHook).toContain("token: payload.data.token");
    for (const subject of ["'Your confirmation code'", "'Your login code'"]) {
      expect(hook, `site route subject ${subject}`).toContain(subject);
      expect(edgeHook, `edge function subject ${subject}`).toContain(subject);
    }
    for (const f of [
      "supabase/functions/_shared/email-templates/signup.tsx",
      "supabase/functions/_shared/email-templates/magic-link.tsx",
    ]) {
      expect(read(f), `${f} must render the code too`).toContain("<Text style={codeStyle}>{token}</Text>");
    }
  });

  it("keeps the link for the two flows that have always used one", () => {
    // The admin fallback sign-in and the student account send this same email
    // and expect a link, so the code is added rather than swapped in.
    expect(template).toContain("<Button style={button} href={confirmationUrl}>");
    expect(read("src/lib/email-templates/signup.tsx")).toContain(
      "<Button style={button} href={confirmationUrl}>",
    );
    expect(read("src/components/admin/AdminLogin.tsx")).toContain("supabase.auth.signInWithOtp");
    expect(read("src/components/StudentAccount.tsx")).toContain("supabase.auth.signInWithOtp");
  });
});

describe("one trial per person", () => {
  it("is checked before Stripe, not only after the card is saved", () => {
    // booking-create's check runs on the webhook, which fires after the card
    // is saved — so a second attempt used to pay the friction, save a card and
    // then be refused.
    const setup = checkout.slice(checkout.indexOf("if (setup === true) {"));
    expect(setup).toContain('.eq("event_type_slug", "trial")');
    expect(setup).toContain('.in("status", ["confirmed", "completed"])');
    expect(setup).toContain('code: "trial_used"');
    const refused = setup.indexOf('code: "trial_used"');
    const stripeCall = setup.indexOf("stripe.checkout.sessions.create");
    expect(refused).toBeGreaterThan(-1);
    expect(stripeCall).toBeGreaterThan(-1);
    expect(refused, "the refusal must come before the Stripe session").toBeLessThan(stripeCall);
  });

  it("keeps the check in booking-create too, for the webhook path", () => {
    expect(booking).toContain('code: "trial_used"');
  });

  it("shows the visitor the screen that explains it", () => {
    expect(scheduler).toContain('payload?.code === "trial_used"');
    expect(scheduler).toContain("setTrialUsed(true)");
  });
});
