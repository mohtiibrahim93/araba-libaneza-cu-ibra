import { createFileRoute } from "@tanstack/react-router";
import {
  needsEarlyStartRequest,
  type AccountRegistrationRow,
} from "@/lib/myAccount";

/**
 * The student's request, made in "Contul meu", for the lessons to start
 * inside the 14-day withdrawal period (owner, 17 Nov 2026; Terms, section 4).
 * It is for the student the owner signed up by hand, who saw neither the box
 * in the sign-up form nor the one at checkout.
 *
 * Who is asking is decided by Supabase Auth: only a confirmed, non-anonymous
 * address counts, and the sign-up must be stored under that same address
 * (AGENTS.md: ownership = Auth-confirmed email matched to the stored
 * registration email). The body names the sign-up and carries the tick,
 * nothing else; the time recorded is the server's.
 */
const noStore = { "Cache-Control": "no-store" };
const answer = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: noStore });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/early-start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = /^Bearer\s+(\S+)$/i.exec(
          request.headers.get("authorization") ?? "",
        )?.[1];
        if (!token) return answer(401, { error: "sign in" });

        const body = (await request.json().catch(() => null)) as {
          registrationId?: unknown;
          accepted?: unknown;
        } | null;
        const registrationId = body?.registrationId;
        if (typeof registrationId !== "string" || !UUID.test(registrationId))
          return answer(400, { error: "invalid request" });
        // Only a real tick is a request, as at checkout.
        if (body?.accepted !== true)
          return answer(400, { error: "box not ticked" });

        const { supabaseAdmin } =
          await import("@/integrations/supabase/client.server");
        const { data: auth, error: authError } =
          await supabaseAdmin.auth.getUser(token);
        const user = auth?.user;
        const email = user?.email?.trim().toLowerCase();
        if (
          authError ||
          !user ||
          !email ||
          !user.email_confirmed_at ||
          user.is_anonymous
        )
          return answer(401, { error: "sign in" });

        const limit = await supabaseAdmin.rpc("check_and_record_rate_limit", {
          p_bucket: `early_start:${user.id}`,
          p_max: 30,
          p_window_seconds: 3600,
        });
        if (limit.error) {
          console.error("[early-start] rate limit check failed", limit.error);
          return answer(503, { error: "service unavailable" });
        }
        if (!limit.data) return answer(429, { error: "too many requests" });

        const { data: reg, error: regError } = await supabaseAdmin
          .from("registrations")
          .select(
            "id,email,form_type,created_at,canceled_at,early_start_requested_at,cohort_id,anonymized_at",
          )
          .eq("id", registrationId)
          .maybeSingle();
        if (regError) {
          console.error("[early-start] registration lookup failed", regError);
          return answer(503, { error: "service unavailable" });
        }
        // Someone else's sign-up looks the same as no sign-up at all.
        if (
          !reg ||
          reg.anonymized_at ||
          (reg.email ?? "").trim().toLowerCase() !== email
        )
          return answer(404, { error: "not found" });
        if (reg.early_start_requested_at)
          return answer(200, {
            ok: true,
            requestedAt: reg.early_start_requested_at,
          });
        if (!reg.cohort_id) return answer(409, { error: "not needed" });

        const { data: cohort, error: cohortError } = await supabaseAdmin
          .from("group_cohorts")
          .select("start_date")
          .eq("id", reg.cohort_id)
          .maybeSingle();
        if (cohortError) {
          console.error("[early-start] group lookup failed", cohortError);
          return answer(503, { error: "service unavailable" });
        }
        if (
          !needsEarlyStartRequest(
            reg as unknown as AccountRegistrationRow,
            cohort?.start_date ?? null,
          )
        )
          return answer(409, { error: "not needed" });

        const requestedAt = new Date().toISOString();
        const { error: updateError } = await supabaseAdmin
          .from("registrations")
          .update({ early_start_requested_at: requestedAt })
          .eq("id", reg.id)
          .is("early_start_requested_at", null);
        if (updateError) {
          console.error("[early-start] update failed", updateError);
          return answer(503, { error: "service unavailable" });
        }
        const { error: auditError } = await supabaseAdmin
          .from("audit_logs")
          .insert({
            actor: email,
            action: "student_early_start",
            registration_id: reg.id,
            details: { source: "my_account", requested_at: requestedAt },
          });
        if (auditError)
          console.error("[early-start] audit log failed", auditError);
        return answer(200, { ok: true, requestedAt });
      },
    },
  },
});
