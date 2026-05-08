## Plan: Capacități grupe + Calendly inline + avans waitlist Kids

### 1. Bază de date (migration)

**Adaug coloană `level`** în `registrations` (text, nullable) — pentru a distinge A1/A2/.../C2 sau "kids".

**Tabel nou `group_capacities`** — configurabil din admin:
- `form_type` (text: 'group' | 'kids')
- `level` (text, nullable; pentru kids = null sau 'kids')
- `max_seats` (int, default 10)
- `min_seats` (int, default 4)
- unique (form_type, level)
- RLS: anyone read; service role write.
- Seed: rânduri pentru group A1..C2 (10/4) și kids (10/4).

**Adaug `is_waitlist_deposit` (bool)** în `registrations` pentru a marca înscrierile cu avans.

### 2. Logica de capacitate (frontend)

**Nou: `src/hooks/useGroupCapacity.ts`** — fetch `group_capacities` + count registrations per (form_type, level). Returnează `{ taken, max, min, remainingToStart, seatsLeft }`. Folosește realtime subscription pe `registrations` ca să se actualizeze live.

**ProgramsSection (Adulți):** sub fiecare pill A1–C2 afișez mic indicator: `"3/10 locuri • mai e nevoie de 1 pentru start"` sau `"7/10 ocupate"`. Card-ul Group highlight nivelul activ cu seat info.

**RegistrationFormSection (Group + Kids):** afișez seat info live deasupra formularului în funcție de form_type și (pentru group) nivel selectat. Salvez `level` la insert.

### 3. Calendly inline în formular

În `RegistrationFormSection`, după submit reușit (toast "Te-am înregistrat!"), card-ul de mulțumire afișează:
- Mesaj: "Ultimul pas: rezervă-ți **sesiunea gratuită de probă** (30 min cu Ibra)"
- Iframe Calendly inline (folosește `CALENDLY_URL` env / placeholder ca în BookingSection)
- Buton "Sar peste, mă suni" → închide.

Se aplică pentru toate 3 form-uri (Group, Private, Kids).

### 4. Avans 25% (Kids waitlist)

În card-ul Kids din formular: dacă `taken < min` (sub 4 înscriși), afișez:
- Banner: "Grupa nu e încă completă (X/4). Rezervă-ți locul cu un avans rambursabil de **125 LEI** (25%)."
- Checkbox `sms_confirmation_opt_in`-style: "Vreau să plătesc avansul acum"
- La submit cu acest flag → invocă `create-checkout` edge function cu `mode: payment`, line_items: 125 LEI o singură dată; redirect la Stripe Checkout.
- La return cu `?payment=success`, marchez `is_waitlist_deposit=true` și `payment_status='paid'`.

**Edge function**: extind `create-checkout` existent să accepte `productType: 'kids_deposit'` cu price_data 12500 RON cents (sau price_id nou). Folosesc `price_data` doar dacă nu există price_id; preferabil creez un Stripe product nou "Avans loc grupa Kids" / 125 LEI.

### 5. Admin UI

În `src/pages/Admin.tsx` adaug tab nou "Capacități":
- Listă cu rânduri group A1..C2 + kids
- Pentru fiecare: input `max_seats`, `min_seats`
- Buton "Salvează" → invocă edge function nouă `update-group-capacity` (verify admin password header) → service role update.

### 6. Email admin notification

Include `level` și `is_waitlist_deposit` în template `admin-new-registration` și subiect.

### Fișiere

**Modificate:** `src/components/ProgramsSection.tsx`, `src/components/RegistrationFormSection.tsx`, `src/components/BookingSection.tsx` (extragere logic Calendly în component reutilizabil `CalendlyEmbed.tsx`), `src/pages/Admin.tsx`, `src/lib/i18n.tsx`, `supabase/functions/create-checkout/index.ts`, `supabase/functions/_shared/transactional-email-templates/admin-new-registration.tsx`.

**Create:** `src/hooks/useGroupCapacity.ts`, `src/components/CalendlyEmbed.tsx`, `supabase/functions/update-group-capacity/index.ts`, migration nouă (level + group_capacities + is_waitlist_deposit + seed).

### Note
- Calendly URL rămâne placeholder; când îl ai, îl pun într-un secret/const și se activează automat.
- Capacitate inițială: 10 max / 4 min pentru toate. Le modifici din admin.
- Avansul 125 LEI: produs Stripe nou, plata one-off, redirect success → marchez paid.