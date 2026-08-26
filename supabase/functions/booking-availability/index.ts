import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  json as _json,
  gcalFreebusy,
  generateSlotsForDate,
  overlaps,
  parseHM,
  utcToZonedParts,
  weekdayInTz,
  zonedToUtc,
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
    const rulesByDay = new Map<number, Array<{ start_time: string; end_time: string }>>();
    for (const r of rules ?? []) {
      const arr = rulesByDay.get(r.weekday) ?? [];
      arr.push({ start_time: r.start_time, end_time: r.end_time });
      rulesByDay.set(r.weekday, arr);
    }

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

    // Generate raw candidate slots
    const candidates: string[] = [];
    for (const day of days) {
      // weekday for noon-local of that date
      const probe = new Date(Date.UTC(day.y, day.m - 1, day.d, 12, 0));
      const wd = weekdayInTz(probe);
      const windows = rulesByDay.get(wd);
      if (!windows) continue;
      const slots = generateSlotsForDate(day.y, day.m, day.d, windows, et.duration_min, 30);
      candidates.push(...slots);
    }

    // Min-notice + max-advance filtering
    const now = Date.now();
    const minNoticeMs = (et.min_notice_hours ?? 0) * 3_600_000;
    const maxAdvanceMs = (et.max_advance_days ?? 30) * 86_400_000;
    let filtered = candidates.filter((iso) => {
      const t = Date.parse(iso);
      return t >= now + minNoticeMs && t <= now + maxAdvanceMs;
    });

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
        .select("days_of_week,start_time,end_time,start_date,end_date")
        .eq("is_active", true)
        .in("status", ["forming", "minimum_reached", "confirmed", "in_progress"]),
    ]);

    const bookingBusy = (existing ?? []).map((b) => ({
      start: Date.parse(b.start_at) - et.buffer_before_min * 60_000,
      end: Date.parse(b.end_at) + et.buffer_after_min * 60_000,
    }));
    const gcalBusy = busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));

    // Expand each active cohort into the concrete lesson times it occupies
    // within the requested days: its weekdays, between its start and end date,
    // for the hours it meets.
    const cohortBusy: Array<{ start: number; end: number }> = [];
    for (const c of cohorts ?? []) {
      if (!c.days_of_week?.length || !c.start_time || !c.end_time) continue;
      const [csh, csm] = parseHM(c.start_time);
      const [ceh, cem] = parseHM(c.end_time);
      for (const day of days) {
        const probe = new Date(Date.UTC(day.y, day.m - 1, day.d, 12, 0));
        if (!c.days_of_week.includes(weekdayInTz(probe))) continue;
        const dayKey = `${day.y}-${String(day.m).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
        if (c.start_date && dayKey < c.start_date) continue;
        if (c.end_date && dayKey > c.end_date) continue;
        cohortBusy.push({
          start: zonedToUtc(day.y, day.m, day.d, csh, csm).getTime(),
          end: zonedToUtc(day.y, day.m, day.d, ceh, cem).getTime(),
        });
      }
    }

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