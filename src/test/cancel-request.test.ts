import { describe, expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * Withdrawing or cancelling from "Contul meu" (owner, 17 Nov 2026: "the
 * cancel button if they want to cancel yes"): which button a sign-up gets,
 * and what the student is shown before confirming, by the Terms (section 4,
 * and 4.1 for sign-ups before 16 Nov 2026).
 */
type Row = {
  kind: string;
  method: string;
  amount_lei: number | string;
  paid_at: string;
  month_from: number | null;
  month_to: number | null;
};
type Preview = Record<string, unknown>;
const mod = () =>
  loadEdgeModule("supabase/functions/_shared/cancel-request.ts", {}) as {
    cancelOptions: (
      reg: Record<string, unknown>,
      status: string | null,
      now?: Date,
    ) => { withdrawalUntil: string | null; cancel: boolean };
    cancelPreview: (input: Record<string, unknown>) => Preview;
    cancelStatement: (kind: string, input: Record<string, unknown>) => string;
    dateAndTime: (at: string, lang: "ro" | "en") => string;
  };

const OLD = "2026-09-01T10:00:00.000Z"; // signed up under section 4.1
const NEW = "2026-11-20T10:00:00.000Z"; // under the new rules (from 16 Nov)
const row = (over: Partial<Row>): Row => ({
  kind: "month",
  method: "transfer",
  amount_lei: 500,
  paid_at: "2026-09-01T10:00:00.000Z",
  month_from: 1,
  month_to: 1,
  ...over,
});
/** n lessons, two a week (Mon and Wed, 16:00 UTC), from a Monday. */
function lessons(first: string, n: number): string[] {
  const out: string[] = [];
  let t = Date.parse(`${first}T16:00:00.000Z`);
  for (let i = 0; i < n; i++) {
    out.push(new Date(t).toISOString());
    t += (i % 2 === 0 ? 2 : 5) * 86_400_000;
  }
  return out;
}
const SESSIONS = lessons("2026-09-07", 32); // A1: 4 months x 8
/** The moment just after lesson k (1-based) started. */
const after = (k: number) =>
  new Date(Date.parse(SESSIONS[k - 1]!) + 60_000).toISOString();
const preview = (over: Record<string, unknown>) =>
  mod().cancelPreview({
    signedUpAt: OLD,
    monthsTotal: 4,
    courseStartDate: "2026-09-07",
    sessionStarts: SESSIONS,
    rows: [row({})],
    ...over,
  });

describe("the Terms' own examples", () => {
  it("500 lei a month: before the start, all of it comes back", () => {
    expect(preview({ at: "2026-08-28T10:00:00.000Z" })).toMatchObject({
      case: "before_start",
      backLei: 500,
      keptLei: 0,
      creditLei: 0,
      certain: true,
    });
  });

  it("after the first lesson: 500 - 62.50 = 437.50", () => {
    expect(preview({ at: after(1) })).toMatchObject({
      case: "test_lessons",
      keptLei: 62.5,
      backLei: 437.5,
    });
  });

  it("after the third lesson: the month is not refunded, its 5 lessons left are 312.50 lei of credit", () => {
    expect(preview({ at: after(3) })).toMatchObject({
      case: "after_test_lessons",
      currentMonth: 1,
      creditLei: 312.5,
      backLei: 0,
    });
  });

  it("A1 in person paid in full, 2,380 lei, left after 2 months: 1,190 - 10% = 1,071 lei", () => {
    const course = lessons("2026-12-07", 32);
    // Just after lesson 16: two months held, months 3 and 4 not started.
    const at = new Date(Date.parse(course[15]!) + 60_000).toISOString();
    expect(
      preview({
        signedUpAt: NEW,
        at,
        courseStartDate: "2026-12-07",
        sessionStarts: course,
        rows: [
          row({
            kind: "full",
            amount_lei: 2380,
            paid_at: NEW,
            month_from: 1,
            month_to: 4,
          }),
        ],
      }),
    ).toMatchObject({
      case: "after_test_lessons",
      rules: "new",
      currentMonth: null,
      creditLei: 0,
      cancelFeeLei: 119,
      backLei: 1071,
    });
  });
});

describe("months paid ahead", () => {
  it("come back in full under the earlier rules; the month in progress becomes credit", () => {
    const out = preview({
      at: after(11), // month 2, 3 of its lessons held
      rows: [row({ amount_lei: 1500, month_from: 1, month_to: 3 })],
    });
    expect(out).toMatchObject({
      rules: "old",
      currentMonth: 2,
      creditLei: 312.5,
      backLei: 500,
      cancelFeeLei: 0,
      paidLei: 1500,
    });
  });

  it("a month that just ended leaves none in progress: the next one has not started", () => {
    const out = preview({
      at: after(8),
      rows: [row({ amount_lei: 1000, month_from: 1, month_to: 2 })],
    });
    expect(out).toMatchObject({
      currentMonth: null,
      creditLei: 0,
      backLei: 500,
    });
  });

  it("a month granted for free is not money", () => {
    const out = preview({
      at: after(3),
      rows: [
        row({}),
        row({
          kind: "credit",
          method: "credit",
          amount_lei: 0,
          month_from: 4,
          month_to: 4,
        }),
      ],
    });
    expect(out).toMatchObject({ paidLei: 500, backLei: 0, creditLei: 312.5 });
  });

  it("a card payment online leaves the Stripe fee to come off", () => {
    expect(
      preview({
        at: "2026-08-28T10:00:00.000Z",
        rows: [row({ method: "card_online" })],
      }),
    ).toMatchObject({ backLei: 500, stripeFee: true });
    expect(preview({ at: "2026-08-28T10:00:00.000Z" })["stripeFee"]).toBe(false);
  });
});

describe("the 14 days (new rules)", () => {
  const S = lessons("2026-11-23", 32);
  const base = {
    signedUpAt: NEW,
    courseStartDate: "2026-11-23",
    sessionStarts: S,
    rows: [row({ paid_at: NEW })],
  };

  it("everything comes back, even after lessons, without the request to start early", () => {
    expect(preview({ ...base, at: "2026-11-27T10:00:00.000Z" })).toMatchObject({
      case: "withdrawal",
      backLei: 500,
      keptLei: 0,
      stripeFee: false,
    });
  });

  it("with the request, the lessons held are paid", () => {
    expect(
      preview({
        ...base,
        earlyStartRequested: true,
        at: "2026-11-27T10:00:00.000Z",
      }),
    ).toMatchObject({ case: "withdrawal", keptLei: 125, backLei: 375 });
  });

  it("after day 14 the cancellation rules apply", () => {
    expect(preview({ ...base, at: "2026-12-05T10:00:00.000Z" })["case"]).toBe(
      "after_test_lessons",
    );
  });
});

describe("an absence the owner excused", () => {
  it("counts as not held for this student", () => {
    const out = preview({ at: after(3), excusedStarts: [SESSIONS[1]] });
    expect(out).toMatchObject({
      lessonsHeld: 3,
      lessonsExcused: 1,
      creditLei: 375,
    });
    expect(
      preview({ at: after(2), excusedStarts: [SESSIONS[1]] }),
    ).toMatchObject({ keptLei: 62.5, backLei: 437.5 });
  });
});

describe("when the lessons are not known, no amount is promised", () => {
  it("started, and no lesson in the system", () => {
    expect(
      preview({ at: "2026-09-20T10:00:00.000Z", sessionStarts: [] })["certain"],
    ).toBe(false);
  });

  it("running, and no lesson in the system after today", () => {
    expect(
      preview({ at: after(10), sessionStarts: SESSIONS.slice(0, 10) })["certain"],
    ).toBe(false);
  });

  it("the course is over: nothing back", () => {
    expect(preview({ at: "2027-02-01T10:00:00.000Z" })).toMatchObject({
      case: "finished",
      backLei: 0,
      creditLei: 0,
    });
  });
});

describe("which button", () => {
  const now = new Date("2026-11-25T10:00:00.000Z");
  it("the withdrawal one during the 14 days, for any course but the trial", () => {
    for (const form_type of ["group", "private", "kids"])
      expect(
        mod().cancelOptions(
          { form_type, created_at: NEW, canceled_at: null },
          "open",
          now,
        ),
      ).toEqual({ withdrawalUntil: "2026-12-04", cancel: false });
    expect(
      mod().cancelOptions(
        { form_type: "trial", created_at: NEW, canceled_at: null },
        null,
        now,
      ),
    ).toEqual({ withdrawalUntil: null, cancel: false });
  });

  it("the cancel one after, for a group still running", () => {
    const later = new Date("2026-12-05T10:00:00.000Z");
    const reg = { form_type: "group", created_at: NEW, canceled_at: null };
    expect(mod().cancelOptions(reg, "in_progress", later)).toEqual({
      withdrawalUntil: null,
      cancel: true,
    });
    expect(mod().cancelOptions(reg, "completed", later).cancel).toBe(false);
    expect(
      mod().cancelOptions({ ...reg, form_type: "private" }, null, later).cancel,
    ).toBe(false);
  });

  it("under the earlier rules there is no 14-day button", () => {
    expect(
      mod().cancelOptions(
        {
          form_type: "group",
          created_at: "2026-11-10T10:00:00.000Z",
          canceled_at: null,
        },
        "in_progress",
        new Date("2026-11-17T10:00:00.000Z"),
      ),
    ).toEqual({ withdrawalUntil: null, cancel: true });
  });

  it("nothing for a student who already left", () => {
    expect(
      mod().cancelOptions(
        { form_type: "group", created_at: NEW, canceled_at: NEW },
        "open",
        now,
      ),
    ).toEqual({ withdrawalUntil: null, cancel: false });
  });
});

describe("the statement and its time", () => {
  it("names the course and the day of the contract", () => {
    const s = mod().cancelStatement("withdrawal", {
      course: "A1 online",
      signedUpAt: NEW,
      lang: "ro",
    });
    expect(s).toBe(
      "Mă retrag din contractul pentru „A1 online”, încheiat pe 20 noiembrie 2026.",
    );
    expect(
      mod().cancelStatement("withdrawal", {
        course: "A1 online",
        signedUpAt: NEW,
        lang: "en",
      }),
    ).toBe(
      "I withdraw from the contract for “A1 online”, concluded on 20 November 2026.",
    );
  });

  it("says the date and the time in Bucharest", () => {
    expect(mod().dateAndTime("2026-11-20T12:05:00.000Z", "ro")).toBe(
      "20 noiembrie 2026, ora 14:05 (ora României)",
    );
    expect(mod().dateAndTime("2026-11-20T12:05:00.000Z", "en")).toBe(
      "20 November 2026 at 14:05 (Romanian time)",
    );
  });
});
