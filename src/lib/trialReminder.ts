/**
 * Pre-filled WhatsApp reminder text for a booked free trial lesson.
 * Opened from the admin "Today" screen; Ibra sends it from his own WhatsApp.
 */
export function trialReminderText(input: {
  name: string;
  startAt: string;
  format: string;
  meetLink: string | null;
}): string {
  const first = input.name.trim().split(/\s+/)[0] || input.name;
  const d = new Date(input.startAt);
  const day = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Bucharest",
  }).format(d);
  const time = new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  }).format(d);
  const where =
    input.format === "online"
      ? input.meetLink
        ? `Linkul de Zoom: ${input.meetLink}`
        : "Îți trimit linkul de Zoom înainte de lecție."
      : "Ne vedem la centru.";
  return `Bună, ${first}! Îți reamintesc de lecția de probă gratuită de arabă libaneză, ${day}, la ora ${time}. ${where} Pe curând! — Ibra`;
}
