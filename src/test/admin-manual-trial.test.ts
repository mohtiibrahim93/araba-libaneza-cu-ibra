import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Owner, 2 Nov 2026: a trial booked by hand in admin is a free trial, not a
// paid private lesson (a trial on 27 Oct had been recorded as paid revenue).
describe("manual booking can be a free trial", () => {
  const server = readFileSync(
    "supabase/functions/admin-registrations/index.ts",
    "utf8",
  );
  const action = server.slice(server.indexOf('action === "book_for_student"'));

  it("creates its own trial registration that owes nothing", () => {
    expect(action).toContain('form_type: trial ? "trial" : "private"');
    expect(action).toMatch(/payment_status: trial\s*\?\s*"unpaid"/);
    expect(action).toContain(
      "const onExisting = existing !== null && !extra && !trial;",
    );
  });

  it("books the trial lesson type", () => {
    expect(action).toContain('event_type: trial ? "trial" : "paid"');
  });

  it("the form offers it and sends it", () => {
    const form = readFileSync(
      "src/components/admin/BookLessonDialog.tsx",
      "utf8",
    );
    expect(form).toContain("Lecție de probă (gratuită, 30 min)");
    expect(form).toContain("...(bkTrial ? { trial: true } : {})");
  });
});
