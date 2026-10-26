import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";

/** Săptămâna, owner's request (14 October 2026): drag to move, click to book. */
const week = code(
  readFileSync(
    resolve(process.cwd(), "src/components/admin/WeekLessons.tsx"),
    "utf8",
  ),
);

describe("the week grid", () => {
  it("lets a booked lesson be dragged; the drop opens Modifică lecția with the new time, where the move is confirmed", () => {
    expect(week).toContain(code('draggable={b.status === "confirmed"}'));
    expect(week).toContain(code("setMoveTo({ date: day, time: at });"));
    expect(week).toContain(code("moveTo={moveTo}"));
  });
  it("moves a dropped group lesson only after a confirmation, keeping its length, through Google", () => {
    expect(week).toContain(code("window.confirm(`Muți lecția"));
    expect(week).toContain(code('action: "move_cohort_session"'));
    expect(week).toContain(
      code("const length = Date.parse(g.ends_at) - Date.parse(g.starts_at);"),
    );
  });
  it("opens the booking form at the empty quarter hour that was clicked", () => {
    expect(week).toContain(
      code(
        "if (e.target === e.currentTarget) setBookingAt({ date: k, time: slotAt(e) });",
      ),
    );
    expect(week).toContain(code("<BookLessonDialog"));
    expect(week).toContain(code("Math.round(((y / HOUR_PX) * 60) / 15) * 15"));
  });
});
