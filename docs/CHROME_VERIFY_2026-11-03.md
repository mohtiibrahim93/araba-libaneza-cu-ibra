# Claude in Chrome — verification pass, 3 Nov 2026

Verify on the live site, https://centruldearabalibaneza.com, what was changed on 2–3 Nov 2026. Do not change anything. Report each check as PASS / FAIL / COULD NOT CHECK, with what you saw and a screenshot for every FAIL.

Rules:
- Use a fresh private window, or hard-refresh (Ctrl/Cmd+Shift+R) before each section.
- Do not submit any form with real personal data. Do not pay, and do not enter card details.
- Where a step says "stop before submitting", stop there.
- For admin checks, the owner signs you in at /admin. Look, don't click destructive buttons (Șterge, Anulează lecția, Încasează).
- Test on desktop (about 1280 px wide) and on mobile (about 390 px wide) where it says so.

## A. Public site, Romanian

1. **Homepage `/` (mobile)**
   - The phone mock-up chat says "yalla, I'm in" (with the apostrophe).
   - The red "Înscrie-te rapid" bar shows at the bottom while you are above the course cards.
   - It disappears while the "Alege-ți calea de învățare" cards are on screen.
   - The round assistant button (bottom left) sits above the bar, not under it.
2. **Top green band (desktop)**
   - It reads "Următorul curs: A1 online, în română · 7 nov · 4 locuri libere →" (seat number as live).
   - The gold text is readable.
   - The WhatsApp pill is a darker green, with white text that is easy to read.
3. **`/cursuri/grup`**
   - The section "Grupe care se formează acum" lists A1 online in Romanian (7 Nov, "4 din 6 locuri libere") and A1 online in English (21 Nov).
   - "Detalii grupă →" opens a group page.
4. **Homepage, the "active courses" banner** (if shown): seats read "X din 6 locuri libere", not "0 / 6 ocupate".
5. **`/cursuri/grup/a1`**
   - Above the poster there is a label "Vezi afișul grupei pentru:" before the Fizic / Online toggle.
   - In the sign-up form, the group card does not repeat the start date inside the schedule line.
   - The plan box shows "1.700 LEI" for paying in full. Stop before submitting.
6. **`/preturi`**
   - The free-trial card says the place is confirmed with a card and that 150 lei is charged for a no-show or a cancellation less than 24 h before.
   - The table's last column header is empty on screen, but a screen reader announces "Înscriere".
7. **`/quiz`**
   - The intro says about 30 seconds and three questions, not "sub două minute".
   - Answer the 3 questions (no personal data needed). On the result, open "Compară toate opțiunile" on desktop. The table must have 4 aligned columns (label, Grup, Privat, Copii), with each value under the right course.
   - The seat badge counts only the Romanian groups ("4 locuri online"), not 10.
8. **`/cursuri`**: the card "Test cu profesorul (gratuit)" opens `/verificare-nivel`, not `/trial`.
9. **`/trial`**
   - While times load, the text says Ibra's calendar is being checked.
   - Pick any time, then switch the format to "Fizic". If that time is less than 24 h away, the message must say the time cannot be booked at the centre (24 h notice), not "slot just taken". Stop before submitting.
10. **`/test-de-nivel`**, signed out: the "Nu ai nevoie de cont…" line is there. Signed in (if possible): that line is gone.
11. **`/blog` page 2** (`/blog?page=2`): the browser tab title ends with "— Pagina 2".
12. **Homepage**: "Vezi toate resursele" opens `/resurse`.
13. **Not found**: `/cursuri/curs/nu-exista` and `/en/blog/nu-exista` show the not-found page. In DevTools › Network the document status is **404**.

## B. Language

1. Open `/en`, then type `/` in the address bar. The Romanian homepage must be fully Romanian, and `<html lang="ro">` in DevTools.
2. **`/en` top band**: "Next course: A1 online, taught in English · 21 Nov · 6 seats free →". It links to `/en/courses/group/a1?…`.
3. **`/en` header**: Contact, Testimonials and FAQ links point to `/en#…`, not `/#…` (hover to see the address).
4. **`/en/faq`** has the same number of questions as `/intrebari-frecvente`, which is 45.
5. **`/en/courses/group/a1`** shows prices as "1,700" (English format), not "1.700".
6. **`/en/arabic-tutor`** does not say "0% off". It says 15% off a package of 20 lessons.
7. **`/en/prices`** opens the price page in English.
8. **Links on English pages** (`/en`, `/en/quiz`, `/en/courses/group`): hover several course, trial and quiz links. They should point to `/en/...` where an English page exists.
9. **Checkout in English**: with the site in English (switch from /en), open `/checkout?courseType=group&registrationId=00000000-0000-0000-0000-000000000000`. The page should be in English ("Complete your payment", "Back"). It will not find a registration; that is expected. Do not enter an email.

## C. Payment links, no personal data

1. Anywhere you reach `/checkout` from the site: the address bar shows no `email=` or `name=`.
2. Open `/checkout?courseType=group&registrationId=00000000-0000-0000-0000-000000000000&email=test%40example.com&name=Test`. After it loads, the address bar no longer contains `email=` or `name=`.

## D. Cookies

1. In a fresh private window, accept all cookies. Check in DevTools › Application › Cookies that `_ga` cookies appear.
2. Footer › "Setări cookies" › "Doar esențiale". The `_ga…` cookies are gone (refresh the cookie list).

## E. Admin (owner signs you in), look only

1. **Sidebar** says "Arabă Libaneză cu Ibra".
2. **Grupe**
   - The first card is "Grupe în formare".
   - The group cards' explanation says a started unpaid payment holds a seat for at most 2 hours and then shows as "Expirat".
   - The 15 Aug A1 online card shows "din care 12 doar ca număr, fără un cursant anume" (or the live number).
3. **Înscrieri externe**
   - "Adaugă un cursant manual" is there.
   - The lower panel is "Numere vechi de locuri (fără nume)", with no add form, only a list with delete icons.
4. **Grupe › Cohorte**: the per-group number field is labelled "Ajustare locuri".
5. **Toate lecțiile › "Programează o lecție privată"**
   - The "Cursant existent" list includes "Madalina Benga — … · probă de pe site, fără oră aleasă".
   - Choosing her selects "Probă gratuită" and hides "Lecție în plus".
   - The 4 lesson types are there: Plătită, Probă gratuită, Recuperare, Bonus.
   - Do not confirm.
6. **Open a group student's sheet** (for example Andrada Borches):
   - The payment control button reads "Încasare cash / transfer / lună acordată". Opening it shows a "1 lună acordată (…) · fără plată" option.
   - There is a "Mută în altă grupă" button. Opening it lists groups. Press Renunță.
   - Do not save anything.
7. **Înscrieri**: tick one row. The selection bar floats at the bottom, the table does not move, and there is no "Forțează ștergerea (test)" button. Untick.
8. **Lecțiile grupelor**: lesson times are 24-hour (19:00, 18:30, never 07:00 for an evening lesson).
9. **Parcurs › trial funnel**: "booked" and "held" are no longer 0 while "converted" is 3.

## F. Mobile tap targets (390 px)

1. On the homepage, the top-band pill, WhatsApp and Programare, the level chips (A1–C2), "Programează o discuție" and "Toate grupele →" are easy to tap.

## G. Things that should NOT have changed

1. Prices everywhere are still 500/700 lei per month (group A1 online / in person), 150/210 lei per private lesson, and 1.700 lei for the A1 course paid in full.
2. The `/trial` booking still offers times (for example tomorrow online).
3. On `/cursuri/grup/a1`, the "Înscrie-te" form opens and the group card shows "4 locuri rămase" (or the live number).

Report as a table: section, check, PASS / FAIL / COULD NOT CHECK, note.
