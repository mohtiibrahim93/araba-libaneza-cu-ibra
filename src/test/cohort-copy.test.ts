import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cohortNoteLine, type CohortNoteStrings } from "@/lib/cohortCopy";
import type { Cohort } from "@/lib/cohortTypes";

/**
 * Start dates must come from the data, not from the copy.
 *
 * The site told visitors on 21 September that its groups start on 1 and 2
 * September. The sentence was hand-written into i18n strings and rendered in
 * three places, so it could only ever be as current as the last person who
 * remembered to edit it.
 */
const RO: CohortNoteStrings = {
  runningSince: "în desfășurare din {date}",
  startsOn: "începe pe {date}",
  today: "Începe azi",
  full: "Listă de așteptare",
  online: "online",
  inPerson: "fizic",
  spotsLeft: "{n} locuri rămase",
};

const cohort = (over: Partial<Cohort> = {}): Cohort =>
  ({
    id: "c1",
    form_type: "group",
    level: "a1",
    format: "fizic",
    start_date: "2026-09-02",
    schedule_label_ro: "luni și miercuri 19:00–20:30",
    schedule_label_en: "Mon and Wed 19:00–20:30",
    max_seats: 10,
    sort_order: 0,
    teaching_language: "ro",
    end_date: null,
    end_date_is_estimate: false,
    break_note_ro: null,
    break_note_en: null,
    status: "in_progress",
    taken: 2,
    seatsLeft: 8,
    full: false,
    ...over,
  }) as Cohort;

const NOW = new Date("2026-09-21T10:00:00");

describe("the enrolment note follows the cohort data", () => {
  it("says a started course is running, with the date it began", () => {
    expect(cohortNoteLine(cohort(), RO, "ro", NOW)).toBe("A1 fizic · în desfășurare din 2 septembrie");
  });

  it("says when a future course starts", () => {
    const line = cohortNoteLine(cohort({ start_date: "2026-10-05" }), RO, "ro", NOW);
    expect(line).toBe("A1 fizic · începe pe 5 octombrie");
  });

  it("calls today today", () => {
    expect(cohortNoteLine(cohort({ start_date: "2026-09-21" }), RO, "ro", NOW)).toContain("Începe azi");
  });

  it("offers the waiting list instead of a date when the group is full", () => {
    const line = cohortNoteLine(cohort({ full: true, seatsLeft: 0 }), RO, "ro", NOW);
    expect(line).toBe("A1 fizic · Listă de așteptare");
    expect(line).not.toMatch(/septembrie|octombrie/);
  });

  it("mentions seats only when they are nearly gone", () => {
    expect(cohortNoteLine(cohort({ seatsLeft: 8 }), RO, "ro", NOW)).not.toContain("locuri rămase");
    expect(cohortNoteLine(cohort({ seatsLeft: 2 }), RO, "ro", NOW)).toContain("2 locuri rămase");
  });

  it("uses the reader's language for the month", () => {
    expect(cohortNoteLine(cohort(), { ...RO, runningSince: "running since {date}", inPerson: "in person" }, "en", NOW))
      .toBe("A1 in person · running since 2 September");
  });
});

describe("no page states a start date in prose any more", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it.each([
    "src/components/ProgramsSection.tsx",
    "src/components/CTASection.tsx",
    "src/pages/courses/CursGrup.tsx",
  ])("%s renders the note from the database", (file) => {
    expect(read(file)).toContain("<CohortEnrollmentNote");
  });

  it("no longer carries the hand-written notes at all", () => {
    // Deleted rather than left unused: an unrendered string holding a date is
    // how the date finds its way back onto a page.
    const i18n = read("src/lib/i18n.tsx");
    for (const key of ["groupEnrollmentOpenNote", "ctaScheduleGroupValue"]) {
      expect(i18n, `${key} should be gone`).not.toContain(`${key}:`);
    }
  });

  it("keeps start dates out of the static curriculum too", () => {
    // The durable facts — days, times, lesson count, venue — stay; the date
    // comes from the cohort.
    expect(read("src/data/curriculum.ts")).not.toMatch(/start\s+\w+,?\s+\d{1,2}\s+(septembrie|September)/i);
  });
});
