import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * `registrations.payment_status` has no database constraint, so any string at
 * all will insert cleanly and be wrong only later.
 *
 * Seven values are in use, and two of them look like synonyms but are not:
 *
 *   unpaid     Nobody has tried to pay. The first payment has not happened and
 *              may never happen, in which case the student is charged the full
 *              price — a trial that is not converted, a course place taken
 *              without payment. This is where a hand-added student starts.
 *   pending    A payment is in flight or awaiting confirmation. The checkout
 *              functions write it once a Stripe session exists, so there is a
 *              real attempt behind it.
 *   card_saved A card is on file but not yet charged.
 *   paid / failed / past_due / refunded  What Stripe reports afterwards.
 *
 * This file once claimed the two were one state and that "unpaid" had been
 * caught before any row could carry it. Both claims were wrong: production is
 * mostly "unpaid", and merging it into "pending" would report money as on its
 * way when nobody has tried to pay.
 *
 * The real risk is an eighth value, not the seventh: the column takes anything,
 * the badge falls through to its default and looks plausible, and a breakdown
 * grows a bucket nobody labelled.
 */
const ALLOWED = [
  "paid",
  "unpaid",
  "pending",
  "card_saved",
  "failed",
  "past_due",
  "refunded",
];

/** Everything a reader has to be able to name. Same list: all seven are real. */
const IN_THE_DATA = ALLOWED;

/** Every .ts/.tsx under a root, so a new function cannot slip past. */
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const files = [
  ...walk(resolve(process.cwd(), "supabase/functions")),
  ...walk(resolve(process.cwd(), "src")),
].filter((f) => !f.includes("/test/"));

describe("payment_status stays to its seven values", () => {
  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("writes no seventh value", () => {
    const bad: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/payment_status:\s*(?:[^,\n]*\?\s*)?"([a-z_]+)"(?:\s*:\s*"([a-z_]+)")?/g)) {
        for (const v of [m[1], m[2]]) {
          if (v && !ALLOWED.includes(v)) {
            bad.push(`${f.replace(process.cwd() + "/", "")}: "${v}"`);
          }
        }
      }
    }
    expect(bad, `payment_status values outside the seven:\n${bad.join("\n")}`).toEqual([]);
  });

  it("labels every value the column can hold", async () => {
    // An unlabelled value renders as the raw database key, which is how
    // "unpaid" and "no_response" ended up on screen next to Romanian words.
    // Assert against the shared map rather than any one screen's source text:
    // the map is what every screen reads.
    const { paymentStatusLabels } = await import("../components/admin/types");
    for (const v of IN_THE_DATA) {
      expect(paymentStatusLabels[v], `${v} has no Romanian label`).toBeTruthy();
    }
  });

  it("keeps a hand-added student apart from one who started a checkout", () => {
    // The distinction this file exists to protect, and the one that has been
    // collapsed twice. A student added in "Inscrieri externe" has attempted no
    // payment; one who reached Stripe has a session open behind them. Writing
    // "pending" for the first reports money as in flight when nobody has tried.
    const admin = readFileSync(
      resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
      "utf8",
    );
    expect(admin, "the hand-added student must start as unpaid").toContain(
      'payment_status: isPaid ? "paid" : "unpaid"',
    );

    for (const fn of [
      "create-checkout-session",
      "create-checkout",
      "create-payment-intent",
      "create-subscription",
    ]) {
      const src = readFileSync(
        resolve(process.cwd(), `supabase/functions/${fn}/index.ts`),
        "utf8",
      );
      expect(src, `${fn} starts a real payment, so it writes pending`).toContain(
        'payment_status: "pending"',
      );
    }
  });

  it("counts anything-but-paid as owing, so a new value is never missed silently", () => {
    // The worklist asks what is NOT paid rather than listing what is unpaid:
    // a seventh value would show up there rather than disappear from it.
    const fn = readFileSync(
      resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
      "utf8",
    );
    expect(fn).toContain('.not("payment_status", "in", \'("paid","refunded")\')');
  });
});
