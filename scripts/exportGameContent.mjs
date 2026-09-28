/**
 * Dumps the game's card bank back to CSV, in the same shape as
 * content/yalla-cards.csv — so a round trip is export, edit, rebuild:
 *
 *   node scripts/exportGameContent.mjs > content/yalla-cards.csv
 *   node scripts/buildYallaContent.mjs
 *
 * The columns are the owner's: level and topic in place of where the material
 * came from, and both meanings. Reads content.js alone — the deck overlay is a
 * per-reader view, not part of the bank.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

globalThis.window = globalThis;
globalThis.root = globalThis;
require("../public/yalla/content.js");

const { cards, topics } = globalThis.YALLA;
const titleOf = new Map((topics ?? []).map((t) => [t.id, t.title]));

const cell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = [["nivel", "tema_curriculum", "arabizi", "sens_ro", "gloss_en", "are_engleza", "id"]];
for (const c of cards) {
  rows.push([c.level ?? "", titleOf.get(c.topic) ?? c.topic ?? "", c.ar, c.ro, c.en ?? "", c.en ? "da" : "NU", c.id]);
}
process.stdout.write("﻿" + rows.map((r) => r.map(cell).join(",")).join("\n") + "\n");
