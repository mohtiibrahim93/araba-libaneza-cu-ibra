# Google Search Console: indexare completă a paginilor

Ce am verificat acum (nu presupuneri):

- Sitemap-ul are 65 adrese, toate corespund unor rute reale, iar toate sunt pre-randate la build (head complet pentru crawleri). Nu lipsește nicio pagină publică din sitemap.
- Homepage-ul e „Submitted and indexed", ultima accesare Google: 7 august. Impresiile au crescut de la 579 la 1726 în ultimele 28 de zile.
- Search Console nu expune prin API lista celor 19 pagini neindexate — raportul „Indexare pagini" e doar în interfață. Pot însă interoga starea fiecărei adrese din sitemap, una câte una, și obțin exact motivul pentru fiecare.

Probleme concrete deja identificate, care produc pagini „neindexate":

1. `/cursuri-araba` e în sitemap, dar are canonical către `/cursuri-limba-araba`. Google o va raporta mereu ca „pagină alternativă cu canonical corect" = neindexată. Nu trebuie trimisă în sitemap.
2. Există două pagini aproape identice pentru lecții private: `/cursuri/privat` și `/cursuri/private`, ambele în sitemap. Una va fi mereu considerată duplicat.
3. Nouă pagini nu au niciun link intern din site (Google le vede doar din sitemap, semnal slab): nivelurile B1, B2, C1, C2, `/cursuri/adulti`, `/cursuri/privat`, `/de/arabisch-lernen`, `/en/arabic-classes-near-me`, articolul `lebanese-arabic-learning-resources`.
4. Meniul de sus are doar Cursuri, Rezervă, Blog. Restul de ~40 de pagini atârnă doar de footer sau de nimic.

## Pasul 1 — Diagnostic exact, pagină cu pagină

Interoghez Search Console pentru fiecare adresă din sitemap și scot un tabel cu starea reală: indexată / descoperită dar necrawlată / crawlată dar neindexată / duplicat / alternativă cu canonical. Rezultatul îl raportez în chat, cu cele 19 pagini numite explicit și motivul fiecăreia.

## Pasul 2 — Curățare sitemap

- Scot `/cursuri-araba` din sitemap (rămâne accesibilă, dar consolidată pe `/cursuri-limba-araba`).
- Consolidez lecțiile private: păstrez `/cursuri/private` ca pagină canonică, iar `/cursuri/privat` primește canonical către ea și iese din sitemap.
- Verific ca fiecare `lastmod` să reflecte o modificare reală a paginii; scot valorile care nu sunt justificate.

## Pasul 3 — Meniu și linkuri interne

- Navbar: „Cursuri" devine meniu derulant cu Grup (A1–C2), Lecții private, Copii, Tineri, Adulți; adaug un meniu „Resurse" cu Resurse gratuite, Învață gratis, Arabizi, Dialecte arabe, Ce arabă să înveți, Meditații.
- Adaug linkuri contextuale către paginile orfane: nivelurile B1–C2 din pagina de curs de grup, `/en/arabic-classes-near-me` din hub-ul englez, `/de/arabisch-lernen` din selectorul de limbă/footer, articolul nou din indexul de blog și din `/resurse`.
- Versiunea mobilă a meniului primește aceleași secțiuni.

## Pasul 4 — Republicare și retrimitere

Public site-ul, retrimit sitemap-ul în Search Console și confirm starea lui. Apoi reverific paginile problematice și raportez ce s-a schimbat.

## Ce nu pot face

Nu pot forța indexarea și nu pot cere recrawl prin API — Google decide singur, de obicei în 1–3 săptămâni după ce semnalele se îmbunătățesc. Pentru paginile prioritare pot să-ți spun exact care merită trimise manual din „Inspectare URL" în interfața Search Console.

## Detalii tehnice

- `public/sitemap.xml` — eliminare intrări canonicalizate/duplicate; sitemap-ul e static, deci fără regenerator nou.
- `src/pages/courses/PrivateCourse.tsx` — adăugare `canonicalHref="/cursuri/private"`.
- `src/components/Navbar.tsx` — meniuri derulante (componenta `navigation-menu` din shadcn, deja în proiect), desktop + mobil.
- Linkuri interne în `CursGrup`, `Footer`, `BlogIndex`, `Resurse`, paginile EN.
- Diagnosticul folosește URL Inspection prin conexiunea Search Console deja legată de proiect; e doar citire.
