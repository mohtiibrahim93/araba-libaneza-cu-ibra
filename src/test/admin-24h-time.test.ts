import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { splitHhmm } from "@/components/admin/TimeField";

/**
 * The panel's clock is 24-hour, in every browser.
 *
 * `<input type="time">` draws itself in the browser's locale, not the page's,
 * so on a machine set to English the owner saw "12:00 PM" in Disponibilitate
 * while the site he runs writes every hour as 19:00. No attribute forces the
 * 24-hour clock: the only reliable fix is not to ask the browser for a clock.
 *
 * So the admin uses two selects. This file is here because the native input is
 * the obvious thing to reach for and would quietly bring the AM/PM back on
 * exactly the machines nobody tests on.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("splitHhmm", () => {
  it("reads the shapes the database and the form actually hold", () => {
    expect(splitHhmm("09:30:00")).toEqual(["09", "30"]);
    expect(splitHhmm("09:30")).toEqual(["09", "30"]);
    expect(splitHhmm("9:5")).toEqual(["09", "05"]);
    expect(splitHhmm("20:30:00")).toEqual(["20", "30"]);
  });

  it("never returns something a select cannot show", () => {
    // A bad value must not blank the control or render an hour out of range:
    // the row would look empty and saving it would write nonsense.
    expect(splitHhmm("")).toEqual(["00", "00"]);
    expect(splitHhmm("nonsense")).toEqual(["00", "00"]);
    expect(splitHhmm("31:99")).toEqual(["23", "59"]);
  });
});

describe("the time control", () => {
  const field = read("src/components/admin/TimeField.tsx");

  it("offers all 24 hours, not 12", () => {
    expect(field).toContain("length: 24");
    // Two plain selects of zero-padded numbers: there is no half-day to pick,
    // so there is nothing for a locale to render as AM or PM.
    expect(field).toContain('String(h).padStart(2, "0")');
    expect(field).toContain("<select");
  });

  it("keeps a stored minute that is off the step grid", () => {
    // Snapping 10:20 to 10:15 while someone edits the weekday next to it is
    // an edit nobody asked for, and it would be saved by the same click.
    expect(field).toContain('MINUTE_STEPS.includes(mm) ? MINUTE_STEPS : [...MINUTE_STEPS, mm]');
  });
});

describe("the admin screens", () => {
  it("has no native time input left to render AM/PM", () => {
    const dirs = ["src/components/admin", "src/components"];
    const offenders: string[] = [];
    for (const dir of dirs) {
      const base = resolve(process.cwd(), dir);
      for (const name of readdirSync(base, { withFileTypes: true })) {
        if (!name.isFile() || !name.name.endsWith(".tsx")) continue;
        // TimeField names it in the comment explaining why it does not use it.
        if (name.name === "TimeField.tsx") continue;
        const src = readFileSync(join(base, name.name), "utf8");
        if (src.includes('type="time"')) offenders.push(`${dir}/${name.name}`);
      }
    }
    expect(offenders, "these would show 12-hour time on an English-locale browser").toEqual([]);
  });

  it("uses the shared control where the hours are set", () => {
    for (const f of ["src/components/AvailabilityAdmin.tsx", "src/components/admin/KidsSlotsAdmin.tsx"]) {
      expect(read(f), `${f} sets hours`).toContain("TimeField");
    }
  });
});
