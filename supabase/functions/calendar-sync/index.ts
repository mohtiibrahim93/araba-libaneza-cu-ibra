import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { reconcileCalendar } from "../_shared/calendar-reconciliation.ts";
import { notifyGoogleCancellations } from "../_shared/calendar-cancel-emails.ts";
/**
 * Scheduled read-back/retry. No unauthenticated invocation. The only emails
 * are for lessons deleted in Google Calendar: the student and the owner are
 * told (calendar-cancel-emails.ts); nothing is refunded automatically.
 */
Deno.serve(async (req) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  if (
    !(cronSecret && req.headers.get("x-cron-secret") === cronSecret) &&
    !(serviceKey && bearer === serviceKey)
  )
    return json({ error: "Unauthorized" }, 403);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const result = await reconcileCalendar(db, {
      lovableKey: Deno.env.get("LOVABLE_API_KEY"),
      calendarKey: Deno.env.get("GOOGLE_CALENDAR_API_KEY"),
      zoomUrl: Deno.env.get("ZOOM_MEETING_URL"),
      from: new Date(Date.now() - 7 * 86400000).toISOString(),
      to: new Date(Date.now() + 400 * 86400000).toISOString(),
    });
    await notifyGoogleCancellations(result.cancelledInGoogle);
    return json(
      { success: result.errors.length === 0, data: result },
      result.errors.length ? 207 : 200,
    );
  } catch (error) {
    console.error("[calendar-sync] failed", error);
    return json({ error: "Calendar synchronization failed" }, 502);
  }
});
