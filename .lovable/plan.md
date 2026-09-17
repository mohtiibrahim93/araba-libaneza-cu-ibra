# Pagina „Scorul tău în joc" — /joc/scor

## Ce construim

O pagină nouă, **/joc/scor**, care citește progresul salvat de Jocul Yalla din browserul vizitatorului și îi arată:

1. **Scorul din joc** — XP, rang, runde încheiate, carduri exersate și consolidate (aceleași cifre din „Pașaportul meu" al jocului).
2. **Nivelul sugerat A1 / A2 / B1** — cu explicație și mențiunea clară că e orientativ și nu evaluează vorbitul sau ascultarea.
3. **Cursul recomandat** — buton către cursul potrivit nivelului + lecția de probă.
4. **Legătura cu testul de nivel clasic** — prezentat ca alternativă, în ambele sensuri (/joc/scor ↔ /test-de-nivel).

Dacă vizitatorul nu are încă progres în joc, pagina îl invită să joace sau să facă testul de nivel — nu arată cifre goale.

## Cum se calculează nivelul sugerat

- Dacă vizitatorul a trecut **testul de orientare din joc** (cele 24 de întrebări), folosim rezultatul lui real, salvat de joc — e cel mai precis semnal.
- Altfel, estimăm din activitatea de exersare: câte carduri a consolidat (3 răspunsuri corecte consecutive) și din care lecții — lecțiile jocului sunt deja grupate pe A1, A2 și B1, deci pragurile se leagă de banca reală de carduri a fiecărui nivel. Pragurile exacte se măsoară la implementare din fișierele jocului și se acoperă cu teste.

Pagina e **doar în română**, la fel ca /joc — banca de carduri a jocului există numai în română. Urmează același precedent din seoHead.ts (fără variantă englezească, fără hreflang).

## Modificări

1. **`src/lib/yallaProgress.ts`** (nou, funcții pure, testabile):
   - `readYallaProgress()` — citește și validează progresul jocului din browser (`yalla-liban-progress-v1`), cu rezultat sigur când lipsește sau e corupt.
   - `suggestLevel()` — regula de mai sus: rezultatul testului din joc dacă există, altfel estimare din cardurile consolidate pe grupele A1/A2/B1.
2. **`src/pages/JocScor.tsx` + `src/routes/joc.scor.tsx`** (noi) — pagina propriu-zisă, în stilul /joc (Navbar/Footer, breadcrumb, aceeași temă). Progresul se citește după încărcarea paginii în browser (fără probleme de randare server-side).
3. **`src/lib/seoHead.ts`** — intrare pentru /joc/scor (titlu, descriere, canonical), ca sitemap-ul și meta-urile server-side să rămână valide.
4. **`src/pages/Joaca.tsx`** — în secțiunea „Verifică-ți nivelul în joc", un al doilea buton: „Vezi scorul și nivelul tău" → /joc/scor.
5. **`src/pages/TestDeNivel.tsx`** — o mențiune discretă: „Ai jucat deja Yalla? Vezi ce nivel sugerează scorul tău" → /joc/scor.
6. **`public/llms.txt`** — intrare pentru pagina nouă.
7. **Teste noi** (`src/test/yalla-progress.test.ts`):
   - citirea progresului: valid, lipsă, corupt;
   - pragurile A1/A2/B1 pe scenarii realiste;
   - ruta /joc/scor are titlu, descriere, canonical; apare în sitemap;
   - /test-de-nivel și /joc trimit către /joc/scor.

## Ce nu se schimbă

- Jocul în sine (fișierele din `public/yalla/`) rămâne neatins.
- Testul de nivel clasic (/test-de-nivel) funcționează exact ca până acum — pagina nouă e o alternativă, nu o înlocuire.
- Redirecțiile 301, sitemap-ul existent, scripts/seoPrerender.ts, robots.txt, supabase/functions/**, booking, plăți, GA4 ID — neatinse.

## Verificare finală

- `npx vitest run` — suita completă verde (312 teste + cele noi).
- Typecheck curat, build OK.
- Trecere în browser: /joc/scor fără progres (invitația de a juca), apoi cu progres semănat manual (scor + nivel sugerat + curs recomandat), plus linkurile din /joc și /test-de-nivel.

Publicarea site-ului și trimiterea sitemap-ului în Search Console rămân în așteptare — nu sunt parte din acest plan.
