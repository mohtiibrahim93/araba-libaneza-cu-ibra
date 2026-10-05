import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * `registrations.payment_status` has no database constraint, so any string at
 * all will insert cleanly and be wrong only later.
 *
 * Six values are in use: paid, pending, card_saved, failed, past_due,
 * refunded. Everything that reads the column — the status badge, the filters,
 * the analytics breakdown, the "has not paid" worklist — knows those six.
 *
 * A seventh is not a database error, it is a slow one. The row inserts, the
 * badge falls through to its default and looks plausible, and the breakdowns
 * quietly grow a bucket nobody labelled. That is what happened: a student
 * added by hand in the admin was written as "unpaid" while an identical
 * student from the site was "pending" — the same state under two names, in
 * the same table, in the same list.
 *
 * It was caught before the function was deployed, so no row ever carried it.
 * This keeps the vocabulary at six.
 */
const ALLOWED = ["paid", "pending", "card_saved", "failed", "past_due", "refunded"];

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

describe("payment_status stays to its six values", () => {
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

  it("labels every one of them in the analytics breakdown", () => {
    // An unlabelled value renders as the raw database key.
    const page = readFileSync(
      resolve(process.cwd(), "src/components/admin/AnalyticsAdmin.tsx"),
      "utf8",
    );
    // Slice from where the breakdown is rendered, not from the interface that
    // declares it — the type appears first in the file and carries no labels.
    const at = page.indexOf("counts={data.conversion.byPaymentStatus}");
    expect(at, "the payment-status breakdown is no longer rendered").toBeGreaterThan(-1);
    const block = page.slice(at, at + 600);
    for (const v of ALLOWED) {
      expect(block, `${v} has no Romanian label`).toContain(`${v}:`);
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
