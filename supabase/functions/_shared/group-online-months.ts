/**
 * Card payments made on the site for a group course, recorded month by month
 * as "Card online" (owner, 4 Nov 2026). Called by the Stripe webhook.
 *
 * A monthly invoice covers the lowest month not yet paid or granted; a
 * payment for the whole course covers every month still open. stripe_ref (the
 * invoice, session or payment-intent id) is unique, so a redelivered event
 * records nothing twice. months_paid is then the number of months covered,
 * the same count admin-registrations writes for a payment the owner records.
 */
import { groupMonths, type MonthPaymentRow } from "./group-months.ts";
import { GROUP_MONTHS } from "./prices.ts";

export interface OnlinePayment {
  ref: string;
  amountLei: number;
  paidAt: string;
}

// deno-lint-ignore no-explicit-any
export async function recordOnlineGroupMonths(
  supabase: any,
  registrationId: string,
  payments: OnlinePayment[],
  covers: "one_month_each" | "whole_course",
): Promise<void> {
  try {
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, form_type, level, cohort_id, months_total")
      .eq("id", registrationId)
      .maybeSingle();
    if (!reg || reg.form_type !== "group") return;
    let level = reg.level as string | null;
    let startDate: string | null = null;
    if (reg.cohort_id) {
      const { data: c } = await supabase
        .from("group_cohorts")
        .select("level, start_date")
        .eq("id", reg.cohort_id)
        .maybeSingle();
      level = c?.level ?? level;
      startDate = c?.start_date ?? null;
    }
    const total =
      reg.months_total ??
      GROUP_MONTHS[
        (level ?? "A1").toUpperCase() as keyof typeof GROUP_MONTHS
      ] ??
      GROUP_MONTHS.A1;

    for (const p of payments) {
      if (!(p.amountLei > 0)) continue;
      const { data: rows } = await supabase
        .from("registration_payments")
        .select(
          "kind, method, amount_lei, paid_at, month_from, month_to, note, stripe_ref",
        )
        .eq("registration_id", registrationId);
      if (
        (rows ?? []).some(
          (r: { stripe_ref: string | null }) => r.stripe_ref === p.ref,
        )
      )
        continue;
      const summary = groupMonths({
        total,
        startDate,
        rows: (rows ?? []) as MonthPaymentRow[],
      });
      const lastCovered = Math.max(
        0,
        ...(rows ?? []).map((r: MonthPaymentRow) => r.month_to ?? 0),
      );
      // Money is always recorded: if every month is already covered (say a
      // granted month plus a full Stripe schedule), it goes after the last.
      const from = summary.nextUncovered ?? lastCovered + 1;
      let to = from;
      if (covers === "whole_course") {
        to = from;
        while (
          to + 1 <= summary.total &&
          summary.months[to]?.state === "unpaid"
        )
          to++;
      }
      const { error } = await supabase.from("registration_payments").insert({
        registration_id: registrationId,
        kind: covers === "whole_course" ? "full" : "month",
        method: "card_online",
        amount_lei: Math.round(p.amountLei * 100) / 100,
        recorded_by: "stripe",
        paid_at: p.paidAt,
        month_from: from,
        month_to: to,
        stripe_ref: p.ref,
      });
      // 23505: the same event arrived twice at once; the other one recorded it.
      if (error && error.code !== "23505") throw error;
    }

    const { data: after } = await supabase
      .from("registration_payments")
      .select("kind, method, amount_lei, paid_at, month_from, month_to, note")
      .eq("registration_id", registrationId);
    const summary = groupMonths({
      total,
      startDate,
      rows: (after ?? []) as MonthPaymentRow[],
    });
    await supabase
      .from("registrations")
      .update({ months_total: total, months_paid: summary.covered })
      .eq("id", registrationId);
  } catch (err) {
    // The payment itself is already recorded on the registration; a failure
    // here must not make Stripe retry the whole event.
    console.error("[group-online-months] could not record months:", err);
  }
}
