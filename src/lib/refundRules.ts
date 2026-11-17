/**
 * The refund rules of 14 November 2026, as the site announces them.
 *
 * They apply only to sign-ups made from NEW_REFUND_RULES_FROM (the day named
 * in section 4 of the Terms); anyone enrolled before keeps the rules they
 * signed up under. The date lives in one place, next to the arithmetic
 * (supabase/functions/_shared/refund.ts), and everything here is derived from
 * it, so the Terms, the price page, the checkout and the refund itself cannot
 * name different days.
 */
import { NEW_REFUND_RULES_FROM } from "../../supabase/functions/_shared/refund";
import { bucharestToday } from "../../supabase/functions/_shared/group-months";

type Lang = "ro" | "en";

/** "1 decembrie 2026" / "1 December 2026"; "" while no day is set. */
export function refundRulesFromLabel(lang: Lang): string {
  if (!NEW_REFUND_RULES_FROM) return "";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${NEW_REFUND_RULES_FROM}T12:00:00Z`));
}

/**
 * Whether a sign-up made today falls under the new rules. Before that day the
 * paid-in-full rule is not shown at the price list or the checkout: a student
 * signing up then is still on the earlier rules, with no 10% kept.
 */
export function newRefundRulesInForce(
  today: string = bucharestToday(),
): boolean {
  return NEW_REFUND_RULES_FROM !== null && today >= NEW_REFUND_RULES_FROM;
}

/**
 * The paid-in-full rule in one sentence, shown before payment (owner: "This
 * rule is shown on /preturi and at the pay-in-full checkout before payment").
 * The fee is a "taxă administrativă de anulare", the owner's only name for it.
 */
export const PAID_IN_FULL_REFUND_NOTE = {
  prices: {
    ro: "Plătești integral și renunți pe parcurs? Lunile care nu au început se returnează la prețul lunar redus, minus o taxă administrativă de anulare de 10% și comisionul de procesare Stripe.",
    en: "Paying in full and leaving part-way? Months that have not started are refunded at the discounted monthly price, minus a 10% administrative cancellation fee and the Stripe processing fee.",
  },
  checkout: {
    ro: "Dacă renunți pe parcurs, lunile neîncepute se returnează la prețul lunar redus, minus taxa administrativă de anulare de 10% și comisionul Stripe (Termeni, secțiunea 4).",
    en: "If you leave part-way, months not started are refunded at the discounted monthly price, minus the 10% administrative cancellation fee and the Stripe fee (Terms, section 4).",
  },
  termsLink: {
    ro: "Detalii în Termeni și condiții, secțiunea 4",
    en: "Details in the Terms, section 4",
  },
} as const;

/**
 * The right of withdrawal in one sentence, shown before payment and before a
 * sign-up is sent (owner, 17 Nov 2026: the lawyer's draft dropped, "apply the
 * proposed things"): it says where the conditions, the time limit, how to
 * withdraw and the model form are. The confirmation email repeats them in
 * full (supabase/functions/_shared/withdrawal-info.ts).
 */
export const WITHDRAWAL_NOTE = {
  text: {
    ro: "Ai dreptul să te retragi din contract în 14 zile de la înscriere, fără să dai un motiv. Condițiile, termenul, cum o faci și modelul de formular de retragere sunt în",
    en: "You have the right to withdraw from the contract within 14 days of signing up, without giving a reason. The conditions, the time limit, how to do it and the model withdrawal form are in",
  },
  link: { ro: "Termeni, secțiunea 4", en: "the Terms, section 4" },
  href: { ro: "/terms", en: "/en/terms" },
} as const;
