/**
 * Fold a teacher's browser corrections into the shipped card bank.
 *
 *   npm run corrections -- path/to/corecturi.json          apply
 *   npm run corrections -- path/to/corecturi.json --dry-run report only
 *
 * The problem this solves: corrections made in the game's teacher workspace
 * live in that browser's localStorage under `yalla-teacher-edits-v1`. They
 * override the bundled cards for the teacher and for nobody else. Students
 * keep seeing the original text, and nothing about the site reveals the
 * difference — the edit simply never leaves the machine it was made on.
 *
 * The workspace's export writes them out as {format:"yalla-edits-v1", edits}.
 * This script applies that file to public/yalla/content.js, which is the copy
 * every visitor loads.
 *
 * It refuses to write on any problem rather than writing a partial result.
 * A correction that silently fails to apply is worse than one that loudly
 * does not: the teacher believes the text is fixed, and it is still wrong in
 * front of students. So an unknown card id, an empty field or a malformed
 * variants list aborts the whole run with the offending ids named.
 *
 * What it does not touch: card ids, unit assignment, source metadata, and
 * every card the file does not mention. Ids especially — student progress is
 * keyed on them, so a changed id silently orphans that card's review history.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createContext, runInContext } from "node:vm";

const CONTENT = resolve(process.cwd(), "public/yalla/content.js");
/** package-integration.py prepends this so the game knows it is site-hosted. */
const PACKAGED = "window.YALLA_PACKAGED = true;\n";

interface Edit {
  ar: string;
  ro: string;
  variants: string[];
}
interface Card {
  id: string;
  ar: string;
  ro: string;
  variants?: string[];
  [k: string]: unknown;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const file = args.find((a) => !a.startsWith("--"));

if (!file) {
  console.error(
    "usage: npm run corrections -- <corecturi.json> [--dry-run]\n" +
      "       export the file from the game's teacher workspace first",
  );
  process.exit(1);
}

/** Load content.js the way the browser does, so we read exactly what ships. */
function loadCards(source: string): { data: Record<string, unknown>; cards: Card[] } {
  const ctx: { window: Record<string, unknown> } = { window: {} };
  createContext(ctx);
  runInContext(source, ctx);
  const data = ctx.window.YALLA as Record<string, unknown> | undefined;
  if (!data || !Array.isArray(data.cards)) {
    throw new Error("public/yalla/content.js did not define window.YALLA.cards");
  }
  return { data, cards: data.cards as Card[] };
}

const source = readFileSync(CONTENT, "utf8");
const { data, cards } = loadCards(source);
const byId = new Map(cards.map((c) => [c.id, c]));

const raw = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
if (raw?.format !== "yalla-edits-v1") {
  console.error(
    `[corrections] unexpected format ${JSON.stringify(raw?.format)} — expected "yalla-edits-v1".\n` +
      "              Export from the teacher workspace, not the progress transfer.",
  );
  process.exit(1);
}

const edits = (raw.edits ?? {}) as Record<string, Edit>;
const ids = Object.keys(edits);
if (!ids.length) {
  console.log("[corrections] the file contains no edits — nothing to do");
  process.exit(0);
}

// Validate everything before changing anything.
const problems: string[] = [];
for (const [id, e] of Object.entries(edits)) {
  const card = byId.get(id);
  if (!card) {
    problems.push(`${id}: no such card (a rebuilt bank can change ids — re-export)`);
    continue;
  }
  if (typeof e?.ar !== "string" || !e.ar.trim()) problems.push(`${id}: empty Arabizi`);
  if (typeof e?.ro !== "string" || !e.ro.trim()) problems.push(`${id}: empty meaning`);
  if (e?.variants !== undefined && !Array.isArray(e.variants)) {
    problems.push(`${id}: variants is not a list`);
  } else if (Array.isArray(e.variants) && e.variants.some((v) => typeof v !== "string")) {
    problems.push(`${id}: variants contains a non-string`);
  }
}
if (problems.length) {
  console.error(`[corrections] ${problems.length} problem(s); nothing written:`);
  for (const p of problems) console.error(`    ${p}`);
  process.exit(1);
}

// Report what changes, so a dry run is genuinely reviewable.
let changed = 0;
const lines: string[] = [];
for (const [id, e] of Object.entries(edits)) {
  const card = byId.get(id)!;
  const before = { ar: card.ar, ro: card.ro, variants: [...(card.variants ?? [])] };
  const after = {
    ar: e.ar.trim(),
    ro: e.ro.trim(),
    // The card's own form is never a variant of itself; the game filters this
    // too, and leaving it in would make an answer match on the wrong branch.
    variants: (e.variants ?? []).map((v) => v.trim()).filter((v) => v && v !== e.ar.trim()),
  };
  const diff = (["ar", "ro"] as const).filter((k) => before[k] !== after[k]);
  const variantsDiffer = JSON.stringify(before.variants) !== JSON.stringify(after.variants);
  if (!diff.length && !variantsDiffer) continue;

  changed++;
  lines.push(`  ${id}`);
  for (const k of diff) lines.push(`      ${k}: ${JSON.stringify(before[k])} -> ${JSON.stringify(after[k])}`);
  if (variantsDiffer) {
    lines.push(`      variants: ${JSON.stringify(before.variants)} -> ${JSON.stringify(after.variants)}`);
  }
  Object.assign(card, after);
}

console.log(`[corrections] read ${ids.length} edit(s) from ${file}`);
if (!changed) {
  console.log("[corrections] every edit already matches the shipped text — nothing to write");
  process.exit(0);
}
console.log(`[corrections] ${changed} card(s) would change:`);
for (const l of lines) console.log(l);

if (dryRun) {
  console.log("[corrections] --dry-run: nothing written");
  process.exit(0);
}

// Re-serialise in the shape build-content.py writes, so the file stays
// loadable by the browser and by every verify script.
const out = PACKAGED + "window.YALLA = " + JSON.stringify(data) + ";\n";

// Read it back before trusting it. A corrupted bank breaks the game for
// everyone, and the failure would show up as a blank page, not an error.
const check = loadCards(out);
if (check.cards.length !== cards.length) {
  console.error(
    `[corrections] card count changed ${cards.length} -> ${check.cards.length}; refusing to write`,
  );
  process.exit(1);
}
const idsBefore = cards.map((c) => c.id).join("|");
const idsAfter = check.cards.map((c) => c.id).join("|");
if (idsBefore !== idsAfter) {
  console.error("[corrections] card ids or their order changed; refusing to write");
  process.exit(1);
}

writeFileSync(CONTENT, out);
console.log(
  `[corrections] wrote public/yalla/content.js — ${check.cards.length} cards, ids unchanged.\n` +
    "[corrections] commit and publish for students to see it.",
);
