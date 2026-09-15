// Lightweight client-side .ics generator for booking confirmations.
// We avoid pulling a heavy library — the booking only ever produces one event.

const TZ = "Europe/Bucharest";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsUtc(iso: string): string {
  const d = new Date(iso);
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

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string | undefined;
  location?: string | undefined;
  startISO: string;
  endISO: string;
  url?: string | undefined;
  organizerEmail?: string | undefined;
  organizerName?: string | undefined;
  attendeeEmail?: string | undefined;
  attendeeName?: string | undefined;
}

export function buildIcs(ev: IcsEvent): string {
  const now = toIcsUtc(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Centrul de Araba Libaneza//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsUtc(ev.startISO)}`,
    `DTEND:${toIcsUtc(ev.endISO)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    ev.description ? `DESCRIPTION:${escapeText(ev.description)}` : null,
    ev.location ? `LOCATION:${escapeText(ev.location)}` : null,
    ev.url ? `URL:${ev.url}` : null,
    ev.organizerEmail
      ? `ORGANIZER;CN=${escapeText(ev.organizerName ?? "")}:mailto:${ev.organizerEmail}`
      : null,
    ev.attendeeEmail
      ? `ATTENDEE;CN=${escapeText(ev.attendeeName ?? "")};RSVP=TRUE:mailto:${ev.attendeeEmail}`
      : null,
    `X-WR-TIMEZONE:${TZ}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}