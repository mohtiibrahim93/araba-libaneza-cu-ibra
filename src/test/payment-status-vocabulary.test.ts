import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * `registrations.payment_status` has no database constraint, so any string at
 * all will insert cleanly and be wrong only later.
 *
 * Six values are what the code writes: paid, pending, card_saved, failed,
 * past_due, refunded. A seventh is not a database error, it is a slow one. The
 * row inserts, the badge falls through to its default and looks plausible, and
 * the breakdowns quietly grow a bucket nobody labelled.
 *
 * That is exactly what happened, and — contrary to what this file used to
 * claim — it was not caught in time. Production rows carry "unpaid": on
 * 2026-10-07 five of six registrations had it, against one "card_saved". The
 * same state lives in the table under two names, "unpaid" and "pending".
 *
 * So the rule has two halves. New code writes only the six. Anything that
 * READS the column must also be able to name "unpaid", because the data has it
 * and an unlabelled value renders as the raw database key.
 */
/** What new code is allowed to write. */
const ALLOWED = ["paid", "pending", "card_saved", "failed", "past_due", "refunded"];

/** What the column actually holds, so what a reader has to be able to label. */
const IN_THE_DATA = [...ALLOWED, "unpaid"];

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

describe("payment_status stays to its six written values", () => {
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
    expect(bad, `payment_status values outside the six:\n${bad.join("\n")}`).toEqual([]);
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
