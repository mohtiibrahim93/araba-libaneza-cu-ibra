import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";
import { meetingLabel } from "@/components/admin/types";

/**
 * Owner, 14 October 2026: every online lesson uses his Zoom personal room,
 * so every online lesson shows a "Zoom" button in admin, imported or not.
 */
const { lessonMeetingLink } = loadEdgeModule("supabase/functions/_shared/calendar-reconciliation.ts", {}) as any;
const ROOM = "https://example.zoom.us/j/1234567890";

describe("the video link of an imported lesson", () => {
  it("prefers a Google Meet link, then a Zoom link written in the event, then the owner's room", () => {
    expect(lessonMeetingLink({ hangoutLink: "https://meet.google.com/abc" }, true, ROOM)).toBe("https://meet.google.com/abc");
    expect(lessonMeetingLink({ location: "https://us06web.zoom.us/j/99?pwd=x" }, true, ROOM)).toBe("https://us06web.zoom.us/j/99?pwd=x");
    expect(lessonMeetingLink({ description: "Link Zoom: https://zoom.us/j/77 (parola 1)" }, true, ROOM)).toBe("https://zoom.us/j/77");
    expect(lessonMeetingLink({}, true, ROOM)).toBe(ROOM);
  });
  it("gives an in-person lesson no default link", () => {
    expect(lessonMeetingLink({}, false, ROOM)).toBeNull();
  });
  it("is used by both imports, with the room passed from the edge functions", () => {
    const src = readFileSync(resolve(process.cwd(), "supabase/functions/_shared/calendar-reconciliation.ts"), "utf8");
    expect(src.match(/meet_link: lessonMeetingLink\(/g)).toHaveLength(2);
    for (const f of ["calendar-sync", "admin-registrations"]) {
      expect(readFileSync(resolve(process.cwd(), `supabase/functions/${f}/index.ts`), "utf8")).toContain('zoomUrl: Deno.env.get("ZOOM_MEETING_URL")');
    }
  });
});

describe("the admin button", () => {
  it("names the service", () => {
    expect(meetingLabel(ROOM)).toBe("Zoom");
    expect(meetingLabel("https://meet.google.com/abc")).toBe("Meet");
  });
});
