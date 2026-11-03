// Group payments started and not finished (owner, 2 Nov 2026).
//
// Opening a group payment holds a seat for GROUP_HOLD_MINUTES (2 hours,
// hold_group_seat). The seat stops counting at the deadline by itself
// (cohort_seats_taken compares seat_hold_until with now()); this module does
// the rest, from booking-reminders every 15 minutes:
//
//   reminder  15 minutes in, still unpaid: one email with the link to finish
//             and the exact deadline (hold_reminder_sent_at).
//   release   deadline passed, still unpaid: the open Stripe payment is
//             closed so it can no longer be paid, the registration becomes
//             payment_status "expired" (kept, visible in admin as "Expirat"),
//             and one short email says the seat was released
//             (hold_released_at). A payment Stripe already took or is still
//             processing is left alone: the webhook records it.
//
// A payment that arrives late anyway is accepted (stripe-webhook) and takes
// a seat again; if the group was full by then, flagOverCapacity tells the
// owner. Nothing is refunded automatically.
//
// payment_status: "expired" is "an attempt was opened and abandoned until the
// payment page closed; no money moved" (src/components/admin/types.ts).

import { GROUP_HOLD_MINUTES } from "./group-enrolment.ts";
import { sendTemplateEmail } from "./managed-email.ts";

export const HOLD_REMINDER_AFTER_MINUTES = 15;
export const SITE_ORIGIN = "https://centruldearabalibaneza.com";
const ADMIN_RECIPIENT = "marhaba@centruldearabalibaneza.com";

type Lang = "ro" | "en";

export interface HoldRow {
  id: string;
  name: string | null;
  email: string | null;
  contact_email: string | null;
  language: string | null;
  cohort_id: string | null;
  plan: string | null;
  seat_hold_until: string;
  stripe_session_id: string | null;
  stripe_subscription_id: string | null;
}

interface CohortRow {
  id: string;
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string | null;
  max_seats: number | null;
}

const HOLD_COLUMNS =
  "id, name, email, contact_email, language, cohort_id, plan, seat_hold_until, stripe_session_id, stripe_subscription_id";

const langOf = (l: string | null): Lang => (l === "en" ? "en" : "ro");

/** "luni, 2 noiembrie 2026, 20:15 (ora României)" / "Monday, 2 November 2026, 20:15 (Romania time)". */
export function formatDeadline(iso: string, lang: Lang): string {
  const when = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: "Europe/Bucharest",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return `${when} (${lang === "en" ? "Romania time" : "ora României"})`;
}

/** "grupa A1 online, în română, care începe pe 7 noiembrie 2026". */
export function describeGroup(c: CohortRow | null, lang: Lang): string {
  if (!c) return lang === "en" ? "the group course" : "cursul de grup";
  const en = lang === "en";
  const format =
    c.format === "fizic"
      ? en
        ? "in-person"
        : "în persoană"
      : en
        ? "online"
        : "online";
  const taught =
    c.teaching_language === "en"
      ? en
        ? "taught in English"
        : "în engleză"
      : en
        ? "taught in Romanian"
        : "în română";
  const start = c.start_date
    ? new Intl.DateTimeFormat(en ? "en-GB" : "ro-RO", {
        timeZone: "Europe/Bucharest",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${c.start_date}T12:00:00Z`))
    : null;
  const head = en
    ? `the ${c.level ?? ""} ${format} group, ${taught}`
    : `grupa ${c.level ?? ""} ${format}, ${taught}`;
  return start
    ? en
      ? `${head.replace(/\s+/g, " ")}, starting on ${start}`
      : `${head.replace(/\s+/g, " ")}, care începe pe ${start}`
    : head.replace(/\s+/g, " ");
}

/** The checkout page for this registration (the same link the site uses). */
export function finishPaymentUrl(r: HoldRow): string {
  // No email or name in the address (audit: personal data in URLs); the
  // checkout page asks for the email, which the student then verifies.
  const params = new URLSearchParams({ courseType: "group" });
  params.set("registrationId", r.id);
  params.set("plan", r.plan === "full" ? "full" : "monthly");
  return `${SITE_ORIGIN}/checkout?${params.toString()}`;
}

export function signUpAgainUrl(lang: Lang): string {
  return lang === "en"
    ? `${SITE_ORIGIN}/en/courses/group`
    : `${SITE_ORIGIN}/cursuri/grup`;
}

// deno-lint-ignore no-explicit-any
async function cohortsById(db: any, ids: string[]) {
  const map = new Map<string, CohortRow>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return map;
  const { data } = await db
    .from("group_cohorts")
    .select("id, level, format, teaching_language, start_date, max_seats")
    .in("id", unique);
  for (const c of (data ?? []) as CohortRow[]) map.set(c.id, c);
  return map;
}

/**
 * Close the open Stripe payment of a hold that ran out. Returns false when
 * Stripe has taken (or is still taking) the money: then nothing is released,
 * the webhook records the payment.
 */
// deno-lint-ignore no-explicit-any
export async function closeStripePayment(stripe: any, r: HoldRow) {
  if (!stripe) return true;
  const pi = r.stripe_session_id?.startsWith("pi_")
    ? r.stripe_session_id
    : null;
  const cs = r.stripe_session_id?.startsWith("cs_")
    ? r.stripe_session_id
    : null;
  const sub = r.stripe_subscription_id?.startsWith("sub_")
    ? r.stripe_subscription_id
    : null;
  if (pi) {
    const intent = await stripe.paymentIntents.retrieve(pi);
    if (["succeeded", "processing", "requires_capture"].includes(intent.status))
      return false;
    if (intent.status !== "canceled") await stripe.paymentIntents.cancel(pi);
  }
  if (cs) {
    const session = await stripe.checkout.sessions.retrieve(cs);
    if (session.status === "complete") return false;
    if (session.status === "open") await stripe.checkout.sessions.expire(cs);
  }
  if (sub) {
    const subscription = await stripe.subscriptions.retrieve(sub);
    if (subscription.status === "incomplete")
      await stripe.subscriptions.cancel(sub);
    else if (!["incomplete_expired", "canceled"].includes(subscription.status))
      return false;
  }
  return true;
}

// deno-lint-ignore no-explicit-any
export async function processGroupHolds(
  db: any,
  stripe: any,
  now = new Date(),
) {
  const nowIso = now.toISOString();
  // A hold started at least 15 minutes ago ends at most 105 minutes from now.
  const remindBefore = new Date(
    now.getTime() + (GROUP_HOLD_MINUTES - HOLD_REMINDER_AFTER_MINUTES) * 60_000,
  ).toISOString();
  const result = { reminded: 0, released: 0, kept: 0, errors: 0 };

  const { data: due, error: dueErr } = await db
    .from("registrations")
    .select(HOLD_COLUMNS)
    .eq("form_type", "group")
    .eq("payment_status", "pending")
    .is("hold_reminder_sent_at", null)
    .is("anonymized_at", null)
    .not("lead_status", "in", '("qualified","converted")')
    .gt("seat_hold_until", nowIso)
    .lte("seat_hold_until", remindBefore);
  if (dueErr) throw dueErr;
  const { data: over, error: overErr } = await db
    .from("registrations")
    .select(HOLD_COLUMNS)
    .eq("form_type", "group")
    .eq("payment_status", "pending")
    .is("hold_released_at", null)
    .is("anonymized_at", null)
    .not("lead_status", "in", '("qualified","converted")')
    .lte("seat_hold_until", nowIso);
  if (overErr) throw overErr;

  const cohorts = await cohortsById(db, [
    ...((due ?? []) as HoldRow[]).map((r) => r.cohort_id ?? ""),
    ...((over ?? []) as HoldRow[]).map((r) => r.cohort_id ?? ""),
  ]);

  for (const r of (due ?? []) as HoldRow[]) {
    const to = r.contact_email || r.email;
    try {
      // Claim first, so two runs never send it twice.
      const { data: claimed } = await db
        .from("registrations")
        .update({ hold_reminder_sent_at: nowIso })
        .eq("id", r.id)
        .is("hold_reminder_sent_at", null)
        .eq("seat_hold_until", r.seat_hold_until)
        .select("id");
      if (!claimed?.length || !to) continue;
      const lang = langOf(r.language);
      await sendTemplateEmail("group-seat-hold", to, {
        idempotencyKey: `group-hold-reminder-${r.id}-${r.seat_hold_until}`,
        templateData: {
          kind: "reminder",
          lang,
          name: r.name ?? undefined,
          group: describeGroup(cohorts.get(r.cohort_id ?? "") ?? null, lang),
          deadline: formatDeadline(r.seat_hold_until, lang),
          url: finishPaymentUrl(r),
        },
      });
      result.reminded++;
    } catch (e) {
      result.errors++;
      console.error("[group-holds] reminder failed", r.id, e);
    }
  }

  for (const r of (over ?? []) as HoldRow[]) {
    try {
      if (!(await closeStripePayment(stripe, r))) {
        result.kept++;
        continue;
      }
      const { data: released } = await db
        .from("registrations")
        .update({ payment_status: "expired", hold_released_at: nowIso })
        .eq("id", r.id)
        .eq("payment_status", "pending")
        .is("hold_released_at", null)
        .lte("seat_hold_until", nowIso)
        .select("id");
      if (!released?.length) continue;
      result.released++;
      await db.from("audit_logs").insert({
        actor: "system",
        action: "group_seat_hold_released",
        registration_id: r.id,
        details: { hold_until: r.seat_hold_until },
      });
      const to = r.contact_email || r.email;
      if (!to) continue;
      const lang = langOf(r.language);
      await sendTemplateEmail("group-seat-hold", to, {
        idempotencyKey: `group-hold-released-${r.id}-${r.seat_hold_until}`,
        templateData: {
          kind: "released",
          lang,
          name: r.name ?? undefined,
          group: describeGroup(cohorts.get(r.cohort_id ?? "") ?? null, lang),
          url: signUpAgainUrl(lang),
        },
      });
    } catch (e) {
      result.errors++;
      console.error("[group-holds] release failed", r.id, e);
    }
  }
  return result;
}

/**
 * After a group payment is recorded: if the group now has more seats taken
 * than it has (a payment that came in after its hold ran out, when the group
 * had filled up), log it and tell the owner. The payment stands.
 */
// deno-lint-ignore no-explicit-any
export async function flagOverCapacity(db: any, registrationId: string) {
  try {
    const { data: reg } = await db
      .from("registrations")
      .select("id, name, cohort_id, form_type")
      .eq("id", registrationId)
      .maybeSingle();
    if (!reg?.cohort_id || reg.form_type !== "group") return false;
    const cohorts = await cohortsById(db, [reg.cohort_id]);
    const cohort = cohorts.get(reg.cohort_id);
    if (!cohort?.max_seats) return false;
    const { data: taken, error } = await db.rpc("cohort_seats_taken", {
      p_cohort: reg.cohort_id,
    });
    if (error) throw error;
    const count = Number(taken ?? 0);
    if (count <= cohort.max_seats) return false;
    await db.from("audit_logs").insert({
      actor: "system",
      action: "group_over_capacity",
      registration_id: reg.id,
      details: {
        cohort_id: reg.cohort_id,
        taken: count,
        max_seats: cohort.max_seats,
      },
    });
    await sendTemplateEmail("admin-group-over-capacity", ADMIN_RECIPIENT, {
      idempotencyKey: `group-over-capacity-${reg.id}`,
      templateData: {
        name: reg.name ?? undefined,
        group: describeGroup(cohort, "ro"),
        taken: count,
        maxSeats: cohort.max_seats,
        registrationId: reg.id,
      },
    });
    return true;
  } catch (e) {
    console.error(
      "[group-holds] over-capacity check failed",
      registrationId,
      e,
    );
    return false;
  }
}
