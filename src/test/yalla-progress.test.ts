import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseYallaState,
  readYallaProgress,
  summarizeYalla,
  suggestLevel,
  YALLA_STORAGE_KEY,
  type YallaSavedState,
  type YallaSummary,
} from "@/lib/yallaProgress";
import { CARD_GROUP, GROUP_TOTALS } from "@/data/yallaLevelMap";
import { seoHead } from "@/lib/seoHead";
import { buildSitemap } from "@/lib/sitemap";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/** A cardId known to belong to group A1 in the generated map. */
const A1_CARD = Object.entries(CARD_GROUP).find(([, g]) => g === "A1")![0];
const A2_CARD = Object.entries(CARD_GROUP).find(([, g]) => g === "A2")![0];

const stateWith = (
  progress: YallaSavedState["progress"],
  extra: Partial<YallaSavedState> = {},
): YallaSavedState => ({ xp: 0, rounds: 0, progress, ...extra });

const summaryOf = (state: YallaSavedState): YallaSummary => summarizeYalla(state);

describe("yallaLevelMap data", () => {
  it("covers the real card bank and both taught levels", () => {
    expect(Object.keys(CARD_GROUP).length).toBeGreaterThan(2000);
    expect(GROUP_TOTALS.A1).toBeGreaterThan(1000);
    expect(GROUP_TOTALS.A2).toBeGreaterThan(100);
  });
});

describe("parseYallaState", () => {
  it("returns null for missing, corrupt or foreign data", () => {
    expect(parseYallaState(null)).toBeNull();
    expect(parseYallaState("not json")).toBeNull();
    expect(parseYallaState('{"xp":"abc"}')).toBeNull();
    expect(parseYallaState('{"xp":5}')).toBeNull();
  });

  it("accepts the shape the game saves", () => {
    const raw = JSON.stringify({ xp: 25, rounds: 2, progress: { [A1_CARD]: { streak: 4, seen: true } } });
    expect(parseYallaState(raw)?.xp).toBe(25);
  });
});

describe("readYallaProgress", () => {
  it("reads the game's storage key", () => {
    const raw = JSON.stringify({ xp: 10, rounds: 1, progress: {} });
    const storage = { getItem: (k: string) => (k === YALLA_STORAGE_KEY ? raw : null) };
    expect(readYallaProgress(storage)?.xp).toBe(10);
    expect(readYallaProgress({ getItem: () => null })).toBeNull();
  });
});

describe("summarizeYalla", () => {
  it("counts retained (streak >= 3) and practised cards like the game does", () => {
    const s = summaryOf(
      stateWith({
        [A1_CARD]: { streak: 3, seen: true },
        [A2_CARD]: { streak: 1, seen: true },
        "unknown-card": { streak: 9, seen: true },
      }, { xp: 450, rounds: 7 }),
    );
    expect(s.rang).toBe(3); // floor(450/200)+1, same as the game's sidebar
    expect(s.rounds).toBe(7);
    expect(s.practiced).toBe(3);
    expect(s.mastered).toBe(2); // A1 card + the unmapped one, like the game counts
    expect(s.masteredByGroup.A1).toBe(1);
    expect(s.masteredByGroup.A2).toBe(0);
  });

  it("passes through a placement result only when the level is valid", () => {
    const withResult = summaryOf(stateWith({}, { placementResult: { level: "A2", title: "t" } }));
    expect(withResult.placementLevel).toBe("A2");
    const bogus = summaryOf(stateWith({}, { placementResult: { level: "C2" } }));
    expect(bogus.placementLevel).toBeNull();
  });
});

describe("suggestLevel", () => {
  const base: YallaSummary = {
    xp: 0,
    rang: 1,
    rounds: 0,
    practiced: 0,
    mastered: 0,
    masteredByGroup: { A1: 0, A2: 0, Vocabular: 0 },
    placementLevel: null,
    placementTitle: null,
  };

  it("trusts the in-game placement result over practice", () => {
    const s = suggestLevel({ ...base, placementLevel: "A2", placementTitle: "Discuție de plasare pentru A2" });
    expect(s.source).toBe("placement");
    expect(s.level).toBe("A2");
    expect(s.detail).toContain("A2");
  });

  it("suggests A1 at the start of the journey", () => {
    const s = suggestLevel({ ...base, masteredByGroup: { A1: 10, A2: 0, Vocabular: 0 } });
    expect(s).toMatchObject({ level: "A1", source: "practice" });
  });

  it("suggests A2 once half of the A1 bank is retained", () => {
    const s = suggestLevel({
      ...base,
      masteredByGroup: { A1: Math.ceil(GROUP_TOTALS.A1 * 0.55), A2: 0, Vocabular: 0 },
    });
    expect(s.level).toBe("A2");
  });

  it("suggests B1 only when A1 and A2 are both well retained", () => {
    const s = suggestLevel({
      ...base,
      masteredByGroup: {
        A1: Math.ceil(GROUP_TOTALS.A1 * 0.75),
        A2: Math.ceil(GROUP_TOTALS.A2 * 0.6),
        Vocabular: 0,
      },
    });
    expect(s.level).toBe("B1");
    expect(s.detail).toContain("discuție de plasare");
  });

  it("stays at A1 between the early threshold and half the bank", () => {
    const s = suggestLevel({ ...base, masteredByGroup: { A1: 100, A2: 0, Vocabular: 0 } });
    expect(s.level).toBe("A1");
  });
});

describe("/joc/scor route", () => {
  it("has its own server-rendered head with a self-canonical", () => {
    const head = seoHead("/joc/scor");
    const title = head.meta.find((m) => "title" in m) as { title: string };
    expect(title.title.length).toBeLessThanOrEqual(60);
    expect(head.meta).toContainEqual(expect.objectContaining({ name: "description" }));
    expect(head.links).toContainEqual(
      expect.objectContaining({ rel: "canonical", href: "https://centruldearabalibaneza.com/joc/scor" }),
    );
  });

  it("is in the generated sitemap", () => {
    expect(buildSitemap()).toContain("<loc>https://centruldearabalibaneza.com/joc/scor</loc>");
  });

  it("is linked from the game page and from the level test", () => {
    expect(read("src/pages/Joaca.tsx")).toContain('to="/joc/scor"');
    expect(read("src/pages/TestDeNivel.tsx")).toContain('to="/joc/scor"');
  });
});
