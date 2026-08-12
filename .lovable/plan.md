# Deblocare refresh automat Open PageRank

## Ce am verificat acum
Am apelat funcția `backlink-snapshot` cu acțiunea `fetch_free`. Autentificarea noastră trece, dar Open PageRank răspunde în continuare:

```text
403 {"status":false,"error":"Invalid API key "}
```

Deci cheia salvată în proiect nu este acceptată de ei, chiar dacă în contul tău apare activă. Cele mai probabile cauze: funcția rulează încă cu valoarea veche a secretului (env-ul se împrospătează la redeploy) sau valoarea salvată conține un caracter în plus/lipsă față de cea din cont.

## Pași propuși (necesită modul build)

1. **Redeploy `backlink-snapshot`** ca funcția să citească valoarea nouă a secretului `OPEN_PAGERANK_API_KEY`, apoi retestez imediat `fetch_free`.
2. **Dacă tot 403** — adaug temporar în funcție un diagnostic sigur, care loghează doar *lungimea* cheii și dacă are spații/ghilimele la capete (niciodată valoarea). Asta arată clar dacă s-a salvat trunchiat sau cu caractere în plus.
3. **Curățare defensivă a cheii** în cod: eliminarea ghilimelelor și a caracterelor invizibile (`\n`, `\r`, spații) înainte de a fi trimisă în header-ul `API-OPR`, ca o copiere imperfectă să nu mai strice apelul.
4. **Dacă diagnosticul arată o cheie validă ca format, dar tot respinsă** — înseamnă că problema e la contul domcop: îți cer să reintroduci cheia prin formularul securizat și retestez.
5. **La primul răspuns valid**: confirm că se scrie un rând nou în `backlink_snapshots` cu `source = open_pagerank`, apoi verific și autentificarea cron (`x-cron-secret`) ca job-ul de luni 04:00 să ruleze singur.

## Detalii tehnice
- Fișier: `supabase/functions/backlink-snapshot/index.ts`, acțiunea `fetch_free` (endpoint `https://openpagerank.com/api/v1.0/getPageRank`, header `API-OPR`).
- Diagnosticul de la pasul 2 se elimină după ce refresh-ul funcționează.
- Fără modificări de schemă și fără modificări în frontend.
