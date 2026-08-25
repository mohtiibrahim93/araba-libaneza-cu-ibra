// Faithful Markdown conversions of the code-shipped article bodies (RO + EN),
// so the admin Blog editor starts prefilled with the CURRENT text instead of
// a blank page. Loaded only by the admin bundle. Content parity note: the
// table-of-contents asides and per-cell RTL styling are chrome, not content —
// tables keep every row; Arabic text renders fine in Markdown tables.

export interface SeedBody {
  lead_ro: string;
  lead_en: string;
  ro: string;
  en: string;
}

export const BLOG_SEED: Record<string, SeedBody> = {
  "cum-saluti-in-libaneza": {
    lead_ro: "De la „mar7aba” la „yalla bye” — formulele de salut pe care le auzi zilnic în Liban, cu pronunție și context.",
    lead_en: "From 'mar7aba' to 'yalla bye' — the greetings you hear daily in Lebanon, with pronunciation and context.",
    ro: `Salutul este prima ta interacțiune în orice limbă — și în libaneză e cald și expresiv. Vestea bună: câteva formule te duc foarte departe. Iată-le pe cele mai folosite, cu [arabizi](/blog/ce-este-arabizi) și scriere arabă.

## Formulele esențiale

| Arabizi | Arabă | Când / ce înseamnă |
| --- | --- | --- |
| Mar7aba | مرحبا | Salut / Bună (universal, orice moment) |
| Ahla w sahla | أهلا وسهلا | Bine ai venit |
| Saba7 el kheir | صباح الخير | Bună dimineața |
| Saba7 el noor | صباح النور | Răspuns la „bună dimineața” |
| Masa el kheir | مساء الخير | Bună seara |
| Kifak? (m) / Kifik? (f) | كيفك؟ | Ce faci? |
| Mnee7, il7amdillah | منيح، الحمد لله | Bine, slavă Domnului |
| Yalla bye | يلا باي | Hai, pa (informal, foarte folosit) |
| Bshoufak (m) / Bshoufik (f) | بشوفك | Ne vedem / Pe curând |

## Masculin sau feminin — atenție la terminație

Ai observat „Kifak?” vs „Kifik?”. În libaneză, când te adresezi cuiva, forma se schimbă după genul persoanei: -ak pentru bărbați, -ik pentru femei. E o regulă simplă care apare peste tot și pe care o prinzi repede vorbind.

## „7” și „kh” — cum le pronunți

În „saba7” și „el kheir” apar sunete guturale specifice arabei. Cifra 7 este un „h” puternic din gât, iar „kh” seamănă cu „ch” din germana „Bach”. Nu-ți face griji dacă nu-ți ies din prima — la o lecție le auzi de la un vorbitor nativ și le repeți pe loc.

## Exersează cu cineva real

Salutările se învață cel mai bine spunându-le, nu citindu-le. La o [lecție de probă gratuită](/trial) le pronunți cu profesorul și pornești o primă conversație scurtă. Vezi și [primele 20 de expresii libaneze](/blog/primele-20-de-expresii-libaneze) ca să continui.`,
    en: `Greetings are your first interaction in any language — and in Lebanese they're warm and expressive. The good news: a handful of phrases take you a long way. Here are the most common ones, with [Arabizi](/blog/ce-este-arabizi) pronunciation and Arabic script.

## The essential phrases

| Arabizi | Arabic | When / meaning |
| --- | --- | --- |
| Mar7aba | مرحبا | Hi / Hello (universal, any time) |
| Ahla w sahla | أهلا وسهلا | Welcome |
| Saba7 el kheir | صباح الخير | Good morning |
| Saba7 el noor | صباح النور | Reply to 'good morning' |
| Masa el kheir | مساء الخير | Good evening |
| Kifak? (m) / Kifik? (f) | كيفك؟ | How are you? |
| Mnee7, il7amdillah | منيح، الحمد لله | Good, thank God |
| Yalla bye | يلا باي | Bye (informal, very common) |
| Bshoufak (m) / Bshoufik (f) | بشوفك | See you / Soon |

## Masculine or feminine — mind the ending

Notice 'Kifak?' vs 'Kifik?'. In Lebanese, when you address someone the form changes with their gender: -ak for men, -ik for women. It's a simple rule that shows up everywhere and you pick it up quickly by speaking.

## '7' and 'kh' — how to pronounce them

In 'saba7' and 'el kheir' there are guttural sounds specific to Arabic. The number 7 is a strong 'h' from the throat, and 'kh' is like the 'ch' in German 'Bach'. Don't worry if they don't come out at first — in a lesson you hear them from a native speaker and repeat them on the spot.

## Practise with a real person

Greetings are learned best by saying them, not reading them. In a [free trial lesson](/trial) you pronounce them with the teacher and start a first short conversation. See also the [first 20 Lebanese phrases](/blog/primele-20-de-expresii-libaneze) to continue.`,
  },

  "cat-costa-cursurile-de-araba-libaneza": {
    lead_ro: "Grup sau privat, online sau fizic — iată cum se calculează prețul, ce reduceri există și de ce prima lecție e gratuită.",
    lead_en: "Group or private, online or in person — here's how the price works, what discounts exist and why the first lesson is free.",
    ro: `Una dintre primele întrebări firești când vrei să înveți o limbă nouă este „cât costă?”. La Centrul de Arabă Libaneză prețurile sunt transparente și depind de un singur lucru: formatul pe care îl alegi. Mai jos ai toate opțiunile.

## Cursuri de grup (adulți, A1–C2)

Cursurile de grup sunt cea mai accesibilă și mai motivantă opțiune — înveți alături de colegi de nivelul tău, cu 2 lecții pe săptămână. Poți plăti în două feluri:

- **Abonament lunar** — plătești lună de lună, iar abonamentul se oprește automat când se termină cursul. Prețul pe lună pornește de la 500 lei pentru nivelul A1 online și crește pe niveluri; formatul fizic în București are un tarif ușor mai mare.
- **Plată integrală în avans** — dacă plătești tot cursul o dată, primești **10% reducere** la total.

Fiecare nivel durează un număr fix de luni (A1 patru luni, A2 șapte luni etc.), așa că știi din start cât plătești în total. Vezi cifrele exacte pe nivel în pagina de [cursuri de grup](/cursuri/grup).

## Lecții private (1:1)

Dacă vrei ritm personalizat sau un program flexibil, lecțiile private costă **150 lei / lecție** (60 de minute), în orice format — online sau fizic. Reduceri automate la pachet: **−5% de la 5 lecții, −10% de la 10 și −20% de la 20**. Detalii pe pagina de [lecții private](/cursuri/private).

## Curs pentru copii (6–10 ani)

Cursul pentru copii este un program interactiv, bazat pe joc, fizic în București (online de la 10 ani). Prețul este 500 lei/lună pe durata programului. Vezi [cursul pentru copii](/cursuri/copii).

## Proba este gratuită

Nu trebuie să plătești nimic ca să începi. Prima lecție este o [probă gratuită](/trial) de 30 de minute, fără nicio obligație — o rezervi online, îți alegi un interval și vorbești cu profesorul. Abia după ce vezi cum e, decizi dacă te înscrii.

## Există costuri ascunse?

Nu. Materialele audio și suportul sunt incluse. Plățile se fac securizat prin Stripe, iar pentru abonamentele lunare poți anula oricând — dacă anulezi în primele 5 zile ale unei luni deja plătite, primești banii înapoi proporțional. Restul lunilor pur și simplu nu se mai facturează.`,
    en: `One of the first natural questions when you want to learn a new language is 'how much?'. At the Lebanese Arabic Center prices are transparent and depend on one thing: the format you choose. Here are all the options.

## Group courses (adults, A1–C2)

Group courses are the most affordable and motivating option — you learn alongside peers at your level, with 2 lessons a week. You can pay in two ways:

- **Monthly subscription** — you pay month by month, and the subscription stops automatically when the course ends. The monthly price starts from 500 lei for A1 online and rises by level; the in-person format in Bucharest has a slightly higher rate.
- **Pay in full up front** — if you pay for the whole course at once, you get a **10% discount** on the total.

Each level lasts a fixed number of months (A1 four months, A2 seven, etc.), so you know your total from the start. See the exact figures per level on the [group courses](/cursuri/grup) page.

## Private lessons (1:1)

If you want a personalized pace or a flexible schedule, private lessons cost **150 lei / lesson** (60 minutes), in any format — online or in person. Automatic package discounts: **−5% from 5 lessons, −10% from 10 and −20% from 20**. Details on the [private lessons](/cursuri/private) page.

## Kids course (ages 6–10)

The kids course is an interactive, game-based program, in person in Bucharest (online from age 10). The price is 500 lei/month for the program's duration. See the [kids course](/cursuri/copii).

## The trial is free

You don't have to pay anything to start. The first lesson is a [free trial](/trial) of 30 minutes, with no obligation — you book it online, pick a slot and talk to the teacher. Only after you see how it is do you decide whether to enrol.

## Are there hidden costs?

No. Audio materials and support are included. Payments are made securely via Stripe, and for monthly subscriptions you can cancel anytime — if you cancel within the first 5 days of an already-paid month, you get a prorated refund. The remaining months simply aren't billed.`,
  },

  "cum-alegi-profesor-de-araba": {
    lead_ro: "Ce să întrebi înainte să te înscrii — despre experiență, metodă, preț și rezultate — ca să nu pierzi timp și bani.",
    lead_en: "What to ask before you enrol — about experience, method, price and results — so you don't waste time or money.",
    ro: `Un profesor bun face diferența dintre a abandona după trei lecții și a ajunge să vorbești cu încredere. Înainte să alegi, merită să pui câteva întrebări clare. Iată-le, grupate, cu răspunsurile noastre la fiecare.

## Despre experiență și limbă

- **Ești vorbitor nativ?** Da — Ibra este vorbitor nativ de arabă libaneză.
- **Ce fel de arabă predai?** Dialect libanez (levantin), limba vie vorbită în Liban — nu doar [araba clasică din manuale](/blog/araba-libaneza-vs-araba-standard).
- **Ce experiență ai?** Ani de predare, atât în grup cât și 1:1, cu cursanți de toate nivelurile — vezi recenziile reale.

## Despre metodă

- **Cum sunt structurate lecțiile?** Prin metoda Oral First — vorbești din primele lecții, cu [arabizi](/blog/ce-este-arabizi) la început și trecere treptată la alfabetul arab.
- **Cum adaptezi lecțiile la nivelul meu?** Grupe mici și feedback constant; pentru obiective specifice, [lecții private 1:1](/cursuri/private).
- **Incluzi și cultura?** Da — limba vine împreună cu [obiceiurile și contextul cultural](/blog/cultura-libaneza-obiceiuri-mancare-traditii).

## Despre logistică

- **Cât durează și cât de des?** 90 de minute, de 2 ori pe săptămână la grup; flexibil la privat.
- **Online sau fizic?** Ambele — fizic în București sau online prin Zoom.
- **Cât costă și care e politica de anulare?** Transparent, fără costuri ascunse — vezi [detaliile de preț](/blog/cat-costa-cursurile-de-araba-libaneza). Abonamentele se pot anula oricând, cu rambursare proporțională în primele 5 zile.
- **Oferi o lecție de probă?** Da — prima lecție e [gratuită, fără obligații](/trial).

## Despre potrivire și rezultate

- **Ai recenzii de la cursanți?** Da, recenzii reale verificate pe Preply.
- **Mă poți ajuta cu obiectivul meu?** Conversație, călătorie, familie, copii — [cursurile](/cursuri) acoperă toate scopurile.
- **Cât de repede văd progres?** Vorbești de la prima lecție; vezi [cât durează pe fiecare nivel](/blog/cat-dureaza-sa-inveti-araba-libaneza).

## Semnale de alarmă de evitat

- Un vorbitor nativ care nu are experiență de predare — a ști o limbă nu înseamnă a o preda.
- Lecții generice, la fel pentru toată lumea, fără adaptare.
- Costuri ascunse sau program rigid, fără lecție de probă.

Cel mai simplu test? O [lecție de probă gratuită](/trial) — vezi direct metoda, pui întrebările de mai sus și decizi în cunoștință de cauză.`,
    en: `A good teacher is the difference between quitting after three lessons and speaking with confidence. Before you choose, it's worth asking a few clear questions. Here they are, grouped, with our answers to each.

## About experience and language

- **Are you a native speaker?** Yes — Ibra is a native speaker of Lebanese Arabic.
- **What kind of Arabic do you teach?** The Lebanese (Levantine) dialect, the living language spoken in Lebanon — not just the [textbook Classical Arabic](/blog/araba-libaneza-vs-araba-standard).
- **What experience do you have?** Years of teaching, both in groups and 1:1, with students at all levels — see the real reviews.

## About the method

- **How are lessons structured?** With the Oral First method — you speak from the first lessons, with [Arabizi](/blog/ce-este-arabizi) at first and a gradual move to the Arabic alphabet.
- **How do you adapt lessons to my level?** Small groups and constant feedback; for specific goals, [1:1 private lessons](/cursuri/private).
- **Do you include culture?** Yes — the language comes with the [customs and cultural context](/blog/cultura-libaneza-obiceiuri-mancare-traditii).

## About logistics

- **How long and how often?** 90 minutes, twice a week for groups; flexible for private.
- **Online or in person?** Both — in person in Bucharest or online via Zoom.
- **How much, and what's the cancellation policy?** Transparent, no hidden fees — see the [pricing details](/blog/cat-costa-cursurile-de-araba-libaneza). Subscriptions can be cancelled anytime, with a prorated refund in the first 5 days.
- **Do you offer a trial lesson?** Yes — the first lesson is [free, with no obligation](/trial).

## About fit and results

- **Do you have student reviews?** Yes, real verified reviews on Preply.
- **Can you help with my goal?** Conversation, travel, family, kids — the [courses](/cursuri) cover every goal.
- **How quickly will I see progress?** You speak from the first lesson; see [how long each level takes](/blog/cat-dureaza-sa-inveti-araba-libaneza).

## Red flags to avoid

- A native speaker with no teaching experience — knowing a language isn't the same as teaching it.
- Generic lessons, the same for everyone, with no adaptation.
- Hidden fees or rigid scheduling, with no trial lesson.

The simplest test? A [free trial lesson](/trial) — you see the method directly, ask the questions above and decide with full information.`,
  },

  "cat-dureaza-sa-inveti-araba-libaneza": {
    lead_ro: "Depinde de nivelul-țintă și de ritm — dar iată estimări realiste pe fiecare nivel, ca să știi la ce să te aștepți.",
    lead_en: "It depends on your target level and pace — but here are realistic estimates per level, so you know what to expect.",
    ro: `„Cât durează?” este întrebarea la care toată lumea vrea un răspuns simplu. Adevărul onest: depinde de cât de departe vrei să ajungi și cât de des exersezi. Vestea bună pentru libaneză e că, fiind un dialect vorbit, începi să comunici din primele lecții — nu aștepți luni întregi ca să spui ceva util.

## Durata pe fiecare nivel

La Centrul de Arabă Libaneză, cursurile de grup au 2 lecții pe săptămână (câte 90 de minute). Cu acest ritm, iată cât durează fiecare nivel CEFR:

| Nivel | Durată | Ce poți face |
| --- | --- | --- |
| A1 — Începător | ~4 luni | Te descurci în situații simple de zi cu zi: saluturi, cumpărături, prezentări. |
| A2 — Elementar | ~6–7 luni | Conversații despre subiecte familiare, trecut și viitor, opinii simple. |
| B1 — Intermediar | ~8–9 luni | Vorbești liber despre experiențe, planuri, povești; înțelegi discuții normale. |
| B2 — Intermediar avansat | ~9 luni | Comunicare naturală, nuanțe culturale, subiecte abstracte. |
| C1–C2 — Avansat | ~10 luni fiecare | Fluență apropiată de nativ, umor, registre diferite. |

## Ce influențează ritmul

- **Frecvența** — 2 lecții/săptămână plus puțină practică între ele accelerează mult.
- **Expunerea** — muzică, seriale, prieteni libanezi — orice contact real ajută.
- **Formatul** — [lecțiile private 1:1](/cursuri/private) merg mai repede pentru obiective specifice; grupul e mai motivant și mai accesibil.
- **Limbile pe care le știi** — dacă știi deja o limbă cu sunete guturale, pronunția vine mai ușor.

## Cât până „mă descurc în vacanță”?

Pentru a te descurca într-o călătorie în Liban — saluturi, restaurant, taxi, cumpărături — nivelul A1–A2 este suficient, deci câteva luni. Vezi [primele 20 de expresii](/blog/primele-20-de-expresii-libaneze) ca să începi chiar azi, sau [ghidul complet pentru începători](/blog/cum-inveti-araba-libaneza).

## Cum afli de unde pornești

Dacă știi deja câteva cuvinte, poți sări peste A1. Fă [testul de nivel gratuit](/quiz) (2 minute) sau o [lecție de probă gratuită](/trial) — profesorul îți spune exact de unde e cel mai bine să începi.`,
    en: `'How long?' is the question everyone wants a simple answer to. The honest truth: it depends on how far you want to go and how often you practise. The good news for Lebanese is that, being a spoken dialect, you start communicating from the first lessons — you don't wait months to say something useful.

## Duration per level

At the Lebanese Arabic Center, group courses have 2 lessons per week (90 minutes each). At that pace, here's how long each CEFR level takes:

| Level | Duration | What you can do |
| --- | --- | --- |
| A1 — Beginner | ~4 months | You manage simple everyday situations: greetings, shopping, introductions. |
| A2 — Elementary | ~6–7 months | Conversations on familiar topics, past and future, simple opinions. |
| B1 — Intermediate | ~8–9 months | You speak freely about experiences, plans, stories; you follow normal discussions. |
| B2 — Upper-intermediate | ~9 months | Natural communication, cultural nuance, abstract topics. |
| C1–C2 — Advanced | ~10 months each | Near-native fluency, humour, different registers. |

## What affects your pace

- **Frequency** — 2 lessons/week plus a little practice in between speeds things up a lot.
- **Exposure** — music, series, Lebanese friends — any real contact helps.
- **Format** — [1:1 private lessons](/cursuri/private) go faster for specific goals; the group is more motivating and affordable.
- **The languages you know** — if you already know a language with guttural sounds, pronunciation comes easier.

## How long until 'I can manage on holiday'?

To get by on a trip to Lebanon — greetings, restaurant, taxi, shopping — level A1–A2 is enough, so a few months. See the [first 20 phrases](/blog/primele-20-de-expresii-libaneze) to start today, or the [complete beginner's guide](/blog/cum-inveti-araba-libaneza).

## How to find your starting point

If you already know a few words, you can skip A1. Take the [free level test](/quiz) (2 minutes) or a [free trial lesson](/trial) — the teacher tells you exactly where it's best to start.`,
  },

  "alfabetul-arab-pentru-incepatori": {
    lead_ro: "Cele 28 de litere, pronunția lor și un adevăr liniștitor: nu ai nevoie de alfabet ca să începi să vorbești.",
    lead_en: "The 28 letters, their pronunciation and a reassuring truth: you don't need the alphabet to start speaking.",
    ro: `Alfabetul arab pare intimidant la prima vedere, dar are o logică simplă. Are **28 de litere**, se scrie de la **dreapta la stânga**, iar literele își schimbă ușor forma în funcție de poziția din cuvânt (început, mijloc, sfârșit). Nu există litere mari și mici.

## Tabelul complet al literelor

Mai jos ai fiecare literă, numele ei și sunetul aproximativ în română. „Emfatic” înseamnă un sunet pronunțat mai apăsat, din spatele gurii.

| Literă | Nume | Sunet |
| --- | --- | --- |
| ا | alif | a / â lung |
| ب | ba | b |
| ت | ta | t |
| ث | tha | th (ca în engl. „think”) |
| ج | jim | j (în libaneză: „j” ca în „jurnal”) |
| ح | ḥa | h aspru din gât |
| خ | kha | h gutural (ca „ch” germană) |
| د | dal | d |
| ذ | dhal | dh (ca engl. „this”) |
| ر | ra | r |
| ز | zay | z |
| س | sin | s |
| ش | shin | ș |
| ص | ṣad | s emfatic |
| ض | ḍad | d emfatic |
| ط | ṭa | t emfatic |
| ظ | ẓa | z emfatic |
| ع | ʿayn | sunet gutural (redat „3” în arabizi) |
| غ | ghayn | gh (ca un „r” franțuzesc) |
| ف | fa | f |
| ق | qaf | q gutural (în libaneză adesea oprire glotală) |
| ك | kaf | k |
| ل | lam | l |
| م | mim | m |
| ن | nun | n |
| ه | ha | h simplu |
| و | waw | w / u lung |
| ي | ya | y / i lung |

## Vocalele scurte nu se scriu de obicei

O particularitate importantă: în arabă, vocalele scurte (a, i, u) se marchează cu semne mici deasupra sau sub litere, dar în textul obișnuit **nu se scriu**. Cititorul le deduce din context. De aceea alfabetul de mai sus are mai ales consoane și vocale lungi.

## Trebuie să știi alfabetul ca să vorbești?

Nu — și aici e vestea bună. La Centrul de Arabă Libaneză folosim metoda **Oral First**: începi vorbind, cu ajutorul [arabizi](/blog/ce-este-arabizi) (araba scrisă cu litere latine), și treci treptat la alfabetul arab, fără să te blochezi. Poți purta conversații întregi în libaneză înainte să scrii prima literă.

## Cum înveți alfabetul mai ușor

- Grupează literele după formă — multe se aseamănă și diferă doar prin puncte (ب ت ث).
- Învață mai întâi să le recunoști, apoi să le scrii.
- Asociază fiecare literă cu un cuvânt pe care deja îl știi din vorbire.
- Exersează cu un profesor care îți corectează pronunția sunetelor guturale (ع، ح، ق).

Vrei să vezi de unde pornești? Fă [testul de nivel gratuit](/quiz) sau citește [ghidul complet pentru începători](/blog/cum-inveti-araba-libaneza).`,
    en: `The Arabic alphabet looks intimidating at first, but it has a simple logic. It has **28 letters**, is written **right to left**, and letters change shape slightly depending on their position in the word (start, middle, end). There are no upper- and lower-case letters.

## The complete letter table

Below is each letter, its name and the approximate sound. 'Emphatic' means a sound pronounced more heavily, from the back of the mouth.

| Letter | Name | Sound |
| --- | --- | --- |
| ا | alif | a / long â |
| ب | ba | b |
| ت | ta | t |
| ث | tha | th (as in 'think') |
| ج | jim | j (in Lebanese: 'j' as in 'journal') |
| ح | ḥa | harsh h from the throat |
| خ | kha | guttural h (like German 'ch') |
| د | dal | d |
| ذ | dhal | dh (as in 'this') |
| ر | ra | r |
| ز | zay | z |
| س | sin | s |
| ش | shin | sh |
| ص | ṣad | emphatic s |
| ض | ḍad | emphatic d |
| ط | ṭa | emphatic t |
| ظ | ẓa | emphatic z |
| ع | ʿayn | guttural sound (written '3' in Arabizi) |
| غ | ghayn | gh (like a French 'r') |
| ف | fa | f |
| ق | qaf | guttural q (in Lebanese often a glottal stop) |
| ك | kaf | k |
| ل | lam | l |
| م | mim | m |
| ن | nun | n |
| ه | ha | plain h |
| و | waw | w / long u |
| ي | ya | y / long i |

## Short vowels are usually not written

An important quirk: in Arabic, short vowels (a, i, u) are marked with small signs above or below the letters, but in ordinary text they **are not written**. The reader infers them from context. That's why the table above is mostly consonants and long vowels.

## Do you need the alphabet to speak?

No — and that's the good news. At the Lebanese Arabic Center we use the **Oral First** method: you start by speaking, with the help of [Arabizi](/blog/ce-este-arabizi) (Arabic written in Latin letters), and move gradually to the Arabic alphabet without getting stuck. You can hold whole conversations in Lebanese before writing your first letter.

## How to learn the alphabet more easily

- Group the letters by shape — many look alike and differ only by dots (ب ت ث).
- Learn to recognise them first, then to write them.
- Associate each letter with a word you already know from speaking.
- Practise with a teacher who corrects the guttural sounds (ع، ح، ق).

Want to see where you start? Take the [free level test](/quiz) or read the [complete beginner's guide](/blog/cum-inveti-araba-libaneza).`,
  },

  "ce-este-arabizi": {
    lead_ro: "Araba scrisă cu litere latine și cifre — cum funcționează, ce înseamnă „3” și „7”, și de ce te ajută să vorbești din prima zi.",
    lead_en: "Arabic written in Latin letters and numbers — how it works, what '3' and '7' mean, and why it helps you speak from day one.",
    ro: `**Arabizi** (numit și „arabish” sau „franco-arab”) este modul în care milioane de arabi scriu dialectul lor pe telefon și pe rețelele sociale: **cu litere latine și câteva cifre**. În loc să înveți întâi [alfabetul arab](/blog/alfabetul-arab-pentru-incepatori), poți citi și scrie libaneză imediat, folosind litere pe care deja le știi.

## De ce cifre?

Araba are câteva sunete care nu există în română și nu au o literă latină potrivită. Soluția ingenioasă a vorbitorilor: folosesc cifre a căror formă seamănă cu litera arabă corespunzătoare. Iată cheia:

| Cifră | Literă arabă | Sunet |
| --- | --- | --- |
| 2 | ء / ق | oprire glotală (ca pauza din „co-operare”) |
| 3 | ع | sunet gutural din gât, specific arab |
| 5 | خ | h aspru, ca „ch” în germana „Bach” |
| 7 | ح | h puternic din gât, fără echivalent în română |
| 8 | غ | gh, ca un „r” franțuzesc răgușit |
| 9 | ق | q gutural (uneori) |

## Exemple reale

- **Mar7aba** (مرحبا) — „salut” — cifra 7 e sunetul ح din gât.
- **3afwan** (عفواً) — „cu plăcere” — cifra 3 e sunetul ع.
- **Kifak?** (كيفك؟) — „ce faci?” — fără cifre, se citește direct.
- **Ta2burni** (تقبرني) — expresie de afecțiune — cifra 2 e o oprire scurtă.

Vezi mai multe în articolul cu [primele 20 de expresii libaneze](/blog/primele-20-de-expresii-libaneze).

## E „barează” să înveți cu arabizi?

Deloc. Arabizi este modul real în care libanezii comunică zi de zi în scris. Pentru un începător, e cea mai rapidă cale spre conversație — nu te blochezi la scris cât timp înveți să vorbești. La curs folosim arabizi la început și trecem treptat la alfabetul arab, în ritmul tău, prin metoda **Oral First**.`,
    en: `**Arabizi** (also called 'arabish' or 'franco-arab') is how millions of Arabs write their dialect on their phones and on social media: **in Latin letters and a few numbers**. Instead of learning the [Arabic alphabet](/blog/alfabetul-arab-pentru-incepatori) first, you can read and write Lebanese right away, using letters you already know.

## Why numbers?

Arabic has a few sounds that don't exist in English and have no matching Latin letter. Speakers found a clever fix: they use numbers whose shape resembles the corresponding Arabic letter. Here's the key:

| Number | Arabic letter | Sound |
| --- | --- | --- |
| 2 | ء / ق | glottal stop (like the pause in 'co-operate') |
| 3 | ع | guttural sound from the throat, specific to Arabic |
| 5 | خ | harsh h, like 'ch' in German 'Bach' |
| 7 | ح | strong h from the throat, no English equivalent |
| 8 | غ | gh, like a raspy French 'r' |
| 9 | ق | guttural q (sometimes) |

## Real examples

- **Mar7aba** (مرحبا) — 'hi' — the number 7 is the ح sound from the throat.
- **3afwan** (عفواً) — 'you're welcome' — the number 3 is the ع sound.
- **Kifak?** (كيفك؟) — 'how are you?' — no numbers, read as written.
- **Ta2burni** (تقبرني) — a term of affection — the number 2 is a short stop.

See more in the article on the [first 20 Lebanese phrases](/blog/primele-20-de-expresii-libaneze).

## Is it 'cheating' to learn with Arabizi?

Not at all. Arabizi is the real way Lebanese people write to each other every day. For a beginner, it's the fastest route to conversation — you don't get stuck on writing while you learn to speak. In class we use Arabizi at first and move gradually to the Arabic alphabet, at your pace, through the **Oral First** method.`,
  },

  "cultura-libaneza-obiceiuri-mancare-traditii": {
    lead_ro: "Ospitalitate, mezze, muzică și un amestec unic de influențe — contextul viu care dă sens limbii pe care o înveți.",
    lead_en: "Hospitality, mezze, music and a unique mix of influences — the living context that gives meaning to the language you're learning.",
    ro: `Nu înveți doar o limbă — intri într-o cultură. Libanul este o țară mică de la Marea Mediterană, dar cu o densitate culturală uriașă: un loc de întâlnire între Orient și Occident, cu o istorie de mii de ani. Iată ce dă farmec culturii libaneze.

## Ospitalitatea, mai presus de toate

În Liban, oaspetele este sacru. Vei fi întâmpinat mereu cu „**Ahla w sahla**” (bine ai venit) și, aproape sigur, cu o cafea sau ceva de mâncare. A refuza e aproape imposibil — și nici nu vei vrea. Această căldură se simte direct în limbă, plină de expresii de afecțiune (îți amintești de [„ta2burni”](/blog/primele-20-de-expresii-libaneze)?).

## Mâncarea: mezze și mult mai mult

Bucătăria libaneză este renumită în toată lumea. Masa începe cu **mezze** — o mulțime de farfurii mici pe care le împarți cu toată lumea:

- **Hummus** și **moutabbal** — pastă de năut, respectiv de vinete.
- **Tabbouleh** — salată proaspătă de pătrunjel, roșii și bulgur.
- **Kibbeh** — chiftele de bulgur cu carne, simbol național.
- **Falafel**, **fattoush**, **manakish** — și lista continuă.

Mâncarea nu e doar hrană — e un mod de a fi împreună. Multe expresii pe care le înveți la curs apar exact la masă, în jurul mezze-urilor.

## Muzică, limbă și un amestec unic

Muzica libaneză merge de la marea **Fairuz** (vocea dimineților libaneze) până la pop-ul modern de la Beirut. Un lucru te va surprinde: libanezii amestecă adesea în aceeași propoziție arabă, franceză și engleză — „*Hi, kifak? Ça va?*”. E o reflexie a istoriei cosmopolite a țării.

## De ce contează cultura când înveți limba

Araba libaneză este un [dialect viu](/blog/araba-libaneza-vs-araba-standard), nu araba clasică din manuale. Cuvintele au poveste, umor și context. Când înveți cu un profesor nativ, primești și cultura odată cu limba — de asta cursurile noastre includ expresii reale, obiceiuri și felul autentic în care se vorbește pe străzile Beirutului.

Curios? Începe cu o [lecție de probă gratuită](/trial) sau vezi [toate cursurile](/cursuri).`,
    en: `You don't just learn a language — you step into a culture. Lebanon is a small Mediterranean country, but with enormous cultural density: a meeting point between East and West, with thousands of years of history. Here's what gives Lebanese culture its charm.

## Hospitality, above all

In Lebanon, the guest is sacred. You'll always be welcomed with '**Ahla w sahla**' (welcome) and, almost certainly, a coffee or something to eat. Refusing is nearly impossible — and you won't want to. That warmth is felt directly in the language, full of terms of affection (remember ['ta2burni'](/blog/primele-20-de-expresii-libaneze)?).

## The food: mezze and much more

Lebanese cuisine is famous worldwide. A meal begins with **mezze** — many small plates you share with everyone:

- **Hummus** and **moutabbal** — chickpea and aubergine dips.
- **Tabbouleh** — a fresh salad of parsley, tomatoes and bulgur.
- **Kibbeh** — bulgur-and-meat croquettes, a national symbol.
- **Falafel**, **fattoush**, **manakish** — and the list goes on.

Food isn't just nourishment — it's a way of being together. Many expressions you learn in class come up exactly at the table, around the mezze.

## Music, language and a unique blend

Lebanese music ranges from the great **Fairuz** (the voice of Lebanese mornings) to modern Beirut pop. One thing will surprise you: Lebanese people often mix Arabic, French and English in the same sentence — '*Hi, kifak? Ça va?*'. It reflects the country's cosmopolitan history.

## Why culture matters when learning the language

Lebanese Arabic is a [living dialect](/blog/araba-libaneza-vs-araba-standard), not the classical Arabic of textbooks. Words carry story, humour and context. When you learn with a native teacher, you get the culture along with the language — that's why our courses include real expressions, customs and the authentic way people speak on the streets of Beirut.

Curious? Start with a [free trial lesson](/trial) or see [all the courses](/cursuri).`,
  },

  "araba-pentru-copii-ghidul-parintilor": {
    lead_ro: "De la ce vârstă, cum arată o lecție și cum îți susții copilul — tot ce vor să știe părinții înainte de primul curs.",
    lead_en: "From what age, what a lesson looks like and how to support your child — everything parents want to know before the first course.",
    ro: `Copiii învață limbile altfel decât adulții: prin joc, repetiție și context, nu prin reguli. De aceea cursurile de arabă libaneză pentru copii nu seamănă deloc cu o lecție clasică — sunt interactive, cu jocuri, cântece și povești.

## De la ce vârstă?

La Centrul de Arabă Libaneză, [cursul pentru copii](/cursuri/copii) este gândit pentru **6–10 ani**, fizic în București. De la **10 ani**, copiii pot participa și online. Sub 6 ani, recomandăm expunerea acasă (cântece, desene) înainte de un curs structurat.

## Cum arată o lecție

- Grupe mici, ca fiecare copil să fie implicat activ.
- Metoda **Oral First** — copiii vorbesc de la început, fără presiunea scrisului.
- [Arabizi](/blog/ce-este-arabizi) la început, apoi litere arabe treptat, ca un joc.
- Cântece, jocuri de rol și cuvinte legate de viața lor: familie, animale, mâncare, culori.
- Cultură libaneză adaptată vârstei — [obiceiuri și mâncare](/blog/cultura-libaneza-obiceiuri-mancare-traditii).

## De ce arabă libaneză și nu clasică?

Pentru copiii cu rădăcini libaneze sau cu familie vorbitoare, dialectul [libanez](/blog/araba-libaneza-vs-araba-standard) este limba pe care o aud acasă și la telefon cu bunicii — cea vie, nu araba din manuale. Așa învață o limbă pe care o și *folosesc*.

## Cum îți ajuți copilul acasă

- Ascultați împreună muzică libanească pentru copii.
- Folosiți cuvintele nou învățate în rutina zilnică (bună dimineața, mulțumesc).
- Fără presiune — lauda și jocul funcționează mult mai bine decât corectarea.
- Un apel scurt cu rude vorbitoare face minuni pentru motivație.

## Cum începeți

Cel mai simplu e o discuție scurtă ca să vedem nivelul și interesul copilului. Scrie-ne pe [WhatsApp](https://wa.me/40763124514) sau vezi detaliile și prețul pe pagina de [curs pentru copii](/cursuri/copii).`,
    en: `Children learn languages differently from adults: through play, repetition and context, not rules. That's why Lebanese Arabic courses for kids look nothing like a classic lesson — they're interactive, with games, songs and stories.

## From what age?

At the Lebanese Arabic Center, the [kids course](/cursuri/copii) is designed for ages **6–10**, in person in Bucharest. From age **10**, children can also join online. Under 6, we recommend exposure at home (songs, cartoons) before a structured course.

## What a lesson looks like

- Small groups, so every child is actively involved.
- The **Oral First** method — kids speak from the start, with no pressure to write.
- [Arabizi](/blog/ce-este-arabizi) at first, then Arabic letters gradually, like a game.
- Songs, role-play and words tied to their world: family, animals, food, colours.
- Age-appropriate Lebanese culture — [customs and food](/blog/cultura-libaneza-obiceiuri-mancare-traditii).

## Why Lebanese Arabic and not Classical?

For kids with Lebanese roots or a speaking family, the [Lebanese dialect](/blog/araba-libaneza-vs-araba-standard) is the language they hear at home and on the phone with their grandparents — the living one, not the Arabic of textbooks. That's how they learn a language they actually *use*.

## How to help your child at home

- Listen to Lebanese children's music together.
- Use newly learned words in the daily routine (good morning, thank you).
- No pressure — praise and play work far better than correction.
- A short call with speaking relatives works wonders for motivation.

## How to start

The simplest way is a short chat so we can gauge your child's level and interest. Message us on [WhatsApp](https://wa.me/40763124514) or see the details and price on the [kids course](/cursuri/copii) page.`,
  },

  "primele-20-de-expresii-libaneze": {
    lead_ro: "Scrise în arabizi (litere latine), cu grafia arabă și traducere. Exact expresiile pe care le folosești din prima zi în Liban — sau cu prietenii libanezi.",
    lead_en: "Written in Arabizi (Latin letters), with Arabic script and translation. Exactly the phrases you use from day one in Lebanon — or with Lebanese friends.",
    ro: `**Cum citești tabelul:** „3” se pronunță ca un „a” gutural (litera ع), „7” ca un „h” aspru din gât (ح), iar „2” marchează o oprire scurtă a vocii (ء). Nu-ți face griji — la curs le auzi și le repeți natural, metoda noastră e *Oral First*.

## Salut și politețe

| Arabizi | Arabă | Română |
| --- | --- | --- |
| Mar7aba | مرحبا | Salut / Bună |
| Kifak? (m) · Kifik? (f) | كيفك؟ | Ce faci? |
| Mnee7, shukran | منيح، شكراً | Bine, mulțumesc |
| Shu akhbarak? | شو أخبارك؟ | Ce mai e nou? |
| Yalla, baaden | يلا، بعدين | Hai, pe curând |
| Tsharrafna | تشرفنا | Îmi pare bine (de cunoștință) |

## Cuvinte de bază

| Arabizi | Arabă | Română |
| --- | --- | --- |
| Eh / La' | إيه / لأ | Da / Nu |
| Min fadlak (m) | من فضلك | Te rog |
| Shukran ktir | شكراً كتير | Mulțumesc mult |
| 3afwan | عفواً | Cu plăcere / Scuze |
| Aasef (m) · Aasfeh (f) | آسف | Îmi pare rău |
| Ma fhemet | ما فهمت | Nu am înțeles |

## La cafenea și pe stradă

| Arabizi | Arabă | Română |
| --- | --- | --- |
| Baddi ahwe | بدي قهوة | Vreau o cafea |
| Addesh el 7saab? | قديش الحساب؟ | Cât costă / Cât e nota? |
| Wein el 7ammem? | وين الحمام؟ | Unde e toaleta? |
| 3al yamin / 3ash-shmel | عاليمين / عالشمال | La dreapta / La stânga |
| Wa''ifni hon | وقفني هون | Oprește-mă aici (în taxi) |
| Ktir tayyeb! | كتير طيّب! | Foarte gustos! |

## Expresii libaneze de suflet

| Arabizi | Arabă | Română |
| --- | --- | --- |
| Ya3ni | يعني | Adică / Cam așa (umplutură universală) |
| Ta2burni | تقبرني | „Te iubesc enorm” (literal: să mă îngropi tu) — afecțiune tipic libaneză |

## De unde continui

Dacă expresiile de mai sus ți-au plăcut, pasul următor firesc e să le pui în context — cum se leagă, cum răspunzi, cum porți o conversație scurtă. Asta facem la curs din prima lecție.

- Vezi diferența dintre dialect și araba clasică în [araba libaneză vs araba standard](/blog/araba-libaneza-vs-araba-standard).
- Nu știi de unde pornești? Fă [testul de nivel gratuit](/quiz).`,
    en: `**How to read the table:** '3' is pronounced like a guttural 'a' (the letter ع), '7' like a harsh 'h' from the throat (ح), and '2' marks a short catch in the voice (ء). Don't worry — in class you hear and repeat them naturally, our method is *Oral First*.

## Greetings and politeness

| Arabizi | Arabic | Meaning |
| --- | --- | --- |
| Mar7aba | مرحبا | Hi / Hello |
| Kifak? (m) · Kifik? (f) | كيفك؟ | How are you? |
| Mnee7, shukran | منيح، شكراً | Good, thanks |
| Shu akhbarak? | شو أخبارك؟ | What's new? |
| Yalla, baaden | يلا، بعدين | Alright, see you later |
| Tsharrafna | تشرفنا | Nice to meet you |

## Basic words

| Arabizi | Arabic | Meaning |
| --- | --- | --- |
| Eh / La' | إيه / لأ | Yes / No |
| Min fadlak (m) | من فضلك | Please |
| Shukran ktir | شكراً كتير | Thank you very much |
| 3afwan | عفواً | You're welcome / Excuse me |
| Aasef (m) · Aasfeh (f) | آسف | I'm sorry |
| Ma fhemet | ما فهمت | I didn't understand |

## At the café and on the street

| Arabizi | Arabic | Meaning |
| --- | --- | --- |
| Baddi ahwe | بدي قهوة | I'd like a coffee |
| Addesh el 7saab? | قديش الحساب؟ | How much is it / the bill? |
| Wein el 7ammem? | وين الحمام؟ | Where's the toilet? |
| 3al yamin / 3ash-shmel | عاليمين / عالشمال | To the right / To the left |
| Wa''ifni hon | وقفني هون | Stop here (in a taxi) |
| Ktir tayyeb! | كتير طيّب! | Very tasty! |

## Heartfelt Lebanese expressions

| Arabizi | Arabic | Meaning |
| --- | --- | --- |
| Ya3ni | يعني | I mean / sort of (universal filler) |
| Ta2burni | تقبرني | 'I love you dearly' (literally: may you bury me) — typically Lebanese affection |

## Where to go next

If you liked the phrases above, the natural next step is to put them in context — how they connect, how you reply, how you hold a short conversation. That's what we do in class from the first lesson.

- See the difference between dialect and Classical Arabic in [Lebanese Arabic vs Standard Arabic](/blog/araba-libaneza-vs-araba-standard).
- Not sure where to start? Take the [free level test](/quiz).`,
  },

  "araba-libaneza-vs-araba-standard": {
    lead_ro: "Nu există „o singură arabă”. Există o limbă scrisă (Fusha / MSA) și zeci de dialecte vorbite. Alegerea corectă depinde de ce vrei să faci cu limba — călătorii, familie, muncă, studiu academic sau muzică și seriale.",
    lead_en: "There's no 'single Arabic'. There's a written language (Fusha / MSA) and dozens of spoken dialects. The right choice depends on what you want to do with the language — travel, family, work, academic study, or music and series.",
    ro: `## 1. Ce este araba standard (MSA / Fusha) și ce este libaneza

**Araba standard modernă** (MSA, sau „Fusha” în arabă) este forma scrisă și oficială a limbii, folosită în toată lumea arabă în știri, ziare, cărți, documente juridice și predici religioase. Este o limbă învățată — nimeni nu o vorbește nativ acasă.

**Araba libaneză** este dialectul vorbit zilnic în Liban (parte din familia levantină, împreună cu araba siriană, iordaniană și palestiniană). Este limba mamei, a prietenilor, a muzicii și a serialelor — dar aproape că nu se scrie în forma sa pură.

Diferența nu este ca între „română literară” și „română vorbită”: este mai apropiată de diferența între latină și italiană — două registre înrudite, dar cu vocabular, gramatică și pronunție distincte.

## 2. Utilizări practice: când folosești fiecare

**Alege libaneza dacă vrei să:**

- vorbești cu familia, partenerul sau prietenii libanezi;
- călătorești în Liban, Siria, Iordania sau Palestina;
- înțelegi muzică (Fairuz, Nancy Ajram, Mashrou' Leila) și seriale populare;
- folosești limba pe TikTok, Instagram sau în conversații informale;
- ajungi la conversații reale în luni, nu în ani.

**Alege Fusha (MSA) dacă vrei să:**

- citești ziare, cărți sau texte religioase;
- urmezi studii academice sau lucrezi în diplomație / traduceri oficiale;
- urmărești buletine de știri (Al Jazeera, BBC Arabic);
- ai o bază solidă pentru a înțelege ulterior alte dialecte în scris.

În practică, cei mai mulți adulți care învață arabă pentru comunicare reală încep cu **un dialect** — și adaugă Fusha mai târziu, dacă e nevoie.

## 3. Care e mai grea de învățat?

Ambele au provocări comune pentru un vorbitor de română: sunetele „grele” (**ع, ح, ق**), scrierea de la dreapta la stânga și un vocabular fără rădăcini comune cu limbile latine.

Dincolo de asta, **Fusha este semnificativ mai grea** pentru un începător:

- **Cazuri gramaticale** (nominativ, acuzativ, genitiv) care se marchează cu terminații — libaneza nu le folosește.
- **Conjugări duale și forme verbale** mai complexe; libaneza are un sistem regularizat, mai apropiat de vorbirea zilnică.
- **Vocabular formal**, mult mai rar auzit — greu de reținut fără expunere constantă.

Cu **2–3 ore de studiu pe săptămână**, un începător poate purta conversații simple în libaneză în 4–6 luni. Același nivel „de conversație” în Fusha ia de obicei de 2–3 ori mai mult, fiindcă Fusha nu se folosește în conversație — deci practica reală lipsește.

## 4. Context cultural: de ce libaneza e „media-friendly”

Libanul a produs, timp de decenii, o cantitate uriașă de conținut cultural în dialect — de la muzica lui **Fairuz** și a fraților Rahbani, la telenovele difuzate în toată lumea arabă și creatori de conținut de pe TikTok și YouTube. Dialectul libanez este înțeles pe scară largă în întreaga regiune, chiar și de vorbitori de arabă egipteană sau din Golf.

Libaneza modernă poartă și influențe puternice din **franceză, engleză, aramaică și turcă**, iar în Beirut auzi curent propoziții precum „*Hi, kifak? Ça va?*”. Este o limbă cu personalitate — și o fereastră către o cultură vie, nu doar către texte scrise.

## 5. Tabel comparativ rapid

| Criteriu | Libaneză (dialect) | Fusha / MSA |
| --- | --- | --- |
| Folosită pentru | Conversație zilnică, familie, călătorii, media | Scris, știri, texte oficiale, religie |
| Cine o vorbește nativ | ~30M vorbitori (Liban, Siria, Iordania, Palestina) | Nimeni ca limbă maternă |
| Gramatică | Simplificată, fără cazuri | Complexă, cu cazuri și forme duale |
| Timp până la conversație | ~4–6 luni | ~12–18 luni (și rar folosită în vorbire) |
| Scriere | Rar; adesea în transliterație latină | Standard, în alfabet arab |
| Ideală pentru | Comunicare, cultură, familie | Studiu academic, citit, contexte formale |

## 6. Ce ar trebui să alegi?

Regula practică pentru adulții din România care vor să învețe arabă:

- **Vrei să vorbești** — cu familia, în vacanță, pe social media, la muncă cu clienți libanezi → începe cu **araba libaneză**. Progresul se simte în câteva săptămâni.
- **Vrei să citești și să scrii** — pentru studii academice, Coran, ziare, contexte oficiale → începe cu **Fusha (MSA)**.
- **Vrei ambele** — începe cu libaneza (rezultate rapide, motivație), și adaugă Fusha după 6–12 luni când baza fonetică și de vocabular este deja formată.

La **Centrul de Arabă Libaneză cu Ibra** predăm *direct* dialectul libanez, cu profesor nativ, pentru adulți și copii — fizic în București sau online. Fusha o integrăm treptat de la nivelul B1, când e cu adevărat utilă.

Pași concreți:

- Fă [testul de nivel gratuit](/quiz) ca să afli de unde pornești.
- Vezi [cursurile de grup](/cursuri/grup) (structurate pe niveluri CEFR A1–C2) sau [lecțiile private](/cursuri/private) (ritm personalizat).
- Pentru copii, avem un [program dedicat](/cursuri/copii) fizic în București.
- Vezi și articolul [Cum înveți araba libaneză în 2026](/blog/cum-inveti-araba-libaneza) pentru un ghid pas cu pas.`,
    en: `## 1. What Standard Arabic (MSA / Fusha) is and what Lebanese is

**Modern Standard Arabic** (MSA, or 'Fusha' in Arabic) is the written, official form of the language, used across the Arab world in news, newspapers, books, legal documents and religious sermons. It's a learned language — no one speaks it natively at home.

**Lebanese Arabic** is the dialect spoken daily in Lebanon (part of the Levantine family, together with Syrian, Jordanian and Palestinian Arabic). It's the language of family, friends, music and series — but is almost never written in its pure form.

The difference isn't like 'literary English' versus 'spoken English': it's closer to the difference between Latin and Italian — two related registers, but with distinct vocabulary, grammar and pronunciation.

## 2. Practical uses: when to use each

**Choose Lebanese if you want to:**

- talk with Lebanese family, a partner or friends;
- travel to Lebanon, Syria, Jordan or Palestine;
- understand music (Fairuz, Nancy Ajram, Mashrou' Leila) and popular series;
- use the language on TikTok, Instagram or in informal conversations;
- reach real conversations in months, not years.

**Choose Fusha (MSA) if you want to:**

- read newspapers, books or religious texts;
- pursue academic studies or work in diplomacy / official translation;
- follow news broadcasts (Al Jazeera, BBC Arabic);
- have a solid base for later understanding other dialects in writing.

In practice, most adults learning Arabic for real communication start with **a dialect** — and add Fusha later, if needed.

## 3. Which is harder to learn?

Both share challenges for an English speaker: the 'hard' sounds (**ع, ح, ق**), right-to-left writing and a vocabulary with no common roots to European languages.

Beyond that, **Fusha is significantly harder** for a beginner:

- **Grammatical cases** (nominative, accusative, genitive) marked with endings — Lebanese doesn't use them.
- **Dual conjugations and more complex verb forms**; Lebanese has a regularised system, closer to everyday speech.
- **Formal vocabulary**, heard far less often — hard to retain without constant exposure.

With **2–3 hours of study a week**, a beginner can hold simple conversations in Lebanese in 4–6 months. The same 'conversational' level in Fusha usually takes 2–3 times longer, because Fusha isn't used in conversation — so real practice is missing.

## 4. Cultural context: why Lebanese is 'media-friendly'

For decades, Lebanon has produced an enormous amount of cultural content in dialect — from the music of **Fairuz** and the Rahbani brothers, to soap operas broadcast across the Arab world and TikTok and YouTube creators. The Lebanese dialect is widely understood across the region, even by Egyptian or Gulf Arabic speakers.

Modern Lebanese also carries strong influences from **French, English, Aramaic and Turkish**, and in Beirut you routinely hear sentences like '*Hi, kifak? Ça va?*'. It's a language with personality — and a window into a living culture, not just written texts.

## 5. Quick comparison table

| Criterion | Lebanese (dialect) | Fusha / MSA |
| --- | --- | --- |
| Used for | Daily conversation, family, travel, media | Writing, news, official texts, religion |
| Who speaks it natively | ~30M speakers (Lebanon, Syria, Jordan, Palestine) | No one as a mother tongue |
| Grammar | Simplified, no cases | Complex, with cases and dual forms |
| Time to conversation | ~4–6 months | ~12–18 months (and rarely used in speech) |
| Writing | Rare; often in Latin transliteration | Standard, in the Arabic alphabet |
| Ideal for | Communication, culture, family | Academic study, reading, formal contexts |

## 6. What should you choose?

A practical rule for adults who want to learn Arabic:

- **You want to speak** — with family, on holiday, on social media, at work with Lebanese clients → start with **Lebanese Arabic**. Progress shows within weeks.
- **You want to read and write** — for academic study, the Quran, newspapers, official contexts → start with **Fusha (MSA)**.
- **You want both** — start with Lebanese (fast results, motivation), and add Fusha after 6–12 months once the phonetic and vocabulary base is formed.

At the **Lebanese Arabic Center with Ibra** we teach the Lebanese dialect *directly*, with a native teacher, for adults and children — in person in Bucharest or online. We integrate Fusha gradually from level B1, when it's truly useful.

Concrete steps:

- Take the [free level test](/quiz) to find where you start.
- See the [group courses](/cursuri/grup) (structured on CEFR levels A1–C2) or [private lessons](/cursuri/private) (personalised pace).
- For kids, we have a [dedicated programme](/cursuri/copii) in person in Bucharest.
- See also the article [How to learn Lebanese Arabic in 2026](/blog/cum-inveti-araba-libaneza) for a step-by-step guide.`,
  },

  "cum-inveti-araba-libaneza": {
    lead_ro: "Diferențe față de araba standard, cât timp îți ia, cele mai bune metode de învățare, greșeli frecvente și primele fraze utile — tot ce trebuie să știi înainte să începi.",
    lead_en: "How it differs from Standard Arabic, how long it takes, the best learning methods, common mistakes and the first useful phrases — everything you need to know before you start.",
    ro: `## 1. Ce este araba libaneză și cum diferă de celelalte dialecte

Araba libaneză face parte din familia dialectelor levantine (împreună cu araba siriană, palestiniană și iordaniană), care sunt în mare parte inteligibile reciproc. Se deosebește de araba egipteană și de cea din Golf prin pronunție, vocabular și intonație, dar și prin influențele puternice din franceză, engleză, aramaică și turcă.

În practică, dacă înveți araba libaneză vei fi înțeles fără probleme în Liban, Siria, Iordania și Palestina, iar în Egipt, Golf și Africa de Nord vei putea comunica după o scurtă perioadă de expunere la dialectul local. Este unul dintre cele mai „media-friendly” dialecte — apare frecvent în muzică, seriale și pe rețelele sociale.

## 2. Trebuie să înveți întâi araba standard (Fusha)?

Răspunsul scurt: **nu, dacă scopul tău este să vorbești**. Araba standard modernă (MSA / Fusha) este limba scrisă, folosită în știri, ziare și documente oficiale. Aproape nimeni nu o folosește în conversații zilnice.

Dacă vrei să comunici cu familia, să călătorești în Liban, să înțelegi muzica și serialele sau să lucrezi cu vorbitori nativi, începe direct cu dialectul libanez. Vei ajunge la conversații reale mult mai repede. Fusha rămâne utilă mai târziu — mai ales pentru citit, scris academic sau context religios.

## 3. Este araba libaneză grea? Cât durează să devii conversațional?

Pentru un vorbitor de română, araba libaneză are câteva sunete noi (ع, ح, ق) și o structură gramaticală diferită, dar este un dialect **mai simplu decât Fusha**: conjugările sunt mai regulate, cazurile gramaticale nu se folosesc, iar vocabularul de zi cu zi este limitat și repetitiv.

- **1–3 luni:** te prezinți, comanzi la restaurant, întrebi indicații.
- **6 luni:** conversații simple pe teme familiare.
- **12–18 luni:** conversație fluentă cu practică regulată (2–3 ore/săptămână).

Factorul decisiv nu este talentul, ci **consecvența** și cât de mult vorbești, nu doar citești sau asculți.

## 4. Cele mai bune metode de învățare

Combinația care funcționează pentru majoritatea adulților:

- **Un profesor nativ** (grup sau 1:1) — pentru pronunție corectă și feedback imediat. Apps precum Duolingo nu predau libaneza.
- **Input zilnic ușor:** muzică libaneză (Fairuz, Nancy Ajram), seriale de pe Shahid / Netflix, conturi de TikTok și YouTube în libaneză.
- **Vocabular tematic** (mâncare, familie, cumpărături) în loc de liste lungi de cuvinte scoase din context.
- **Vorbire de la lecția 1** — chiar și fraze greșite spuse cu voce tare progresează mai repede decât citirea în tăcere.

Poți învăța [online sau fizic în București](/cursuri) — ambele funcționează, dacă ai un profesor care corectează pronunția.

## 5. Greșeli frecvente pe care le fac începătorii

- **Amestecă Fusha cu libaneza** — sună artificial și vorbitorii nativi vor răspunde în engleză.
- **Se blochează pe alfabet** înainte să spună un cuvânt. Poți începe cu transliterație și adăugi scrisul mai târziu.
- **Traduc din română cuvânt-cu-cuvânt** — ordinea cuvintelor și expresiile sunt diferite.
- **Ignoră sunetele „grele”** (ع, ح, ق). Cu 10 minute pe zi de exersare devin naturale în câteva săptămâni.
- **Învață izolat**, fără să vorbească niciodată cu cineva. Rezultatul: înțelegi, dar nu poți răspunde.

## 6. Primele 10 fraze utile în araba libaneză

- **Marhaba** — Bună
- **Kifak? / Kifik?** — Ce faci? (către bărbat / femeie)
- **Mnih, shukran** — Bine, mulțumesc
- **Shu ismak? / ismik?** — Cum te cheamă?
- **Ana ismi…** — Numele meu este…
- **Ana mn Rumania** — Sunt din România
- **Btehki inglizi?** — Vorbești engleză?
- **Addesh?** — Cât costă?
- **Wein el ḥammem?** — Unde este toaleta?
- **Yalla, bye!** — Hai, pa!

## 7. Următorii pași

Cel mai important pas este să începi să vorbești cu cineva săptămâna aceasta — nu peste o lună, când „vei fi gata”. Poți:

- Vezi [testul de nivel gratuit](/quiz) ca să afli de unde pornești.
- Alege un [curs de grup](/cursuri/grup) (mai accesibil, mai motivant) sau [lecții private](/cursuri/private) (ritm personalizat).
- Pentru copii, avem un [program dedicat](/cursuri/copii) fizic în București.`,
    en: `## 1. What Lebanese Arabic is and how it differs from other dialects

Lebanese Arabic is part of the Levantine dialect family (together with Syrian, Palestinian and Jordanian Arabic), which are largely mutually intelligible. It differs from Egyptian and Gulf Arabic in pronunciation, vocabulary and intonation, and also in its strong influences from French, English, Aramaic and Turkish.

In practice, if you learn Lebanese Arabic you'll be understood without trouble in Lebanon, Syria, Jordan and Palestine, and in Egypt, the Gulf and North Africa you'll be able to communicate after a short period of exposure to the local dialect. It's one of the most 'media-friendly' dialects — it appears often in music, series and on social media.

## 2. Do you need to learn Standard Arabic (Fusha) first?

The short answer: **no, if your goal is to speak**. Modern Standard Arabic (MSA / Fusha) is the written language, used in news, newspapers and official documents. Almost no one uses it in daily conversation.

If you want to communicate with family, travel to Lebanon, understand music and series, or work with native speakers, start directly with the Lebanese dialect. You'll reach real conversations much faster. Fusha stays useful later — especially for reading, academic writing or religious contexts.

## 3. Is Lebanese Arabic hard? How long until you're conversational?

For an English speaker, Lebanese Arabic has a few new sounds (ع, ح, ق) and a different grammatical structure, but it's a dialect **simpler than Fusha**: conjugations are more regular, grammatical cases aren't used, and everyday vocabulary is limited and repetitive.

- **1–3 months:** introduce yourself, order at a restaurant, ask for directions.
- **6 months:** simple conversations on familiar topics.
- **12–18 months:** fluent conversation with regular practice (2–3 hours/week).

The deciding factor isn't talent, but **consistency** and how much you speak, not just read or listen.

## 4. The best learning methods

The combination that works for most adults:

- **A native teacher** (group or 1:1) — for correct pronunciation and immediate feedback. Apps like Duolingo don't teach Lebanese.
- **Easy daily input:** Lebanese music (Fairuz, Nancy Ajram), series on Shahid / Netflix, TikTok and YouTube accounts in Lebanese.
- **Thematic vocabulary** (food, family, shopping) instead of long lists of words out of context.
- **Speaking from lesson 1** — even wrong phrases said out loud progress faster than silent reading.

You can learn [online or in person in Bucharest](/cursuri) — both work, if you have a teacher who corrects pronunciation.

## 5. Common mistakes beginners make

- **Mixing Fusha with Lebanese** — it sounds artificial and native speakers will reply in English.
- **Getting stuck on the alphabet** before saying a word. You can start with transliteration and add writing later.
- **Translating word-for-word** — word order and expressions are different.
- **Ignoring the 'hard' sounds** (ع, ح, ق). With 10 minutes a day of practice they become natural in a few weeks.
- **Learning in isolation**, never speaking with anyone. The result: you understand, but you can't reply.

## 6. The first 10 useful phrases in Lebanese Arabic

- **Marhaba** — Hello
- **Kifak? / Kifik?** — How are you? (to a man / woman)
- **Mnih, shukran** — Good, thanks
- **Shu ismak? / ismik?** — What's your name?
- **Ana ismi…** — My name is…
- **Ana mn Rumania** — I'm from Romania
- **Btehki inglizi?** — Do you speak English?
- **Addesh?** — How much is it?
- **Wein el ḥammem?** — Where is the toilet?
- **Yalla, bye!** — Alright, bye!

## 7. Next steps

The most important step is to start speaking with someone this week — not in a month, when you'll 'be ready'. You can:

- Take the [free level test](/quiz) to find where you start.
- Choose a [group course](/cursuri/grup) (more affordable, more motivating) or [private lessons](/cursuri/private) (personalised pace).
- For kids, we have a [dedicated programme](/cursuri/copii) in person in Bucharest.`,
  },

  "invata-araba-libaneza-online": {
    lead_ro: "Cu profesor nativ, de oriunde din lume — cum arată o lecție online, ce îți trebuie și de ce funcționează la fel de bine ca la clasă.",
    lead_en: "With a native teacher, from anywhere in the world — what an online lesson looks like, what you need and why it works just as well as the classroom.",
    ro: `Nu trebuie să locuiești în București — și nici măcar în România — ca să înveți araba libaneză cu profesor nativ. Cursurile noastre online se țin pe Zoom, cu aceeași metodă și același profesor ca cele fizice. Dacă faci parte din diaspora libaneză, ai familie libaneză sau vrei pur și simplu dialectul viu de oriunde te-ai afla, online e făcut pentru tine.

## De ce ai nevoie

- Un laptop sau telefon cu cameră și microfon.
- O conexiune stabilă la internet și un loc liniștit.
- Zoom (gratuit) — îți trimitem linkul înainte de fiecare lecție.
- Atât. Materialele audio și suportul sunt incluse.

## Cum arată o lecție online

E o lecție live, nu o înregistrare. Vezi și auzi profesorul, vorbești din primele minute și ești corectat pe loc — exact metoda [Oral First](/blog/cum-inveti-araba-libaneza). Profesorul împarte ecranul pentru cuvinte și expresii, exersezi cu [arabizi](/blog/ce-este-arabizi) și treci treptat la scrierea arabă, iar din fiecare lecție pleci putând spune ceva nou.

## E online la fel de bun ca fizic?

Pentru un dialect vorbit, da. Ce contează cel mai mult este timpul de vorbire cu un profesor nativ și feedbackul imediat pe pronunție — și le ai pe amândouă complet online. Mulți cursanți chiar preferă online: fără drum, program mai ușor și poți relua înregistrări din propria practică. Singurul lucru pe care online-ul nu-l poate înlocui e cafeaua de după.

## Grup sau privat, online

Toate nivelurile noastre au o variantă online. Poți intra într-un [curs de grup](/cursuri/grup) online — mai accesibil și mai motivant, înveți alături de colegi de nivelul tău — sau poți alege [lecții private 1:1](/cursuri/private) online, pentru ritm și program complet personalizate.

## Cohorta online — și următoarea

Grupa A1 online (începători compleți) este deja în desfășurare și toate cele 10 locuri sunt ocupate. Deschidem o grupă nouă imediat ce sunt suficienți înscriși, așa că lasă-ți datele și te anunțăm primul pe email. Între timp poți începe oricând cu lecții private online sau te poți alătura online la un nivel mai avansat.

Nu știi de unde ai porni? Fă [testul de nivel gratuit](/quiz) (2 minute), sau vezi [cât durează fiecare nivel](/blog/cat-dureaza-sa-inveti-araba-libaneza).`,
    en: `You don't have to live in Bucharest — or even in Romania — to learn Lebanese Arabic with a native teacher. Our online courses run over Zoom, with the same method and the same teacher as the in-person ones. If you're part of the Lebanese diaspora, have Lebanese family, or simply want the living dialect from wherever you are, online is made for you.

## What you need

- A laptop or phone with a camera and microphone.
- A stable internet connection and a quiet spot.
- Zoom (free) — we send you the link before each lesson.
- That's it. Audio materials and support are included.

## What an online lesson looks like

It's a live lesson, not a recording. You see and hear the teacher, you speak from the first minutes, and you get corrected on the spot — exactly the [Oral First](/blog/cum-inveti-araba-libaneza) method. The teacher shares the screen for words and phrases, you practise with [Arabizi](/blog/ce-este-arabizi) and move gradually to the Arabic script, and you leave each lesson able to say something new.

## Is online as good as in person?

For a spoken dialect, yes. What matters most is speaking time with a native teacher and immediate feedback on pronunciation — and you get both fully online. Many students actually prefer it: no commute, easier scheduling, and you can review recordings of your own practice. The only thing online can't replace is the coffee afterwards.

## Group or private, online

All our levels have an online variant. You can join an online [group course](/cursuri/grup) — more affordable and more motivating, learning alongside peers at your level — or take [private 1:1 lessons](/cursuri/private) online for a fully personalised pace and schedule.

## The online cohort — and the next one

The A1 online group (complete beginners) is already running and all 10 seats are taken. We open a new online cohort as soon as enough people are waiting, so leave your details and we'll email you first. In the meantime you can start straight away with online private lessons, or join a higher level online.

Not sure where you'd start? Take the [free level test](/quiz) (2 minutes), or see [how long each level takes](/blog/cat-dureaza-sa-inveti-araba-libaneza).`,
  },

  "numere-in-araba-libaneza": {
    lead_ro: "Cifrele de care ai nevoie în piață, în taxi și la cafenea — cu pronunție în arabizi și scriere arabă.",
    lead_en: "The numbers you need at the market, in a taxi and at the café — with Arabizi pronunciation and Arabic script.",
    ro: `Numerele sunt printre primele lucruri pe care le și folosești într-o limbă nouă — prețuri, ore, numere de telefon, vârsta. Vestea bună: în libaneză îți ajung câteva ca să te descurci. Iată-le, cu [arabizi](/blog/ce-este-arabizi) și scriere arabă.

## De la 0 la 10

| Număr | Arabizi | Arabă |
| --- | --- | --- |
| 0 | sifr | صفر |
| 1 | wa7ad | واحد |
| 2 | tnein | تنين |
| 3 | tlete | تلاتة |
| 4 | arb3a | أربعة |
| 5 | khamse | خمسة |
| 6 | sitte | ستة |
| 7 | sab3a | سبعة |
| 8 | tmene | تمانية |
| 9 | tis3a | تسعة |
| 10 | 3ashra | عشرة |

## Zeci, sute, mii

| Număr | Arabizi | Arabă |
| --- | --- | --- |
| 11 | 7da3sh | حدعش |
| 12 | tna3sh | طنعش |
| 20 | 3eshrin | عشرين |
| 30 | tletin | تلاتين |
| 50 | khamsin | خمسين |
| 100 | miyye | مية |
| 1000 | alf | ألف |

Între 21 și 99, în libaneză spui întâi unitatea, apoi zecea: 21 e „wa7ad w 3eshrin” (unu-și-douăzeci), 35 e „khamse w tletin” (cinci-și-treizeci). Micul „w” înseamnă „și”.

## Unde le folosești imediat

- **Addesh?** — „cât costă?” Răspunsul vine în aceste numere, de obicei în *lira* sau dolari.
- Numerele de telefon se citesc cifră cu cifră — înșiri pur și simplu lista de la 0 la 10.
- Vârsta ta: „vârsta” e *3omr* — „3omri tletin” înseamnă „am treizeci de ani”.

## Exersează-le cu voce tare

Numerele se prind cel mai repede când le spui pe bune — numeri restul, spui ora, dai numărul de telefon. La o [lecție de probă gratuită](/trial) le exersezi cu un profesor nativ, iar apoi poți continua cu [primele 20 de expresii libaneze](/blog/primele-20-de-expresii-libaneze).`,
    en: `Numbers are among the first things you actually use in a new language — prices, time, phone numbers, your age. The good news: in Lebanese you only need a handful to get by. Here they are, with [Arabizi](/blog/ce-este-arabizi) pronunciation and Arabic script.

## 0 to 10

| Number | Arabizi | Arabic |
| --- | --- | --- |
| 0 | sifr | صفر |
| 1 | wa7ad | واحد |
| 2 | tnein | تنين |
| 3 | tlete | تلاتة |
| 4 | arb3a | أربعة |
| 5 | khamse | خمسة |
| 6 | sitte | ستة |
| 7 | sab3a | سبعة |
| 8 | tmene | تمانية |
| 9 | tis3a | تسعة |
| 10 | 3ashra | عشرة |

## Tens, hundreds, thousands

| Number | Arabizi | Arabic |
| --- | --- | --- |
| 11 | 7da3sh | حدعش |
| 12 | tna3sh | طنعش |
| 20 | 3eshrin | عشرين |
| 30 | tletin | تلاتين |
| 50 | khamsin | خمسين |
| 100 | miyye | مية |
| 1000 | alf | ألف |

Between 21 and 99, Lebanese says the unit first, then the ten: 21 is 'wa7ad w 3eshrin' (one-and-twenty), 35 is 'khamse w tletin' (five-and-thirty). The little 'w' means 'and'.

## Where you'll use them right away

- **Addesh?** — 'how much?' The answer comes back in these numbers, usually in *lira* or dollars.
- Phone numbers are read digit by digit — just string the 0–10 list together.
- Your age: 'age' is *3omr* — '3omri tletin' means 'I'm thirty'.

## Practise them out loud

Numbers stick fastest when you say them for real — counting change, telling the time, giving your phone number. In a [free trial lesson](/trial) you practise them with a native teacher, and you can continue with the [first 20 Lebanese phrases](/blog/primele-20-de-expresii-libaneze).`,
  },
};
