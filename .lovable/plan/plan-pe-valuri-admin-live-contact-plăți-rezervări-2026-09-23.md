# Plan pe valuri: admin live, contact, plăți, rezervări

Aplicăm pe rând, câte un val, cu verificare după fiecare. Fiecare pagină nouă e o pagină de sine stătătoare, cu propria adresă, propriul titlu de căutare și propria variantă în engleză (cerință a site-ului bilingv).

## Ce am verificat deja

- Baza de date răspunde din nou. Calendarul de probă **returnează sloturi reale** pentru lecția de probă (online și fizic), pe toate zilele — deci mesajul „Calendarul de programări va fi disponibil în curând" apare doar când baza de date nu răspunde, nu din lipsă de ore. Nu e nevoie să adăugăm sloturi; verificăm doar afișarea.
- Grupele cu start 15 august, 1 septembrie și 2 septembrie sunt marcate „în desfășurare", dar cardul de pe prima pagină scrie tot „Start 2 septembrie" lângă eticheta „în desfășurare". Asta e problema pe care ai semnalat-o.
- Plata prin Stripe există deja și funcționează (4 produse active); ce lipsește e legătura ei cu rezervările de lecții, care acum se termină pe WhatsApp.

## Valul 1 — Panou live în admin (începem aici)

- Tab nou în `/admin`: **Rezervări** — lista rezervărilor de probă și private, cu data, ora, formatul, numele, emailul, telefonul, starea (confirmată / anulată) și linkul de întâlnire.
- Filtre: viitoare / trecute / anulate, și căutare după nume sau email.
- Tab **Grupe** completat cu numărul real de înscriși pe fiecare grupă, locurile rămase și starea grupei.
- Se actualizează singur când apare o rezervare nouă (fără reîncărcare).

## Valul 2 — Pagina de contact

- Pagină nouă `/contact` (română) și `/en/contact` (engleză), în meniu și în footer.
- Formular: nume, email, telefon opțional, mesaj, bifă de consimțământ. Mesajul se salvează în baza de date și ajunge pe email la centru.
- Afișăm canalele existente: WhatsApp +40 763 124 514, email mohtiibrahim@gmail.com, centrul din București (aceleași date folosite deja pe site) și programul de răspuns.
- Protecție anti-spam pe formular (aceeași ca la înscrieri).

## Valul 3 — Corectări de date afișate

- Grupele deja începute arată „A început pe 2 septembrie" în loc de „Start 2 septembrie"; identic în engleză.
- Grupa A2 online rămasă în lucru („Program în curs de stabilire") nu apare public — confirmăm asta.
- Verificăm în browser că sloturile de probă apar pe `/trial` și că mesajul de indisponibilitate nu mai apare când baza de date răspunde.

## Valul 4 — Link real de plată la rezervări

- Lecțiile private plătite: după alegerea orei, vizitatorul primește un link de plată Stripe real (card, Google/Apple Pay), în locul redirecționării pe WhatsApp.
- Lecția de probă rămâne 0 lei, dar cere **salvarea cardului**: dacă nu se prezintă și nu anulează la timp, se încasează tariful unei lecții private normale.
- Regula de neprezentare se scrie explicit: la pasul de confirmare, pe `/trial` în secțiunea de reguli, și în emailul de confirmare — în ambele limbi.
- Anularea până la termenul stabilit nu costă nimic.

## Valul 5 — Pagina „Rezervările mele"

- Pagină nouă `/rezervari` (română) și `/en/my-bookings` (engleză).
- Vizitatorul scrie emailul; primește pe email un link privat, valabil limitat. Pagina nu arată nimic fără acel link — așa nimeni nu poate vedea rezervările altcuiva știindu-i emailul.
- Pe pagină: toate rezervările lui (dată, oră, tip, format, stare, link de întâlnire), cu buton de anulare și de reprogramare, plus mențiunea termenului de anulare.

## Detalii tehnice

- Rezervările: tabel nou pentru mesajele de contact (`contact_messages`) cu acces doar de scriere publică și citire din admin; link privat pentru „Rezervările mele" pe bază de token cu expirare, prin funcție de backend — `bookings.manage_token` rămâne pentru o singură rezervare.
- Plata: `create-checkout-session` primește un mod pentru rezervări (`mode: payment` la lecția privată, `mode: setup` la probă); `booking-create` leagă rezervarea de sesiunea Stripe; webhook-ul existent marchează plata.
- Rutele noi se înregistrează în `src/lib/languageRoutes.ts` și `src/lib/seoHead.ts` (altfel verificările de build cad), iar sitemap și llms.txt se regenerează.
- Nu atingem: `scripts/seoPrerender.ts`, `robots.txt`, cheia IndexNow, designul, prețurile, ID-ul GA4, redirecțiile 301.
- După fiecare val: `npx vitest run` (referință 493), verificare de tipuri și build.
