import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { trialOutcomeState } from "@/components/admin/TrialOutcome";

/**
 * Free-trial rules confirmed by the owner on 12 October 2026:
 *  card saved + lesson booked → used once it takes place (or he marks it);
 *  student cancels > 24h before → not used; centre cancels → not used;
 *  late cancel / no-show → owner chooses excused (not used) or lost (used);
 *  24h after the lesson with nothing marked → done (used);
 *  same card under another email → refused; same name/phone → flagged only;
 *  saving a card is never a payment.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const H = 3_600_000;
const lesson = (startOffsetH: number, extra: Record<string, unknown> = {}) => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  const start = now + startOffsetH * H;
  return { now, b: { id: "t", start_at: new Date(start).toISOString(), end_at: new Date(start + H).toISOString(), status: "confirmed", trial_outcome: null, ...extra } as any };
};

describe("what the admin reads for a trial", () => {
  it("counts a booked, upcoming trial as used (one per person)", () => {
    const { now, b } = lesson(48);
    expect(trialOutcomeState(b, now)).toMatchObject({ used: true, label: "Programată" });
  });
  it("asks 'a venit?' in the first 24h after the lesson, then counts it as done by itself", () => {
    const fresh = lesson(-2);
    expect(trialOutcomeState(fresh.b, fresh.now)).toMatchObject({ label: "De marcat: a venit?", used: true });
    const old = lesson(-26);
    expect(trialOutcomeState(old.b, old.now)).toMatchObject({ label: "Făcută (automat, după 24h)", used: true, automatic: true });
  });
  it("leaves the trial available after a cancellation unless the owner marks it lost", () => {
    const c = lesson(10, { status: "cancelled" });
    expect(trialOutcomeState(c.b, c.now).used).toBe(false);
    expect(trialOutcomeState({ ...c.b, trial_outcome: "excused" }, c.now).used).toBe(false);
    expect(trialOutcomeState({ ...c.b, trial_outcome: "lost" }, c.now).used).toBe(true);
  });
  it("lets the owner excuse a no-show (trial stays available) or mark it lost", () => {
    const n = lesson(-30);
    expect(trialOutcomeState({ ...n.b, trial_outcome: "excused" }, n.now).used).toBe(false);
    expect(trialOutcomeState({ ...n.b, trial_outcome: "lost" }, n.now).used).toBe(true);
    expect(trialOutcomeState({ ...n.b, trial_outcome: "done" }, n.now)).toMatchObject({ used: true, automatic: false });
  });
});

describe("the database applies the same rule", () => {
  const sql = read("supabase/migrations/20261012190000_trial_outcome_and_card.sql");
  it("uses a trial when it took place or was marked lost, never when excused", () => {
    expect(sql).toContain("(p_status IN ('confirmed', 'completed') AND coalesce(p_outcome, '') <> 'excused')");
    expect(sql).toContain("OR p_outcome = 'lost'");
  });
  it("refuses the same card only under a different email", () => {
    const card = sql.slice(sql.indexOf("WHEN p_card_fingerprint IS NOT NULL"));
    expect(card).toContain("r.card_fingerprint = p_card_fingerprint");
    expect(card).toContain("lower(coalesce(r.email, '')) <> lower(btrim(p_email))");
  });
  it("keeps the check off the public API", () => {
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.trial_already_used(text, text) FROM PUBLIC, anon, authenticated;");
  });
});

describe("checkout, booking and webhook use it", () => {
  it("checks before Stripe and again at booking, through the one rule", () => {
    expect(read("supabase/functions/create-checkout-session/index.ts")).toContain('rpc("trial_already_used", { p_email: String(reg.email) })');
    const create = read("supabase/functions/booking-create/index.ts");
    expect(create).toContain('rpc("trial_already_used"');
    expect(create).toContain('code: "trial_card_used"');
  });
  it("accepts a card fingerprint only from trusted internal calls", () => {
    expect(read("supabase/functions/booking-create/index.ts")).toContain('const cardFingerprint = internalCall && typeof body.card_fingerprint === "string"');
  });
  it("reads the saved card's fingerprint from Stripe and passes it to the booking", () => {
    const hook = read("supabase/functions/stripe-webhook/index.ts");
    expect(hook).toContain('stripe.setupIntents.retrieve(setupIntentId, { expand: ["payment_method"] })');
    expect(hook).toContain("card_fingerprint: cardFingerprint");
    expect(hook).toContain("Cardul a mai fost folosit pentru o probă gratuită, cu alt email.");
  });
  it("still records a saved card as card_saved, never paid", () => {
    expect(read("supabase/functions/stripe-webhook/index.ts")).toContain('payment_status: "card_saved"');
  });
  it("no longer promises a confirmed spot before the booking exists", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).not.toContain("locul tău la proba gratuită e confirmat");
    expect(index).toContain("Confirmarea programării vine pe email");
  });
});

describe("the owner's controls", () => {
  const admin = read("supabase/functions/admin-registrations/index.ts");
  const action = admin.slice(admin.indexOf('if (action === "set_trial_outcome")'), admin.indexOf('if (action === "list_bookings")'));
  it("only marks trials, only once they took place or were cancelled, and logs it", () => {
    expect(action).toContain('booking.event_type_slug !== "trial"');
    expect(action).toContain("O probă se poate marca făcută doar după ce a avut loc.");
    expect(action).toContain('action: "set_trial_outcome"');
  });
  it("lists yesterday's unmarked trials in Azi and flags a possible duplicate person", () => {
    expect(admin).toContain("trialsToMark: trialsToMark ?? []");
    expect(admin).toContain("Posibil duplicat — a mai avut o probă");
  });
});
