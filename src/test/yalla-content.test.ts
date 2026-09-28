import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The game's card bank is generated, so these are the invariants the generator
 * must hold — not a copy of its output.
 *
 * public/yalla/content.js is built by scripts/buildYallaContent.mjs from
 * content/yalla-cards.csv (the owner's reviewed bank) and
 * content/yalla-source-bank.js (the pre-restructure bank, kept as input so the
 * build never reads what it last wrote). The CSV replaced the old `source`
 * grouping — which described where material came from, not what it teaches —
 * with a level and a curriculum topic per card.
 */
type Card = { id: string; ar: string; ro: string; en?: string; level?: string; topic?: string; unit: string };
type Unit = { id: string; title: string; empty?: boolean };
let Y: { cards: Card[]; units: Unit[]; topics: { id: string; level: string; title: string }[]; levels: { id: string }[] };

beforeAll(() => {
  const src = readFileSync(resolve(process.cwd(), "public/yalla/content.js"), "utf8");
  const win = {} as Record<string, unknown>;
  new Function("window", src)(win);
  Y = win["YALLA"] as typeof Y;
});

describe("the generated card bank", () => {
  it("carries every card's level and topic", () => {
    const untagged = Y.cards.filter((c) => !c.level || !c.topic);
    expect(untagged.map((c) => c.id)).toEqual([]);
  });

  it("carries both meanings on every card", () => {
    // The deck switches language by overlaying `en` onto `ro`, so a card with
    // no English would silently show Romanian to an English reader.
    const missing = Y.cards.filter((c) => !c.ro?.trim() || !c.en?.trim());
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it("holds only the levels whose material is ready", () => {
    // C1 and C2 are not written yet. When they are, this list grows — and the
    // placement test and the level copy have to grow with it.
    expect(Y.levels.map((l) => l.id)).toEqual(["A1", "A2", "B1"]);
  });

  it("points every card at a topic that exists", () => {
    const known = new Set(Y.topics.map((t) => t.id));
    const orphans = Y.cards.filter((c) => !known.has(c.topic!));
    expect(orphans.map((c) => `${c.id} -> ${c.topic}`)).toEqual([]);
  });

  it("flags every lesson that has lost all its cards", () => {
    // 16 source units were emptied when the owner removed duplicate cards. They
    // cannot simply be deleted: curriculum.js maps every source unit into its
    // teaching sequence and throws on one it cannot find, which blanks the whole
    // game. So they are flagged, and app.js filters them out of the mission list
    // and the passport instead.
    const perUnit = new Map<string, number>();
    for (const c of Y.cards) perUnit.set(c.unit, (perUnit.get(c.unit) ?? 0) + 1);
    const empty = Y.units.filter((u) => !perUnit.get(u.id));
    expect(empty.length).toBeGreaterThan(0);
    expect(empty.every((u) => u.empty === true)).toBe(true);
    expect(Y.units.filter((u) => u.empty && perUnit.get(u.id)).map((u) => u.title)).toEqual([]);
  });

  it("keeps empty lessons out of what the game offers", () => {
    const app = readFileSync(resolve(process.cwd(), "public/yalla/app.js"), "utf8");
    expect(app).toContain("u.group===group&&unitItems(u.id).length>0");
  });

  it("keeps the two cards the owner dropped by accident", () => {
    const thirsty = Y.cards.filter((c) => c.ar === "3atshan" || c.ar === "3atshane");
    expect(thirsty).toHaveLength(2);
    expect(thirsty.every((c) => c.level === "A1")).toBe(true);
  });

  it("gives every card a distinct id", () => {
    const ids = Y.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("lists every row of the reviewed CSV", () => {
    const csv = readFileSync(resolve(process.cwd(), "content/yalla-cards.csv"), "utf8");
    const rows = csv.trim().split("\n").slice(1);
    const inBank = new Set(Y.cards.map((c) => c.id));
    const lost = rows.map((l) => l.trim().split(",").pop()!.trim()).filter((id) => id && !inBank.has(id));
    expect(lost).toEqual([]);
  });
});
