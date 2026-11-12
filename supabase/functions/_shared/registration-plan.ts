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

type PriceReader = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (
        c: string,
        v: string,
      ) => {
        maybeSingle: () => PromiseLike<{
          data: { price_lei?: unknown } | null;
          error: unknown;
        }>;
      };
    };
  };
};

/**
 * The monthly price of the registration's own group, in whole RON, or null
 * when the group follows the price table (owner, 11 Nov 2026: a group can have
 * its own price, and a student of that group pays it).
 *
 * Read from the group the ROW points at, never from the request. Throws when
 * the group cannot be read: carrying on would charge the table price, which
 * for a group with a lower price of its own is an overcharge.
 */
export async function groupOwnPrice(
  admin: PriceReader,
  reg: { form_type: string | null; cohort_id?: string | null },
): Promise<number | null> {
  if (reg.form_type !== "group" || !reg.cohort_id) return null;
  const { data, error } = await admin
    .from("group_cohorts")
    .select("price_lei")
    .eq("id", reg.cohort_id)
    .maybeSingle();
  if (error) throw new Error("Could not read the group's price");
  const raw = data?.price_lei;
  const own = raw == null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(own) && own > 0 ? own : null;
}

/**
 * Both options with the amounts Stripe will charge (bani), for /checkout to
 * show. `ownPriceRon` is the group's own monthly price (groupOwnPrice).
 */
export function planOptions(
  reg: {
    form_type: string | null;
    level: string | null;
    format: string | null;
  },
  ownPriceRon?: number | null,
) {
  const kids = reg.form_type === "kids";
  const monthly = kids
    ? kidsGroupMonthlyUnitAmount(reg.format)
    : groupMonthlyUnitAmount(reg.level, reg.format, ownPriceRon);
  const months = kids ? KIDS_GROUP_MONTHS : groupMonthsFor(reg.level);
  const full = kids
    ? kidsGroupFullCourseUnitAmount(reg.format)
    : groupFullCourseUnitAmount(reg.level, reg.format, ownPriceRon);
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
