# Prioritatea 1 — Clusterul Arabizi

Obiectiv: interceptăm căutările despre „araba scrisă cu cifre / litere latine” și frica de alfabetul arab, apoi convertim în lecție de probă printr-un cheat-sheet Arabizi trimis pe email.

Runda asta acoperă doar Prioritatea 1. Prioritățile 2–13 rămân pentru runde ulterioare.

## Ce construim

### 1. Pagina-ancoră: Ghid complet Arabizi
Rută nouă `/arabizi` (landing SEO, nu articol de blog), în română.
- Tabel complet de decodare: 2, 3, 5, 6, 7, 8, 9 + literele arabe corespunzătoare, sunetul explicat pentru un vorbitor de română, exemplu real.
- Secțiune „cum se citește un mesaj real” — exemple din WhatsApp/TikTok, decodate cuvânt cu cuvânt.
- Secțiune „de ce scriu arabii cu cifre” (tastatură, istoric SMS).
- Secțiune „cum scrii arabă pe telefon” (tastatură arabă vs. arabizi).
- FAQ cu întrebările reale: ce înseamnă arabizi, ce înseamnă 3 / 7 / 5 / 2 în arabă, ce e arabish / franco-arabe, ce e transliterarea.
- Blocul de cheat-sheet (punctul 4) plasat sus, imediat după tabel.
- Articolul existent `/blog/ce-este-arabizi` rămâne, dar devine varianta scurtă: îl scurtăm ușor și îl legăm către `/arabizi` ca ghid complet (fără canonical încrucișat, conținutul se diferențiază).

### 2. Pagina de metodă: „Nu ai nevoie de alfabetul arab ca să începi să vorbești”
Rută nouă `/fara-alfabet-arab`.
- Țintește căutările de barieră: e greu de învățat araba, pot învăța araba fără alfabet, învăț araba doar vorbit, araba conversațională, cât durează să înveți alfabetul arab.
- Structura: ce e greu de fapt la arabă (și ce nu), cum arată metoda Oral First pe lecții, ce înveți în primele 4 săptămâni fără nicio literă arabă, când introducem alfabetul.
- FAQ + CTA către proba gratuită și test de nivel.

### 3. Contrapartea onestă: „Alfabetul arab: când chiar ai nevoie de el”
Extindem pagina existentă `/blog/alfabetul-arab-pentru-incepatori` în loc să creăm duplicat.
- Adăugăm secțiunea „când ai nevoie de alfabet și când nu”, cât durează realist, cum se predă la cerere la noi.
- Linkuri reciproce cu `/arabizi` și `/fara-alfabet-arab`.

### 4. Cheat-sheet Arabizi (lead magnet, email → PDF)
- Bloc de formular reutilizabil: prenume + email + consimțământ GDPR (folosim componenta de checkbox existentă).
- La submit: lead-ul se salvează în backend, apoi se trimite un email cu PDF-ul.
- Emailul folosește infrastructura tranzacțională existentă (același domeniu și aceeași coadă de trimitere ca la înscrieri), cu un template nou.
- PDF-ul: o pagină cu tabelul de cifre, 20 de expresii esențiale în arabizi cu traducere, și link către proba gratuită. Generat o dată și servit ca fișier static.
- După submit, pe pagină apare confirmarea + CTA secundar către `/trial`.

### 5. Legături interne și indexare
- Link din `/blog/primele-20-de-expresii-libaneze`, `/blog/cum-inveti-araba-libaneza`, `/cursuri-limba-araba` și `/araba-pentru-incepatori` către `/arabizi`.
- Ambele rute noi adăugate în `public/sitemap.xml` și în lista de prerender SEO.

## Detalii tehnice

- Rute noi în `src/App.tsx`: `/arabizi`, `/fara-alfabet-arab`; ambele folosesc `src/components/seo/LandingLayout.tsx` (meta, canonical, Course + BreadcrumbList + FAQPage JSON-LD sunt deja acolo).
- Pe `/arabizi` adăugăm și un `HowTo`/`FAQPage` JSON-LD pentru tabelul de decodare, prin props-ul `faq` existent.
- Metadata pentru cele două rute intră și în `scripts/seoPrerender.ts`, plus intrări în `public/sitemap.xml`.
- Lead magnet: tabelă nouă `public.resource_leads` (email, name, resource, consent, source, created_at) cu RLS — insert permis anon, select doar pentru service_role/admin; GRANT-uri explicite. Edge function nouă `resource-download` validează inputul, face insert și pune în coadă emailul; template nou în `supabase/functions/_shared/transactional-email-templates/`.
- PDF: generat local ca fișier static în `public/` și livrat prin link în email (fără atașament, ca să nu declanșăm filtre de spam).
- Componentă nouă `src/components/ArabizisCheatSheetForm.tsx`, reutilizabilă pe ambele pagini noi.
- Conținut doar în română — aceste căutări sunt românești; `enHref` rămâne pe pagina generală în engleză.

## Verificare
- Typecheck și testele existente.
- Deschidem `/arabizi` și `/fara-alfabet-arab` în preview și confirmăm tabelul, FAQ-ul și formularul.
- Test de submit al formularului cu o adresă de test și confirmarea că lead-ul apare în backend.
