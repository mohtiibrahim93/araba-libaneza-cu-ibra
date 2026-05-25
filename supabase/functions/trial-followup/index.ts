import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Cron-driven. Finds confirmed trial bookings whose lesson ended between
 * 1h and 48h ago and have not yet received the enrollment follow-up email.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  const hi = new Date(now - 60 * 60_000).toISOString();      // ended >= 1h ago
  const lo = new Date(now - 48 * 3_600_000).toISOString();   // ended <= 48h ago

  const { data: rows, error } = await supabase
    .from("bookings")
    .select("id, student_name, student_email, language")
    .eq("status", "confirmed")
    .eq("event_type_slug", "trial")
    .gte("end_at", lo)
    .lte("end_at", hi)
    .is("trial_followup_sent_at", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const r of rows ?? []) {
    const lang = (r.language as "ro" | "en") ?? "ro";
    try {
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            templateName: "trial-followup",
            recipientEmail: r.student_email,
            idempotencyKey: `trial-followup-${r.id}`,
            templateData: {
              name: r.student_name,
              lang,
              enrollUrl: "https://centruldearabalibaneza.com/#courses",
            },
          }),
        },
      );
      if (!resp.ok) {
        console.error("[trial-followup] send failed", r.id, await resp.text());
        continue;
      }
      await supabase
        .from("bookings")
        .update({ trial_followup_sent_at: new Date().toISOString() })
        .eq("id", r.id);
      sent++;
    } catch (e) {
      console.error("[trial-followup] error", r.id, e);
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, considered: rows?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});