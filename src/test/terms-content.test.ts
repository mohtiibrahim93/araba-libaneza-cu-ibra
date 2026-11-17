import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NEW_REFUND_RULES_FROM } from "../../supabase/functions/_shared/refund";
import {
  PAID_IN_FULL_REFUND_NOTE,
  newRefundRulesInForce,
  refundRulesFromLabel,
} from "@/lib/refundRules";

const terms = readFileSync(
  resolve(process.cwd(), "src/pages/Terms.tsx"),
  "utf8",
);

describe("Terms: company details (owner's text, 27 October 2026)", () => {
  it("states them exactly in Romanian", () => {
    for (const line of [
      "Firma: E-SERVICES TODAY S.R.L.",
      "Sediu social: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
      "CUI: 52051074",
      "Nr. de ordine în registrul comerțului: J2025046577002",
      "EUID: ROONRC.J2025046577002",
    ])
      expect(terms).toContain(`"${line}"`);
  });

  it("translates only the labels in English, keeping the Romanian address", () => {
    for (const line of [
      "Company: E-SERVICES TODAY S.R.L.",
      "Registered office: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
      "Tax ID (CUI): 52051074",
      "Trade Register No.: J2025046577002",
      "EUID: ROONRC.J2025046577002",
    ])
      expect(terms).toContain(`"${line}"`);
  });
});

describe("Terms: monthly group refunds", () => {
  it("carries the worked example of the refund policy", () => {
    // Owner's policy of 8 November 2026: lesson 1 is a test lesson,
    // after lesson 2 the month becomes credit or private lessons.
    for (const figure of [
      "500 lei/lun",
      "8 lec",
      "437,50 lei",
      "312,50 lei",
      "150 lei",
    ])
      expect(terms).toContain(figure);
    for (const figure of [
      "500 lei/month",
      "8 lessons",
      "437.50 lei",
      "312.50 lei",
      "150 lei",
    ])
      expect(terms).toContain(figure);
  });

  it("says cancelling stops every future charge, in both languages", () => {
    expect(terms).toContain(
      "anularea oprește întotdeauna toate plățile lunare viitoare",
    );
    expect(terms).toContain(
      "cancelling always stops all future monthly charges",
    );
  });
});

describe("Terms: the trial no-show fee", () => {
  it("says it is charged and may be refunded on appeal", () => {
    expect(terms).toContain("se încasează de pe card 150 lei");
    expect(terms).toContain("Taxa poate fi rambursată dacă o contești");
    expect(terms).toContain("150 lei is charged to the card");
    expect(terms).toContain("The fee may be refunded if you appeal it");
  });
});

/**
 * Owner's refund rules of 14 November 2026, published on his word of 16
 * November. They are for sign-ups made from the day named in section 4; the
 * rules of 8 November stay on the page, word for word, for everyone enrolled
 * before ("students already enrolled keep the Terms and prices they signed
 * up under").
 */
describe("Terms: refund rules for new sign-ups", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("names one start day, the one the refund arithmetic uses", () => {
    // The day the owner approved the text; he wants it in force at once.
    expect(NEW_REFUND_RULES_FROM).toBe("2026-11-16");
    expect(refundRulesFromLabel("ro")).toBe("16 noiembrie 2026");
    expect(refundRulesFromLabel("en")).toBe("16 November 2026");
    // The page takes the day from that constant, never from typed text.
    expect(terms).toContain(
      "regulile de mai jos se aplică înscrierilor făcute începând cu ${FROM.ro}",
    );
    expect(terms).toContain(
      "the rules below apply to sign-ups made from ${FROM.en}",
    );
    expect(terms).not.toMatch(/16 noiembrie 2026|16 November 2026/);
  });

  it("states the new rules in Romanian", () => {
    for (const text of [
      "Orice rambursare se calculează din ce ai plătit tu la înscriere, nu din lista de prețuri de acum.",
      "minus taxa administrativă de anulare de 10% și comisionul de procesare Stripe",
      "Suma returnată nu poate fi mai mică de 0.",
      "2 × 595 = 1.190 lei, minus 10% (119 lei) = 1.071 lei, minus comisionul Stripe.",
      "După a doua lecție, luna în curs: nu se mai rambursează în bani.",
      "Credit: este valabil 6 luni.",
      "îl poți transfera altei persoane sau îl poți transforma în lecții private, la 150 lei lecția",
      "Cu 30 de zile înainte de expirare îți trimitem un email de reamintire.",
      "Ce rămâne nefolosit la expirare se returnează în bani, minus comisionul de procesare Stripe.",
      "o lecție se consideră ținută chiar dacă ai lipsit",
      "Lecții anulate de noi: se reprogramează sau se returnează în bani.",
      "înainte de orice rambursare îți propunem mutarea într-o altă grupă de același nivel",
      "Cum anulezi: cu butonul „Anulează cursul” din Contul meu (la cursurile de grup)",
      "Data anulării este data la care ne-ai trimis cererea.",
      "Ne anunți cu butonul „Retrage-te din contract aici” din Contul meu sau printr-o declarație clară pe email",
      "procesăm rambursarea în cel mult 14 zile de la anulare",
    ])
      expect(terms, text).toContain(text);
  });

  it("states the same rules in English", () => {
    for (const text of [
      "Every refund is calculated from what you paid when you signed up, not from today's price list.",
      "minus the 10% administrative cancellation fee and the Stripe processing fee",
      "The refund cannot be less than 0.",
      "2 × 595 = 1,190 lei, minus 10% (119 lei) = 1,071 lei, minus the Stripe fee.",
      "After the second lesson, the month in progress: it is no longer refunded in money.",
      "Credit: it is valid for 6 months.",
      "transfer it to another person, or turn it into private lessons at 150 lei each",
      "We send a reminder email 30 days before it expires.",
      "Anything unused at expiry is refunded in money, minus the Stripe processing fee.",
      "a lesson counts as held even if you were absent",
      "Lessons cancelled by us: they are rescheduled or refunded in money.",
      "before any refund, we offer you a move to another group of the same level",
      "How to cancel: with the “Cancel the course” button in My account (for group courses)",
      "The cancellation date is the day you sent us your request.",
      "You tell us with the “Withdraw from the contract here” button in My account, or with a clear statement by email",
      "we process the refund within 14 days of the cancellation",
    ])
      expect(terms, text).toContain(text);
  });

  it("keeps the earlier rules, word for word, for everyone enrolled before", () => {
    expect(terms).toContain(
      "`4.1 Reguli pentru înscrierile de dinainte de ${FROM.ro}`",
    );
    expect(terms).toContain("`4.1 Rules for sign-ups made before ${FROM.en}`");
    // The one rule that differs: months not started came back in full.
    expect(terms).toContain(
      "care nu au început încă se returnează integral pe card, minus comisionul de procesare Stripe.",
    );
    expect(terms).toContain(
      "that have not started yet are refunded in full to your card, minus the Stripe processing fee.",
    );
    // The other sections keep their numbers.
    expect(terms).toContain('"5. Obligațiile cursantului"');
    expect(terms).toContain('"10. Soluționarea litigiilor"');
  });

  it("calls the 10% by its one name, in the Terms and wherever it is announced", () => {
    for (const file of [
      "src/pages/Terms.tsx",
      "src/pages/Preturi.tsx",
      "src/pages/Checkout.tsx",
      "src/lib/refundRules.ts",
    ])
      expect(read(file), file).not.toMatch(/penaliz|penalty|penalit/i);
    expect(PAID_IN_FULL_REFUND_NOTE.prices.ro).toContain(
      "taxă administrativă de anulare de 10%",
    );
    expect(PAID_IN_FULL_REFUND_NOTE.checkout.ro).toContain(
      "taxa administrativă de anulare de 10%",
    );
  });

  it("names only buttons the account has, with the account's own words", () => {
    // Built on 17 November 2026 (owner: "the cancel button if they want to
    // cancel yes"): the Terms name a button only with the label the student
    // sees in "Contul meu".
    const page = readFileSync(
      resolve(process.cwd(), "src/pages/MyAccount.tsx"),
      "utf8",
    );
    for (const [inTerms, onPage] of [
      [
        "butonul „Retrage-te din contract aici”",
        'withdrawHere: "Retrage-te din contract aici"',
      ],
      [
        "“Withdraw from the contract here” button",
        'withdrawHere: "Withdraw from the contract here"',
      ],
      ["butonul „Anulează cursul”", 'cancelCourse: "Anulează cursul"'],
      ["“Cancel the course” button", 'cancelCourse: "Cancel the course"'],
    ]) {
      expect(terms, inTerms).toContain(inTerms!);
      expect(page, onPage).toContain(onPage!);
    }
    // No other button is promised.
    expect(terms).not.toMatch(/butonul „Anulează”|“Cancel” button/);
  });

  it("states the 14-day right of withdrawal, ahead of the other rules", () => {
    // Written in on the owner's word of 16 November 2026.
    for (const text of [
      "Dreptul legal de retragere (14 zile): dacă te-ai înscris și ai plătit online, ai dreptul să te retragi din contract în 14 zile de la data înscrierii, fără să dai un motiv (OUG nr. 34/2014).",
      "fără comision de procesare și fără taxă administrativă de anulare",
      "plătești doar lecțiile ținute până la data retragerii, proporțional cu prețul total al cursului",
      "După cele 14 zile se aplică regulile de anulare de mai jos.",
      "Legal right of withdrawal (14 days): if you signed up and paid online, you have the right to withdraw from the contract within 14 days of signing up, without giving a reason (Government Emergency Ordinance 34/2014).",
      "with no processing fee and no administrative cancellation fee kept",
      "After the 14 days, the cancellation rules below apply.",
    ])
      expect(terms, text).toContain(text);
    // It comes before the rule for cancelling 7 days ahead, in both languages.
    expect(terms.indexOf("Dreptul legal de retragere")).toBeLessThan(
      terms.indexOf("Cu cel puțin 7 zile înainte de începerea cursului"),
    );
    expect(terms.indexOf("Legal right of withdrawal")).toBeLessThan(
      terms.indexOf("At least 7 days before the course starts"),
    );
  });

  it("shows the paid-in-full rule before payment, from the day it applies", () => {
    expect(newRefundRulesInForce("2026-11-15")).toBe(false);
    expect(newRefundRulesInForce("2026-11-16")).toBe(true);
    expect(newRefundRulesInForce("2027-03-10")).toBe(true);
    const prices = read("src/pages/Preturi.tsx");
    expect(prices).toContain("newRefundRulesInForce() &&");
    expect(prices).toContain("PAID_IN_FULL_REFUND_NOTE.prices");
    const checkout = read("src/pages/Checkout.tsx");
    expect(checkout).toContain("newRefundRulesInForce() &&");
    expect(checkout).toContain("PAID_IN_FULL_REFUND_NOTE.checkout");
    // At the checkout it is for a course paid in full only.
    expect(checkout).toMatch(/!isSubscription &&\s+newRefundRulesInForce\(\)/);
  });
});
