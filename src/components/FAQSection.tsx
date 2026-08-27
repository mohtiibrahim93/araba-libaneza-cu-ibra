import { useI18n } from "@/lib/i18n";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QA = { q: string; a: string };
type FAQGroup = { title: string; items: QA[] };

const FAQ_CONTENT: Record<"ro" | "en", { groups: FAQGroup[] }> = {
  ro: {
    groups: [
      {
        title: "Libanezii și limba arabă — întrebări frecvente",
        items: [
          {
            q: "Libanezii sunt arabi?",
            a: "Da — Libanul este parte din Liga Arabă, iar araba este limba oficială a țării. În același timp, mulți libanezi au și o identitate culturală proprie (feniciană, levantină, creștină sau druză), motiv pentru care unii preferă să se identifice ca „libanezi” înainte de „arabi”. Pe scurt: din punct de vedere lingvistic și politic da, cultural este mai nuanțat.",
          },
          {
            q: "Libanezii vorbesc arabă?",
            a: "Da. Limba maternă a majorității libanezilor este araba libaneză (un dialect levantin), pe care o vorbesc zilnic acasă, la muncă și în media. Mulți vorbesc și franceză sau engleză, dar araba libaneză rămâne limba principală de comunicare.",
          },
          {
            q: "Libaneza este arabă sau o limbă separată?",
            a: "Libaneza este un dialect al arabei — parte din familia levantină (împreună cu siriana, palestiniana și iordaniana). Se scrie cu alfabetul arab și împarte majoritatea vocabularului cu Araba Standard Modernă (Fusha), dar pronunția, gramatica simplificată și influențele din franceză, turcă și aramaică o fac să sune distinct.",
          },
          {
            q: "Care este diferența dintre araba libaneză și araba „standard” (Fusha)?",
            a: "Fusha este araba formală folosită în știri, cărți și contexte oficiale — nimeni nu o vorbește acasă. Libaneza este limba vie a străzii: propoziții mai scurte, vocale mai relaxate, ق devine adesea stop glotal, și cuvinte împrumutate din franceză. Dacă vrei să vorbești cu oameni, alegi libaneza; dacă vrei să citești ziare, alegi Fusha.",
          },
        ],
      },
      {
        title: "Cum alegi un profesor de arabă",
        items: [
          {
            q: "Ce experiență de predare are profesorul și este vorbitor nativ?",
            a: "Ibra este vorbitor nativ de arabă libaneză, cu ani de experiență în predare — atât în grup, cât și 1:1, pentru cursanți de toate nivelurile. Predă dialectul libanez (levantin), limba vie vorbită zilnic, nu doar araba clasică din manuale.",
          },
          {
            q: "Ce metodă de predare folosiți și cum adaptați lecțiile la nivelul meu?",
            a: "Folosim metoda Oral First: vorbești din primele lecții, cu arabizi la început și trecere treptată la alfabetul arab. Grupele sunt mici, cu feedback constant; pentru obiective specifice există lecții private 1:1 adaptate ritmului tău.",
          },
          {
            q: "Cât durează lecțiile, cât de des sunt și în ce format (online sau fizic)?",
            a: "Cursurile de grup au 2 lecții de 90 de minute pe săptămână, seara. Poți alege fizic (Raduga Creative Center, București) sau online pe Zoom. Lecțiile private se programează flexibil, inclusiv în weekend.",
          },
          {
            q: "Cât costă, ce politică de anulare aveți și există o lecție de probă?",
            a: "Prețurile sunt transparente, fără costuri ascunse — plată lunară sau integrală (cu 10% reducere). Abonamentele se pot anula oricând, cu rambursare proporțională în primele 5 zile. Prima lecție este o probă gratuită de 30 de minute.",
          },
          {
            q: "Aveți recenzii de la cursanți și cât de repede se văd rezultatele?",
            a: "Da — recenzii reale verificate (5.0★ pe Preply). Vorbești de la prima lecție, iar pentru conversații simple majoritatea cursanților ajung acolo în 3–6 luni (nivel A1–A2), în funcție de ritm.",
          },
          {
            q: "La ce semnale de alarmă să fiu atent când aleg un profesor de arabă?",
            a: "Evită: un vorbitor nativ fără experiență de predare (a ști o limbă nu înseamnă a o preda), lecții generice fără adaptare la nivelul tău, și costuri ascunse sau program rigid fără lecție de probă. Cel mai sigur test rămâne o lecție de probă gratuită.",
          },
        ],
      },
      {
        title: "Alegerea dialectului",
        items: [
          {
            q: "Ar trebui să învăț mai întâi Araba Standard Modernă (Fusha) sau direct libaneza?",
            a: "Dacă scopul tău este să vorbești cu familia, să călătorești în Liban sau să înțelegi filme și muzică, poți începe direct cu araba libaneză — este dialectul vorbit zilnic. Fusha este utilă mai ales pentru citit știri, texte religioase sau contexte formale. La cursurile noastre plecăm de la libaneză și introducem elemente de Fusha doar cât e nevoie.",
          },
          {
            q: "Care este diferența dintre araba libaneză și cea levantină, egipteană sau din Golf?",
            a: "Libaneza face parte din familia levantină (împreună cu siriana, palestiniana și iordaniana) — foarte apropiate între ele. Egipteana și dialectele din Golf au vocabular și pronunție diferite. Cu libaneză înțelegi ușor toată zona levantină și, cu puțin exercițiu, urmărești și celelalte dialecte.",
          },
          {
            q: "Este libaneza înțeleasă în alte țări arabe?",
            a: "Da. Datorită muzicii, filmelor și serialelor libaneze răspândite în toată lumea arabă, dialectul libanez este unul dintre cele mai bine înțelese peste tot — din Maroc până în Golf.",
          },
          {
            q: "Dacă vreau doar să vorbesc cu familia / să călătoresc / pentru muncă, am nevoie de Fusha?",
            a: "Nu neapărat. Pentru comunicare orală zilnică, libaneza este suficientă. Fusha devine utilă doar dacă vrei să citești presă, cărți sau documente formale, sau să lucrezi în medii oficiale.",
          },
        ],
      },
      {
        title: "Dificultate și timp",
        items: [
          {
            q: "Este araba libaneză grea de învățat?",
            a: "Are câteva sunete noi pentru vorbitorii de română (ex. ع, ح, ق), dar gramatica dialectului este mai simplă decât la Fusha — fără cazuri complicate. Cu 2–3 ore pe săptămână și exercițiu constant, progresezi vizibil în câteva luni.",
          },
          {
            q: "Cât durează până devin conversațional?",
            a: "În general, 3–6 luni de studiu constant (echivalent A1–A2) sunt suficiente pentru conversații simple: prezentări, cumpărături, întâlniri cu familia. Cursul nostru A1 durează ~3 luni, cu 2 lecții de 90 de minute pe săptămână.",
          },
          {
            q: "Cât durează până ajung la fluență?",
            a: "Fluența reală (B2–C1) cere de obicei 1,5–3 ani de practică susținută, în funcție de cât de des vorbești în afara clasei. Un ritm realist: A1 în 3 luni, A2 în încă 6, B1–B2 în 1–2 ani.",
          },
          {
            q: "Libaneza este mai ușoară decât Fusha?",
            a: "Da, pentru majoritatea cursanților. Gramatica dialectului este simplificată (fără sufixe de caz, verbe mai regulate în vorbire), iar pronunția este mai apropiată de vorbirea firească.",
          },
        ],
      },
      {
        title: "Drumul de învățare și resurse",
        items: [
          {
            q: "Care este cea mai bună metodă de a învăța araba libaneză?",
            a: "Combinația care funcționează cel mai bine: un curs structurat cu profesor nativ + practică zilnică scurtă (10–20 min) + expunere la conținut real (muzică, seriale, conversații). Aplicațiile singure sunt insuficiente pentru un dialect.",
          },
          {
            q: "Există cărți, aplicații sau site-uri bune pentru libaneză?",
            a: "Resursele dedicate libanezei sunt limitate față de Fusha. Recomandăm materialele dezvoltate de instructor la cursul nostru, plus consum de conținut nativ (Fairuz, seriale MTV Lebanon, podcasturi libaneze) pentru ureche.",
          },
          {
            q: "Pot învăța online eficient sau am nevoie de lecții fizice?",
            a: "Da, se poate învăța foarte bine online cu profesor nativ pe Zoom — mulți cursanți fac exact așa. Lecțiile fizice la Raduga Creative Center în București sunt o alternativă pentru cei care preferă interacțiunea directă.",
          },
          {
            q: "Trebuie să învăț alfabetul arab de la început?",
            a: "Nu obligatoriu. Începem cu transliterare latină pentru a te concentra pe vorbire, iar alfabetul îl introducem treptat — pentru cei care vor să citească și să scrie. Poți vorbi libaneză fluent fără să citești în arabă.",
          },
        ],
      },
      {
        title: "Aspecte practice",
        items: [
          {
            q: "Mă descurc în Liban cu engleza / franceza sau am nevoie de arabă?",
            a: "În Beirut și zonele turistice te descurci cu engleza și franceza. Dar orice frază în libaneză schimbă complet primirea — este apreciată enorm și îți deschide uși pe care limbile străine nu le deschid.",
          },
          {
            q: "Este utilă pentru afaceri, călătorii sau familie?",
            a: "Da, pentru toate trei. Afaceri: comunicare directă cu parteneri din Liban, Siria, Iordania. Călătorii: acces autentic la cultură. Familie: reconectare cu rude și moștenire culturală — motivul cel mai frecvent al cursanților noștri.",
          },
          {
            q: "Mă va ajuta să înțeleg cântecele, filmele și rețelele sociale?",
            a: "Da. Muzica libaneză (Fairuz, Wael Kfoury), serialele și influencerii libanezi folosesc dialectul libanez. După A2 începi să prinzi fraze întregi, iar la B1 înțelegi majoritatea conținutului cotidian.",
          },
          {
            q: "Cum exersez vorbirea dacă nu trăiesc în Liban?",
            a: "La curs practici cu profesorul nativ și cu ceilalți cursanți. În plus recomandăm: parteneri de conversație (tandem), consum zilnic de conținut libanez, exerciții de shadowing (repetare după audio nativ) și un jurnal vorbit de 5 minute pe zi.",
          },
        ],
      },
      {
        title: "Despre cursurile noastre",
        items: [
          {
            q: "Predați adulților, adolescenților și copiilor?",
            a: "Tuturor. Avem cursuri de grup și private pentru adulți și adolescenți (11–17 ani), toate nivelurile CEFR, plus un program dedicat copiilor de 6–10 ani, cu activități potrivite vârstei.",
          },
          {
            q: "Cursurile sunt online sau fizice în București?",
            a: "Ambele. Cursurile de grup pentru adulți sunt fizice la Raduga Creative Center și online pe Zoom. Cursurile pentru copii sunt doar fizice (până la 10 ani) sau fizic/online (de la 10 ani). Lecțiile private sunt flexibile: fizice sau online.",
          },
          {
            q: "Ce opțiuni de orar sunt pentru oameni care lucrează?",
            a: "Cursurile de grup au 2 lecții de 90 de minute pe săptămână, seara. Lecțiile private se programează flexibil, inclusiv weekend, în funcție de disponibilitatea ta.",
          },
          {
            q: "Cât costă și există planuri de plată?",
            a: "Poți alege plata integrală (cu reducere de 10%) sau plata lunară. Acceptăm card, transfer bancar, cash și PayPal, în LEI, EUR sau USD. Prețurile exacte le vezi în secțiunea Prețuri.",
          },
          {
            q: "Există lecție de probă?",
            a: "Da — oferim o lecție de probă gratuită de 30 de minute, ca să cunoști instructorul, să testezi metoda și să vezi dacă formatul ți se potrivește înainte de înscriere.",
          },
          {
            q: "Ce nivel CEFR voi atinge după curs?",
            a: "Depinde de nivelul de start. Cursul A1 te aduce la nivel A1 complet (~3 luni), A2 la A2 (~6 luni), iar B1–C2 durează între 8 și 10 luni fiecare. La final primești o evaluare a nivelului atins.",
          },
        ],
      },
      {
        title: "Specific limbii",
        items: [
          {
            q: "Ce greșeli fac cel mai des începătorii?",
            a: "Cele mai comune: pronunțarea sunetelor guturale (ع, ح) ca vocale obișnuite, folosirea structurii din Fusha în conversație (sună forțat), și traducerea cuvânt cu cuvânt din română. Le corectăm din primele lecții.",
          },
          {
            q: "Cu ce diferă pronunția libaneză de Fusha?",
            a: "Libaneza scurtează vocale lungi, transformă ق într-un stop glotal (hamza) în majoritatea cuvintelor și înmoaie unele consoane. Rezultatul: vorbire mai rapidă și mai muzicală decât Fusha.",
          },
          {
            q: "Care sunt cele mai utile cuvinte de întrebare și fraze pentru început?",
            a: "Câteva de care ai nevoie din prima zi: shu? (ce?), wein? (unde?), meen? (cine?), kif? (cum?), addesh? (cât?), aymta? (când?), plus marhaba (salut), kifak/kifik (ce mai faci — m/f), shukran (mulțumesc), yalla (haide).",
          },
        ],
      },
      {
        title: "Gramatica arabei libaneze",
        items: [
          {
            q: "Ce face prefixul بـ (b-) la verbe în araba libaneză?",
            a: "Prefixul بـ (b-) marchează prezentul obișnuit sau general — echivalentul lui „fac / mănânc / merg” în română. Exemplu: bektob = scriu (în general), bshoof = văd. Fără بـ, verbul devine subjonctiv / după alt verb: baddi ektob = vreau să scriu (fără b-). Regulă rapidă: acțiune reală, care se petrece / se petrece de obicei → cu بـ; după verbe modale (vreau, pot, trebuie) → fără بـ.",
          },
          {
            q: "Cum se conjugă verbele la trecut cu pronume atașate (katabt-ha, katab-lak)?",
            a: "În libaneză conjugi verbul la trecut apoi lipești pronumele obiect la sfârșit. Exemplu de la katab (a scris): katabt = am scris, katabt-a = am scris-o (fem.), katabt-o = am scris-l (masc.), katab-lak = ți-a scris (ție, m.), katab-lek = ți-a scris (ție, f.), katabna-hon = le-am scris (lor). Pronumele -lak, -lek, -lo, -la, -lna, -lkon, -lhon indică beneficiarul („pentru / către cineva”), iar -a, -o, -hon indică obiectul direct.",
          },
          {
            q: "Care sunt pronumele personale și posesive în araba libaneză?",
            a: "Personale: ana (eu), inta / inti (tu m/f), huwwe / hiyye (el/ea), nihna (noi), intu (voi), hinne (ei/ele). Posesive (atașate la substantiv): -i (al meu), -ak / -ek (al tău m/f), -o (al lui), -(h)a (al ei), -na (al nostru), -kon (al vostru), -hon (al lor). Exemplu: bayt = casă → bayti (casa mea), baytak (casa ta), bayto (casa lui), bayta (casa ei).",
          },
          {
            q: "Ordinea cuvintelor în araba libaneză este VSO sau SVO?",
            a: "În vorbire, libaneza folosește de obicei SVO (subiect-verb-obiect) — ca româna și engleza: „Ahmad byekol tuffaha” (Ahmad mănâncă un măr). MSA / araba clasică preferă VSO („Mănâncă Ahmad un măr”), dar în conversație zilnică libanezii aleg aproape mereu SVO. Asta face libaneza mai naturală pentru un vorbitor de română.",
          },
          {
            q: "Prin ce diferă gramatica arabei libaneze de MSA?",
            a: "Libaneza simplifică mult MSA: fără terminații de caz (dammah, kasrah, fathah), fără dual complet (folosim pluralul), fără femininul de plural separat la verbe (hinne acoperă tot), timpul viitor cu رح / ح- (rah rooh = voi merge) în loc de سـ, negație cu ما (ma) simplu în loc de لا/لم/لن, și ordine SVO în loc de VSO. Rezultat: aceleași rădăcini, mult mai puține reguli — de aceea libaneza e mai ușor de vorbit decât MSA.",
          },
        ],
      },
    ],
  },
  en: {
    groups: [
      {
        title: "Lebanese people & the Arabic language — quick answers",
        items: [
          {
            q: "Are Lebanese people Arabs?",
            a: "Yes — Lebanon is a member of the Arab League, and Arabic is the country's official language. That said, many Lebanese also identify with a distinct cultural heritage (Phoenician, Levantine, Christian, or Druze), so some prefer to describe themselves as \"Lebanese\" first and \"Arab\" second. In short: linguistically and politically yes, culturally it's more nuanced.",
          },
          {
            q: "What's the difference between Lebanese Arabic and Modern Standard Arabic?",
            a: "MSA (Fusha) is the formal Arabic used in news, books, and official settings — nobody actually speaks it at home. Lebanese is the living street language: shorter sentences, relaxed vowels, ق often becoming a glottal stop, and French loanwords. If you want to talk to people, learn Lebanese; if you want to read newspapers, learn Fusha.",
          },
          {
            q: "Should I learn Egyptian or Levantine Arabic?",
            a: "It depends on where your people are. Egyptian Arabic has the biggest media footprint (films, music) and is widely understood. Levantine — especially Lebanese — dominates modern pop music, satellite TV, and business across Lebanon, Syria, Jordan, and Palestine, and is also very widely understood. If your ties are to the Levant, learn Lebanese.",
          },
        ],
      },
      {
        title: "Choosing an Arabic tutor",
        items: [
          {
            q: "How much teaching experience does the tutor have, and are they a native speaker?",
            a: "Ibra is a native Lebanese Arabic speaker with years of teaching experience — both in groups and 1:1, for students at all levels. He teaches the Lebanese (Levantine) dialect, the living everyday language, not just textbook Classical Arabic.",
          },
          {
            q: "What teaching method do you use, and how do you adapt lessons to my level?",
            a: "We use the Oral First method: you speak from the very first lessons, starting with Arabizi and moving gradually to the Arabic alphabet. Groups are small with constant feedback; for specific goals there are private 1:1 lessons tailored to your pace.",
          },
          {
            q: "How long and how often are lessons, and in what format (online or in person)?",
            a: "Group courses are two 90-minute lessons per week, in the evening. You can choose in person (Raduga Creative Center, Bucharest) or online via Zoom. Private lessons are scheduled flexibly, including weekends.",
          },
          {
            q: "How much does it cost, what's the cancellation policy, and is there a trial lesson?",
            a: "Prices are transparent with no hidden fees — monthly or pay-in-full (with a 10% discount). Subscriptions can be cancelled anytime, with a prorated refund in the first 5 days. The first lesson is a free 30-minute trial.",
          },
          {
            q: "Do you have student reviews, and how quickly will I see results?",
            a: "Yes — real verified reviews (5.0★ on Preply). You speak from the first lesson, and most students reach simple conversations within 3–6 months (A1–A2), depending on pace.",
          },
          {
            q: "What red flags should I watch for when choosing an Arabic tutor?",
            a: "Avoid: a native speaker with no teaching experience (knowing a language isn't the same as teaching it), generic one-size-fits-all lessons, and hidden fees or rigid scheduling with no trial. The safest test is always a free trial lesson.",
          },
        ],
      },
      {
        title: "Choosing the dialect",
        items: [
          {
            q: "Should I learn Modern Standard Arabic (Fusha) first, or go straight to Lebanese Arabic?",
            a: "If your goal is to talk to family, travel in Lebanon, or understand movies and music, start directly with Lebanese Arabic — it's the everyday spoken dialect. Fusha is mainly useful for reading news, religious texts, or formal contexts. Our courses lead with Lebanese and introduce Fusha only where it helps.",
          },
          {
            q: "What's the difference between Lebanese and Levantine / Egyptian / Gulf Arabic?",
            a: "Lebanese belongs to the Levantine family (with Syrian, Palestinian and Jordanian) — they're very close. Egyptian and Gulf dialects have different vocabulary and pronunciation. Lebanese gives you easy access to the whole Levant, and with a bit of exposure you also follow other dialects.",
          },
          {
            q: "Is Lebanese Arabic understood in other Arab countries?",
            a: "Yes. Thanks to Lebanese music, films and TV series being popular across the Arab world, Lebanese is one of the most widely understood dialects — from Morocco to the Gulf.",
          },
          {
            q: "If I only want to speak with family, travel, or work, do I still need MSA?",
            a: "Not really. For daily spoken communication, Lebanese is enough. MSA only becomes useful if you also want to read news, books, official documents, or work in formal environments.",
          },
        ],
      },
      {
        title: "Difficulty & time",
        items: [
          {
            q: "Is Lebanese Arabic hard to learn?",
            a: "It has a few sounds new to English speakers (like ع, ح, ق), but dialect grammar is simpler than Fusha — no complex case system. With 2–3 hours a week and consistent practice, you'll see clear progress within a few months.",
          },
          {
            q: "How long does it take to become conversational?",
            a: "Typically 3–6 months of consistent study (A1–A2) are enough for simple conversations: introductions, shopping, family chats. Our A1 course runs ~3 months, with two 90-minute lessons per week.",
          },
          {
            q: "How long until I'm fluent?",
            a: "Real fluency (B2–C1) usually takes 1.5–3 years of sustained practice, depending on how much you speak outside class. A realistic pace: A1 in 3 months, A2 in another 6, B1–B2 within 1–2 years.",
          },
          {
            q: "Is Lebanese easier than Fusha?",
            a: "Yes, for most learners. Dialect grammar is simplified (no case endings, more regular verb usage in speech) and pronunciation is closer to how people actually talk.",
          },
        ],
      },
      {
        title: "Learning path & resources",
        items: [
          {
            q: "What's the best way to learn Lebanese Arabic?",
            a: "The combination that works best: a structured course with a native teacher + short daily practice (10–20 min) + exposure to real content (music, series, conversations). Apps alone aren't enough for a dialect.",
          },
          {
            q: "Are there good books, apps, or websites for Lebanese?",
            a: "Dedicated Lebanese resources are limited compared to Fusha. We recommend the materials we've built in-house for the course, plus consuming native content (Fairuz, MTV Lebanon series, Lebanese podcasts) to train your ear.",
          },
          {
            q: "Can I learn online effectively, or do I need in-person classes?",
            a: "Yes, online learning with a native teacher over Zoom works very well — many of our students learn that way. In-person classes at Raduga Creative Center in Bucharest are an option if you prefer face-to-face interaction.",
          },
        ],
      },
      {
        title: "Practical concerns",
        items: [
          {
            q: "Can I get by in Lebanon with English or French, or do I need Arabic?",
            a: "In Beirut and touristy areas you'll manage with English and French. But any Lebanese phrase changes the reception completely — it's deeply appreciated and opens doors that foreign languages don't.",
          },
          {
            q: "Is Lebanese useful for business, travel, or heritage/family reasons?",
            a: "Yes, for all three. Business: direct communication with partners in Lebanon, Syria, Jordan. Travel: authentic cultural access. Family: reconnecting with relatives and heritage — the most common reason our students enrol.",
          },
          {
            q: "Will it help me understand songs, movies, and social media?",
            a: "Yes. Lebanese music (Fairuz, Wael Kfoury), TV series and Lebanese influencers all use the dialect. From A2 you start catching full phrases; by B1 you understand most everyday content.",
          },
          {
            q: "How do I practise speaking if I don't live in Lebanon?",
            a: "In class you practise with the native teacher and other students. On top of that: language partners (tandem), daily Lebanese content, shadowing (repeating after native audio), and a 5-minute spoken diary each day.",
          },
        ],
      },
      {
        title: "About our courses",
        items: [
          {
            q: "Do you teach adults, teens and kids?",
            a: "All three. We offer group and private courses for adults and teens (11–17), all CEFR levels, plus a dedicated program for children aged 6–10 with age-appropriate activities.",
          },
          {
            q: "Are classes online or in-person in Bucharest?",
            a: "Both. Adult group classes run in person at Raduga Creative Center and online via Zoom. Kids classes are in-person only up to age 10, and either format from age 10. Private lessons are fully flexible — in person or online.",
          },
          {
            q: "What schedule options exist for working people?",
            a: "Group classes are two 90-minute lessons per week, in the evening. Private lessons are scheduled flexibly, including weekends, based on your availability.",
          },
          {
            q: "How much does it cost, and are there payment plans?",
            a: "You can pay in full (with a 10% discount) or monthly. We accept card, bank transfer, cash, and PayPal, in LEI, EUR, or USD. Exact prices are on the Pricing section.",
          },
          {
            q: "Is there a trial lesson?",
            a: "Yes — we offer a free 30-minute trial lesson so you can meet the instructor, test the method, and see whether the format suits you before enrolling.",
          },
          {
            q: "What CEFR level will I reach after the course?",
            a: "It depends on your starting point. The A1 course takes you to full A1 (~3 months), A2 to A2 (~6 months), and B1–C2 each take 8–10 months. At the end you get an assessment of the level you've reached.",
          },
        ],
      },
      {
        title: "Language specifics",
        items: [
          {
            q: "What are common mistakes beginners make?",
            a: "The most common: pronouncing guttural sounds (ع, ح) as regular vowels, importing Fusha grammar into conversation (it sounds stiff), and translating word-for-word from English. We correct these from the very first lessons.",
          },
          {
            q: "How is Lebanese pronunciation different from Fusha?",
            a: "Lebanese shortens long vowels, turns ق into a glottal stop (hamza) in most words, and softens some consonants. The result: faster and more musical speech than Fusha.",
          },
          {
            q: "What are the most useful question words and everyday phrases to start with?",
            a: "Ones you'll need from day one: shu? (what?), wein? (where?), meen? (who?), kif? (how?), addesh? (how much?), aymta? (when?), plus marhaba (hi), kifak/kifik (how are you — m/f), shukran (thanks), yalla (let's go).",
          },
        ],
      },
      {
        title: "Lebanese Arabic grammar",
        items: [
          {
            q: "What does the بـ (b-) prefix do on Lebanese Arabic verbs?",
            a: "The بـ (b-) prefix marks the habitual or ongoing present tense — the equivalent of English \"I do / I eat / I go.\" Example: bektob = I write (in general), bshoof = I see. Without بـ, the verb becomes subjunctive or dependent on another verb: baddi ektob = I want to write (no b-). Quick rule: real, habitual, or ongoing action → use بـ; after modal verbs (want, can, must) → drop the بـ.",
          },
          {
            q: "How are past-tense verbs conjugated with attached pronouns (katabt-ha, katab-lak)?",
            a: "In Lebanese you conjugate the verb in the past, then stick object pronouns onto the end. Example from katab (he wrote): katabt = I wrote, katabt-a = I wrote it (fem.), katabt-o = I wrote it (masc.), katab-lak = he wrote to you (m.), katab-lek = he wrote to you (f.), katabna-hon = we wrote to them. The suffixes -lak, -lek, -lo, -la, -lna, -lkon, -lhon mark the beneficiary (\"for/to someone\"), while -a, -o, -hon mark the direct object.",
          },
          {
            q: "What are the personal and possessive pronouns in Lebanese Arabic?",
            a: "Personal: ana (I), inta / inti (you m/f), huwwe / hiyye (he/she), nihna (we), intu (you pl.), hinne (they). Possessive (attached to the noun): -i (my), -ak / -ek (your m/f), -o (his), -(h)a (her), -na (our), -kon (your pl.), -hon (their). Example: bayt = house → bayti (my house), baytak (your house), bayto (his house), bayta (her house).",
          },
          {
            q: "Is Lebanese Arabic word order VSO or SVO?",
            a: "In speech, Lebanese Arabic normally uses SVO (subject-verb-object) — just like English: \"Ahmad byekol tuffaha\" (Ahmad eats an apple). MSA / Classical Arabic prefers VSO (\"Eats Ahmad an apple\"), but in everyday conversation Lebanese speakers almost always pick SVO. That makes Lebanese feel much more natural to English speakers.",
          },
          {
            q: "How is Lebanese Arabic grammar different from Modern Standard Arabic (MSA)?",
            a: "Lebanese drops most of MSA's complexity: no case endings (dammah, kasrah, fathah), no full dual (we use the plural), no separate feminine plural in verbs (hinne covers everyone), future tense with رح / ح- (rah rooh = I will go) instead of سـ, negation with a simple ما (ma) instead of لا/لم/لن, and SVO word order instead of VSO. The result: same roots, far fewer rules — which is why Lebanese is faster to speak than MSA.",
          },
        ],
      },
    ],
  },
};

const FAQSection = () => {
  const { t, lang } = useI18n();
  const { groups } = FAQ_CONTENT[lang];
  const allItems = groups.flatMap((g) => g.items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-20 px-6 scroll-mt-20">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.faqBadge}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.faqTitle}</h2>
          <p className="text-muted-foreground">{t.faqDesc}</p>
        </div>

        <div className="space-y-10">
          {groups.map((group, gi) => (
            <div key={gi}>
              <h3 className="text-lg font-semibold text-foreground mb-4">{group.title}</h3>
              <Accordion type="single" collapsible className="space-y-3">
                {group.items.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${gi}-${i}`}
                    className="bg-background border border-border rounded-xl px-5"
                  >
                    <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4 text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
