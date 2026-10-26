import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/**
 * Owner's request (14 October 2026): after a lesson the student gets an email
 * and can mark it done; if they don't, it is marked done after 48 hours.
 */
const read = (p: string) =>
  code(readFileSync(resolve(process.cwd(), p), "utf8"));
const reminders = read("supabase/functions/booking-reminders/index.ts");
const manage = read("supabase/functions/booking-manage/index.ts");

describe("the after-lesson email", () => {
  it("goes once per ended lesson, stamped only after it was sent", () => {
    expect(reminders).toContain(code('.is("done_check_sent_at", null)'));
    expect(reminders).toContain(
      code('await sendTemplateEmail("lesson-done-check", r.student_email'),
    );
    expect(reminders).toContain(
      code("idempotencyKey: `lesson-done-check-${r.id}`"),
    );
    const loop = reminders.slice(
      reminders.indexOf(code('sendTemplateEmail("lesson-done-check"')),
    );
    expect(loop.indexOf(code("continue;"))).toBeLessThan(
      loop.indexOf(code(".update({ done_check_sent_at: nowISO })")),
    );
  });
  it("links to the lesson page, where one click confirms", () => {
    expect(reminders).toContain(
      code("confirmUrl: `${manageUrl(r.manage_token)}?done=1`"),
    );
    expect(
      read(
        "supabase/functions/_shared/transactional-email-templates/registry.ts",
      ),
    ).toContain(code('"lesson-done-check": lessonDoneCheck'));
  });
  it("is not sent about lessons that ended before it started", () => {
    const sql = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/20261026120000_lesson_done_check.sql",
      ),
      "utf8",
    );
    expect(sql).toContain(
      "UPDATE public.bookings SET done_check_sent_at = now()\nWHERE end_at <= now() AND done_check_sent_at IS NULL;",
    );
  });
});

describe("marking a lesson done", () => {
  it("the student can, only once the lesson has ended and only a booked lesson", () => {
    expect(manage).toContain(code('if (body?.action !== "confirm_done")'));
    expect(manage).toContain(
      code("if (Date.parse(booking.end_at) > Date.now())"),
    );
    expect(manage).toContain(code('completed_by: "student"'));
    expect(manage).toContain(code('"GET, POST, PATCH, DELETE, OPTIONS"'));
  });
  it("happens by itself 48 hours after the lesson ended", () => {
    expect(reminders).toContain(
      code(
        '.update({ status: "completed", completed_at: nowISO, completed_by: "auto" })',
      ),
    );
    expect(reminders).toContain(
      code('.lte("end_at", new Date(now - 48 * 3_600_000).toISOString())'),
    );
  });
  it("the lesson page offers the button once the lesson has ended", () => {
    const page = read("src/pages/BookingManage.tsx");
    expect(page).toContain(code("{booking.can_confirm_done && ("));
    expect(page).toContain(
      code('body: JSON.stringify({ action: "confirm_done" })'),
    );
  });
});
