# Plan: Actualizează backlink-urile din Semrush

## Context

Conexiunea Semrush există în workspace (`Ibrahim's Semrush`) dar nu este încă legată de proiect. Funcția edge `backlink-snapshot` are nevoie de variabila `SEMRUSH_API_KEY` pentru a apela gateway-ul Semrush și a importa date live.

## Steps

1. **Link Semrush la proiect**
   - Folosește `standard_connectors--connect` cu `connector_id: "semrush"` pentru a lega conexiunea existentă de proiect.
   - Aceasta injectează `SEMRUSH_API_KEY` și `LOVABLE_API_KEY` în environment.

2. **Verifică secretele**
   - Confirmă că `SEMRUSH_API_KEY` apare în lista de secrete după link.

3. **Reîmprospătează snapshot-ul live**
   - Apelează funcția edge `backlink-snapshot` cu `action: "fetch_live"` pentru domeniul `centruldearabalibaneza.com`.
   - Funcția va cere Semrush Backlinks Overview prin gateway și va upserta un rând în `public.backlink_snapshots`.

4. **Validează rezultatul**
   - Verifică că rândul nou a fost scris în `backlink_snapshots`.
   - Verifică în admin dashboard (tab-ul SEO) că metricile și graficul s-au actualizat.

5. **Raportează datele**
   - Afișează utilizatorului scorul de autoritate, trust score, numărul de backlink-uri și domenii referitoare extrase din Semrush.

## Note

- Funcția edge este deja deployată; nu este nevoie de modificări de cod.
- Dacă Semrush returnează eroare de cotă, se va afișa mesajul corespunzător și se va propune importul manual CSV ca fallback.
