import { describe, expect, it } from "vitest";
import {
  PHYSICAL_MIN_NOTICE_HOURS,
  minNoticeHours,
} from "../../supabase/functions/_shared/schedule-rules";

// Owner, 2 Nov 2026: an in-person lesson is booked at least 24 hours ahead,
// so Ibra can get to the center; online keeps the lesson type's own notice.
describe("notice period by format", () => {
  it("in person needs a day, online keeps the type's notice", () => {
    expect(PHYSICAL_MIN_NOTICE_HOURS).toBe(24);
    expect(minNoticeHours({ min_notice_hours: 12 }, "physical")).toBe(24);
    expect(minNoticeHours({ min_notice_hours: 12 }, "online")).toBe(12);
  });

  it("a longer notice set in admin still wins in person", () => {
    expect(minNoticeHours({ min_notice_hours: 48 }, "physical")).toBe(48);
  });
});
