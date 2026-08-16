Actualizează datele de start pentru grupele A1 și A2 fizic, păstrând A1 online neschimbat

## Context
Cursantul a cerut anterior mutarea startului A1 pe 1 septembrie și A2 pe 2 septembrie. Acum clarifică: "The online one, keep it as it is" — adică A1 online trebuie să rămână pe data lui originală (15 august 2026). A1 fizic și A2 fizic vor fi actualizate la 1 septembrie, respectiv 2 septembrie 2026.

## Date curente confirmate în backend
- A1 fizic: 2026-09-01 (corect, nou)
- A1 online: 2026-09-01 (trebuie revenit la 2026-08-15)
- A2 fizic: 2026-09-02 (corect, nou)

## Schimbări necesare

### 1. Backend — corectează A1 online în `group_cohorts`
- UPDATE `start_date` pentru A1 online de la 2026-09-01 înapoi la 2026-08-15.
- Păstrează A1 fizic pe 2026-09-01 și A2 fizic pe 2026-09-02.

### 2. Localizare — actualizează textele în `src/lib/i18n.tsx`
Secțiunile afectate (RO și EN):
- `ctaScheduleGroupValue`
- `groupDesc`
- `groupStartDateVal`
- `groupScheduleVal`
- `groupEnrollmentOpenNote`
- `spotsCohort` (dacă e relevant să rămână "August 2026" sau să devină "Toamna 2026")

Valori noi pentru RO:
- A1 fizic: 1 septembrie 2026
- A1 online: 15 august 2026 (neschimbat)
- A2 fizic: 2 septembrie 2026
- A2 online: în curând

Valori noi pentru EN:
- A1 in person: 1 September 2026
- A1 online: 15 August 2026 (unchanged)
- A2 in person: 2 September 2026
- A2 online: opening soon

### 3. Curriculum — actualizează programul în `src/data/curriculum.ts`
A1 și A2, ambele limbi:
- A1 fizic: 1 septembrie – 24 noiembrie 2026 (~3 luni)
- A1 online: rămâne 15 august 2026
- A2 fizic: 2 septembrie 2026 – 2 martie 2027 (~6 luni)
- A2 online: rămâne "în curând"

### 4. Postere și alt text
- `src/components/ProgramsSection.tsx`: updatează alt textul pentru posterul A1 fizic și A2 fizic cu noile date.
- `src/pages/courses/CursGrupLevel.tsx`: updatează alt textul pentru posterul A1 fizic și A2 fizic cu noile date.
- A1 online rămâne cu alt textul existent (15 august 2026).

### 5. Verificare
- Accesează homepage și confirmă că `ActiveCoursesBanner` afișează:
  - A1 fizic: start 1 septembrie 2026
  - A1 online: start 15 august 2026
  - A2 fizic: start 2 septembrie 2026
- Accesează `/cursuri/grup/a1` și `/cursuri/grup/a2` și confirmă că programul, datele și alt textul posterelor sunt corecte.
- Verifică build-ul fără erori.

## Nu se publică frontend
Conform instrucțiunilor anterioare, nu se face publish la final — doar se actualizează codul și backend-ul.
