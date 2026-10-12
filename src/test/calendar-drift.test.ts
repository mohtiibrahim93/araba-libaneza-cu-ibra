import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Lessons changed in Google Calendar, where the panel never found out.
 *
 * Bookings are written to Google and never read back. The owner moves a lesson
 * on his phone, the panel keeps the old hour, and the reminder goes out on the
 * old hour too — that was the complaint, and it is the half of the sync that
 * did not exist.
 *
 * This is the read-only half: it compares and reports. Writing Google's times
 * into `bookings` automatically is a bigger decision than it looks, because a
 * wrong match rewrites a real lesson's time, and it should not arrive as a side
 * effect of opening a health screen.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const admin = read("supabase/functions/admin-registrations/index.ts");
const ui = read("src/components/admin/CalendarHealth.tsx");
const drift = admin.slice(admin.indexOf("async function calendarDrift("), admin.indexOf("async function refundInputsFor("));

describe("the drift check", () => {
  it("writes nothing", () => {
    // The whole safety argument. If this ever gains a write, it stops being a
    // diagnostic and starts being a sync nobody reviewed.
    expect(drift).not.toContain(".update(");
    expect(drift).not.toContain(".insert(");
    expect(drift).not.toContain(".delete(");
    expect(drift).not.toContain(".upsert(");
  });

  it("reads Google once, not once per booking", () => {
    // Forty upcoming lessons would otherwise be forty round trips every time
    // the screen opens.
    expect(drift).toContain("/calendars/primary/events?");
    expect(drift).toContain("pageToken");
    expect((drift.match(/await fetch\(/g) ?? []).length).toBe(1);
  });

  it("asks for deleted events, which are the point", () => {
    // An event cancelled in Google is exactly what we are looking for, and
    // events.list omits it unless asked.
    expect(drift).toContain('showDeleted: "true"');
    expect(drift).toContain('singleEvents: "true"');
  });

  it("only looks at lessons still to come", () => {
    expect(drift).toContain('Date.parse(String(r["start_at"])) >= now');
  });

  it("compares instants with slack, not strings", () => {
    // Google returns its own offset format; string equality would report every
    // single booking as moved.
    expect(drift).toContain("Math.abs(Date.parse(ev.start) - Date.parse(bookedAt)) > 60_000");
  });

  it("returns null when it could not look, and [] when nothing disagrees", () => {
    // Printing those two the same way would make an outage look like health.
    expect(drift).toContain("return null;");
    expect(drift).toContain("return [];");
  });

  it("never breaks the rest of the health screen", () => {
    expect(drift).toContain("catch (err)");
    const health = admin.slice(admin.indexOf('action === "calendar_health"'));
    expect(health.slice(0, 3000)).toContain("drift: await calendarDrift(rows)");
  });
});

describe("the panel", () => {
  it("tells the three cases apart", () => {
    for (const kind of ["moved", "cancelled_in_google", "not_found"]) {
      expect(ui, `${kind} needs its own wording`).toContain(kind);
    }
  });

  it("distinguishes 'nothing to report' from 'could not check'", () => {
    expect(ui).toContain("health.drift === null");
    expect(ui).toContain("health.drift.length === 0");
    expect(ui).toContain("N-am putut verifica acum");
  });

  it("keeps null and an empty list apart when normalising the response", () => {
    // The spread-with-defaults pattern used for the other fields would turn a
    // missing drift into [], i.e. "all good".
    expect(ui).toContain("drift: raw.drift === undefined ? null : raw.drift");
  });

  it("says what to do about it", () => {
    // Knowing a lesson drifted is only useful with the next step attached, and
    // the next step is the control added alongside this.
    expect(ui).toContain("Mută");
    expect(ui).toContain("memento");
  });
});
