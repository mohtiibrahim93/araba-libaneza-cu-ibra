import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * Cron-driven (twice daily). Sends exactly two follow-up emails per trial:
 *   - Stage 1: shortly after the lesson (ended 1h–18h ago)
 *   - Stage 2: a couple of days later (ended 48h–72h ago)
 * Each stage is deduped by its own *_sent_at flag so each booking receives
 * each stage at most once.
 */
Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Cron-only endpoint: require the shared secret header (fail-closed).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();

  type Stage = {
    key: "1" | "2";
    flag: "trial_followup_sent_at" | "trial_followup_2_sent_at";
    lo: string;
    hi: string;
    idemPrefix: string;
  };

  const stages: Stage[] = [
    {
      key: "1",
      flag: "trial_followup_sent_at",
      lo: new Date(now - 18 * 3_600_000).toISOString(),
      hi: new Date(now - 1 * 3_600_000).toISOString(),
      idemPrefix: "trial-followup",
    },
    {
      key: "2",
      flag: "trial_followup_2_sent_at",
      lo: new Date(now - 72 * 3_600_000).toISOString(),
      hi: new Date(now - 48 * 3_600_000).toISOString(),
      idemPrefix: "trial-followup-2",
    },
  ];

  async function runStage(stage: Stage) {
    const { data: rows, error } = await supabase
      .from("bookings")
      .select("id, student_name, student_email, language, " + stage.flag)
      .eq("status", "confirmed")
      .eq("event_type_slug", "trial")
      .gte("end_at", stage.lo)
      .lte("end_at", stage.hi)
      .is(stage.flag, null);

    if (error) {
      console.error("[trial-followup] query failed", stage.key, error);
      return { stage: stage.key, sent: 0, error: error.message };
    }

    let sent = 0;
    // The select list is built at runtime, so the client can't infer a row type.
    type Row = { id: string; student_name: string; student_email: string; language: string | null };
    for (const r of ((rows ?? []) as unknown as Row[])) {
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
              idempotencyKey: `${stage.idemPrefix}-${r.id}`,
              templateData: {
                name: r.student_name,
                lang,
                stage: stage.key,
                enrollUrl: "https://centruldearabalibaneza.com/#programs",
              },
            }),
          },
        );
        if (!resp.ok) {
          console.error("[trial-followup] send failed", stage.key, r.id, await resp.text());
          continue;
        }
        await supabase
          .from("bookings")
          .update({ [stage.flag]: new Date().toISOString() })
          .eq("id", r.id);
        sent++;
      } catch (e) {
        console.error("[trial-followup] error", stage.key, r.id, e);
      }
    }
    return { stage: stage.key, sent, considered: rows?.length ?? 0 };
  }

  const results = await Promise.all(stages.map(runStage));
  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});