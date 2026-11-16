import { createFileRoute } from "@tanstack/react-router";
import {
  buildAccount,
  buildCredits,
  type AccountCohortRow,
  type AccountCreditRow,
  type AccountRegistrationRow,
} from "@/lib/myAccount";

/**
 * "Contul meu": the signed-in student's own courses, months, payments and
 * booked lessons (owner, 14 Nov 2026).
 *
 * Who is asking is decided by Supabase Auth and nothing else: the caller sends
 * the session token, the server asks Auth whose it is, and only a confirmed,
 * non-anonymous address counts. The rows returned are the ones whose stored
 * sign-up email is that address (AGENTS.md: ownership = Auth-confirmed email
 * matched to the stored registration email). No email travels in the URL or
 * the body, so a visitor cannot ask for someone else's account.
 */
function escapeIlike(value: string): string {
  return value.replace(/([%_\\])/g, "\\$1");
}

const noStore = { "Cache-Control": "no-store" };
const refuse = (status: number, error: string) =>
  Response.json({ error }, { status, headers: noStore });

export const Route = createFileRoute("/api/public/my-account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = /^Bearer\s+(\S+)$/i.exec(
          request.headers.get("authorization") ?? "",
        )?.[1];
        if (!token) return refuse(401, "sign in");

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
          return refuse(401, "sign in");

        const limit = await supabaseAdmin.rpc("check_and_record_rate_limit", {
          p_bucket: `my_account:${user.id}`,
          p_max: 240,
          p_window_seconds: 3600,
        });
        if (limit.error) {
          console.error("[my-account] rate limit check failed", limit.error);
          return refuse(503, "service unavailable");
        }
        if (!limit.data) return refuse(429, "too many requests");

        const address = escapeIlike(email);
        const { data: regs, error: regError } = await supabaseAdmin
          .from("registrations")
          .select(
            "id,form_type,level,format,created_at,payment_status,months_total,subscription_status,canceled_at,refunded_amount,quantity,cohort_id,registration_payments(kind,method,amount_lei,paid_at,month_from,month_to)",
          )
          .ilike("email", address)
          .is("anonymized_at", null)
          .order("created_at", { ascending: false });
        if (regError) {
          console.error("[my-account] registration lookup failed", regError);
          return refuse(503, "service unavailable");
        }
        const rows = (regs ?? []) as unknown as AccountRegistrationRow[];

        const cohortIds = [
          ...new Set(rows.map((r) => r.cohort_id).filter(Boolean)),
        ] as string[];
        let cohorts: AccountCohortRow[] = [];
        if (cohortIds.length) {
          const { data, error } = await supabaseAdmin
            .from("group_cohorts")
            .select(
              "id,status,level,format,start_date,price_lei,title_ro,title_en,schedule_label_ro,schedule_label_en",
            )
            .in("id", cohortIds);
          // Without the group there is no price and no start date: say the
          // service is down rather than show months and amounts that may be
          // wrong.
          if (error) {
            console.error("[my-account] group lookup failed", error);
            return refuse(503, "service unavailable");
          }
          cohorts = (data ?? []) as unknown as AccountCohortRow[];
        }

        const { data: bookings, error: bookingError } = await supabaseAdmin
          .from("bookings")
          .select(
            "id,event_type_slug,start_at,end_at,status,format,meet_link,manage_token,booking_event_types(name_ro,name_en,duration_min)",
          )
          .ilike("student_email", address)
          .order("start_at", { ascending: false })
          .limit(50);
        if (bookingError)
          console.error("[my-account] booking lookup failed", bookingError);

        // The student's credit (Terms, section 4): the one held under this
        // address. The tables are newer than the generated types, hence the
        // untyped handle; only the server can read them at all.
        const { data: credits, error: creditError } = await (
          supabaseAdmin as unknown as {
            from: (table: string) => {
              select: (columns: string) => {
                ilike: (
                  column: string,
                  value: string,
                ) => Promise<{ data: unknown; error: unknown }>;
              };
            };
          }
        )
          .from("student_credits")
          .select(
            "id,amount_lei,origin,created_at,expires_at,refund_at_expiry,reminder_sent_at,student_credit_uses(kind,amount_lei)",
          )
          .ilike("holder_email", address);
        if (creditError)
          console.error("[my-account] credit lookup failed", creditError);

        return Response.json(
          {
            email,
            enrolments: buildAccount(rows, cohorts),
            bookings: bookings ?? [],
            credits: buildCredits((credits ?? []) as AccountCreditRow[]),
          },
          { headers: noStore },
        );
      },
    },
  },
});
