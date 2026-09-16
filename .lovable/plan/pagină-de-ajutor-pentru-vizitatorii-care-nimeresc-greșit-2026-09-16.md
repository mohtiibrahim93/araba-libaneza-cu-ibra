# Pagină de ajutor pentru vizitatorii care nimeresc greșit

Redirecțiile 301 rămân exact așa cum sunt. În plus:

1. **Pagina 404 devine inteligentă** — ghicește ce căuta vizitatorul din adresa greșită și arată recomandări potrivite, nu o listă fixă.
2. **O pagină dedicată, linkabilă** — o adresă reală pe care o poți pune în e-mailuri, reclame sau răspunsuri, cu recomandări complete și căutare.

## Ce vede vizitatorul

Pe 404, în loc de lista fixă de 9 linkuri:

- **Titlu onest**, la fel ca acum ("Nu am găsit pagina căutată").
- **Cel mai probabil ce căutai** — 3 sugestii calculate din adresa greșită. Cine a intrat pe `/cursuri-copii-bucuresti` vede întâi cursul pentru copii și cursurile din București; cine a intrat pe `/alfabet-arab` vede ghidul de alfabet.
- **Căsuță de căutare** — scrie ce cauți și primești pagini din site pe loc (fără server, fără așteptare).
- **Cursuri potrivite** — grup, privat, copii, adolescenți, lecție de probă.
- **Articole din blog** — cele mai recente/citite, cu imaginile de copertă noi.
- **Resurse gratuite și Jocul Yalla** — alfabet, arabizi, testul de nivel din joc.
- Un link discret către pagina dedicată, pentru cine vrea lista completă.

Pagina dedicată arată aceleași secțiuni, dar în versiune completă (toate cursurile, toate articolele grupate pe teme, toate resursele) și fără mesajul de eroare — e o hartă a site-ului cu căutare, gândită pentru oameni, nu doar pentru crawlere.

Bilingv, ca tot restul site-ului: variantă română și variantă engleză, legate reciproc.

## Detalii tehnice

**Rute noi**
- `src/routes/te-ajutam.tsx` → `/te-ajutam` (RO)
- `src/routes/en.find-your-page.tsx` → `/en/find-your-page` (EN)
- Pagina comună: `src/pages/seo/FindYourPage.tsx`, în stilul paginilor existente (Navbar / Footer / ScrollToTop).
- Înregistrare în `src/lib/languageRoutes.ts` (pereche RO↔EN) și în registrul de rute din `src/lib/seoHead.ts` (title, description, canonical, hreflang, OG) — altfel gărzile de prerender pică build-ul. Sitemap-ul și `llms.txt` se regenerează din registru, deci ambele adrese apar automat.

**Motorul de recomandări** — fișier nou `src/lib/pageFinder.ts`:
- Construiește indexul din surse existente: `allSeoRoutes()` (path + title + description) și `BLOG_POSTS`, plus copertele din `blogCovers.ts`. Zero conținut duplicat, zero liste hardcodate care se învechesc.
- `suggestFor(pathname)`: normalizează slug-ul greșit (scoate `/en/`, cratime, diacritice, plural), potrivește pe cuvinte-cheie cu scor simplu, întoarce primele 3.
- `searchPages(query, lang)`: aceeași potrivire, filtrată pe limbă; excluse rutele admin/auth/checkout.
- Ambele funcții sunt pure, fără rețea — merg și în SSR și în browser.

**404** — `src/pages/NotFound.tsx`:
- `resolveRedirect` și `Navigate` rămân intacte (redirecțiile 301 și aliasurile nu se schimbă).
- `meta robots: noindex, follow` rămâne pe 404. Pagina dedicată este indexabilă normal.
- Se păstrează `trackEvent("404NotFound", …)`; se adaugă un eveniment când vizitatorul dă click pe o sugestie, ca să vedem în date ce caută lumea și ce pagini lipsesc.

**Teste** (adăugate la suita existentă de 312):
- fiecare alias 301 din `redirects.ts` continuă să redirecționeze, nu ajunge pe pagina nouă;
- `suggestFor` întoarce destinația așteptată pentru un set de adrese greșite reale;
- ambele rute noi există, au metadate proprii și pereche hreflang corectă;
- căutarea nu întoarce niciodată rute admin/auth/checkout.

**Neatinse:** `scripts/seoPrerender.ts`, `robots.txt`, `supabase/functions/**`, cheia IndexNow, design, copy SEO existent, comportamentul de booking/plată, GA4 ID.

Verificare finală: `npx vitest run`, typecheck, build, plus o trecere în browser pe o adresă inexistentă și pe ambele rute noi.
