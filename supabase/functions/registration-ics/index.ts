import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://centruldearabalibaneza.com";
const TZ_OFFSET_HINT = "Europe/Bucharest";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
    pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z"
  );
}
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// Build a UTC Date from a local Bucharest wall-clock time.
// Bucharest is UTC+2 (EET) / UTC+3 (EEST). We approximate via Intl.
function bucharestWallToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  // Construct as UTC first, then adjust by the offset Bucharest has at that instant.
  const asUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Bucharest",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = fmt.formatToParts(asUtc).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const bucharestAsUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute),
  );
  const offsetMs = bucharestAsUtc - asUtc.getTime();
  return new Date(asUtc.getTime() - offsetMs);
}

function buildIcs(opts: {
  uid: string; title: string; description: string; location: string;
  start: Date; end: Date; url?: string;
}) {
  const now = toIcsUtc(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Centrul de Araba Libaneza//Registration//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsUtc(opts.start)}`,
    `DTEND:${toIcsUtc(opts.end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    `LOCATION:${esc(opts.location)}`,
    opts.url ? `URL:${opts.url}` : null,
    `X-WR-TIMEZONE:${TZ_OFFSET_HINT}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return new Response("invalid id", { status: 400, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, form_type, name, format, cohort_id, kids_slot_id, level")
      .eq("id", id)
      .maybeSingle();
    if (!reg) return new Response("not found", { status: 404, headers: corsHeaders });

    const zoomUrl = Deno.env.get("ZOOM_MEETING_URL") ?? "";
    const physicalLoc = "Raduga Creative Center, Strada Icoanei 80, București";
    const location = reg.format === "online" ? (zoomUrl || "Online (Zoom)") : physicalLoc;

    let start: Date | null = null;
    let end: Date | null = null;
    let title = "Arabă Libaneză cu Ibra";
    let description = `Lecția ta de arabă libaneză.\n${zoomUrl ? `Zoom: ${zoomUrl}\n` : ""}Gestionează: ${SITE_URL}`;

    if (reg.form_type === "group" && reg.cohort_id) {
      const { data: c } = await supabase.from("group_cohorts")
        .select("start_date, schedule_label_ro, level").eq("id", reg.cohort_id).maybeSingle();
      if (c?.start_date) {
        const [y, m, d] = String(c.start_date).split("-").map(Number);
        start = bucharestWallToUtc(y, m, d, 19, 0);
        end = new Date(start.getTime() + 90 * 60_000);
        title = `Curs grup arabă libaneză${c.level ? ` (${c.level})` : reg.level ? ` (${reg.level})` : ""}`;
        description = `${c.schedule_label_ro || "marți și joi, 19:00–20:30"}\n${zoomUrl ? `Zoom: ${zoomUrl}\n` : ""}Gestionează: ${SITE_URL}`;
      }
    } else if (reg.form_type === "kids" && reg.kids_slot_id) {
      const { data: s } = await supabase.from("kids_class_slots")
        .select("weekday, start_time, duration_min, format, location").eq("id", reg.kids_slot_id).maybeSingle();
      if (s) {
        // find next occurrence of weekday (1=Mon..7=Sun)
        const now = new Date();
        const todayDow = ((now.getUTCDay() + 6) % 7) + 1; // 1..7 Mon..Sun
        const delta = (s.weekday - todayDow + 7) % 7 || 7;
        const target = new Date(now.getTime() + delta * 86_400_000);
        const [hh, mm] = String(s.start_time).split(":").map(Number);
        start = bucharestWallToUtc(target.getUTCFullYear(), target.getUTCMonth() + 1, target.getUTCDate(), hh, mm);
        end = new Date(start.getTime() + (s.duration_min ?? 60) * 60_000);
        title = "Curs copii — arabă libaneză";
        description = `Lecție pentru copii.\nFormat: ${s.format}\n${s.location ? `Loc: ${s.location}\n` : ""}Gestionează: ${SITE_URL}`;
      }
    }

    if (!start || !end) {
      return new Response("schedule not available", { status: 404, headers: corsHeaders });
    }

    const ics = buildIcs({
      uid: `${reg.id}@centruldearabalibaneza.com`,
      title, description, location,
      start, end,
      url: SITE_URL,
    });

    return new Response(ics, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="lectie-araba-${reg.id.slice(0, 8)}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[registration-ics] error", e);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});