import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/**
 * Two things the "De rezolvat" worklist could not express (26 October 2026):
 *
 * - A lesson the owner gives for free (a make-up lesson, "recuperare") was
 *   recorded as unpaid, so it sat in "Au spus da, n-au plătit" as money owed.
 *   It is now payment_status "free": nothing owed, not revenue, same access
 *   as paid.
 * - Someone who said yes and then stopped answering could only be snoozed
 *   for 7 days. "Nu mai răspunde" marks them no_response and the unpaid list
 *   leaves out leads the owner has given up on; the registration itself stays,
 *   so a later request from them can be read against it.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const admin = read("supabase/functions/admin-registrations/index.ts");
const today = read("src/components/admin/TodayAdmin.tsx");

const block = (src: string, start: string, end: string) => {
  const all = code(src);
  const from = all.indexOf(code(start));
  expect(from, `${start} not found`).toBeGreaterThan(-1);
  return all.slice(from, all.indexOf(code(end), from + 1));
};

describe("a lesson given for free", () => {
  it("is labelled and counted with the students", async () => {
    const { paymentStatusLabels, leadSegment } =
      await import("../components/admin/types");
    expect(paymentStatusLabels["free"]).toBe("Gratuit");
    expect(leadSegment({ payment_status: "free" })).toBe("students");
  });

  it("can be booked as free from Lecție în plus", () => {
    expect(code(admin)).toContain(code("const free = b.free === true;"));
    expect(code(admin)).toContain(
      code('payment_status: free ? "free" : paid ? "paid" : "unpaid",'),
    );
    const ui = read("src/components/BookingsAdmin.tsx");
    expect(code(ui)).toContain(code("...(bkFree ? { free: true } : {}),"));
    expect(code(ui)).toContain(code("paid: bkPaid && !bkFree,"));
  });

  it("is marked free only from unpaid, never over a payment Stripe knows about", () => {
    const action = block(
      admin,
      'if (action === "mark_free") {',
      'if (action === "update_status") {',
    );
    expect(action).toContain(code('.update({ payment_status: "free"'));
    expect(action).toContain(code('.eq("payment_status", "unpaid")'));
    expect(action).toContain(code('.is("anonymized_at", null)'));
    expect(action).toContain(code('action: "mark_free",'));
    // The button is offered only where the server will accept it.
    expect(code(today)).toContain(
      code('unpaid && r.payment_status === "unpaid" && ('),
    );
    expect(code(today)).toContain(code('{ action: "mark_free" }'));
  });

  it("leaves the unpaid list", () => {
    expect(code(admin)).toContain(
      code('.not("payment_status", "in", \'("paid","refunded","free")\')'),
    );
  });

  it("gets the same access as a paid lesson and is never charged", () => {
    expect(
      code(read("supabase/functions/notify-registration/index.ts")),
    ).toContain(
      code(
        'const paid = reg.payment_status === "paid" || reg.payment_status === "free";',
      ),
    );
    expect(code(read("supabase/functions/booking-create/index.ts"))).toContain(
      code('reg.payment_status !== "paid" && reg.payment_status !== "free"'),
    );
    for (const [fn, row] of [
      ["create-checkout", "regRow"],
      ["create-checkout-session", "reg"],
      ["create-payment-intent", "regRow"],
      ["create-subscription", "regRow"],
    ] as const) {
      expect(
        code(read(`supabase/functions/${fn}/index.ts`)),
        `${fn} must not charge for a free lesson`,
      ).toContain(
        code(
          `if (${row}.payment_status === "paid" || ${row}.payment_status === "free") {`,
        ),
      );
    }
  });

  it("is not shown as unpaid in the registrations table", () => {
    const table = read("src/components/admin/RegistrationsTable.tsx");
    expect(code(table)).toContain(code('case "free":'));
  });
});

describe("a lead who stopped answering", () => {
  it("can be dropped from the unpaid list in one click", () => {
    expect(code(today)).toContain(code("Nu mai răspunde"));
    expect(code(today)).toContain(
      code(
        'void act(r.id, "unpaid", { action: "update_status", lead_status: "no_response", })',
      ),
    );
  });

  it("stays dropped: the unpaid list leaves out leads the owner gave up on", () => {
    expect(code(admin)).toContain(
      code('const DROPPED_LEADS = ["no_response", "not_suitable", "spam"];'),
    );
    expect(code(admin)).toContain(code("unpaid: owing.map((r) => ({"));
    // lead_status has to be selected for the filter to see it.
    expect(code(admin)).toContain(
      code(
        '"id, created_at, name, phone, email, form_type, level, format, payment_status, lead_status"',
      ),
    );
  });
});
