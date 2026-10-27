import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  bucharestTimeOn,
  reminderDue,
  reminderInLabel,
  type ReminderBooking,
} from "../../supabase/functions/_shared/reminder-schedule";

// Bucharest is UTC+2 in November (winter time).
const lesson = (over: Partial<ReminderBooking> = {}): ReminderBooking => ({
  // Thursday 5 November 2026, 18:00 Bucharest.
  start_at: "2026-11-05T16:00:00Z",
  // Booked on Monday 2 November, 15:00 Bucharest.
  reminders_from: "2026-11-02T13:00:00Z",
  morning_reminder_on: null,
  reminder_1h_sent_at: null,
  ...over,
});

describe("08:00 in Bucharest", () => {
  it("is 06:00 UTC in winter and 05:00 UTC in summer", () => {
    expect(new Date(bucharestTimeOn("2026-11-03", 8)).toISOString()).toBe(
      "2026-11-03T06:00:00.000Z",
    );
    expect(new Date(bucharestTimeOn("2026-07-03", 8)).toISOString()).toBe(
      "2026-07-03T05:00:00.000Z",
    );
  });

  it("is right on the days the clocks change", () => {
    // DST ends 25 Oct 2026 (04:00 → 03:00), starts 29 Mar 2026 (03:00 → 04:00).
    expect(new Date(bucharestTimeOn("2026-10-25", 8)).toISOString()).toBe(
      "2026-10-25T06:00:00.000Z",
    );
    expect(new Date(bucharestTimeOn("2026-03-29", 8)).toISOString()).toBe(
      "2026-03-29T05:00:00.000Z",
    );
  });
});

describe("a reminder every morning until the lesson day", () => {
  it("sends nothing on the morning of the booking day", () => {
    // Booked at 07:00 on 2 Nov: the confirmation just went; no 08:00 reminder.
    const b = lesson({ reminders_from: "2026-11-02T05:00:00Z" });
    expect(reminderDue(b, "2026-11-02T06:05:00Z")).toBeNull();
  });

  it("sends one each following morning, from 08:00, until the lesson day", () => {
    const b = lesson();
    // 3 Nov, 07:45 Bucharest: too early.
    expect(reminderDue(b, "2026-11-03T05:45:00Z")).toBeNull();
    // 3 Nov, 08:00: due, two days to go.
    expect(reminderDue(b, "2026-11-03T06:00:00Z")).toEqual({
      kind: "morning",
      day: "2026-11-03",
      daysToLesson: 2,
    });
    // Once sent, not again that day.
    const sent = { ...b, morning_reminder_on: "2026-11-03" };
    expect(reminderDue(sent, "2026-11-03T09:00:00Z")).toBeNull();
    // 4 Nov: due again, tomorrow.
    expect(reminderDue(sent, "2026-11-04T06:15:00Z")).toMatchObject({
      kind: "morning",
      daysToLesson: 1,
    });
    // 5 Nov, the lesson day: due, today.
    expect(
      reminderDue(
        { ...b, morning_reminder_on: "2026-11-04" },
        "2026-11-05T06:00:00Z",
      ),
    ).toMatchObject({ kind: "morning", day: "2026-11-05", daysToLesson: 0 });
  });

  it("uses the Bucharest date, not UTC", () => {
    // 23:30 UTC on 3 Nov is 01:30 on 4 Nov in Bucharest: before 08:00.
    const b = lesson({ morning_reminder_on: "2026-11-03" });
    expect(reminderDue(b, "2026-11-03T23:30:00Z")).toBeNull();
  });
});

describe("and one hour before, on the lesson day", () => {
  it("is due in the last hour, once", () => {
    const b = lesson({ morning_reminder_on: "2026-11-05" });
    expect(reminderDue(b, "2026-11-05T14:50:00Z")).toBeNull(); // 70 min to go
    expect(reminderDue(b, "2026-11-05T15:00:00Z")).toEqual({
      kind: "hour_before",
    });
    expect(
      reminderDue(
        { ...b, reminder_1h_sent_at: "2026-11-05T15:00:00Z" },
        "2026-11-05T15:15:00Z",
      ),
    ).toBeNull();
  });

  it("is the only one when the lesson starts before 09:00", () => {
    // Lesson at 09:00 Bucharest: at 08:00 the hour-before is due, not both.
    const b = lesson({ start_at: "2026-11-05T07:00:00Z" });
    expect(reminderDue(b, "2026-11-05T06:00:00Z")).toEqual({
      kind: "hour_before",
    });
    // Lesson at 08:30: the hour-before went at 07:30, nothing at 08:00.
    const early = lesson({
      start_at: "2026-11-05T06:30:00Z",
      reminder_1h_sent_at: "2026-11-05T05:30:00Z",
    });
    expect(reminderDue(early, "2026-11-05T06:00:00Z")).toBeNull();
  });

  it("is skipped when the lesson was booked less than an hour before", () => {
    // Booked at 17:30 for 18:00 the same day.
    const b = lesson({ reminders_from: "2026-11-05T15:30:00Z" });
    expect(reminderDue(b, "2026-11-05T15:35:00Z")).toBeNull();
  });

  it("is sent for a lesson booked the same morning", () => {
    // Booked at 10:00 for 18:00: no morning reminder that day, one at 17:00.
    const b = lesson({ reminders_from: "2026-11-05T08:00:00Z" });
    expect(reminderDue(b, "2026-11-05T09:00:00Z")).toBeNull();
    expect(reminderDue(b, "2026-11-05T15:00:00Z")).toEqual({
      kind: "hour_before",
    });
  });
});

describe("after the lesson, or when switched off", () => {
  it("sends nothing once the lesson has started", () => {
    expect(reminderDue(lesson(), "2026-11-05T16:00:00Z")).toBeNull();
  });

  it("sends nothing for a lesson imported from the owner's calendar", () => {
    expect(
      reminderDue(lesson({ reminders_enabled: false }), "2026-11-03T06:00:00Z"),
    ).toBeNull();
  });
});

describe("a moved lesson starts over", () => {
  it("is reset by the database whenever start_at changes", () => {
    const file = readdirSync(
      resolve(process.cwd(), "supabase/migrations"),
    ).find((f) => /^\d{14}_lesson_reminder_schedule\.sql$/.test(f));
    expect(file).toBeTruthy();
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations", file!),
      "utf8",
    );
    expect(sql).toMatch(/new\.start_at is distinct from old\.start_at/i);
    expect(sql).toMatch(/new\.reminders_from\s*:=\s*now\(\)/i);
    expect(sql).toMatch(/new\.morning_reminder_on\s*:=\s*null/i);
    expect(sql).toMatch(/new\.reminder_1h_sent_at\s*:=\s*null/i);
  });

  it("then follows the new time: nothing the morning of the move", () => {
    // Moved on 4 Nov at 10:00 to 6 Nov: no reminder on the 4th, one on the 5th.
    const moved = lesson({
      start_at: "2026-11-06T16:00:00Z",
      reminders_from: "2026-11-04T08:00:00Z",
    });
    expect(reminderDue(moved, "2026-11-04T09:00:00Z")).toBeNull();
    expect(reminderDue(moved, "2026-11-05T06:00:00Z")).toMatchObject({
      kind: "morning",
      daysToLesson: 1,
    });
  });
});

describe("the wording", () => {
  it("says today, tomorrow, in N days or in 1 hour", () => {
    expect(
      reminderInLabel({ kind: "morning", day: "x", daysToLesson: 0 }, "ro"),
    ).toBe("astăzi");
    expect(
      reminderInLabel({ kind: "morning", day: "x", daysToLesson: 1 }, "en"),
    ).toBe("tomorrow");
    expect(
      reminderInLabel({ kind: "morning", day: "x", daysToLesson: 3 }, "ro"),
    ).toBe("în 3 zile");
    expect(reminderInLabel({ kind: "hour_before" }, "en")).toBe("in 1 hour");
  });
});
