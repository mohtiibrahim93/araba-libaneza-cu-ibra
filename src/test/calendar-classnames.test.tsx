import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UI } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

/**
 * react-day-picker renamed every class-name key in v9.
 *
 * The map in src/components/ui/calendar.tsx still used v8's — head_row,
 * head_cell, row, cell, day, caption, nav_button_previous, day_selected — and
 * v9 does not warn about keys it does not know; it drops them. The calendar
 * rendered with none of its layout, and the seven Romanian weekday
 * abbreviations ran together as "lumamijovisâdu" above the dates.
 *
 * Asserting against the library's own UI enum means a future rename fails here
 * instead of on the booking page.
 */
afterEach(cleanup);

describe("the calendar's class names match the installed library", () => {
  it("gives every weekday header a width, which is what visibly broke", () => {
    const { container } = render(<Calendar mode="single" />);
    const headers = container.querySelectorAll("th");
    expect(headers.length, "expected seven weekday headers").toBe(7);
    // Without a width on each cell the seven abbreviations run together.
    for (const cell of headers) {
      expect(cell.className, `weekday header has no width: "${cell.className}"`).toMatch(/\bw-\d+/);
    }
  });

  it("uses no key the installed version has dropped", () => {
    const live = new Set<string>(Object.values(UI) as string[]);
    // v8 names that silently do nothing in v9.
    for (const dead of ["head_row", "head_cell", "row", "cell", "caption", "table",
                        "nav_button", "nav_button_previous", "nav_button_next",
                        "day_selected", "day_today", "day_outside", "day_disabled", "day_hidden"]) {
      expect(live.has(dead), `${dead} is a v8 key and would be ignored`).toBe(false);
    }
  });

  it("sizes the day cells too", () => {
    const { container } = render(<Calendar mode="single" />);
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBeGreaterThan(27);
    expect(cells[0]?.className, "day cells lost their size").toMatch(/\bh-\d+ w-\d+/);
  });
});
