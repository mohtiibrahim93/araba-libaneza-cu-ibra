## Șterg pagina `/cursuri/online` și redirec­ționez la `/cursuri`

Pagina e redundantă — chiar ea spune "nu există o pagină separată online", iar selecția online/fizic se face deja în formularul de înscriere și în tabs-urile de pe `/cursuri`.

### Modificări

1. **`src/App.tsx`** — înlocuiesc ruta `/cursuri/online` cu un redirect 301-style (client-side):
   ```tsx
   <Route path="/cursuri/online" element={<Navigate to="/cursuri" replace />} />
   ```
   Scot lazy import-ul `CursOnline`.

2. **Șterg fișierul** `src/pages/courses/CursOnline.tsx`.

3. **Scot link-urile către `/cursuri/online`** din:
   - `src/components/Footer.tsx` (linia 38)
   - `src/pages/courses/CursCopii.tsx` (other courses, linia 42)
   - `src/pages/courses/CursGrup.tsx` (linia 48)
   - `src/pages/courses/CursPrivate.tsx` (linia 43)

4. **`public/sitemap.xml`** — elimin entry-ul `/cursuri/online`.

5. **Cleanup i18n** — marchez ca nefolosite (sau le șterg) cheile `courseOnline*` din `src/lib/i18n.tsx` (RO și EN). Le șterg complet ca să nu rămână cod mort.

### Ce NU schimb

- Tab-urile de pe home + `/cursuri` rămân exact așa.
- Nicio modificare la stiluri, formulare, sau alte pagini de curs.
- Pe `/cursuri/grup`, `/cursuri/private`, `/cursuri/copii` rămâne mențiunea "disponibil și online" (vine din feature-bullets existente, nu e legată de pagina ștearsă).