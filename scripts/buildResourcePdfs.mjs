/**
 * Regenerates public/100-expresii-libaneze.pdf and
 * public/plan-30-zile-araba-libaneza.pdf.
 *
 * Both used to be hand-made files with no source, so a spelling the teacher
 * corrected (the pronouns enta / ente, for one) could not be fixed in them.
 * The text below is the text of those PDFs; edit it here and re-run.
 * Run: node scripts/buildResourcePdfs.mjs  (needs playwright + a Chromium)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const EXPRESII = [
  ["Salut, prezentare, politețe", [
    ["mar7aba", "bună / salut"],
    ["ahlan w sahlan", "bine ai venit"],
    ["saba7 el kheir", "bună dimineața"],
    ["masa el kheir", "bună seara"],
    ["tousba7 3a kheir", "noapte bună"],
    ["kifak? / kifik?", "ce faci? (m / f)"],
    ["mni7, w enta? / w ente?", "bine, dar tu?"],
    ["shu ismak? / shu ismik?", "cum te cheamă?"],
    ["ismi ...", "mă numesc ..."],
    ["tsharrafna", "încântat de cunoștință"],
    ["min wein enta?", "de unde ești?"],
    ["ana min Romania", "sunt din România"],
    ["min fadlak / min fadlik", "te rog"],
    ["shukran ktir", "mulțumesc mult"],
    ["3afwan", "cu plăcere / scuze"],
    ["yalla bye", "pa, ne vedem"],
  ]],
  ["La restaurant și la cafenea", [
    ["3atini el menu, min fadlak", "îmi dați meniul, vă rog"],
    ["shu btensa7ni?", "ce îmi recomandați?"],
    ["baddi qahwe", "vreau o cafea"],
    ["qahwe bi haleeb", "cafea cu lapte"],
    ["shay bi na3na3", "ceai cu mentă"],
    ["mayy, min fadlak", "apă, vă rog"],
    ["baddi wa7ad shawarma", "vreau o shaorma"],
    ["bala basal", "fără ceapă"],
    ["bala sukkar", "fără zahăr"],
    ["ktir tayyeb!", "foarte bun!"],
    ["shab3an / shab3ane", "sunt sătul / sătulă"],
    ["el 7seb, min fadlak", "notă, vă rog"],
    ["bte2bal card?", "acceptați cardul?"],
    ["sa7tein", "poftă bună"],
  ]],
  ["Cumpărături și prețuri", [
    ["addaysh ha2?", "cât costă asta?"],
    ["ghali ktir", "e foarte scump"],
    ["fi shi arkhas?", "aveți ceva mai ieftin?"],
    ["baddi hayda", "vreau asta"],
    ["ma baddi, shukran", "nu vreau, mulțumesc"],
    ["3andkun ...?", "aveți ...?"],
    ["bass 3am betfarraj", "doar mă uit"],
    ["fi 7ajm akbar?", "aveți o mărime mai mare?"],
    ["fi lawn tene?", "aveți altă culoare?"],
    ["ba2a addaysh el kell?", "cât face in total?"],
    ["khod, tfaddal", "poftim, ia"],
    ["ma3i cash", "am numerar"],
  ]],
  ["Taxi, drum și orientare", [
    ["baddi rou7 3a ...", "vreau să merg la ..."],
    ["addaysh el ojra?", "cât costă cursa?"],
    ["wa22ef hon, min fadlak", "opriți aici, vă rog"],
    ["wein el ...?", "unde este ...?"],
    ["3al yamin", "la dreapta"],
    ["3al shmel", "la stânga"],
    ["dughri", "drept înainte"],
    ["2arib / b3id", "aproape / departe"],
    ["ana daye3 / day3a", "m-am rătăcit"],
    ["fiik tsa3edni?", "mă poți ajuta?"],
    ["kam kilometer?", "câți kilometri?"],
    ["mte bikoun jehez?", "când e gata?"],
  ]],
  ["Familie și oameni", [
    ["hayda jawzi", "acesta este soțul meu"],
    ["hayde marti", "aceasta este soția mea"],
    ["immi / bayyi", "mama mea / tatăl meu"],
    ["khayyi / ekhti", "fratele meu / sora mea"],
    ["3andi walad w bint", "am un băiat si o fată"],
    ["3eilti kbire", "familia mea e mare"],
    ["2addaysh 3omrak?", "ce vârstă ai?"],
    ["3omri talatin sene", "am treizeci de ani"],
    ["shu bteshteghel?", "cu ce te ocupi?"],
    ["beshteghel bi ...", "lucrez în ..."],
    ["saken / sakne bi Bucharest", "locuiesc în București"],
    ["hayda sa7bi", "acesta e prietenul meu"],
  ]],
  ["Conversație de zi cu zi", [
    ["na3am / la2", "da / nu"],
    ["mnee7, mashi", "bine, e ok"],
    ["ma fhemet", "nu am înțeles"],
    ["fiik t3id, min fadlak?", "poți repeta, te rog?"],
    ["shway shway", "încet încet"],
    ["shu ya3ne hayda?", "ce înseamnă asta?"],
    ["kif bet2oulo bel 3arabe?", "cum se spune în arabă?"],
    ["ana 3am et3allam 3arabe", "învăț araba"],
    ["bta3ref ingleeze?", "știi engleza?"],
    ["mn shuf ba3d", "ne vedem"],
    ["bokra", "mâine"],
    ["mbere7", "ieri"],
    ["hallaq", "acum"],
    ["shway ba3ed", "peste puțin timp"],
    ["mesh mushkile", "nicio problemă"],
    ["akid", "sigur"],
  ]],
  ["Urări și expresii libaneze tipice", [
    ["yalla!", "hai! / să mergem!"],
    ["inshallah", "dacă vrea Dumnezeu / sper"],
    ["mabrouk!", "felicitări!"],
    ["allah ya3tik el 3afye", "să-ți dea Dumnezeu putere (mulțumire)"],
    ["na3iman", "să-ți fie de bine (după duș/tuns)"],
    ["sa7tein", "poftă bună / in sănătatea ta"],
    ["kel sene w enta salem", "la mulți ani"],
    ["3a rasi", "cu mare plăcere (lit. pe capul meu)"],
    ["ya rait", "aș vrea să fie așa"],
    ["khalas", "gata, s-a terminat"],
    ["ma3lesh", "nu-i nimic"],
    ["ktir 7elo", "foarte frumos"],
    ["wallah?", "serios?"],
    ["bi7ebbak / bi7ebbik", "te iubesc (m / f)"],
    ["t2aburne", "expresie libaneză de alint, lit. să mă îngropi"],
    ["ya3ne", "adică / cam așa"],
    ["3ala fikra", "apropo"],
    ["bi kell sourou", "cu mare plăcere"],
  ]],
];

const PLAN_RULES = [
  "Oră fixă în fiecare zi - contează mai mult decât durata.",
  "Totul cu voce tare. Araba învățată în gând nu se aude când vorbești.",
  "Notezi în arabizi, niciodată cu litere arabe în prima lună.",
  "Cinci minute de ascultare în fiecare zi: muzică, TikTok sau seriale libaneze.",
];

const PLAN = [
  ["Săptămâna 1 - sunete și primul contact", [
    "Citește tabelul arabizi: 2, 3, 5, 7. Scrie-ți numele și o propoziție despre tine în arabizi.",
    "Saluturi: mar7aba, saba7 el kheir, masa el kheir. Repeta fiecare de 10 ori cu voce tare.",
    "kifak / kifik și răspunsurile: mni7, mni7a, w enta / w ente.",
    "Prezentare: shu ismak, ismi..., min wein enta, ana min Romania.",
    "Sunetele grele: 3 (3ayn) și 7. Ascultă 10 minute de libaneză pe YouTube și imită.",
    "Politețe: min fadlak, shukran, 3afwan, yalla bye.",
    "Verificare: te prezinți 60 de secunde, fără să citești. Înregistrează-te și ascultă.",
  ]],
  ["Săptămâna 2 - numere, ore și prețuri", [
    "Numerele 1-10. Scrie-le în arabizi și numără cu voce tare.",
    "Numerele 11-100. Spune-ți numărul de telefon în libaneză.",
    "Prețuri: addaysh ha2, ghali ktir, fi shi arkhas.",
    "Ora și zilele săptămânii. Spune la ce oră te trezești.",
    "La cumpărături: 3andkun...?, baddi hayda, bass 3am betfarraj.",
    "Recapitulare: reia tot vocabularul săptămânii, doar din memorie.",
    "Verificare: joacă un dialog de cumpărături de 10 replici, singur, cu voce tare.",
  ]],
  ["Săptămâna 3 - situații reale", [
    "La restaurant: menu, baddi, bala sukkar, el 7seb min fadlak.",
    "Mâncare și băutură: qahwe, shay, mayy, khebez, jebne, la7me.",
    "Taxi și orientare: baddi rou7 3a..., 3al yamin, 3al shmel, dughri.",
    "Întrebări cheie: shu, wein, mte, kif, laysh, min.",
    "Când nu înțelegi: ma fhemet, fiik t3id, shway shway.",
    "Ascultă 15 minute de muzică libaneză și scrie 5 cuvinte pe care le recunoști.",
    "Verificare: comandă o masă completă în libaneză, cu voce tare, fără notițe.",
  ]],
  ["Săptămâna 4 - vorbești despre tine", [
    "Familia: immi, bayyi, khayyi, ekhti, jawzi, marti.",
    "Munca și studiile: shu bteshteghel, beshteghel bi...",
    "Preferințe: b7ebb, ma b7ebb, bfaddel.",
    "Verbe utile la prezent: baddi, fiini, ba3ref, bshuf, brou7.",
    "Timp: hallaq, bokra, mbere7, kell yom, ba3ed shway.",
    "Expresii libaneze: yalla, inshallah, khalas, ma3lesh, 3a rasi.",
    "Scrie 10 propoziții despre ziua ta, în arabizi.",
    "Recapitulare generală: reia toate cele 4 săptămâni în 30 de minute.",
    "Vorbește cu un nativ. Lecția de probă de 30 de minute este gratuită.",
  ]],
];

const FOOTER =
  "Material gratuit oferit de Centrul de Arabă Libaneză cu Ibra, București &amp; online. Prima lecție de probă este gratuită: centruldearabalibaneza.com/trial · WhatsApp pe site.";

const CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, "Liberation Sans", Helvetica, sans-serif; color: #1f2937; }
.page { padding: 64px 58px 40px; }
.top { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 3px solid #c8202f; padding-bottom: 6px; }
.brand { color: #c8202f; font-weight: 700; font-size: 13px; letter-spacing: .02em; }
.site { color: #6b7280; font-size: 10px; }
h1 { font-size: 24px; margin: 18px 0 8px; color: #111827; }
.intro { font-size: 10.5px; color: #4b5563; line-height: 1.5; margin: 0 0 14px; }
.sec { color: #c8202f; font-weight: 700; font-size: 11px; border-left: 4px solid #c8202f; padding-left: 7px; margin: 12px 0 4px; }
table { width: 100%; border-collapse: collapse; }
td { font-size: 14.5px; padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
td.a { font-weight: 700; width: 41%; color: #111827; }
td.r { color: #4b5563; }
tr.alt td { background: #f9fafb; }
.box { background: #fdf0f1; border: 1px solid #f6d5d8; border-radius: 6px; padding: 12px 15px; font-size: 10.5px; line-height: 1.5; margin: 14px 0; }
.box b { color: #c8202f; }
.foot { border-top: 1px solid #e5e7eb; margin-top: 14px; padding-top: 6px; font-size: 9px; color: #6b7280; line-height: 1.4; }
.week { background: #f3f4f6; border-radius: 4px; font-weight: 700; font-size: 11px; padding: 7px 11px; margin: 14px 0 4px; }
td.day { color: #c8202f; font-weight: 700; width: 58px; font-size: 10.5px; padding: 3px 0; }
td.task { font-size: 10.5px; padding: 3px 0; }
.rules { list-style: disc; margin: 6px 0 0 16px; padding: 0; }
.rules li { margin: 2px 0; }
/* the plan fits on one page, like the original */
.plan .page { padding-top: 52px; }
.plan .week { margin: 10px 0 3px; padding: 6px 11px; }
.plan td.day, .plan td.task { padding: 2px 0; }
.plan .box { margin: 10px 0; padding: 10px 15px; }
`;

const head = (title) => `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="page">
<div class="top"><span class="brand">ARABĂ LIBANEZĂ CU IBRA</span><span class="site">centruldearabalibaneza.com</span></div>`;

const expresiiHtml = `${head("100 de expresii libaneze esențiale")}
<h1>100 de expresii libaneze esențiale</h1>
<p class="intro">Toate expresiile sunt scrise în <b>arabizi</b> (litere latine + cifre), exact cum își scriu libanezii mesajele. Cifrele sunt sunete: <b>7</b> = h aspirat puternic, <b>3</b> = sunet gutural din gât (3ayn), <b>5</b> = h ca in "loch", <b>2</b> = oprire glotală, <b>9</b>/<b>6</b> = s/t emfatice.</p>
${EXPRESII.map(([title, rows]) => `<div class="sec">${esc(title)}</div><table>${rows
  .map(([a, r], i) => `<tr class="${i % 2 ? "alt" : ""}"><td class="a">${esc(a)}</td><td class="r">${esc(r)}</td></tr>`)
  .join("")}</table>`).join("\n")}
<div class="box"><b>Cum le inveti repede:</b> 5 expresii pe zi, spuse cu voce tare de 10 ori. În 20 de zile le ai pe toate. Ghidul complet al cifrelor e pe centruldearabalibaneza.com/arabizi, iar planul de 30 de zile pe /resurse.</div>
<div class="foot">${FOOTER}</div>
</div></body></html>`;

let day = 0;
const planHtml = `${head("Plan de 30 de zile: araba libaneză de la zero").replace("<body>", '<body class="plan">')}
<h1>Plan de 30 de zile: araba libaneză de la zero</h1>
<p class="intro">15-20 de minute pe zi, doar cu resurse gratuite și fără alfabet arab: notezi tot în <b>arabizi</b>. La finalul fiecărei săptămâni ai un punct de verificare: dacă îl treci, mergi mai departe; dacă nu, mai repetă o zi.</p>
<div class="box"><b>Regulile planului:</b><ul class="rules">${PLAN_RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
${PLAN.map(([title, days]) => `<div class="week">${esc(title)}</div><table>${days
  .map((t) => `<tr><td class="day">Ziua ${++day}</td><td class="task">${esc(t)}</td></tr>`)
  .join("")}</table>`).join("\n")}
<div class="box"><b>După ziua 30:</b> ai baza pentru nivelul A1. Continuă cu grupele A1 (online sau fizic în București) sau cu lecții private 1:1 - detalii pe centruldearabalibaneza.com/cursuri.</div>
<div class="foot">${FOOTER}</div>
</div></body></html>`;

function findChromium(chromium) {
  const candidates = [];
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) candidates.push(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE);
  try { candidates.push(chromium.executablePath()); } catch { /* no registered browser */ }
  const browsersRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try {
    for (const dir of readdirSync(browsersRoot)) {
      if (!dir.startsWith("chromium")) continue;
      for (const sub of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
        candidates.push(resolve(browsersRoot, dir, sub));
      }
    }
  } catch { /* no browsers folder */ }
  return candidates.find((p) => existsSync(p)) ?? null;
}

const { chromium } = await import("playwright");
const browser = await chromium.launch({ executablePath: findChromium(chromium) ?? undefined });
const FIXED_PDF_DATE = "D:20260101000000+00'00'";
for (const [file, html] of [
  ["public/100-expresii-libaneze.pdf", expresiiHtml],
  ["public/plan-30-zile-araba-libaneza.pdf", planHtml],
]) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const out = resolve(root, file);
  await page.pdf({ path: out, format: "A4", printBackground: true });
  await page.close();
  // Same trick as the cheat sheet: a fixed date so identical text gives an identical file.
  const raw = readFileSync(out);
  const stamped = Buffer.from(
    raw.toString("latin1").replace(/D:\d{14}\+00'00'/g, (m) => (m.length === FIXED_PDF_DATE.length ? FIXED_PDF_DATE : m)),
    "latin1",
  );
  if (stamped.length === raw.length) writeFileSync(out, stamped);
  console.log(`[resource-pdfs] wrote ${file}`);
}
await browser.close();
