# Estimare efort & credite — Faze 0–8

Baseline empiric din acest proiect: editare i18n / componentă mică ≈ 0.5–1.5 credite; componentă nouă medie ≈ 2–4; migrație SQL aprobată ≈ 1–2; refactor Edge Function ≈ 2–4; flux nou end-to-end (UI + DB + EF + types) ≈ 6–12. Buffer 15–20% pentru bug-fix după typegen.

## Tabel sintetic

| Fază | Scop | Migrații | Edge Func | Comp. noi | Editări | Cost estimat | Bandă | Risc |
|---|---|---|---|---|---|---|---|---|
| 0 | Hygiene (counters hardcoded, env) | 0 | 0 | 0 | 2 | **~1** ✅ DONE | ieftin | — |
| 1 | Status vocab + tabele (locations/tutors/course_requests) | 1 mare | 1 (allow-list) | 0 | ~8 | **~10** ✅ DONE | mediu | — |
| 2 | Counter accuracy + cohort.status reader + CTA copy | 0–1 | 1 (RPC gate qualified) | 0 | 4–6 (`useGroupCapacity`, `useGroupCohorts`, `CohortsAdmin`, cohort cards) | **6–9** | mediu | mediu — atinge UI public |
| 3 | WhatsApp workflow + "Add WhatsApp Lead" admin | 1 (whatsapp_status, follow_up_due_at, notes) | 1 mare (add_whatsapp_lead, mark_replied/no_reply) | 1 (AddLeadDialog) | 3 (AdminNotifications, RegistrationsTable, filters) | **8–11** | mediu-scump | mic |
| 4 | `course_requests` public form + admin clustering | 0 | 1 (list/cluster/convert-to-cohort) | 2 (public RequestForm, admin ClusterView) | 2 (Index link, i18n) | **9–13** | scump | mediu |
| 5 | Structured schedule + locations reader + public "Current Groups" + /schedule page | 0–1 (back-fill) | 1 (cohort upsert cu câmpuri noi) | 3 (CurrentGroupsSection, SchedulePage, LocationBadge) | 4 (`useGroupCohorts`, `CohortsAdmin`, ProgramsSection, i18n) | **12–16** | **cel mai scump** | mare — UI public + admin + migrare schedule_label |
| 6 | Track (Arabizi vs script) pe form, admin, quiz, cards | 0 | 1 mic | 1 (TrackSelector) | 4 (RegistrationForm, CohortsAdmin, FindYourTrackQuiz, cards) | **6–9** | mediu | mic |
| 7 | Pass nativ RO/EN copy + CTA legate de cohort.status | 0 | 0 | 0 | 1 mare (`i18n.tsx`) + ~3 componente | **3–5** | ieftin | mic |
| 8 | Admin dashboard cards (§28), lead detail unificat (§39), archive-vs-delete (§29/§44), PrivateStatus refactor | 1 (`archived_at`) | 1 (archive action, dezactivat delete) | 2 (DashboardCards, UnifiedLeadDetail) | 3 (PrivateStatus rewrite, CohortsAdmin, RegistrationsTable) | **10–14** | scump | mediu |

**Total rămas (2–8): ~54–77 credite**, median ~65. Cu buffer 15% → **~62–88**.

## Unde se duc creditele

- **Cel mai scump = Faza 5** (3 componente publice noi + migrare dual-write schedule_label → structured + admin UI nou + reader joins). Singura fază cu impact vizibil pe homepage și SEO.
- **Următoarele scumpe = Fazele 3, 4, 8** — toate adaugă fluxuri admin end-to-end (UI + EF action + types). Costul vine din Edge Function refactor + dialog UI nou, nu din SQL.
- **Ieftine = 0, 2, 6, 7.** Faza 2 e ieftină ca scop dar **valoare/credit foarte mare** (rezolvă 2 bug-uri de bază: spam inflate + duality counter).
- **Migrații SQL = cel mai bun raport.** O migrație ≈ 1–2 credite deblochează muncă pe 3–4 faze (vezi Faza 1).
- **Edge Function changes = cel mai prost raport** când trebuie redeployate des — fiecare touch ≈ 2–4 credite.

## Recomandare în ~88 credite

Ordine optimă valoare/credit:

1. **Faza 2** (6–9) → fix counters, deblochează CTA dinamic. **Must-do.**
2. **Faza 7** (3–5) → ieftin, finisează ce e deja shipped. **Quick win.**
3. **Faza 6** (6–9) → track-ul completează promisiunea quiz-ului existent.
4. **Faza 3** (8–11) → WhatsApp e canalul tău real de leaduri.
5. **Faza 8** (10–14) → fix regresia `PrivateStatus` + archive (datorie tehnică).
6. **Faza 4** (9–13) → course_requests; valoare doar dacă vine volum din /quiz.
7. **Faza 5** (12–16) → ultima, pentru că e cea mai scumpă și depinde de 2+3+6.

Cumulat: 2+7+6+3+8 = **~33–48 credite** (foarte confortabil sub 88, lasă spațiu pentru bug-fix).
Adaugă 4: **~42–61**. Încă safe.
Adaugă 5: **~54–77**. La limită, dar încape.

**Unde să te oprești dacă vrei marjă:** după Faza 8 (cumulat ~43–61). Faza 4 și 5 numai dacă ai semnale de cerere (forms abandonate, întrebări repetate pe WhatsApp despre orar/locație).

**Unde să NU te oprești:** după Faza 2. Costul 6–9 elimină inflația counter-elor cu spam — fără ea, restul muncii e construită pe numere greșite.

## Ce urmează

Recomand să kick-off **Faza 2** acum (cel mai bun raport valoare/credit, ~6–9 credite, deblochează CTA dinamic și fix-ul counter spam). Înainte de start am nevoie de 2 decizii rapide:

1. **Gating counter §15**: număr doar `qualified + converted`, sau și `contacted`? (standardul zice "qualified only"; recomand qualified+converted).
2. **`is_active` deprecation**: îl păstrăm scris dublu (dual-write) pentru un release, sau migrăm direct la `status` și ștergem `is_active` într-o singură migrație? (recomand dual-write 1 fază, apoi drop în Faza 5).
