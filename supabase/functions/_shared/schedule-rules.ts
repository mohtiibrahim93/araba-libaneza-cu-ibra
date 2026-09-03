// Scheduling rules and timezone helpers, dependency-free on purpose so they
// can be unit-tested outside Deno — same reasoning as prices.ts.

export const TZ = "Europe/Bucharest";

/** Returns Y-M-D parts of a UTC Date as observed in tz. */
export function utcToZonedParts(d: Date, tz = TZ) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour") === "24" ? "0" : get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

/** 0 = Sunday … 6 = Saturday for a UTC instant as observed in tz. */
export function weekdayInTz(d: Date, tz = TZ): number {
  const wd = utcToZonedParts(d, tz).weekday;
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

/**
 * In-person trial lessons run at weekends only, for now. Everything else —
 * online trials, and paid lessons in either format — keeps the full weekday
 * availability.
 *
 * Lives here rather than in availability_rules because that table has no
 * format column: its windows apply to both formats, so the restriction cannot
 * be expressed as data without reshaping the schema. Both booking-availability
 * and booking-create call this, so a slot that is not offered also cannot be
 * booked by posting straight to the API.
 */
export const PHYSICAL_TRIAL_WEEKDAYS = [0, 6]; // Sunday, Saturday

export function physicalTrialAllowed(
  eventTypeSlug: string,
  format: string,
  startISO: string,
  tz = TZ,
): boolean {
  if (eventTypeSlug !== "trial" || format !== "physical") return true;
  return PHYSICAL_TRIAL_WEEKDAYS.includes(weekdayInTz(new Date(startISO), tz));
}
