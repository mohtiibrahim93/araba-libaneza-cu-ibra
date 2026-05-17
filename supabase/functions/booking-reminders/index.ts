import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/booking.ts";
import { fmtBookingLocal, manageUrl, sendBookingEmail } from "../_shared/booking-emails.ts";

/**
 * Cron-driven (every ~15 min). For each confirmed booking starting in:
 *   - [now+23h30m, now+24h30m]  → send 24h reminder if not sent
 *   - [now+30m,    now+90m]     → send 1h reminder if not sent
 * Marks reminder_*_sent_at to dedupe.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  const win24Lo = new Date(now + 23.5 * 3_600_000).toISOString();
  const win24Hi = new Date(now + 24.5 * 3_600_000).toISOString();
  const win1Lo = new Date(now + 30 * 60_000).toISOString();
  const win1Hi = new Date(now + 90 * 60_000).toISOString();

  async function process(window: "24h" | "1h", lo: string, hi: string) {
    const flag = window === "24h" ? "reminder_24h_sent_at" : "reminder_1h_sent_at";
    const inLabelRo = window === "24h" ? "în 24 de ore" : "în 1 oră";
    const inLabelEn = window === "24h" ? "in 24 hours" : "in 1 hour";

    const { data: rows, error } = await supabase
      .from("bookings")
      .select("id,start_at,student_name,student_email,format,meet_link,manage_token,language," + flag)
      .eq("status", "confirmed")
      .gte("start_at", lo)
      .lte("start_at", hi)
      .is(flag, null);

    if (error) {
      console.error("[reminders] query failed", window, error);
      return { window, sent: 0, error: error.message };
    }

    let sent = 0;
    for (const r of rows ?? []) {
      const lang = (r.language as "ro" | "en") ?? "ro";
      sendBookingEmail(
        "booking-reminder",
        r.student_email,
        {
          name: r.student_name,
          whenLabel: fmtBookingLocal(r.start_at, lang),
          inLabel: lang === "en" ? inLabelEn : inLabelRo,
          format: r.format,
          meetLink: r.meet_link,
          manageUrl: manageUrl(r.manage_token),
          lang,
        },
        `booking-reminder-${window}-${r.id}`,
      );
      await supabase.from("bookings").update({ [flag]: new Date().toISOString() }).eq("id", r.id);
      sent++;
    }
    return { window, sent };
  }

  const results = await Promise.all([
    process("24h", win24Lo, win24Hi),
    process("1h", win1Lo, win1Hi),
  ]);
  return json({ ok: true, results });
});