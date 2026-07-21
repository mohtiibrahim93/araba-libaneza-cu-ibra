import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

function jsonResponseWith(cors: Record<string, string>) {
  return (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
}

const allowedSenderDomains = ["centruldearabalibaneza.com", "notify.centruldearabalibaneza.com"];

function isAllowedSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && allowedSenderDomains.includes(domain);
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const jsonResponse = jsonResponseWith(corsHeaders);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ids, id, lead_status, sender_name, sender_email, refund_reason } = body;

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

    // Everything below is admin-only: require a real Supabase Auth session
    // (Google sign-in) whose email is in the ADMIN_EMAILS allowlist secret,
    // instead of a single shared password with no rate limiting or identity.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: userData } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    const callerEmail = userData?.user?.email?.toLowerCase();
    const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = !!callerEmail && adminEmails.includes(callerEmail);

    if (!isAdmin) {
      return jsonResponse({ error: "Neautorizat" });
    }

    if (action === "list_capacities") {
      const { data, error } = await supabase
        .from("group_capacities")
        .select("id, form_type, level, format, max_seats, min_seats, manual_offset")
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("format", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "update_capacity") {
      const { id: capId, max_seats, min_seats, manual_offset } = body;
      if (typeof capId !== "string") return jsonResponse({ error: "ID invalid" });
      const max = Number(max_seats);
      const min = Number(min_seats);
      if (!Number.isInteger(max) || !Number.isInteger(min) || max < 1 || min < 1 || min > max) {
        return jsonResponse({ error: "Valori invalide (min ≤ max, ambele ≥ 1)" });
      }
      const update: Record<string, unknown> = {
        max_seats: max,
        min_seats: min,
        updated_at: new Date().toISOString(),
      };
      if (manual_offset !== undefined) {
        const off = Number(manual_offset);
        if (!Number.isInteger(off) || off < 0) {
          return jsonResponse({ error: "Manual offset invalid (≥ 0)" });
        }
        update.manual_offset = off;
      }
      const { data, error } = await supabase
        .from("group_capacities")
        .update(update)
        .eq("id", capId)
        .select("id, form_type, level, format, max_seats, min_seats, manual_offset")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    // ============ Manual (external-source) signup counts ============
    if (action === "list_manual_signups") {
      const { data, error } = await supabase
        .from("manual_signups")
        .select("id, form_type, level, format, source, count, note, updated_at")
        .order("form_type", { ascending: true })
        .order("level", { ascending: true, nullsFirst: false })
        .order("format", { ascending: true, nullsFirst: true })
        .order("source", { ascending: true });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_manual_signup") {
      const { id: msId, form_type, level, format, source, count, note } = body;
      if (form_type !== "group" && form_type !== "kids") {
        return jsonResponse({ error: "Tip curs invalid" });
      }
      if (format != null && format !== "fizic" && format !== "online") {
        return jsonResponse({ error: "Format invalid" });
      }
      const n = Number(count);
      if (!Number.isInteger(n) || n < 0 || n > 1000) {
        return jsonResponse({ error: "Număr invalid (0–1000)" });
      }
      if (typeof source !== "string" || source.trim().length === 0 || source.length > 40) {
        return jsonResponse({ error: "Sursă invalidă" });
      }
      // Auto-attach group manual signups to the level+format's single active
      // cohort so they count on the cohort card too, not just the level badge.
      // Ambiguous (0 or 2+ matching cohorts) → left unattached; counts at level.
      let cohortId: string | null = null;
      const rowLevel = form_type === "kids" ? null : (level || null);
      const rowFormat = form_type === "kids" ? null : (format || null);
      if (form_type === "group" && rowLevel && rowFormat) {
        const { data: matching } = await supabase
          .from("group_cohorts")
          .select("id")
          .eq("form_type", "group")
          .eq("level", rowLevel)
          .eq("format", rowFormat)
          .eq("is_active", true);
        if (matching && matching.length === 1) cohortId = matching[0].id;
      }
      const row = {
        form_type,
        level: rowLevel,
        format: rowFormat,
        cohort_id: cohortId,
        source: source.trim(),
        count: n,
        note: note != null && typeof note === "string" ? note.slice(0, 500) : null,
        updated_at: new Date().toISOString(),
      };
      let result;
      if (typeof msId === "string" && msId) {
        result = await supabase
          .from("manual_signups")
          .update(row)
          .eq("id", msId)
          .select("id, form_type, level, format, source, count, note, updated_at")
          .single();
      } else {
        result = await supabase
          .from("manual_signups")
          .insert(row)
          .select("id, form_type, level, format, source, count, note, updated_at")
          .single();
      }
      if (result.error) throw result.error;
      return jsonResponse({ success: true, data: result.data });
    }

    if (action === "delete_manual_signup") {
      const { id: msId } = body;
      if (typeof msId !== "string" || !msId) return jsonResponse({ error: "ID invalid" });
      const { error } = await supabase.from("manual_signups").delete().eq("id", msId);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============ Blog CMS (override model) ============
    // A published row replaces the code-shipped article on the public site;
    // deleting the row reverts the article to its code version.
    if (action === "list_blog_articles") {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("slug, title_ro, is_published, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "get_blog_article") {
      const { slug } = body;
      if (typeof slug !== "string" || !/^[a-z0-9-]{3,120}$/.test(slug)) {
        return jsonResponse({ error: "Slug invalid" });
      }
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "upsert_blog_article") {
      const { slug, title_ro, title_en, description_ro, description_en, lead_ro, lead_en, body_ro, body_en, reading_minutes, is_published } = body;
      if (typeof slug !== "string" || !/^[a-z0-9-]{3,120}$/.test(slug)) {
        return jsonResponse({ error: "Slug invalid (litere mici, cifre, cratime)" });
      }
      const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
      const mins = Number(reading_minutes);
      const row = {
        slug,
        title_ro: str(title_ro, 200),
        title_en: str(title_en, 200),
        description_ro: str(description_ro, 300),
        description_en: str(description_en, 300),
        lead_ro: str(lead_ro, 500),
        lead_en: str(lead_en, 500),
        body_ro: str(body_ro, 100_000),
        body_en: str(body_en, 100_000),
        reading_minutes: Number.isInteger(mins) && mins >= 1 && mins <= 60 ? mins : 5,
        is_published: is_published === true,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("blog_articles")
        .upsert(row, { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "delete_blog_article") {
      const { slug } = body;
      if (typeof slug !== "string" || !slug) return jsonResponse({ error: "Slug invalid" });
      const { error } = await supabase.from("blog_articles").delete().eq("slug", slug);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "upload_blog_media") {
      const { file_name, content_type, data_base64 } = body;
      if (typeof file_name !== "string" || typeof content_type !== "string" || typeof data_base64 !== "string") {
        return jsonResponse({ error: "Fișier invalid" });
      }
      const okType = /^(image\/(png|jpe?g|webp|gif|avif)|audio\/(mpeg|mp4|ogg|wav|webm))$/.test(content_type);
      if (!okType) return jsonResponse({ error: "Doar imagini (png/jpg/webp/gif/avif) sau audio (mp3/m4a/ogg/wav)" });
      // ~8 MB decoded cap keeps uploads reasonable for web use.
      if (data_base64.length > 11_000_000) return jsonResponse({ error: "Fișier prea mare (max ~8 MB)" });
      const bytes = Uint8Array.from(atob(data_base64), (c) => c.charCodeAt(0));
      const safeName = file_name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").slice(-80);
      const path = `${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("blog-media").upload(path, bytes, {
        contentType: content_type,
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("blog-media").getPublicUrl(path);
      return jsonResponse({ success: true, url: pub.publicUrl });
    }

    // ============ Group cohorts ============
    if (action === "list_cohorts") {
      const { data, error } = await supabase
        .from("group_cohorts")
        .select("id, form_type, level, format, start_date, schedule_label_ro, schedule_label_en, max_seats, is_active, status, sort_order, manual_offset")
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
        format: cFormat,
        start_date,
        schedule_label_ro,
        schedule_label_en,
        max_seats,
        is_active,
        status,
        sort_order,
        manual_offset,
      } = body;
      if (!["group", "kids"].includes(form_type)) {
        return jsonResponse({ error: "Tip invalid (group/kids)" });
      }
      if (form_type === "group" && cFormat != null && cFormat !== "fizic" && cFormat !== "online") {
        return jsonResponse({ error: "Format invalid (fizic/online)" });
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
        format: form_type === "kids" ? null : (cFormat || null),
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
      if (manual_offset !== undefined) {
        const off = Number(manual_offset);
        if (!Number.isInteger(off) || off < 0) {
          return jsonResponse({ error: "Manual offset invalid (≥ 0)" });
        }
        payload.manual_offset = off;
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

    // ============ Course requests ("notify me when the group starts") ============
    if (action === "list_course_requests") {
      const { data, error } = await supabase
        .from("course_requests")
        .select("id, created_at, name, phone, email, level, format, preferred_language, lesson_type, status, notes")
        .order("created_at", { ascending: false })
        .limit(500);
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

    // Delete action. Rows that carry money (paid, refunded, subscription…)
    // are financial records and must never be deleted — only anonymized —
    // so the local payment trail survives (Stripe alone is not enough for
    // the admin's own history/exports).
    if (action === "delete" && Array.isArray(ids) && ids.length > 0) {
      const { data: rows, error: rowsErr } = await supabase
        .from("registrations")
        .select("id, payment_status, paid_at, refunded_at, refunded_amount, stripe_subscription_id")
        .in("id", ids);
      if (rowsErr) throw rowsErr;

      const hasMoney = (r: {
        payment_status?: string | null;
        paid_at?: string | null;
        refunded_at?: string | null;
        refunded_amount?: number | null;
        stripe_subscription_id?: string | null;
      }) =>
        ["paid", "refunded", "past_due"].includes(r.payment_status ?? "") ||
        !!r.paid_at ||
        !!r.refunded_at ||
        (r.refunded_amount ?? 0) > 0 ||
        !!r.stripe_subscription_id;

      const blocked = (rows ?? []).filter(hasMoney).map((r) => r.id);
      const deletable = (rows ?? []).filter((r) => !hasMoney(r)).map((r) => r.id);

      if (deletable.length > 0) {
        const { error } = await supabase.from("registrations").delete().in("id", deletable);
        if (error) throw error;
        await supabase.from("audit_logs").insert(
          deletable.map((rid) => ({
            actor: callerEmail!,
            action: "delete",
            registration_id: rid,
          })),
        );
      }

      return jsonResponse({ success: true, deleted: deletable.length, blocked: blocked.length });
    }

    // Anonymize action (GDPR / rows with payments): strips personal data,
    // keeps the financial and status history intact. Irreversible.
    if (action === "anonymize" && Array.isArray(ids) && ids.length > 0) {
      const { data: updated, error } = await supabase
        .from("registrations")
        .update({
          name: "Anonimizat (GDPR)",
          email: null,
          phone: "anonimizat",
          notes: null,
          child_age: null,
          anonymized_at: new Date().toISOString(),
        })
        .in("id", ids)
        .is("anonymized_at", null)
        .select("id");
      if (error) throw error;

      const done = (updated ?? []).map((r) => r.id);
      if (done.length > 0) {
        await supabase.from("audit_logs").insert(
          done.map((rid) => ({
            actor: callerEmail!,
            action: "anonymize",
            registration_id: rid,
          })),
        );
      }
      return jsonResponse({ success: true, anonymized: done.length });
    }

    // Recent admin activity (audit trail).
    if (action === "list_audit_logs") {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return jsonResponse({ data });
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
        await supabase.from("audit_logs").insert({
          actor: callerEmail!,
          action: "update_status",
          registration_id: id,
          details: { from: existing?.lead_status || "new", to: lead_status },
        });
      }

      return jsonResponse({ success: true, data });
    }

    if (action === "refund") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "ID invalid" });
      }
      if (refund_reason != null && (typeof refund_reason !== "string" || refund_reason.length > 500)) {
        return jsonResponse({ error: "Motiv invalid" });
      }

      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, payment_status, stripe_session_id, refunded_at")
        .eq("id", id)
        .maybeSingle();

      if (regError) throw regError;
      if (!reg) return jsonResponse({ error: "Înscrierea nu a fost găsită" });
      if (reg.refunded_at) return jsonResponse({ error: "Deja rambursat" });
      if (reg.payment_status !== "paid" || !reg.stripe_session_id) {
        return jsonResponse({ error: "Doar înscrierile plătite pot fi rambursate" });
      }

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // stripe_session_id holds either a PaymentIntent id (cs create-payment-intent
      // flow, "pi_...") or a Checkout Session id (create-checkout flow, "cs_...").
      // Stripe's refund API needs a payment_intent id either way.
      let paymentIntentId = reg.stripe_session_id;
      if (paymentIntentId.startsWith("cs_")) {
        const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
        const pi = session.payment_intent;
        paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? "";
        if (!paymentIntentId) {
          return jsonResponse({ error: "Nu s-a găsit plata Stripe asociată" });
        }
      }

      let refund;
      try {
        refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
      } catch (stripeErr) {
        console.error("[admin-registrations] stripe refund failed", stripeErr);
        const msg = stripeErr instanceof Error ? stripeErr.message : "Eroare Stripe";
        return jsonResponse({ error: `Rambursare eșuată: ${msg}` });
      }

      const { data: updated, error: updateError } = await supabase
        .from("registrations")
        .update({
          payment_status: "refunded",
          refunded_at: new Date().toISOString(),
          refund_reason: refund_reason || null,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        // Stripe refund already succeeded at this point — log loudly so it
        // can be reconciled by hand rather than silently losing the record.
        console.error(
          "[admin-registrations] Stripe refund succeeded but DB update failed",
          { registrationId: id, stripeRefundId: refund.id, updateError },
        );
        return jsonResponse({
          error: "Rambursarea a fost procesată în Stripe, dar salvarea a eșuat. Contactează suportul tehnic.",
        });
      }

      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "refund",
        registration_id: id,
        details: { refund_id: refund.id, reason: refund_reason || null },
      });
      return jsonResponse({ success: true, data: updated, refund_id: refund.id });
    }

    // ============ Group subscription cancel + grace refund ============
    // Cancelling stops all not-yet-billed months automatically. The current
    // already-paid month is refunded (prorated by unused days) ONLY if the
    // cancellation lands within the first GRACE_DAYS of the current billing
    // period; otherwise it is kept. All amounts computed server-side.
    if (action === "cancel_subscription" || action === "preview_cancel_subscription") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });

      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, form_type, stripe_subscription_id, subscription_status, canceled_at")
        .eq("id", id)
        .maybeSingle();
      if (regError) throw regError;
      if (!reg) return jsonResponse({ error: "Înscrierea nu a fost găsită" });
      if (!reg.stripe_subscription_id || !String(reg.stripe_subscription_id).startsWith("sub_")) {
        return jsonResponse({ error: "Nu există un abonament activ pentru această înscriere" });
      }
      if (reg.subscription_status === "canceled" || reg.canceled_at) {
        return jsonResponse({ error: "Abonamentul este deja anulat" });
      }

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const GRACE_DAYS = 5;
      const DAY = 86400;

      const sub = await stripe.subscriptions.retrieve(reg.stripe_subscription_id);
      const now = Math.floor(Date.now() / 1000);
      const periodStart = sub.current_period_start ?? now;
      const periodEnd = sub.current_period_end ?? now + 30 * DAY;
      const daysInPeriod = Math.max(1, Math.round((periodEnd - periodStart) / DAY));
      const daysElapsed = Math.max(0, Math.floor((now - periodStart) / DAY));

      // Latest paid invoice = the charge for the period they're currently in.
      const paidInvoices = await stripe.invoices.list({
        subscription: reg.stripe_subscription_id,
        status: "paid",
        limit: 1,
      });
      const latest = paidInvoices.data[0];
      const amountPaid = latest?.amount_paid ?? 0;
      const chargeId = typeof latest?.charge === "string" ? latest.charge : latest?.charge?.id ?? "";

      const withinGrace = daysElapsed < GRACE_DAYS;
      const remainingDays = daysInPeriod - daysElapsed;
      const refundAmount =
        withinGrace && chargeId ? Math.round((amountPaid * remainingDays) / daysInPeriod) : 0;

      // Read-only preview for the admin confirm dialog — no side effects.
      if (action === "preview_cancel_subscription") {
        return jsonResponse({
          data: {
            within_grace: withinGrace,
            grace_days: GRACE_DAYS,
            days_elapsed: daysElapsed,
            days_in_period: daysInPeriod,
            refund_amount: refundAmount,
            currency: (latest?.currency || "ron").toUpperCase(),
          },
        });
      }

      // Cancel first (stops future invoices), then refund the current month if
      // within the grace window.
      try {
        await stripe.subscriptions.cancel(reg.stripe_subscription_id);
      } catch (cancelErr) {
        console.error("[admin-registrations] subscription cancel failed", cancelErr);
        const msg = cancelErr instanceof Error ? cancelErr.message : "Eroare Stripe";
        return jsonResponse({ error: `Anulare eșuată: ${msg}` });
      }

      let refundId: string | null = null;
      if (refundAmount > 0 && chargeId) {
        try {
          const refund = await stripe.refunds.create({ charge: chargeId, amount: refundAmount });
          refundId = refund.id;
        } catch (refundErr) {
          // Subscription is already cancelled; log so the refund can be issued
          // by hand rather than silently dropped.
          console.error("[admin-registrations] grace refund failed after cancel", refundErr);
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from("registrations")
        .update({
          subscription_status: "canceled",
          canceled_at: new Date().toISOString(),
          refunded_amount: refundId ? refundAmount : 0,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (updateError) {
        console.error("[admin-registrations] cancel saved in Stripe but DB update failed", {
          registrationId: id,
          refundId,
          updateError,
        });
        return jsonResponse({
          error: "Abonamentul a fost anulat în Stripe, dar salvarea a eșuat. Contactează suportul tehnic.",
        });
      }

      await supabase.from("audit_logs").insert({
        actor: callerEmail!,
        action: "cancel_subscription",
        registration_id: id,
        details: { refund_id: refundId, refund_amount: refundId ? refundAmount : 0 },
      });
      return jsonResponse({
        success: true,
        data: updated,
        refund_id: refundId,
        refund_amount: refundId ? refundAmount : 0,
      });
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

    // Duplicate indicator: how many registrations share each email (spec
    // §3.3 — surfaced to the admin, never auto-merged).
    if (data) {
      const emailCounts = new Map<string, number>();
      for (const r of data) {
        const e = (r.email || "").trim().toLowerCase();
        if (e) emailCounts.set(e, (emailCounts.get(e) ?? 0) + 1);
      }
      for (const r of data) {
        const e = (r.email || "").trim().toLowerCase();
        (r as Record<string, unknown>).email_dup_count = e ? emailCounts.get(e) ?? 1 : 1;
      }
    }

    const { data: settings, error: settingsError } = await supabase
      .from("email_confirmation_settings")
      .select("sender_name, sender_email")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    return jsonResponse({ data, settings: settings || { sender_name: "Arabă Libaneză cu Ibra", sender_email: "noreply@centruldearabalibaneza.com" } });
  } catch (err) {
    console.error("[admin-registrations] error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
