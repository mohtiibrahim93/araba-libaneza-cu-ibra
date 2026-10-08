import { describe, expect, it } from "vitest";
import {
  canStillJoin,
  joinClosesAfter,
  lessonNumber,
  planRemaining,
  titleForLesson,
} from "../../supabase/functions/_shared/cohort-sessions";

/**
 * Group lessons read from the owner's Google Calendar (October 2026).
 *
 * The titles below are the ones actually in the calendar on 8 Oct 2026, typed
 * by hand with uneven dashes and spaces. If these stop matching, the sync
 * silently finds nothing and the site says a running group has no lessons.
 */
describe("reading lesson events", () => {
  it("reads the owner's real titles", () => {
    expect(lessonNumber("Adulti-A1- Grupa 2-  Libaneza-L11", "Adulti-A1- Grupa 2- Libaneza")).toBe(11);
    expect(lessonNumber("Adulti- A2- Grupa 1- Libaneza-L12", "Adulti- A2- Grupa 1- Libaneza")).toBe(12);
    expect(lessonNumber("Curs A1 online Araba Libaneza- L14", "Curs A1 online Araba Libaneza")).toBe(14);
    expect(lessonNumber("Curs A1 online Araba Libaneza L3", "Curs A1 online Araba Libaneza")).toBe(3);
  });

  it("reads Lecția N too, with or without diacritics", () => {
    expect(lessonNumber("Curs A1 online – Lecția 12", "Curs A1 online")).toBe(12);
    expect(lessonNumber("curs a1 online - lectia 7", "Curs A1 online")).toBe(7);
  });

  it("ignores the unnumbered first meeting and other courses", () => {
    expect(lessonNumber("Curs A1 online Araba Libaneza", "Curs A1 online Araba Libaneza")).toBeNull();
    // A2's lessons are not A1's, although both start "Adulti".
    expect(lessonNumber("Adulti- A2- Grupa 1- Libaneza-L12", "Adulti-A1- Grupa 2- Libaneza")).toBeNull();
    // Private lessons share the word but not the course name.
    expect(lessonNumber("Ioan , lectia 26 araba libaneza- 1/20", "Curs A1 online Araba Libaneza")).toBeNull();
  });
});

describe("titles for new lessons", () => {
  it("copies the latest lesson's title and only changes the number", () => {
    expect(titleForLesson("Adulti-A1- Grupa 2-  Libaneza-L11", 11, 12)).toBe("Adulti-A1- Grupa 2-  Libaneza-L12");
    expect(titleForLesson("Adulti- A2- Grupa 1- Libaneza-L12", 12, 13)).toBe("Adulti- A2- Grupa 1- Libaneza-L13");
    // The "1" in "Grupa 1" and "A2" are left alone.
    expect(titleForLesson("Adulti- A2- Grupa 1- Libaneza-L9", 9, 10)).toBe("Adulti- A2- Grupa 1- Libaneza-L10");
  });
});

describe("planning the rest of a course", () => {
  it("continues on the weekly pattern until the total", () => {
    // A1 Grupa 2: Monday & Wednesday 19:00–20:30, L11 on Wed 7 Oct.
    const plan = planRemaining({
      lastNumber: 11,
      lastDate: "2026-10-07",
      meetings: [
        { weekday: 1, start_time: "19:00:00", end_time: "20:30:00" },
        { weekday: 3, start_time: "19:00:00", end_time: "20:30:00" },
      ],
      total: 32,
    });
    expect(plan).toHaveLength(21);
    expect(plan[0]).toEqual({ lesson_number: 12, date: "2026-10-12", start_time: "19:00", end_time: "20:30" });
    expect(plan[1]?.date).toBe("2026-10-14");
    expect(plan.at(-1)?.lesson_number).toBe(32);
  });

  it("keeps different hours on different days (A1 online)", () => {
    const plan = planRemaining({
      lastNumber: 14,
      lastDate: "2026-10-11",
      meetings: [
        { weekday: 6, start_time: "12:00:00", end_time: "13:30:00" },
        { weekday: 0, start_time: "17:30:00", end_time: "19:00:00" },
      ],
      total: 32,
    });
    expect(plan[0]).toEqual({ lesson_number: 15, date: "2026-10-17", start_time: "12:00", end_time: "13:30" });
    expect(plan[1]).toEqual({ lesson_number: 16, date: "2026-10-18", start_time: "17:30", end_time: "19:00" });
    expect(plan).toHaveLength(18);
  });

  it("plans nothing when the course is complete or has no schedule", () => {
    expect(planRemaining({ lastNumber: 32, lastDate: "2026-12-01", meetings: [{ weekday: 1, start_time: "19:00", end_time: "20:30" }], total: 32 })).toEqual([]);
    expect(planRemaining({ lastNumber: 3, lastDate: "2026-10-01", meetings: [], total: 32 })).toEqual([]);
  });
});

describe("joining a running group", () => {
  it("is open until the last month starts (lesson 24 of 32)", () => {
    expect(joinClosesAfter(32)).toBe(24);
    expect(canStillJoin(14, 32)).toBe(true);
    expect(canStillJoin(23, 32)).toBe(true);
    expect(canStillJoin(24, 32)).toBe(false);
    expect(joinClosesAfter(56)).toBe(48);
  });
});
