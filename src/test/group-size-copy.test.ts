import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  MAX_GROUP_SIZE,
  MAX_KIDS_GROUP_SIZE,
  minGroupSize,
  groupSizeLabel,
} from "@/lib/groupSize";

/**
 * Class size was stated by hand in eighteen places and they disagreed: most
 * said "4–10", three English pages said "max 8". When online groups were capped
 * at 6, every one of them had to be found by grep.
 *
 * This walks the source for class-size claims and fails on any that contradict
 * src/lib/groupSize.ts. It deliberately reads the shipped copy rather than the
 * constants — the constants are never what a visitor reads.
 */
const SRC = resolve(process.cwd(), "src");

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === "test") continue;
      yield* sourceFiles(p);
    } else if (/\.tsx?$/.test(entry)) {
      yield p;
    }
  }
}

describe("group-size copy", () => {
  it("caps online groups at 6 and in-person groups at 8, starting at half", () => {
    expect(MAX_GROUP_SIZE.online).toBe(6);
    expect(MAX_GROUP_SIZE.fizic).toBe(8);
    expect(MAX_KIDS_GROUP_SIZE).toBe(MAX_GROUP_SIZE.fizic);
    expect(minGroupSize(MAX_GROUP_SIZE.online)).toBe(3);
    expect(minGroupSize(MAX_GROUP_SIZE.fizic)).toBe(4);
    expect(groupSizeLabel("ro")).toBe("max. 6 cursanți online, 8 fizic");
    expect(groupSizeLabel("en")).toBe("max 6 students online, 8 in person");
  });

  it("states no class size the constants contradict", () => {
    // "4–10 ani" / "6–10 ani" are age ranges for the kids course, not sizes.
    const AGE = /(ani|years old|Jahre)/;
    const CLAIMS = [
      /\b4\s*[-–]\s*10\b(?![^.]{0,12}(ani|years|Jahre))/, // the old generic range
      // "max 6" stated for both formats at once: in-person groups take 8 now.
      /max\.?\s*6\s*(cursanți|students|Personen|Teilnehmende)?,?\s*(online sau fizic|online or in person|online oder vor Ort)/i,
    ];
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      if (file.endsWith("groupSize.ts")) continue; // documents the old values
      const src = readFileSync(file, "utf8");
      for (const line of src.split("\n")) {
        if (AGE.test(line)) continue;
        if (CLAIMS.some((re) => re.test(line))) {
          offenders.push(`${file.replace(SRC, "src")}: ${line.trim().slice(0, 90)}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("never advertises an online group larger than the cap", () => {
    for (const file of sourceFiles(SRC)) {
      const src = readFileSync(file, "utf8");
      const m = src.match(/(\d+)\s*(?:cursanți|students|learners|Personen)\s*online/gi);
      for (const hit of m ?? []) {
        const n = Number(hit.match(/\d+/)![0]);
        expect(n, `${file}: ${hit}`).toBeLessThanOrEqual(MAX_GROUP_SIZE.online);
      }
    }
  });
});
