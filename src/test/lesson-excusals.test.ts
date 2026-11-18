import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { computeGroupCancelRefund } from "../../supabase/functions/_shared/group-refund";
import {
  cancelPreview,
  excusedStarts,
} from "../../supabase/functions/_shared/cancel-request";

/**
 * Absences with a good reason (owner, 17 Nov 2026: "the mark for an absense
 * with good reason yes"; Terms, section 4 "Absențe"): a lesson the owner
 * excused for a student counts as not held for that student in the refund.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const NOVEMBER = [
  "2026-11-02T16:00:00Z",
  "2026-11-04T16:00:00Z",
  "2026-11-09T16:00:00Z",
  "2026-11-11T16:00:00Z",
  "2026-11-16T16:00:00Z",
  "2026-11-18T16:00:00Z",
  "2026-11-23T16:00:00Z",
  "2026-11-25T16:00:00Z",
];
const card = {
  paymentId: "ch_1",
  amountBani: 50_000,
  stripeFeeBani: 1_000,
  chargedAt: "2026-11-01T10:00:00Z",
};

describe("the card subscription's refund", () => {
  it("after lesson 1, excused: 8 of 8 lessons back, minus the Stripe fee", () => {
    const base = {
      charges: [card],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T10:00:00Z",
      cancelledAt: "2026-11-03T10:00:00Z",
    };
    expect(computeGroupCancelRefund(base).refundBani).toBe(42_750);
    const excused = computeGroupCancelRefund({
      ...base,
      excusedStarts: [NOVEMBER[0]!],
    });
    expect(excused).toMatchObject({
      case: "current_month",
      lessonsHeld: 0,
      lessonsNotHeld: 8,
      refundBani: 49_000,
    });
  });

  it("after lesson 3 with lesson 2 excused: 6 lessons of credit, not 5", () => {
    const r = computeGroupCancelRefund({
      charges: [card],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T10:00:00Z",
      cancelledAt: "2026-11-10T10:00:00Z",
      excusedStarts: [NOVEMBER[1]!],
    });
    // The course has still had its three lessons: past the test lessons.
    expect(r.case).toBe("credit");
    expect(r.creditBani).toBe(37_500);
  });

  it("within the 14 days with the early-start request: an excused lesson is not paid", () => {
    const base = {
      charges: [card],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T10:00:00Z",
      cancelledAt: "2026-11-05T10:00:00Z",
      signedUpAt: "2026-11-01T09:00:00Z",
      withdrawalDays: 14,
      startedAtRequest: true,
    };
    expect(computeGroupCancelRefund(base).refundBani).toBe(37_500);
    expect(
      computeGroupCancelRefund({ ...base, excusedStarts: [NOVEMBER[1]!] })
        .refundBani,
    ).toBe(43_750);
  });
});

describe("which lessons", () => {
  it("by Google Calendar event: a moved lesson keeps its mark, a cancelled one is gone", () => {
    const sessions = [
      { starts_at: "2026-11-02T16:00:00Z", google_event_id: "e1" },
      // e2 was moved to Thursday in the calendar
      { starts_at: "2026-11-05T16:00:00Z", google_event_id: "e2" },
    ];
    expect(excusedStarts(sessions, ["e2", "e9"])).toEqual([
      "2026-11-05T16:00:00Z",
    ]);
  });

  it("the account's preview counts them the same way", () => {
    const out = cancelPreview({
      signedUpAt: "2026-10-01T10:00:00Z",
      monthsTotal: 4,
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      excusedStarts: [NOVEMBER[0]!],
      rows: [
        {
          kind: "month",
          method: "transfer",
          amount_lei: 500,
          paid_at: "2026-10-01T10:00:00Z",
          month_from: 1,
          month_to: 1,
        },
      ],
      at: "2026-11-05T10:00:00Z",
    });
    expect(out).toMatchObject({
      case: "test_lessons",
      lessonsHeld: 2,
      lessonsExcused: 1,
      keptLei: 62.5,
      backLei: 437.5,
    });
  });
});

describe("the build", () => {
  it("the table: once per student and lesson, server-only", () => {
    const sql = read("supabase/migrations/20261118120000_lesson_excusals.sql");
    expect(sql).toContain("create table if not exists public.lesson_excusals");
    expect(sql).toContain(
      "constraint lesson_excusals_once unique (registration_id, google_event_id)",
    );
    expect(sql).toContain(
      "alter table public.lesson_excusals enable row level security;",
    );
    expect(sql).toContain(
      "revoke all on public.lesson_excusals from anon, authenticated;",
    );
  });

  it("the admin marks only a lesson of the student's own group, and keeps a trail", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    const start = admin.indexOf('if (action === "set_excusal")');
    expect(start).toBeGreaterThan(0);
    const action = admin.slice(start, start + 3500);
    expect(action).toMatch(
      /\.from\("cohort_sessions"\)[\s\S]*?\.eq\("cohort_id", reg\.cohort_id\)\s*\.eq\("google_event_id", eventId\)/,
    );
    expect(action).toContain('onConflict: "registration_id,google_event_id"');
    expect(action).toContain('excused ? "mark_excused" : "unmark_excused"');
    expect(action).not.toMatch(/sendTemplateEmail|refunds\.create/);
    expect(admin).toContain('if (action === "list_excusals")');
  });

  it("both refunds read the marks; unread, the card refund stops and the preview promises no amount", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    expect(admin).toContain("if (marksErr) throw marksErr;");
    expect(admin).toMatch(
      /cancelledAt: await requestedCancellationAt\(supabase, reg\.id\),\s+excusedStarts,/,
    );
    const fn = read("supabase/functions/student-cancel/index.ts");
    expect(fn).toContain('.from("lesson_excusals")');
    expect(fn).toContain("excusedStarts: excused,");
    expect(fn).toContain(
      "return excusedKnown ? preview : { ...preview, certain: false };",
    );
  });

  it("the sheet shows them for group students", () => {
    expect(read("src/components/admin/PersonSheet.tsx")).toContain(
      "<LessonExcusals registrationId={person.id} />",
    );
    const ui = read("src/components/admin/LessonExcusals.tsx");
    expect(ui).toContain('action: "set_excusal"');
    expect(ui).toContain("Absențe motivate");
  });
});
