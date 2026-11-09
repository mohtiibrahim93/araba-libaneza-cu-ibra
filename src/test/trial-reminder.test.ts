import { describe, it, expect } from "vitest";
import { trialReminderText } from "@/lib/trialReminder";

describe("trial WhatsApp reminder", () => {
  it("includes first name, Bucharest time and Zoom link for online trials", () => {
    const t = trialReminderText({
      name: "Ana Pop",
      startAt: "2026-11-10T16:00:00Z",
      format: "online",
      meetLink: "https://zoom.us/j/123",
    });
    expect(t).toContain("Bună, Ana!");
    expect(t).toContain("18:00");
    expect(t).toContain("https://zoom.us/j/123");
  });
  it("says centre for in-person trials", () => {
    const t = trialReminderText({
      name: "Ion",
      startAt: "2026-11-10T16:00:00Z",
      format: "fizic",
      meetLink: null,
    });
    expect(t).toContain("la centru");
    expect(t).not.toContain("Zoom");
  });
});
