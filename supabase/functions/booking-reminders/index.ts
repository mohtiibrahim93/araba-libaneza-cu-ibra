import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json as _json } from "../_shared/booking.ts";
import { fmtBookingLocal, manageUrl, sendBookingEmail } from "../_shared/booking-emails.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * Cron-driven (every 15 min). Sends multi-stage reminders for each confirmed booking:
 *   - 2 days before        → reminder_2d_sent_at
 *   - Day-of (>= 08:00)    → reminder_day_of_sent_at
 *   - 3 hours before       → reminder_3h_sent_at
 *   - 1 hour before        → reminder_1h_sent_at
 *   - 30 minutes before    → reminder_30m_sent_at
 * Each stage uses a ±7.5 min window around its target so a 15-min cron tick
 * catches each booking exactly once. The dedupe flag is stamped on send.
 */
Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Cron-only endpoint: require the shared secret header (fail-closed).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return json({ error: "Unauthorized" }, 401);
  }


  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  const HALF_WINDOW_MS = 7.5 * 60_000; // ±7.5 min around each target offset

  type Stage = {
    key: "2d" | "day_of" | "3h" | "1h" | "30m";
    flag:
      | "reminder_2d_sent_at"
      | "reminder_day_of_sent_at"
      | "reminder_3h_sent_at"
      | "reminder_1h_sent_at"
      | "reminder_30m_sent_at";
    lo: string;
    hi: string;
    inLabelRo: string;
    inLabelEn: string;
  };

  function offsetStage(
    key: Stage["key"],
    flag: Stage["flag"],
    targetMsAhead: number,
    inLabelRo: string,
    inLabelEn: string,
  ): Stage {
    return {
      key,
      flag,
      lo: new Date(now + targetMsAhead - HALF_WINDOW_MS).toISOString(),
      hi: new Date(now + targetMsAhead + HALF_WINDOW_MS).toISOString(),
      inLabelRo,
      inLabelEn,
    };
  }

  // Day-of stage: any confirmed booking whose start_at is later today (>= now)
  // and within the next 24h. Gated by server local time >= 08:00 so we don't
  // wake people up. The dedupe flag ensures only one tick wins per booking.
  const dayOfWindow = (): Stage => {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart.getTime() + 24 * 3_600_000);
    return {
      key: "day_of",
      flag: "reminder_day_of_sent_at",
      lo: new Date(now).toISOString(),
      hi: todayEnd.toISOString(),
      inLabelRo: "astăzi",
      inLabelEn: "today",
    };
  };

  const stages: Stage[] = [
    offsetStage("2d", "reminder_2d_sent_at", 48 * 3_600_000, "în 2 zile", "in 2 days"),
    offsetStage("3h", "reminder_3h_sent_at", 3 * 3_600_000, "în 3 ore", "in 3 hours"),
    offsetStage("1h", "reminder_1h_sent_at", 1 * 3_600_000, "în 1 oră", "in 1 hour"),
    offsetStage("30m", "reminder_30m_sent_at", 30 * 60_000, "în 30 de minute", "in 30 minutes"),
  ];

  // Only run the day-of stage after 08:00 server-local time.
  if (new Date(now).getHours() >= 8) {
    stages.push(dayOfWindow());
  }

  async function runStage(stage: Stage) {
    const { data: rows, error } = await supabase
      .from("bookings")
      .select(
        "id,start_at,student_name,student_email,format,meet_link,manage_token,language," + stage.flag,
      )
      .eq("status", "confirmed")
      .gte("start_at", stage.lo)
      .lte("start_at", stage.hi)
      .is(stage.flag, null);

    if (error) {
      console.error("[reminders] query failed", stage.key, error);
      return { stage: stage.key, sent: 0, error: error.message };
    }

    type ReminderRow = {
      id: string;
      start_at: string;
      student_name: string;
      student_email: string;
      format: string;
      meet_link: string | null;
      manage_token: string;
      language: string | null;
    };
    const rowsTyped = (rows ?? []) as unknown as ReminderRow[];

    let sent = 0;
    for (const r of rowsTyped) {
      const lang = (r.language as "ro" | "en") ?? "ro";
      sendBookingEmail(
        "booking-reminder",
        r.student_email,
        {
          name: r.student_name,
          whenLabel: fmtBookingLocal(r.start_at, lang),
          inLabel: lang === "en" ? stage.inLabelEn : stage.inLabelRo,
          format: r.format,
          meetLink: r.meet_link,
          manageUrl: manageUrl(r.manage_token),
          lang,
        },
        `booking-reminder-${stage.key}-${r.id}`,
      );
      await supabase
        .from("bookings")
        .update({ [stage.flag]: new Date().toISOString() })
        .eq("id", r.id);
      sent++;
    }
    return { stage: stage.key, sent };
  }

  const results = await Promise.all(stages.map(runStage));
  return json({ ok: true, results });
});