import {
  importCalendarEvent,
  reconcileCalendar,
  repairBookingCalendar,
} from "../_shared/calendar-reconciliation.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  GCAL_GATEWAY,
  gcalDiagnose,
  utcToZonedParts,
  zonedToUtc,
} from "../_shared/booking.ts";
import {
  lessonNumber,
  normTitle,
  planMissing,
  titleForLesson,
  type Meeting,
} from "../_shared/cohort-sessions.ts";
import {
  COURSE_LESSONS,
  computeRefund,
  formatBani,
  type RefundBreakdown,
} from "../_shared/refund.ts";
import {
  computeGroupCancelRefund,
  type GroupCharge,
} from "../_shared/group-refund.ts";
import {
  GROUP_MONTHS,
  KIDS_GROUP_MONTHS,
  TRIAL_NO_SHOW_FEE_BANI,
} from "../_shared/prices.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";
import { notifyGoogleCancellations } from "../_shared/calendar-cancel-emails.ts";
import { verifyRegistrationSignature } from "../_shared/registration-access.ts";
import {
  countsAgainstPackage,
  packageNumbers,
} from "../_shared/package-lessons.ts";
import { syncPackageTitles } from "../_shared/package-titles.ts";

function jsonResponseWith(cors: Record<string, string>) {
  return (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
}

const allowedSenderDomains = [
  "centruldearabalibaneza.com",
  "notify.centruldearabalibaneza.com",
];

function isAllowedSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) &&
    allowedSenderDomains.includes(domain)
  );
}

/**
 * Everything computeRefund needs for one registration, read from the row, the
 * cohort it belongs to, and the real Stripe charge.
 *
 * `paidBani` deliberately comes from Stripe rather than the price table: a
 * student who paid before a price change, or on a hand-made discount, must be
 * refunded against what they actually paid.
 *
 * `lessonsTaken` is supplied by the admin, who knows how many lessons actually
 * happened. It defaults to 0, which is the generous reading — nothing consumed
 * — so a forgotten field can never refund a student less than they are owed.
 */
/**
 * Lessons whose Google Calendar event no longer says what the panel says.
 *
 * Bookings are written to Google and never read back: nothing in this project
 * notices when an event is moved or deleted there. So the owner edits a lesson
 * on his phone, the panel keeps showing the old hour, and the reminder goes out
 * on the old hour too. That was his complaint, and it is the half of the sync
 * that does not exist.
 *
 * This is the read-only half of the answer, and deliberately only that: it
 * compares and reports, and writes nothing. Pulling Google's times into
 * `bookings` automatically is a bigger decision than it looks -- a wrong match
 * would rewrite a real lesson's time -- and it should not ride in on a health
 * screen. Telling him what disagrees costs nothing and is most of the value.
 *
 * One paginated `events.list` over the window rather than one fetch per
 * booking: forty upcoming lessons would otherwise be forty round trips every
 * time the screen opens. `showDeleted` is on, because an event cancelled in
 * Google is exactly what we are looking for and is otherwise omitted.
 *
 * Failure is not an error here. If Google cannot be read, the health screen
 * still has everything else to say, so this returns null and the panel says it
 * could not check rather than showing nothing at all.
 */
async function calendarDrift(
  rows: Array<Record<string, unknown>>,
): Promise<null | Array<{
  id: string;
  student_name: string | null;
  booked_at: string;
  google_at: string | null;
  kind: "moved" | "cancelled_in_google" | "not_found";
}>> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) return null;

  const now = Date.now();
  // Only lessons still to come: a past lesson moved in Google needs no action,
  // and including them would make the list long and ignorable.
  const upcoming = rows.filter(
    (r) =>
      typeof r["google_event_id"] === "string" &&
      Date.parse(String(r["start_at"])) >= now,
  );
  if (upcoming.length === 0) return [];

  const gHeaders = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gcalKey,
    "Content-Type": "application/json",
  };
  // Wider than the lessons themselves, so an event moved a long way still
  // turns up as moved rather than as missing.
  const timeMin = new Date(now - 7 * 86_400_000).toISOString();
  const timeMax = new Date(now + 400 * 86_400_000).toISOString();

  const byId = new Map<string, { start?: string; status?: string }>();
  try {
    let pageToken: string | undefined;
    do {
      const qs = new URLSearchParams({
        singleEvents: "true",
        showDeleted: "true",
        orderBy: "startTime",
        timeMin,
        timeMax,
        maxResults: "250",
      });
      if (pageToken) qs.set("pageToken", pageToken);
      const res = await fetch(
        `${GCAL_GATEWAY}/calendars/primary/events?${qs}`,
        { headers: gHeaders },
      );
      if (!res.ok) {
        console.error("[calendar_drift] list failed", res.status);
        return null;
      }
      const page = await res.json();
      for (const ev of page.items ?? []) {
        if (typeof ev?.id === "string") {
          byId.set(ev.id, { start: ev?.start?.dateTime, status: ev?.status });
        }
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error("[calendar_drift] list threw", err);
    return null;
  }

  const out: Array<{
    id: string;
    student_name: string | null;
    booked_at: string;
    google_at: string | null;
    kind: "moved" | "cancelled_in_google" | "not_found";
  }> = [];
  for (const r of upcoming) {
    const eventId = String(r["google_event_id"]);
    const bookedAt = String(r["start_at"]);
    const ev = byId.get(eventId);
    if (!ev) {
      out.push({
        id: String(r["id"]),
        student_name: (r["student_name"] as string | null) ?? null,
        booked_at: bookedAt,
        google_at: null,
        kind: "not_found",
      });
      continue;
    }
    if (ev.status === "cancelled") {
      out.push({
        id: String(r["id"]),
        student_name: (r["student_name"] as string | null) ?? null,
        booked_at: bookedAt,
        google_at: null,
        kind: "cancelled_in_google",
      });
      continue;
    }
    // A minute of slack: Google returns its own offset format, and comparing
    // the instants rather than the strings is the only reliable way.
    if (
      ev.start &&
      Math.abs(Date.parse(ev.start) - Date.parse(bookedAt)) > 60_000
    ) {
      out.push({
        id: String(r["id"]),
        student_name: (r["student_name"] as string | null) ?? null,
        booked_at: bookedAt,
        google_at: new Date(Date.parse(ev.start)).toISOString(),
        kind: "moved",
      });
    }
  }
  return out;
}

/**
 * The trial no-show fee, refunded with the same button as a lesson payment
 * (owner's decision, 27 October 2026: case by case, on appeal). It is not a
 * course, so none of the course tiers apply: what is still unrefunded on the
 * fee's PaymentIntent goes back in full.
 */
async function noShowFeeRefundFor(
  stripe: Stripe,
  intentId: string,
): Promise<
  | {
      breakdown: Omit<RefundBreakdown, "tier"> & { tier: "no-show-fee" };
      paymentIntentId: string;
    }
  | { error: string }
> {
  const intent = await stripe.paymentIntents.retrieve(intentId);
  const paid = Number(intent.amount_received ?? 0);
  const remaining = paid - Number(intent.amount_refunded ?? 0);
  if (!paid) return { error: "Taxa de neprezentare nu a fost încasată" };
  if (remaining <= 0)
    return { error: "Taxa de neprezentare a fost deja rambursată integral" };
  return {
    paymentIntentId: intentId,
    breakdown: {
      tier: "no-show-fee",
      daysBeforeStart: null,
      pricePerLessonBani: 0,
      lessonsRemaining: 0,
      nonRefundableBani: 0,
      remainingValueBani: remaining,
      feeBani: 0,
      refundBani: remaining,
    },
  };
}

async function refundInputsFor(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  stripe: Stripe,
  reg: Record<string, unknown>,
  lessonsTaken: number,
): Promise<
  { breakdown: RefundBreakdown; paymentIntentId: string } | { error: string }
> {
  const sessionOrIntent = String(reg.stripe_session_id ?? "");
  if (!sessionOrIntent) return { error: "Nu s-a găsit plata Stripe asociată" };

  let paymentIntentId = sessionOrIntent;
  if (paymentIntentId.startsWith("cs_")) {
    const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
    const pi = session.payment_intent;
    paymentIntentId = typeof pi === "string" ? pi : (pi?.id ?? "");
  }
  if (!paymentIntentId) return { error: "Nu s-a găsit plata Stripe asociată" };

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  // amount_received is what actually cleared; amount is only what was asked for.
  const paidBani = Number(intent.amount_received ?? intent.amount ?? 0);
  if (!paidBani) return { error: "Plata Stripe nu are o sumă încasată" };

  const alreadyRefunded = Number(intent.amount_refunded ?? 0);
  if (alreadyRefunded >= paidBani)
    return { error: "Plata a fost deja rambursată integral" };

  // How many lessons the whole course holds, so a pro-rata share means something.
  const formType = String(reg.form_type ?? "");
  const level = String(reg.level ?? "").toUpperCase();
  let totalLessons: number;
  if (formType === "kids") {
    totalLessons = KIDS_GROUP_MONTHS * 8; // a kids "month" is 8 lessons, as for groups
  } else if (formType === "private") {
    totalLessons = Math.max(1, Number(reg.quantity ?? 1));
  } else {
    totalLessons = COURSE_LESSONS[level] ?? GROUP_MONTHS.A1 * 8;
  }

  // The start date decides which of the three tiers applies.
  let courseStartsAt: string | null = null;
  if (reg.cohort_id) {
    const { data: cohortData } = await supabase
      .from("group_cohorts")
      .select("start_date")
      .eq("id", reg.cohort_id)
      .maybeSingle();
    const cohort = cohortData as { start_date: string | null } | null;
    if (cohort?.start_date)
      courseStartsAt = `${cohort.start_date}T00:00:00.000Z`;
  }

  return {
    paymentIntentId,
    breakdown: computeRefund({
      paidBani,
      totalLessons,
      lessonsTaken,
      courseStartsAt,
    }),
  };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const jsonResponse = jsonResponseWith(corsHeaders);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      action,
      ids,
      id,
      lead_status,
      sender_name,
      sender_email,
      refund_reason,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "get_private_status") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Cerere invalidă" });
      }
      // Public status page: only a server-signed link may read the status.
      if (!(await verifyRegistrationSignature(id, body?.sig))) {
        return jsonResponse({ error: "Cererea nu a fost găsită" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        // No personal data here: this branch is public (status page link).
        .select("created_at, format, lead_status")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) {
        return jsonResponse({ error: "Cererea nu a fost găsită" });
      }

      return jsonResponse({ data: registration });
    }

    // Everything below is admin-only: require a real Supabase Auth session
    // (Google sign-in) whose email is in the ADMIN_EMAILS allowlist secret,
    // instead of a single shared password with no rate limiting or identity.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: userData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    const caller = userData?.user;
    // Only a confirmed, non-anonymous mailbox counts as proof of the admin address.
    const callerEmail =
      caller && caller.email_confirmed_at && !caller.is_anonymous
        ? caller.email?.trim().toLowerCase()
        : undefined;
    const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = !!callerEmail && adminEmails.includes(callerEmail);

    if (!isAdmin) {
      return jsonResponse({ error: "Neautorizat" });
    }

    if (action === "update_contact") {
      const contactName = typeof body.name === "string" ? body.name.trim() : "";
      const contactEmail =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const contactPhone =
        typeof body.phone === "string" ? body.phone.trim() : "";
      if (
        typeof id !== "string" ||
        !contactName ||
        contactName.length > 160 ||
        contactEmail.length > 254 ||
        (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) ||
        contactPhone.length > 40
      ) {
        return jsonResponse({ error: "Date de contact invalide." }, 400);
      }
      const { error } = await supabase.rpc(
        "admin_update_registration_contact",
        {
          p_id: id,
          p_name: contactName,
          p_email: contactEmail || null,
          p_phone: contactPhone || null,
          p_actor: callerEmail,
        },
      );
      if (error)
        return jsonResponse(
          {
            error: "Contactul nu a fost salvat. Reîncearcă.",
            code: "contact_update_failed",
          },
          500,
        );
      return jsonResponse({ success: true });
    }

    // PostgREST caps a read at one page. Use stable pages for admin totals
    // and the enrolment list rather than silently truncating older records.
    const readAll = async (
      table: string,
      fields: string,
      orderBy = "id",
      ascending = true,
    ) => {
      const data: Array<Record<string, any>> = [];
      for (let offset = 0; ; offset += 1000) {
        let query = supabase
          .from(table)
          .select(fields)
          .order(orderBy, { ascending });
        if (orderBy !== "id") query = query.order("id", { ascending: true });
        const result = await query.range(offset, offset + 999);
        if (result.error) throw result.error;
        const page = result.data ?? [];
        data.push(...page);
        if (page.length < 1000) return { data };
      }
    };

    // "L3/10": each private-package lesson's number in its package, by the
    // owner's rule (_shared/package-lessons.ts). Adds lesson_number and
    // package_total to the rows given (null when not a package lesson).
    const withPackageNumbers = async <
      T extends { id: string; registration_id?: string | null },
    >(
      rows: T[],
    ): Promise<
      Array<T & { lesson_number: number | null; package_total: number | null }>
    > => {
      const regIds = [
        ...new Set(
          rows.map((r) => r.registration_id).filter((x): x is string => !!x),
        ),
      ];
      const numbers = new Map<string, { n: number; total: number }>();
      for (let offset = 0; offset < regIds.length; offset += 100) {
        const ids = regIds.slice(offset, offset + 100);
        const [regRes, bookingRes] = await Promise.all([
          supabase
            .from("registrations")
            .select("id, quantity")
            .in("id", ids)
            .eq("form_type", "private"),
          supabase
            .from("bookings")
            .select(
              "id, registration_id, start_at, status, event_type_slug, trial_outcome",
            )
            .in("registration_id", ids),
        ]);
        if (regRes.error) throw regRes.error;
        if (bookingRes.error) throw bookingRes.error;
        for (const reg of regRes.data ?? []) {
          const own = (bookingRes.data ?? []).filter(
            (b) => b.registration_id === reg.id,
          );
          const nums = packageNumbers(own);
          const total = Math.max(
            Number.parseInt(String(reg.quantity ?? 1), 10) || 1,
            nums.size,
          );
          for (const [bookingId, n] of nums)
            numbers.set(bookingId, { n, total });
        }
      }
      return rows.map((r) => ({
        ...r,
        lesson_number: numbers.get(r.id)?.n ?? null,
        package_total: numbers.get(r.id)?.total ?? null,
      }));
    };

    // Lets the site tell an admin from a signed-in student (students have
    // accounts since October 2026): the game shows its teacher controls only
    // when this answers.
    if (action === "whoami") {
      return jsonResponse({ isAdmin: true });
    }

    // Student accounts: each student's saved Yalla progress (summary columns
    // only, not the full game state), with their registrations matched by
    // email so the owner sees a level next to a lead.
    if (action === "list_student_progress") {
      const { data: rows, error: rowsErr } = await supabase
        .from("student_progress")
        .select(
          "user_id, email, placement, xp, rounds, items_seen, last_played_at, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(500);
      if (rowsErr) {
        console.error(
          "[admin-registrations] list_student_progress failed",
          rowsErr,
        );
        return jsonResponse({
          error: "Nu am putut încărca progresul elevilor",
        });
      }
      const emails = Array.from(
        new Set(
          (rows ?? [])
            .map((r: { email: string | null }) => (r.email ?? "").toLowerCase())
            .filter(Boolean),
        ),
      );
      let regs: Array<{
        id: string;
        email: string | null;
        name: string;
        form_type: string;
        level: string | null;
        lead_status: string | null;
        payment_status: string | null;
        created_at: string;
      }> = [];
      if (emails.length) {
        const { data: regRows } = await supabase
          .from("registrations")
          .select(
            "id, email, name, form_type, level, lead_status, payment_status, created_at",
          )
          // Case-insensitive: a registration may have been typed "Maria@…".
          .or(
            emails
              .map((e) => `email.ilike.${e.replace(/([%_\\])/g, "\\$1")}`)
              .join(","),
          )
          .order("created_at", { ascending: false });
        regs = regRows ?? [];
      }
      const data = (rows ?? []).map((r: { email: string | null }) => ({
        ...r,
        registrations: regs.filter(
          (g) =>
            (g.email ?? "").toLowerCase() === (r.email ?? "").toLowerCase(),
        ),
      }));
      return jsonResponse({ data });
    }

    if (action === "list_capacities") {
      const { data, error } = await supabase
        .from("group_capacities")
        .select(
          "id, form_type, level, format, max_seats, min_seats, manual_offset",
        )
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("format", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "update_capacity") {
      const { id: capId, max_seats, min_seats, manual_offset } = body;
      if (typeof capId !== "string")
        return jsonResponse({ error: "ID invalid" });
      const max = Number(max_seats);
      const min = Number(min_seats);
      if (
        !Number.isInteger(max) ||
        !Number.isInteger(min) ||
        max < 1 ||
        min < 1 ||
        min > max
      ) {
        return jsonResponse({
          error: "Valori invalide (min ≤ max, ambele ≥ 1)",
        });
      }
      const update: Record<string, unknown> = {
        max_seats: max,
        min_seats: min,
        updated_at: new Date().toISOString(),
      };
      if (manual_offset !== undefined) {
        const off = Number(manual_offset);
        if (!Number.isInteger(off) || off < 0) {
          return jsonResponse({ error: "Manual offset invalid (≥ 0)" });
        }
        update.manual_offset = off;
      }
      const { data, error } = await supabase
        .from("group_capacities")
        .update(update)
        .eq("id", capId)
        .select(
          "id, form_type, level, format, max_seats, min_seats, manual_offset",
        )
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    // ============ Manual (external-source) signup counts ============
    if (action === "list_manual_signups") {
      const { data, error } = await supabase
        .from("manual_signups")
        .select("id, form_type, level, format, source, count, note, updated_at")
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("format", { ascending: true, nullsFirst: true })
        .order("source", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_manual_signup") {
      const { id: msId, form_type, level, format, source, count, note } = body;
      if (form_type !== "group" && form_type !== "kids") {
        return jsonResponse({ error: "Tip curs invalid" });
      }
      if (format != null && format !== "fizic" && format !== "online") {
        return jsonResponse({ error: "Format invalid" });
      }
      const n = Number(count);
      if (!Number.isInteger(n) || n < 0 || n > 1000) {
        return jsonResponse({ error: "Număr invalid (0–1000)" });
      }
      if (
        typeof source !== "string" ||
        source.trim().length === 0 ||
        source.length > 40
      ) {
        return jsonResponse({ error: "Sursă invalidă" });
      }
      // Auto-attach group manual signups to the level+format's single active
      // cohort so they count on the cohort card too, not just the level badge.
      // Ambiguous (0 or 2+ matching cohorts) → left unattached; counts at level.
      let cohortId: string | null = null;
      const rowLevel = form_type === "kids" ? null : level || null;
      const rowFormat = form_type === "kids" ? null : format || null;
      if (form_type === "group" && rowLevel && rowFormat) {
        const { data: matching } = await supabase
          .from("group_cohorts")
          .select("id")
          .eq("form_type", "group")
          .eq("level", rowLevel)
          .eq("format", rowFormat)
          .eq("is_active", true);
        if (matching && matching.length === 1) cohortId = matching[0].id;
      }
      const row = {
        form_type,
        level: rowLevel,
        format: rowFormat,
        cohort_id: cohortId,
        source: source.trim(),
        count: n,
        note:
          note != null && typeof note === "string" ? note.slice(0, 500) : null,
        updated_at: new Date().toISOString(),
      };
      let result;
      if (typeof msId === "string" && msId) {
        result = await supabase
          .from("manual_signups")
          .update(row)
          .eq("id", msId)
          .select(
            "id, form_type, level, format, source, count, note, updated_at",
          )
          .single();
      } else {
        result = await supabase
          .from("manual_signups")
          .insert(row)
          .select(
            "id, form_type, level, format, source, count, note, updated_at",
          )
          .single();
      }
      if (result.error) throw result.error;
      return jsonResponse({ success: true, data: result.data });
    }

    if (action === "delete_manual_signup") {
      const { id: msId } = body;
      if (typeof msId !== "string" || !msId)
        return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase
        .from("manual_signups")
        .delete()
        .eq("id", msId);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============ Blog CMS (override model) ============
    // A published row replaces the code-shipped article on the public site;
    // deleting the row reverts the article to its code version.
    if (action === "list_blog_articles") {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("slug, title_ro, is_published, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "get_blog_article") {
      const { slug } = body;
      if (typeof slug !== "string" || !/^[a-z0-9-]{3,120}$/.test(slug)) {
        return jsonResponse({ error: "Slug invalid" });
      }
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_blog_article") {
      const {
        slug,
        title_ro,
        title_en,
        description_ro,
        description_en,
        lead_ro,
        lead_en,
        body_ro,
        body_en,
        reading_minutes,
        is_published,
      } = body;
      if (typeof slug !== "string" || !/^[a-z0-9-]{3,120}$/.test(slug)) {
        return jsonResponse({
          error: "Slug invalid (litere mici, cifre, cratime)",
        });
      }
      const str = (v: unknown, max: number) =>
        typeof v === "string" ? v.slice(0, max) : "";
      const mins = Number(reading_minutes);
      const row = {
        slug,
        title_ro: str(title_ro, 200),
        title_en: str(title_en, 200),
        description_ro: str(description_ro, 300),
        description_en: str(description_en, 300),
        lead_ro: str(lead_ro, 500),
        lead_en: str(lead_en, 500),
        body_ro: str(body_ro, 100_000),
        body_en: str(body_en, 100_000),
        reading_minutes:
          Number.isInteger(mins) && mins >= 1 && mins <= 60 ? mins : 5,
        is_published: is_published === true,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("blog_articles")
        .upsert(row, { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_blog_article") {
      const { slug } = body;
      if (typeof slug !== "string" || !slug)
        return jsonResponse({ error: "Slug invalid" });
      const { error } = await supabase
        .from("blog_articles")
        .delete()
        .eq("slug", slug);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "upload_blog_media") {
      const { file_name, content_type, data_base64 } = body;
      if (
        typeof file_name !== "string" ||
        typeof content_type !== "string" ||
        typeof data_base64 !== "string"
      ) {
        return jsonResponse({ error: "Fișier invalid" });
      }
      const okType =
        /^(image\/(png|jpe?g|webp|gif|avif)|audio\/(mpeg|mp4|ogg|wav|webm))$/.test(
          content_type,
        );
      if (!okType)
        return jsonResponse({
          error:
            "Doar imagini (png/jpg/webp/gif/avif) sau audio (mp3/m4a/ogg/wav)",
        });
      // ~8 MB decoded cap keeps uploads reasonable for web use.
      if (data_base64.length > 11_000_000)
        return jsonResponse({ error: "Fișier prea mare (max ~8 MB)" });
      const bytes = Uint8Array.from(atob(data_base64), (c) => c.charCodeAt(0));
      const safeName = file_name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-")
        .slice(-80);
      const path = `${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("blog-media")
        .upload(path, bytes, {
          contentType: content_type,
          upsert: false,
        });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from("blog-media")
        .getPublicUrl(path);
      return jsonResponse({ success: true, url: pub.publicUrl });
    }

    // ============ Free resources (lead magnets) ============
    if (action === "list_resources") {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_resource") {
      const {
        slug: rSlug,
        title_ro,
        title_en,
        description_ro,
        description_en,
        file_url,
        email_template,
        is_active,
        sort_order,
      } = body;
      if (typeof rSlug !== "string" || !/^[a-z0-9-]{3,120}$/.test(rSlug)) {
        return jsonResponse({
          error: "Slug invalid (litere mici, cifre, cratime)",
        });
      }
      const str = (v: unknown, max: number) =>
        typeof v === "string" ? v.slice(0, max) : "";
      const order = Number(sort_order);
      const { data, error } = await supabase
        .from("resources")
        .upsert(
          {
            slug: rSlug,
            title_ro: str(title_ro, 200),
            title_en: str(title_en, 200),
            description_ro: str(description_ro, 500),
            description_en: str(description_en, 500),
            file_url: str(file_url, 500),
            email_template: str(email_template, 120),
            is_active: is_active !== false,
            sort_order: Number.isFinite(order) ? Math.trunc(order) : 0,
          },
          { onConflict: "slug" },
        )
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_resource") {
      const { slug: rSlug } = body;
      if (typeof rSlug !== "string" || !rSlug)
        return jsonResponse({ error: "Slug invalid" });
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("slug", rSlug);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "upload_resource_file") {
      const { file_name, data_base64 } = body;
      if (typeof file_name !== "string" || typeof data_base64 !== "string") {
        return jsonResponse({ error: "Fișier invalid" });
      }
      if (!/\.pdf$/i.test(file_name))
        return jsonResponse({ error: "Doar fișiere PDF" });
      // ~15 MB decoded cap.
      if (data_base64.length > 21_000_000)
        return jsonResponse({ error: "Fișier prea mare (max ~15 MB)" });
      const bytes = Uint8Array.from(atob(data_base64), (c) => c.charCodeAt(0));
      const safeName = file_name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-")
        .slice(-80);
      const path = `resurse/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("blog-media")
        .upload(path, bytes, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from("blog-media")
        .getPublicUrl(path);
      return jsonResponse({ success: true, url: pub.publicUrl });
    }

    // ============ Site CMS: texts + page contents ============
    if (action === "list_site_texts") {
      const { data, error } = await supabase
        .from("site_texts")
        .select("*")
        .order("key", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    /**
     * Yalla card corrections.
     *
     * The teacher edits cards inside the game, which stores them in that
     * browser only. These actions promote a correction to the shared overlay
     * in yalla_card_overrides, which every learner's game reads at start-up.
     *
     * save_card_overrides takes the whole set rather than one card at a time,
     * and deletes what is missing from it. That makes the published state a
     * mirror of what the teacher sees: removing a correction in the workspace
     * removes it for students, instead of leaving an orphan nobody can find.
     */
    if (action === "save_card_overrides") {
      const { edits } = body;
      if (!edits || typeof edits !== "object" || Array.isArray(edits)) {
        return jsonResponse({ error: "Corecturi invalide" });
      }
      const str = (v: unknown, max: number) =>
        typeof v === "string" ? v.trim().slice(0, max) : "";
      const rows: {
        card_id: string;
        ar: string;
        ro: string;
        variants: string[];
      }[] = [];
      for (const [card_id, raw] of Object.entries(
        edits as Record<string, unknown>,
      )) {
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(card_id)) {
          return jsonResponse({
            error: `Identificator de card invalid: ${card_id.slice(0, 40)}`,
          });
        }
        const v = raw as { ar?: unknown; ro?: unknown; variants?: unknown };
        const ar = str(v?.ar, 500);
        const ro = str(v?.ro, 1000);
        // The table rejects blanks too; refusing here names the offending card
        // instead of surfacing a constraint violation.
        if (!ar || !ro)
          return jsonResponse({ error: `Card incomplet: ${card_id}` });
        const variants = Array.isArray(v?.variants)
          ? (v.variants as unknown[])
              .map((x) => str(x, 500))
              // A card's own form is never a variant of itself: the game
              // filters it too, and leaving it in matches on the wrong branch.
              .filter((x) => x && x !== ar)
              .slice(0, 30)
          : [];
        rows.push({ card_id, ar, ro, variants });
      }
      if (rows.length > 5000)
        return jsonResponse({
          error: "Prea multe corecturi într-o singură cerere",
        });

      const keep = rows.map((r) => r.card_id);
      if (rows.length) {
        const { error } = await supabase
          .from("yalla_card_overrides")
          .upsert(rows, { onConflict: "card_id" });
        if (error) throw error;
      }
      // Drop anything the teacher has since reverted.
      const del = supabase.from("yalla_card_overrides").delete();
      const { error: delError } = keep.length
        ? await del.not(
            "card_id",
            "in",
            `(${keep.map((k) => `"${k}"`).join(",")})`,
          )
        : await del.neq("card_id", "");
      if (delError) throw delError;
      return jsonResponse({ success: true, count: rows.length });
    }

    if (action === "list_card_overrides") {
      const { data, error } = await supabase
        .from("yalla_card_overrides")
        .select("card_id, ar, ro, variants, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_site_text") {
      const { key, value_ro, value_en } = body;
      if (typeof key !== "string" || !/^[A-Za-z0-9_.-]{1,200}$/.test(key)) {
        return jsonResponse({ error: "Cheie invalidă" });
      }
      const str = (v: unknown) =>
        typeof v === "string" ? v.slice(0, 8000) : "";
      const { data, error } = await supabase
        .from("site_texts")
        .upsert(
          { key, value_ro: str(value_ro), value_en: str(value_en) },
          { onConflict: "key" },
        )
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_site_text") {
      const { key } = body;
      if (typeof key !== "string" || !key)
        return jsonResponse({ error: "Cheie invalidă" });
      const { error } = await supabase
        .from("site_texts")
        .delete()
        .eq("key", key);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "list_page_contents") {
      const { data, error } = await supabase
        .from("page_contents")
        .select("*")
        .order("path", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_page_content") {
      const {
        path,
        meta_title,
        meta_description,
        h1,
        lead,
        body_md,
        faq,
        is_published,
      } = body;
      if (typeof path !== "string" || !/^\/[A-Za-z0-9/_-]{0,200}$/.test(path)) {
        return jsonResponse({ error: "Cale invalidă (ex: /arabizi)" });
      }
      const str = (v: unknown, max: number) =>
        typeof v === "string" ? v.slice(0, max) : "";
      const faqClean = Array.isArray(faq)
        ? faq
            .filter((f) => f && typeof f === "object")
            .slice(0, 30)
            .map((f: Record<string, unknown>) => ({
              q: str(f.q, 300),
              a: str(f.a, 2000),
            }))
            .filter((f) => f.q && f.a)
        : [];
      const { data, error } = await supabase
        .from("page_contents")
        .upsert(
          {
            path,
            meta_title: str(meta_title, 200),
            meta_description: str(meta_description, 400),
            h1: str(h1, 300),
            lead: str(lead, 1000),
            body_md: str(body_md, 200000),
            faq: faqClean,
            is_published: is_published !== false,
          },
          { onConflict: "path" },
        )
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_page_content") {
      const { path } = body;
      if (typeof path !== "string" || !path)
        return jsonResponse({ error: "Cale invalidă" });
      const { error } = await supabase
        .from("page_contents")
        .delete()
        .eq("path", path);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // Read-only course overview. Occupancy remains owned by the existing RPC;
    // payment counts only describe registrations with recorded payment states.
    if (action === "course_overview") {
      const [cohorts, registrations, manual, occupancy] = await Promise.all([
        readAll(
          "group_cohorts",
          "id,form_type,course_type,title_ro,level,format,age_category,teaching_language,start_date,end_date,schedule_label_ro,status,max_seats,manual_offset",
        ),
        readAll(
          "registrations",
          "cohort_id,payment_status,refunded_at,lead_status",
        ),
        readAll("manual_signups", "cohort_id,count"),
        supabase.rpc("get_cohort_signup_counts"),
      ]);
      if (occupancy.error) throw occupancy.error;
      const seats = new Map(
        (occupancy.data ?? []).map(
          (r: { cohort_id: string; taken: number }) => [
            r.cohort_id,
            Number(r.taken),
          ],
        ),
      );
      const data = (cohorts.data ?? []).map((c) => {
        const regs = (registrations.data ?? []).filter(
          (r) => r.cohort_id === c.id,
        );
        const payments: Record<string, number> = {};
        for (const r of regs) {
          const state = r.refunded_at
            ? "refunded"
            : r.payment_status || "unspecified";
          payments[state] = (payments[state] ?? 0) + 1;
        }
        return {
          ...c,
          taken:
            seats.has(c.id) && Number.isFinite(seats.get(c.id))
              ? seats.get(c.id)
              : null,
          registration_count: regs.length,
          incomplete_count: regs.filter((r) => r.lead_status === "incomplete")
            .length,
          manual_signup_count: (manual.data ?? [])
            .filter((r) => r.cohort_id === c.id)
            .reduce((sum: number, r) => sum + Number(r.count), 0),
          payments,
        };
      });
      return jsonResponse({ data });
    }

    // ============ Group cohorts ============
    if (action === "list_cohorts") {
      const { data, error } = await supabase
        .from("group_cohorts")
        .select(
          "id, form_type, level, format, teaching_language, break_note_ro, break_note_en, end_date_is_estimate, start_date, schedule_label_ro, schedule_label_en, max_seats, is_active, status, sort_order, manual_offset, age_category, course_type, slug, title_ro, title_en, price_lei, end_date, session_count, total_hours, image_url, content",
        )
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: true })
        .order("start_date", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    // A student added by hand (WhatsApp, TikTok, a phone call…): a real
    // registration in the exact group, so they take a seat, show in the list
    // and get the group's emails. Paid → converted; not paid yet → qualified
    // (both hold a place — see get_cohort_signup_counts).
    if (action === "add_manual_registration") {
      const MANUAL_SOURCES = [
        "whatsapp",
        "tiktok",
        "instagram",
        "direct",
        "telefon",
        "other",
      ];
      const PAY_METHODS = ["cash", "transfer", "card", "paypal"];
      const {
        name,
        phone,
        email,
        cohort_id: mCohort,
        source: mSource,
        paid,
        payment_method: method,
        notes: mNotes,
      } = body;
      const clean = (v: unknown, max: number) =>
        typeof v === "string" ? v.trim().slice(0, max) : "";
      const mName = clean(name, 200);
      const mPhone = clean(phone, 40);
      const mEmail = clean(email, 320);
      if (!mName) return jsonResponse({ error: "Numele e obligatoriu" });
      if (!mPhone) return jsonResponse({ error: "Telefonul e obligatoriu" });
      // Name, email, phone, course type and format on every registration,
      // the owner's tools included (owner's rule, 27 October 2026).
      if (!mEmail) return jsonResponse({ error: "Emailul e obligatoriu" });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mEmail))
        return jsonResponse({ error: "Email invalid" });
      if (typeof mSource !== "string" || !MANUAL_SOURCES.includes(mSource))
        return jsonResponse({ error: "Sursă invalidă" });
      if (typeof mCohort !== "string" || !mCohort)
        return jsonResponse({ error: "Alege grupa" });
      const isPaid = paid === true;
      if (
        isPaid &&
        (typeof method !== "string" || !PAY_METHODS.includes(method))
      ) {
        return jsonResponse({ error: "Alege cum a plătit" });
      }
      const { data: cohort } = await supabase
        .from("group_cohorts")
        .select("id, form_type, level, format, teaching_language")
        .eq("id", mCohort)
        .maybeSingle();
      if (!cohort) return jsonResponse({ error: "Grupa nu există" });
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          form_type: cohort.form_type === "kids" ? "kids" : "group",
          name: mName,
          phone: mPhone,
          email: mEmail || null,
          cohort_id: cohort.id,
          level: cohort.level,
          format: cohort.format,
          teaching_language: cohort.teaching_language,
          language: cohort.teaching_language,
          source: mSource,
          lead_status: isPaid ? "converted" : "qualified",
          // "unpaid", not "pending": the two are different states, and this
          // one has no payment in flight. "pending" is what the checkout
          // functions write once a Stripe session exists and the money is on
          // its way or awaiting confirmation. A student added here by hand has
          // started nothing — their first payment has not happened, and may
          // never happen, in which case they are charged the full price. That
          // is what "unpaid" means, and collapsing it into "pending" would
          // report money as in flight when nobody has tried to pay.
          payment_status: isPaid ? "paid" : "unpaid",
          paid_at: isPaid ? now : null,
          payment_method: isPaid ? method : null,
          notes: clean(mNotes, 2000) || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "upsert_cohort") {
      const {
        id: cId,
        form_type,
        level: cLevel,
        format: cFormat,
        teaching_language,
        break_note_ro,
        break_note_en,
        end_date_is_estimate,
        start_date,
        schedule_label_ro,
        schedule_label_en,
        max_seats,
        is_active,
        status,
        sort_order,
        manual_offset,
        // Course model (Phase 1 extension)
        age_category,
        course_type,
        slug,
        title_ro,
        title_en,
        price_lei,
        end_date,
        session_count,
        total_hours,
        image_url,
        content,
      } = body;
      if (!["group", "kids"].includes(form_type)) {
        return jsonResponse({ error: "Tip invalid (group/kids)" });
      }
      if (
        form_type === "group" &&
        cFormat != null &&
        cFormat !== "fizic" &&
        cFormat !== "online"
      ) {
        return jsonResponse({ error: "Format invalid (fizic/online)" });
      }
      if (
        teaching_language != null &&
        teaching_language !== "ro" &&
        teaching_language !== "en"
      ) {
        return jsonResponse({ error: "Limbă de predare invalidă (ro/en)" });
      }
      if (
        typeof start_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(start_date)
      ) {
        return jsonResponse({ error: "Data invalidă (YYYY-MM-DD)" });
      }
      const max = Number(max_seats);
      if (!Number.isInteger(max) || max < 1) {
        return jsonResponse({ error: "Locuri invalide" });
      }
      // Mirrors the group_cohorts_online_max_seats constraint, so the admin
      // sees a sentence rather than a raw constraint violation.
      if (form_type === "group" && cFormat === "online" && max > 6) {
        return jsonResponse({ error: "Grupele online au maximum 6 locuri" });
      }
      // In-person groups: at most 8 (group_cohorts_fizic_max_seats).
      if (cFormat === "fizic" && max > 8) {
        return jsonResponse({ error: "Grupele fizice au maximum 8 locuri" });
      }
      const ALLOWED_COHORT_STATUSES = [
        "draft",
        "forming",
        "minimum_reached",
        "confirmed",
        "full",
        "in_progress",
        "completed",
        "cancelled",
      ];
      const intOrNull = (v: unknown) =>
        v === "" ||
        v === null ||
        v === undefined ||
        !Number.isInteger(Number(v)) ||
        Number(v) < 0
          ? null
          : Number(v);
      const trimOrNull = (v: unknown) =>
        typeof v === "string" && v.trim() ? v.trim() : null;
      const payload: Record<string, unknown> = {
        form_type,
        level: form_type === "kids" ? null : cLevel || null,
        format: form_type === "kids" ? null : cFormat || null,
        // Which language the class is explained in. Students are only offered
        // cohorts matching registrations.language, so an unset value must fall
        // back to 'ro' — every cohort so far is Romanian-taught, and a null
        // here would hide the cohort from everyone.
        teaching_language: teaching_language === "en" ? "en" : "ro",
        // The exact holiday break is agreed with each group, so this is free
        // text rather than a date range, and end_date_is_estimate lets the site
        // say "estimated" instead of stating an end it may not meet.
        break_note_ro: trimOrNull(break_note_ro),
        break_note_en: trimOrNull(break_note_en),
        end_date_is_estimate: end_date_is_estimate === true,
        start_date,
        schedule_label_ro:
          typeof schedule_label_ro === "string" ? schedule_label_ro : "",
        schedule_label_en:
          typeof schedule_label_en === "string" ? schedule_label_en : "",
        max_seats: max,
        is_active: is_active !== false,
        sort_order: Number.isInteger(Number(sort_order))
          ? Number(sort_order)
          : 0,
        // Course model (Phase 1 extension)
        age_category: ["adulti", "adolescenti", "copii"].includes(age_category)
          ? age_category
          : form_type === "kids"
            ? "copii"
            : "adulti",
        course_type: course_type === "privat" ? "privat" : "grup",
        slug: trimOrNull(slug),
        title_ro: trimOrNull(title_ro),
        title_en: trimOrNull(title_en),
        price_lei: intOrNull(price_lei),
        end_date:
          typeof end_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(end_date)
            ? end_date
            : null,
        session_count: intOrNull(session_count),
        total_hours: intOrNull(total_hours),
        image_url: trimOrNull(image_url),
        content:
          content && typeof content === "object" && !Array.isArray(content)
            ? content
            : {},
      };
      if (
        typeof status === "string" &&
        ALLOWED_COHORT_STATUSES.includes(status)
      ) {
        payload.status = status;
      }
      if (manual_offset !== undefined) {
        const off = Number(manual_offset);
        if (!Number.isInteger(off) || off < 0) {
          return jsonResponse({ error: "Manual offset invalid (≥ 0)" });
        }
        payload.manual_offset = off;
      }
      if (typeof cId === "string" && cId) {
        const { data: before } = await supabase
          .from("group_cohorts")
          .select("status")
          .eq("id", cId)
          .maybeSingle();
        const { data, error } = await supabase
          .from("group_cohorts")
          .update(payload)
          .eq("id", cId)
          .select()
          .single();
        if (error) throw error;

        // "Minim atins": tell this group's students it starts for sure, the
        // moment the owner sets it — the owner's rule is that a group is
        // confirmed as soon as half its places are taken. Only on the change
        // itself, and each student once (idempotency key per cohort+student),
        // so saving the group again sends nothing.
        let notified = 0;
        if (
          data &&
          data.status === "minimum_reached" &&
          before?.status !== "minimum_reached"
        ) {
          const { data: regs } = await supabase
            .from("registrations")
            .select("id, name, email, language, teaching_language")
            .eq("cohort_id", cId)
            .not("email", "is", null)
            // The students who hold a place — the same rule as the seat count
            // (get_cohort_signup_counts): qualified or converted, not refunded.
            .in("lead_status", ["qualified", "converted"])
            .is("refunded_at", null);
          for (const r of regs ?? []) {
            const lang =
              (r.teaching_language || r.language) === "en" ? "en" : "ro";
            const startDateLabel = data.start_date
              ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Europe/Bucharest",
                }).format(new Date(`${data.start_date}T12:00:00Z`))
              : undefined;
            try {
              const res = await sendTemplateEmail("group-confirmed", r.email, {
                idempotencyKey: `group-confirmed-${cId}-${r.id}`,
                templateData: {
                  language: lang,
                  name: r.name,
                  level: data.level,
                  format: data.format,
                  startDateLabel,
                  scheduleLabel:
                    lang === "en"
                      ? data.schedule_label_en
                      : data.schedule_label_ro,
                },
              });
              if (res.sent) notified++;
            } catch (e) {
              console.error(
                `[admin-registrations] group-confirmed email failed for ${r.id}`,
                e,
              );
            }
          }
        }
        return jsonResponse({ success: true, data, notified });
      }
      const { data, error } = await supabase
        .from("group_cohorts")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_cohort") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase
        .from("group_cohorts")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============ Kids weekly slots ============
    if (action === "list_kids_slots") {
      const { data, error } = await supabase
        .from("kids_class_slots")
        .select(
          "id, weekday, start_time, duration_min, format, location, max_seats, is_active, sort_order",
        )
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_kids_slot") {
      const {
        id: sId,
        weekday,
        start_time,
        duration_min,
        format: kFormat,
        location,
        max_seats,
        is_active,
        sort_order,
      } = body;
      const wd = Number(weekday);
      if (!Number.isInteger(wd) || wd < 1 || wd > 7) {
        return jsonResponse({ error: "Zi invalidă (1-7)" });
      }
      if (
        typeof start_time !== "string" ||
        !/^\d{2}:\d{2}(:\d{2})?$/.test(start_time)
      ) {
        return jsonResponse({ error: "Oră invalidă" });
      }
      if (!["online", "physical"].includes(kFormat)) {
        return jsonResponse({ error: "Format invalid" });
      }
      const max = Number(max_seats);
      const dur = Number(duration_min);
      if (
        !Number.isInteger(max) ||
        max < 1 ||
        !Number.isInteger(dur) ||
        dur < 15
      ) {
        return jsonResponse({ error: "Locuri/durată invalide" });
      }
      const payload = {
        weekday: wd,
        start_time,
        duration_min: dur,
        format: kFormat,
        location: typeof location === "string" ? location.trim() || null : null,
        max_seats: max,
        is_active: is_active !== false,
        sort_order: Number.isInteger(Number(sort_order))
          ? Number(sort_order)
          : 0,
      };
      if (typeof sId === "string" && sId) {
        const { data, error } = await supabase
          .from("kids_class_slots")
          .update(payload)
          .eq("id", sId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }
      const { data, error } = await supabase
        .from("kids_class_slots")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_kids_slot") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase
        .from("kids_class_slots")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "list_availability_rules") {
      const { data, error } = await supabase
        .from("availability_rules")
        .select("id, weekday, start_time, end_time, is_active, event_type_slug")
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_availability_rule") {
      const {
        id: ruleId,
        weekday,
        start_time,
        end_time,
        is_active,
        event_type_slug,
      } = body;
      // null / "" = general hours; a slug = hours for that lesson type only.
      const ruleSlug =
        typeof event_type_slug === "string" && event_type_slug
          ? event_type_slug
          : null;
      const wd = Number(weekday);
      if (!Number.isInteger(wd) || wd < 0 || wd > 6) {
        return jsonResponse({ error: "Weekday invalid" });
      }
      if (typeof start_time !== "string" || typeof end_time !== "string") {
        return jsonResponse({ error: "Ore invalide" });
      }
      if (start_time >= end_time) {
        return jsonResponse({
          error: "Ora de început trebuie să fie înainte de ora de final",
        });
      }
      const payload = {
        weekday: wd,
        start_time,
        end_time,
        is_active: is_active !== false,
        event_type_slug: ruleSlug,
        updated_at: new Date().toISOString(),
      };
      if (typeof ruleId === "string" && ruleId) {
        const { data, error } = await supabase
          .from("availability_rules")
          .update(payload)
          .eq("id", ruleId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }
      const { data, error } = await supabase
        .from("availability_rules")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    // The rest of Disponibilitate (owner's request, 13 October 2026): each
    // lesson type's booking limits and in-person days, and days off.
    if (action === "list_booking_settings") {
      const [{ data: types, error: tErr }, { data: daysOff, error: bErr }] =
        await Promise.all([
          supabase
            .from("booking_event_types")
            .select(
              "slug, name_ro, duration_min, buffer_before_min, buffer_after_min, min_notice_hours, max_advance_days, physical_weekdays, is_active",
            )
            .order("slug", { ascending: true }),
          supabase
            .from("availability_blackouts")
            .select("id, start_date, end_date, note")
            .gte("end_date", new Date().toISOString().slice(0, 10))
            .order("start_date", { ascending: true }),
        ]);
      if (tErr) throw tErr;
      if (bErr) throw bErr;
      return jsonResponse({
        data: { event_types: types ?? [], blackouts: daysOff ?? [] },
      });
    }

    if (action === "update_event_type_rules") {
      const slug = typeof body.slug === "string" ? body.slug : "";
      const int = (v: unknown, min: number, max: number) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= min && n <= max ? n : null;
      };
      const minNotice = int(body.min_notice_hours, 0, 24 * 14);
      const maxAdvance = int(body.max_advance_days, 1, 365);
      const before = int(body.buffer_before_min, 0, 120);
      const after = int(body.buffer_after_min, 0, 120);
      const days =
        body.physical_weekdays === null
          ? null
          : Array.isArray(body.physical_weekdays)
            ? Array.from(
                new Set(
                  (body.physical_weekdays as unknown[])
                    .map(Number)
                    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
                ),
              ).sort()
            : undefined;
      if (
        !slug ||
        minNotice === null ||
        maxAdvance === null ||
        before === null ||
        after === null ||
        days === undefined
      ) {
        return jsonResponse({ error: "Valori invalide." }, 400);
      }
      if (days && days.length === 0)
        return jsonResponse(
          { error: "Alege cel puțin o zi pentru lecțiile la centru." },
          400,
        );
      const { data, error } = await supabase
        .from("booking_event_types")
        .update({
          min_notice_hours: minNotice,
          max_advance_days: maxAdvance,
          buffer_before_min: before,
          buffer_after_min: after,
          physical_weekdays: days,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug)
        .select("slug");
      if (error) throw error;
      if (!data?.length)
        return jsonResponse({ error: "Tipul de lecție nu există." }, 404);
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "update_event_type_rules",
        details: {
          slug,
          min_notice_hours: minNotice,
          max_advance_days: maxAdvance,
          buffer_before_min: before,
          buffer_after_min: after,
          physical_weekdays: days,
        },
      });
      return jsonResponse({ success: true });
    }

    if (action === "add_blackout") {
      const start = typeof body.start_date === "string" ? body.start_date : "";
      const end =
        typeof body.end_date === "string" && body.end_date
          ? body.end_date
          : start;
      const note =
        typeof body.note === "string"
          ? body.note.trim().slice(0, 200) || null
          : null;
      const valid = (d: string) =>
        /^\d{4}-\d{2}-\d{2}$/.test(d) &&
        Number.isFinite(Date.parse(`${d}T00:00:00Z`));
      if (!valid(start) || !valid(end) || end < start)
        return jsonResponse(
          { error: "Alege data de început și de sfârșit." },
          400,
        );
      const { data, error } = await supabase
        .from("availability_blackouts")
        .insert({ start_date: start, end_date: end, note })
        .select("id, start_date, end_date, note")
        .single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "add_blackout",
        details: { start, end, note },
      });
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_blackout") {
      if (typeof id !== "string")
        return jsonResponse({ error: "ID invalid" }, 400);
      const { error } = await supabase
        .from("availability_blackouts")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "delete_blackout",
        details: { id },
      });
      return jsonResponse({ success: true });
    }

    if (action === "delete_availability_rule") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase
        .from("availability_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "repair_booking_calendar") {
      if (typeof id !== "string")
        return jsonResponse({ error: "ID invalid" }, 400);
      const { data: booking, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (
        error ||
        !booking ||
        booking.status !== "confirmed" ||
        Date.parse(booking.start_at) < Date.now()
      )
        return jsonResponse(
          { error: "Lecția nu este disponibilă pentru reparare." },
          400,
        );
      if (
        booking.google_event_id &&
        booking.google_sync_error !== "calendar_create_pending"
      )
        return jsonResponse({ success: true });
      const result = await repairBookingCalendar(supabase, booking, {
        lovableKey: Deno.env.get("LOVABLE_API_KEY"),
        calendarKey: Deno.env.get("GOOGLE_CALENDAR_API_KEY"),
      });
      await supabase.from("audit_logs").insert({
        actor: callerEmail,
        action: "repair_booking_calendar",
        registration_id: booking.registration_id,
        details: { booking_id: id, event_id: result.event_id },
      });
      return jsonResponse({ success: true });
    }

    // The owner names the student for one unmatched Google event; the lesson is
    // then linked to that event. Never automatic (AGENTS/plan: unmatched events
    // are not assigned to guessed students).
    if (action === "import_calendar_event") {
      const b = body as Record<string, unknown>;
      const eventId = typeof b.event_id === "string" ? b.event_id.trim() : "";
      const name =
        typeof b.student_name === "string" ? b.student_name.trim() : "";
      const email =
        typeof b.student_email === "string"
          ? b.student_email.trim().toLowerCase()
          : "";
      const phone =
        typeof b.student_phone === "string" && b.student_phone.trim()
          ? b.student_phone.trim()
          : null;
      const quantity = Math.max(
        1,
        Math.min(60, Number.parseInt(String(b.quantity ?? 1), 10) || 1),
      );
      if (!eventId || eventId.length > 1024)
        return jsonResponse({ error: "Eveniment invalid." }, 400);
      if (name.length < 2 || name.length > 160)
        return jsonResponse({ error: "Numele este obligatoriu." }, 400);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254)
        return jsonResponse({ error: "Emailul nu este valid." }, 400);
      // Optional on purpose (owner, 27 October 2026): a lesson imported from
      // Google is one he already arranged with the student himself, and a
      // Google event carries no phone number.
      if (phone && phone.length > 40)
        return jsonResponse({ error: "Telefonul nu este valid." }, 400);
      try {
        const out = await importCalendarEvent(
          supabase,
          {
            lovableKey: Deno.env.get("LOVABLE_API_KEY"),
            calendarKey: Deno.env.get("GOOGLE_CALENDAR_API_KEY"),
            zoomUrl: Deno.env.get("ZOOM_MEETING_URL"),
          },
          {
            eventId,
            name,
            email,
            phone,
            quantity,
            paid: b.paid === true,
            format: b.format === "physical" ? "physical" : "online",
          },
        );
        await supabase.from("audit_logs").insert({
          actor: callerEmail,
          action: "import_calendar_event",
          registration_id: out.registration_id,
          details: {
            event_id: eventId,
            at: out.start_at,
            quantity,
            paid: b.paid === true,
          },
        });
        return jsonResponse({ success: true, ...out });
      } catch (failure) {
        return jsonResponse(
          {
            error:
              failure instanceof Error ? failure.message : "Importul a eșuat.",
          },
          400,
        );
      }
    }

    if (action === "sync_calendar") {
      const from =
        typeof body.from === "string"
          ? body.from
          : new Date(Date.now() - 7 * 86400000).toISOString();
      const to =
        typeof body.to === "string"
          ? body.to
          : new Date(Date.now() + 400 * 86400000).toISOString();
      if (
        !Number.isFinite(Date.parse(from)) ||
        !Number.isFinite(Date.parse(to)) ||
        Date.parse(to) <= Date.parse(from) ||
        Date.parse(to) - Date.parse(from) > 410 * 86400000
      )
        return jsonResponse({ error: "Interval invalid." }, 400);
      const result = await reconcileCalendar(supabase, {
        lovableKey: Deno.env.get("LOVABLE_API_KEY"),
        calendarKey: Deno.env.get("GOOGLE_CALENDAR_API_KEY"),
        zoomUrl: Deno.env.get("ZOOM_MEETING_URL"),
        from,
        to,
      });
      // Lessons deleted in Google: the student and the owner are told, the
      // same as when the scheduled sync finds them. No refund is made.
      await notifyGoogleCancellations(result.cancelledInGoogle);
      return jsonResponse({
        success: result.errors.length === 0,
        data: result,
      });
    }

    // The owner's word on a free trial: came (done), excused (the trial stays
    // available) or lost (it counts as used). null clears it back to the
    // automatic rule (done 24h after the lesson). Only for trial bookings
    // that already took place or were cancelled.
    if (action === "set_trial_outcome") {
      const outcome =
        body.outcome === null
          ? null
          : typeof body.outcome === "string"
            ? body.outcome
            : undefined;
      if (
        typeof id !== "string" ||
        (outcome !== null &&
          !["done", "excused", "lost"].includes(outcome ?? ""))
      ) {
        return jsonResponse({ error: "Rezultat invalid." }, 400);
      }
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select(
          "id, registration_id, event_type_slug, status, start_at, trial_outcome",
        )
        .eq("id", id)
        .maybeSingle();
      if (bErr || !booking || booking.event_type_slug !== "trial")
        return jsonResponse({ error: "Proba nu a fost găsită." }, 400);
      const started = Date.parse(booking.start_at) <= Date.now();
      if (outcome === "done" && (!started || booking.status === "cancelled")) {
        return jsonResponse(
          { error: "O probă se poate marca făcută doar după ce a avut loc." },
          400,
        );
      }
      if (outcome !== null && !started && booking.status !== "cancelled") {
        return jsonResponse({ error: "Proba nu a avut loc încă." }, 400);
      }
      const { error: uErr } = await supabase
        .from("bookings")
        .update({
          trial_outcome: outcome,
          trial_outcome_at: outcome ? new Date().toISOString() : null,
          trial_outcome_by: outcome ? callerEmail : null,
        })
        .eq("id", id);
      if (uErr) throw uErr;
      await supabase.from("audit_logs").insert({
        actor: callerEmail,
        action: "set_trial_outcome",
        registration_id: booking.registration_id,
        details: { booking_id: id, from: booking.trial_outcome, to: outcome },
      });
      return jsonResponse({ success: true, trial_outcome: outcome });
    }

    // The trial's no-show fee (owner's decision, 27 October 2026). Once the
    // owner has marked a trial as lost (a no-show or a cancellation under
    // 24 h), the card saved at booking can be charged 150 lei: the preview
    // shows the amount and the card, and the charge happens only on the
    // owner's confirmation. Off-session, on the saved payment method, with one
    // idempotency key per booking so a double click or a retry never charges
    // twice. A declined card is reported and nothing is marked paid. The fee
    // is recorded on the registration (no_show_fee_*), never in
    // payment_status, and the refund button can give it back.
    if (action === "preview_no_show_fee" || action === "charge_no_show_fee") {
      if (typeof id !== "string")
        return jsonResponse({ error: "ID invalid" }, 400);
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select(
          "id, registration_id, event_type_slug, status, start_at, trial_outcome, student_name",
        )
        .eq("id", id)
        .maybeSingle();
      if (bErr) throw bErr;
      if (!booking || booking.event_type_slug !== "trial")
        return jsonResponse({ error: "Proba nu a fost găsită." }, 400);
      if (booking.trial_outcome !== "lost")
        return jsonResponse(
          {
            error:
              "Taxa se încasează doar după ce marchezi proba „Pierdută” (nu a venit sau a anulat sub 24 de ore).",
          },
          400,
        );
      const { data: reg, error: rErr } = await supabase
        .from("registrations")
        .select(
          "id, email, stripe_session_id, no_show_fee_status, no_show_fee_booking_id, no_show_fee_intent_id, no_show_fee_error, no_show_fee_attempts",
        )
        .eq("id", booking.registration_id)
        .maybeSingle();
      if (rErr) throw rErr;
      if (!reg)
        return jsonResponse({ error: "Înscrierea nu a fost găsită." }, 400);
      if (
        reg.no_show_fee_status === "paid" ||
        reg.no_show_fee_status === "refunded"
      )
        return jsonResponse({
          success: true,
          data: {
            status: reg.no_show_fee_status,
            amount: TRIAL_NO_SHOW_FEE_BANI,
            amount_label: formatBani(TRIAL_NO_SHOW_FEE_BANI),
          },
        });

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });
      // The card saved by the trial's 0-lei setup session.
      const setupSessionId = String(reg.stripe_session_id ?? "");
      if (!setupSessionId.startsWith("cs_"))
        return jsonResponse(
          { error: "Nu există un card salvat pentru această probă." },
          400,
        );
      let customerId = "";
      let paymentMethodId = "";
      let cardLabel = "";
      try {
        const session = await stripe.checkout.sessions.retrieve(
          setupSessionId,
          { expand: ["setup_intent.payment_method"] },
        );
        const setup = session.setup_intent;
        const method =
          setup && typeof setup !== "string" ? setup.payment_method : null;
        paymentMethodId =
          typeof method === "string" ? method : (method?.id ?? "");
        customerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? "");
        if (method && typeof method !== "string" && method.card)
          cardLabel = `${method.card.brand} •••• ${method.card.last4}`;
      } catch (e) {
        console.error("[no_show_fee] card lookup failed", e);
      }
      if (!paymentMethodId || !customerId)
        return jsonResponse(
          { error: "Nu există un card salvat pentru această probă." },
          400,
        );

      if (action === "preview_no_show_fee") {
        return jsonResponse({
          success: true,
          data: {
            status: reg.no_show_fee_status ?? null,
            last_error: reg.no_show_fee_error ?? null,
            amount: TRIAL_NO_SHOW_FEE_BANI,
            amount_label: formatBani(TRIAL_NO_SHOW_FEE_BANI),
            card: cardLabel || null,
            student_name: booking.student_name,
          },
        });
      }

      let intent: Stripe.PaymentIntent | null = null;
      let failure = "";
      try {
        intent = await stripe.paymentIntents.create(
          {
            amount: TRIAL_NO_SHOW_FEE_BANI,
            currency: "ron",
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            description:
              "Taxă lecție de probă: neprezentare sau anulare sub 24 de ore",
            metadata: {
              registration_id: reg.id,
              booking_id: booking.id,
              purpose: "trial_no_show_fee",
            },
          },
          // Per booking and per attempt: the same attempt can never charge
          // twice, and a new attempt is only possible after a recorded decline.
          {
            idempotencyKey: `trial_no_show_fee_${booking.id}_${Number(reg.no_show_fee_attempts ?? 0)}`,
          },
        );
      } catch (e) {
        // A declined card, or one that needs the cardholder (3-D Secure),
        // throws here; nothing was charged.
        failure = e instanceof Error ? e.message : "Plata a fost refuzată.";
        console.error("[no_show_fee] charge failed", booking.id, e);
      }
      const ok = !!intent && intent.status === "succeeded";
      if (!ok && !failure)
        failure = `Plata nu s-a finalizat (${intent?.status ?? "necunoscut"}).`;
      const nowIso = new Date().toISOString();
      const { error: saveErr } = await supabase
        .from("registrations")
        .update(
          ok
            ? {
                no_show_fee_status: "paid",
                no_show_fee_booking_id: booking.id,
                no_show_fee_intent_id: intent!.id,
                no_show_fee_amount: TRIAL_NO_SHOW_FEE_BANI,
                no_show_fee_at: nowIso,
                no_show_fee_error: null,
              }
            : {
                no_show_fee_status: "failed",
                no_show_fee_booking_id: booking.id,
                no_show_fee_attempts: Number(reg.no_show_fee_attempts ?? 0) + 1,
                no_show_fee_intent_id: intent?.id ?? null,
                no_show_fee_at: nowIso,
                no_show_fee_error: failure.slice(0, 500),
              },
        )
        .eq("id", reg.id);
      if (saveErr)
        console.error("[no_show_fee] charge done but not saved", {
          registrationId: reg.id,
          intentId: intent?.id,
          saveErr,
        });
      await supabase.from("audit_logs").insert({
        actor: callerEmail,
        action: "charge_no_show_fee",
        registration_id: reg.id,
        details: {
          booking_id: booking.id,
          ok,
          intent_id: intent?.id ?? null,
          amount: TRIAL_NO_SHOW_FEE_BANI,
          error: ok ? null : failure,
        },
      });
      return jsonResponse(
        ok
          ? {
              success: true,
              data: {
                status: "paid",
                amount: TRIAL_NO_SHOW_FEE_BANI,
                amount_label: formatBani(TRIAL_NO_SHOW_FEE_BANI),
              },
            }
          : {
              success: false,
              error: `Cardul nu a putut fi debitat: ${failure} Taxa rămâne neîncasată.`,
              data: { status: "failed" },
            },
      );
    }

    // The owner's word on a package lesson (owner's rules, 26 October 2026):
    // excused ("scuzat") does not count against the package, lost
    // ("pierdută": no-show, late cancellation) does; null goes back to the
    // automatic rule (kept or taken counts, cancelled in time does not). Only
    // for lessons that already started, or were cancelled. Trials keep their
    // own action above.
    if (action === "set_lesson_outcome") {
      const outcome =
        body.outcome === null
          ? null
          : typeof body.outcome === "string"
            ? body.outcome
            : undefined;
      if (
        typeof id !== "string" ||
        (outcome !== null && !["excused", "lost"].includes(outcome ?? ""))
      ) {
        return jsonResponse({ error: "Rezultat invalid." }, 400);
      }
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select(
          "id, registration_id, event_type_slug, status, start_at, trial_outcome, student_name, student_email, language, appeal_at, appeal_decided_at",
        )
        .eq("id", id)
        .maybeSingle();
      if (bErr || !booking || booking.event_type_slug === "trial")
        return jsonResponse({ error: "Lecția nu a fost găsită." }, 400);
      if (booking.status === "rescheduled")
        return jsonResponse(
          { error: "Lecția a fost mutată; marchează lecția nouă." },
          400,
        );
      const started = Date.parse(booking.start_at) <= Date.now();
      if (outcome !== null && !started && booking.status !== "cancelled") {
        return jsonResponse({ error: "Lecția nu a avut loc încă." }, 400);
      }
      const { error: uErr } = await supabase
        .from("bookings")
        .update({
          trial_outcome: outcome,
          trial_outcome_at: outcome ? new Date().toISOString() : null,
          trial_outcome_by: outcome ? callerEmail : null,
        })
        .eq("id", id);
      if (uErr) throw uErr;
      await supabase.from("audit_logs").insert({
        actor: callerEmail,
        action: "set_lesson_outcome",
        registration_id: booking.registration_id,
        details: { booking_id: id, from: booking.trial_outcome, to: outcome },
      });
      await syncPackageTitles(supabase, booking.registration_id);

      // An open appeal is answered by this decision (owner's rule: within 24
      // hours), and the student hears it by email with what is left.
      if (booking.appeal_at && !booking.appeal_decided_at && outcome !== null) {
        const { data: decided } = await supabase
          .from("bookings")
          .update({
            appeal_decided_at: new Date().toISOString(),
            appeal_decision: outcome,
          })
          .eq("id", id)
          .is("appeal_decided_at", null)
          .select("id");
        if (decided?.length && booking.student_email) {
          let lessonsLeft: number | null = null;
          if (booking.registration_id) {
            const [{ data: reg }, { data: own }] = await Promise.all([
              supabase
                .from("registrations")
                .select("quantity")
                .eq("id", booking.registration_id)
                .maybeSingle(),
              supabase
                .from("bookings")
                .select("id, start_at, status, event_type_slug, trial_outcome")
                .eq("registration_id", booking.registration_id),
            ]);
            if (reg)
              lessonsLeft = Math.max(
                0,
                (Number.parseInt(String(reg.quantity ?? 1), 10) || 1) -
                  (own ?? []).filter((b) => countsAgainstPackage(b)).length,
              );
          }
          const lang = booking.language === "en" ? "en" : "ro";
          try {
            await sendTemplateEmail(
              "lesson-appeal-decision",
              booking.student_email,
              {
                templateData: {
                  name: booking.student_name,
                  whenLabel: new Intl.DateTimeFormat(
                    lang === "en" ? "en-GB" : "ro-RO",
                    {
                      timeZone: "Europe/Bucharest",
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  ).format(new Date(booking.start_at)),
                  accepted: outcome === "excused",
                  lessonsLeft,
                  lang,
                },
                idempotencyKey: `lesson-appeal-decision-${id}`,
              },
            );
          } catch (mailErr) {
            console.error(
              "[set_lesson_outcome] decision email failed",
              mailErr,
            );
          }
        }
      }

      return jsonResponse({
        success: true,
        outcome,
        counts: countsAgainstPackage({ ...booking, trial_outcome: outcome }),
      });
    }

    if (action === "list_bookings") {
      const { status_filter } = body;
      let q = supabase
        .from("bookings")
        .select(
          "id, registration_id, event_type_slug, start_at, end_at, student_name, student_email, student_phone, format, notes, status, meet_link, manage_token, created_at, cancelled_at, google_event_id, google_sync_error, trial_outcome, trial_outcome_at, trial_outcome_by, completed_by",
        )
        .order("start_at", { ascending: false })
        .limit(500);
      if (typeof status_filter === "string" && status_filter !== "all") {
        q = q.eq("status", status_filter);
      }
      const { data, error } = await q;
      if (error) throw error;
      return jsonResponse({ data: await withPackageNumbers(data ?? []) });
    }

    // ============ Google Calendar sync health ============
    // "Does the calendar actually work?" used to be answerable only by making a
    // real booking and looking at the calendar afterwards. This runs the same
    // calls the booking functions run, and reports what came back.
    if (action === "calendar_health") {
      const diag = await gcalDiagnose(body?.probe_write === true);

      const since = new Date(Date.now() - 180 * 86_400_000).toISOString();
      const { data: recent } = await supabase
        .from("bookings")
        .select(
          "id, start_at, created_at, student_name, status, google_event_id, google_sync_error",
        )
        .eq("status", "confirmed")
        .gte("start_at", since)
        .order("start_at", { ascending: false })
        .limit(200);

      const rows = recent ?? [];
      const feedToken = Deno.env.get("OWNER_CALENDAR_TOKEN") || "";
      const feedUrl = feedToken
        ? `${Deno.env.get("SUPABASE_URL")}/functions/v1/calendar-feed?token=${encodeURIComponent(feedToken)}`
        : null;

      return jsonResponse({
        data: {
          ...diag,
          bookings: {
            total: rows.length,
            synced: rows.filter(
              (r) => r.google_event_id && !r.google_sync_error,
            ).length,
            failed: rows.filter(
              (r) => !r.google_event_id || !!r.google_sync_error,
            ).length,
            // The six-month totals answer "what happened", and they were the
            // only thing this screen said. That made a run of failures last
            // August read as a fault happening now, months after the sync
            // started working again — three of four missing, printed every day,
            // for bookings whose events can never appear.
            //
            // "Is it working" is a different question and only recent attempts
            // can answer it. A booking syncs when it is made, so this counts by
            // created_at rather than by when the lesson falls.
            latest: (() => {
              const cutoff = Date.now() - 30 * 86_400_000;
              const madeLately = rows.filter(
                (r) => Date.parse(r.created_at as string) >= cutoff,
              );
              return {
                total: madeLately.length,
                synced: madeLately.filter(
                  (r) => r.google_event_id && !r.google_sync_error,
                ).length,
              };
            })(),
            unsynced: rows
              .filter((r) => !r.google_event_id || !!r.google_sync_error)
              .slice(0, 10)
              .map((r) => ({
                id: r.id,
                start_at: r.start_at,
                student_name: r.student_name,
                error: r.google_sync_error,
              })),
          },
          feed: { configured: !!feedToken, url: feedUrl },
          drift: await calendarDrift(rows),
        },
      });
    }

    // ============ Course requests ("notify me when the group starts") ============
    if (action === "list_course_requests") {
      const { data, error } = await supabase
        .from("course_requests")
        .select(
          "id, created_at, name, phone, email, level, format, preferred_language, lesson_type, status, notes",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return jsonResponse({ data });
    }

    // ============ Unified Student Journey ============
    // Returns each registration enriched with its bookings + payment + class info,
    // so the admin sees the full lifecycle in one place.
    if (action === "list_student_journey") {
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select(
          "id, created_at, form_type, name, email, phone, level, format, payment_status, paid_at, lead_status",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (regsError) throw regsError;

      const ids = (regs || []).map((r) => r.id);
      const bookingsByReg = new Map<string, Array<Record<string, unknown>>>();
      if (ids.length > 0) {
        const { data: bookings, error: bErr } = await supabase
          .from("bookings")
          .select(
            "id, registration_id, event_type_slug, start_at, end_at, status, format, meet_link, manage_token",
          )
          .in("registration_id", ids)
          .order("start_at", { ascending: true });
        if (bErr) throw bErr;
        for (const b of bookings || []) {
          const key = b.registration_id as string;
          const arr = bookingsByReg.get(key) ?? [];
          arr.push(b);
          bookingsByReg.set(key, arr);
        }
      }

      const now = Date.now();
      const enriched = (regs || []).map((r) => {
        const bookings = bookingsByReg.get(r.id) ?? [];
        const active = bookings.filter((b) => b.status === "confirmed");
        const nextBooking =
          active.find((b) => Date.parse(b.start_at as string) >= now) ?? null;
        const lastBooking = active.length ? active[active.length - 1] : null;
        const completed = active.some(
          (b) =>
            Date.parse((b.end_at as string) ?? (b.start_at as string)) < now,
        );
        return {
          ...r,
          bookings_count: bookings.length,
          confirmed_count: active.length,
          next_booking: nextBooking,
          last_booking: lastBooking,
          class_completed: completed,
        };
      });

      return jsonResponse({ data: enriched });
    }

    // ============ The worklist: what needs Ibra today ============
    /**
     * What the admin panel opens on.
     *
     * The home screen used to show four all-time totals and two all-time
     * funnels. "How many registrations have there ever been" is not why anyone
     * opens the panel in the morning, and since the Analiză tab exists it is
     * also a second, worse answer to a question that tab handles properly.
     *
     * So this returns work, not statistics: five lists, each one something
     * that may need an action today, each one already sorted into the order
     * you would deal with it.
     *
     * Read-only, and deliberately bounded — every list has a horizon or a
     * limit, because a worklist that grows without end is a report.
     */
    // ============ Calendar names of groups ============
    // Which name each group has in the owner's Google Calendar ("curs online
    // a1, grupa 1" → events "curs online a1, grupa 1 lectia 1", …). Chosen in
    // the admin, independent of how the group is titled on the website.
    if (action === "list_cohort_calendar") {
      const { data: groups, error: gErr } = await supabase
        .from("group_cohorts")
        .select(
          "id, form_type, age_category, level, format, start_date, status, title_ro, schedule_label_ro, session_count",
        )
        .eq("is_active", true)
        .in("form_type", ["group", "kids"])
        .not("status", "in", '("completed","cancelled")')
        .order("start_date", { ascending: true });
      if (gErr) throw gErr;
      const { data: links, error: lErr } = await supabase
        .from("cohort_calendar")
        .select("cohort_id, calendar_title, total_lessons, members");
      if (lErr) throw lErr;
      return jsonResponse({
        data: (groups ?? []).map((g: { id: string }) => ({
          ...g,
          link:
            (links ?? []).find(
              (l: { cohort_id: string }) => l.cohort_id === g.id,
            ) ?? null,
        })),
      });
    }

    if (action === "upsert_cohort_calendar") {
      const cohortId = typeof body.cohort_id === "string" ? body.cohort_id : "";
      const title =
        typeof body.calendar_title === "string"
          ? body.calendar_title.trim().slice(0, 120)
          : "";
      const total = Number(body.total_lessons);
      if (
        !cohortId ||
        !title ||
        !Number.isInteger(total) ||
        total < 1 ||
        total > 300
      ) {
        return jsonResponse({
          error: "Numele din calendar și numărul de lecții sunt obligatorii.",
        });
      }
      // The group's own students, invited to every lesson added for it.
      const members = Array.isArray(body.members)
        ? Array.from(
            new Set(
              (body.members as unknown[])
                .filter((e): e is string => typeof e === "string")
                .map((e) =>
                  e
                    .replace(/^mailto:/i, "")
                    .trim()
                    .toLowerCase(),
                )
                .filter(
                  (e) =>
                    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254,
                ),
            ),
          ).slice(0, 60)
        : undefined;
      const { error: upErr } = await supabase.from("cohort_calendar").upsert(
        {
          cohort_id: cohortId,
          calendar_title: title,
          total_lessons: total,
          ...(members ? { members } : {}),
        },
        { onConflict: "cohort_id" },
      );
      if (upErr) throw upErr;
      return jsonResponse({ success: true });
    }

    // Renames every lesson of a group in Google Calendar to the new name
    // ("<new name> - L<N>") and stores the new name. sendUpdates=none: guests'
    // calendars update quietly, nobody gets an email. Run right after a sync
    // under the old name, so every lesson of the group is known here.
    if (action === "rename_cohort_events") {
      const cohortId = typeof body.cohort_id === "string" ? body.cohort_id : "";
      const title =
        typeof body.calendar_title === "string"
          ? body.calendar_title.trim().slice(0, 120)
          : "";
      if (!cohortId || !title)
        return jsonResponse({ error: "Lipsește grupa sau numele." });
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
      if (!lovableKey || !gcalKey)
        return jsonResponse({ error: "Google Calendar nu e conectat." });
      const { data: sessions, error: sErr } = await supabase
        .from("cohort_sessions")
        .select("google_event_id, lesson_number")
        .eq("cohort_id", cohortId)
        .order("lesson_number", { ascending: true });
      if (sErr) throw sErr;
      let renamed = 0;
      const failed: number[] = [];
      for (const ses of sessions ?? []) {
        const res = await fetch(
          `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(ses.google_event_id)}?sendUpdates=none`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": gcalKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: `${title} - L${ses.lesson_number}`,
            }),
          },
        );
        if (res.ok) renamed += 1;
        else {
          failed.push(ses.lesson_number);
          console.error(
            "[rename_cohort_events] patch failed",
            res.status,
            await res.text(),
          );
        }
      }
      // Keep the old name if nothing could be renamed, so the next sync still finds them.
      if (renamed > 0 || (sessions ?? []).length === 0) {
        const { error: upErr } = await supabase
          .from("cohort_calendar")
          .update({ calendar_title: title })
          .eq("cohort_id", cohortId);
        if (upErr) throw upErr;
      }
      return jsonResponse({ success: failed.length === 0, renamed, failed });
    }

    // One group lesson moved or removed from the admin (owner's request,
    // 13 October 2026: the calendar works both ways). Google is changed first,
    // with the group's guests notified as for any moved or cancelled lesson;
    // the site follows only once Google accepted it, so the two never disagree.
    if (
      action === "move_cohort_session" ||
      action === "delete_cohort_session"
    ) {
      const sessionId = typeof body.id === "string" ? body.id : "";
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
      if (!sessionId) return jsonResponse({ error: "Lipsește lecția." }, 400);
      if (!lovableKey || !gcalKey)
        return jsonResponse({ error: "Google Calendar nu e conectat." });
      const { data: ses, error: sErr } = await supabase
        .from("cohort_sessions")
        .select("id, cohort_id, lesson_number, starts_at, google_event_id")
        .eq("id", sessionId)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!ses) return jsonResponse({ error: "Lecția nu mai există." }, 404);
      const url = `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(ses.google_event_id)}?sendUpdates=all`;
      const gHeaders = {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gcalKey,
        "Content-Type": "application/json",
      };
      if (action === "delete_cohort_session") {
        const res = await fetch(url, { method: "DELETE", headers: gHeaders });
        if (!res.ok && res.status !== 404 && res.status !== 410) {
          console.error(
            "[delete_cohort_session] google",
            res.status,
            await res.text(),
          );
          return jsonResponse({
            error: `Google Calendar a refuzat ștergerea (${res.status}). Nimic nu s-a schimbat.`,
          });
        }
        const { error: dErr } = await supabase
          .from("cohort_sessions")
          .delete()
          .eq("id", ses.id);
        if (dErr) throw dErr;
        await supabase.from("audit_logs").insert({
          actor: callerEmail!,
          action: "delete_cohort_session",
          details: {
            cohort_id: ses.cohort_id,
            lesson: ses.lesson_number,
            at: ses.starts_at,
          },
        });
        return jsonResponse({ success: true });
      }
      const startsAt = typeof body.starts_at === "string" ? body.starts_at : "";
      const endsAt = typeof body.ends_at === "string" ? body.ends_at : "";
      const startMs = Date.parse(startsAt),
        endMs = Date.parse(endsAt);
      if (
        !Number.isFinite(startMs) ||
        !Number.isFinite(endMs) ||
        endMs <= startMs ||
        endMs - startMs > 8 * 3_600_000
      ) {
        return jsonResponse({ error: "Ora nu este validă." }, 400);
      }
      const start = new Date(startMs).toISOString(),
        end = new Date(endMs).toISOString();
      const res = await fetch(url, {
        method: "PATCH",
        headers: gHeaders,
        body: JSON.stringify({
          start: { dateTime: start, timeZone: "Europe/Bucharest" },
          end: { dateTime: end, timeZone: "Europe/Bucharest" },
        }),
      });
      if (!res.ok) {
        console.error(
          "[move_cohort_session] google",
          res.status,
          await res.text(),
        );
        return jsonResponse({
          error: `Google Calendar a refuzat mutarea (${res.status}). Nimic nu s-a schimbat.`,
        });
      }
      const { error: uErr } = await supabase
        .from("cohort_sessions")
        .update({
          starts_at: start,
          ends_at: end,
          synced_at: new Date().toISOString(),
        })
        .eq("id", ses.id);
      if (uErr) throw uErr;
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "move_cohort_session",
        details: {
          cohort_id: ses.cohort_id,
          lesson: ses.lesson_number,
          from: ses.starts_at,
          to: start,
        },
      });
      return jsonResponse({ success: true, starts_at: start, ends_at: end });
    }

    if (action === "delete_cohort_calendar") {
      const cohortId = typeof body.cohort_id === "string" ? body.cohort_id : "";
      if (!cohortId) return jsonResponse({ error: "Lipsește grupa." });
      // Only the link and the lessons read from the calendar here; the
      // calendar itself is never touched.
      await supabase.from("cohort_sessions").delete().eq("cohort_id", cohortId);
      const { error: delErr } = await supabase
        .from("cohort_calendar")
        .delete()
        .eq("cohort_id", cohortId);
      if (delErr) throw delErr;
      return jsonResponse({ success: true });
    }

    // ============ Group lessons from Google Calendar ============
    /**
     * Reads the owner's lesson events ("<course> – Lecția N") for each running
     * group into cohort_sessions, and — only when asked — adds the lessons
     * still missing to the calendar on the group's weekly pattern, up to the
     * course's total. The calendar stays the source of truth: a lesson moved
     * or removed there (a break) is followed on the next sync, and the plan
     * for the rest always starts after the last lesson actually there.
     *
     * add_remaining: false = read only (and return the plan as a preview);
     * true = also create the planned events, for one group (cohort_id) or all;
     * lesson_numbers / lesson_limit narrow that to some lessons or the next N.
     * The new lessons invite the guests of the group's latest lesson plus any
     * extra_guests (a student who just joined), with Google's usual invite.
     */
    if (action === "sync_cohort_sessions") {
      const addRemaining = body.add_remaining === true;
      const onlyCohort =
        typeof body.cohort_id === "string" ? body.cohort_id : null;
      // Extra people to invite to the new lessons (a student who just joined),
      // on top of the guests already on the group's latest lesson.
      // Add only some of the missing lessons: these numbers, or the next N.
      const lessonNumbers: number[] = Array.isArray(body.lesson_numbers)
        ? (body.lesson_numbers as unknown[])
            .filter(
              (n): n is number => Number.isInteger(n) && (n as number) > 0,
            )
            .slice(0, 300)
        : [];
      const lessonLimit =
        Number.isInteger(body.lesson_limit) && body.lesson_limit > 0
          ? (body.lesson_limit as number)
          : 0;
      const extraGuests: string[] = Array.isArray(body.extra_guests)
        ? (body.extra_guests as unknown[])
            .filter((e): e is string => typeof e === "string")
            .map((e) => e.trim().toLowerCase())
            .filter(
              (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254,
            )
            .slice(0, 30)
        : [];
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
      if (!lovableKey || !gcalKey)
        return jsonResponse({ error: "Google Calendar nu e conectat." });
      const gHeaders = {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gcalKey,
        "Content-Type": "application/json",
      };

      // Active groups that have a calendar name (cohort_calendar): running
      // ones, and future ones whose lessons can be created ahead of time.
      let lq = supabase
        .from("cohort_calendar")
        .select("cohort_id, calendar_title, total_lessons, members");
      if (onlyCohort) lq = lq.eq("cohort_id", onlyCohort);
      const { data: links, error: lErr } = await lq;
      if (lErr) throw lErr;
      const { data: running, error: cErr } = await supabase
        .from("group_cohorts")
        .select(
          "id, start_date, status, format, days_of_week, start_time, end_time",
        )
        .in(
          "id",
          (links ?? []).map((l: { cohort_id: string }) => l.cohort_id),
        )
        .eq("is_active", true)
        .not("status", "in", '("completed","cancelled")');
      if (cErr) throw cErr;
      const cohorts = (running ?? []).map(
        (g: {
          id: string;
          start_date: string;
          format: string | null;
          days_of_week: number[] | null;
          start_time: string | null;
          end_time: string | null;
        }) => {
          const l = (links ?? []).find(
            (x: { cohort_id: string }) => x.cohort_id === g.id,
          )!;
          return {
            ...g,
            calendar_title: l.calendar_title,
            total_lessons: l.total_lessons,
            members: (l.members ?? []) as string[],
          };
        },
      );

      const localDate = (iso: string) =>
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Bucharest",
        }).format(new Date(iso));

      const results = [];
      for (const c of cohorts ?? []) {
        const prefix = c.calendar_title as string;
        // Every event of this group, one instance per lesson, oldest first.
        const timeMin = new Date(
          Date.parse(`${c.start_date}T00:00:00Z`) - 14 * 86_400_000,
        ).toISOString();
        const timeMax = new Date(
          Date.parse(`${c.start_date}T00:00:00Z`) + 2 * 365 * 86_400_000,
        ).toISOString();
        const events: Array<{
          id: string;
          summary?: string;
          start?: { dateTime?: string };
          end?: { dateTime?: string };
          location?: string;
          description?: string;
          conferenceData?: unknown;
          attendees?: Array<{
            email?: string;
            self?: boolean;
            resource?: boolean;
          }>;
        }> = [];
        let pageToken: string | undefined;
        // Google's search matches words; the plain words of the name find
        // every lesson whatever dashes and spaces the title was typed with.
        const q = normTitle(prefix);
        do {
          const qs = new URLSearchParams({
            q,
            singleEvents: "true",
            orderBy: "startTime",
            timeMin,
            timeMax,
            maxResults: "250",
          });
          if (pageToken) qs.set("pageToken", pageToken);
          const res = await fetch(
            `${GCAL_GATEWAY}/calendars/primary/events?${qs}`,
            { headers: gHeaders },
          );
          const page = await res.json();
          if (!res.ok) {
            console.error(
              "[sync_cohort_sessions] list failed",
              res.status,
              page,
            );
            return jsonResponse({
              error: `Google Calendar a refuzat citirea (${res.status}).`,
            });
          }
          events.push(...(page.items ?? []));
          pageToken = page.nextPageToken;
        } while (pageToken);

        const lessons = events
          .map((e) => ({ e, n: lessonNumber(e.summary, prefix) }))
          .filter(
            (x): x is { e: (typeof events)[number]; n: number } =>
              x.n !== null && !!x.e.start?.dateTime && !!x.e.end?.dateTime,
          );

        const rows = lessons.map(({ e, n }) => ({
          cohort_id: c.id,
          lesson_number: n,
          starts_at: new Date(e.start!.dateTime!).toISOString(),
          ends_at: new Date(e.end!.dateTime!).toISOString(),
          google_event_id: e.id,
          synced_at: new Date().toISOString(),
        }));
        if (rows.length) {
          const { error: upErr } = await supabase
            .from("cohort_sessions")
            .upsert(rows, { onConflict: "google_event_id" });
          if (upErr) throw upErr;
        }
        // Lessons removed from the calendar (a break, a cancellation) leave here too.
        const keep = rows.map((r) => r.google_event_id);
        let del = supabase
          .from("cohort_sessions")
          .delete()
          .eq("cohort_id", c.id);
        if (keep.length)
          del = del.not(
            "google_event_id",
            "in",
            `(${keep.map((k) => `"${k}"`).join(",")})`,
          );
        const { error: delErr } = await del;
        if (delErr) throw delErr;

        const last = lessons.reduce<(typeof lessons)[number] | null>(
          (a, b) =>
            !a ||
            b.n > a.n ||
            (b.n === a.n && b.e.start!.dateTime! > a.e.start!.dateTime!)
              ? b
              : a,
          null,
        );
        const { data: meetingRows } = await supabase
          .from("cohort_meetings")
          .select("weekday, start_time, end_time")
          .eq("cohort_id", c.id);
        const total = (c.total_lessons as number | null) ?? 0;
        // The weekly pattern: per-day meetings when the group has them, else
        // the single days/time pair every cohort carries.
        const meetings: Meeting[] =
          (meetingRows ?? []).length > 0
            ? ((meetingRows ?? []) as Meeting[])
            : c.start_time && c.end_time
              ? (c.days_of_week ?? []).map((weekday: number) => ({
                  weekday,
                  start_time: c.start_time as string,
                  end_time: c.end_time as string,
                }))
              : [];
        // Every missing lesson on its own slot, so lessons can be added one,
        // four or all at a time and each keeps its date (planMissing). For a
        // group with none yet, from its start date, lesson 1.
        // Never plan a started group from lesson 1: finding none of its lessons
        // means the name does not match the calendar, and creating L1… again
        // would duplicate the real ones.
        const todayLocal = localDate(new Date().toISOString());
        const canPlan = total > 0 && (!!last || c.start_date >= todayLocal);
        const nowMs = Date.now();
        const fullPlan = canPlan
          ? planMissing({
              lessons: lessons.map(({ e, n }) => ({
                n,
                date: localDate(e.start!.dateTime!),
              })),
              pastMax: lessons
                .filter(({ e }) => Date.parse(e.start!.dateTime!) < nowMs)
                .reduce((m, { n }) => Math.max(m, n), 0),
              meetings,
              total,
              startDate: c.start_date,
            })
          : [];
        // Which of them to add now: specific lessons, the next N, or all.
        const wanted = lessonNumbers.length
          ? fullPlan.filter((p) => lessonNumbers.includes(p.lesson_number))
          : lessonLimit > 0
            ? fullPlan.slice(0, lessonLimit)
            : fullPlan;
        const plan = addRemaining ? wanted : fullPlan;

        const created: number[] = [];
        // The owner (organizer) stays on the invitation, as on hand-made lessons.
        let ownerEmail =
          (last?.e.attendees ?? [])
            .find((a) => a.self && a.email)
            ?.email?.toLowerCase() ?? null;
        if (!ownerEmail) {
          const calRes = await fetch(`${GCAL_GATEWAY}/calendars/primary`, {
            headers: gHeaders,
          });
          const cal = await calRes.json().catch(() => ({}));
          if (calRes.ok && typeof cal.id === "string")
            ownerEmail = cal.id.toLowerCase();
        }
        // Who is invited: the group's own students (permanent, from the
        // admin), everyone already on its latest lesson, and the extra guests
        // for just these lessons.
        const guests = Array.from(
          new Set([
            ...c.members,
            ...(last?.e.attendees ?? [])
              .filter((a) => a.email && !a.self && !a.resource)
              .map((a) => a.email!.toLowerCase()),
            ...extraGuests,
          ]),
        ).filter((e) => e !== ownerEmail);
        const attendeeList = [
          ...(ownerEmail
            ? [
                {
                  email: ownerEmail,
                  organizer: true,
                  responseStatus: "accepted",
                },
              ]
            : []),
          ...guests.map((email) => ({ email })),
        ];
        // Online lessons always carry the Zoom link; no Google Meet is added.
        const zoomUrl = Deno.env.get("ZOOM_MEETING_URL") ?? "";
        const isOnline = c.format === "online";
        const baseDesc = last?.e.description ?? "";
        const description =
          isOnline && zoomUrl && !baseDesc.includes(zoomUrl)
            ? `${baseDesc ? baseDesc + "\n\n" : ""}Link Zoom: ${zoomUrl}`
            : baseDesc || undefined;
        const location =
          last?.e.location || (isOnline && zoomUrl ? zoomUrl : undefined);
        if (addRemaining && plan.length) {
          for (const p of plan) {
            const [y, mo, d] = p.date.split("-").map(Number);
            const [sh, sm] = p.start_time.split(":").map(Number);
            const [eh, em] = p.end_time.split(":").map(Number);
            const startISO = zonedToUtc(y, mo, d, sh, sm).toISOString();
            const endISO = zonedToUtc(y, mo, d, eh, em).toISOString();
            const res = await fetch(
              // Guests get Google's normal invitation, as they did for the
              // lessons the owner created by hand.
              `${GCAL_GATEWAY}/calendars/primary/events?sendUpdates=${guests.length ? "all" : "none"}`,
              {
                method: "POST",
                headers: gHeaders,
                body: JSON.stringify({
                  // Written like the group's latest lesson; for a new group,
                  // "<name> - L<N>" with the name chosen in the admin.
                  summary: last
                    ? titleForLesson(
                        last.e.summary ?? prefix,
                        last.n,
                        p.lesson_number,
                      )
                    : `${prefix} - L${p.lesson_number}`,
                  location,
                  description,
                  attendees: attendeeList,
                  start: { dateTime: startISO, timeZone: "Europe/Bucharest" },
                  end: { dateTime: endISO, timeZone: "Europe/Bucharest" },
                }),
              },
            );
            const ev = await res.json();
            if (!res.ok) {
              console.error(
                "[sync_cohort_sessions] create failed",
                res.status,
                ev,
              );
              break;
            }
            const { error: insErr } = await supabase
              .from("cohort_sessions")
              .insert({
                cohort_id: c.id,
                lesson_number: p.lesson_number,
                starts_at: startISO,
                ends_at: endISO,
                google_event_id: ev.id,
                source: "generated",
              });
            if (insErr) throw insErr;
            created.push(p.lesson_number);
          }
        }

        // Repair lessons the sync already created: add Zoom link + organizer,
        // drop any Google Meet. Quiet update, no new emails.
        const repaired: number[] = [];
        if (body.repair_generated === true) {
          const { data: gen } = await supabase
            .from("cohort_sessions")
            .select("lesson_number, google_event_id")
            .eq("cohort_id", c.id)
            .eq("source", "generated");
          for (const g of gen ?? []) {
            const ev = events.find((e) => e.id === g.google_event_id);
            if (!ev) continue;
            const keepGuests = (ev.attendees ?? [])
              .filter(
                (a) =>
                  a.email &&
                  !a.self &&
                  !a.resource &&
                  a.email.toLowerCase() !== ownerEmail,
              )
              .map((a) => ({ email: a.email!.toLowerCase() }));
            const evDesc = ev.description ?? "";
            const res = await fetch(
              `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(g.google_event_id)}?sendUpdates=none&conferenceDataVersion=1`,
              {
                method: "PATCH",
                headers: gHeaders,
                body: JSON.stringify({
                  description:
                    isOnline && zoomUrl && !evDesc.includes(zoomUrl)
                      ? `${evDesc ? evDesc + "\n\n" : ""}Link Zoom: ${zoomUrl}`
                      : evDesc,
                  location:
                    ev.location || (isOnline && zoomUrl ? zoomUrl : undefined),
                  ...(isOnline && zoomUrl ? { conferenceData: null } : {}),
                  attendees: [
                    ...(ownerEmail
                      ? [
                          {
                            email: ownerEmail,
                            organizer: true,
                            responseStatus: "accepted",
                          },
                        ]
                      : []),
                    ...keepGuests,
                  ],
                }),
              },
            );
            if (res.ok) repaired.push(g.lesson_number);
            else
              console.error(
                "[sync_cohort_sessions] repair failed",
                res.status,
                await res.text(),
              );
          }
        }

        results.push({
          cohort_id: c.id,
          calendar_title: prefix,
          total_lessons: total || null,
          found: rows.length,
          last_lesson: last
            ? { number: last.n, starts_at: last.e.start!.dateTime }
            : null,
          missing_meetings: meetings.length === 0,
          // Started, yet no lesson matched the name: the name needs checking.
          name_not_found: !last && c.start_date < todayLocal,
          start_date: c.start_date,
          guests,
          members: c.members,
          plan: addRemaining ? [] : fullPlan,
          created,
          repaired,
        });
      }

      console.log(
        "[sync_cohort_sessions]",
        callerEmail,
        addRemaining ? "add_remaining" : "read",
        results
          .map(
            (r) =>
              `${r.calendar_title}: ${r.found} found, ${r.created.length} created`,
          )
          .join("; "),
      );

      return jsonResponse({ data: results });
    }

    if (action === "list_today") {
      const now = Date.now();
      // "Today" starts at local midnight in Bucharest, not UTC midnight: at
      // 01:00 local in summer those are different days, and the lesson at 09:00
      // would drop off the list the owner is reading at breakfast.
      const p = utcToZonedParts(new Date(now));
      const dayStart = zonedToUtc(p.year, p.month, p.day, 0, 0).toISOString();
      const horizon = new Date(now + 2 * 86_400_000).toISOString();
      const staleAfter = new Date(now - 30 * 86_400_000).toISOString();

      const [
        { data: lessons, error: lessonErr },
        { data: uncontacted, error: uncErr },
        { data: unpaid, error: unpaidErr },
        { data: cohorts, error: cohortErr },
        { count: olderUnsynced },
      ] = await Promise.all([
        // Today and the next two days, so a Friday evening still shows Monday.
        supabase
          .from("bookings")
          .select(
            "id, registration_id, start_at, end_at, status, event_type_slug, format, student_name, student_email, student_phone, meet_link, notes, google_event_id, google_sync_error, manage_token",
          )
          .eq("status", "confirmed")
          .gte("start_at", dayStart)
          .lte("start_at", horizon)
          .order("start_at", { ascending: true }),
        // Nobody has said hello yet. Oldest first: the longest wait is the
        // most urgent, which is the opposite of how a list of leads usually
        // sorts itself.
        supabase
          .from("registrations")
          .select(
            "id, created_at, name, phone, email, form_type, format, level, language, lead_status",
          )
          .is("whatsapp_sent_at", null)
          .is("anonymized_at", null)
          // Being contacted is recorded two ways and only one of them was read
          // here. whatsapp_sent_at is set by the WhatsApp button; lead_status is
          // what the owner sets by hand from the list, and that is the one he
          // actually uses. Someone marked "Contactat" still had a null
          // whatsapp_sent_at, so this screen kept asking him to contact a person
          // he had already contacted and marked.
          //
          // So a lead is still waiting only while its status says nobody has
          // triaged it: "new", or "incomplete" (the form was started but no slot
          // was ever chosen, which is its own kind of chasing). Every other
          // status — contacted, qualified, converted, no_response, not_suitable,
          // spam — means a decision was made, and the screen must respect it.
          // A null status is an old row that predates the column and reads as new.
          .or("lead_status.is.null,lead_status.in.(new,incomplete)")
          .gte("created_at", staleAfter)
          .order("created_at", { ascending: true })
          .limit(50),
        // Said yes, never paid. A trial is free, so it is not in here — only
        // the course types that carry money.
        supabase
          .from("registrations")
          .select(
            "id, created_at, name, phone, email, form_type, level, format, payment_status, lead_status",
          )
          .in("form_type", ["group", "private", "kids"])
          // free: nothing is owed (a lesson given for free).
          .not("payment_status", "in", '("paid","refunded","free")')
          .is("anonymized_at", null)
          // Put aside with "Am vorbit cu el" until this date.
          .or(
            `followup_snoozed_until.is.null,followup_snoozed_until.lt."${new Date(now).toISOString()}"`,
          )
          .gte("created_at", staleAfter)
          .order("created_at", { ascending: true })
          .limit(50),
        // Starting within a fortnight. Deliberately no seat-fill number here:
        // "Grupe" already computes that from group_capacities including the
        // manual offset, and a second derivation would eventually disagree
        // with the first about the same cohort.
        supabase
          .from("group_cohorts")
          .select(
            "id, title_ro, title_en, level, format, start_date, status, teaching_language",
          )
          .eq("is_active", true)
          .gte("start_date", new Date(now).toISOString().slice(0, 10))
          .lte(
            "start_date",
            new Date(now + 14 * 86_400_000).toISOString().slice(0, 10),
          )
          .order("start_date", { ascending: true }),
        // Lessons already past that never reached the calendar. They are not
        // work any more — nobody can attend August retroactively — so they do
        // not belong in the worklist itself. But a backlog of them means the
        // sync is broken rather than unlucky, and Azi saying nothing at all
        // while "Sănătate calendar" reported three of four missing is how the
        // two screens came to contradict each other. A count is enough to send
        // the owner to the screen that explains it.
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmed")
          .is("google_event_id", null)
          // Thirty days, not the health screen's hundred and eighty. This
          // number answers "is the sync broken now", and only a recent failure
          // can say yes. Three lessons that failed last August are history: the
          // events will never appear, nobody can attend them retroactively, and
          // counting them here would put the same warning on this screen every
          // morning for six months until they aged out on their own. A warning
          // that never goes away is one the owner learns to ignore, which costs
          // more than the warning is worth. The long view belongs to "Sănătate
          // calendar", which is where you go to ask what the history looks like.
          .gte("start_at", new Date(now - 30 * 86_400_000).toISOString())
          .lt("start_at", dayStart),
      ]);
      if (lessonErr) throw lessonErr;
      if (uncErr) throw uncErr;
      if (unpaidErr) throw unpaidErr;
      // Someone the owner has given up on ("Nu mai răspunde", "Nepotrivit",
      // spam) is not chased for money either. Their registration stays where it
      // is, so a later request from them can be read against it. Filtered here
      // rather than in SQL: lead_status may be NULL, and NOT IN drops NULLs.
      const DROPPED_LEADS = ["no_response", "not_suitable", "spam"];
      const owing = (unpaid ?? []).filter(
        (r) => !DROPPED_LEADS.includes(r.lead_status as string),
      );
      if (cohortErr) throw cohortErr;

      const days = (iso: string) =>
        Math.floor((now - Date.parse(iso)) / 86_400_000);

      // Anything the system itself is unhappy about. A calendar event that
      // failed to sync is the one that bites: the lesson exists here and not
      // in the owner's calendar, so it is the lesson he does not turn up to.
      const problems: Array<{ kind: string; detail: string; id: string }> = [];
      // A lesson counts as a calendar problem when it has no event, not merely
      // when an error was recorded. Those are different failures: the sync can
      // fall over without ever writing google_sync_error — a dropped request, a
      // token that expired between the write and the retry — and that silent
      // case was the one nobody saw. "Sănătate calendar" has always asked
      // whether the event exists; this asks the same question, so the two
      // screens can no longer disagree about the same booking.
      for (const b of lessons ?? []) {
        if (!b.google_event_id || !!b.google_sync_error) {
          problems.push({
            kind: "calendar",
            id: b.id as string,
            detail: b.google_sync_error
              ? `${b.student_name}: ${b.google_sync_error}`
              : `${b.student_name}: lecția nu are eveniment în Google Calendar.`,
          });
        }
      }
      for (const r of owing) {
        if (r.payment_status === "failed" || r.payment_status === "past_due") {
          problems.push({
            kind: "payment",
            id: r.id as string,
            detail: `${r.name}: ${r.payment_status}`,
          });
        }
      }

      // Trials that ended in the last 24 hours and are not marked yet: after
      // 24 hours they count as done by themselves, so this is the window in
      // which "Nu a venit" still needs a click.
      const { data: trialsToMark, error: trialsErr } = await supabase
        .from("bookings")
        .select(
          "id, start_at, end_at, student_name, student_email, student_phone, format, trial_outcome",
        )
        .eq("event_type_slug", "trial")
        .eq("status", "confirmed")
        .is("trial_outcome", null)
        .lte("end_at", new Date(now).toISOString())
        .gte("end_at", new Date(now - 86_400_000).toISOString())
        .order("start_at", { ascending: true });
      if (trialsErr) throw trialsErr;

      // A refund records the money but leaves the lesson booked: lessons still
      // ahead for a fully refunded registration, for the owner to cancel
      // (never cancelled automatically).
      const { data: refundedRegs, error: refundedErr } = await supabase
        .from("registrations")
        .select("id")
        .eq("payment_status", "refunded")
        .limit(500);
      if (refundedErr) throw refundedErr;
      const refundedIds = (refundedRegs ?? []).map((r) => r.id as string);
      let refundedLessons: unknown[] = [];
      if (refundedIds.length) {
        const { data: rows, error: rowsErr } = await supabase
          .from("bookings")
          .select(
            "id, registration_id, start_at, end_at, student_name, student_email, format",
          )
          .in("registration_id", refundedIds)
          .eq("status", "confirmed")
          .gte("start_at", new Date(now).toISOString())
          .order("start_at", { ascending: true })
          .limit(50);
        if (rowsErr) throw rowsErr;
        refundedLessons = rows ?? [];
      }

      // Packages about to run out (owner's request, 26 October 2026): one
      // lesson left, or none, for a student who is still coming -- a lesson
      // ahead or one in the last 30 days -- so the owner offers the next
      // package in time. Counted by the owner's rule (package-lessons.ts).
      const { data: packageRegs, error: packageErr } = await supabase
        .from("registrations")
        .select("id, name, phone, quantity")
        .eq("form_type", "private")
        .in("payment_status", ["paid", "free"])
        .is("anonymized_at", null)
        .limit(1000);
      if (packageErr) throw packageErr;
      const lowPackages: Array<{
        id: string;
        name: string | null;
        phone: string | null;
        quantity: number;
        used: number;
        left: number;
        next_lesson_at: string | null;
      }> = [];
      const recent = now - 30 * 86_400_000;
      for (let offset = 0; offset < (packageRegs ?? []).length; offset += 100) {
        const chunk = (packageRegs ?? []).slice(offset, offset + 100);
        const { data: rows, error: rowsErr } = await supabase
          .from("bookings")
          .select(
            "id, registration_id, start_at, status, event_type_slug, trial_outcome",
          )
          .in(
            "registration_id",
            chunk.map((r) => r.id),
          );
        if (rowsErr) throw rowsErr;
        for (const reg of chunk) {
          const own = (rows ?? []).filter((b) => b.registration_id === reg.id);
          const counted = own.filter((b) => countsAgainstPackage(b));
          const quantity = Math.max(
            1,
            Number.parseInt(String(reg.quantity ?? 1), 10) || 1,
          );
          // A single hand-booked lesson is not a package to renew.
          if (quantity < 2) continue;
          const left = quantity - counted.length;
          if (left > 1) continue;
          const upcoming = own
            .filter(
              (b) => b.status === "confirmed" && Date.parse(b.start_at) >= now,
            )
            .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
          const stillComing =
            upcoming.length > 0 ||
            counted.some((b) => Date.parse(b.start_at) >= recent);
          if (!stillComing) continue;
          lowPackages.push({
            id: reg.id,
            name: reg.name,
            phone: reg.phone,
            quantity,
            used: counted.length,
            left: Math.max(0, left),
            next_lesson_at: upcoming[0]?.start_at ?? null,
          });
        }
      }

      // Students asking to reconsider a lesson counted as lost; the owner
      // answers within 24 hours (Scuzat / Pierdută).
      const { data: openAppeals, error: appealsErr } = await supabase
        .from("bookings")
        .select(
          "id, registration_id, start_at, end_at, status, event_type_slug, trial_outcome, student_name, student_phone, appeal_text, appeal_at",
        )
        .not("appeal_at", "is", null)
        .is("appeal_decided_at", null)
        .order("appeal_at", { ascending: true })
        .limit(50);
      if (appealsErr) throw appealsErr;

      return jsonResponse({
        data: {
          now: new Date(now).toISOString(),
          openAppeals: openAppeals ?? [],
          lessons: await withPackageNumbers(lessons ?? []),
          trialsToMark: trialsToMark ?? [],
          refundedLessons,
          lowPackages,
          uncontacted: (uncontacted ?? []).map((r) => ({
            ...r,
            waitingDays: days(r.created_at as string),
          })),
          unpaid: owing.map((r) => ({
            ...r,
            waitingDays: days(r.created_at as string),
          })),
          cohortsStartingSoon: cohorts ?? [],
          problems,
          olderUnsyncedLessons: olderUnsynced ?? 0,
        },
      });
    }

    // ============ Analytics over a time window ============
    /**
     * Everything else in the admin panel counts all of time: the four stat
     * cards, the trial funnel, the student journey. That makes "is this month
     * better than last month" unanswerable, which is the question an owner
     * actually asks.
     *
     * So this action is the time dimension, and only things the database knows
     * exactly. Deliberately not here:
     *   - Revenue. There is no amount column on `registrations`; a figure would
     *     have to be re-derived from cohort list prices times months, ignoring
     *     discounts, which is a guess dressed as a number. Refunds ARE exact
     *     (`refunded_amount`), so those are reported.
     *   - Cohort fill. `GroupOverview` already computes it from
     *     `group_capacities` including `manual_offset`; a second derivation
     *     here would eventually disagree with it about the same cohort.
     *   - Traffic and channels. That is Google Analytics' job (property
     *     G-F167Y815JL). `registrations.source` is only form / whatsapp /
     *     admin, which is how the row was created, not where the person came
     *     from — so it is reported as what it is and nothing more.
     */
    if (action === "list_analytics") {
      const days = Math.min(Math.max(Number(body?.days) || 90, 7), 730);
      const fromMs = Date.now() - days * 86_400_000;
      const fromISO = new Date(fromMs).toISOString();

      const [{ data: regs, error: regErr }, { data: books, error: bookErr }] =
        await Promise.all([
          supabase
            .from("registrations")
            .select(
              "id, created_at, form_type, format, level, language, source, referral_code, payment_status, paid_at, lead_status, refunded_amount, refunded_at",
            )
            .gte("created_at", fromISO)
            .is("anonymized_at", null),
          // Bookings are windowed on the lesson date, not the created date: the
          // question is how the lessons in this period went.
          supabase
            .from("bookings")
            .select(
              "id, created_at, start_at, status, event_type_slug, format, cancelled_at, original_booking_id",
            )
            .gte("start_at", fromISO),
        ]);
      if (regErr) throw regErr;
      if (bookErr) throw bookErr;

      const registrations = regs ?? [];
      const bookings = books ?? [];

      // Weekly buckets, keyed by the Monday of each ISO week in Bucharest time
      // so a bucket is a week as Ibra experiences it, not as UTC does.
      const weekKey = (iso: string) => {
        const p = utcToZonedParts(new Date(iso));
        const d = new Date(Date.UTC(p.year, p.month - 1, p.day));
        // getUTCDay: 0 = Sunday. Shift so Monday starts the week.
        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        return d.toISOString().slice(0, 10);
      };

      const weeks = new Map<string, Record<string, number>>();
      for (const r of registrations) {
        const k = weekKey(r.created_at as string);
        const row = weeks.get(k) ?? { total: 0 };
        row.total += 1;
        const ft = (r.form_type as string) || "other";
        row[ft] = (row[ft] ?? 0) + 1;
        weeks.set(k, row);
      }
      const signupsByWeek = [...weeks.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([week, counts]) => ({ week, ...counts }));

      const tally = (rows: Array<Record<string, unknown>>, field: string) => {
        const out: Record<string, number> = {};
        for (const r of rows) {
          const v = r[field];
          const k = typeof v === "string" && v.trim() ? v : "—";
          out[k] = (out[k] ?? 0) + 1;
        }
        return out;
      };

      // Days from sign-up to payment, median rather than mean: one person who
      // paid four months later would drag an average into fiction.
      const payLags = registrations
        .filter((r) => r.paid_at && r.created_at)
        .map(
          (r) =>
            (Date.parse(r.paid_at as string) -
              Date.parse(r.created_at as string)) /
            86_400_000,
        )
        .filter((d) => Number.isFinite(d) && d >= 0)
        .sort((a, b) => a - b);
      const median = (xs: number[]) =>
        xs.length === 0
          ? null
          : xs.length % 2
            ? xs[(xs.length - 1) / 2]
            : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2;

      const paid = registrations.filter(
        (r) => r.payment_status === "paid",
      ).length;
      const refunds = registrations.filter((r) => r.refunded_at);

      // A cancellation inside the 24-hour window, which booking-manage now
      // refuses: from here on these can only come from the admin panel, so the
      // count is a direct read on how often the rule has to be overridden.
      const lateCancels = bookings.filter(
        (b) =>
          b.status === "cancelled" &&
          b.cancelled_at &&
          Date.parse(b.start_at as string) -
            Date.parse(b.cancelled_at as string) <
            86_400_000,
      ).length;

      const byStatus = tally(bookings, "status");
      const trialBookings = bookings.filter(
        (b) => b.event_type_slug === "trial",
      );

      return jsonResponse({
        data: {
          range: { days, from: fromISO, to: new Date().toISOString() },
          signups: {
            total: registrations.length,
            byWeek: signupsByWeek,
            byFormType: tally(registrations, "form_type"),
            byFormat: tally(registrations, "format"),
            byLevel: tally(registrations, "level"),
            byLanguage: tally(registrations, "language"),
            bySource: tally(registrations, "source"),
            byReferral: tally(
              registrations.filter((r) => r.referral_code),
              "referral_code",
            ),
          },
          conversion: {
            registrations: registrations.length,
            paid,
            paidPercent: registrations.length
              ? Math.round((paid / registrations.length) * 100)
              : 0,
            byPaymentStatus: tally(registrations, "payment_status"),
            byLeadStatus: tally(registrations, "lead_status"),
            medianDaysToPay: median(payLags),
          },
          refunds: {
            count: refunds.length,
            // refunded_amount is stored in the smallest currency unit by Stripe
            // convention; the page divides, this does not, so the raw figure
            // stays inspectable.
            totalMinorUnits: refunds.reduce(
              (sum, r) => sum + (Number(r.refunded_amount) || 0),
              0,
            ),
          },
          lessons: {
            total: bookings.length,
            byStatus,
            byEventType: tally(bookings, "event_type_slug"),
            byFormat: tally(bookings, "format"),
            trials: trialBookings.length,
            rescheduled: bookings.filter((b) => b.original_booking_id).length,
            lateCancels,
          },
        },
      });
    }

    // ============ Trial → enrollment conversion funnel ============
    if (action === "list_trial_funnel") {
      // 1) All trial registrations
      const { data: trials, error: trialErr } = await supabase
        .from("registrations")
        .select("id, created_at, name, email, phone, lead_status")
        .eq("form_type", "trial")
        .order("created_at", { ascending: false })
        .limit(500);
      if (trialErr) throw trialErr;

      const trialIds = (trials ?? []).map((t) => t.id);
      const trialEmails = (trials ?? [])
        .map((t) => (t.email ?? "").toLowerCase())
        .filter(Boolean);

      // 2) Bookings tied to those trial registrations
      const bookingsByReg = new Map<
        string,
        { start_at: string; end_at: string; status: string }
      >();
      if (trialIds.length > 0) {
        const { data: bookings, error: bErr } = await supabase
          .from("bookings")
          .select("registration_id, start_at, end_at, status")
          .in("registration_id", trialIds);
        if (bErr) throw bErr;
        for (const b of bookings ?? []) {
          bookingsByReg.set(b.registration_id as string, {
            start_at: b.start_at as string,
            end_at: b.end_at as string,
            status: b.status as string,
          });
        }
      }

      // 3) Conversions = paid registrations (non-trial) with same email made
      //    AFTER the trial registration.
      const convertedEmails = new Map<
        string,
        { form_type: string; created_at: string }
      >();
      if (trialEmails.length > 0) {
        const { data: laterRegs, error: lErr } = await supabase
          .from("registrations")
          .select("email, form_type, created_at")
          .in("email", trialEmails)
          .neq("form_type", "trial")
          .order("created_at", { ascending: true });
        if (lErr) throw lErr;
        for (const r of laterRegs ?? []) {
          const key = (r.email ?? "").toLowerCase();
          if (!key) continue;
          if (!convertedEmails.has(key)) {
            convertedEmails.set(key, {
              form_type: r.form_type as string,
              created_at: r.created_at as string,
            });
          }
        }
      }

      const now = Date.now();
      const enriched = (trials ?? []).map((t) => {
        const booking = bookingsByReg.get(t.id) ?? null;
        const emailKey = (t.email ?? "").toLowerCase();
        const conversion = emailKey ? convertedEmails.get(emailKey) : undefined;
        const validConversion =
          conversion &&
          Date.parse(conversion.created_at) > Date.parse(t.created_at)
            ? conversion
            : null;
        const attended =
          booking?.status === "confirmed" && Date.parse(booking.end_at) < now;
        return {
          ...t,
          booked: !!booking && booking.status === "confirmed",
          booking_start_at: booking?.start_at ?? null,
          attended,
          converted: !!validConversion,
          converted_to: validConversion?.form_type ?? null,
          converted_at: validConversion?.created_at ?? null,
        };
      });

      const counts = {
        registered: enriched.length,
        booked: enriched.filter((r) => r.booked).length,
        attended: enriched.filter((r) => r.attended).length,
        converted: enriched.filter((r) => r.converted).length,
      };

      return jsonResponse({ data: enriched, counts });
    }

    /**
     * Change a lesson's length, format or notes from "Modifică lecția"
     * (owner's request, 14 October 2026). The time itself moves through
     * reschedule_booking, which the panel calls after this one. Google
     * Calendar is changed first (the student gets Google's update when the
     * length or the place changes); the site follows only once Google
     * accepted it. Notes are the owner's own and never leave the site.
     */
    if (action === "update_booking_details") {
      if (typeof id !== "string")
        return jsonResponse({ error: "ID invalid" }, 400);
      const { data: lesson, error: lErr } = await supabase
        .from("bookings")
        .select(
          "id, status, start_at, end_at, format, notes, meet_link, google_event_id",
        )
        .eq("id", id)
        .maybeSingle();
      if (lErr) throw lErr;
      if (!lesson) return jsonResponse({ error: "Programare negăsită" }, 404);
      const duration = Number(body.duration_min);
      const format =
        body.format === "physical"
          ? "physical"
          : body.format === "online"
            ? "online"
            : null;
      const notes =
        typeof body.notes === "string"
          ? body.notes.trim().slice(0, 2000) || null
          : null;
      if (
        !Number.isInteger(duration) ||
        duration < 15 ||
        duration > 240 ||
        !format
      ) {
        return jsonResponse(
          { error: "Durata (15–240 min) sau formatul nu sunt valide." },
          400,
        );
      }
      const endAt = new Date(
        Date.parse(lesson.start_at) + duration * 60_000,
      ).toISOString();
      const lengthChanged = Date.parse(endAt) !== Date.parse(lesson.end_at);
      const formatChanged = format !== lesson.format;
      if ((lengthChanged || formatChanged) && lesson.status !== "confirmed") {
        return jsonResponse(
          {
            error:
              "Doar o lecție programată își poate schimba durata sau formatul.",
          },
          409,
        );
      }
      const zoomUrl = Deno.env.get("ZOOM_MEETING_URL") ?? null;
      const meetLink =
        format === "online" ? (lesson.meet_link ?? zoomUrl) : null;
      if ((lengthChanged || formatChanged) && lesson.google_event_id) {
        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
        if (!lovableKey || !gcalKey)
          return jsonResponse({
            error: "Google Calendar nu e conectat. Nimic nu s-a schimbat.",
          });
        const patch: Record<string, unknown> = {};
        if (lengthChanged)
          patch.end = { dateTime: endAt, timeZone: "Europe/Bucharest" };
        if (formatChanged)
          patch.location =
            format === "online"
              ? (meetLink ?? "")
              : "Strada Icoanei 80, București";
        const res = await fetch(
          `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(lesson.google_event_id)}?sendUpdates=all`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": gcalKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patch),
          },
        );
        if (!res.ok) {
          console.error(
            "[update_booking_details] google",
            res.status,
            await res.text(),
          );
          return jsonResponse({
            error: `Google Calendar a refuzat schimbarea (${res.status}). Nimic nu s-a schimbat.`,
          });
        }
      }
      const { error: uErr } = await supabase
        .from("bookings")
        .update({ end_at: endAt, format, meet_link: meetLink, notes })
        .eq("id", lesson.id);
      if (uErr) throw uErr;
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "update_booking_details",
        details: {
          booking_id: lesson.id,
          duration_min: duration,
          format,
          notes_changed: notes !== lesson.notes,
        },
      });
      return jsonResponse({ success: true });
    }

    // late_by_student: the owner cancels inside the 24 hours at the student's
    // late request -- the lesson counts as lost against the package.
    if (action === "cancel_booking") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const lateByStudent =
        (body as { late_by_student?: unknown }).late_by_student === true;
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select("manage_token")
        .eq("id", id)
        .single();
      if (bErr || !booking)
        return jsonResponse({ error: "Programare negăsită" });
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-manage/${booking.manage_token}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            late_by_student: lateByStudent,
            by: callerEmail,
          }),
        },
      );
      const out = await resp.json().catch(() => ({}));
      if (!resp.ok || out?.error)
        return jsonResponse({ error: out?.error || "Anulare eșuată" });
      return jsonResponse({
        success: true,
        sync_pending: out?.sync_pending === true,
      });
    }

    /**
     * Move a student's lesson.
     *
     * The panel could cancel a booking and nothing else, so changing a time
     * meant cancelling and asking the student to book again -- or editing
     * Google Calendar by hand, which is the one direction that does not come
     * back into the panel. Both are worse than the thing that was missing.
     *
     * Routed through booking-manage with the service-role key, exactly as
     * cancel_booking is, so that one code path patches the calendar event in
     * place (keeping its Meet link), writes the new row with
     * original_booking_id, and sends the student and the owner their emails.
     * Nothing about bookings is reimplemented here.
     *
     * `force` is passed through: the first call reports what the new time
     * clashes with, or that it is outside the published hours, and only a
     * second call with force actually overrides it.
     */
    if (action === "reschedule_booking") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const newStart = (body as { start_at?: unknown }).start_at;
      if (
        typeof newStart !== "string" ||
        !Number.isFinite(Date.parse(newStart))
      ) {
        return jsonResponse({ error: "Ora nouă este invalidă." });
      }
      const force = (body as { force?: unknown }).force === true;
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select("manage_token, status, registration_id")
        .eq("id", id)
        .single();
      if (bErr || !booking)
        return jsonResponse({ error: "Programare negăsită" });
      if (booking.status !== "confirmed") {
        return jsonResponse({ error: "Programarea nu este activă." });
      }
      const regIdForBooking = booking.registration_id as string | null;
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-manage/${booking.manage_token}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ start_at: newStart, force }),
        },
      );
      const out = await resp.json().catch(() => ({}));
      if (!resp.ok || out?.error) {
        // The structured codes travel on, so the panel can name what clashes
        // and offer to do it anyway rather than showing "Mutare eșuată".
        return jsonResponse({
          error: out?.error || "Mutare eșuată",
          code: out?.code,
          clashes: out?.clashes ?? [],
          outside_availability: out?.outside_availability ?? false,
        });
      }
      // Moving someone's lesson is a change to their arrangements, so it goes
      // in the same trail as deletions and refunds. registration_id, not the
      // booking id, because that is the column the trail is keyed on and the
      // screen that reads it resolves names from it.
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "reschedule_booking",
        registration_id: regIdForBooking,
        details: { to: newStart, forced: force },
      });
      return jsonResponse({
        success: true,
        start_at: out?.start_at ?? newStart,
        sync_pending: out?.sync_pending === true,
      });
    }

    /**
     * Book a private lesson for someone, from the panel.
     *
     * The panel could add a manual signup to a group, and that was the only
     * way to put anybody anywhere. A private lesson has a time, so it could
     * not be added that way at all: the owner agrees an hour with someone on
     * WhatsApp and then has nowhere to record it, which is how a lesson ends
     * up only in Google Calendar and the panel never learns about it.
     *
     * Booked through booking-create with the service-role key, so the one
     * code path creates the calendar event with its Zoom or Meet link, sends
     * the student their confirmation and manage link, and promotes the lead.
     *
     * A fresh private registration is written for each of these rather than
     * attaching to an existing one. booking-create caps bookings at the
     * number of lessons the registration bought -- deliberately, so a
     * redelivered Stripe event cannot over-book a package -- and quietly
     * borrowing someone's unused lesson would make the money and the lessons
     * disagree. A booking the owner made by hand is its own arrangement, and
     * `payment_status` records whether it has been paid for.
     */
    // Private students the owner can book a lesson for: website purchases and
    // earlier hand-made bookings alike. Read-only; lessons_used counts by the
    // owner's rule (_shared/package-lessons.ts), the one booking-create caps by.
    if (action === "private_students") {
      const { data: regs } = await readAll(
        "registrations",
        "id,name,email,contact_email,phone,quantity,payment_status,lead_status,source,created_at,anonymized_at,form_type",
        "created_at",
        false,
      );
      const students = regs.filter(
        (r) => r.form_type === "private" && !r.anonymized_at,
      );
      const used = new Map<string, number>();
      for (let offset = 0; offset < students.length; offset += 100) {
        const ids = students.slice(offset, offset + 100).map((r) => r.id);
        const result = await supabase
          .from("bookings")
          .select(
            "id, registration_id, start_at, status, event_type_slug, trial_outcome",
          )
          .in("registration_id", ids);
        if (result.error) throw result.error;
        for (const row of result.data ?? [])
          if (countsAgainstPackage(row))
            used.set(
              row.registration_id,
              (used.get(row.registration_id) ?? 0) + 1,
            );
      }
      return jsonResponse({
        data: students.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.contact_email || r.email,
          phone: r.phone,
          quantity: Math.max(
            1,
            Number.parseInt(String(r.quantity ?? 1), 10) || 1,
          ),
          lessons_used: used.get(r.id) ?? 0,
          payment_status: r.payment_status,
          lead_status: r.lead_status,
          source: r.source,
          created_at: r.created_at,
        })),
      });
    }

    // A private student's package, for the card in their sheet: what was
    // bought, what is used by the owner's rule, and every lesson numbered.
    if (action === "package_lessons") {
      const regId = (body as { registration_id?: unknown }).registration_id;
      if (typeof regId !== "string")
        return jsonResponse({ error: "Cursant invalid." }, 400);
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .select("id, name, quantity, form_type, payment_status, format")
        .eq("id", regId)
        .maybeSingle();
      if (regErr) throw regErr;
      if (!reg || reg.form_type !== "private")
        return jsonResponse({ error: "Nu este un cursant privat." }, 400);
      const { data: rows, error: rowsErr } = await supabase
        .from("bookings")
        .select(
          "id, registration_id, start_at, end_at, status, event_type_slug, format, student_name, notes, meet_link, trial_outcome, completed_by",
        )
        .eq("registration_id", regId)
        .neq("status", "rescheduled")
        .order("start_at", { ascending: true });
      if (rowsErr) throw rowsErr;
      const lessons = await withPackageNumbers(rows ?? []);
      const quantity = Math.max(
        1,
        Number.parseInt(String(reg.quantity ?? 1), 10) || 1,
      );
      return jsonResponse({
        data: {
          registration_id: reg.id,
          name: reg.name,
          quantity,
          payment_status: reg.payment_status,
          used: lessons.filter((l) => countsAgainstPackage(l)).length,
          lessons,
        },
      });
    }

    if (action === "book_for_student") {
      const b = body as {
        registration_id?: unknown;
        student_name?: unknown;
        student_email?: unknown;
        student_phone?: unknown;
        start_at?: unknown;
        format?: unknown;
        notes?: unknown;
        quantity?: unknown;
        paid?: unknown;
        force?: unknown;
        language?: unknown;
        extra?: unknown;
        free?: unknown;
        quiet?: unknown;
      };
      const name =
        typeof b.student_name === "string" ? b.student_name.trim() : "";
      const email =
        typeof b.student_email === "string" ? b.student_email.trim() : "";
      const phone =
        typeof b.student_phone === "string" ? b.student_phone.trim() : "";
      const startAt = typeof b.start_at === "string" ? b.start_at : "";
      const format = b.format === "physical" ? "physical" : "online";
      const language = b.language === "en" ? "en" : "ro";
      const quantity = Math.max(
        1,
        Math.min(60, Number.parseInt(String(b.quantity ?? 1), 10) || 1),
      );
      const paid = b.paid === true;
      // A lesson the owner gives for free (a make-up lesson): nothing is owed.
      const free = b.free === true;
      const force = b.force === true;

      // An existing private student (a website purchase or an earlier
      // hand-made booking): the lesson goes on their own registration, so a
      // paid package is used lesson by lesson and booking-create's cap still
      // applies. Their stored details are used as they are; the account and
      // payment email on the registration is never changed here.
      // With extra=true the student's details are reused but the lesson gets a
      // registration of its own ("lecție în plus": the package is used up, or
      // the lesson is outside it), so nothing is retyped and the package stays
      // exactly what was bought.
      const extra = b.extra === true;
      let existing: {
        id: string;
        name: string;
        email: string;
        accountEmail: string;
        contactEmail: string | null;
        phone: string | null;
      } | null = null;
      if (
        b.registration_id !== undefined &&
        b.registration_id !== null &&
        b.registration_id !== ""
      ) {
        if (typeof b.registration_id !== "string")
          return jsonResponse({ error: "Cursant invalid." });
        const { data: reg, error: lookupErr } = await supabase
          .from("registrations")
          .select("id,name,email,contact_email,phone,form_type,anonymized_at")
          .eq("id", b.registration_id)
          .maybeSingle();
        if (
          lookupErr ||
          !reg ||
          reg.form_type !== "private" ||
          reg.anonymized_at
        ) {
          return jsonResponse({ error: "Cursantul nu a fost găsit." });
        }
        existing = {
          id: reg.id,
          name: reg.name ?? "",
          email: reg.contact_email || reg.email || "",
          accountEmail: reg.email || reg.contact_email || "",
          contactEmail: reg.contact_email || null,
          phone: reg.phone ?? null,
        };
      }
      const studentName = existing ? existing.name.trim() : name;
      const studentEmail = existing ? existing.email.trim() : email;
      const studentPhone = existing ? (existing.phone ?? "").trim() : phone;

      if (studentName.length < 2)
        return jsonResponse({ error: "Numele este obligatoriu." });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(studentEmail)) {
        return jsonResponse({ error: "Emailul nu este valid." });
      }
      // A new registration needs a phone too (owner's rule, 27 October 2026).
      // Booking onto an existing registration creates none, so it is not asked.
      if ((!existing || extra) && studentPhone.length < 3) {
        return jsonResponse({
          error: existing
            ? "Cursantul nu are telefon salvat. Adaugă-l din fișa lui, apoi programează."
            : "Telefonul este obligatoriu.",
        });
      }
      if (!Number.isFinite(Date.parse(startAt))) {
        return jsonResponse({ error: "Data sau ora nu sunt valide." });
      }

      const onExisting = existing !== null && !extra;
      const registrationId = onExisting ? existing!.id : crypto.randomUUID();
      const { error: regErr } = onExisting
        ? { error: null }
        : await supabase.from("registrations").insert({
            id: registrationId,
            form_type: "private",
            source: "admin",
            name: studentName,
            // An extra lesson keeps the same account email as the student's other
            // registration, so ownership checks treat them as the same person.
            email: existing ? existing.accountEmail : email,
            ...(existing?.contactEmail
              ? { contact_email: existing.contactEmail }
              : {}),
            phone: studentPhone || null,
            language,
            format: format === "physical" ? "fizic" : "online",
            quantity,
            // unpaid is "no payment has been attempted", which is exactly true of
            // a lesson agreed by hand and not yet paid for. Never pending: there
            // is no payment in flight. free when the owner gives it for free.
            payment_status: free ? "free" : paid ? "paid" : "unpaid",
            // Not a lead to chase: the owner has already spoken to them.
            lead_status: "contacted",
          });
      if (regErr) {
        console.error("[book_for_student] registration insert failed", regErr);
        return jsonResponse({ error: "Nu am putut salva cursantul." });
      }

      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // "paid" is the private 60-minute lesson in booking_event_types.
            event_type: "paid",
            registration_id: registrationId,
            start_at: startAt,
            format,
            student_name: studentName,
            student_email: studentEmail,
            student_phone: studentPhone || undefined,
            notes:
              typeof b.notes === "string" && b.notes.trim()
                ? b.notes.trim()
                : undefined,
            language,
            gdpr_consent: true,
            force,
            // The later lessons of a series booked at once: no email each;
            // the student has the Google invitations and the first email.
            quiet: b.quiet === true,
          }),
        },
      );
      const out = await resp.json().catch(() => ({}));
      if (!resp.ok || out?.error) {
        // The registration was written a moment ago and has no booking, so it
        // would otherwise sit in Înscrieri as a lesson that never happened.
        // An existing student's registration is theirs and stays untouched.
        if (!onExisting)
          await supabase
            .from("registrations")
            .delete()
            .eq("id", registrationId);
        return jsonResponse({
          error:
            out?.code === "lessons_used_up"
              ? "Toate lecțiile din pachetul acestui cursant sunt deja programate. Bifează „Lecție în plus” ca să o programezi separat, cu aceleași date."
              : out?.error || "Programarea a eșuat.",
          code: out?.code,
          clashes: out?.clashes ?? [],
        });
      }

      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "book_for_student",
        registration_id: registrationId,
        details: onExisting
          ? { at: startAt, format, forced: force, existing_registration: true }
          : {
              at: startAt,
              format,
              quantity,
              paid,
              forced: force,
              ...(existing ? { extra_for: existing.id } : {}),
            },
      });
      return jsonResponse({
        success: true,
        registration_id: registrationId,
        sync_pending: out?.sync_pending === true,
      });
    }

    if (action === "list_notifications") {
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select(
          "id, created_at, name, phone, email, form_type, format, center, whatsapp_sent_at, lead_status",
        )
        .order("created_at", { ascending: false });
      if (regsError) throw regsError;

      const emails = (regs || [])
        .map((r) => r.email)
        .filter((e): e is string => !!e)
        .map((e) => e.toLowerCase());

      const templates = [
        "group-registration-confirmation",
        "private-registration-confirmation",
        "kids-registration-confirmation",
      ];

      let logs: Array<{
        recipient_email: string;
        template_name: string;
        status: string;
        created_at: string;
        message_id: string | null;
      }> = [];

      if (emails.length > 0) {
        const { data: logData, error: logError } = await supabase
          .from("email_send_log")
          .select(
            "recipient_email, template_name, status, created_at, message_id",
          )
          .in("template_name", templates)
          .in("recipient_email", emails)
          .order("created_at", { ascending: false });
        if (logError) throw logError;
        logs = logData || [];
      }

      // Latest status per (email, template)
      const latestByKey = new Map<
        string,
        { status: string; created_at: string }
      >();
      for (const log of logs) {
        const key = `${log.recipient_email.toLowerCase()}|${log.template_name}`;
        if (!latestByKey.has(key)) {
          latestByKey.set(key, {
            status: log.status,
            created_at: log.created_at,
          });
        }
      }

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };

      const enriched = (regs || []).map((r) => {
        const tmpl = templateByForm[r.form_type];
        const latest =
          r.email && tmpl
            ? latestByKey.get(`${r.email.toLowerCase()}|${tmpl}`)
            : undefined;
        return {
          ...r,
          email_status: latest?.status || (r.email ? "not_sent" : "no_email"),
          email_sent_at: latest?.created_at || null,
        };
      });

      return jsonResponse({ data: enriched });
    }

    if (action === "mark_whatsapp_sent") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const clear = body.clear === true;
      const { data, error } = await supabase
        .from("registrations")
        .update({ whatsapp_sent_at: clear ? null : new Date().toISOString() })
        .eq("id", id)
        .select("id, whatsapp_sent_at")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "resend_confirmation") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, name, email, form_type")
        .eq("id", id)
        .single();
      if (regError) throw regError;
      if (!reg.email) return jsonResponse({ error: "Lead-ul nu are email" });

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };
      const templateName = templateByForm[reg.form_type];
      if (!templateName)
        return jsonResponse({ error: "Tip înscriere necunoscut" });

      try {
        const result = await sendTemplateEmail(templateName, reg.email, {
          idempotencyKey: `reg-resend-${reg.id}-${Date.now()}`,
          templateData: { name: reg.name },
        });
        if (!result.sent) {
          return jsonResponse({ error: "Adresa nu mai poate primi emailuri" });
        }
      } catch (sendError) {
        console.error("resend_confirmation failed", sendError);
        return jsonResponse({ error: "Trimitere eșuată" });
      }
      return jsonResponse({ success: true });
    }

    if (action === "send_test_email") {
      const recipient =
        typeof body.recipient_email === "string"
          ? body.recipient_email.trim().toLowerCase()
          : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        return jsonResponse({ error: "Email destinatar invalid" });
      }
      const statusUrl =
        typeof body.status_url === "string" &&
        /^https?:\/\//.test(body.status_url)
          ? body.status_url
          : "https://centruldearabalibaneza.com/private-status/exemplu";
      try {
        const result = await sendTemplateEmail(
          "private-registration-confirmation",
          recipient,
          {
            idempotencyKey: `reg-confirm-test-${Date.now()}`,
            templateData: {
              name: "Maria Popescu",
              format: "online",
              message:
                "Aș prefera lecții seara, după ora 18:00, cu accent pe conversație.",
              statusUrl,
            },
          },
        );
        if (!result.sent) {
          return jsonResponse({ error: "Adresa nu mai poate primi emailuri" });
        }
      } catch (sendError) {
        console.error("send_test_email failed", sendError);
        return jsonResponse({ error: "Trimitere eșuată" });
      }
      return jsonResponse({ success: true });
    }

    if (action === "update_email_settings") {
      const senderName =
        typeof sender_name === "string" ? sender_name.trim() : "";
      const senderEmail =
        typeof sender_email === "string"
          ? sender_email.trim().toLowerCase()
          : "";

      if (
        senderName.length < 2 ||
        senderName.length > 80 ||
        !isAllowedSenderEmail(senderEmail)
      ) {
        return jsonResponse({
          error: "Numele sau emailul expeditorului este invalid",
        });
      }

      const { data, error } = await supabase
        .from("email_confirmation_settings")
        .upsert(
          { id: 1, sender_name: senderName, sender_email: senderEmail },
          { onConflict: "id" },
        )
        .select("sender_name, sender_email")
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, settings: data });
    }

    // Delete action. Rows that carry money (paid, refunded, subscription…)
    // are financial records and must never be deleted — only anonymized —
    // so the local payment trail survives (Stripe alone is not enough for
    // the admin's own history/exports).
    if (action === "delete" && Array.isArray(ids) && ids.length > 0) {
      const { data: rows, error: rowsErr } = await supabase
        .from("registrations")
        .select(
          "id, payment_status, paid_at, refunded_at, refunded_amount, stripe_subscription_id",
        )
        .in("id", ids);
      if (rowsErr) throw rowsErr;

      const hasMoney = (r: {
        payment_status?: string | null;
        paid_at?: string | null;
        refunded_at?: string | null;
        refunded_amount?: number | null;
        stripe_subscription_id?: string | null;
      }) =>
        ["paid", "refunded", "past_due"].includes(r.payment_status ?? "") ||
        !!r.paid_at ||
        !!r.refunded_at ||
        (r.refunded_amount ?? 0) > 0 ||
        !!r.stripe_subscription_id;

      // force=true: admin explicitly confirmed (typed confirmation in the UI)
      // that these are test rows; payment traces are deleted too.
      const force = body?.force === true;
      const blocked = force
        ? []
        : (rows ?? []).filter(hasMoney).map((r) => r.id);
      const deletable = force
        ? (rows ?? []).map((r) => r.id)
        : (rows ?? []).filter((r) => !hasMoney(r)).map((r) => r.id);

      if (deletable.length > 0) {
        // The lessons go with the registration (bookings cascade), so their
        // Google events go first: otherwise a lesson deleted here would stay
        // in the calendar. Quiet (sendUpdates=none): deleting is for test,
        // spam or duplicate records; a real cancellation goes through
        // "Anulează", which tells the student. If Google refuses, nothing is
        // deleted, so the two never disagree.
        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
        const { data: linkedLessons, error: lErr } = await supabase
          .from("bookings")
          .select("id, google_event_id")
          .in("registration_id", deletable)
          .eq("status", "confirmed")
          .not("google_event_id", "is", null);
        if (lErr) throw lErr;
        if ((linkedLessons ?? []).length && (!lovableKey || !gcalKey)) {
          return jsonResponse({
            error:
              "Google Calendar nu e conectat; lecțiile din calendar nu pot fi șterse. Nimic nu s-a șters.",
          });
        }
        for (const lesson of linkedLessons ?? []) {
          const res = await fetch(
            `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(lesson.google_event_id as string)}?sendUpdates=none`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": gcalKey!,
              },
            },
          );
          if (!res.ok && res.status !== 404 && res.status !== 410) {
            console.error("[delete] google", res.status, await res.text());
            return jsonResponse({
              error: `Google Calendar a refuzat ștergerea unei lecții (${res.status}). Nimic nu s-a șters.`,
            });
          }
        }
        const { error } = await supabase
          .from("registrations")
          .delete()
          .in("id", deletable);
        if (error) throw error;
        await supabase.from("audit_logs").insert(
          deletable.map((rid) => ({
            actor: callerEmail!,
            action: force ? "force_delete" : "delete",
            registration_id: rid,
          })),
        );
      }

      return jsonResponse({
        success: true,
        deleted: deletable.length,
        blocked: blocked.length,
      });
    }

    // Anonymize action (GDPR / rows with payments): strips personal data,
    // keeps the financial and status history intact. Irreversible.
    if (action === "anonymize" && Array.isArray(ids) && ids.length > 0) {
      const { data: updated, error } = await supabase
        .from("registrations")
        .update({
          name: "Anonimizat (GDPR)",
          email: null,
          phone: "anonimizat",
          notes: null,
          child_age: null,
          anonymized_at: new Date().toISOString(),
        })
        .in("id", ids)
        .is("anonymized_at", null)
        .select("id");
      if (error) throw error;

      const done = (updated ?? []).map((r) => r.id);
      if (done.length > 0) {
        await supabase.from("audit_logs").insert(
          done.map((rid) => ({
            actor: callerEmail!,
            action: "anonymize",
            registration_id: rid,
          })),
        );
      }
      return jsonResponse({ success: true, anonymized: done.length });
    }

    // Recent admin activity (audit trail).
    if (action === "list_audit_logs") {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return jsonResponse({ data });
    }

    // "Am vorbit cu el" on Acasă: someone who said yes and has not paid is
    // put aside for a few days after the owner talked to them, then comes back
    // to the list if they still have not paid. Changes nothing about the money.
    if (action === "snooze_followup") {
      const days = Math.max(
        1,
        Math.min(30, Number.parseInt(String(body.days ?? 7), 10) || 7),
      );
      if (typeof id !== "string")
        return jsonResponse({ error: "Înscriere invalidă." }, 400);
      const until = new Date(Date.now() + days * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("registrations")
        .update({ followup_snoozed_until: until })
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data?.length)
        return jsonResponse({ error: "Înscrierea nu există." }, 404);
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "snooze_followup",
        registration_id: id,
        details: { until, days },
      });
      return jsonResponse({ success: true, until });
    }

    // Money received outside Stripe (cash or bank transfer), marked by the
    // owner from Acasă. payment_status tracks the money, and the money has
    // arrived, so it becomes "paid", with how it was paid. Never over a
    // registration already paid or refunded.
    if (action === "mark_paid_offline") {
      const method =
        body.method === "cash" || body.method === "transfer"
          ? body.method
          : null;
      if (typeof id !== "string" || !method)
        return jsonResponse({ error: "Alege cash sau transfer." }, 400);
      const paidAt = new Date().toISOString();
      const { data, error } = await supabase
        .from("registrations")
        .update({
          payment_status: "paid",
          paid_at: paidAt,
          payment_method: method,
          lead_status: "converted",
          followup_snoozed_until: null,
        })
        .eq("id", id)
        .is("anonymized_at", null)
        .not("payment_status", "in", '("paid","refunded")')
        .select("id");
      if (error) throw error;
      if (!data?.length)
        return jsonResponse(
          { error: "Înscrierea e deja plătită sau nu mai există." },
          409,
        );
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "mark_paid_offline",
        registration_id: id,
        details: { method, at: paidAt },
      });
      return jsonResponse({ success: true });
    }

    // "Gratuit": a lesson the owner gave for free, e.g. a make-up lesson that
    // was booked as unpaid. Only from unpaid: once a payment has been attempted
    // (pending, failed, expired, card on file) or made, Stripe's record decides.
    if (action === "mark_free") {
      if (typeof id !== "string")
        return jsonResponse({ error: "Înscriere invalidă." }, 400);
      const { data, error } = await supabase
        .from("registrations")
        .update({ payment_status: "free", followup_snoozed_until: null })
        .eq("id", id)
        .is("anonymized_at", null)
        .eq("payment_status", "unpaid")
        .select("id");
      if (error) throw error;
      if (!data?.length)
        return jsonResponse(
          {
            error:
              "Doar o înscriere neplătită, fără nicio plată începută, poate fi marcată gratuită.",
          },
          409,
        );
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "mark_free",
        registration_id: id,
        details: { at: new Date().toISOString() },
      });
      return jsonResponse({ success: true });
    }

    if (action === "update_status") {
      const ALLOWED_LEAD_STATUSES = [
        "new",
        "contacted",
        "qualified",
        "no_response",
        "not_suitable",
        "spam",
        "converted",
      ];
      if (
        typeof id !== "string" ||
        !ALLOWED_LEAD_STATUSES.includes(lead_status)
      ) {
        return jsonResponse({ error: "Status invalid" });
      }

      const { data: existing, error: existingError } = await supabase
        .from("registrations")
        .select("lead_status")
        .eq("id", id)
        .single();

      if (existingError) throw existingError;

      const { data, error } = await supabase
        .from("registrations")
        .update({ lead_status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      if ((existing?.lead_status || "new") !== lead_status) {
        const { error: historyError } = await supabase
          .from("lead_status_history")
          .insert({
            registration_id: id,
            previous_status: existing?.lead_status || "new",
            new_status: lead_status,
            changed_by: "admin",
          });

        if (historyError) throw historyError;
        await supabase.from("audit_logs").insert({
          actor: callerEmail!,
          action: "update_status",
          registration_id: id,
          details: { from: existing?.lead_status || "new", to: lead_status },
        });
      }

      return jsonResponse({ success: true, data });
    }

    // Shows what the published policy would return, without moving any money.
    // The admin sees the tier and the arithmetic before confirming, the same
    // way preview_cancel_subscription works for subscriptions.
    if (action === "preview_refund") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const taken = Number(body.lessons_taken ?? 0);
      if (!Number.isInteger(taken) || taken < 0) {
        return jsonResponse({ error: "Număr de lecții invalid" });
      }

      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select(
          "id, form_type, level, quantity, cohort_id, payment_status, stripe_session_id, refunded_at, no_show_fee_status, no_show_fee_intent_id",
        )
        .eq("id", id)
        .maybeSingle();
      if (regError) throw regError;
      if (!reg) return jsonResponse({ error: "Înscrierea nu a fost găsită" });
      // A charged trial no-show fee is refunded by the same button.
      if (
        reg.payment_status !== "paid" &&
        reg.no_show_fee_status === "paid" &&
        reg.no_show_fee_intent_id
      ) {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });
        const fee = await noShowFeeRefundFor(stripe, reg.no_show_fee_intent_id);
        if ("error" in fee) return jsonResponse({ error: fee.error });
        return jsonResponse({
          success: true,
          data: {
            ...fee.breakdown,
            refund_label: formatBani(fee.breakdown.refundBani),
          },
        });
      }
      if (reg.refunded_at) return jsonResponse({ error: "Deja rambursat" });
      if (reg.payment_status !== "paid" || !reg.stripe_session_id) {
        return jsonResponse({
          error: "Doar înscrierile plătite pot fi rambursate",
        });
      }

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });
      const inputs = await refundInputsFor(supabase, stripe, reg, taken);
      if ("error" in inputs) return jsonResponse({ error: inputs.error });
      return jsonResponse({
        success: true,
        data: {
          ...inputs.breakdown,
          refund_label: formatBani(inputs.breakdown.refundBani),
        },
      });
    }

    if (action === "refund") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "ID invalid" });
      }
      if (
        refund_reason != null &&
        (typeof refund_reason !== "string" || refund_reason.length > 500)
      ) {
        return jsonResponse({ error: "Motiv invalid" });
      }
      const lessonsTaken = Number(body.lessons_taken ?? 0);
      if (!Number.isInteger(lessonsTaken) || lessonsTaken < 0) {
        return jsonResponse({ error: "Număr de lecții invalid" });
      }

      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select(
          "id, form_type, level, quantity, cohort_id, payment_status, stripe_session_id, refunded_at, no_show_fee_status, no_show_fee_intent_id",
        )
        .eq("id", id)
        .maybeSingle();

      if (regError) throw regError;
      if (!reg) return jsonResponse({ error: "Înscrierea nu a fost găsită" });

      // A charged trial no-show fee, given back on appeal (case by case, the
      // owner's call): in full, recorded on no_show_fee_*, leaving the
      // registration's lesson payments alone.
      if (
        reg.payment_status !== "paid" &&
        reg.no_show_fee_status === "paid" &&
        reg.no_show_fee_intent_id
      ) {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });
        const fee = await noShowFeeRefundFor(stripe, reg.no_show_fee_intent_id);
        if ("error" in fee) return jsonResponse({ error: fee.error });
        let feeRefund;
        try {
          feeRefund = await stripe.refunds.create(
            {
              payment_intent: fee.paymentIntentId,
              amount: fee.breakdown.refundBani,
            },
            { idempotencyKey: `refund_no_show_fee_${fee.paymentIntentId}` },
          );
        } catch (stripeErr) {
          console.error(
            "[admin-registrations] no-show refund failed",
            stripeErr,
          );
          const msg =
            stripeErr instanceof Error ? stripeErr.message : "Eroare Stripe";
          return jsonResponse({ error: `Rambursare eșuată: ${msg}` });
        }
        const { data: updatedFee, error: feeSaveErr } = await supabase
          .from("registrations")
          .update({
            no_show_fee_status: "refunded",
            no_show_fee_refunded_amount: fee.breakdown.refundBani,
            refund_reason: refund_reason || null,
          })
          .eq("id", id)
          .select("*")
          .single();
        if (feeSaveErr) {
          console.error(
            "[admin-registrations] no-show refund done but not saved",
            { registrationId: id, stripeRefundId: feeRefund.id, feeSaveErr },
          );
          return jsonResponse({
            error:
              "Rambursarea a fost procesată în Stripe, dar salvarea a eșuat. Contactează suportul tehnic.",
          });
        }
        await supabase.from("audit_logs").insert({
          actor: callerEmail!,
          action: "refund_no_show_fee",
          registration_id: id,
          details: {
            refund_id: feeRefund.id,
            reason: refund_reason || null,
            ...fee.breakdown,
          },
        });
        return jsonResponse({
          success: true,
          data: updatedFee,
          refund_id: feeRefund.id,
          breakdown: fee.breakdown,
        });
      }

      if (reg.refunded_at) return jsonResponse({ error: "Deja rambursat" });
      if (reg.payment_status !== "paid" || !reg.stripe_session_id) {
        return jsonResponse({
          error: "Doar înscrierile plătite pot fi rambursate",
        });
      }

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // The published refund policy, applied. This button used to call
      // stripe.refunds.create with no amount, which refunds the charge in
      // full — the three tiers in Terms section 4 existed on the site and in
      // _shared/refund.ts but nothing ever ran them.
      const inputs = await refundInputsFor(supabase, stripe, reg, lessonsTaken);
      if ("error" in inputs) return jsonResponse({ error: inputs.error });
      const { breakdown, paymentIntentId } = inputs;

      if (breakdown.refundBani <= 0) {
        return jsonResponse({
          error:
            "Politica de rambursare nu returnează nimic în acest caz (lecțiile consumate nu se rambursează).",
        });
      }

      let refund;
      try {
        refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: breakdown.refundBani,
        });
      } catch (stripeErr) {
        console.error("[admin-registrations] stripe refund failed", stripeErr);
        const msg =
          stripeErr instanceof Error ? stripeErr.message : "Eroare Stripe";
        return jsonResponse({ error: `Rambursare eșuată: ${msg}` });
      }

      const { data: updated, error: updateError } = await supabase
        .from("registrations")
        .update({
          payment_status: "refunded",
          refunded_at: new Date().toISOString(),
          refund_reason: refund_reason || null,
          // What actually went back, so the admin list and any later
          // reconciliation show the policy amount rather than the full charge.
          refunded_amount: breakdown.refundBani,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        // Stripe refund already succeeded at this point — log loudly so it
        // can be reconciled by hand rather than silently losing the record.
        console.error(
          "[admin-registrations] Stripe refund succeeded but DB update failed",
          { registrationId: id, stripeRefundId: refund.id, updateError },
        );
        return jsonResponse({
          error:
            "Rambursarea a fost procesată în Stripe, dar salvarea a eșuat. Contactează suportul tehnic.",
        });
      }

      // The whole breakdown is logged, not just the total: the tier and the
      // lesson count are what make a refund defensible if it is ever queried.
      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "refund",
        registration_id: id,
        details: {
          refund_id: refund.id,
          reason: refund_reason || null,
          lessons_taken: lessonsTaken,
          ...breakdown,
        },
      });
      return jsonResponse({
        success: true,
        data: updated,
        refund_id: refund.id,
        breakdown,
        refund_label: formatBani(breakdown.refundBani),
      });
    }

    // ============ Group subscription cancel + refund ============
    // Owner's rule (27 October 2026), applied by _shared/group-refund.ts and
    // published in the Terms, section 4. Cancelling always stops every future
    // monthly charge. Before the start date the month(s) paid come back, in
    // full 7+ days ahead and minus 10% after that; once the course has
    // started, only the current month comes back, for its lessons not yet
    // held, minus 10%, and only within 7 days of that month's charge. The
    // lessons are the cohort's real ones (cohort_sessions). Everything is
    // computed here, never taken from the browser.
    if (
      action === "cancel_subscription" ||
      action === "preview_cancel_subscription"
    ) {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });

      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select(
          "id, form_type, cohort_id, stripe_subscription_id, subscription_status, canceled_at",
        )
        .eq("id", id)
        .maybeSingle();
      if (regError) throw regError;
      if (!reg) return jsonResponse({ error: "Înscrierea nu a fost găsită" });
      if (
        !reg.stripe_subscription_id ||
        !String(reg.stripe_subscription_id).startsWith("sub_")
      ) {
        return jsonResponse({
          error: "Nu există un abonament activ pentru această înscriere",
        });
      }
      if (reg.subscription_status === "canceled" || reg.canceled_at) {
        return jsonResponse({ error: "Abonamentul este deja anulat" });
      }

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const sub = await stripe.subscriptions.retrieve(
        reg.stripe_subscription_id,
      );
      // Since the basil API the billing period lives on the subscription item.
      // deno-lint-ignore no-explicit-any
      const subAny = sub as any;
      const periodEndUnix: number | undefined =
        subAny.items?.data?.[0]?.current_period_end ??
        subAny.current_period_end;

      // Every paid month, with the payment intent a refund goes against.
      // (invoice.charge no longer exists in this API version; the payment is
      // on invoice.payments.)
      const paidInvoices = await stripe.invoices.list({
        subscription: reg.stripe_subscription_id,
        status: "paid",
        limit: 100,
        expand: ["data.payments"],
      });
      const charges: GroupCharge[] = [];
      for (const inv of paidInvoices.data) {
        // deno-lint-ignore no-explicit-any
        const payments = ((inv as any).payments?.data ?? []) as any[];
        const pi = payments
          .map((p) => p?.payment?.payment_intent)
          .find(Boolean);
        const paymentId = typeof pi === "string" ? pi : (pi?.id ?? "");
        if (!paymentId || !inv.amount_paid) continue;
        let refundedBani = 0;
        try {
          const intent = await stripe.paymentIntents.retrieve(paymentId);
          refundedBani = Number(intent.amount_refunded ?? 0);
        } catch (e) {
          console.error("[cancel_subscription] payment read failed", e);
        }
        const paidAtUnix =
          // deno-lint-ignore no-explicit-any
          (inv as any).status_transitions?.paid_at ?? inv.created;
        charges.push({
          paymentId,
          amountBani: inv.amount_paid,
          refundedBani,
          chargedAt: new Date(paidAtUnix * 1000).toISOString(),
        });
      }

      let courseStartDate: string | null = null;
      let sessionStarts: string[] = [];
      if (reg.cohort_id) {
        const { data: cohort } = await supabase
          .from("group_cohorts")
          .select("start_date")
          .eq("id", reg.cohort_id)
          .maybeSingle();
        courseStartDate =
          (cohort as { start_date: string | null } | null)?.start_date ?? null;
        const { data: sessions, error: sessErr } = await supabase
          .from("cohort_sessions")
          .select("starts_at")
          .eq("cohort_id", reg.cohort_id)
          .order("starts_at");
        if (sessErr) throw sessErr;
        sessionStarts = (sessions ?? []).map(
          (s: { starts_at: string }) => s.starts_at,
        );
      }

      const breakdown = computeGroupCancelRefund({
        charges,
        courseStartDate,
        sessionStarts,
        currentPeriodEnd: periodEndUnix
          ? new Date(periodEndUnix * 1000).toISOString()
          : null,
      });
      // After the start the month's lessons decide the amount; with no
      // lessons known (the calendar not synced) the refund would read 0
      // without anyone noticing. Say so instead.
      const needsLessons =
        breakdown.case === "current_month" && breakdown.lessonsInMonth === 0;
      const currency = (paidInvoices.data[0]?.currency || "ron").toUpperCase();

      // Read-only preview for the admin confirm dialog — no side effects.
      if (action === "preview_cancel_subscription") {
        return jsonResponse({
          data: {
            ...breakdown,
            needs_lessons: needsLessons,
            refund_amount: breakdown.refundBani,
            refund_label: formatBani(breakdown.refundBani),
            currency,
          },
        });
      }
      if (needsLessons) {
        return jsonResponse({
          error:
            "Lecțiile grupei din luna curentă nu sunt sincronizate din Google Calendar. Sincronizează lecțiile grupei, apoi anulează.",
        });
      }

      // Cancel first (stops future invoices), then refund what the rule gives.
      try {
        await stripe.subscriptions.cancel(reg.stripe_subscription_id);
      } catch (cancelErr) {
        console.error(
          "[admin-registrations] subscription cancel failed",
          cancelErr,
        );
        const msg =
          cancelErr instanceof Error ? cancelErr.message : "Eroare Stripe";
        return jsonResponse({ error: `Anulare eșuată: ${msg}` });
      }

      const refundIds: string[] = [];
      let refundedTotal = 0;
      for (const line of breakdown.refunds) {
        if (line.amountBani <= 0) continue;
        try {
          const refund = await stripe.refunds.create(
            { payment_intent: line.paymentId, amount: line.amountBani },
            { idempotencyKey: `sub_cancel_${id}_${line.paymentId}` },
          );
          refundIds.push(refund.id);
          refundedTotal += line.amountBani;
        } catch (refundErr) {
          // The subscription is already cancelled; log so the refund can be
          // issued by hand rather than silently dropped.
          console.error(
            "[admin-registrations] cancel refund failed after cancel",
            { registrationId: id, line, refundErr },
          );
        }
      }
      const refundFailed = refundedTotal < breakdown.refundBani;

      const { data: updated, error: updateError } = await supabase
        .from("registrations")
        .update({
          subscription_status: "canceled",
          canceled_at: new Date().toISOString(),
          refunded_amount: refundedTotal,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (updateError) {
        console.error(
          "[admin-registrations] cancel saved in Stripe but DB update failed",
          {
            registrationId: id,
            refundIds,
            updateError,
          },
        );
        return jsonResponse({
          error:
            "Abonamentul a fost anulat în Stripe, dar salvarea a eșuat. Contactează suportul tehnic.",
        });
      }

      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "cancel_subscription",
        registration_id: id,
        details: {
          refund_ids: refundIds,
          refund_amount: refundedTotal,
          refund_failed: refundFailed,
          ...breakdown,
        },
      });
      return jsonResponse({
        success: true,
        data: updated,
        refund_ids: refundIds,
        refund_amount: refundedTotal,
        refund_failed: refundFailed,
        breakdown,
      });
    }

    if (action === "get_private_lead") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Lead invalid" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) throw registrationError;

      const { data: history, error: historyError } = await supabase
        .from("lead_status_history")
        .select("*")
        .eq("registration_id", id)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;

      return jsonResponse({ data: { registration, history } });
    }

    // The existing dashboard sends an unnamed list request. A named action
    // that reached here was not handled; never disguise it as a successful read.
    if (action !== undefined) {
      return jsonResponse(
        { error: "Acțiune necunoscută", code: "unknown_action" },
        400,
      );
    }

    // Default: list all. cohort_id has no FK in the current schema, so resolve
    // its exact ID explicitly rather than relying on a PostgREST relationship.
    const { data } = await readAll("registrations", "*", "created_at", false);

    for (const registration of data) {
      registration.account_email = registration.email;
      // A cleared contact email is stored as "" — fall back to the account email.
      registration.email = registration.contact_email || registration.email;
    }
    if (data.length) {
      const cohortIds = [
        ...new Set(data.map((r) => r.cohort_id).filter(Boolean)),
      ];
      if (cohortIds.length) {
        const cohorts: Array<Record<string, any>> = [];
        for (let offset = 0; offset < cohortIds.length; offset += 100) {
          const result = await supabase
            .from("group_cohorts")
            .select(
              "id,title_ro,level,format,age_category,teaching_language,start_date,end_date,schedule_label_ro,status",
            )
            .in("id", cohortIds.slice(offset, offset + 100));
          if (result.error) throw result.error;
          cohorts.push(...(result.data ?? []));
        }
        const byId = new Map(cohorts.map((c) => [c.id, c]));
        for (const r of data) r.cohort = byId.get(r.cohort_id) ?? null;
      } else {
        for (const r of data) r.cohort = null;
      }
      // Older manual private bookings used the default source='form'. Their
      // existing audit record proves the origin without changing stored rows.
      const privateIds = data
        .filter((r) => r.form_type === "private")
        .map((r) => r.id);
      if (privateIds.length) {
        const manualIds = new Set<string>();
        for (let offset = 0; offset < privateIds.length; offset += 100) {
          const result = await supabase
            .from("audit_logs")
            .select("registration_id")
            .eq("action", "book_for_student")
            .in("registration_id", privateIds.slice(offset, offset + 100));
          if (result.error) throw result.error;
          for (const r of result.data ?? []) manualIds.add(r.registration_id);
        }
        for (const r of data) if (manualIds.has(r.id)) r.source = "admin";
      }
      // A trial from someone who already used one under another email: same
      // name or same phone. Names repeat, so this only flags it for the owner;
      // the same card is refused outright at booking (trial_already_used).
      const trialRegs = data.filter((r) => r.form_type === "trial");
      if (trialRegs.length) {
        const { data: trialBookings, error: tbErr } = await supabase
          .from("bookings")
          .select("registration_id, status, trial_outcome")
          .eq("event_type_slug", "trial");
        if (tbErr) throw tbErr;
        const counts = (b: { status: string; trial_outcome: string | null }) =>
          (["confirmed", "completed"].includes(b.status) &&
            b.trial_outcome !== "excused") ||
          b.trial_outcome === "lost";
        const usedIds = new Set(
          (trialBookings ?? []).filter(counts).map((b) => b.registration_id),
        );
        const used = data.filter((r) => usedIds.has(r.id));
        const nameKey = (v: unknown) =>
          String(v ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
        const phoneKey = (v: unknown) => {
          const d = String(v ?? "").replace(/\D/g, "");
          return d.length >= 9 ? d.slice(-9) : "";
        };
        const mail = (r: Record<string, any>) =>
          String(r.account_email ?? r.email ?? "").toLowerCase();
        for (const r of trialRegs) {
          const match = used.find(
            (o) =>
              o.id !== r.id &&
              mail(o) !== mail(r) &&
              ((nameKey(o.name) && nameKey(o.name) === nameKey(r.name)) ||
                (phoneKey(o.phone) && phoneKey(o.phone) === phoneKey(r.phone))),
          );
          if (match)
            r.trial_duplicate_hint = `Posibil duplicat — a mai avut o probă: ${match.name ?? ""} (${match.email ?? ""})`;
        }
      }
    }

    // Duplicate indicator: how many registrations share each email (spec
    // §3.3 — surfaced to the admin, never auto-merged).
    if (data) {
      const emailCounts = new Map<string, number>();
      for (const r of data) {
        const e = (r.email || "").trim().toLowerCase();
        if (e) emailCounts.set(e, (emailCounts.get(e) ?? 0) + 1);
      }
      for (const r of data) {
        const e = (r.email || "").trim().toLowerCase();
        (r as Record<string, unknown>).email_dup_count = e
          ? (emailCounts.get(e) ?? 1)
          : 1;
      }
    }

    const { data: settings, error: settingsError } = await supabase
      .from("email_confirmation_settings")
      .select("sender_name, sender_email")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    return jsonResponse({
      data,
      settings: settings || {
        sender_name: "Arabă Libaneză cu Ibra",
        sender_email: "noreply@centruldearabalibaneza.com",
      },
    });
  } catch (err) {
    console.error("[admin-registrations] error", err);
    // Database check constraints (e.g. online cohorts capped at 6 seats) are a
    // user input problem, not a server fault — surface a readable sentence.
    const e = err as { code?: string; message?: string };
    if (e?.code === "23514") {
      const msg = e.message?.includes("group_cohorts_online_max_seats")
        ? "Grupele online au maximum 6 locuri"
        : e.message?.includes("group_cohorts_fizic_max_seats")
          ? "Grupele fizice au maximum 8 locuri"
          : "Valori invalide pentru acest formular";
      return jsonResponse({ error: msg });
    }
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
