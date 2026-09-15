import { describe, expect, it } from "vitest";
import {
  PHYSICAL_TRIAL_WEEKDAYS,
  physicalTrialAllowed,
} from "../../supabase/functions/_shared/schedule-rules";

/**
 * In-person trials run at weekends only, for now. booking-availability filters
 * the slots it offers and booking-create refuses anything else, so a client
 * posting straight to the API cannot book a weekday in-person trial either.
 */
describe("physical trial weekend rule", () => {
  // Bucharest local times. 2026-09-05 is a Saturday, 2026-09-06 a Sunday.
  const sat = "2026-09-05T09:00:00.000Z";
  const sun = "2026-09-06T09:00:00.000Z";
  const mon = "2026-09-07T09:00:00.000Z";
  const wed = "2026-09-09T16:00:00.000Z";
  const fri = "2026-09-11T09:00:00.000Z";

  it("allows an in-person trial on Saturday and Sunday", () => {
    expect(physicalTrialAllowed("trial", "physical", sat)).toBe(true);
    expect(physicalTrialAllowed("trial", "physical", sun)).toBe(true);
  });

  it("refuses an in-person trial on a weekday", () => {
    for (const d of [mon, wed, fri]) {
      expect(physicalTrialAllowed("trial", "physical", d)).toBe(false);
    }
  });

  it("leaves online trials alone on every day", () => {
    for (const d of [sat, sun, mon, wed, fri]) {
      expect(physicalTrialAllowed("trial", "online", d)).toBe(true);
    }
  });

  it("does not touch paid lessons in either format", () => {
    for (const d of [mon, wed, fri]) {
      expect(physicalTrialAllowed("paid", "physical", d)).toBe(true);
      expect(physicalTrialAllowed("paid", "online", d)).toBe(true);
    }
  });

  it("judges the weekday in Bucharest time, not UTC", () => {
    // 21:30 UTC on Friday is 00:30 Saturday in Bucharest (UTC+3 in September),
    // so this is a Saturday booking despite the UTC date reading Friday.
    expect(physicalTrialAllowed("trial", "physical", "2026-09-04T21:30:00.000Z")).toBe(true);
    // And 21:30 UTC on Sunday is already Monday locally.
    expect(physicalTrialAllowed("trial", "physical", "2026-09-06T21:30:00.000Z")).toBe(false);
  });

  it("names Saturday and Sunday", () => {
    expect([...PHYSICAL_TRIAL_WEEKDAYS].sort()).toEqual([0, 6]);
  });
});
