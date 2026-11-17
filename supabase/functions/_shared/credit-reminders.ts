/**
 * The credit reminder (owner, 16-17 Nov 2026; Terms, section 4): one email,
 * 30 days before a credit expires, for credit whose unused part comes back in
 * money. Called by booking-reminders, which runs every 15 minutes.
 *
 * Once per credit, and never twice: the credit is claimed first (its
 * reminder_sent_at is set only where it was still empty), then the email is
 * sent with a key that names the credit. If the send fails, the claim is
 * released so the next run tries again. A suppressed address counts as done.
 */
import { CREDIT_REMINDER_DAYS, creditState } from "./credit.ts";

const DAY_MS = 86_400_000;

type Send = (
  templateName: string,
  to: string,
  options: {
    templateData?: Record<string, unknown>;
    idempotencyKey?: string;
  },
) => Promise<unknown>;

/** "312,50 lei" / "312.50 lei"; whole amounts without decimals. */
export function creditAmountLabel(lei: number, lang: "ro" | "en"): string {
  const whole = Number.isInteger(Math.round(lei * 100) / 100);
  return `${new Intl.NumberFormat(lang === "en" ? "en-GB" : "ro-RO", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(lei)} lei`;
}

/** "25 mai 2027" / "25 May 2027", by the calendar in Bucharest. */
export function creditDayLabel(iso: string, lang: "ro" | "en"): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export async function processCreditReminders(
  // deno-lint-ignore no-explicit-any
  db: any,
  send: Send,
  now: Date = new Date(),
): Promise<{ sent: number; failed: number }> {
  const nowIso = now.toISOString();
  const horizon = new Date(
    now.getTime() + CREDIT_REMINDER_DAYS * DAY_MS,
  ).toISOString();
  const { data: rows, error } = await db
    .from("student_credits")
    .select(
      "id, holder_name, holder_email, amount_lei, created_at, expires_at, refund_at_expiry, reminder_sent_at, registrations(language), student_credit_uses(kind, amount_lei)",
    )
    .is("reminder_sent_at", null)
    .eq("refund_at_expiry", true)
    .not("holder_email", "is", null)
    .gt("expires_at", nowIso)
    .lte("expires_at", horizon);
  if (error) throw error;

  let sent = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    const state = creditState(row, row.student_credit_uses ?? [], now);
    if (!state.reminderDue || !row.holder_email) continue;

    // Claim it first: only one run can.
    const { data: claimed, error: claimErr } = await db
      .from("student_credits")
      .update({ reminder_sent_at: nowIso })
      .eq("id", row.id)
      .is("reminder_sent_at", null)
      .select("id");
    if (claimErr) throw claimErr;
    if (!claimed?.length) continue;

    const lang =
      String(row.registrations?.language ?? "").toLowerCase() === "en"
        ? "en"
        : "ro";
    try {
      await send("credit-expiry-reminder", row.holder_email, {
        templateData: {
          name: row.holder_name,
          amount: creditAmountLabel(state.remainingLei, lang),
          until: creditDayLabel(row.expires_at, lang),
          lang,
        },
        idempotencyKey: `credit-expiry-reminder-${row.id}`,
      });
      sent++;
    } catch (err) {
      console.error("[credit-reminders] send failed; will retry", row.id, err);
      // Release the claim so the next run tries again.
      await db
        .from("student_credits")
        .update({ reminder_sent_at: null })
        .eq("id", row.id)
        .eq("reminder_sent_at", nowIso);
      failed++;
    }
  }
  return { sent, failed };
}
