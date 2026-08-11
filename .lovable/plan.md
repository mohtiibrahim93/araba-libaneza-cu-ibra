# Verificare cheie Open PageRank și refresh automat backlink-uri

## Context
Cheia Open PageRank actuală returnează `403 Invalid API key` în logurile funcției `backlink-snapshot`. Utilizatorul va reintroduce o cheie nouă și dorește verificarea imediată după.

## Pași
1. Aștept reintroducerea cheii `OPEN_PAGERANK_API_KEY` în secretele proiectului.
2. Testez funcția `backlink-snapshot` cu acțiunea `fetch_free` pentru domeniul țintă.
3. Verific autentificarea cron (`BACKLINK_CRON_SECRET_V2`) printr-un apel simulat cu header-ul `x-cron-secret`.
4. Dacă Open PageRank răspunde cu date valide, confirm că job-ul programat (`backlink-snapshot-weekly`, luni 04:00) va popula tabela `public.backlink_snapshots` automat.
5. Dacă apare altă eroare (403, 429, timeout), raportez codul exact și propun următorul pas.

## Rezultat așteptat
Funcția `backlink-snapshot` returnează un rând nou în `public.backlink_snapshots` cu scorul de autoritate și sursa `openpagerank`, iar cron-ul este funcțional.
