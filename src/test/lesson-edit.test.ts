import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/** "Modifică lecția" (owner's request, 14 October 2026). */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const admin = read("supabase/functions/admin-registrations/index.ts");
const action = admin.slice(
  admin.indexOf('if (action === "update_booking_details")'),
  admin.indexOf('if (action === "cancel_booking")'),
);

describe("changing a lesson's length, place or notes", () => {
  it("changes Google first and the site only once Google accepted it", () => {
    expect(action).toContain("?sendUpdates=all");
    expect(action.indexOf('method: "PATCH"')).toBeLessThan(
      action.indexOf(
        ".update({ end_at: endAt, format, meet_link: meetLink, notes })",
      ),
    );
    expect(action).toContain("Nimic nu s-a schimbat.");
  });
  it("only changes length or place for a lesson still booked; notes always", () => {
    expect(action).toContain(
      '(lengthChanged || formatChanged) && lesson.status !== "confirmed"',
    );
  });
  it("keeps the Zoom room for online and drops it for the centre", () => {
    expect(code(action)).toContain(
      code(
        'const meetLink = format === "online" ? (lesson.meet_link ?? zoomUrl) : null;',
      ),
    );
  });
});

describe("moving a lesson", () => {
  it("keeps the lesson's own length, not the lesson type's default", () => {
    const manage = read("supabase/functions/booking-manage/index.ts");
    expect(code(manage)).toContain(
      code(
        "const ownLengthMs = Date.parse(booking.end_at) - Date.parse(booking.start_at);",
      ),
    );
  });
});

describe("the window is reachable wherever a lesson is shown", () => {
  it("Acasă, Săptămâna (grid and list) and Toate lecțiile open it", () => {
    for (const f of [
      "src/components/admin/TodayAdmin.tsx",
      "src/components/admin/WeekLessons.tsx",
      "src/components/BookingsAdmin.tsx",
    ]) {
      expect(read(f), f).toContain("<LessonEditDialog");
    }
    expect(read("src/components/admin/WeekLessons.tsx")).toContain(
      "onClick={() => setEditing(b)}",
    );
  });
});
