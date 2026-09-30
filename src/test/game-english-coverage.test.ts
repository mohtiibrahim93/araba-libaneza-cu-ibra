import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createContext, runInContext } from "node:vm";

/**
 * Everything the game shows an English reader must be in English.
 *
 * Coverage used to be checked by hand in a browser, and that is exactly how it
 * went wrong twice: the deck was verified while the language was right but the
 * measurement was too narrow, so 432 conversation cards, 711 drill strings, the
 * drills' own answer buttons, the lesson notes, the unit and topic titles all
 * shipped in Romanian to someone reading the site in English.
 *
 * The game's scripts need almost no DOM, so the whole content pipeline runs
 * here — the bank, the curriculum, the browser-side synthesis, then the English
 * overlay — and the result is asserted directly. That is the same object graph
 * app.js renders from, so a string this does not find is a string no reader
 * sees.
 *
 * Deliberately not covered: interface strings inside app.js and friends (those
 * are T() call sites, guarded in game-i18n.test.ts), and the teacher workshop's
 * "the source text" panel, which shows the Romanian source on purpose.
 */
const SCRIPTS = ["i18n.js", "content.js", "curriculum.js", "synthesis.js", "content-en.js", "deck-language.js"];

type Card = { ro?: string; roOriginal?: string; en?: string };
type Drill = { prompt?: string; note?: string; context?: string; answer?: string; wrong?: string[] };
type Lesson = { title?: string; speaking?: string; points?: string[] };
type Unit = { title?: string; desc?: string; tips?: string[]; learningNotes?: Lesson[] };
type Bank = {
  cards: Card[];
  drills: Drill[];
  units: Unit[];
  topics?: { title?: string }[];
  sources?: { title?: string; detail?: string }[];
};

/** Load the game's content pipeline the way the browser does, for one language. */
const load = (lang: "ro" | "en"): Bank => {
  const win: Record<string, unknown> = { location: { search: `?lang=${lang}` }, addEventListener: () => {} };
  win["window"] = win;
  const ctx = createContext({ window: win, document: { documentElement: {}, addEventListener: () => {} }, URLSearchParams, console });
  for (const f of SCRIPTS) {
    runInContext(readFileSync(resolve(process.cwd(), "public/yalla", f), "utf8"), ctx, { filename: f });
  }
  return win["YALLA"] as Bank;
};

const romanian = (s: unknown) => /[ăâîșțĂÂÎȘȚ]/.test(String(s ?? ""));

describe("the game's content in English", () => {
  const en = load("en");

  it("loads the whole bank", () => {
    expect(en.cards.length).toBeGreaterThan(3000);
    expect(en.drills.length).toBeGreaterThan(500);
    expect(en.units.length).toBeGreaterThan(20);
  });

  it("shows no Romanian card meaning", () => {
    // `roOriginal` marks a card the overlay converted, so its `ro` holding a
    // Romanian word now means the English text quotes one — "What does masă
    // mean in Lebanese?" is a card about the Romanian word.
    const left = en.cards.filter((c) => romanian(c.ro) && !c.roOriginal).map((c) => c.ro);
    expect(left, `Romanian card meanings: ${left.slice(0, 5).join(" | ")}`).toEqual([]);
  });

  it("shows no Romanian in a drill, including its options", () => {
    const left: string[] = [];
    for (const d of en.drills) {
      for (const k of ["prompt", "note", "context", "answer"] as const) if (romanian(d[k])) left.push(`${k}: ${d[k]}`);
      for (const w of d.wrong ?? []) if (romanian(w)) left.push(`wrong: ${w}`);
    }
    expect(left, left.slice(0, 5).join(" | ")).toEqual([]);
  });

  it("shows no Romanian in a lesson's title, tips or learning notes", () => {
    const left: string[] = [];
    for (const u of en.units) {
      if (romanian(u.title)) left.push(`unit: ${u.title}`);
      if (romanian(u.desc)) left.push(`desc: ${u.desc}`);
      for (const t of u.tips ?? []) if (romanian(t)) left.push(`tip: ${t}`);
      for (const l of u.learningNotes ?? []) {
        if (romanian(l.title)) left.push(`note: ${l.title}`);
        if (romanian(l.speaking)) left.push(`speaking: ${l.speaking}`);
        for (const p of l.points ?? []) if (romanian(p)) left.push(`point: ${p}`);
      }
    }
    expect(left, left.slice(0, 5).join(" | ")).toEqual([]);
  });

  it("shows no Romanian topic or source", () => {
    const left = [
      ...(en.topics ?? []).filter((t) => romanian(t.title)).map((t) => `topic: ${t.title}`),
      ...(en.sources ?? []).flatMap((s) => [
        ...(romanian(s.title) ? [`source: ${s.title}`] : []),
        ...(romanian(s.detail) ? [`detail: ${s.detail}`] : []),
      ]),
    ];
    expect(left, left.slice(0, 5).join(" | ")).toEqual([]);
  });

  it("leaves no drill still carrying the Romanian template", () => {
    // The diacritic test is not enough on its own: 107 of these phrases are
    // written without diacritics ("ce mai faci?", "am mers la mare") and slipped
    // through a first pass that only looked for ăâîșț. The template is the
    // reliable tell — an untranslated reply drill still says "Alege replica
    // pentru", whatever the phrase inside it looks like.
    const left = en.drills.filter((d) => /^Alege replica pentru:/.test(d.prompt ?? "")).map((d) => d.prompt);
    expect(left, `${left.length} drills: ${left.slice(0, 3).join(" | ")}`).toEqual([]);
  });

  it("never turns a distractor into the right answer", () => {
    // The options are graded by comparing the clicked string to `answer`, so
    // two options translating to the same English string would mark a wrong
    // choice right.
    const clashes = en.drills
      .filter((d) => (d.wrong ?? []).some((w) => w === d.answer))
      .map((d) => `${d.prompt} -> ${d.answer}`);
    expect(clashes, clashes.slice(0, 3).join(" | ")).toEqual([]);
  });
});

describe("every topic and lesson name is translated", () => {
  // Not a language test but an identity one: the owner's topic names come from
  // their own CSV and several have no diacritics ("Posesivele", "Ora", "La
  // restaurant"), so a diacritic check declared them English. A name that reads
  // the same in both languages has to be one of the two that genuinely are.
  const ro = load("ro");
  const en = load("en");
  const SAME = new Set(["Transport", "Comparative & superlative"]);

  it("gives every topic a different name in English", () => {
    const untouched = ro.topics!.map((t, i) => [t.title, en.topics![i]?.title] as const)
      .filter(([a, b]) => b != null && a === b && !SAME.has(a ?? ""))
      .map(([a]) => a);
    expect(untouched, untouched.join(" | ")).toEqual([]);
  });

  it("gives every lesson a different title and description in English", () => {
    const untouched = ro.units
      .map((u, i) => [u, en.units[i]] as const)
      .filter(([a, b]) => b != null && (a.title === b.title || a.desc === b.desc))
      .map(([a]) => a.title);
    expect(untouched, untouched.join(" | ")).toEqual([]);
  });
});

describe("the game's content in Romanian", () => {
  const ro = load("ro");

  it("is left exactly as the owner wrote it", () => {
    // The overlay must be inert in Romanian: it only runs for lang === 'en'.
    expect(ro.cards.some((c) => c.roOriginal)).toBe(false);
    expect(ro.cards.filter((c) => romanian(c.ro)).length).toBeGreaterThan(1000);
    expect(ro.drills.filter((d) => romanian(d.prompt)).length).toBeGreaterThan(100);
  });
});
