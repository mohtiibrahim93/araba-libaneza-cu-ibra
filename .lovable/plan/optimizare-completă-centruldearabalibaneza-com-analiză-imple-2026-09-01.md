# Optimizare completă centruldearabalibaneza.com — analiză, implementare, handoff

## 1. Inventar și validare date (deja început)

Am citit deja sursele-cheie pentru a fundamenta planul. Restul PDF-urilor GA4 se parsează în etapa de execuție și intră integral în `docs/SEO_AUDIT.md`.

Surse și intervale confirmate:

| Sursă | Fișier | Interval | Filtre | Limitări |
|---|---|---|---|---|
| Search Console | `...Performance-on-Search-2026-09-01.xlsx` | ultimele 16 luni (date reale din 2026-06-11 → 2026-08-31) | Tip căutare: Web | fără segmentare pe dată × pagină; date sub prag lipsesc |
| GA4 | `Pages_and_screens...xlsx` + PDF-uri | 2026-01-01 → 2026-09-01 | unele rapoarte filtrate (ex. Events: `page_view` + Country=Romania) | filtre diferite între rapoarte, nu se pot amesteca |

Diferență importantă de semnalat în audit: raportul GA4 „Events” este filtrat pe România și pe un singur eveniment, deci nu reprezintă totalul evenimentelor; nu se compară direct cu „Landing page” sau „Pages and screens”.

Comparații care se pot face onest cu datele disponibile: ultimele 28 de zile complete GSC (2026-08-02 → 2026-08-29) vs. cele 28 anterioare (2026-07-05 → 2026-08-01). Nu există an-precedent (proprietatea are date abia din iunie 2026), deci acea comparație se marchează explicit ca indisponibilă.

## 2. Diagnostic preliminar (bazat pe date, nu presupuneri)

Observații verificate:
- GSC total perioadă: 34 clicuri / 3.012 afișări / CTR ~1,1% / poziție medie ~26.
- Afișările au explodat (11/săpt. în iunie → 300–800/săpt. în iulie–august), dar clicurile au rămas 0–5/săpt. Problema nu e indexarea, ci **poziția medie și CTR**.
- Interogări cu volum mare și zero clicuri: `meditatii araba` (473 afișări, poz. 25,4), `cursuri adolescenti araba` (466, poz. 33,5), `cursuri araba` (409, poz. 27,6), `cursuri limba araba` (130, poz. 37,7).
- Interogări aproape de prima pagină, unde câștigul e rapid: `meditatii araba bucuresti` (poz. 14,9), `cursuri araba bucuresti` (poz. 16,9).
- Pagini care deja rankează bine dar au trafic mic: `/blog/alfabetul-arab-pentru-incepatori` (poz. 7,5), `/ce-araba-sa-inveti` (poz. 5,2), `/resurse` (poz. 6,6) — potențial de CTR și de linking intern spre paginile comerciale.
- Mobil = 1.730 afișări cu CTR 1,45%; desktop 1.277 afișări cu CTR 0,7% și poziție mai slabă (35,4).
- GA4: 119 utilizatori noi în 2026, **0 „qualified leads” și 0 key events** pe toate paginile. Codul de tracking (`src/lib/tracking.ts`) trimite deja `generate_lead`, `trial_booking_complete`, `paid_booking_complete`, `whatsapp_click`, `phone_click` — deci lipsa key events este cel mai probabil configurare GA4 (evenimentele nu sunt marcate ca „key events”) și/sau consimțământ refuzat prin Consent Mode. Aceasta rămâne o ipoteză de verificat, nu o concluzie.

Diagnostic principal (preliminar): site-ul are vizibilitate în creștere, dar rankează în pozițiile 20–40 pe termenii comerciali principali și nu convertește măsurabil pentru că nu există key events funcționale în GA4.

## 3. Ce implementez în Lovable

Prioritizat după impact/efort, doar acolo unde datele arată oportunitate:

**P0 — Măsurare (fără de care nimic nu e verificabil)**
- Audit al evenimentelor trimise, denumiri consistente, parametri fără date personale.
- Adăugare evenimente lipsă pe CTA-urile principale (click e-mail, click „Înscrie-te”, deschidere formular, submit formular pe fiecare tip de curs).
- Documentarea exactă a evenimentelor care trebuie marcate ca key events în GA4 (acțiune în interfața GA4, o fac eu doar dacă e posibilă din cod).

**P1 — Paginile cu afișări mari și poziție 15–40**
- `/meditatii-araba`: rescriere title/meta pentru CTR, extindere conținut pe intenția „meditații arabă / meditații arabă București”, preț, format, FAQ, CTA clar.
- `/cursuri-araba-bucuresti` și `/cursuri-araba`: consolidare pentru a evita canibalizarea cu homepage-ul (homepage-ul preia 1.298 afișări pe termeni comerciali) — roluri clare, canonical, linking intern.
- Pagina pentru adolescenți: 466 afișări, zero clicuri — conținut aliniat exact la interogare.

**P2 — CTR pe paginile care deja rankează în top 10**
- Titluri și descrieri rescrise pentru `/blog/alfabetul-arab-pentru-incepatori`, `/ce-araba-sa-inveti`, `/resurse`, plus linkuri interne din ele spre paginile de curs și spre lecția gratuită.

**P3 — CRO**
- CTA vizibil pentru lecția gratuită pe paginile de trafic (mobile-first, pentru că mobilul domină).
- Verificare formulare pe mobil și desktop.

Nu construiesc dashboard de analytics — prioritatea e traficul organic și conversiile.

## 4. Verificări după implementare

Build + lint + teste, verificare rute, metadata, sitemap, JSON-LD, testarea CTA-urilor și formularelor pe mobil și desktop, plus comparație înainte/după a title/description pentru fiecare pagină atinsă.

## 5. Documente livrate

- `docs/SEO_AUDIT.md` — inventarul fișierelor, tabelele de intervale, toate datele extrase, separat: observație / interpretare / recomandare.
- `docs/SEO_ACTION_PLAN.md` — plan prioritizat cu impact estimat și efort.
- `docs/CLAUDE_HANDOFF.md` — sarcini rămase, executabile: fișiere, pași, criterii de acceptare, comenzi de test, riscuri, KPI de comparat la 14/30/60 de zile.

## 6. De confirmat de tine

- Marcarea key events în GA4 și legarea Search Console de proprietate se fac din interfața Google — îți dau pașii exacți, dar nu le pot face eu.
- Publicarea modificărilor: le implementez și îți cer confirmarea înainte de publish.
