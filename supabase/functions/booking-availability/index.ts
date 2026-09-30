import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  json as _json,
  gcalFreebusy,
  overlaps,
  utcToZonedParts,
  candidateSlotsForDays,
  passesTimingRules,
  cohortBusyForDays,
  ACTIVE_COHORT_SELECT,
  ACTIVE_COHORT_STATUSES,
} from "../_shared/booking.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("event_type") || "trial";
    const dateFrom = url.searchParams.get("date_from"); // YYYY-MM-DD (local tz)
    const dateTo = url.searchParams.get("date_to"); // YYYY-MM-DD inclusive
    // The scheduler re-asks whenever the visitor switches format, because an
    // in-person trial is only offered at weekends.
    const format = url.searchParams.get("format") === "physical" ? "physical" : "online";
    if (!dateFrom || !dateTo) return json({ error: "date_from and date_to required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: et, error: etErr } = await supabase
      .from("booking_event_types")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (etErr || !et) return json({ error: "event type not found" }, 404);

    const { data: rules } = await supabase
      .from("availability_rules")
      .select("weekday,start_time,end_time")
      .eq("is_active", true);

    // Iterate dates in local tz between dateFrom and dateTo.
    const [fy, fm, fd] = dateFrom.split("-").map(Number);
    const [ty, tm, td] = dateTo.split("-").map(Number);
    const fromUtc = Date.UTC(fy, fm - 1, fd);
    const toUtc = Date.UTC(ty, tm - 1, td);
    const days: Array<{ y: number; m: number; d: number }> = [];
    for (let t = fromUtc; t <= toUtc; t += 86400000) {
      const dt = new Date(t);
      days.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() });
    }

    // Raw candidates, then min-notice / max-advance / in-person-trial rules.
    // Both helpers are shared with booking-manage's reschedule check.
    const candidates = candidateSlotsForDays(days, rules ?? [], et.duration_min);
    const now = Date.now();
    let filtered = candidates.filter((iso) => passesTimingRules(et, format, iso, now));

    if (filtered.length === 0) {
      return json({ event_type: et, slots: [], tz: TZ });
    }

    // Window for freebusy & DB lookups
    const windowStart = new Date(Math.min(...filtered.map((s) => Date.parse(s)))).toISOString();
    const lastStartMs = Math.max(...filtered.map((s) => Date.parse(s)));
    const windowEnd = new Date(lastStartMs + et.duration_min * 60_000 + et.buffer_after_min * 60_000).toISOString();

    const [busy, { data: existing }, { data: cohorts }] = await Promise.all([
      gcalFreebusy(windowStart, windowEnd),
      supabase
        .from("bookings")
        .select("start_at,end_at")
        .eq("status", "confirmed")
        .gte("start_at", windowStart)
        .lte("start_at", windowEnd),
      // Group classes are not bookings, so nothing here knew the teacher was
      // already in a lesson. Google Calendar freebusy would have caught it,
      // but it is only active once the calendar connector is configured —
      // until then this is the sole protection against selling a trial or a
      // private lesson on top of a running cohort.
      supabase
        .from("group_cohorts")
        .select(ACTIVE_COHORT_SELECT)
        .eq("is_active", true)
        .in("status", ACTIVE_COHORT_STATUSES),
    ]);

    const bookingBusy = (existing ?? []).map((b) => ({
      start: Date.parse(b.start_at) - et.buffer_before_min * 60_000,
      end: Date.parse(b.end_at) + et.buffer_after_min * 60_000,
    }));
    const gcalBusy = busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));

    // Concrete lesson times each active cohort occupies within the requested
    // days (per-weekday cohort_meetings rows win over start_time/end_time).
    const cohortBusy = cohortBusyForDays(cohorts ?? [], days);

    filtered = filtered.filter((iso) => {
      const s = Date.parse(iso) - et.buffer_before_min * 60_000;
      const e = Date.parse(iso) + et.duration_min * 60_000 + et.buffer_after_min * 60_000;
      for (const b of bookingBusy) if (overlaps(s, e, b.start, b.end)) return false;
      for (const b of gcalBusy) if (overlaps(s, e, b.start, b.end)) return false;
      for (const b of cohortBusy) if (overlaps(s, e, b.start, b.end)) return false;
      return true;
    });

    // Group by local date
    const byDate = new Map<string, string[]>();
    for (const iso of filtered) {
      const p = utcToZonedParts(new Date(iso));
      const k = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
      const arr = byDate.get(k) ?? [];
      arr.push(iso);
      byDate.set(k, arr);
    }

    return json({
      event_type: et,
      tz: TZ,
      slots: filtered,
      slots_by_date: Object.fromEntries(byDate),
    });
  } catch (err) {
    console.error("[booking-availability] error", err);
    return json({ error: "Internal server error" }, 500);
  }
});