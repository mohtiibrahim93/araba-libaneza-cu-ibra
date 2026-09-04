/**
 * Regenerates public/arabizi-cheat-sheet.pdf.
 *
 * The old PDF was hand-made, so when the site's arabizi table changed the PDF
 * did not: it kept teaching 6 (ط) and 9 (ٯ) months after both were removed from
 * every page. It is the file people receive by email, so it was the one place
 * still contradicting the site.
 *
 * Generating it from the same table the site renders means that can't recur.
 * Run: node scripts/buildCheatSheet.mjs
 *
 * Layout, colours and section order follow the original: A4, brand red, Lora
 * for display type, the same three numbered sections and the same closing page.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const font = (p) => readFileSync(resolve(root, "node_modules/@fontsource", p)).toString("base64");

const LORA_400 = font("lora/files/lora-latin-400-normal.woff2");
const LORA_700 = font("lora/files/lora-latin-700-normal.woff2");
const NASKH_600 = font("noto-naskh-arabic/files/noto-naskh-arabic-arabic-600-normal.woff2");

/**
 * The digits Lebanese arabizi actually uses. 6 (ط) and 9 (ق) are not part of
 * it — they belong to other transliteration conventions — and this table is
 * the same set shown on /arabizi.
 */
const DIGITS = [
  ["2", "ء / ق", "oprire glotală, ca pauza din „co-operare”", "ta2burni, 2ana"],
  ["3", "ع", "sunet gutural adânc din gât, specific arab", "3afwan, ya3ni"],
  ["5", "خ", "h aspru, ca „ch” în germană „Bach”", "5alas, 5ayye"],
  ["7", "ح", "h puternic din gât, fără echivalent în română", "mar7aba, 7abibi"],
  ["8", "غ", "gh, ca un „r” franțuzesc răgușit", "8ada, 8ali"],
];

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
  ${DIGITS.map(([d, l, s, e]) => `<tr>
    <td class="digit">${d}</td><td class="letter">${l}</td>
    <td>${esc(s)}</td><td class="ex">${esc(e)}</td></tr>`).join("")}
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

const out = resolve(root, "public/arabizi-cheat-sheet.pdf");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true });
await browser.close();

const bytes = readFileSync(out).length;
writeFileSync(resolve(root, "scripts/.cheat-sheet-preview.html"), html);
console.log(`[cheat-sheet] wrote ${out} (${(bytes / 1024).toFixed(0)} KB), ${DIGITS.length} digits, ${PHRASES.length} phrases`);
