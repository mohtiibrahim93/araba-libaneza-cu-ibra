/**
 * The request to start lessons inside the 14-day withdrawal period (owner,
 * 17 Nov 2026: "protect me from free lessons"; Terms, section 4).
 *
 * A group that starts within 14 days is joined only with this request, made
 * with a box the student ticks themselves: in the sign-up form (so cash,
 * transfer and centre payers make it too), at the card checkout, or in
 * "Contul meu" for a student the owner added by hand. One text everywhere,
 * the one shown to the owner on 16 Nov 2026.
 */
export const EARLY_START_BOX = {
  ro: "Vreau să încep lecțiile înainte să treacă cele 14 zile de retragere. Înțeleg că, dacă mă retrag în acest timp, plătesc lecțiile ținute până atunci.",
  en: "I want my lessons to start before the 14-day withdrawal period ends. I understand that if I withdraw during that time, I pay for the lessons held until then.",
} as const;

/** The withdrawal period, in days. Mirrors supabase/functions/_shared/early-start.ts. */
export const WITHDRAWAL_DAYS = 14;

/** Today in Bucharest, YYYY-MM-DD. */
export function bucharestDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
  }).format(at);
}

const utc = (day: string) => {
  const [y = 0, m = 1, d = 1] = day.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/**
 * Whether a group starting on `startDate` begins inside a withdrawal period
 * that opens on `fromDay` (both YYYY-MM-DD): on or before day 14, which
 * includes a group that has already started.
 */
export function startsInsideWithdrawal(
  startDate: string | null | undefined,
  fromDay: string = bucharestDay(),
): boolean {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}/.test(startDate)) return false;
  return (utc(startDate) - utc(fromDay)) / 86_400_000 <= WITHDRAWAL_DAYS;
}

/** "1 decembrie 2026" / "1 December 2026" for a YYYY-MM-DD day. */
export function longDay(day: string, lang: "ro" | "en"): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day.slice(0, 10)}T12:00:00Z`));
}
