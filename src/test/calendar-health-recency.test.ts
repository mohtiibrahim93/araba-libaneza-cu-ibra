import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * "Sănătate calendar" said "1 din 4 au ajuns în Google Calendar" and the owner
 * read it as a fault happening now. It was not. All three failures were from
 * late July and early August; the only booking made since — 7 October — synced
 * correctly. The sync had been working for two months.
 *
 * The screen had no time dimension at all, so a six-month total was the only
 * thing it could say, and it would have gone on saying it every morning until
 * those bookings aged out. Their events can never appear: nobody attends August
 * retroactively.
 *
 * So the screen leads with the question worth asking — is it working now —
 * measured over the last thirty days, and keeps the six-month figure as
 * history, labelled as history.
 */
const fn = readFileSync(
  resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
  "utf8",
);
const screen = readFileSync(
  resolve(process.cwd(), "src/components/admin/CalendarHealth.tsx"),
  "utf8",
);

const health = (() => {
  const at = fn.indexOf('action === "calendar_health"');
  expect(at, "calendar_health is gone").toBeGreaterThan(-1);
  const next = fn.indexOf('action === "', at + 20);
  return fn.slice(at, next === -1 ? fn.length : next);
})();

describe("the calendar health screen separates now from history", () => {
  it("reports a recent window as well as the six-month total", () => {
    expect(health).toContain("latest:");
    expect(health).toContain("30 * 86_400_000");
    // The history window stays: it is still the right span for history.
    expect(health).toContain("180 * 86_400_000");
  });

  it("measures recency by when the booking was made, not when the lesson falls", () => {
    // A booking syncs at the moment it is created. Counting by start_at would
    // call a lesson booked today but scheduled for March a future problem.
    expect(health).toContain("created_at");
    const at = health.indexOf("latest:");
    expect(health.slice(at, at + 500)).toContain("Date.parse(r.created_at");
  });

  it("leads with the current state and marks the rest as history", () => {
    expect(screen).toContain("Sincronizarea acum");
    expect(screen).toContain("Istoric, ultimele 6 luni");
    const now = screen.indexOf("Sincronizarea acum");
    const history = screen.indexOf("Istoric, ultimele 6 luni");
    expect(now, "current state must come first").toBeLessThan(history);
  });

  it("says plainly when a healthy sync is healthy", () => {
    // Silence is not reassurance: with nothing failing recently the screen has
    // to say so, or the old total is the only thing the eye lands on.
    expect(screen).toContain("Funcționează");
  });

  it("does not present an unrecoverable past failure as outstanding work", () => {
    expect(screen).toContain("nu mai pot fi recuperate");
  });
});
