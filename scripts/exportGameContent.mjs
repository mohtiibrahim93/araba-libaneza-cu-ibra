/**
 * Dumps every Yalla card to CSV so the content can be proofread outside the game.
 *
 * The game is a standalone app under public/yalla/: content.js holds the cards,
 * romanian.js overlays Romanian meanings onto the 722 that were authored in
 * English (keeping the English in `sourceGloss`). Loading both in order is the
 * only way to see what a player actually reads.
 *
 * Usage: node scripts/exportGameContent.mjs > yalla-content.csv
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

globalThis.window = globalThis;
globalThis.root = globalThis;
require("../public/yalla/content.js");
require("../public/yalla/romanian.js");

const { cards, sources } = globalThis.YALLA;
const titleOf = new Map(sources.map((s) => [s.id, s.title]));

const cell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = [["sursa", "lectie", "unitate", "arabizi", "sens_ro", "gloss_en", "are_engleza", "id"]];
for (const c of cards) {
  rows.push([
    c.source,
    titleOf.get(c.source) ?? "",
    c.unit ?? "",
    c.ar,
    c.ro,
    c.sourceGloss ?? "",
    c.sourceGloss ? "da" : "NU",
    c.id,
  ]);
}
process.stdout.write("﻿" + rows.map((r) => r.map(cell).join(",")).join("\n") + "\n");
