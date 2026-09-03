# SEO / AI SEO / CRO Audit — centruldearabalibaneza.com

Data auditului: 2026-09-01. Toate cifrele de mai jos sunt extrase direct din
fișierele încărcate de client. Nu s-au estimat sau extrapolat valori.

Legenda notațiilor: **[O]** = observație din date, **[I]** = interpretare,
**[R]** = recomandare.

---

## 1. Inventarul fișierelor

### 1.1 Google Search Console

| Fișier | Sursă | Interval | Filtre | Metrici | Limitări |
|---|---|---|---|---|---|
| `https_centruldearabalibaneza.com_-Performance-on-Search-2026-09-01.xlsx` | GSC, export „Performance on Search” | etichetat „ultimele 16 luni”; rânduri reale 2026-06-11 → 2026-08-22 (săptămânal) | Tip căutare: Web | clicuri, afișări, CTR, poziție medie; sheet-uri: Diagramă, Interogări, Pagini, Țări, Dispozitive, Aspect în căutare, Filtre | fără dimensiune dată × pagină; interogările sub prag de confidențialitate lipsesc; nu există date înainte de iunie 2026 |

### 1.2 Google Analytics 4 (proprietatea „Centruldearabalibaneza.com / Vizualizare”)

| Fișier | Tip | Interval | Filtre | Metrici | Limitări |
|---|---|---|---|---|---|
| `Pages_and_screens_Page_title_and_screen_class.xlsx` | Excel (cel mai recent) | 2026-01-01 → 2026-09-01 | niciunul | views, active users, views/user, engagement time, event count, key events, revenue | agregat pe titlu de pagină, nu pe URL |
| `Pages_and_screens_Page_path_and_screen_class.pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | idem, pe path | top-N trunchiat |
| `Landing_page_Landing_page.pdf` (+ `_1`, `_2`, `_3`) | PDF | 2026-01-01 → 2026-09-01 | niciunul | sessions, active/new users, engagement/sesiune, key events | paginat, top 10 per fișier |
| `Traffic_acquisition_...Default_Channel_Group.pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | sesiuni pe canal, engagement rate, event count | — |
| `User_acquisition_...pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | utilizatori noi pe canal | — |
| `Events.pdf` | PDF | 2026-01-01 → 2026-09-01 | **filtrat**: comparație „All Users”, listă evenimente | event count, total users | **nu** se compară direct cu rapoartele filtrate pe România |
| `Generate_leads_overview.pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | utilizatori noi/reveniți, qualified leads, key events | „qualified leads” depinde de configurarea key events |
| `Demographic_details_City/Country/Language.pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | utilizatori pe oraș/țară | — |
| `Tech_details_Platform.pdf` | PDF | 2026-01-01 → 2026-09-01 | niciunul | platformă | 100% web |
| Restul PDF-urilor (snapshot, retention, audiences) | PDF | 2026-01-01 → 2026-09-01 | variabile | rezumate | redundante față de cele de mai sus |

**Diferență importantă între rapoarte:** unele rapoarte GA4 au filtre aplicate
(ex. filtrare pe eveniment sau pe țară). Metricile lor nu se însumează cu cele
din rapoartele nefiltrate. GSC și GA4 nu se compară direct: GSC măsoară afișări
și clicuri în rezultatele Google; GA4 măsoară sesiuni după consimțământ.

### 1.3 Perioada comună de analiză

GSC are date 2026-06-11 → 2026-08-22. GA4 are date 2026-01-01 → 2026-09-01.
**Intervalul comun este 2026-06-11 → 2026-08-22.** Comparațiile SEO folosesc
doar săptămâni complete GSC. Comparația an-la-an **nu este posibilă**
(proprietatea nu are date din 2025).

---

## 2. Search Console — rezultate

### 2.1 Total perioadă (2026-06-11 → 2026-08-22)

| Metrică | Valoare |
|---|---|
| Clicuri | 34 |
| Afișări | 3.012 |
| CTR | ~1,1% |
| Poziție medie | ~26 |

**[O]** Afișările cresc puternic în perioadă (de la ordinul zecilor pe
săptămână în iunie la sute pe săptămână în iulie–august), în timp ce clicurile
rămân 0–5 pe săptămână.
**[I]** Problema nu este indexarea sau lipsa vizibilității, ci **poziția medie
(20–40) pe termenii comerciali** și, secundar, CTR-ul.

### 2.2 Interogări cu potențial (extras)

| Interogare | Afișări | Clicuri | Poziție |
|---|---|---|---|
| meditatii araba | 473 | 0 | 25,44 |
| cursuri adolescenti araba | 466 | 0 | 33,52 |
| cursuri araba | 409 | 0 | 27,63 |
| cursuri limba araba | 130 | 0 | 37,69 |
| meditatii araba bucuresti | — | 0 | 14,91 |
| cursuri araba bucuresti | 57 | 1 | 16,93 |

**[O]** Toate interogările comerciale mari sunt în afara paginii 1.
**[O]** Cele două interogări locale („… bucuresti”) sunt cel mai aproape de
prima pagină (poz. 15–17).
**[R]** Prioritate: variantele locale, unde diferența până în top 10 este mică.

### 2.3 Pagini

| Pagină | Clicuri | Afișări | CTR | Poziție |
|---|---|---|---|---|
| `/` | 21 | 1.298 | 1,62% | 23,72 |
| `/cursuri/grup` | 1 | 449 | 0,22% | 31,91 |
| `/meditatii-araba` | 2 | 219 | 0,91% | 17,51 |
| `/blog/alfabetul-arab-pentru-incepatori` | 2 | 108 | 1,85% | 7,49 |
| `/cursuri-araba-bucuresti` | 2 | 85 | 2,35% | 40,40 |
| `/cursuri-araba` | 2 | 53 | 3,77% | 50,91 |
| `/ce-araba-sa-inveti` | 1 | 10 | 10% | 5,20 |
| `/resurse` | 1 | 8 | 12,5% | 6,62 |

**[O]** Homepage-ul acumulează majoritatea afișărilor pe termenii comerciali,
în timp ce paginile dedicate stau pe poziții 40–50.
**[I]** Semnal de canibalizare: Google alege homepage-ul în locul paginii
specifice pentru „cursuri araba”.
**[O]** Paginile informaționale (`/ce-araba-sa-inveti`, `/resurse`, blogul de
alfabet) rankează în top 10 și au CTR bun, dar volum mic.
**[R]** Folosește-le ca hub-uri de linking intern către paginile comerciale.

### 2.4 Țări și dispozitive

| Segment | Clicuri | Afișări | CTR | Poziție |
|---|---|---|---|---|
| România | 31 | 2.321 | 1,34% | 26,38 |
| Germania | 3 | 58 | 5,17% | 8,50 |
| Mobil | 25 | 1.730 | 1,45% | 25,74 |
| Desktop | 9 | 1.277 | 0,70% | 35,38 |
| Tabletă | 0 | 5 | 0% | 8,60 |

**[O]** Mobilul domină și performează mai bine decât desktopul.
**[R]** Orice optimizare de CTA și formulare se face mobile-first.

---

## 3. Google Analytics 4 — rezultate

### 3.1 Volume (2026-01-01 → 2026-09-01)

| Metrică | Valoare |
|---|---|
| Sesiuni | 214 |
| Utilizatori activi | 122 |
| Utilizatori noi | 119 |
| Utilizatori reveniți | 14 |
| Engagement rate | 54,21% |
| Timp mediu / sesiune | 50s |
| Event count total | 1.822 |
| Key events | **0** |
| Venit | 0 RON |

### 3.2 Canale (sesiuni)

| Canal | Sesiuni | Utilizatori noi | Engagement rate | Timp mediu |
|---|---|---|---|---|
| Direct | 104 (48,6%) | 44 | 42,31% | 22s |
| Organic Search | 50 (23,4%) | 37 | 74% | 1m 56s |
| Referral | 37 (17,3%) | 21 | 56,76% | 32s |
| Organic Social | 13 (6,1%) | 11 | 84,62% | 1m 13s |
| Unassigned | 9 (4,2%) | 0 | 0% | 41s |
| AI Assistant | 3 (1,4%) | 3 | 100% | 15s |
| Cross-network | 3 (1,4%) | 1 | 33,33% | 47s |

**[O]** Traficul organic are cel mai bun engagement dintre canalele cu volum
(74%, aproape 2 minute pe sesiune).
**[O]** Există deja trafic din asistenți AI (canalul „AI Assistant”, engagement
100%), volum mic dar prezent.
**[I]** SEO-ul aduce cei mai calificați vizitatori; problema este volumul, nu
calitatea.

### 3.3 Landing pages (top, după sesiuni)

| Landing page | Sesiuni | Utilizatori noi | Engagement/sesiune |
|---|---|---|---|
| `/` | 113 (52,8%) | 63 | 1m 05s |
| (not set) | 15 | 0 | 1s |
| `/cursuri/grup` | 10 | 6 | 1m 26s |
| `/cursuri` | 7 | 6 | 13s |
| `/admin` | 6 | 0 | 22s |
| `/cursuri/copii` | 5 | 4 | 16s |
| `/cursuri/tineri` | 5 | 4 | 4s |
| `/meditatii-araba` | 5 | 1 | 1m 50s |
| `/cursuri/grup/a1` | 4 | 3 | 1m 00s |
| `/cursuri/grup/a2` | 4 | 3 | 0s |

**[O]** `/meditatii-araba` are cel mai lung engagement dintre paginile de curs
(1m 50s) la doar 5 sesiuni.
**[O]** `/cursuri` și `/cursuri/tineri` au engagement foarte scurt (13s, 4s).
**[I]** Pagina pentru adolescenți primește 466 afișări în GSC dar aproape zero
trafic și engagement minim — conținutul nu convinge la aterizare.

### 3.4 Evenimente trimise (raport Events)

| Eveniment | Event count | Utilizatori |
|---|---|---|
| page_view | 759 | 120 |
| user_engagement | 468 | 117 |
| scroll | 211 | 88 |
| session_start | 209 | 119 |
| first_visit | 119 | 119 |
| form_start | 27 | 15 |
| **Lead** | **14** | **8** |
| PageView | 7 | 1 |
| click | 6 | 4 |

**[O]** Evenimentul `Lead` s-a declanșat de 14 ori, de la 8 utilizatori, dar
raportul „Generate leads” arată 0 qualified leads și 0 key events peste tot.
**[O]** În perioada raportată **nu apar** evenimentele `generate_lead`,
`whatsapp_click`, `phone_click`, `trial_booking_complete` sau
`paid_booking_complete`, deși codul din `src/lib/tracking.ts` le trimite.
**[I]** Două cauze plauzibile, ambele de verificat în interfața GA4: (a)
niciun eveniment nu este marcat ca *key event*, deci rapoartele de conversie
rămân la zero; (b) versiunea de tracking care trimite evenimentele mirror și
de contact a fost publicată recent, deci nu acoperă tot intervalul raportat.
**[R]** Marchează `generate_lead`, `trial_booking_complete` și
`paid_booking_complete` ca key events în GA4 și re-verifică peste 14 zile.
Fără asta nu există baseline CRO măsurabil.

### 3.5 Geografie și platformă

**[O]** București: 34 utilizatori activi, 58,88% engagement, 4m 02s timp mediu
— cel mai bun segment. Urmează (not set) 26, Viena 14, Soest 7, Roma 5,
Brașov 3, Paris 3, Voluntari 3, Cluj-Napoca 2.
**[O]** 100% din trafic este web (fără aplicație).
**[R]** Conținutul local pentru București are cel mai bun raport
efort/rezultat, atât în GSC (poz. 15–17) cât și în GA4 (engagement).

### 3.6 Rate de conversie

**[O]** Rata de conversie nu poate fi calculată din datele furnizate: GA4
raportează 0 key events pentru toate paginile.
**[I]** Nu înseamnă că nu au existat înscrieri — înseamnă că nu sunt măsurate
în GA4. Sursa de adevăr pentru înscrieri rămâne baza de date a aplicației.

---

## 4. Diagnostic principal

1. **Vizibilitate în creștere, poziții slabe.** 3.012 afișări în ~10 săptămâni,
   dar poziție medie 26 pe termenii comerciali principali. Traficul organic
   este limitat de poziție, nu de indexare.
2. **Măsurare ruptă.** GA4 nu are niciun key event configurat, deci nici
   funnel-ul, nici CRO-ul nu pot fi evaluate cantitativ.
3. **Canibalizare homepage vs. pagini comerciale.** Homepage-ul absoarbe
   afișările pentru „cursuri araba”, în timp ce `/cursuri-araba` stă la poz. 51.
4. **Oportunitate locală clară.** „meditatii araba bucuresti” (14,9) și
   „cursuri araba bucuresti” (16,9) sunt la un pas de pagina 1.
5. **Pagina pentru adolescenți irosește 466 afișări** cu 0 clicuri și 4s
   engagement.

---

## 5. Limitări explicite ale acestui audit

- Nu există date GSC înainte de 2026-06-11 → nicio comparație an-la-an.
- GSC nu permite, din acest export, segmentarea pagină × dată → nu se pot
  atribui cu certitudine creșteri/scăderi pe pagină în timp.
- Rapoartele GA4 cu filtre diferite nu au fost combinate.
- Numărul real de înscrieri nu poate fi dedus din GA4 în această perioadă.
