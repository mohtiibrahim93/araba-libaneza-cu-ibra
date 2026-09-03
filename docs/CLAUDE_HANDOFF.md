# Handoff tehnic — Claude Code

Proiect: centruldearabalibaneza.com (Vite + React 18 + TS + Tailwind, backend
Lovable Cloud / Supabase). Referințe: `docs/SEO_AUDIT.md`,
`docs/SEO_ACTION_PLAN.md`.

---

## 1. Ce a fost analizat

- Export GSC `...Performance-on-Search-2026-09-01.xlsx` (date reale
  2026-06-11 → 2026-08-22, filtru Web): sheet-uri Interogări, Pagini, Țări,
  Dispozitive, Diagramă.
- Export GA4 `Pages_and_screens_Page_title_and_screen_class.xlsx`
  (2026-01-01 → 2026-09-01) plus ~20 rapoarte PDF GA4 (landing pages,
  achiziție trafic, evenimente, demografie, tehnologie, generate leads).
- Cod existent: `src/lib/tracking.ts`, paginile SEO din `src/pages/seo/`,
  rutarea din `src/App.tsx`.

Cifrele-cheie sunt în `docs/SEO_AUDIT.md`, secțiunile 2 și 3.

## 2. Ce a fost implementat deja

| Fișier | Modificare | Motiv |
|---|---|---|
| `src/lib/tracking.ts` | eveniment `email_click` pentru `mailto:`; eveniment `cta_click` pentru link-uri interne spre `/trial`, `/inscriere`, `/checkout`, `/booking`, cu parametrul `cta_target` | GA4 nu avea deloc evenimente de contact/CTA în raportul Events; delegare la un singur listener global, fără atingerea componentelor |
| `src/pages/seo/CursuriArabaBucuresti.tsx` | title + description rescrise (an, adresă, preț, probă gratuită) | 85 afișări, CTR 2,35%, poziție 40 |
| `src/pages/seo/CursuriArabaAdolescenti.tsx` | title + description aliniate la interogarea reală „cursuri adolescenti araba” | 466 afișări, 0 clicuri |
| `src/pages/seo/MeditatiiAraba.tsx` | title cu preț și „probă gratuită” | 473 afișări pe „meditatii araba”, 0 clicuri |
| `src/pages/seo/Resurse.tsx` | title mai explicit + secțiune nouă cu linking intern spre `/cursuri-araba`, `/cursuri-araba-bucuresti`, `/meditatii-araba` | pagina rankează poz. 6,6; transferă autoritate spre paginile comerciale |
| `src/pages/seo/CeArabaSaInveti.tsx` | title cu an | poz. 5,2, CTR 10% — potențial de creștere |

Decizie: nu s-au rescris integral paginile comerciale în această etapă.
Modificările de metadata sunt reversibile și măsurabile independent; rescrierea
de conținut este task separat (secțiunea 3), ca să se poată atribui efectul.

## 3. Sarcini rămase, executabile

### T1 — Rescrierea paginii pentru adolescenți (P1, prioritate maximă)
- Fișier: `src/pages/seo/CursuriArabaAdolescenti.tsx`
- Context: 466 afișări, 0 clicuri, poziție 33,5; GA4 arată 5 sesiuni cu 4s
  engagement pe `/cursuri/tineri` (redirect spre această pagină).
- Pași:
  1. Prima secțiune (above the fold) răspunde direct: vârstă, format, preț,
     unde, cum se începe.
  2. Secțiune „Pentru părinți”: orar, grupă, siguranță, comunicare.
  3. Secțiune „Pentru adolescenți”: ce vorbesc după 4 săptămâni, exemple.
  4. FAQ extins cu întrebările din interogările GSC pe adolescenți.
  5. CTA `/trial` sus și jos.
- Acceptare: pagina conține H1 unic, minim 900 cuvinte, JSON-LD `Course` valid,
  linkuri interne spre `/cursuri-araba-bucuresti` și `/trial`.

### T2 — Canibalizare homepage vs `/cursuri-araba` (P1)
- Fișiere: `src/pages/Index.tsx` (sau componentele de secțiune),
  `src/pages/seo/CursuriAraba.tsx`
- Pași:
  1. Homepage: rol de brand + prezentare formate; nu mai țintește exact
     „cursuri arabă” în H1/title.
  2. `/cursuri-araba`: rol de pagină comercială principală pentru interogarea
     generică; link contextual din homepage cu ancoră „cursuri de arabă”.
  3. Verifică `<link rel="canonical">` pe ambele (fără cross-canonical).
- Acceptare: title/H1 distincte, un singur link intern principal spre
  `/cursuri-araba` din homepage, canonical self-referential pe ambele.

### T3 — `/cursuri/grup` (P1)
- Fișier: pagina de grup din `src/pages/`
- Context: 449 afișări, CTR 0,22%, poziție 31,9.
- Pași: title și primul paragraf reformulate pe intenția „curs de arabă în
  grupă”, tabel vizibil cu niveluri, date de start și preț.
- Acceptare: title ≤ 60 caractere, description ≤ 155, primul paragraf
  răspunde la preț + start + format.

### T4 — CTA în blogurile care rankează (P2)
- Fișiere: conținutul blogului `alfabetul-arab-pentru-incepatori` și celelalte
  articole din top 10.
- Pași: bloc CTA la finalul articolului spre `/trial` și spre pagina de curs
  relevantă.
- Acceptare: fiecare articol din top 10 GSC are minim un CTA intern.

### T5 — Reducerea abandonului formularelor (P3)
- Context GA4: 27 `form_start` → 14 `Lead` (~48% abandon).
- Fișiere: `src/components/RegistrationFormSection.tsx`, `src/pages/Trial.tsx`
- Pași: reducere câmpuri obligatorii la minim, validare inline, mesaje de
  eroare vizibile pe mobil, buton cu stare de încărcare.
- Acceptare: formularele se completează pe un viewport de 390px fără scroll
  orizontal; fiecare eroare are text vizibil lângă câmp.

### T6 — Verificarea consimțământului (P0, depinde de client)
- Dacă rata de acceptare AdOpt este mică, tot GA4-ul subraportează.
- Pași: măsoară acceptările, apoi decide dacă bannerul se ajustează.

## 4. Ce trebuie făcut în interfața Google (nu se poate din cod)

1. GA4 → Admin → Events → marchează ca **key events**: `generate_lead`,
   `trial_booking_complete`, `paid_booking_complete`. Opțional `cta_click`.
2. GA4 → Admin → Product links → leagă Search Console de proprietate.
3. GSC → verifică raportul Pagini indexate pentru rutele noi.

Până la pasul 1, orice raport de conversie GA4 va arăta 0.

## 5. Comenzi de test

```bash
bun run build          # build de producție, include verificările de prerender/hreflang
bunx tsgo --noEmit     # typecheck
bunx vitest run        # teste, dacă există
```

Verificări manuale după build:
- rutele modificate răspund 200;
- `public/sitemap.xml` conține rutele atinse;
- JSON-LD validat pe paginile modificate;
- CTA-urile trimit `cta_click` (DebugView în GA4).

## 6. Riscuri și dependențe

- **Risc:** rescrierea homepage-ului (T2) poate scădea temporar pozițiile
  homepage-ului înainte ca `/cursuri-araba` să urce. Publică T2 separat de
  restul, ca să fie atribuibil.
- **Risc:** `cta_click` poate genera volum mare de evenimente; nu-l marca drept
  key event dacă nu e nevoie.
- **Dependență:** fără marcarea key events în GA4, T5 nu poate fi validat
  cantitativ.
- **Limitare de date:** nu există istoric GSC înainte de iunie 2026, deci nu se
  poate compara an-la-an în următoarele 12 luni.

## 7. De verificat după publicare

- [ ] Toate rutele modificate răspund 200 în producție.
- [ ] Title/description noi apar în sursa HTML servită.
- [ ] GA4 DebugView primește `email_click` și `cta_click`.
- [ ] Sitemap-ul retrimis în Search Console.

## 8. KPI de comparat la 14 / 30 / 60 de zile

| KPI | Sursă | Baseline |
|---|---|---|
| Clicuri organice | GSC | 34 (10 săptămâni) |
| CTR mediu | GSC | ~1,1% |
| Poziție medie | GSC | ~26 |
| Poziție „cursuri araba bucuresti” | GSC | 16,93 |
| Poziție „meditatii araba bucuresti” | GSC | 14,91 |
| Poziție „cursuri adolescenti araba” | GSC | 33,52 |
| CTR `/meditatii-araba` | GSC | 0,91% |
| CTR `/cursuri/grup` | GSC | 0,22% |
| Sesiuni Organic Search | GA4 | 50 |
| Evenimente `Lead` | GA4 | 14 |
| `form_start` | GA4 | 27 |
| Key events | GA4 | 0 (de activat) |

Folosește ferestre complete de aceeași durată; nu compara o perioadă
incompletă cu una completă.
