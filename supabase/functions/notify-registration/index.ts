import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_RECIPIENT = "mohtiibrahim@gmail.com";
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();
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
      .select("id, form_type, name, phone, email, center, format, notes, level, cohort_id, kids_slot_id, child_age")
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formTypeLabel = FORM_TYPE_LABEL[reg.form_type] ?? reg.form_type;
    const zoomLink = Deno.env.get("ZOOM_MEETING_URL") || "";
    const icsUrl = `${supabaseUrl}/functions/v1/registration-ics?id=${reg.id}`;
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
      try {
        const { error } = await supabase.functions.invoke("send-transactional-email", { body });
        if (error) {
          console.error("send-transactional-email failed", body.templateName, error);
        } else {
          console.log("send-transactional-email ok", body.templateName, body.recipientEmail);
        }
      } catch (e) {
        console.error("send-transactional-email invocation error", e);
      }
    };

    // 1) Confirmation to the registrant (only if they provided an email)
    if (reg.email) {
      const tpl = TEMPLATE_BY_FORM_TYPE[reg.form_type];
      if (tpl) {
        const baseData: Record<string, unknown> = {
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
            zoomLink: zoomLink || undefined,
            icsUrl: hasSchedule ? icsUrl : undefined,
          });
        } else if (reg.form_type === "kids") {
          Object.assign(baseData, {
            childAge: reg.child_age || undefined,
            scheduleLabel: scheduleLabel || undefined,
            icsUrl: hasSchedule ? icsUrl : undefined,
          });
        } else if (reg.form_type === "private") {
          Object.assign(baseData, {
            zoomLink: reg.format === "online" ? (zoomLink || undefined) : undefined,
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
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
