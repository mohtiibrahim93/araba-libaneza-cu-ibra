import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  corsHeaders,
  json,
  gcalFreebusy,
  generateSlotsForDate,
  overlaps,
  utcToZonedParts,
  weekdayInTz,
} from "../_shared/booking.ts";

Deno.serve(async (req) => {
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
      console.log("[avail] day", day, "wd", wd, "windows", windows?.length ?? 0);
      if (!windows) continue;
      const slots = generateSlotsForDate(day.y, day.m, day.d, windows, et.duration_min, 30);
      console.log("[avail] generated", slots.length, "for", day);
      candidates.push(...slots);
    }
    console.log("[avail] total candidates", candidates.length, "rulesByDay keys", [...rulesByDay.keys()]);

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

    const [busy, { data: existing }] = await Promise.all([
      gcalFreebusy(windowStart, windowEnd),
      supabase
        .from("bookings")
        .select("start_at,end_at")
        .eq("status", "confirmed")
        .gte("start_at", windowStart)
        .lte("start_at", windowEnd),
    ]);

    const bookingBusy = (existing ?? []).map((b) => ({
      start: Date.parse(b.start_at) - et.buffer_before_min * 60_000,
      end: Date.parse(b.end_at) + et.buffer_after_min * 60_000,
    }));
    const gcalBusy = busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));

    filtered = filtered.filter((iso) => {
      const s = Date.parse(iso) - et.buffer_before_min * 60_000;
      const e = Date.parse(iso) + et.duration_min * 60_000 + et.buffer_after_min * 60_000;
      for (const b of bookingBusy) if (overlaps(s, e, b.start, b.end)) return false;
      for (const b of gcalBusy) if (overlaps(s, e, b.start, b.end)) return false;
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
    return json({ error: String(err) }, 500);
  }
});