/**
 * Regenerates public/arabizi-cheat-sheet.pdf.
 *
 * The old PDF was hand-made, so when the site's arabizi table changed the PDF
 * did not: it kept teaching 6 (ط) and 9 (ٯ) months after both were removed from
 * every page. It is the file people receive by email, so it was the one place
 * still contradicting the site.
 *
 * It now reads the same array the site renders, src/data/arabizi.ts, so the
 * PDF cannot say something the pages do not.
 * Run: npx vite-node scripts/buildCheatSheet.ts
 *
 * Layout, colours and section order follow the original: A4, brand red, Lora
 * for display type, the same three numbered sections and the same closing page.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ARABIZI_DIGITS } from "../src/data/arabizi";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const font = (p) => readFileSync(resolve(root, "node_modules/@fontsource", p)).toString("base64");

const LORA_400 = font("lora/files/lora-latin-400-normal.woff2");
const LORA_700 = font("lora/files/lora-latin-700-normal.woff2");
const NASKH_600 = font("noto-naskh-arabic/files/noto-naskh-arabic-arabic-600-normal.woff2");

const PHRASES = [
  ["Mar7aba", "Salut"],
  ["Kifak? / Kifik?", "Ce faci? (m / f)"],
  ["Mnih, w inta?", "Bine, și tu?"],
  ["Shu fi ma fi?", "Ce se aude? / Ce e nou?"],
  ["Shukran", "Mulțumesc"],
  ["3afwan", "Cu plăcere / Scuze"],
  ["Yalla", "Hai! / Să mergem"],
  ["5alas", "Destul / S-a terminat"],
  ["Ya3ni", "Adică"],
  ["3anjad?", "Serios?"],
  ["7abibi / 7abibti", "Dragul meu / draga mea"],
  ["Ktir", "Foarte / mult"],
  ["Ma3lesh", "Nu-i nimic"],
  ["Sa7tein", "Poftă bună"],
  ["Tislam / Yislamo", "Mersi, ești super"],
  ["Walaw!", "Zău, nu era nevoie!"],
  ["Inshallah", "Dacă vrea Dumnezeu"],
  ["Mashallah", "Ce frumos! (admirație)"],
  ["Bkir / Ba3dein", "Devreme / Mai târziu"],
  ["Yalla bye", "Hai, pa (foarte libanez)"],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: Lora; src: url(data:font/woff2;base64,${LORA_400}) format("woff2"); font-weight: 400 }
  @font-face { font-family: Lora; src: url(data:font/woff2;base64,${LORA_700}) format("woff2"); font-weight: 700 }
  @font-face { font-family: Naskh; src: url(data:font/woff2;base64,${NASKH_600}) format("woff2"); font-weight: 600 }

  :root {
    --fg: hsl(220 14% 10%);
    --muted: hsl(220 10% 36%);
    --line: hsl(220 13% 91%);
    --soft: hsl(220 14% 96%);
    --red: hsl(0 72% 51%);
  }
  @page { size: A4; margin: 14mm 13mm }
  * { box-sizing: border-box }
  body { margin: 0; font-family: "Liberation Sans", "DejaVu Sans", sans-serif;
         color: var(--fg); font-size: 9.6pt; line-height: 1.45 }
  h1 { font-family: Lora, serif; font-size: 24pt; margin: 0 0 4pt; letter-spacing: -0.01em }
  h2 { font-family: Lora, serif; font-size: 12.5pt; margin: 16pt 0 7pt; color: var(--red) }
  .sub { color: var(--muted); margin: 0 0 3pt; max-width: 150mm }
  .site { color: var(--red); font-weight: 700; font-size: 8.6pt; letter-spacing: .02em }
  .rule { height: 2.4pt; background: var(--red); border-radius: 2pt; margin: 9pt 0 0; width: 46mm }

  table { width: 100%; border-collapse: collapse }
  th { text-align: left; font-size: 7.2pt; letter-spacing: .08em; text-transform: uppercase;
       color: var(--muted); font-weight: 700; padding: 0 6pt 4pt 0; border-bottom: 1px solid var(--line) }
  td { padding: 5.2pt 6pt 5.2pt 0; border-bottom: 1px solid var(--line); vertical-align: middle }
  .digit { font-weight: 700; color: var(--red); font-size: 13pt; width: 13mm }
  /* Not rtl: with two letters and a slash, bidi reordering would flip
     "ء / ق" into "ق / ء" and disagree with the table on /arabizi. */
  .letter { font-family: Naskh, serif; font-size: 13pt; width: 18mm; unicode-bidi: isolate }
  .ex { color: var(--muted); white-space: nowrap }

  .gold { margin-top: 8pt; background: var(--soft); border-left: 2.4pt solid var(--red);
          padding: 6pt 9pt; border-radius: 0 4pt 4pt 0 }
  .gold b { color: var(--red) }

  .phrases { column-count: 2; column-gap: 9mm; margin-top: 2pt }
  .phrase { break-inside: avoid; display: flex; justify-content: space-between; gap: 4mm;
            padding: 3.1pt 0; border-bottom: 1px solid var(--line) }
  .phrase b { font-weight: 700 }
  .phrase span { color: var(--muted); text-align: right }

  .msg { background: var(--soft); border-radius: 5pt; padding: 8pt 10pt; margin-top: 2pt }
  .msg .quote { font-family: Lora, serif; font-size: 11pt; color: var(--red) }
  .decode { margin: 6pt 0 0; padding: 0; list-style: none }
  .decode li { padding: 2.4pt 0; border-bottom: 1px dashed var(--line) }
  .decode li:last-child { border-bottom: 0 }
  .ar { font-family: Naskh, serif; font-size: 11pt }
  .trans { margin-top: 7pt; font-style: italic }

  .page2 { break-before: page; padding-top: 34mm; text-align: center }
  .cta { font-family: Lora, serif; font-size: 15pt; max-width: 145mm; margin: 0 auto 10pt }
  .links { color: var(--muted) }
  .links b { color: var(--red) }
  .foot { margin-top: 22mm; color: var(--muted); font-size: 8.4pt;
          border-top: 1px solid var(--line); padding-top: 7pt }
</style>

<h1>Cheat-sheet Arabizi</h1>
<p class="sub">Araba libaneză scrisă cu litere latine și cifre — tot ce ai nevoie ca să citești un mesaj în arabizi.</p>
<div class="site">centruldearabalibaneza.com</div>
<div class="rule"></div>

<h2>1. Cifrele = litere arabe</h2>
<table>
  <tr><th>Cifră</th><th>Literă</th><th>Sunet</th><th>Exemplu</th></tr>
  ${ARABIZI_DIGITS.map((d) => `<tr>
    <td class="digit">${d.digit}</td><td class="letter">${d.letter}</td>
    <td>${esc(d.sound.ro)}</td><td class="ex">${esc(d.examples.ro)}</td></tr>`).join("")}
</table>
<div class="gold"><b>Regula de aur:</b> cifra seamănă la formă cu litera arabă. Restul se citește exact ca în română.</div>

<h2>2. 20 de expresii esențiale în arabizi</h2>
<div class="phrases">
  ${PHRASES.map(([a, r]) => `<div class="phrase"><b>${esc(a)}</b><span>${esc(r)}</span></div>`).join("")}
</div>

<h2>3. Cum decodezi un mesaj real</h2>
<div class="msg">
  <div class="quote">„mar7aba 7abibi, kifak? 3anjad ktir mnih, yalla ba3dein”</div>
  <ul class="decode">
    <li><b>mar7aba</b> → marhaba (<span class="ar">ح</span>) = salut</li>
    <li><b>7abibi</b> → habibi = dragul meu</li>
    <li><b>3anjad</b> → ʿanjad (<span class="ar">ع</span>) = serios / pe bune</li>
  </ul>
  <div class="trans">Traducere: „Salut dragul meu, ce faci? Pe bune, foarte bine, hai pe mai târziu.”</div>
</div>

<div class="page2">
  <div class="cta">Pasul următor: vorbește 30 de minute cu un profesor nativ, gratuit și fără obligații.</div>
  <p class="links">Rezervă proba: <b>centruldearabalibaneza.com/trial</b></p>
  <p class="links">Ghidul complet Arabizi: <b>centruldearabalibaneza.com/arabizi</b></p>
  <div class="foot">Centrul de Arabă Libaneză cu Ibra — București (Str. Icoanei 80) și online.</div>
</div>`;


/**
 * Finds a usable Chromium, or nothing.
 *
 * Playwright's own executablePath() points at the build it expects, which is
 * not always the build that is installed — here it names chromium-1234 while
 * chromium-1194 is what exists on disk. So check candidates rather than trust
 * one answer, and treat "absent" as a normal outcome: this script runs inside
 * `npm run build`, and a missing browser must not stop the site deploying over
 * a lead-magnet PDF. The test in src/test/arabizi-consistency.test.ts catches
 * the PDF being stale either way.
 */
let chromium: typeof import("playwright").chromium | null = null;
try {
  // playwright is a dev-only dependency and is absent in the production build
  // image. A missing browser must never fail `npm run build`.
  ({ chromium } = await import("playwright"));
} catch {
  chromium = null;
}

function findChromium(): string | null {
  const candidates: string[] = [];
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
    candidates.push(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE);
  }
  try {
    if (chromium) candidates.push(chromium.executablePath());
  } catch {
    // Playwright can throw when no browser is registered at all.
  }
  const browsersRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try {
    for (const dir of readdirSync(browsersRoot)) {
      if (!dir.startsWith("chromium")) continue;
      for (const sub of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
        candidates.push(resolve(browsersRoot, dir, sub));
      }
    }
  } catch {
    // No browsers directory — fall through to whatever else is in the list.
  }
  return candidates.find((c) => c && existsSync(c)) ?? null;
}

/**
 * Fingerprint of the content this PDF is built from.
 *
 * Computed before anything is generated, because it decides whether anything
 * needs to be. A test compares it with a hash recomputed from the current data,
 * so editing the table without rerunning this script fails the build instead of
 * silently shipping a PDF that contradicts the site — which is exactly how 6 and
 * 9 survived in it.
 */
const contentHash = createHash("sha256")
  .update(JSON.stringify({ ARABIZI_DIGITS, PHRASES }))
  .digest("hex");

const hashFile = resolve(root, "public/arabizi-cheat-sheet.hash");
const pdfFile = resolve(root, "public/arabizi-cheat-sheet.pdf");

// Nothing to do when the source data is unchanged. Chromium stamps a
// CreationDate into every PDF it renders, so regenerating unconditionally
// rewrote the file on every single build — six bytes different, same content —
// which left the working tree permanently dirty and buried real changes in
// binary churn. Skipping also saves launching a browser.
if (
  existsSync(pdfFile) &&
  existsSync(hashFile) &&
  readFileSync(hashFile, "utf8").trim() === contentHash
) {
  console.log("[cheat-sheet] arabizi data unchanged — keeping the committed PDF");
  process.exit(0);
}

const executablePath = chromium ? findChromium() : null;
if (!executablePath) {
  console.warn(
    "[cheat-sheet] no Chromium found — skipping PDF regeneration. " +
      "The committed PDF is used as-is; the test suite still fails if it is out of date.",
  );
  process.exit(0);
}

const out = pdfFile;
const browser = await chromium!.launch({ executablePath });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true });
await browser.close();

/**
 * Replace Chromium's build-time timestamps with a fixed one.
 *
 * Two regenerations of identical data should produce an identical file. The
 * replacement is byte-for-byte the same length as what it overwrites, which
 * matters: a PDF's xref table addresses objects by absolute byte offset, so
 * shifting anything by even one byte corrupts the file.
 */
const FIXED_PDF_DATE = "D:20260101000000+00'00'";
const raw = readFileSync(out);
let stamped = raw.toString("latin1");
stamped = stamped.replace(/D:\d{14}\+00'00'/g, (match) =>
  match.length === FIXED_PDF_DATE.length ? FIXED_PDF_DATE : match,
);
const normalised = Buffer.from(stamped, "latin1");
if (normalised.length !== raw.length) {
  throw new Error(
    `[cheat-sheet] date normalisation changed the file length (${raw.length} → ${normalised.length}); ` +
      "that would corrupt the PDF xref table, so the original has been kept.",
  );
}
writeFileSync(out, normalised);

const bytes = normalised.length;
writeFileSync(resolve(root, "scripts/.cheat-sheet-preview.html"), html);
writeFileSync(hashFile, contentHash + "\n");
console.log(`[cheat-sheet] wrote ${out} (${(bytes / 1024).toFixed(0)} KB), ${ARABIZI_DIGITS.length} digits, ${PHRASES.length} phrases`);
