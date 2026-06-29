## Restaurez pagina /cursuri la varianta corectă

Am înțeles greșit: ai vrut ca `/cursuri` să rămână landing-ul cu cele 3 carduri de audiență (Adulți / Tineri / Copii) + secțiunea „Nu știi nivelul?", NU să fie înlocuit cu `ProgramsSection`. Mențin doar schimbarea bună din ultima rundă (back-link pe sub-pagini + navbar fără dropdown).

### Modificări în `src/pages/courses/Cursuri.tsx`

Scot `ProgramsSection` și revin la structura originală sub hero:

1. **Hero** (rămâne): breadcrumb + badge + H1 `cursuriH1` + intro `cursuriIntro`.
2. **Grilă cu 3 carduri audiență** (restaurat):
   - Adulți 18+ → `/cursuri/adulti` (icon GraduationCap)
   - Tineri 11–17 → `/cursuri/tineri` (icon User) — badge „În pregătire"
   - Copii 6–10 → `/cursuri/copii` (icon Baby)
   - Stil identic cu cardurile din `CursGrup` (border, hover primary, ChevronRight).
3. **Secțiune „Nu știi nivelul?"** (restaurat din `CursGrup`):
   - 3 opțiuni: Quiz (`/quiz`), Trial (`/trial`), WhatsApp (`wa.me/40763124514`).
   - Folosesc cheile i18n existente: `dontKnowLevelTitle`, `dontKnowLevelDesc`, `dontKnowOptQuiz*`, `dontKnowOptTest*`, `dontKnowOptWhatsApp*`.

### Ce NU schimb

- Navbar (rămâne link simplu „Cursuri", fără dropdown — corect).
- `CourseLayout` cu back-link „← Înapoi la cursuri" pe sub-pagini (corect).
- Sub-paginile `/cursuri/adulti`, `/tineri`, `/copii`, `/grup`, `/private`, `/online` rămân neatinse.
- `ProgramsSection` rămâne folosit doar pe homepage (`Index.tsx`).

### Detalii tehnice

- Folosesc cheile i18n deja existente (verific în `i18n.tsx` înainte de a adăuga; dacă lipsesc `cursuriAudAdultiTitle/Desc`, `cursuriAudTineriTitle/Desc`, `cursuriAudCopiiTitle/Desc`, le adaug RO+EN).
- Fără modificări de stiluri/tokens.
