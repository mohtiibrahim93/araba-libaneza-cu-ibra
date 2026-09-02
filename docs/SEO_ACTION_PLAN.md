# Plan de acțiune SEO / CRO — prioritizat

Bază: `docs/SEO_AUDIT.md` (date GSC 2026-06-11 → 2026-08-22, GA4
2026-01-01 → 2026-09-01).

Prioritizare după impact estimat / efort. Impactul este estimat, nu garantat.

---

## P0 — Măsurare (blocant pentru orice evaluare ulterioară)

| # | Acțiune | Impact | Efort | Unde |
|---|---|---|---|---|
| 0.1 | Marcarea `generate_lead`, `trial_booking_complete`, `paid_booking_complete` ca **key events** în GA4 | mare | mic | interfața GA4 (client) |
| 0.2 | Evenimente pentru click pe e-mail și pe CTA-urile interne spre funnel | mediu | mic | `src/lib/tracking.ts` — **implementat** |
| 0.3 | Legarea proprietății Search Console de GA4 | mediu | mic | interfața GA4 (client) |
| 0.4 | Verificarea consimțământului: câți vizitatori acceptă în AdOpt (Consent Mode) | mare | mic | GA4 + AdOpt (client) |

Fără 0.1 rata de conversie rămâne 0 în toate rapoartele, indiferent de trafic.

---

## P1 — Poziții pe termenii comerciali (afișări mari, poziție 15–40)

| # | Acțiune | Impact | Efort |
|---|---|---|---|
| 1.1 | `/meditatii-araba`: title/description orientate pe „meditații arabă București” + preț, extindere secțiune locală | mare | mediu |
| 1.2 | `/cursuri-araba-bucuresti`: title/description cu an, adresă și preț; consolidare semnal local | mare | mediu |
| 1.3 | Rezolvarea canibalizării `/` vs `/cursuri-araba`: roluri clare, linking intern descendent din homepage spre pagina comercială | mare | mediu |
| 1.4 | Pagina pentru adolescenți (466 afișări, 0 clicuri, 4s engagement): rescriere conținut pe intenția reală a interogării | mare | mare |
| 1.5 | `/cursuri/grup` (449 afișări, CTR 0,22%): titlu și introducere care răspund direct interogării „cursuri araba” | mediu | mediu |

Titlurile și descrierile de la 1.1, 1.2 și 1.4 sunt deja actualizate; restul
lucrărilor de conținut rămân în handoff.

---

## P2 — CTR pe paginile care deja rankează în top 10

| # | Acțiune | Impact | Efort |
|---|---|---|---|
| 2.1 | Titluri mai atractive pentru `/resurse` și `/ce-araba-sa-inveti` | mediu | mic |
| 2.2 | Linking intern din paginile informaționale spre paginile comerciale | mediu | mic |
| 2.3 | Blogul `alfabetul-arab-pentru-incepatori` (poz. 7,5): CTA spre lecția gratuită și spre cursuri | mediu | mic |

2.1 și 2.2 sunt implementate pentru `/resurse` și `/ce-araba-sa-inveti`.

---

## P3 — CRO (mobile-first: 1.730 din 3.012 afișări vin de pe mobil)

| # | Acțiune | Impact | Efort |
|---|---|---|---|
| 3.1 | CTA persistent spre lecția de probă pe paginile SEO cu trafic | mare | mediu |
| 3.2 | Reducerea fricțiunii formularelor pe mobil (27 `form_start` vs. 14 `Lead` = ~48% abandon) | mare | mediu |
| 3.3 | Diferențiere clară a canalului direct (48,6% din sesiuni, engagement 42%, 22s) — pagină de aterizare pentru campanii offline | mediu | mediu |

---

## KPI de urmărit după implementare

| KPI | Sursă | Baseline (perioada auditată) |
|---|---|---|
| Clicuri organice | GSC | 34 |
| CTR mediu | GSC | ~1,1% |
| Poziție medie | GSC | ~26 |
| Poziție „cursuri araba bucuresti” | GSC | 16,93 |
| Poziție „meditatii araba bucuresti” | GSC | 14,91 |
| Sesiuni Organic Search | GA4 | 50 |
| Key events | GA4 | 0 (nemăsurat) |
| Evenimente `Lead` | GA4 | 14 (8 utilizatori) |
| `form_start` → `Lead` | GA4 | 27 → 14 |

Compară la 14, 30 și 60 de zile de la publicare, folosind ferestre complete de
aceeași durată.
