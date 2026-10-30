import { GCAL_GATEWAY } from "./booking.ts";
import { packageNumbers, packageTitle } from "./package-lessons.ts";

/**
 * A lesson's number in its private package ({ n: 3, total: 10 }), or null
 * when it is not a counted package lesson. For the emails' "Lecția 3 din 10".
 */
// deno-lint-ignore no-explicit-any
export async function packageLessonNumber(
  db: any,
  registrationId: string | null | undefined,
  bookingId: string,
): Promise<{ n: number; total: number } | null> {
  if (!registrationId) return null;
  try {
    const { data: reg } = await db
      .from("registrations")
      .select("id, form_type, quantity")
      .eq("id", registrationId)
      .maybeSingle();
    if (!reg || reg.form_type !== "private") return null;
    const { data: rows } = await db
      .from("bookings")
      .select("id, start_at, status, event_type_slug, trial_outcome")
      .eq("registration_id", registrationId);
    const numbers = packageNumbers(rows ?? []);
    const n = numbers.get(bookingId);
    if (!n) return null;
    return { n, total: Math.max(Number(reg.quantity) || 1, numbers.size) };
  } catch (error) {
    console.error("[package-titles] number lookup failed", bookingId, error);
    return null;
  }
}

/**
 * Keep the Google titles of a package's upcoming lessons in step with their
 * numbers ("Ioan - Araba libaneza- L3/10") after a lesson is booked, moved,
 * cancelled, excused or moved to another package. Only lessons still ahead
 * are renamed — past events stay as the owner wrote them — and quietly
 * (sendUpdates=none): a renumbering is not news to the student.
 * Best-effort: a failure is logged, never thrown.
 */
// deno-lint-ignore no-explicit-any
export async function syncPackageTitles(
  db: any,
  registrationId: string | null | undefined,
): Promise<void> {
  if (!registrationId) return;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) return;
  try {
    const { data: reg } = await db
      .from("registrations")
      .select("id, form_type, quantity")
      .eq("id", registrationId)
      .maybeSingle();
    if (!reg || reg.form_type !== "private") return;
    const { data: rows } = await db
      .from("bookings")
      .select(
        "id, start_at, status, event_type_slug, trial_outcome, google_event_id, student_name",
      )
      .eq("registration_id", registrationId);
    const numbers = packageNumbers(rows ?? []);
    const total = Math.max(Number(reg.quantity) || 1, numbers.size);
    const now = Date.now();
    for (const b of rows ?? []) {
      const n = numbers.get(b.id);
      if (
        !n ||
        b.status !== "confirmed" ||
        !b.google_event_id ||
        Date.parse(b.start_at) < now
      )
        continue;
      const res = await fetch(
        `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(b.google_event_id)}?sendUpdates=none`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": gcalKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: packageTitle(b.student_name ?? "", n, total),
          }),
        },
      );
      if (!res.ok)
        console.error(
          "[package-titles] rename failed",
          b.id,
          res.status,
          await res.text(),
        );
    }
  } catch (error) {
    console.error("[package-titles] sync failed", registrationId, error);
  }
}
