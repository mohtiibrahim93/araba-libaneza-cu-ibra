import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREDIT_MONTHS,
  CREDIT_REMINDER_DAYS,
  canUseCredit,
  creditExpiry,
  creditRefund,
  creditState,
  type CreditRow,
} from "../../supabase/functions/_shared/credit";

/**
 * A student's credit (owner, 14 and 16 November 2026; Terms, section 4):
 * valid 6 months, usable in a later group, by another person, or as private
 * lessons at 150 lei; a reminder 30 days before it runs out; what is unused
 * at expiry goes back in money, minus the Stripe fee, on the owner's button.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const credit = (over: Partial<CreditRow> = {}): CreditRow => ({
  amount_lei: "312.50",
  created_at: "2026-12-01T10:00:00.000Z",
  expires_at: "2027-06-01T10:00:00.000Z",
  refund_at_expiry: true,
  reminder_sent_at: null,
  ...over,
});
const at = (iso: string) => new Date(iso);

describe("how long credit lasts", () => {
  it("six calendar months from the day it is given", () => {
    expect(CREDIT_MONTHS).toBe(6);
    expect(creditExpiry("2026-12-01T10:00:00.000Z")).toBe(
      "2027-06-01T10:00:00.000Z",
    );
    // A day that the sixth month does not have: its last day instead.
    expect(creditExpiry("2026-08-31T08:30:00.000Z")).toBe(
      "2027-02-28T08:30:00.000Z",
    );
  });
});

describe("what is left of a credit", () => {
  it("is the amount minus every use, never stored twice", () => {
    const s = creditState(
      credit(),
      [
        { kind: "private", amount_lei: 150 },
        { kind: "transfer", amount_lei: "62.50" },
      ],
      at("2027-01-10T10:00:00.000Z"),
    );
    expect(s).toMatchObject({
      amountLei: 312.5,
      usedLei: 212.5,
      remainingLei: 100,
      status: "active",
      privateLessons: 0,
    });
    expect(
      creditState(credit(), [], at("2027-01-10T10:00:00.000Z")).privateLessons,
    ).toBe(2);
  });

  it("is used up when nothing is left, whatever the date", () => {
    const all = [{ kind: "group", amount_lei: 312.5 }];
    expect(
      creditState(credit(), all, at("2027-01-10T10:00:00.000Z")).status,
    ).toBe("used");
    expect(
      creditState(credit(), all, at("2027-09-01T10:00:00.000Z")).status,
    ).toBe("used");
  });

  it("at expiry the rest is owed back in money, under the new Terms only", () => {
    const after = at("2027-06-01T10:00:00.000Z");
    expect(creditState(credit(), [], after).status).toBe("refund_due");
    expect(
      creditState(credit({ refund_at_expiry: false }), [], after).status,
    ).toBe("ended");
    // One minute before, it is still credit.
    expect(
      creditState(credit(), [], at("2027-06-01T09:59:00.000Z")).status,
    ).toBe("active");
  });

  it("counts the days to expiry: 0 on the last day, negative afterwards", () => {
    expect(
      creditState(credit(), [], at("2027-05-02T10:00:00.000Z")).daysLeft,
    ).toBe(30);
    expect(
      creditState(credit(), [], at("2027-06-01T09:00:00.000Z")).daysLeft,
    ).toBe(0);
    expect(
      creditState(credit(), [], at("2027-06-01T11:00:00.000Z")).daysLeft,
    ).toBe(-1);
    expect(
      creditState(credit(), [], at("2027-06-03T11:00:00.000Z")).daysLeft,
    ).toBe(-3);
  });
});

describe("the reminder 30 days before expiry", () => {
  it("is due once, while something is left and it has not expired", () => {
    expect(CREDIT_REMINDER_DAYS).toBe(30);
    const due = at("2027-05-02T10:00:00.000Z");
    expect(creditState(credit(), [], due).reminderDue).toBe(true);
    expect(
      creditState(credit(), [], at("2027-05-01T10:00:00.000Z")).reminderDue,
    ).toBe(false);
    expect(
      creditState(
        credit({ reminder_sent_at: "2027-05-02T09:00:00.000Z" }),
        [],
        due,
      ).reminderDue,
    ).toBe(false);
    expect(
      creditState(credit(), [{ kind: "group", amount_lei: 312.5 }], due)
        .reminderDue,
    ).toBe(false);
    expect(
      creditState(credit(), [], at("2027-06-02T10:00:00.000Z")).reminderDue,
    ).toBe(false);
  });
});

describe("the refund at expiry", () => {
  it("returns the unused part minus the Stripe fee, never below 0", () => {
    expect(creditRefund(312.5, 900)).toEqual({
      remainingBani: 31_250,
      feeBani: 900,
      refundBani: 30_350,
    });
    // The fee was already kept on an earlier refund of the same payment, or
    // the money was not paid by card: nothing more is kept.
    expect(creditRefund(312.5, 0).refundBani).toBe(31_250);
    expect(creditRefund(5, 900)).toEqual({
      remainingBani: 500,
      feeBani: 500,
      refundBani: 0,
    });
  });
});

describe("using a credit", () => {
  const live = creditState(credit(), [], at("2027-01-10T10:00:00.000Z"));
  const expired = creditState(credit(), [], at("2027-06-02T10:00:00.000Z"));

  it("takes a positive amount, no more than what is left", () => {
    expect(canUseCredit(live, "private", 150)).toBe("ok");
    expect(canUseCredit(live, "group", 312.5)).toBe("ok");
    expect(canUseCredit(live, "group", 312.51)).toBe("too_much");
    expect(canUseCredit(live, "transfer", 0)).toBe("amount");
    expect(canUseCredit(live, "transfer", -5)).toBe("amount");
  });

  it("after expiry it can only go back in money", () => {
    for (const kind of ["group", "private", "transfer"] as const)
      expect(canUseCredit(expired, kind, 100)).toBe("expired");
    expect(canUseCredit(expired, "refund", 312.5)).toBe("ok");
  });
});

describe("the tables", () => {
  const sql = read("supabase/migrations/20261116120000_student_credits.sql");

  it("keep credit and its uses, and nothing else", () => {
    expect(sql).toContain("create table if not exists public.student_credits");
    expect(sql).toContain(
      "create table if not exists public.student_credit_uses",
    );
    expect(sql).toContain(
      "kind text not null check (kind in ('group', 'private', 'transfer', 'refund'))",
    );
    // What is left is worked out, never stored: no column holds it.
    expect(sql).not.toMatch(/^\s*(remaining|balance)\w*\s+(numeric|integer|int)/im);
  });

  it("are for the server only", () => {
    expect(sql.match(/enable row level security/g)?.length).toBe(2);
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).toContain("from anon, authenticated");
  });

  it("can run again without harm, and holds no student's details", () => {
    expect(sql).not.toMatch(/create table public\./);
    expect(sql).not.toMatch(/insert into|@/i);
  });
});
