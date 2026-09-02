import { chromium } from 'playwright';
import { appendFileSync } from 'node:fs';
const OUT = 'fitresults.txt';
const BASE = 'http://localhost:4173';
// Real viewports from the GA4 Tech overview export, most-used first.
const SIZES = [[1920,1200],[1920,1080],[1536,864],[1470,956],[1280,800],[2560,1440],
               [440,956],[430,932],[402,874],[393,852],[390,844],[384,832],[360,780],[320,691]];
const ROUTES = ['/', '/cursuri', '/blog/numere-in-araba-libaneza', '/cursuri-araba-bucuresti', '/trial'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
for (const [w, h] of SIZES) {
  await p.setViewportSize({ width: w, height: h });
  const bad = [];
  for (const r of ROUTES) {
    await p.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(350);
    // Cheap first: does the page actually scroll sideways at all?
    const res = await p.evaluate(() => {
      const de = document.documentElement;
      return { over: de.scrollWidth > de.clientWidth + 1, cw: de.clientWidth, sw: de.scrollWidth };
    });
    if (!res.over) continue;
    // Only pay for the element scan when there is something to find.
    const worst = await p.evaluate(() => {
      const de = document.documentElement;
      let w = null;
      for (const el of document.querySelectorAll('body *')) {
        const q = el.getBoundingClientRect();
        if (q.width > 0 && q.right > de.clientWidth + 1 && (!w || q.right > w.right)) {
          const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : '';
          w = { sel: el.tagName.toLowerCase() + (cls ? '.' + cls : ''), right: Math.round(q.right) };
        }
      }
      return w;
    });
    bad.push(`${r} ${res.sw}>${res.cw}${worst ? ' <- ' + worst.sel : ''}`);
  }
  appendFileSync(OUT, `${String(w + 'x' + h).padEnd(11)} ${bad.length ? 'OVERFLOW  ' + bad.join(' ; ') : 'fits'}\n`);
}
await b.close();
appendFileSync(OUT, 'DONE\n');
