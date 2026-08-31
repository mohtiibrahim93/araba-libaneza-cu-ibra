# Înlocuire consentmanager.net cu Adopt + ce poți face cu Google Analytics

## Ce fac

### 1. Scot complet consentmanager.net
- Elimin scriptul de autoblocking din `index.html` (linia cu `cdn.consentmanager.net`).
- Actualizez comentariile din `src/lib/tracking.ts` care descriu CMP-ul vechi.
- Adaug un mic script de curățare care șterge, la prima încărcare, cookie-urile rămase de la vechiul CMP (prefixele `cmp`, ex. `cmpconsent`, `cmpcc`, `cmpvendors`) și cheile lui din localStorage — pe domeniul principal și pe `.centruldearabalibaneza.com`. Se rulează o singură dată per vizitator.

### 2. Instalez Adopt
- Pun snippet-ul Adopt în `<head>`, imediat înainte de tag-ul Google, ca să poată bloca/permite scripturile.
- Păstrez `gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' })` înainte de `gtag('config', ...)`, ca Adopt să poată ridica restricția prin Consent Mode când vizitatorul acceptă.
- Adaug un link „Setări cookies” în footer care redeschide bannerul Adopt.
- Actualizez secțiunea „Cookies” din pagina Privacy ca să numească Adopt drept platforma de consimțământ (RO + EN).

**Am nevoie de la tine:** snippet-ul de instalare din contul Adopt (sau ID-ul de proprietate/site). Fără el nu pot pune codul corect. Dacă mi-l dai, îl integrez direct; altfel las un punct clar de inserare și îl completăm într-un pas următor.

### 3. Verificare
- Verific în preview că nu mai există nicio cerere către `consentmanager.net`, că bannerul Adopt apare, că GA4 nu setează cookie-uri înainte de accept și că începe să trimită după accept.

## Ce poți face cu Google Analytics (GA4 `G-F167Y815JL`)

Site-ul trimite deja evenimente utile: `page_view` la fiecare navigare, `Lead` + `generate_lead` la fiecare formular (grup / privat / copii / probă), `InitiateCheckout` și `begin_checkout`, `trial_booking_complete` și `paid_booking_complete` (doar după confirmarea reală din backend), plus `whatsapp_click` și `phone_click`.

Ce poți face cu ele, fără cod nou:
- **Marchează evenimente-cheie** în GA4 (Admin → Events → Mark as key event): `generate_lead`, `trial_booking_complete`, `paid_booking_complete`. Așa vezi rata de conversie pe fiecare sursă și pagină.
- **Vezi ce pagini aduc lead-uri**, nu doar trafic — raport Landing page + key event. Util pentru paginile SEO (`/meditatii-araba`, `/cursuri-araba-bucuresti`, `/resurse`).
- **Leagă Search Console de GA4** ca să vezi cuvintele-cheie și clicurile alături de conversii, într-un singur raport.
- **Compară grup vs. privat vs. copii** folosind parametrul `form_type` de pe evenimentul de lead (necesită o dimensiune personalizată în GA4 — o pot configura ca instrucțiuni pas cu pas).
- **Audiențe pentru remarketing** (ex. „a deschis checkout dar n-a plătit”) dacă vei face reclame.

Dacă vrei, pot adăuga ulterior și tracking pentru scroll pe paginile de curs sau evenimente pe butoanele de rezervare — dar nu intră în acest task.

## Detalii tehnice

Fișiere atinse: `index.html` (scot CMP-ul vechi, adaug Adopt + curățare cookie), `src/lib/tracking.ts` (doar comentarii), `src/components/Footer.tsx` (link „Setări cookies”), `src/pages/Privacy.tsx` (text cookies RO/EN). Nicio schimbare de backend, nicio schimbare la ID-ul GA4.
