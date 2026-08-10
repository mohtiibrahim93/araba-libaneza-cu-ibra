# Backlink-uri fără Semrush: sursă gratuită

## Situația reală

Verificat: Semrush și Google Search Console sunt ambele legate de proiect. Însă:

- Semrush pe plan gratuit respinge Backlinks API (400) — nu poate alimenta refresh-ul automat.
- API-ul Google Search Console **nu expune** raportul „Linkuri". GSC oferă doar performanță în căutare, sitemap-uri și inspecție URL. Deci nu există un endpoint GSC din care să tragem automat numărul de backlink-uri.

Concluzie: nu există o sursă complet gratuită și automată care să dea exact aceleași metrici ca Semrush (AS, Trust, follow/nofollow). Planul de mai jos combină ce se poate automatiza gratuit cu un import manual mult mai bun pentru restul.

## Ce construim

### 1. Sursă automată gratuită: Open PageRank
- API gratuit (cheie gratuită de la domcop.com/openpagerank), fără limită practică pentru un domeniu.
- Oferă un scor de autoritate a domeniului 0–10, convertit la scală 0–100 pentru a înlocui „Authority Score".
- Se apelează din funcția `backlink-snapshot` printr-o acțiune nouă, fără costuri.

### 2. Import gratuit din Google Search Console (linkuri)
- Raportul „Linkuri" din GSC se exportă în CSV (Top linking sites) — gratuit și complet pentru site-ul propriu.
- Extindem importatorul CSV existent din tabul SEO ca să recunoască formatul GSC: domenii referitoare + total linkuri, populând automat `referring_domains` și `backlinks_total`, plus lista de top domenii referitoare.

### 3. Snapshot hibrid
- Un snapshot combină: autoritate din Open PageRank (automat) + linkuri din GSC CSV (manual, la câteva săptămâni) + câmpuri manuale opționale (trust, follow/nofollow) rămase pentru cine are date Semrush.
- Fiecare valoare primește eticheta sursei (`auto` / `gsc_csv` / `manual`) ca să se vadă în tabel de unde vine.

### 4. Job programat
- Job-ul săptămânal existent (luni 04:00) trece de pe Semrush pe Open PageRank și nu mai eșuează.
- Semrush rămâne ca opțiune secundară: dacă planul devine plătit, butonul „Actualizează din Semrush" continuă să funcționeze neschimbat.

### 5. UI în tabul SEO
- Butonul principal devine „Actualizează automat (gratuit)"; cel Semrush rămâne secundar, cu mesaj clar când planul nu permite.
- Zonă de upload CSV cu previzualizare a valorilor detectate înainte de salvare.
- Badge de sursă pe fiecare metrică din carduri.

## Detalii tehnice

- `supabase/functions/backlink-snapshot/index.ts`: acțiune nouă `fetch_free` care apelează `https://openpagerank.com/api/v1.0/getPageRank` cu header `API-OPR`; secretul `OPEN_PAGERANK_API_KEY` se cere prin formularul securizat.
- Migrare: coloane noi `metric_sources jsonb` și `source text` pe `public.backlink_snapshots` (cu GRANT-uri și RLS ca acum).
- Job cron: rescriem `backlink-snapshot-weekly` să trimită `{"action":"fetch_free"}`; `BACKLINK_CRON_SECRET` rămâne pentru autentificare.
- `src/components/admin/BacklinksAdmin.tsx`: parser CSV pentru formatul GSC, butoane și badge-uri de sursă.

## De confirmat la implementare
Îți voi cere cheia gratuită Open PageRank (înregistrare rapidă, fără card) prin formularul securizat.
