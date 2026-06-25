import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const allowedSenderDomains = ["centruldearabalibaneza.com", "notify.centruldearabalibaneza.com"];

function isAllowedSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && allowedSenderDomains.includes(domain);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { password, action, ids, id, lead_status, sender_name, sender_email } = body;
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "get_private_status") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Cerere invalidă" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("id, created_at, name, format, lead_status")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) {
        return jsonResponse({ error: "Cererea nu a fost găsită" });
      }

      return jsonResponse({ data: registration });
    }

    if (!adminPassword || password !== adminPassword) {
      return jsonResponse({ error: "Parolă incorectă" });
    }

    if (action === "list_capacities") {
      const { data, error } = await supabase
        .from("group_capacities")
        .select("id, form_type, level, max_seats, min_seats")
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "update_capacity") {
      const { id: capId, max_seats, min_seats } = body;
      if (typeof capId !== "string") return jsonResponse({ error: "ID invalid" });
      const max = Number(max_seats);
      const min = Number(min_seats);
      if (!Number.isInteger(max) || !Number.isInteger(min) || max < 1 || min < 1 || min > max) {
        return jsonResponse({ error: "Valori invalide (min ≤ max, ambele ≥ 1)" });
      }
      const { data, error } = await supabase
        .from("group_capacities")
        .update({ max_seats: max, min_seats: min, updated_at: new Date().toISOString() })
        .eq("id", capId)
        .select("id, form_type, level, max_seats, min_seats")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    // ============ Group cohorts ============
    if (action === "list_cohorts") {
      const { data, error } = await supabase
        .from("group_cohorts")
        .select("id, form_type, level, start_date, schedule_label_ro, schedule_label_en, max_seats, is_active, status, sort_order")
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: true })
        .order("start_date", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_cohort") {
      const {
        id: cId,
        form_type,
        level: cLevel,
        start_date,
        schedule_label_ro,
        schedule_label_en,
        max_seats,
        is_active,
        status,
        sort_order,
      } = body;
      if (!["group", "kids"].includes(form_type)) {
        return jsonResponse({ error: "Tip invalid (group/kids)" });
      }
      if (typeof start_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
        return jsonResponse({ error: "Data invalidă (YYYY-MM-DD)" });
      }
      const max = Number(max_seats);
      if (!Number.isInteger(max) || max < 1) {
        return jsonResponse({ error: "Locuri invalide" });
      }
      const ALLOWED_COHORT_STATUSES = [
        "draft","forming","minimum_reached","confirmed","full","in_progress","completed","cancelled",
      ];
      const payload: Record<string, unknown> = {
        form_type,
        level: form_type === "kids" ? null : (cLevel || null),
        start_date,
        schedule_label_ro: typeof schedule_label_ro === "string" ? schedule_label_ro : "",
        schedule_label_en: typeof schedule_label_en === "string" ? schedule_label_en : "",
        max_seats: max,
        is_active: is_active !== false,
        sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      };
      if (typeof status === "string" && ALLOWED_COHORT_STATUSES.includes(status)) {
        payload.status = status;
      }
      if (typeof cId === "string" && cId) {
        const { data, error } = await supabase
          .from("group_cohorts").update(payload).eq("id", cId).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }
      const { data, error } = await supabase
        .from("group_cohorts").insert(payload).select().single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_cohort") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase.from("group_cohorts").delete().eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============ Kids weekly slots ============
    if (action === "list_kids_slots") {
      const { data, error } = await supabase
        .from("kids_class_slots")
        .select("id, weekday, start_time, duration_min, format, location, max_seats, is_active, sort_order")
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_kids_slot") {
      const {
        id: sId,
        weekday,
        start_time,
        duration_min,
        format: kFormat,
        location,
        max_seats,
        is_active,
        sort_order,
      } = body;
      const wd = Number(weekday);
      if (!Number.isInteger(wd) || wd < 1 || wd > 7) {
        return jsonResponse({ error: "Zi invalidă (1-7)" });
      }
      if (typeof start_time !== "string" || !/^\d{2}:\d{2}(:\d{2})?$/.test(start_time)) {
        return jsonResponse({ error: "Oră invalidă" });
      }
      if (!["online", "physical"].includes(kFormat)) {
        return jsonResponse({ error: "Format invalid" });
      }
      const max = Number(max_seats);
      const dur = Number(duration_min);
      if (!Number.isInteger(max) || max < 1 || !Number.isInteger(dur) || dur < 15) {
        return jsonResponse({ error: "Locuri/durată invalide" });
      }
      const payload = {
        weekday: wd,
        start_time,
        duration_min: dur,
        format: kFormat,
        location: typeof location === "string" ? location.trim() || null : null,
        max_seats: max,
        is_active: is_active !== false,
        sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      };
      if (typeof sId === "string" && sId) {
        const { data, error } = await supabase
          .from("kids_class_slots").update(payload).eq("id", sId).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }
      const { data, error } = await supabase
        .from("kids_class_slots").insert(payload).select().single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_kids_slot") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase.from("kids_class_slots").delete().eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "list_availability_rules") {
      const { data, error } = await supabase
        .from("availability_rules")
        .select("id, weekday, start_time, end_time, is_active")
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_availability_rule") {
      const { id: ruleId, weekday, start_time, end_time, is_active } = body;
      const wd = Number(weekday);
      if (!Number.isInteger(wd) || wd < 0 || wd > 6) {
        return jsonResponse({ error: "Weekday invalid" });
      }
      if (typeof start_time !== "string" || typeof end_time !== "string") {
        return jsonResponse({ error: "Ore invalide" });
      }
      if (start_time >= end_time) {
        return jsonResponse({ error: "Ora de început trebuie să fie înainte de ora de final" });
      }
      const payload = {
        weekday: wd,
        start_time,
        end_time,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      };
      if (typeof ruleId === "string" && ruleId) {
        const { data, error } = await supabase
          .from("availability_rules")
          .update(payload)
          .eq("id", ruleId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }
      const { data, error } = await supabase
        .from("availability_rules")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_availability_rule") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase.from("availability_rules").delete().eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "list_bookings") {
      const { status_filter } = body;
      let q = supabase
        .from("bookings")
        .select(
          "id, registration_id, event_type_slug, start_at, end_at, student_name, student_email, student_phone, format, notes, status, meet_link, manage_token, created_at, cancelled_at",
        )
        .order("start_at", { ascending: false })
        .limit(500);
      if (typeof status_filter === "string" && status_filter !== "all") {
        q = q.eq("status", status_filter);
      }
      const { data, error } = await q;
      if (error) throw error;
      return jsonResponse({ data });
    }

    // ============ Unified Student Journey ============
    // Returns each registration enriched with its bookings + payment + class info,
    // so the admin sees the full lifecycle in one place.
    if (action === "list_student_journey") {
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select(
          "id, created_at, form_type, name, email, phone, level, format, payment_status, paid_at, lead_status",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (regsError) throw regsError;

      const ids = (regs || []).map((r) => r.id);
      let bookingsByReg = new Map<string, Array<Record<string, unknown>>>();
      if (ids.length > 0) {
        const { data: bookings, error: bErr } = await supabase
          .from("bookings")
          .select("id, registration_id, event_type_slug, start_at, end_at, status, format, meet_link, manage_token")
          .in("registration_id", ids)
          .order("start_at", { ascending: true });
        if (bErr) throw bErr;
        for (const b of bookings || []) {
          const key = b.registration_id as string;
          const arr = bookingsByReg.get(key) ?? [];
          arr.push(b);
          bookingsByReg.set(key, arr);
        }
      }

      const now = Date.now();
      const enriched = (regs || []).map((r) => {
        const bookings = bookingsByReg.get(r.id) ?? [];
        const active = bookings.filter((b) => b.status === "confirmed");
        const nextBooking = active.find((b) => Date.parse(b.start_at as string) >= now) ?? null;
        const lastBooking = active.length ? active[active.length - 1] : null;
        const completed = active.some((b) => Date.parse((b.end_at as string) ?? (b.start_at as string)) < now);
        return {
          ...r,
          bookings_count: bookings.length,
          confirmed_count: active.length,
          next_booking: nextBooking,
          last_booking: lastBooking,
          class_completed: completed,
        };
      });

      return jsonResponse({ data: enriched });
    }

    // ============ Trial → enrollment conversion funnel ============
    if (action === "list_trial_funnel") {
      // 1) All trial registrations
      const { data: trials, error: trialErr } = await supabase
        .from("registrations")
        .select("id, created_at, name, email, phone, lead_status")
        .eq("form_type", "trial")
        .order("created_at", { ascending: false })
        .limit(500);
      if (trialErr) throw trialErr;

      const trialIds = (trials ?? []).map((t) => t.id);
      const trialEmails = (trials ?? [])
        .map((t) => (t.email ?? "").toLowerCase())
        .filter(Boolean);

      // 2) Bookings tied to those trial registrations
      let bookingsByReg = new Map<string, { start_at: string; end_at: string; status: string }>();
      if (trialIds.length > 0) {
        const { data: bookings, error: bErr } = await supabase
          .from("bookings")
          .select("registration_id, start_at, end_at, status")
          .in("registration_id", trialIds);
        if (bErr) throw bErr;
        for (const b of bookings ?? []) {
          bookingsByReg.set(b.registration_id as string, {
            start_at: b.start_at as string,
            end_at: b.end_at as string,
            status: b.status as string,
          });
        }
      }

      // 3) Conversions = paid registrations (non-trial) with same email made
      //    AFTER the trial registration.
      const convertedEmails = new Map<string, { form_type: string; created_at: string }>();
      if (trialEmails.length > 0) {
        const { data: laterRegs, error: lErr } = await supabase
          .from("registrations")
          .select("email, form_type, created_at")
          .in("email", trialEmails)
          .neq("form_type", "trial")
          .order("created_at", { ascending: true });
        if (lErr) throw lErr;
        for (const r of laterRegs ?? []) {
          const key = (r.email ?? "").toLowerCase();
          if (!key) continue;
          if (!convertedEmails.has(key)) {
            convertedEmails.set(key, {
              form_type: r.form_type as string,
              created_at: r.created_at as string,
            });
          }
        }
      }

      const now = Date.now();
      const enriched = (trials ?? []).map((t) => {
        const booking = bookingsByReg.get(t.id) ?? null;
        const emailKey = (t.email ?? "").toLowerCase();
        const conversion = emailKey ? convertedEmails.get(emailKey) : undefined;
        const validConversion =
          conversion && Date.parse(conversion.created_at) > Date.parse(t.created_at)
            ? conversion
            : null;
        const attended =
          booking?.status === "confirmed" &&
          Date.parse(booking.end_at) < now;
        return {
          ...t,
          booked: !!booking && booking.status === "confirmed",
          booking_start_at: booking?.start_at ?? null,
          attended,
          converted: !!validConversion,
          converted_to: validConversion?.form_type ?? null,
          converted_at: validConversion?.created_at ?? null,
        };
      });

      const counts = {
        registered: enriched.length,
        booked: enriched.filter((r) => r.booked).length,
        attended: enriched.filter((r) => r.attended).length,
        converted: enriched.filter((r) => r.converted).length,
      };

      return jsonResponse({ data: enriched, counts });
    }

    if (action === "cancel_booking") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select("manage_token")
        .eq("id", id)
        .single();
      if (bErr || !booking) return jsonResponse({ error: "Programare negăsită" });
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-manage/${booking.manage_token}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
        },
      );
      const out = await resp.json().catch(() => ({}));
      if (!resp.ok || out?.error) return jsonResponse({ error: out?.error || "Anulare eșuată" });
      return jsonResponse({ success: true });
    }

    if (action === "list_notifications") {
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select("id, created_at, name, phone, email, form_type, format, center, whatsapp_sent_at, lead_status")
        .order("created_at", { ascending: false });
      if (regsError) throw regsError;

      const emails = (regs || [])
        .map((r) => r.email)
        .filter((e): e is string => !!e)
        .map((e) => e.toLowerCase());

      const templates = [
        "group-registration-confirmation",
        "private-registration-confirmation",
        "kids-registration-confirmation",
      ];

      let logs: Array<{
        recipient_email: string;
        template_name: string;
        status: string;
        created_at: string;
        message_id: string | null;
      }> = [];

      if (emails.length > 0) {
        const { data: logData, error: logError } = await supabase
          .from("email_send_log")
          .select("recipient_email, template_name, status, created_at, message_id")
          .in("template_name", templates)
          .in("recipient_email", emails)
          .order("created_at", { ascending: false });
        if (logError) throw logError;
        logs = logData || [];
      }

      // Latest status per (email, template)
      const latestByKey = new Map<string, { status: string; created_at: string }>();
      for (const log of logs) {
        const key = `${log.recipient_email.toLowerCase()}|${log.template_name}`;
        if (!latestByKey.has(key)) {
          latestByKey.set(key, { status: log.status, created_at: log.created_at });
        }
      }

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };

      const enriched = (regs || []).map((r) => {
        const tmpl = templateByForm[r.form_type];
        const latest =
          r.email && tmpl
            ? latestByKey.get(`${r.email.toLowerCase()}|${tmpl}`)
            : undefined;
        return {
          ...r,
          email_status: latest?.status || (r.email ? "not_sent" : "no_email"),
          email_sent_at: latest?.created_at || null,
        };
      });

      return jsonResponse({ data: enriched });
    }

    if (action === "mark_whatsapp_sent") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const clear = body.clear === true;
      const { data, error } = await supabase
        .from("registrations")
        .update({ whatsapp_sent_at: clear ? null : new Date().toISOString() })
        .eq("id", id)
        .select("id, whatsapp_sent_at")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "resend_confirmation") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, name, email, form_type")
        .eq("id", id)
        .single();
      if (regError) throw regError;
      if (!reg.email) return jsonResponse({ error: "Lead-ul nu are email" });

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };
      const templateName = templateByForm[reg.form_type];
      if (!templateName) return jsonResponse({ error: "Tip înscriere necunoscut" });

      const invokeResp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            templateName,
            recipientEmail: reg.email,
            idempotencyKey: `reg-resend-${reg.id}-${Date.now()}`,
            templateData: { name: reg.name },
          }),
        }
      );
      const invokeData = await invokeResp.json().catch(() => ({}));
      if (!invokeResp.ok || invokeData?.error) {
        return jsonResponse({ error: invokeData?.error || "Trimitere eșuată" });
      }
      return jsonResponse({ success: true });
    }

    if (action === "update_email_settings") {
      const senderName = typeof sender_name === "string" ? sender_name.trim() : "";
      const senderEmail = typeof sender_email === "string" ? sender_email.trim().toLowerCase() : "";

      if (senderName.length < 2 || senderName.length > 80 || !isAllowedSenderEmail(senderEmail)) {
        return jsonResponse({ error: "Numele sau emailul expeditorului este invalid" });
      }

      const { data, error } = await supabase
        .from("email_confirmation_settings")
        .upsert({ id: 1, sender_name: senderName, sender_email: senderEmail }, { onConflict: "id" })
        .select("sender_name, sender_email")
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, settings: data });
    }

    // Delete action
    if (action === "delete" && Array.isArray(ids) && ids.length > 0) {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "update_status") {
      const ALLOWED_LEAD_STATUSES = [
        "new",
        "contacted",
        "qualified",
        "no_response",
        "not_suitable",
        "spam",
        "converted",
      ];
      if (typeof id !== "string" || !ALLOWED_LEAD_STATUSES.includes(lead_status)) {
        return jsonResponse({ error: "Status invalid" });
      }

      const { data: existing, error: existingError } = await supabase
        .from("registrations")
        .select("lead_status")
        .eq("id", id)
        .single();

      if (existingError) throw existingError;

      const { data, error } = await supabase
        .from("registrations")
        .update({ lead_status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      if ((existing?.lead_status || "new") !== lead_status) {
        const { error: historyError } = await supabase
          .from("lead_status_history")
          .insert({
            registration_id: id,
            previous_status: existing?.lead_status || "new",
            new_status: lead_status,
            changed_by: "admin",
          });

        if (historyError) throw historyError;
      }

      return jsonResponse({ success: true, data });
    }

    if (action === "get_private_lead") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Lead invalid" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) throw registrationError;

      const { data: history, error: historyError } = await supabase
        .from("lead_status_history")
        .select("*")
        .eq("registration_id", id)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;

      return jsonResponse({ data: { registration, history } });
    }

    // Default: list all
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: settings, error: settingsError } = await supabase
      .from("email_confirmation_settings")
      .select("sender_name, sender_email")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    return jsonResponse({ data, settings: settings || { sender_name: "Arabă Libaneză cu Ibra", sender_email: "noreply@centruldearabalibaneza.com" } });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
