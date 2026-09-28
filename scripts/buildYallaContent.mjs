/**
 * Rebuilds public/yalla/content.js from content/yalla-cards.csv.
 *
 * The CSV is the owner's reviewed card bank: every row carries the corrected
 * Arabizi, the Romanian meaning, an English meaning, and the two columns that
 * replace where the material came from — `nivel` (A1/A2/B1) and
 * `tema_curriculum`. The old `source` grouping described provenance ("A1 online
 * lecția 1", "tabelul profesorului"), not subject matter, which is why the same
 * idea appeared in three unrelated units.
 *
 * The rebuild is deliberately ADDITIVE to the existing bank:
 *
 * - Cards keep every field they had (unit, source, lang, variants, note, page)
 *   because app.js, academy.js, engine.js, curriculum.js and synthesis.js all
 *   read them — 225 references to sourceGloss in synthesis.js alone. Only `ar`,
 *   `ro` are corrected, and `en`, `level`, `topic` are added.
 * - The 122 old units, 87 drills and 25 notes are carried over untouched. Their
 *   titles, descriptions, icons and 249 teaching tips are keyed to lessons, and
 *   a lesson's cards now scatter across four or more topics, so folding them
 *   into topics would misfile them. Topics are the new primary axis; the old
 *   lessons remain a secondary path.
 * - `sourceGloss` is set here for the cards that were authored in English. That
 *   was romanian.js's job; it also THREW on any Romanian gloss missing from its
 *   table, which every correction in the CSV would have triggered, so it is
 *   retired and this takes over.
 *
 * Cards absent from the CSV are dropped: the owner removed 704, of which 646
 * were exact duplicates and 56 were superseded by a corrected spelling or
 * wording. Two were lost by accident and are restored below.
 *
 * Usage: node scripts/buildYallaContent.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const CSV = "content/yalla-cards.csv";
const OUT = "public/yalla/content.js";
const SOURCE = "content/yalla-source-bank.js";

/** Cards the owner dropped by accident — their siblings are in the same topic. */
const RESTORED = [
  { id: "c3atshan0001", ar: "3atshan", ro: "Însetat (masculin)", en: "Thirsty (masculine)", level: "A1", topic: "Stări & sentimente" },
  { id: "c3atshane0002", ar: "3atshane", ro: "Însetată", en: "Thirsty (feminine)", level: "A1", topic: "Stări & sentimente" },
];

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map((s) => s.trim());
  return rows
    .filter((r) => r.length >= head.length && r[head.indexOf("id")]?.trim())
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const slug = (s) =>
  s.toLowerCase()
    .replace(/ă/g, "a").replace(/â/g, "a").replace(/î/g, "i").replace(/ș/g, "s").replace(/ț/g, "t")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// content/yalla-source-bank.js is the bank as it was before this restructure:
// 3,470 cards, 122 units, and the 722 cards authored in English still holding
// their English gloss in `ro` — which is what sourceGloss must keep for
// synthesis.js. It is the input, never the output, so the build is idempotent
// and does not read what it last wrote.
globalThis.window = globalThis;
globalThis.root = globalThis;
require("../content/yalla-source-bank.js");
const bank = globalThis.YALLA;
const before = new Map(bank.cards.map((c) => [c.id, { ...c }]));

const rows = parseCsv(readFileSync(CSV, "utf8").replace(/^﻿/, ""));
const seen = new Set();
const cards = [];
const unknown = [];

for (const r of rows) {
  const old = before.get(r.id);
  if (!old) { unknown.push(r.id); continue; }
  seen.add(r.id);
  const card = { ...old, ar: r.arabizi, ro: r.sens_ro, en: r.gloss_en, level: r.nivel, topic: slug(r.tema_curriculum) };
  // Cards authored in English keep that original where synthesis.js expects it.
  if (old.lang === "en") card.sourceGloss = old.ro;
  cards.push(card);
}
for (const r of RESTORED) {
  cards.push({ id: r.id, unit: before.get("c814a78015c21")?.unit ?? "l2", source: "restored",
    lang: "ro", ar: r.ar, ro: r.ro, en: r.en, level: r.level, topic: slug(r.topic) });
}

// Topics in the order the CSV presents them, which is the order the owner
// arranged: level first, then theme within the level.
const topics = [];
const topicSeen = new Set();
for (const r of rows) {
  const id = slug(r.tema_curriculum);
  if (topicSeen.has(id)) continue;
  topicSeen.add(id);
  topics.push({ id, level: r.nivel, title: r.tema_curriculum });
}
const levels = [...new Set(rows.map((r) => r.nivel))].map((id) => ({
  id,
  cards: cards.filter((c) => c.level === id).length,
  topics: topics.filter((t) => t.level === id).length,
}));

// A lesson whose cards were all duplicates is now an empty shell: the journey
// would offer "Shopping and Money" and show nothing. They are flagged rather
// than removed — curriculum.js maps every source unit into its teaching
// sequence and THROWS on one it cannot find ("Invalid curriculum mapping"),
// which takes down the whole curriculum module and leaves the game blank. The
// journey filters on this flag instead.
const cardsPerUnit = {};
for (const c of cards) cardsPerUnit[c.unit] = (cardsPerUnit[c.unit] ?? 0) + 1;
const units = bank.units.map((u) => (cardsPerUnit[u.id] ? u : { ...u, empty: true }));
const emptied = units.filter((u) => u.empty);

const out = { ...bank, version: 3, levels, topics, cards, units };
writeFileSync(OUT, "window.YALLA_PACKAGED = true;\nwindow.YALLA = " + JSON.stringify(out) + ";\n");

const dropped = [...before.keys()].filter((id) => !seen.has(id));
console.log(`cards: ${before.size} in the bank -> ${cards.length} written`);
console.log(`  matched from the CSV: ${seen.size} | restored by hand: ${RESTORED.length} | dropped: ${dropped.length}`);
console.log(`levels: ${levels.map((l) => `${l.id} (${l.topics} topics, ${l.cards} cards)`).join(" · ")}`);
console.log(`topics: ${topics.length} | units: ${units.length} (${emptied.length} flagged empty) | drills: ${out.drills.length} | notes: ${out.notes.length}`);
if (emptied.length) console.log("  flagged empty:", emptied.map((u) => u.title).join(", "));
if (unknown.length) console.log(`CSV rows with an id the bank does not have: ${unknown.length}`, unknown.slice(0, 5));
