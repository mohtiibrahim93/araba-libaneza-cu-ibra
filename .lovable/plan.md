# Eliminare tab „Texte site" din admin

Scop: Adminul are acum prea multe tab-uri, iar „Texte site" (editorul pentru dicționarul RO/EN) este prea încărcat. Vom elimina doar acest tab, fără să afectăm editorul de Pagini, Blog, Resurse sau restul funcționalităților.

## Ce se schimbă

- În `src/pages/Admin.tsx`:
  - Se șterge importul `SiteTextsAdmin`.
  - Se șterge importul iconiței `Pencil` dacă nu mai e folosită în alt tab.
  - Se șterge `<TabsTrigger value="texts">` (butonul „Texte site").
  - Se șterge `<TabsContent value="texts">` cu `<SiteTextsAdmin />`.

## Ce NU se schimbă

- Tab-urile rămase: Panou general, Înscrieri, Programări, Grupe, Blog, Resurse, Pagini, SEO, Setări.
- Editorul de pagini (`PagesAdmin`) rămâne activ — poți corecta în continuare paginile SEO/landing.
- Hook-ul `useSiteTexts` și tabela `site_texts` rămân în cod/backend; funcționalitatea e doar ascunsă din UI, nu ștearsă. Dacă dorești ulterior eliminarea completă (tabelă, edge-function actions, hook), se face într-un pas separat.
- Fix-ul pentru PDF-uri din admin rămâne valabil.

## Verificare

- După modificare, `/admin` se încarcă fără eroare și fără tab-ul „Texte site".
- Tab-ul „Pagini" continuă să funcționeze pentru editare conținut.
