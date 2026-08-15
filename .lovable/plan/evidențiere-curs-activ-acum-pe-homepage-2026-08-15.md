# Evidențiere „curs activ acum" pe homepage

## Ce vede vizitatorul

Imediat sub hero, o bandă vizibilă cu titlul „Cursuri care încep acum" — 1–3 carduri compacte, câte unul pentru fiecare grupă activă, fiecare cu:

- Nivel + format: „A1 · Online" / „A1 · Fizic (București)"
- Data de start și programul („sâmbătă & duminică 12:00–13:30")
- Un badge de urgență: „Începe în 3 zile" / „În desfășurare — te mai poți alătura" / „Ultimele 2 locuri"
- Buton: „Vezi cursul și înscrie-te" → pagina nivelului (`/cursuri/grup/a1?mod=online`), cu posterul și detaliile formatului corect preselectate. Nu duce direct la formular.

Dacă nu există nicio grupă în fereastra activă, banda nu apare deloc (fără spațiu gol).

## Ce înseamnă „activ"

Grupe din baza de date (`group_cohorts`) care sunt `is_active`, cu status public (forming / minimum_reached / confirmed / full / in_progress) și cu data de start între „acum 21 de zile" și „peste 60 de zile". Motivul intervalului: astăzi (15 august) grupele A1 fizic (10 aug) și A2 fizic (11 aug) tocmai au început și nu mai apar nicăieri pe site, deși încă se pot primi cursanți. Ordonare: cele deja începute primele, apoi după data de start; maxim 3 carduri.

## Detalii tehnice

- Hook nou `src/hooks/useActiveCohorts.ts` — aceeași interogare ca `useGroupCohorts`, dar cu fereastra de date de mai sus și cu locurile rămase din RPC-ul existent `get_cohort_signup_counts`.
- Componentă nouă `src/components/ActiveCoursesBanner.tsx` — carduri orizontale, scroll pe mobil, doar tokeni de design existenți (primary / muted / border), fără culori hardcodate.
- Montată în `src/pages/Index.tsx` între `HeroSection` și `SocialProofStrip`.
- Link: `/cursuri/grup/{level}?mod={fizic|online}` — parametrul `mod` e deja suportat în `CursGrupLevel.tsx` și selectează posterul + formatul.
- Texte noi RO/EN în `src/lib/i18n.tsx` (titlu bandă, badge-uri, CTA).
- Fără modificări de backend, de preț sau de flux de înscriere.
