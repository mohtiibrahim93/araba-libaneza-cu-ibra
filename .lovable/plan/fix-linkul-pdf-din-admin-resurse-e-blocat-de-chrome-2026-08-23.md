# Fix: linkul PDF din Admin → Resurse e blocat de Chrome

## Ce se întâmplă
În panoul „Resurse gratuite" din `/admin`, linkul „PDF" e un `<a target="_blank">` către o cale relativă (ex. `/arabizi-cheat-sheet.pdf`). Panoul rulează în iframe-ul de preview, iar Chrome blochează deschiderea/descărcarea PDF-ului din iframe (pop-up/download blocat), așa că nu se întâmplă nimic sau apare avertismentul de blocare.

## Ce schimb

1. **Link absolut, deschis corect**
   - Transform calea relativă într-un URL absolut către site-ul public înainte de deschidere (căile care încep deja cu `http` rămân neschimbate).
   - Deschid cu `window.open(url, "_blank", "noopener,noreferrer")` dintr-un handler de click, ca browserul să trateze acțiunea ca fiind inițiată de utilizator; păstrez și `href` pentru click-dreapta / „Open in new tab".

2. **Buton „Copiază linkul"**
   - Lângă linkul PDF, un buton mic care copiază URL-ul absolut în clipboard, ca fallback dacă browserul tot blochează fereastra nouă (util și pentru trimiterea manuală a linkului).

3. **Aceeași tratare în editor**
   - După încărcarea unui PDF nou, câmpul „Link PDF" arată URL-ul returnat de storage; adaug lângă el aceeași previzualizare/deschidere sigură.

## Detalii tehnice
- Fișier atins: `src/components/admin/ResourcesAdmin.tsx` (doar UI, fără schimbări de backend sau de date).
- URL absolut: `new URL(file_url, window.location.origin).href` pentru fișierele din `public/`, iar în preview folosesc originea site-ului publicat ca bază, ca PDF-ul să se deschidă în afara iframe-ului.
- Fără modificări la edge function, la tabela `resources` sau la formularele publice.
