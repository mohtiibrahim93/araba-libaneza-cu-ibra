## Obiectiv

1. Când utilizatorul ajunge din butonul **Cursuri** → alege vârsta + mod (online/fizic) + tip (grup) și dă click pe o grupă (ex. A1), să aterizeze pe **aceeași pagină** ca atunci când intră din homepage la A1 — adică `/cursuri/grup/a1` (`CursGrupLevel`), nu pe pagina generică `/cursuri/curs/<slug>` (`CourseDetail`).
2. Pe `/cursuri/grup/a1` și `/cursuri/grup/a2`, dacă utilizatorul a ales deja "online" sau "fizic" în fluxul Cursuri, să se afișeze **doar posterul corespunzător** modului ales, nu ambele.

## Ce se schimbă

### 1. `src/components/courses/CourseCard.tsx`
- Când cursul este de tip grup și are `level`, linkul cardului devine `/cursuri/grup/<level>?mod=<format>` (în loc de `/cursuri/curs/<slug>`), transmițând `mod=online` sau `mod=fizic` din `course.format` când există.
- Pentru celelalte cursuri (fără level/format grup) se păstrează comportamentul actual (link către `/cursuri/curs/<slug>`).

### 2. `src/pages/courses/CursGrupLevel.tsx`
- Se citește `?mod=online|fizic` din URL (`useSearchParams`).
- `LEVEL_POSTERS[slug]` capătă o cheie de format per poster (`online` / `fizic`), iar la randare se filtrează după `mod` dacă e prezent:
  - `?mod=online` → doar posterul online
  - `?mod=fizic` → doar posterul fizic
  - fără parametru → ambele (comportament actual)
- Nu se schimbă nimic la curriculum, prețuri, formular sau SEO.

## Ce NU se atinge

- Pagina `CourseDetail` (`/cursuri/curs/<slug>`) rămâne funcțională pentru cursurile fără nivel A1–C2 (kids, cohorte speciale).
- Fluxul de înregistrare, prețurile, formularul, breadcrumb-urile și metadatele SEO ale `/cursuri/grup/<level>` rămân neschimbate.
- Nicio schimbare de backend, migrare sau edge function.

## Verificare

- `bun run build` trece curat.
- Manual: `/cursuri?varsta=adulti&mod=online&tip=grup` → click pe cardul A1 → aterizează pe `/cursuri/grup/a1?mod=online` și se vede doar posterul online.
- `/cursuri/grup/a1` (fără query) → ambele postere, ca acum.
