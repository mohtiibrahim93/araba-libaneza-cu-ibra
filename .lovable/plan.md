# Secretul șters pentru job-ul de backlink

## Ce s-a întâmplat
`BACKLINK_CRON_SECRET` era folosit doar de funcția `backlink-snapshot` ca să recunoască apelurile automate programate (header `x-cron-secret`). Fără el:

- Nu există risc de securitate. Codul verifică `cronSecret && provided === cronSecret`, deci dacă secretul lipsește orice apel „de tip cron" este respins automat (fail-closed).
- Job-ul programat de luni 04:00 va primi 403 și nu va mai salva snapshot-uri automate.
- Accesul din admin (autentificat) și importul manual/CSV funcționează în continuare, neschimbate.

De reținut: oricum Semrush pe planul curent răspunde 400 la Backlinks API, deci refresh-ul live nu producea date noi încă.

## Opțiuni

**A. Repunem secretul (recomandat dacă vrei să păstrezi automatizarea)**
1. Generăm un secret nou aleatoriu și îl salvăm în backend.
2. Actualizăm job-ul programat săptămânal să trimită noul secret în header.
3. Test: apel manual al funcției cu header-ul nou — așteptăm autentificare reușită (nu 403).

**B. Renunțăm la automatizare**
1. Ștergem job-ul programat `backlink-snapshot-weekly`.
2. Scoatem ramura de autentificare cron din funcție, rămâne doar acces admin.
3. Actualizarea backlink-urilor rămâne manuală din tab-ul SEO.

## Detalii tehnice
- Fișier: `supabase/functions/backlink-snapshot/index.ts` (liniile ~74-79).
- Job: `cron.schedule('backlink-snapshot-weekly', ...)` cu `net.http_post` și headerul `x-cron-secret`; secretul trăiește în vault/secrets, se rescrie prin `insert` SQL (conține date specifice proiectului, nu migrare).
