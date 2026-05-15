# Native Scheduler — înlocuiește Calendly

Sistem nativ de programare cu sync bidirecțional Google Calendar, reschedule self-service și remindere automate. Zero mentenanță manuală pentru Ibra.

## Scope

**Inclus:**
- Disponibilitate auto-sincronizată din Google Calendar (citire freebusy)
- Bookings scrise ca evenimente în GCal cu Google Meet auto pentru online
- 2 tipuri de eveniment: `trial` (30 min, gratuit) și `paid` (60 min)
- UI nativ de programare (zi → slot → confirmare)
- Reschedule + cancel via link tokenizat (fără login)
- Email confirmare + remindere T-24h și T-1h + email cancel/reschedule
- Admin UI: editare reguli disponibilitate + listă programări cu cancel/reschedule manual
- Timezone fix Europe/Bucharest

**Exclus (poate veni mai târziu):**
- Multi-instructor
- Selector timezone pe partea studentului
- Plată în pasul de booking (paid lesson rămâne flux Stripe → booking)
- Webhook GCal push (folosim freebusy on-demand, suficient pentru un singur instructor)
- SMS reminders

## Arhitectură

```text
Student                  App (React)              Edge Functions             Supabase DB           Google Calendar
   |                          |                          |                         |                       |
   |--- alege tip & zi ------>|                          |                         |                       |
   |                          |--- booking-availability->|                         |                       |
   |                          |                          |--- read rules --------->|                       |
   |                          |                          |--- read bookings ------>|                       |
   |                          |                          |--- freebusy ----------------------------------->|
   |                          |<------ slots --- --------|                         |                       |
   |--- confirma slot ------->|                          |                         |                       |
   |                          |--- booking-create ------>|                         |                       |
   |                          |                          |--- re-check + insert -->|                       |
   |                          |                          |--- create event ------------------------------->|
   |                          |                          |--- enqueue email ------>|                       |
   |<--- email confirmare + manage link -------------------------------------------|                       |
   |                                                                                                       |
   |--- /booking/manage/:token -> reschedule sau cancel -> update DB + GCal -> email                       |
                                                                                                           |
pg_cron la fiecare 15 min ----> booking-reminders ----> trimite T-24h și T-1h
```

## Schema DB (migrație nouă)

```text
booking_event_types
  id, slug ('trial'|'paid'), name, duration_min, buffer_before_min,
  buffer_after_min, min_notice_hours, max_advance_days,
  price_cents, requires_payment, is_active

availability_rules
  id, weekday (0=Dum..6=Sâm), start_time, end_time, is_active

bookings
  id, event_type_slug, start_at, end_at,
  student_name, student_email, student_phone,
  format ('online'|'physical'), notes,
  google_event_id, meet_link,
  status ('confirmed'|'cancelled'|'rescheduled'|'completed'),
  manage_token (uuid unique),
  reminder_24h_sent_at, reminder_1h_sent_at,
  cancelled_at, original_booking_id (FK self),
  created_at, updated_at
```

**RLS:**
- `bookings`: insert anonim permis (ca `registrations`); select doar via service role (acces prin edge function tokenizat)
- `availability_rules` + `booking_event_types`: select public, write doar service role
- Unique partial index pe `bookings(start_at) WHERE status='confirmed'` ca safety net pentru concurență

**Seed:**
- `trial`: 30 min, buffer 5/5, min_notice 12h, max_advance 30 zile, price 0
- `paid`: 60 min, buffer 5/5, min_notice 12h, max_advance 30 zile, price (existent)
- `availability_rules`: L–V 10:00–18:00 (editabil din admin)

## Edge Functions noi

1. **`booking-availability`** (verify_jwt=false, public)
   - Input: `event_type_slug`, `date_from`, `date_to`
   - Output: array de sloturi disponibile (ISO + label local)
   - Algoritm: expand rules pe weekday → slice în sloturi de `duration_min` → filtrează `min_notice` → scade GCal busy (call freebusy) → scade bookings DB confirmate (cu buffer) → return

2. **`booking-create`** (public)
   - Input: `event_type_slug`, `start_at`, `format`, lead info
   - Re-check disponibilitate (anti race)
   - Insert booking, generează `manage_token`
   - Creează eveniment în GCal cu attendees + Meet (dacă online)
   - Enqueue email confirmare cu link manage și .ics
   - Return: `{ booking_id, manage_token }`

3. **`booking-manage`** (public, autorizat prin token)
   - GET: returnează detalii booking
   - PATCH (reschedule): re-check slot nou, update GCal event, email reschedule
   - DELETE (cancel): șterge GCal event, status=cancelled, email cancel

4. **`booking-reminders`** (cron, service role)
   - Caută booking-uri confirmed cu `start_at` în [now+23h45m, now+24h15m] fără `reminder_24h_sent_at`
   - Idem pentru T-1h
   - Enqueue emailuri, marchează timestampuri

## UI nou

- **`<NativeScheduler eventType prefill onBooked />`** — înlocuiește `<CalendlyEmbed>`. 3 pași: zi (grid 14 zile cu badge sloturi) → slot (listă cards pe zi) → confirmare (form compact, prefilled din lead)
- **`/booking/manage/:token`** — pagină self-service: detalii + butoane Reschedule (deschide scheduler în modul reprogramare) și Cancel (cu confirm dialog)
- **Admin → tab "Disponibilitate"** — editor reguli (weekday + ore start/end, add/remove)
- **Admin → tab "Programări"** — tabel filtrabil (zi/tip/status), acțiuni cancel/reschedule manual

## Email templates noi (în `_shared/transactional-email-templates/`)

- `booking-confirmation` (cu .ics atașat, link manage, detalii Meet)
- `booking-reminder-24h` și `booking-reminder-1h`
- `booking-cancelled`
- `booking-rescheduled`

## Înlocuiri în codul existent

| Fișier | Schimbare |
|---|---|
| `src/components/BookingSection.tsx` | folosește `<NativeScheduler eventType="trial" />` |
| `src/components/RegistrationForm/PostSubmitView.tsx` | înlocuiește `<CalendlyEmbed>` cu `<NativeScheduler>` (trial pentru private) |
| `src/pages/Index.tsx` | toast post-payment redirect → `/booking?type=paid` în loc de Calendly URL |
| `src/pages/PrivateStatus.tsx` | buton "Programează" → pagina nativă |
| `src/components/CalendlyEmbed.tsx` | șters la final |

## Conector Google Calendar

- Folosim conectorul Lovable Google Calendar (contul Ibra completează OAuth o singură dată)
- Edge functions accesează GCal via gateway: `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/...`
- Calendar țintă: `primary` al lui Ibra
- Endpoints folosite:
  - `POST /freeBusy` — pentru disponibilitate
  - `POST /calendars/primary/events?conferenceDataVersion=1` — pentru creare cu Meet
  - `PATCH /calendars/primary/events/{id}` — pentru reschedule
  - `DELETE /calendars/primary/events/{id}` — pentru cancel
- Fallback: dacă conectorul pică, folosim doar bookings DB pentru disponibilitate + warning în admin

## Activări necesare în Supabase

- Extensii: `pg_cron`, `pg_net` (în prima migrație)
- Cron job: `*/15 * * * *` → invocă `booking-reminders` cu service role key (SQL via insert tool, nu migrație, conține anon key specific proiectului)

## Plan de livrare (incremental, fiecare etapă rulabilă)

1. **Conector + DB + seed** — link Google Calendar, migrație schema, seed event types + reguli default L–V 10–18
2. **Backend availability + create** — edge functions `booking-availability` și `booking-create` cu integrare GCal, fără reminders
3. **UI scheduler + integrare în 3 puncte** — `<NativeScheduler>` + înlocuire în `BookingSection`, `PostSubmitView`, `Checkout` success redirect
4. **Manage page + reschedule/cancel** — `/booking/manage/:token` + `booking-manage`
5. **Email templates + reminders + cron** — toate cele 5 templates, `booking-reminders`, pg_cron schedule
6. **Admin UI** — tab Disponibilitate + tab Programări
7. **Cleanup** — șterge `CalendlyEmbed`, update i18n strings RO/EN, regression test pe fluxurile group/private/kids

## Riscuri & atenție

- **One-time OAuth**: Ibra trebuie să conecteze Google Calendar via conectorul Lovable înainte de etapa 2. Fără asta, sloturile nu țin cont de programul lui personal.
- **Concurență**: dublu-booking prevenit prin re-check + unique partial index. Pe coliziune → 409, frontend re-fetch.
- **GCal freebusy latency**: ~200–500ms per call. Cache pe 60s în memoria edge function pentru request-uri rapide consecutive.
- **i18n**: toate stringurile noi adăugate în RO și EN simultan (proiectul are i18n custom).
- **Manage token în clar**: acceptabil pentru că link-ul pleacă doar la emailul studentului. Nu rotim, expiră implicit la cancel/in trecut.

## Confirmări înainte de implementare

1. Calendar țintă: `primary` al lui Ibra (cel din contul cu care conectează GCal). Confirmi?
2. Disponibilitate inițială default: **L–V 10:00–18:00**, sloturi de 30/60 min, **min notice 12h**, **max 30 zile în avans**. OK sau ai alte valori?
3. Pentru lecțiile online vrei **Google Meet auto-generat** atașat la eveniment (link în email)?
4. Tipul `paid` (60 min) — vrei să fie bookable direct fără plată în avans (modelul Calendly actual), sau doar după Stripe success ca acum?
