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

/**
 * The level check with Ibra (event type `verificare-nivel`) has its own hours,
 * not the general availability rules: weekdays 12:00–13:00, the owner's usual
 * free hour (October 2026). A lesson booked then still blocks it — the usual
 * busy checks run on top. No weekend-only rule: it can be online or at the
 * center on any of these days.
 */
export const LEVEL_CHECK_SLUG = "verificare-nivel";
export const LEVEL_CHECK_RULES = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  start_time: "12:00:00",
  end_time: "13:00:00",
}));

/** A level-check start that fits inside its weekday 12:00–13:00 hour. */
export function levelCheckTimeAllowed(startISO: string, durationMin: number, tz = TZ): boolean {
  const d = new Date(startISO);
  const wd = weekdayInTz(d, tz);
  if (wd < 1 || wd > 5) return false;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  const startMin = h * 60 + m;
  return startMin >= 12 * 60 && startMin + durationMin <= 13 * 60;
}

export function physicalTrialAllowed(
  eventTypeSlug: string,
  format: string,
  startISO: string,
  tz = TZ,
): boolean {
  if (eventTypeSlug !== "trial" || format !== "physical") return true;
  return PHYSICAL_TRIAL_WEEKDAYS.includes(weekdayInTz(new Date(startISO), tz));
}

// ---------------------------------------------------------------------------
// Rules the owner edits in Admin › Program › Disponibilitate (13 October 2026).
// ---------------------------------------------------------------------------

export type ScopedRule = { weekday: number; start_time: string; end_time: string; event_type_slug?: string | null };

/**
 * The weekly hours for one lesson type: its own rules when it has any,
 * otherwise the general ones (no event_type_slug). `fallback` keeps a type's
 * built-in hours for a database that predates per-type rules.
 */
export function rulesForEventType<T extends ScopedRule>(rules: T[], slug: string, fallback?: ScopedRule[]): ScopedRule[] {
  const own = rules.filter((r) => r.event_type_slug === slug);
  if (own.length) return own;
  if (fallback && !rules.some((r) => r.event_type_slug != null)) return fallback;
  return rules.filter((r) => !r.event_type_slug);
}

/**
 * Whether an in-person lesson of this type may start on that day.
 * physical_weekdays: null = any day; undefined = a database without the
 * column, where the old built-in rule (in-person trial at weekends) applies.
 */
export function physicalDayAllowed(
  et: { slug: string; physical_weekdays?: number[] | null },
  format: string,
  startISO: string,
  tz = TZ,
): boolean {
  if (format !== "physical") return true;
  if (et.physical_weekdays === undefined) return physicalTrialAllowed(et.slug, format, startISO, tz);
  if (et.physical_weekdays === null) return true;
  return et.physical_weekdays.includes(weekdayInTz(new Date(startISO), tz));
}

/** Romania's calendar date (YYYY-MM-DD) of an instant. */
export function localDateKey(iso: string, tz = TZ): string {
  const p = utcToZonedParts(new Date(iso), tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** True when the instant falls on a day off (inclusive date range). */
export function inBlackout(iso: string, blackouts: Array<{ start_date: string; end_date: string }>, tz = TZ): boolean {
  const day = localDateKey(iso, tz);
  return blackouts.some((b) => day >= b.start_date && day <= b.end_date);
}
