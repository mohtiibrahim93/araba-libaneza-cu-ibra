// Group / kids payment plan, stored on registrations.plan ("monthly" | "full").
// The payment functions read it from the row, never from the request: the
// request may only ask to CHANGE it (the buyer switching on /checkout), and
// that change is written to the row before anything is priced.
// Dependency-free so it can be unit-tested outside Deno.

import {
  groupFullCourseUnitAmount,
  groupMonthlyUnitAmount,
  groupMonthsFor,
  kidsGroupFullCourseUnitAmount,
  kidsGroupMonthlyUnitAmount,
  KIDS_GROUP_MONTHS,
} from "./prices.ts";

export type Plan = "monthly" | "full";

/** Row value → plan. Null, missing or anything unknown is monthly. */
export function planOf(value: unknown): Plan {
  return value === "full" ? "full" : "monthly";
}

/** Only a literal "monthly" / "full" is a change request; anything else is ignored. */
export function requestedPlan(value: unknown): Plan | null {
  return value === "monthly" || value === "full" ? value : null;
}

export function hasPlan(formType: unknown): boolean {
  return formType === "group" || formType === "kids";
}

/** Both options with the amounts Stripe will charge (bani), for /checkout to show. */
export function planOptions(reg: {
  form_type: string | null;
  level: string | null;
  format: string | null;
}) {
  const kids = reg.form_type === "kids";
  const monthly = kids
    ? kidsGroupMonthlyUnitAmount(reg.format)
    : groupMonthlyUnitAmount(reg.level, reg.format);
  const months = kids ? KIDS_GROUP_MONTHS : groupMonthsFor(reg.level);
  const full = kids
    ? kidsGroupFullCourseUnitAmount(reg.format)
    : groupFullCourseUnitAmount(reg.level, reg.format);
  return {
    monthly: { amount: monthly, monthsTotal: months },
    full: { amount: full, fullBase: monthly * months },
  };
}

type Admin = {
  from: (t: string) => {
    update: (v: Record<string, unknown>) => {
      eq: (c: string, v: string) => PromiseLike<{ error: unknown }>;
    };
  };
};

/**
 * Apply a buyer's plan switch to the row (owner already verified, row not
 * paid). Returns the plan now in force. Non-group rows and non-requests leave
 * the stored plan untouched.
 */
export async function applyPlanChange(
  admin: Admin,
  reg: { id: string; form_type: string | null; plan?: string | null },
  change: unknown,
): Promise<Plan> {
  const current = planOf(reg.plan);
  const wanted = requestedPlan(change);
  if (!hasPlan(reg.form_type) || !wanted || wanted === current) return current;
  const { error } = await admin
    .from("registrations")
    .update({ plan: wanted })
    .eq("id", reg.id);
  if (error) throw new Error("Could not update the payment plan");
  reg.plan = wanted;
  return wanted;
}
