// Owner-facing calendar subscription feed.
//
// The Google Calendar API path (Lovable connector gateway) needs two secrets
// and can fail silently; this is the fallback that needs neither. The owner
// adds this URL once in Google Calendar ("Other calendars → From URL") and
// every booking shows up there from then on, polled by Google.
//
// It is one-way: bookings appear in the calendar, but the calendar's own busy
// times are NOT read back to block slots. That still requires the API path —
// see the "Calendar" panel in the admin for whether it is working.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TZ, SITE_URL } from "../_shared/booking.ts";

const PRODID = "-//Centrul de Araba Libaneza//Bookings//RO";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** RFC 5545 caps content lines at 75 octets; longer ones wrap with a leading space. */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [line.slice(0, 73)];
  let rest = line.slice(73);
  while (rest.length > 72) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  if (rest) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

/**
 * Timing-safe-ish comparison. The token is compared in constant time so that a
 * public, unauthenticated endpoint cannot be used to guess it byte by byte.
 */
function tokenMatches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

interface BookingRow {
  id: string;
  event_type_slug: string;
  start_at: string;
  end_at: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  format: string;
  notes: string | null;
  status: string;
  meet_link: string | null;
  updated_at?: string | null;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("GET required", { status: 405 });
  }

  const expected = Deno.env.get("OWNER_CALENDAR_TOKEN") || "";
  if (!expected) {
    return new Response(
      "Feed-ul nu este configurat. Setează secretul OWNER_CALENDAR_TOKEN în Supabase.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const url = new URL(req.url);
  const given = url.searchParams.get("token") || "";
  if (!tokenMatches(given, expected)) {
    return new Response("Neautorizat", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Google re-fetches the whole feed, so a bounded window keeps it small while
  // still covering "what happened recently" and everything upcoming.
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, event_type_slug, start_at, end_at, student_name, student_email, student_phone, format, notes, status, meet_link, created_at",
    )
    .in("status", ["confirmed", "completed"])
    .gte("start_at", since)
    .order("start_at", { ascending: true })
    .limit(1000);

  if (error) {
    console.error("[calendar-feed] query failed", error);
    return new Response("Eroare internă", { status: 500 });
  }

  const { data: types } = await supabase
    .from("booking_event_types")
    .select("slug, name_ro");
  const typeName = new Map((types ?? []).map((t) => [t.slug, t.name_ro as string]));

  const stamp = toIcsUtc(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Programări — Arabă Libaneză cu Ibra",
    `X-WR-TIMEZONE:${TZ}`,
    // Google honours this as a hint for how often to poll.
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const b of (data ?? []) as BookingRow[]) {
    const label = typeName.get(b.event_type_slug) ?? b.event_type_slug;
    const description = [
      `Cursant: ${b.student_name}`,
      `Email: ${b.student_email}`,
      b.student_phone ? `Telefon: ${b.student_phone}` : null,
      `Format: ${b.format === "online" ? "Online" : "Fizic"}`,
      b.meet_link ? `Link: ${b.meet_link}` : null,
      b.notes ? `Note: ${b.notes}` : null,
      `Administrare: ${SITE_URL}/admin`,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@centruldearabalibaneza.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsUtc(new Date(b.start_at))}`,
      `DTEND:${toIcsUtc(new Date(b.end_at))}`,
      fold(`SUMMARY:${esc(`${label} — ${b.student_name}`)}`),
      fold(`DESCRIPTION:${esc(description)}`),
      fold(`LOCATION:${esc(b.format === "online" ? (b.meet_link ?? "Online") : "Raduga Creative Center, Strada Icoanei 80, București")}`),
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      "Content-Disposition": 'inline; filename="programari.ics"',
    },
  });
});
