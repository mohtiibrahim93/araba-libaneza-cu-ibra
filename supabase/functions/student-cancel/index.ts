// Withdraw or cancel from "Contul meu" (owner, 17 November 2026: "the cancel
// button if they want to cancel yes"; Terms, section 4).
//
// Two calls, from the student's own account, signed in:
//
//   { action: "preview", registrationId, lang }
//     Which button the sign-up gets, the statement the student will send,
//     what the Terms give back today (_shared/cancel-request.ts) and, before
//     a cancellation, the other groups of the same level to move to instead
//     ("Mutare în altă grupă: înainte de orice rambursare îți propunem
//     mutarea"). Reads only.
//
//   { action: "request", registrationId, kind, confirm: true, name?,
//     targetCohortId?, lang }
//     Records the request with the database's own time (the cancellation
//     date), tells a card subscription to stop its future charges, emails the
//     student an acknowledgement with the statement and its date and time,
//     and emails the owner. Moves no money: the owner refunds in the admin.
//
// The withdrawal button follows the withdrawal function of Directive (EU)
// 2023/2673, art. 11a (from 19 June 2026): "Retrage-te din contract aici",
// a statement where the student confirms their name, the contract and the
// address the acknowledgement goes to, then "Confirmă retragerea", then the
// acknowledgement on a durable medium (email) with the statement and the
// date and time it was sent.
//
// Only the student: the session's confirmed address must be the sign-up's
// (verified-registration-owner.ts, as for paying a month).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { verifiedRegistrationOwner } from "../_shared/verified-registration-owner.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";
import type { MonthPaymentRow } from "../_shared/group-months.ts";
import { groupMonthsFor } from "../_shared/prices.ts";
import {
  CANCEL_KINDS,
  bucharestDay,
  cancelOptions,
  cancelPreview,
  cancelStatement,
  dateAndTime,
  longDate,
  type CancelKind,
  type CancelPreview,
} from "../_shared/cancel-request.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ADMIN_RECIPIENT = "marhaba@centruldearabalibaneza.com";

/** Groups a student can move to: open for sign-ups and not full. */
const JOINABLE = ["forming", "minimum_reached", "confirmed"];

const KIND: Record<"ro" | "en", Record<string, string>> = {
  ro: {
    group: "Curs de grup",
    private: "Lecții private",
    kids: "Curs pentru copii",
  },
  en: {
    group: "Group course",
    private: "Private lessons",
    kids: "Kids course",
  },
};
const FORMAT = {
  ro: { online: "online", fizic: "fizic, la centru" },
  en: { online: "online", fizic: "in person, at the centre" },
} as const;

interface Cohort {
  id: string;
  status: string | null;
  level: string | null;
  format: string | null;
  start_date: string | null;
  title_ro: string | null;
  title_en: string | null;
  schedule_label_ro: string | null;
  schedule_label_en: string | null;
}

const COHORT_COLUMNS =
  "id, status, level, format, start_date, title_ro, title_en, schedule_label_ro, schedule_label_en";

/**
 * The course's name as the account shows it (src/lib/myAccount.ts,
 * enrolmentTitle): "Curs de grup A1 · online", or the group's own title.
 */
function courseName(
  reg: { form_type: string; level: string | null; format: string | null },
  cohort: Cohort | null,
  lang: "ro" | "en",
): string {
  const own = lang === "en" ? cohort?.title_en : cohort?.title_ro;
  if (own) return own;
  const kind = KIND[lang][reg.form_type] ?? reg.form_type;
  const levelOf = cohort?.level ?? reg.level;
  const level = reg.form_type === "group" && levelOf ? ` ${levelOf}` : "";
  const formatOf = cohort?.format ?? reg.format;
  const format = formatOf
    ? FORMAT[lang][formatOf as "online" | "fizic"]
    : undefined;
  return `${kind}${level}${format ? ` · ${format}` : ""}`;
}

/** A group to move to, as the page lists it. */
function groupChoice(c: Cohort, lang: "ro" | "en") {
  return {
    id: c.id,
    title: courseName(
      { form_type: "group", level: null, format: null },
      c,
      lang,
    ),
    startDate: c.start_date,
    schedule: lang === "en" ? c.schedule_label_en : c.schedule_label_ro,
  };
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => null);
    const action = body?.action;
    const registrationId = body?.registrationId;
    const lang: "ro" | "en" = body?.lang === "en" ? "en" : "ro";
    if (
      (action !== "preview" && action !== "request") ||
      typeof registrationId !== "string" ||
      !UUID.test(registrationId)
    ) {
      return json({ error: "invalid request" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select(
        "id, form_type, email, name, phone, level, format, cohort_id, months_total, created_at, canceled_at, early_start_requested_at, stripe_subscription_id, subscription_status, anonymized_at",
      )
      .eq("id", registrationId)
      .maybeSingle();

    // Only the student: signed in, with the sign-up's own confirmed address.
    // Someone else's sign-up looks the same as none at all.
    if (
      regErr ||
      !reg ||
      reg.anonymized_at ||
      !(await verifiedRegistrationOwner(req, reg, supabase.auth))
    ) {
      return json({ error: "Registration not found" }, 404);
    }

    if (!(await checkRateLimit(supabase, `student_cancel:${reg.id}`, 30, 3600)))
      return json({ error: "too many requests" }, 429);

    let cohort: Cohort | null = null;
    if (reg.cohort_id) {
      const { data, error } = await supabase
        .from("group_cohorts")
        .select(COHORT_COLUMNS)
        .eq("id", reg.cohort_id)
        .maybeSingle();
      if (error) throw new Error("Could not read the group");
      cohort = data as Cohort | null;
    }

    const now = new Date();
    const options = cancelOptions(reg, cohort?.status ?? null, now);
    const course = courseName(reg, cohort, lang);

    const { data: open, error: openErr } = await supabase
      .from("cancellation_requests")
      .select("id, kind, requested_at, statement, target_cohort_id")
      .eq("registration_id", reg.id)
      .is("handled_at", null)
      .maybeSingle();
    if (openErr) throw new Error("Could not read the requests");

    /** What the Terms give back today, from the payments recorded. */
    const previewNow = async (): Promise<CancelPreview> => {
      const { data: rows, error: rowsErr } = await supabase
        .from("registration_payments")
        .select("kind, method, amount_lei, paid_at, month_from, month_to")
        .eq("registration_id", reg.id);
      if (rowsErr) throw new Error("Could not read the recorded payments");
      let sessionStarts: string[] = [];
      if (reg.cohort_id) {
        const { data: sessions, error: sessErr } = await supabase
          .from("cohort_sessions")
          .select("starts_at")
          .eq("cohort_id", reg.cohort_id)
          .order("starts_at");
        if (sessErr) throw new Error("Could not read the lessons");
        sessionStarts = (sessions ?? []).map(
          (s: { starts_at: string }) => s.starts_at,
        );
      }
      return cancelPreview({
        signedUpAt: reg.created_at,
        earlyStartRequested: Boolean(reg.early_start_requested_at),
        monthsTotal:
          reg.months_total ?? groupMonthsFor(cohort?.level ?? reg.level),
        courseStartDate: cohort?.start_date ?? null,
        sessionStarts,
        rows: (rows ?? []) as MonthPaymentRow[],
        at: now.toISOString(),
      });
    };

    /** Groups of the same level that start later and still take sign-ups. */
    const groupsToMoveTo = async (): Promise<Cohort[]> => {
      const level = cohort?.level ?? reg.level;
      if (reg.form_type !== "group" || !level) return [];
      const { data, error } = await supabase
        .from("group_cohorts")
        .select(COHORT_COLUMNS)
        .eq("form_type", "group")
        .eq("level", level)
        .in("status", JOINABLE)
        .gt("start_date", bucharestDay(now))
        .order("start_date", { ascending: true })
        .limit(6);
      if (error) throw new Error("Could not read the groups");
      return ((data ?? []) as Cohort[]).filter((c) => c.id !== reg.cohort_id);
    };

    if (action === "preview") {
      const kind: CancelKind | null = options.withdrawalUntil
        ? "withdrawal"
        : options.cancel
          ? "cancellation"
          : null;
      return json({
        options,
        request: open
          ? {
              kind: open.kind,
              requestedAt: open.requested_at,
              statement: open.statement,
            }
          : null,
        course,
        name: reg.name ?? "",
        email: reg.email,
        signedUpOn: longDate(reg.created_at, lang),
        statement: kind
          ? cancelStatement(kind, {
              course,
              signedUpAt: reg.created_at,
              lang,
            })
          : null,
        preview: kind && !open ? await previewNow() : null,
        groups:
          kind === "cancellation" && !open
            ? (await groupsToMoveTo()).map((c) => groupChoice(c, lang))
            : [],
      });
    }

    // ------------------------------------------------------------- request
    const kind = body?.kind as CancelKind;
    if (!(CANCEL_KINDS as readonly string[]).includes(kind))
      return json({ error: "invalid request" }, 400);
    // Only a real press of the confirm button is a request.
    if (body?.confirm !== true) return json({ error: "not confirmed" }, 400);
    // A second press finds the first request: it is not sent twice.
    if (open)
      return json({
        request: {
          id: open.id,
          kind: open.kind,
          requestedAt: open.requested_at,
          statement: open.statement,
        },
        already: true,
      });
    if (kind === "withdrawal" ? !options.withdrawalUntil : !options.cancel)
      return json({ error: "not available", code: "not_available" }, 409);

    let target: Cohort | null = null;
    if (kind === "transfer") {
      const id = body?.targetCohortId;
      target =
        typeof id === "string"
          ? ((await groupsToMoveTo()).find((c) => c.id === id) ?? null)
          : null;
      if (!target)
        return json({ error: "group not available", code: "no_group" }, 409);
    }

    // The student confirms or corrects their name in the statement.
    const typed = typeof body?.name === "string" ? body.name.trim() : "";
    const name = (typed || reg.name || "").slice(0, 160) || null;
    const statement = cancelStatement(kind, {
      course,
      signedUpAt: reg.created_at,
      lang,
      target: target ? groupChoice(target, lang).title : null,
    });
    const shown = kind === "transfer" ? null : await previewNow();

    const { data: saved, error: saveErr } = await supabase
      .from("cancellation_requests")
      .insert({
        registration_id: reg.id,
        kind,
        email:
          String(reg.email ?? "")
            .trim()
            .toLowerCase() || null,
        name,
        statement,
        target_cohort_id: target?.id ?? null,
        shown,
      })
      .select("id, requested_at")
      .single();
    if (saveErr || !saved) {
      // Pressed twice at the same moment: the other press saved it.
      if ((saveErr as { code?: string } | null)?.code === "23505") {
        const { data: first } = await supabase
          .from("cancellation_requests")
          .select("id, kind, requested_at, statement")
          .eq("registration_id", reg.id)
          .is("handled_at", null)
          .maybeSingle();
        if (first)
          return json({
            request: {
              id: first.id,
              kind: first.kind,
              requestedAt: first.requested_at,
              statement: first.statement,
            },
            already: true,
          });
      }
      throw new Error("Could not save the request");
    }

    // A card subscription stops charging: the month already paid runs to
    // its end, and nothing more is taken. The owner refunds in the admin.
    let subscriptionStopped: boolean | null = null;
    if (
      kind !== "transfer" &&
      typeof reg.stripe_subscription_id === "string" &&
      reg.stripe_subscription_id.startsWith("sub_") &&
      reg.subscription_status !== "canceled"
    ) {
      try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });
        await stripe.subscriptions.update(reg.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
        subscriptionStopped = true;
        await supabase
          .from("cancellation_requests")
          .update({ subscription_stopped_at: new Date().toISOString() })
          .eq("id", saved.id);
      } catch (e) {
        subscriptionStopped = false;
        console.error("[student-cancel] subscription not stopped", e);
      }
    }

    const when = dateAndTime(saved.requested_at, lang);
    let acknowledged = false;
    try {
      await sendTemplateEmail("cancel-request-received", reg.email, {
        templateData: {
          kind,
          name: name ?? "",
          email: reg.email,
          statement,
          when,
          lang,
        },
        idempotencyKey: `cancel-request-${saved.id}`,
      });
      acknowledged = true;
      await supabase
        .from("cancellation_requests")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", saved.id);
    } catch (e) {
      console.error("[student-cancel] acknowledgement not sent", e);
    }

    try {
      await sendTemplateEmail("admin-cancel-request", ADMIN_RECIPIENT, {
        templateData: {
          kind,
          name: name ?? "",
          email: reg.email,
          phone: reg.phone ?? "",
          course: courseName(reg, cohort, "ro"),
          target: target ? groupChoice(target, "ro").title : "",
          statement,
          when: dateAndTime(saved.requested_at, "ro"),
          shown,
          subscriptionStopped,
          acknowledged,
        },
        idempotencyKey: `admin-cancel-request-${saved.id}`,
      });
      await supabase
        .from("cancellation_requests")
        .update({ owner_notified_at: new Date().toISOString() })
        .eq("id", saved.id);
    } catch (e) {
      console.error("[student-cancel] owner not notified", e);
    }

    await supabase.from("audit_logs").insert({
      actor: String(reg.email ?? "").toLowerCase() || "student",
      action: `student_${kind}_request`,
      registration_id: reg.id,
      details: {
        request_id: saved.id,
        requested_at: saved.requested_at,
        target_cohort_id: target?.id ?? null,
        subscription_stopped: subscriptionStopped,
      },
    });

    return json({
      request: {
        id: saved.id,
        kind,
        requestedAt: saved.requested_at,
        statement,
      },
      acknowledged,
    });
  } catch (err) {
    console.error("[student-cancel]", err);
    return json({ error: "service unavailable" }, 503);
  }
});
