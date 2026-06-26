Înlocuiesc complet `mohtiibrahim@gmail.com` cu `marhaba@centruldearabalibaneza.com` peste tot — și public, și intern (admin/notificări/ICS).

## Fișiere de modificat

**Public (vizibil clienților)**
- `src/lib/i18n.tsx` — strings RO + EN (contact, footer, etc.)
- `src/components/Footer.tsx` — mailto hardcoded
- `src/components/CTASection.tsx` — constanta EMAIL
- `src/pages/Terms.tsx` — RO + EN
- `src/pages/Privacy.tsx` — RO + EN
- `src/pages/Index.tsx` — JSON-LD structured data

**Intern (admin / sistem)**
- `src/pages/BookingManage.tsx` — organizer ICS
- `src/components/NativeScheduler.tsx` — organizer ICS
- `supabase/functions/notify-registration/index.ts` — destinatar notificări admin
- orice altă apariție rămasă a `mohtiibrahim@gmail.com` (caut cu rg înainte de a edita)

## Pași
1. `rg "mohtiibrahim@gmail.com"` ca să prind toate aparițiile rămase.
2. Înlocuiesc fiecare cu `marhaba@centruldearabalibaneza.com`.
3. Re-verific cu `rg` că nu mai există nicio referință veche.
4. Deploy la edge function `notify-registration`.

Nicio schimbare de UI/logică — doar string replace.
