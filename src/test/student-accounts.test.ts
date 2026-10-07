import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mergeStates, sameState, summarize } from "@/lib/studentSync";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * Optional student accounts (October 2026, the owner's option B): Yalla
 * progress saved to the account, the same on every device, visible in admin.
 */
describe("merging the device's progress with the account's", () => {
  it("loses nothing from either side", () => {
    const local = { xp: 120, rounds: 4, progress: { a: { last: 200, seen: 3 }, b: { last: 50, seen: 1 } }, daily: { "2026-10-07": 5 } };
    const remote = { xp: 90, rounds: 9, progress: { a: { last: 100, seen: 9 }, c: { last: 300, seen: 2 } }, daily: { "2026-10-07": 8, "2026-10-06": 2 } };
    const m = mergeStates(local, remote);
    expect(m.xp).toBe(120);
    expect(m.rounds).toBe(9);
    expect(Object.keys(m.progress ?? {}).sort()).toEqual(["a", "b", "c"]);
    expect(m.progress?.["a"]?.last).toBe(200); // the more recent answer wins
    expect(m.daily).toEqual({ "2026-10-07": 8, "2026-10-06": 2 });
  });

  it("keeps the more recent level test", () => {
    const m = mergeStates(
      { placementResult: { level: "A2", date: "2026-10-07T10:00:00Z" } },
      { placementResult: { level: "A1", date: "2026-09-01T10:00:00Z" } },
    );
    expect(m.placementResult?.level).toBe("A2");
  });

  it("does not reload the game when nothing changed", () => {
    const s = { xp: 1, progress: { a: { last: 1, seen: 1 } } };
    expect(sameState(s, mergeStates(s, s))).toBe(true);
  });

  it("summarises for the admin list", () => {
    const s = summarize({ xp: 10.4, rounds: 2, progress: { a: { last: Date.UTC(2026, 9, 7), seen: 1 }, b: { seen: 0 } } });
    expect(s).toMatchObject({ xp: 10, rounds: 2, items_seen: 1, last_played_at: "2026-10-07T00:00:00.000Z" });
  });
});

describe("accounts are safe", () => {
  it("a student reads and writes only their own row", () => {
    const mig = read("supabase/migrations/20261008120000_student_progress.sql");
    expect(mig).toContain("enable row level security");
    expect(mig.match(/auth\.uid\(\) = user_id/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("teacher controls in the game need a real admin, not just a session", () => {
    expect(read("src/components/YallaGame.tsx")).toContain('invokeAdmin<{ isAdmin?: boolean }>({ action: "whoami" })');
    expect(read("supabase/functions/admin-registrations/index.ts")).toContain('if (action === "whoami")');
  });

  it("the login box is on the game, the level test and the score page", () => {
    for (const f of ["src/pages/Joaca.tsx", "src/pages/TestDeNivel.tsx", "src/pages/JocScor.tsx"]) {
      expect(read(f), f).toContain("<StudentAccountBox");
    }
  });
});
