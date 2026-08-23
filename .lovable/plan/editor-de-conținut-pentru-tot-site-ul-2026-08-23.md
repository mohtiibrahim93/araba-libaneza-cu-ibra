# Editor de conținut pentru tot site-ul

Scop: să poți corecta orice text de pe site (greșeli, formulări, prețuri, meta) direct din `/admin`, fără cod — plus editor complet pe paginile SEO/landing, ca la blog.

Blogul are deja editor (override Markdown). Restul site-ului e text în cod: dicționarul RO/EN din aplicație (homepage, meniuri, formulare, footer, FAQ) și paginile SEO/landing scrise fiecare ca pagină separată.

## Ce primești

### 1. Tab „Texte site" — corectare text existent (tot site-ul)
- Listă cu toate textele din dicționarul RO/EN (câteva sute de chei), grupate pe secțiuni: Meniu, Hero, Pași, Programe, Prețuri, Formular, FAQ, Footer etc.
- Căutare după conținut („scrie un cuvânt, îți arăt unde apare pe site").
- Editezi RO și EN una lângă alta, salvezi, textul se schimbă imediat pe site.
- Buton „Revino la textul original" pe fiecare rând; rândurile modificate sunt marcate vizibil.

### 2. Tab „Pagini" — editor complet pentru paginile SEO/landing
- Listă cu toate paginile site-ului (landing SEO RO, paginile EN/DE, paginile de cursuri).
- Pentru fiecare: meta title, meta description, titlu H1, intro, corp Markdown editabil (adaugi/ștergi secțiuni), întrebări FAQ (care alimentează și datele structurate), activ/ascuns.
- Prima salvare pornește de la textul existent al paginii, ca să corectezi, nu să rescrii.
- „Șterge versiunea" readuce pagina la varianta din cod.
- Upload imagini din editor (aceeași stocare ca la blog).

### 3. Meta pentru orice pagină
Titlurile și descrierile SEO devin editabile pentru fiecare rută, inclusiv cele care nu au corp Markdown (homepage, checkout, cursuri).

## Etape de livrare
1. Bază de date + funcția de admin pentru texte și pagini (cu control de acces admin).
2. Tab „Texte site" cu căutare, editare RO/EN și revenire la original.
3. Preluarea automată a textelor curente ale paginilor SEO ca punct de plecare pentru editor.
4. Tab „Pagini" cu editor Markdown, FAQ, meta și upload imagini.
5. Trecerea paginilor SEO pe conținutul editabil, una câte una, cu verificare că arată identic înainte de orice modificare.

## Detalii tehnice
- Tabele noi: `site_texts` (key, value_ro, value_en) și `page_contents` (path, meta/H1/lead/body_md/faq jsonb, is_published). RLS: citire publică doar pentru rândurile publicate, scriere doar prin edge function-ul de admin (`admin-registrations`, acțiuni `list/upsert/delete_site_text` și `..._page_content`), cu GRANT-uri explicite.
- Un hook `useSiteTexts` încarcă overrides-urile o dată și le suprapune peste dicționarul din `src/lib/i18n.tsx`; dacă backendul e indisponibil, site-ul folosește textul din cod (zero risc de pagină goală).
- `LandingLayout` + paginile SEO citesc conținutul din `page_contents` când există, altfel randează JSX-ul actual. Corpul Markdown e randat cu `MarkdownBody` (deja folosit la blog).
- Meta/canonical/JSON-LD rămân generate ca acum, dar din valorile editabile.
- Notă: `scripts/seoPrerender.ts` scrie meta-ul static la build; textele editate din admin apar imediat vizitatorilor, iar în HTML-ul pre-generat pentru crawleri după următoarea publicare — voi actualiza scriptul să citească meta din baza de date la build.
