# TTFB și „Discovered – currently not indexed": ce arată măsurătorile reale

## Ce am măsurat acum (nu presupuneri)

Am cerut direct paginile live de pe `centruldearabalibaneza.com`, de două ori per pagină plus 10 cereri consecutive pe homepage:

| Pagină | TTFB prima cerere | TTFB a doua |
|---|---|---|
| `/` | 0,26 s | 0,15 s |
| `/cursuri/grup/a1` | 0,35 s | 0,21 s |
| `/meditatii-araba` | 0,23 s | 0,14 s |
| `/blog` | 0,50 s | 0,22 s |
| `/resurse` | 0,18 s | 0,12 s |

10 cereri cu parametru aleatoriu (ca să evit cache-ul): între 0,08 s și 0,21 s.

Concluzii verificate:

- Site-ul este **deja servit prin Cloudflare** (`server: cloudflare`, header `cf-ray`). A pune încă un Cloudflare în față nu are ce să adauge.
- Fișierele JS/CSS au deja cache pe un an (`public, max-age=31536000, immutable`).
- TTFB măsurat din Amsterdam este de **sute de milisecunde**, nu 2,7–13,3 s. Cifrele acelea vin dintr-un tool de audit; nu le pot reproduce și nu știu din ce locație și cu ce condiții au fost măsurate.

## Problema reală pe care am găsit-o în timpul verificării

HTML-ul livrat public are `<head>` complet (title, canonical, corecte per pagină), dar **`<div id="root"></div>` este gol** — corpul pre-randat nu este în deployment-ul publicat. Asta înseamnă că un crawler care nu execută JavaScript (Bing, majoritatea crawlerelor AI) vede pagini fără conținut, iar Google trebuie să aștepte a doua trecere de randare — exact starea care produce „Discovered – currently not indexed".

Cauza probabilă: ultima publicare reușită este anterioară reparării pasului de pre-randare a corpului (build-ul acela a eșuat). Trebuie confirmată prin republicare.

## Pași propuși

1. **Republicare + verificare** — public site-ul, apoi cer din nou HTML-ul brut al câtorva rute și confirm că `#root` conține text real (nu doar `<head>`). Dacă tot e gol, investighez pasul `scripts/prerenderBody.tsx` în pipeline-ul de deploy.
2. **Măsurare TTFB din mai multe locații** — după publicare, măsor din nou și raportez cifre concrete; dacă apar valori de secunde, izolez ruta și condiția în care se întâmplă înainte să propunem orice schimbare de infrastructură.
3. **Verificare în Search Console** — după ce corpul pre-randat e live, reverific starea de indexare a paginilor problematice și raportez ce s-a schimbat.

## Ce nu recomand

- Un al doilea Cloudflare peste cel existent — nu rezolvă nimic și adaugă un punct de defect.
- Modificarea cache-ului pentru HTML (`no-cache` acum): e setat de platforma de hosting, nu din codul aplicației, și cu TTFB sub 0,3 s nu e cauza problemei de indexare.

## Detalii tehnice

- Măsurători: `curl -w time_starttransfer` pe apex, fără compresie, inclusiv cu cache-buster.
- `www.` face 302 spre apex — corect și fără cost semnificativ.
- Pre-randarea corpului: `scripts/prerenderBody.tsx`, rulat după `vite build`; `scripts/seoPrerender.ts` scrie `<head>` (acesta funcționează, se vede în producție).
