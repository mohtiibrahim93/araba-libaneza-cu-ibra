import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";
import { callerOwnsRegistration, signRegistrationId } from "../_shared/registration-access.ts";


const ADMIN_RECIPIENT = "marhaba@centruldearabalibaneza.com";
const SITE_URL = "https://centruldearabalibaneza.com";
const WEEKDAY_RO = ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"];
const MONTHS_RO = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sep.", "oct.", "noi.", "dec."];
const TEMPLATE_BY_FORM_TYPE: Record<string, string> = {
  group: "group-registration-confirmation",
  private: "private-registration-confirmation",
  kids: "kids-registration-confirmation",
};
const FORM_TYPE_LABEL: Record<string, string> = {
  group: "Grup",
  private: "Privat",
  kids: "Copii",
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId, email: callerEmail } = await req.json();
    if (!registrationId || typeof registrationId !== "string") {
      return new Response(JSON.stringify({ error: "registrationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up the registration server-side. This prevents callers from
    // spoofing arbitrary recipient emails — we only send to what is in DB.
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("id, created_at, form_type, name, phone, email, center, format, notes, level, cohort_id, kids_slot_id, child_age, language, payment_status")
      .eq("id", registrationId)
      .maybeSingle();

    // Only the visitor who just submitted may trigger the confirmation:
    // the registration must be fresh (30 min) and the caller must supply
    // the same email when one is stored.
    const createdMs = reg?.created_at ? Date.parse(reg.created_at) : NaN;
    const fresh = Number.isFinite(createdMs) && Date.now() - createdMs < 30 * 60 * 1000;
    if (regErr || !reg || !fresh || !(await callerOwnsRegistration(reg, { email: callerEmail }))) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Abuse guard: an unauthenticated caller with a known registrationId could
    // call this in a loop to spam the student. Reject if we have already
    // attempted (or completed) a send for this registration's idempotency keys.
    const idemKeys = [`reg-${reg.id}`, `admin-reg-${reg.id}`];
    const { data: prior } = await supabase
      .from("email_send_log")
      .select("idempotency_key")
      .in("idempotency_key", idemKeys)
      .limit(1);
    if (prior && prior.length > 0) {
      return new Response(JSON.stringify({ success: true, deduped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formTypeLabel = FORM_TYPE_LABEL[reg.form_type] ?? reg.form_type;
    const zoomLink = Deno.env.get("ZOOM_MEETING_URL") || "";
    const icsUrl = `${supabaseUrl}/functions/v1/registration-ics?id=${reg.id}&sig=${await signRegistrationId(reg.id)}`;
    const manageBase = `${SITE_URL}`; // general management/info entry point

    // Pull schedule context where available
    let scheduleLabel = "";
    let startDateLabel = "";
    let hasSchedule = false;
    if (reg.form_type === "group" && reg.cohort_id) {
      const { data: c } = await supabase.from("group_cohorts")
        .select("start_date, schedule_label_ro").eq("id", reg.cohort_id).maybeSingle();
      if (c) {
        scheduleLabel = c.schedule_label_ro || "";
        if (c.start_date) {
          const [y, m, d] = String(c.start_date).split("-").map(Number);
          startDateLabel = `${d} ${MONTHS_RO[m - 1]} ${y}`;
          hasSchedule = true;
        }
      }
    } else if (reg.form_type === "kids" && reg.kids_slot_id) {
      const { data: s } = await supabase.from("kids_class_slots")
        .select("weekday, start_time, duration_min").eq("id", reg.kids_slot_id).maybeSingle();
      if (s) {
        const [hh, mm] = String(s.start_time).split(":");
        const day = WEEKDAY_RO[Math.max(0, Math.min(6, (s.weekday ?? 1) - 1))];
        scheduleLabel = `${day}, ${hh}:${mm}`;
        hasSchedule = true;
      }
    }

    const invokeEmail = async (body: Record<string, unknown>) => {
      const templateName = String(body.templateName);
      try {
        const result = await sendTemplateEmail(
          templateName,
          String(body.recipientEmail ?? ""),
          {
            templateData: (body.templateData ?? {}) as Record<string, unknown>,
            idempotencyKey: body.idempotencyKey as string | undefined,
          },
        );
        if (result.sent) {
          console.log("managed email sent", templateName);
        } else {
          console.log("managed email suppressed", templateName);
        }
      } catch (e) {
        console.error("managed email send failed", templateName, e);
      }
    };


    /**
     * Whether this registration has actually been paid for.
     *
     * This function runs the moment the form is submitted, which is before any
     * payment exists — so for almost every registration this is false, and that
     * is the point. The email it sends is a receipt for a *request*: its words
     * already say so ("am primit cererea ta", "plata este cea care îți confirmă
     * locul"). But it was also handing over the Zoom link under a heading
     * telling the reader to save it because they would use it for every online
     * lesson, and an .ics calendar invite for a course they had not bought.
     *
     * One static Zoom room serves every online lesson, so that link is the
     * class. Anyone who filled in the form — no card, no intention to pay —
     * received the key to it and a calendar entry saying they were in.
     *
     * Paid registrants lose nothing: the welcome message within 24 hours of
     * payment, which step 3 of the same email promises, is where the joining
     * details belong.
     */
    const paid = reg.payment_status === "paid";

    // 1) Confirmation to the registrant (only if they provided an email)
    if (reg.email) {
      const tpl = TEMPLATE_BY_FORM_TYPE[reg.form_type];
      if (tpl) {
        const baseData: Record<string, unknown> = {
          // The language the visitor was reading the site in. It was written
          // on the row from the start and read by nothing: every confirmation
          // went out in Romanian, including to someone who enrolled in English
          // on a cohort that is taught in English.
          language: reg.language || "ro",
          name: reg.name,
          format: reg.format || undefined,
          manageUrl: manageBase,
        };
        if (reg.form_type === "group") {
          Object.assign(baseData, {
            level: reg.level || undefined,
            center: reg.center || undefined,
            scheduleLabel: scheduleLabel || undefined,
            startDateLabel: startDateLabel || undefined,
            zoomLink: paid ? zoomLink || undefined : undefined,
            icsUrl: paid && hasSchedule ? icsUrl : undefined,
          });
        } else if (reg.form_type === "kids") {
          Object.assign(baseData, {
            childAge: reg.child_age || undefined,
            scheduleLabel: scheduleLabel || undefined,
            icsUrl: paid && hasSchedule ? icsUrl : undefined,
          });
        } else if (reg.form_type === "private") {
          Object.assign(baseData, {
            zoomLink: paid && reg.format === "online" ? (zoomLink || undefined) : undefined,
            message: reg.notes || undefined,
          });
        }
        await invokeEmail({
          templateName: tpl,
          recipientEmail: reg.email,
          idempotencyKey: `reg-${reg.id}`,
          templateData: baseData,
        });
      }
    }

    // 2) Admin notification with the full lead details
    await invokeEmail({
      templateName: "admin-new-registration",
      recipientEmail: ADMIN_RECIPIENT,
      idempotencyKey: `admin-reg-${reg.id}`,
      templateData: {
        name: reg.name,
        phone: reg.phone,
        email: reg.email || "",
        formType: formTypeLabel,
        format: reg.format || "",
        center: reg.center || "",
        notes: reg.notes || "",
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("notify-registration error:", msg);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
