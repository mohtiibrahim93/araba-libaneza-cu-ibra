import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Two screens reported on the same bookings and disagreed.
 *
 * "Sănătate calendar" said three of four confirmed lessons had never reached
 * Google Calendar. "Azi" said there was no problem at all. They were asking
 * different questions: the health screen asks whether the event exists
 * (`google_event_id` is null), while Azi asked only whether an error had been
 * recorded (`google_sync_error` is set). A sync that fails without writing an
 * error — a dropped request, a token that expired mid-retry — produces a
 * booking with no event and no error, which the health screen counts and Azi
 * could not see.
 *
 * They must ask the same question of the same column.
 */
const fn = readFileSync(
  resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
  "utf8",
);

const section = (name: string) => {
  const at = fn.indexOf(`action === "${name}"`);
  expect(at, `${name} is gone`).toBeGreaterThan(-1);
  const next = fn.indexOf('action === "', at + 20);
  return fn.slice(at, next === -1 ? fn.length : next);
};

describe("Azi and Sănătate calendar agree on what unsynced means", () => {
  it("judges a lesson by whether the calendar event exists", () => {
    const today = section("list_today");
    expect(today).toContain("!b.google_event_id");
  });

  it("reads the column it judges by", () => {
    // The field was not in the select, so the check could only ever have been
    // written against the error string.
    const today = section("list_today");
    const select = today.slice(today.indexOf('.from("bookings")'));
    expect(select.slice(0, 400)).toContain("google_event_id");
  });

  it("still names the error when there is one", () => {
    // A recorded reason is more useful than "no event"; it should not be lost
    // now that the condition no longer depends on it.
    expect(section("list_today")).toContain("b.google_sync_error");
  });

  it("counts the past failures it deliberately leaves out of the worklist", () => {
    // Past lessons are not work — nobody attends August retroactively — but a
    // backlog means the sync is broken rather than unlucky, and Azi saying
    // nothing at all is what made the two screens contradict each other.
    const today = section("list_today");
    expect(today).toContain('.is("google_event_id", null)');
    expect(today).toContain("olderUnsyncedLessons");
  });

  it("keeps the health screen on the same test", () => {
    expect(section("calendar_health")).toContain("r.google_event_id");
  });
});

describe("the calendar feed link does not display its token", () => {
  const screen = readFileSync(
    resolve(process.cwd(), "src/components/admin/CalendarHealth.tsx"),
    "utf8",
  );

  it("masks the token until asked", () => {
    // The token is the whole of the authentication: whoever holds the URL can
    // read every booking. It used to be printed in full, so it was on screen
    // during any screen-share.
    expect(screen).toContain("maskToken");
    expect(screen).toContain("showFeedUrl ? health.feed.url : maskToken(health.feed.url)");
  });

  it("still lets the owner copy it without revealing it", () => {
    expect(screen).toContain("copyFeed");
  });

  it("says why it is masked", () => {
    expect(screen).toContain("cheie secretă");
  });
});
