/**
 * Tells Bing, Yandex and Seznam which pages changed, via IndexNow.
 *
 * Google does not use IndexNow, so this does nothing for Google rankings — the
 * sitemap and Search Console remain the channel there. What it does buy is
 * same-day recrawling on the engines that do support it, instead of waiting for
 * them to come round on their own schedule.
 *
 * Only changed pages are submitted. IndexNow asks that you send URLs when they
 * actually change, and submitting the whole site on every build is the quickest
 * way to have the submissions ignored. The generated sitemap carries a real
 * <lastmod> per URL (from git), so the comparison is against the previous run's
 * record in scripts/.indexnow-state.json.
 *
 *   npx vite-node scripts/submitIndexNow.ts            # changed URLs only
 *   npx vite-node scripts/submitIndexNow.ts --all      # every indexable URL
 *   npx vite-node scripts/submitIndexNow.ts --dry-run  # print, send nothing
 *
 * The key is public by design: IndexNow verifies ownership by fetching
 * https://<host>/<key>.txt and checking it contains the key. That file lives in
 * public/ and must keep matching KEY below.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const HOST = "centruldearabalibaneza.com";
const KEY = "4ce740356d5ab7d75677bda846853184";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const STATE = resolve(root, "scripts/.indexnow-state.json");
/** IndexNow caps a single submission at 10,000 URLs. */
const MAX_URLS = 10000;

const args = process.argv.slice(2);
const submitAll = args.includes("--all");
const dryRun = args.includes("--dry-run");

/** Sitemap entries as { url, lastmod }, preferring the built file. */
function sitemapEntries(): Map<string, string> {
  const candidates = [resolve(root, "dist/sitemap.xml"), resolve(root, "public/sitemap.xml")];
  const file = candidates.find((c) => existsSync(c));
  if (!file) throw new Error("no sitemap.xml found — run the build first");
  const xml = readFileSync(file, "utf8");
  const entries = new Map<string, string>();
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    entries.set(loc, block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? "");
  }
  if (entries.size === 0) throw new Error(`no <loc> entries in ${file}`);
  console.log(`[indexnow] read ${entries.size} URLs from ${file.replace(root + "/", "")}`);
  return entries;
}

function previous(): Record<string, string> {
  if (!existsSync(STATE)) return {};
  try {
    return JSON.parse(readFileSync(STATE, "utf8")) as Record<string, string>;
  } catch {
    console.warn("[indexnow] state file unreadable — treating every URL as new");
    return {};
  }
}

const entries = sitemapEntries();
const seen = previous();

const changed = submitAll
  ? [...entries.keys()]
  : [...entries].filter(([url, lastmod]) => seen[url] !== lastmod).map(([url]) => url);

if (changed.length === 0) {
  console.log("[indexnow] nothing changed since the last submission");
  process.exit(0);
}
if (changed.length > MAX_URLS) {
  console.warn(`[indexnow] ${changed.length} URLs exceeds the ${MAX_URLS} cap — sending the first ${MAX_URLS}`);
}
const urlList = changed.slice(0, MAX_URLS);

console.log(`[indexnow] ${submitAll ? "submitting all" : "changed since last run"}: ${urlList.length} URL(s)`);
for (const u of urlList.slice(0, 10)) console.log("   ", u);
if (urlList.length > 10) console.log(`    … and ${urlList.length - 10} more`);

if (dryRun) {
  console.log("[indexnow] --dry-run: nothing sent, state not updated");
  process.exit(0);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList,
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// 200 accepted, 202 accepted but key still being validated. Anything else means
// the submission did not land, so the state must not record these as sent —
// otherwise the next run would skip them and they would never be resubmitted.
if (res.status !== 200 && res.status !== 202) {
  const text = await res.text().catch(() => "");
  console.error(`[indexnow] submission failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
  process.exit(1);
}

const record = { ...seen };
for (const url of urlList) record[url] = entries.get(url) ?? "";
writeFileSync(STATE, JSON.stringify(record, null, 2) + "\n");

console.log(
  `[indexnow] ${res.status} ${res.statusText} — ${urlList.length} URL(s) accepted; state written to ${STATE.replace(root + "/", "")}`,
);
