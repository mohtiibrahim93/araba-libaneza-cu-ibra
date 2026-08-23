/**
 * Starting values for the page editor (admin -> "Pagini"), extracted from the
 * code-shipped SEO landings. Used to prefill the form so the owner corrects
 * existing copy instead of rewriting it from scratch.
 */
export interface PageSeed {
  path: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  lead: string;
}

export const PAGE_SEEDS: PageSeed[] = [
  {
    "path": "/araba-in-familie",
    "meta_title": "ArabÄ LibanezÄ Ã®n Familie â Copii Bilingvi Èi PÄrinÈi | Ghid",
    "meta_description": "Cum creÈti un copil bilingv romÃ¢no-libanez: rutine zilnice, regula âo persoanÄ, o limbÄâ, expresii de acasÄ Èi cursuri pentru copii Èi pÄrinÈi, Ã®n BucureÈti sau online.",
    "h1": "ArabÄ libanezÄ Ã®n familie: copii bilingvi Èi pÄrinÈi care Ã®nvaÈÄ",
    "lead": "Pentru familiile mixte romÃ¢no-libaneze: cum pÄstrezi limba Ã®n casÄ, ce faci concret Ã®n fiecare zi Èi de unde Ã®ncepe fiecare membru al familiei."
  },
  {
    "path": "/araba-online",
    "meta_title": "ArabÄ LibanezÄ Online â Cursuri Live pe Zoom cu Profesor Nativ | De Oriunde",
    "meta_description": "Cursuri de arabÄ libanezÄ online: lecÈii live pe Zoom cu profesor nativ, grupe A1âC2 Èi lecÈii private 1:1, de oriunde. Grupa A1 online Ã®ncepe pe 15 august â probÄ gratuitÄ.",
    "h1": "Cursuri de arabÄ libanezÄ online, live cu profesor nativ",
    "lead": "LecÈii live pe Zoom cu profesor nativ â grupÄ de weekend sau private 1:1, de oriunde te afli. FÄrÄ Ã®nregistrÄri, fÄrÄ aplicaÈii care nu te corecteazÄ."
  },
  {
    "path": "/araba-pentru-incepatori",
    "meta_title": "ArabÄ LibanezÄ pentru ÃncepÄtori â Cursuri de la Zero | VorbeÈti din Prima LecÈie",
    "meta_description": "ÃnvaÈÄ arabÄ libanezÄ de la zero cu profesor nativ: metoda Oral First, fÄrÄ blocajul alfabetului, grupe A1 pentru Ã®ncepÄtori â fizic Ã®n BucureÈti sau online. ProbÄ gratuitÄ.",
    "h1": "ArabÄ libanezÄ pentru Ã®ncepÄtori: vorbeÈte din prima lecÈie",
    "lead": "Zero cunoÈtinÈe? Perfect. Grupele A1 sunt gÃ¢ndite exact pentru Ã®nceput de drum: vorbeÈti din prima lecÈie, fÄrÄ sÄ te blochezi Ã®n alfabet."
  },
  {
    "path": "/araba-pentru-partener",
    "meta_title": "ArabÄ LibanezÄ pentru Partener Èi Socri â Expresii Èi Curs 1:1",
    "meta_description": "Vrei sÄ vorbeÈti cu partenerul libanez Èi cu familia lui? Expresii esenÈiale pentru prima Ã®ntÃ¢lnire cu socrii, alintÄri, urÄri la masÄ Èi un plan realist de Ã®nvÄÈare Ã®n 6 sÄptÄmÃ¢ni.",
    "h1": "ArabÄ libanezÄ pentru partener Èi familia lui",
    "lead": "Cel mai frecvent motiv pentru care oamenii ne scriu: o relaÈie cu cineva din Liban. IatÄ ce Ã®nveÈi Ã®ntÃ¢i Èi cum te pregÄteÈti pentru prima Ã®ntÃ¢lnire cu familia."
  },
  {
    "path": "/arabizi",
    "meta_title": "Arabizi â Ce ÃnseamnÄ 2, 3, 5, 7 Ã®n ArabÄ | Ghid Complet cu Tabel",
    "meta_description": "Ghid complet Arabizi: tabelul cifrelor (2, 3, 5, 6, 7, 8, 9) Èi literele arabe pe care le Ã®nlocuiesc, exemple reale din WhatsApp Èi TikTok, plus cheat-sheet PDF gratuit.",
    "h1": "Arabizi: ghid complet â ce Ã®nseamnÄ 2, 3, 5, 7 Èi 9 Ã®n arabÄ",
    "lead": "Araba scrisÄ cu litere latine Èi cifre. Aici gÄseÈti tabelul complet de decodare, exemple reale de mesaje Èi cheat-sheet-ul PDF gratuit."
  },
  {
    "path": "/ce-araba-sa-inveti",
    "meta_title": "Ce ArabÄ SÄ ÃnveÈi â LibanezÄ vs Standard vs EgipteanÄ | Ghid",
    "meta_description": "ComparÄ araba libanezÄ, araba standard (fusha) Èi egipteana: ce vorbesc oamenii, ce e mai uÈor, ce Ã®Èi trebuie pentru familie, muncÄ sau cÄlÄtorii. Alegi Ã®n 5 minute.",
    "h1": "Ce arabÄ sÄ Ã®nveÈi? LibanezÄ, standard sau egipteanÄ",
    "lead": "Alegerea dialectului conteazÄ mai mult decÃ¢t metoda. IatÄ cum decizi Ã®n funcÈie de motivul tÄu real."
  },
  {
    "path": "/curs-araba-copii",
    "meta_title": "Curs ArabÄ LibanezÄ pentru Copii (6â10 ani) | BucureÈti, prin Joc",
    "meta_description": "Curs de arabÄ libanezÄ pentru copii 6â10 ani Ã®n BucureÈti: Ã®nvÄÈare prin joc, cÃ¢ntece Èi poveÈti, cu profesor nativ libanez. GrupÄ micÄ, sÃ¢mbÄtÄ dimineaÈa.",
    "h1": "Curs de arabÄ libanezÄ pentru copii â BucureÈti, 6â10 ani, Ã®nvÄÈare prin joc",
    "lead": "Curs de arabÄ libanezÄ pentru copii 6â10 ani, fizic Ã®n BucureÈti. ÃnvÄÈare prin joc, cÃ¢ntece Èi poveÈti â cu profesor nativ libanez, fÄrÄ presiune, fÄrÄ teme obositoare."
  },
  {
    "path": "/cursuri-araba",
    "meta_title": "Cursuri de ArabÄ LibanezÄ 2026 â Grup, Private & Copii | BucureÈti",
    "meta_description": "Cursuri de arabÄ libanezÄ cu profesor nativ: grup A1âC2, lecÈii private 1:1 Èi curs pentru copii â fizic Ã®n BucureÈti sau online. Prima probÄ gratuitÄ.",
    "h1": "Cursuri de arabÄ libanezÄ cu profesor nativ â grup, private Èi pentru copii",
    "lead": "Toate formatele Ã®ntr-un singur loc: grupe pe niveluri (A1âC2), lecÈii private 1:1 Èi curs pentru copii â cu profesor nativ, fizic Ã®n BucureÈti sau online."
  },
  {
    "path": "/cursuri-araba-bucuresti",
    "meta_title": "Cursuri de ArabÄ LibanezÄ BucureÈti â AdulÈi, Copii, 1:1 | Sector 2",
    "meta_description": "Cursuri de arabÄ libanezÄ Ã®n BucureÈti cu profesor nativ libanez, la Raduga Creative Center (Str. Icoanei 80). Grupe mici, niveluri A1âC2, adulÈi Èi copii. ProbÄ gratuitÄ.",
    "h1": "Cursuri de arabÄ libanezÄ Ã®n BucureÈti â profesor nativ, grupe mici",
    "lead": "Cursuri de arabÄ libanezÄ Ã®n BucureÈti cu profesor nativ, la Raduga Creative Center (Str. Icoanei 80, sector 2). Grupe mici, niveluri A1âC2, adulÈi Èi copii."
  },
  {
    "path": "/cursuri-limba-araba",
    "meta_title": "Cursuri de ArabÄ LibanezÄ â Grup, Private, Online | BucureÈti 2026",
    "meta_description": "Cursuri de arabÄ libanezÄ cu profesor nativ, structurate pe niveluri CEFR (A1âC2). Grup, private Èi pentru copii, fizic Ã®n BucureÈti sau online. LecÈie de probÄ gratuitÄ.",
    "h1": "Cursuri de arabÄ libanezÄ â de la zero pÃ¢nÄ la fluenÈÄ, cu profesor nativ",
    "lead": "Cursuri de arabÄ libanezÄ structurate pe niveluri CEFR, cu profesor nativ. Grup, private sau pentru copii â fizic Ã®n BucureÈti sau online, oriunde ai fi."
  },
  {
    "path": "/dialecte-arabe",
    "meta_title": "Dialectele Arabe â Levantin, Egiptean, Golf, Maghreb | Ghid 2026",
    "meta_description": "Ghid clar al dialectelor arabe: levantin (libanez, sirian, palestinian, iordanian), egiptean, maghrebin, din Golf Èi irakian, plus araba standard. Cine pe cine Ã®nÈelege Èi ce dialect meritÄ Ã®nvÄÈat.",
    "h1": "Dialectele arabe: ghid pe Ã®nÈelesul tuturor",
    "lead": "Araba nu e o singurÄ limbÄ vorbitÄ, ci o familie de dialecte plus o limbÄ standard scrisÄ. IatÄ harta, fÄrÄ jargon lingvistic."
  },
  {
    "path": "/en/arabic-classes-near-me",
    "meta_title": "Arabic Classes Near Me â Bucharest & Online | Native Teacher",
    "meta_description": "Arabic classes with a native Lebanese teacher â in person in Bucharest (Strada Icoanei 80) or live online worldwide. Small groups, CEFR A1âC2, free trial. From â¬100/month.",
    "h1": "Arabic classes near me â Bucharest & online worldwide",
    "lead": "In-person Arabic classes in Bucharest and live online classes worldwide, taught by a native Lebanese teacher. Small groups (max 8), CEFR-aligned A1âC2, or private 1-on-1 if you prefer."
  },
  {
    "path": "/en/arabic-dialects-guide",
    "meta_title": "Arabic Dialects Guide â Levantine, Egyptian, Gulf, Maghrebi | 2026",
    "meta_description": "Complete guide to Arabic dialects: Levantine (Lebanese, Syrian, Jordanian, Palestinian), EgyptianâSudanese, Maghrebi, Peninsular (Gulf, Saudi, Yemeni), Mesopotamian, plus MSA. Written by a native Lebanese teacher.",
    "h1": "Arabic dialects â the complete guide (Levantine, Egyptian, Gulf, Maghrebi & more)",
    "lead": "A practical, non-academic guide to the Arabic dialect landscape â written by a native Lebanese teacher. What each family sounds like, where it's spoken, and how they relate to each other."
  },
  {
    "path": "/en/arabic-tutor",
    "meta_title": "Arabic Tutor Online â Private 1-on-1 Lessons | Native Teacher",
    "meta_description": "Private Arabic tutor online â 1-on-1 lessons with a native Lebanese teacher (5+ years experience). CEFR A1âC2, flexible schedule, free trial. â¬30 / 90 min.",
    "h1": "Arabic tutor online â private 1-on-1 lessons with a native teacher",
    "lead": "Private Arabic tutoring with a native Lebanese teacher â live 1-on-1 lessons online worldwide, or in person in Bucharest. Personalized pace, real conversation from day one."
  },
  {
    "path": "/en/how-to-learn-lebanese-arabic",
    "meta_title": "How to Learn Lebanese Arabic â Step-by-Step Guide (2026)",
    "meta_description": "The complete step-by-step guide to learning Lebanese Arabic in 2026: recommended learning path, weekly lesson structure, level-by-level timeline (A1âC1), and the exact study routine that works. Written by a native Lebanese teacher.",
    "h1": "How to learn Lebanese Arabic â recommended learning path & lesson structure",
    "lead": "A step-by-step path from complete beginner to fluent conversation, including the exact weekly lesson structure and daily routine that gets you there â written by a native Lebanese teacher who has taught hundreds of students."
  },
  {
    "path": "/en/learn-lebanese-arabic",
    "meta_title": "Learn Lebanese Arabic Online | Native Teacher, Free Trial",
    "meta_description": "Learn Lebanese Arabic (Levantine dialect) with a native instructor. Live 1-on-1 and small-group courses online worldwide, from beginner (A1) to advanced. Speak from lesson one â free trial.",
    "h1": "Learn Lebanese Arabic online with a native teacher",
    "lead": "Live 1-on-1 and small-group courses in the Lebanese dialect â the everyday Levantine Arabic spoken by ~30 million people. Speak from lesson one, without starting from the alphabet. From beginner (A1) to advanced (C2)."
  },
  {
    "path": "/en/learn-levantine-arabic",
    "meta_title": "Learn Levantine Arabic Online â Native Teacher | A1âC2",
    "meta_description": "Learn Levantine Arabic with a native Lebanese teacher â Lebanese is widely considered the most beautiful, melodic Levantine dialect and unlocks Syrian, Jordanian and Palestinian too. Live 1-on-1 and small-group courses online, A1âC2.",
    "h1": "Learn Levantine Arabic online â through Lebanese, the most beautiful Levantine dialect",
    "lead": "Live online courses in Levantine Arabic â taught through Lebanese, widely considered the most beautiful and melodic Levantine dialect and the media prestige variety of the region. One dialect, ~90% comprehension across Lebanon, Syria, Jordan and Palestine."
  },
  {
    "path": "/en/lebanese-arabic-vs-msa-vs-egyptian",
    "meta_title": "Lebanese vs MSA vs Egyptian Arabic â Full Comparison (2026)",
    "meta_description": "Lebanese Arabic vs Modern Standard Arabic (MSA/Fusha) vs Egyptian Arabic: differences in pronunciation, grammar, media reach, and which dialect to learn based on your goal. Written by a native Lebanese teacher.",
    "h1": "Lebanese Arabic vs MSA vs Egyptian Arabic â which one should you learn?",
    "lead": "A practical side-by-side comparison of Lebanese Arabic, Modern Standard Arabic (MSA / Fusha) and Egyptian Arabic â how they sound, how they differ, and which one to learn depending on your goal."
  },
  {
    "path": "/en/levantine-arabic-dialects-map",
    "meta_title": "Levantine Arabic Dialects Map â North vs South Shami",
    "meta_description": "Map of the Levantine Arabic dialects: North Levantine (Lebanese, Syrian) vs South Levantine (Palestinian, Jordanian) â sounds, differences, and where Lebanese fits in.",
    "h1": "Levantine Arabic dialects â a map of the Shami family",
    "lead": "Where each Levantine dialect is spoken, how North and South Shami differ, and why Lebanese is the most practical entry point into the family."
  },
  {
    "path": "/fara-alfabet-arab",
    "meta_title": "Pot ÃnvÄÈa Araba FÄrÄ Alfabet? Da â IatÄ Cum | Metoda Oral First",
    "meta_description": "PoÈi Ã®nvÄÈa araba libanezÄ fÄrÄ alfabetul arab: vorbeÈti din prima lecÈie folosind arabizi. Ce e greu de fapt la arabÄ, ce Ã®nveÈi Ã®n 4 sÄptÄmÃ¢ni Èi cÃ¢nd meritÄ alfabetul.",
    "h1": "Nu ai nevoie de alfabetul arab ca sÄ Ã®ncepi sÄ vorbeÈti",
    "lead": "Alfabetul este motivul numÄrul unu pentru care oamenii se apucÄ de arabÄ Èi renunÈÄ Ã®n prima lunÄ. Nu e obligatoriu ca sÄ vorbeÈti â iatÄ cum aratÄ drumul fÄrÄ el."
  },
  {
    "path": "/invata-araba",
    "meta_title": "ÃnvaÈÄ Araba LibanezÄ de la Zero â MetodÄ, Timp & Cursuri | 2026",
    "meta_description": "Ghid pas cu pas pentru a Ã®nvÄÈa araba libanezÄ de la zero: ce dialect alegi, cÃ¢t dureazÄ, ce metodÄ foloseÈti. Plus cursuri cu profesor nativ, online sau fizic.",
    "h1": "ÃnvaÈÄ araba libanezÄ de la zero â ghid complet + cursuri cu profesor nativ",
    "lead": "Vrei sÄ Ã®nveÈi araba libanezÄ, dar nu Ètii de unde sÄ Ã®ncepi? Ghid clar despre alegerea dialectului, metoda potrivitÄ Èi timpul necesar â plus cursuri cu profesor nativ."
  },
  {
    "path": "/invata-araba-gratis",
    "meta_title": "ÃnvaÈÄ ArabÄ LibanezÄ Gratis â Resurse, PDF-uri Èi LecÈii | 2026",
    "meta_description": "Resurse gratuite pentru arabÄ libanezÄ: cheat-sheet arabizi, 100 de expresii esenÈiale Ã®n PDF, plan de 30 de zile, canale YouTube Èi o mini-lecÈie cu pronunÈie. FÄrÄ costuri.",
    "h1": "ÃnvaÈÄ arabÄ libanezÄ gratis: resurse, lecÈii Èi PDF-uri",
    "lead": "Tot ce poÈi Ã®nvÄÈa fÄrÄ sÄ plÄteÈti nimic â Èi, sincer, unde se opreÈte gratuitul. Ãncepe cu mini-lecÈia de mai jos Èi cu PDF-urile."
  },
  {
    "path": "/meditatii-araba",
    "meta_title": "MeditaÈii ArabÄ LibanezÄ 1:1 cu Profesor Nativ | BucureÈti & Online",
    "meta_description": "MeditaÈii de arabÄ libanezÄ cu profesor nativ libanez, 1:1, ritm personalizat. Fizic Ã®n BucureÈti sau online pe Zoom. 150 lei/lecÈie, primÄ lecÈie gratuitÄ.",
    "h1": "MeditaÈii de arabÄ libanezÄ 1:1 â profesor nativ, program flexibil",
    "lead": "MeditaÈii 1:1 de arabÄ libanezÄ cu profesor nativ, adaptate obiectivului tÄu â cÄlÄtorie, familie, examen sau conversaÈie. Fizic Ã®n BucureÈti sau online, program flexibil."
  },
  {
    "path": "/resurse",
    "meta_title": "Resurse Gratuite ArabÄ LibanezÄ â PDF-uri, Expresii, Plan 30 Zile",
    "meta_description": "DescarcÄ gratuit materialele noastre pentru arabÄ libanezÄ: cheat-sheet arabizi, 100 de expresii esenÈiale Èi planul de Ã®nvÄÈare de 30 de zile. PDF pe email, fÄrÄ costuri.",
    "h1": "Resurse gratuite pentru arabÄ libanezÄ",
    "lead": "Toate materialele noastre gratuite Ã®ntr-un singur loc. Alegi resursa, laÈi emailul Èi primeÈti PDF-ul Ã®n cÃ¢teva secunde."
  }
];
