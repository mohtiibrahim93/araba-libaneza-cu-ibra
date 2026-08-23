# Prioritatea 2 — Clusterul „Resurse gratuite”

Obiectiv: interceptăm căutările de tip „învață arabă gratis / lecții gratuite / PDF vocabular” și le convertim în lead-uri prin resurse descărcabile, exact ca la Arabizi.

## Ce construim

### 1. Hub: „Învață arabă libaneză gratis — resurse, lecții și PDF-uri”
Rută nouă `/invata-araba-gratis` (landing SEO în română, `LandingLayout`).
- Ce poți învăța realist gratis și unde se oprește gratuitul (onest, nu clickbait).
- Listă structurată de resurse: cele de pe site (blog, test de nivel, lecția de probă), plus resurse externe utile (YouTube, podcasturi, aplicații) cu evaluare scurtă „bun pentru / slab la”.
- Mini-lecție gratuită inclusă în pagină: 10 expresii + pronunție în arabizi, ca pagina să fie utilă imediat, nu doar o poartă către formular.
- Blocul de descărcare (punctul 3) plasat sus, după intro.
- FAQ: se poate învăța araba gratis, cât de departe ajungi singur, care e cea mai bună aplicație, de unde începi.

### 2. Pagina de resurse descărcabile: `/resurse`
- Index vizual al tuturor materialelor gratuite (cheat-sheet Arabizi existent + cele două noi de mai jos), fiecare cu descriere și buton de descărcare prin email.
- Devine destinația internă pentru „resurse” din blog, footer și paginile de curs.

### 3. Două materiale noi (lead magnets)
- **Pachetul de start: 100 de expresii libaneze esențiale** (PDF) — tematic: salut, prezentare, restaurant, taxi, cumpărături, familie, urări; fiecare cu arabizi + traducere.
- **Plan de învățare pentru 30 de zile** (PDF) — ce faci în fiecare zi, 15–20 min, cu resurse gratuite și puncte de verificare săptămânale.
- Ambele generate ca fișiere statice în `public/`, în același stil ca `arabizi-cheat-sheet.pdf`.

### 4. Legături interne și indexare
- Link către `/invata-araba-gratis` și `/resurse` din: `/invata-araba`, `/araba-pentru-incepatori`, `/arabizi`, `/fara-alfabet-arab`, `/blog/primele-20-de-expresii-libaneze`, `/blog/numere-in-araba-libaneza` și footer.
- Ambele rute noi în `public/sitemap.xml` și în lista de prerender SEO.

## Detalii tehnice

- Rute noi în `src/App.tsx`: `/invata-araba-gratis`, `/resurse`, ambele pe `src/components/seo/LandingLayout.tsx` (meta, canonical, Course + Breadcrumb + FAQPage JSON-LD deja existente).
- Formularul: generalizăm `ArabiziCheatSheetForm.tsx` într-un `ResourceDownloadForm` cu props `resource`, `title`, `description`, `fileHref`; pagina Arabizi îl folosește mai departe cu aceleași texte (fără regresie).
- Backend: fără tabele noi — refolosim `resource_leads` și funcția `resource-download`; adăugăm cele două chei noi în harta `RESOURCES` și două template-uri în `supabase/functions/_shared/transactional-email-templates/` + înregistrare în `registry.ts`. Redeploy `resource-download`.
- Rate-limitul existent (10/IP/oră, 3/email/zi) rămâne neschimbat.
- PDF-urile: generate local cu același script Playwright (fonturi Inter + Noto Naskh Arabic), livrate ca link în email, nu ca atașament.
- Metadata pentru rutele noi în `scripts/seoPrerender.ts` + intrări în `public/sitemap.xml`.
- Conținut doar în română.

## Verificare
- Typecheck și testele existente.
- QA vizual pe PDF-uri: fiecare pagină convertită în imagine și inspectată înainte de livrare.
- Deschidem `/invata-araba-gratis` și `/resurse` în preview.
- Submit de test pentru fiecare resursă nouă, confirmăm lead-ul și emailul, apoi ștergem datele de test.
