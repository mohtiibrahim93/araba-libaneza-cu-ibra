/**
 * Joining a group that starts inside the 14-day withdrawal period (owner,
 * 17 Nov 2026: "protect me from free lessons"; Terms, section 4; OUG 34/2014,
 * art. 8 alin. (8) and art. 14).
 *
 * Anyone who signs up online may withdraw within 14 days and get everything
 * back. If their group starts inside those 14 days, they could attend lessons
 * and then withdraw with nothing kept. The law's answer: the student asks,
 * with a box they tick themselves, for the lessons to start inside the 14
 * days; if they then withdraw, they pay for the lessons held. The European
 * Commission's guidance (DG Justice, June 2014, section 6.5.1) says a
 * pre-ticked box or a clause in the Terms does not count, and that the trader
 * is not obliged to start early without the request. So the request is
 * required to join such a group: every card payment for a group sign-up
 * passes through here, and is refused until the request is recorded.
 *
 * The server writes the time of the request (registrations.
 * early_start_requested_at) when the box is ticked; the owner can record one
 * received by email or WhatsApp in the admin. The refund calculation reads it.
 */
import { bucharestToday } from "./group-months.ts";
import { calendarDaysBetween } from "./group-refund.ts";

/** The withdrawal period, in days. */
export const EARLY_START_DAYS = 14;

export const EARLY_START_REQUIRED = "early_start_required";

/**
 * Whether a group starting on `startDate` begins inside a withdrawal period
 * that opens on `today` (both YYYY-MM-DD, Bucharest): on or before day 14,
 * which includes a group that has already started.
 */
export function startsInsideWithdrawal(
  startDate: string | null | undefined,
  today: string,
): boolean {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}/.test(startDate)) return false;
  return calendarDaysBetween(today, startDate.slice(0, 10)) <= EARLY_START_DAYS;
}

export interface EarlyStartRefusal {
  error: string;
  code: typeof EARLY_START_REQUIRED;
  /** The group's first day, YYYY-MM-DD, for the page to show. */
  startDate: string;
}

/**
 * For a group sign-up whose group starts within 14 days: null when the
 * payment may go ahead (writing the request when the student has just made
 * it), or the refusal the payment function returns (409) until they do.
 * A failed read stops the payment rather than letting it through unasked.
 */
export async function earlyStartGate(
  // deno-lint-ignore no-explicit-any
  db: any,
  reg: {
    id?: string | null;
    form_type?: string | null;
    cohort_id?: string | null;
  },
  requested: unknown,
  today: string = bucharestToday(),
): Promise<EarlyStartRefusal | null> {
  if (reg.form_type !== "group" || !reg.cohort_id || !reg.id) return null;
  const { data: cohort, error } = await db
    .from("group_cohorts")
    .select("start_date")
    .eq("id", reg.cohort_id)
    .maybeSingle();
  if (error) throw new Error("Could not read the group");
  const startDate: string | null = cohort?.start_date ?? null;
  if (!startsInsideWithdrawal(startDate, today)) return null;

  const { data: row, error: rowErr } = await db
    .from("registrations")
    .select("early_start_requested_at")
    .eq("id", reg.id)
    .maybeSingle();
  if (rowErr) throw new Error("Could not read the sign-up");
  if (row?.early_start_requested_at) return null;

  if (requested !== true)
    return {
      error:
        "Grupa începe în cele 14 zile de retragere: bifează căsuța ca lecțiile să înceapă în acest timp. / The group starts within the 14-day withdrawal period: tick the box for lessons to start in that time.",
      code: EARLY_START_REQUIRED,
      startDate: String(startDate).slice(0, 10),
    };

  const { error: updErr } = await db
    .from("registrations")
    .update({ early_start_requested_at: new Date().toISOString() })
    .eq("id", reg.id)
    .is("early_start_requested_at", null);
  if (updErr) throw new Error("Could not record the request");
  return null;
}
