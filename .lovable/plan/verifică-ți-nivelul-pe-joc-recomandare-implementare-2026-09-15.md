# „Verifică-ți nivelul" pe /joc — recomandare + implementare

## Recomandarea mea

Da, merită făcut — dar nu ca quiz separat. Jocul Yalla are deja un test de orientare integrat (modul „placement", versiune pilot): 24 de întrebări în trei secțiuni (Bază / Consolidare / Extindere, corespunzător A1 / A2 / B1), fără cronometru, cu „Nu știu", recomandare de punct de pornire și link către lecția de probă. Rezultatul se poate descărca ca fișier pentru revizuirea ta.

Problema reală: nimeni nu ajunge la el. Este un buton mic („Orientare") în meniul intern al jocului, iar pagina /joc nu îl menționează niciunde. Vizitatorul joacă, dar nu află că își poate verifica nivelul.

Deci planul e să **scoatem testul existent la suprafață** și să îl legăm de cursuri — nu să scriem un al doilea quiz care ar concura cu `/quiz` (testul de nivel existent al site-ului, care colectează și obiective, timp, alfabet).

O limită pe care o păstrăm deliberate: testul evaluează doar citire și răspunsuri scrise scurte, nu ascultare/vorbire, iar pragurile sunt nevalidate. Textul rămâne onest: „recomandare orientativă, confirmată în conversație cu Ibrahim" — nu promitem certificare CEFR.

## Ce construim

### 1. Secțiune „Verifică-ți nivelul" pe /joc

- Sub frame-ul jocului (sau deasupra lui), o secțiune cu titlu, 2-3 fraze și un buton proeminent „Verifică-ți nivelul".
- Butonul comută frame-ul pe modul `placement` (componenta `YallaGame` suportă deja acest mod — titlul dedicat există: „Yalla — orientare, versiune pilot"). Fără rută nouă, fără pagină nouă, fără modificări de sitemap.
- Copy bilingv RO/EN în stilul existent al paginii; nota EN păstrează avertismentul că jocul/testul e în română.

### 2. Legătura rezultat → curs (în joc)

Ecranul de rezultat din `public/yalla/plus.js` primește, pe lângă „Lecție de probă" existent:

- Etichete de nivel explicite: secțiunile Bază / Consolidare / Extindere afișate ca **A1 / A2 / B1 (orientativ)**.
- Un buton „Vezi cursul potrivit" care duce la `/cursuri-limba-araba` (sau pagina de nivel corespunzătoare, dacă există pentru nivelul recomandat).
- Textul de onestitate rămâne: praguri pilot, ascultare/vorbire neevaluate, grupa se stabilește în conversație.

### 3. Verificare

- `npx vitest run` — suita completă verde (312 teste).
- Typecheck curat.
- Verificare manuală în preview: /joc se încarcă, butonul comută pe test, testul se parcurge, rezultatul arată nivelul + linkurile către curs și lecția de probă.

## Ce NU atingem

- `/quiz` (testul de nivel existent) — rămâne neschimbat; cele două au roluri diferite (quiz-ul colectează și obiective/timp/alfabet pentru înscriere).
- `scripts/seoPrerender.ts`, `robots.txt`, `supabase/functions/**`, fișierul IndexNow — neatins, ca întotdeauna.
- Banca de întrebări și pragurile pilot — calibrarea lor e decizia ta pedagogică, nu o schimbăm acum.
- Fără rută nouă, fără modificări de sitemap/hreflang.

## Note tehnice

- `src/pages/Joaca.tsx` — secțiunea nouă + stare pentru comutarea modului frame-ului (`journey` ↔ `placement`); `YallaGame` remontează frame-ul la schimbarea modului (mecanismul `key` existent).
- `public/yalla/plus.js` — doar ecranul de rezultat: etichete A1/A2/B1 orientative + buton curs. Logica de scor și banca de întrebări rămân intacte.
- Rezultatul rămâne local în browser (ca tot progresul jocului) — nimic nu se trimite pe server, conform designului existent.
