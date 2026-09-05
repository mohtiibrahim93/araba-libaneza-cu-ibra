// CEFR curriculum data for Lebanese Arabic — bilingual (RO/EN).
// Source: Structura Curs Araba Libaneza CEFR (course owner).

export type Track = "spoken" | "spoken-written";

export interface CurriculumBlock {
  title: string;
  items: string[];
}

export interface CurriculumLevel {
  id: "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  title: string;
  objective: string;
  lessons: number;
  hours: number;
  trackLabel: string;
  /** Schedule / calendar lines: fixed days, times & dates for A1/A2, opening info for B1–C2. */
  schedule?: string[];
  /** Flat lesson/block list (A1, A2, B1, B2). */
  items?: string[];
  /** C1 has two parallel strands. */
  spokenCore?: { intro: string; items: string[] };
  writingStrand?: { intro: string; items: string[] };
  /** C2 has modular thematic blocks. */
  blocks?: CurriculumBlock[];
  /**
   * Prose shown above the curriculum: who the level is for and what changes
   * from the one before it.
   *
   * The level pages were stats plus a bullet list and nothing else, which reads
   * as provisional for a 70-lesson course — B1 and B2 were the thinnest pages
   * on the site. Every paragraph here restates topics already listed in
   * `items` / `blocks`; nothing new is claimed.
   */
  intro?: string[];
  /** "By the end you can…", in terms a reader can picture. */
  outcomes?: string[];
  note?: string;
}

type Lang = "ro" | "en";

const RO: CurriculumLevel[] = [
  {
    id: "a1",
    title: "Nivel A1 — Începător (Supraviețuire)",
    objective:
      "Cursantul se poate prezenta, poate purta conversații simple zilnice și poate gestiona tranzacții de bază. Fundație orală + Arabizi, fără alfabet arab.",
    lessons: 32,
    hours: 48,
    trackLabel: "Vorbit",
    schedule: [
      "Fizic (Grupa 2): luni și miercuri 19:00–20:30 · start miercuri, 2 septembrie – 21 decembrie 2026 (32 lecții) · Strada Icoanei 80",
      "Online: grupa în desfășurare, locurile sunt ocupate — lasă-ți datele pentru următoarea grupă",
      "Examen final inclus",
    ],
    intro: [
      "A1 este nivelul de la zero. Nu presupune nimic: nici alfabet, nici gramatică, nici vreo experiență anterioară cu araba. Primele două lecții sunt despre sunete — ح și ع, apoi ط, غ și ق — și despre sistemul arabizi, care îți dă o cale de a scrie ce auzi din prima zi, fără să te blochezi la alfabetul arab.",
      "De acolo, cele 32 de lecții merg prin exact lucrurile de care ai nevoie ca să te descurci: prezentare personală și formule de politețe, familia, naționalitățile și profesiile, posesivele, genul, prezentul verbelor regulate cu particula بـ, numerele până la 100, ora, zilele săptămânii și rutina zilnică, negația și cuvintele de întrebare (šu, wēn, kīf, ēmta).",
      "A doua jumătate iese din clasă: mâncare și comenzi la restaurant, cumpărături și prețuri, culori și descrieri, direcții și locuri în oraș, transport, vremea, corpul și sănătatea de bază, casa. Se termină cu o introducere în trecut, dialoguri extinse și o simulare orală finală. Examen final inclus.",
    ],
    outcomes: [
      "Te prezinți, saluți și porți o conversație scurtă despre tine și familia ta",
      "Comanzi la restaurant, faci cumpărături și întrebi de preț",
      "Ceri și înțelegi indicații în oraș, folosești transportul",
      "Spui ora, zilele și numerele până la 100",
      "Pui întrebări cu šu, wēn, kīf și ēmta, și negi cu ma…",
      "Scrii și citești arabizi — deci poți da mesaje în libaneză fără alfabetul arab",
    ],
    items: [
      "Sunete I: ح ع + sistemul Arabizi",
      "Sunete II: ط غ ق + salutări",
      "Formule de politețe, prezentare personală",
      "Pronume + „a fi” (implicit)",
      "Vocabular: familia",
      "Naționalități & țări",
      "Profesii",
      "Posesivele (-i, -ak, -ek)",
      "Genul (masculin/feminin)",
      "Prezentul verbelor regulate + particula بـ",
      "Numere 1–20",
      "Numere 21–100, vârsta",
      "Ora",
      "Zilele & săptămâna, rutina zilnică",
      "Negația (ma...)",
      "Cuvinte de întrebare (šu, wēn, kīf, ēmta)",
      "Vocabular: mâncare",
      "Comenzi la restaurant",
      "Cumpărături & prețuri",
      "Culori & descrieri",
      "Direcții & locuri în oraș",
      "Transport",
      "Pluralul",
      "Demonstrativele (hayda/haydi)",
      "Vremea & anotimpurile",
      "Corpul & sănătate de bază",
      "Casa & mobilierul",
      "Trecutul (introducere)",
      "Recapitulare & dialoguri extinse",
      "Simulare orală finală",
    ],
  },
  {
    id: "a2",
    title: "Nivel A2 — Elementar",
    objective:
      "Cursantul descurcă majoritatea situațiilor cotidiene, narează la trecut/viitor și își exprimă opinii simple. Consolidare + gamă conversațională reală.",
    lessons: 54,
    hours: 81,
    trackLabel: "Vorbit",
    schedule: [
      "Fizic: marți și joi 19:00–20:30 · start marți, 1 septembrie 2026 – 4 martie 2027 (54 lecții) · Strada Icoanei 80",
      "Online: cohortă în curând — data și programul se anunță",
      "Rulează în paralel cu A1 · Examen final inclus",
    ],
    intro: [
      "A1 ți-a dat prezentul. A2 îți dă restul timpului: trecutul verbelor regulate și apoi al celor neregulate, narațiunea la trecut, viitorul cu raḥ, și trecutul habitual cu kān. În momentul în care poți spune ce ai făcut ieri și ce ai de gând mâine, conversația încetează să mai fie o serie de propoziții izolate.",
      "Nivelul adaugă și mecanica de care ai nevoie ca să sune natural: pronumele complement direct și indirect, comparativele și superlativele, acordul adjectivelor, pluralele „sparte”, imperativul și imperativul negativ, verbele modale (lāzim, fī, bidd-), propozițiile relative cu illi, condiționalul de bază cu iza și conectorii (bass, la2an, ma3 inno).",
      "În paralel se deschid situațiile reale: la doctor și la farmacie, programări și întâlniri, conversații telefonice, călătorii și rezervări, aeroport și hotel, bani și noțiuni bancare, muncă și birou, hobby-uri. Plus descrierea persoanelor, emoțiile și opiniile, primele expresii culturale libaneze și idiomuri, jocuri de rol extinse și ascultare din media reală. 54 de lecții, cu evaluare orală finală.",
    ],
    outcomes: [
      "Povestești ce ai făcut ieri și ce planuri ai, la trecut și la viitor",
      "Te descurci la doctor, la farmacie, la hotel și la aeroport",
      "Porți o conversație telefonică fără să o eviți",
      "Ceri, dai și urmezi instrucțiuni, folosind imperativul",
      "Descrii oameni — fizic și caracter — și îți exprimi opiniile și emoțiile",
      "Legi propozițiile între ele cu illi, iza și conectorii uzuali",
    ],
    items: [
      "Recapitulare A1 & diagnostic",
      "Trecutul verbelor regulate (complet)",
      "Trecutul verbelor neregulate/uzuale",
      "Narațiune la trecut (rutina de ieri)",
      "Viitorul (raḥ + verb)",
      "Pronume complement (sufixe)",
      "Pronume de complement indirect",
      "Comparative & superlative",
      "Acordul adjectivelor (aprofundat)",
      "Pluralele „sparte” (tipare frecvente)",
      "Imperativul (comenzi)",
      "Imperativul negativ",
      "Verbe modale (lāzim, fī, bidd-)",
      "Exprimarea dorințelor & nevoilor",
      "Mâncare & gătit (extins)",
      "La doctor / la farmacie",
      "Programări & întâlniri",
      "Conversații telefonice",
      "A da & a urma instrucțiuni",
      "Trecutul habitual (kān + verb)",
      "Descrierea persoanelor (fizic & caracter)",
      "Emoții & opinii",
      "Vremea & planuri",
      "Călătorii & rezervări",
      "La aeroport / la hotel",
      "Bani & noțiuni bancare",
      "Muncă & vocabular de birou",
      "Hobby-uri & timp liber",
      "Propoziții relative (illi)",
      "Condiționalul (de bază: iza)",
      "Conectori (bass, la2an, ma3 inno)",
      "Povestire (înlănțuirea evenimentelor)",
      "Expresii culturale libaneze I",
      "Idiomuri & zicale I",
      "Jocuri de rol extinse",
      "Ascultare din media reală (clipuri proprii)",
      "Recapitulare & integrare",
      "Evaluare orală finală",
    ],
  },
  {
    id: "b1",
    title: "Nivel B1 — Intermediar (Utilizator Independent)",
    objective:
      "B1 este nivelul la care araba libaneză încetează să mai fie un set de fraze și devine o limbă în care gândești. Cursantul susține conversații pe teme variate, își argumentează poziția și înțelege media uzuală — știri, interviuri, discuții obișnuite. Sistemul verbal se închide complet: toate timpurile, verbele slabe și cele dublate, condiționalul real și ireal, pasivul, subjonctivul și vorbirea indirectă. Exclusiv vorbit — fără alfabet arab.",
    intro: [
      "La A2 puteai purta o conversație dacă interlocutorul te ajuta puțin. La B1 nu mai ai nevoie de ajutorul acela. Cele 70 de lecții pornesc de la o recapitulare A2 cu diagnostic — ca să știm exact ce s-a așezat și ce nu — și se termină cu discurs extins și dezbatere.",
      "Cea mai mare parte a nivelului o ocupă gramatica pe care A1 și A2 au ocolit-o deliberat: consolidarea întregului sistem verbal, pronumele avansate și grupurile de clitice, condiționalul complet, pasivul și participiile, contextele de subjonctiv, modalele complexe, vorbirea indirectă și subordonarea. Nu sunt tabele de memorat — fiecare structură intră prin conversație, în contextul în care o vei folosi.",
      "În paralel se deschid temele abstracte — politică, economie, societate, la nivel introductiv — plus cultura, istoria și regiunile Libanului, idiomurile, proverbele și umorul. Sunt ~8 luni, două lecții de 90 de minute pe săptămână, iar nivelul se deschide după finalizarea A2.",
    ],
    outcomes: [
      "Susții o conversație pe teme variate fără ca celălalt să-și simplifice vorbirea",
      "Îți argumentezi opinia și o aperi într-o dezbatere",
      "Urmărești știri și discuții obișnuite în libaneză",
      "Folosești condiționalul real și ireal, pasivul și vorbirea indirectă în vorbirea curentă",
      "Construiești fraze lungi, cu propoziții relative și subordonate",
      "Recunoști idiomuri, proverbe și glume — și înțelegi de ce sunt amuzante",
    ],
    blocks: [
      {
        title: "Bloc 1 — Punctul de plecare (Lecțiile 1–6)",
        items: [
          "Recapitulare A2 & diagnostic",
        ],
      },
      {
        title: "Bloc 2 — Sistemul verbal, complet (Lecțiile 7–24)",
        items: [
          "Consolidarea sistemului verbal (toate timpurile, verbe slabe, verbe dublate)",
          "Pronume avansate & grupuri de clitice",
          "Sistemul condițional complet (real & ireal)",
          "Pasivul & participiile",
        ],
      },
      {
        title: "Bloc 3 — Fraza complexă (Lecțiile 25–40)",
        items: [
          "Contexte de subjonctiv & modale complexe",
          "Vorbirea indirectă (reported speech)",
          "Propoziții relative & subordonate complexe",
        ],
      },
      {
        title: "Bloc 4 — Teme abstracte & opinie (Lecțiile 41–54)",
        items: [
          "Teme abstracte: politică, economie, societate (introductiv)",
          "Opinie & argumentare",
          "Media & comprehensiunea știrilor",
        ],
      },
      {
        title: "Bloc 5 — Cultură & registru viu (Lecțiile 55–64)",
        items: [
          "Cultură, istorie & regiuni libaneze",
          "Idiomuri, proverbe, umor II",
        ],
      },
      {
        title: "Bloc 6 — Discurs & evaluare (Lecțiile 65–70)",
        items: [
          "Discurs extins & dezbatere",
          "Recapitulare & evaluare",
        ],
      },
    ],
    lessons: 70,
    hours: 105,
    trackLabel: "Vorbit",
    schedule: ["~8 luni · se deschide după finalizarea A2 (dată în curând)"],
  },
  {
    id: "b2",
    title: "Nivel B2 — Intermediar Superior",
    objective:
      "B2 este nivelul la care nu mai vorbești doar corect, ci potrivit. Cursantul comută între registre — de la limbajul de stradă la cel formal — negociază, analizează media și se exprimă spontan pe teme complexe, inclusiv profesionale: drept, afaceri, medicină, tehnologie. Exclusiv vorbit.",
    intro: [
      "Diferența dintre B1 și B2 nu este cât știi, ci cât de bine alegi. La B2 aceeași idee se spune în trei feluri, iar tu îl alegi pe cel potrivit situației — cu un prieten, cu un client, într-o dezbatere. Aici intră registrul stilistic, code-switching-ul și conectorii nuanțați care fac diferența între cineva care vorbește araba și cineva care sună a libanez.",
      "Cele 70 de lecții pornesc de la o recapitulare B1 cu diagnostic și adaugă vocabular abstract și profesional, persuasiune, negociere și dezbatere, narațiune și descriere complexă. Partea de media urcă de la înțelegerea știrilor la analiză: filme, melodii, talk-show-uri.",
      "Ultima parte a nivelului intră în profunzime culturală — religie, politică, variațiile dialectale dintre regiunile Libanului — și se încheie cu discurs extins spontan. Sunt ~8–9 luni, două lecții de 90 de minute pe săptămână, iar nivelul se deschide după B1.",
    ],
    outcomes: [
      "Treci natural între registrul formal și cel de stradă, în funcție de cine te ascultă",
      "Negociezi, convingi și susții o poziție într-o dezbatere",
      "Folosești vocabular profesional din domeniul tău (drept, afaceri, medicină, tehnologie)",
      "Analizezi un film, o melodie sau un talk-show, nu doar le înțelegi",
      "Povestești și descrii pe larg, cu nuanță și conectori potriviți",
      "Recunoști de unde e cineva din Liban după felul în care vorbește",
    ],
    blocks: [
      {
        title: "Bloc 1 — Punctul de plecare (Lecțiile 1–6)",
        items: [
          "Recapitulare B1 & diagnostic",
        ],
      },
      {
        title: "Bloc 2 — Registru & nuanță (Lecțiile 7–22)",
        items: [
          "Registrul stilistic (formal vs. de stradă, code-switching)",
          "Conectori nuanțați & mărci de discurs",
        ],
      },
      {
        title: "Bloc 3 — Vocabular profesional (Lecțiile 23–38)",
        items: [
          "Vocabular abstract & profesional (drept, afaceri, medicină, tehnologie)",
        ],
      },
      {
        title: "Bloc 4 — Persuasiune & narațiune (Lecțiile 39–52)",
        items: [
          "Persuasiune, negociere, dezbatere",
          "Narațiune & descriere complexă",
        ],
      },
      {
        title: "Bloc 5 — Media & profunzime culturală (Lecțiile 53–64)",
        items: [
          "Media: filme, melodii, talk-show-uri, analiză de știri",
          "Profunzime culturală: religie, politică, variații dialectale interne",
        ],
      },
      {
        title: "Bloc 6 — Spontaneitate & evaluare (Lecțiile 65–70)",
        items: [
          "Discurs extins spontan",
          "Evaluare",
        ],
      },
    ],
    lessons: 70,
    hours: 105,
    trackLabel: "Vorbit",
    schedule: ["~8–9 luni · se deschide după B1 — înscrieri viitoare"],
  },
  {
    id: "c1",
    title: "Nivel C1 — Avansat (Două Trackuri)",
    objective:
      "Utilizator avansat. Aici începe opțiunea de scriere. Alegi între trackul vorbit (nucleul conversațional) sau vorbit + scris (alfabetul arab rulează SIMULTAN, în paralel). Scrisul privește araba libaneză în litere arabe — nu fuṣḥā.",
    lessons: 70,
    hours: 105,
    trackLabel: "Vorbit / Vorbit + Scris (simultan)",
    schedule: ["~10 luni · se deschide după B2 — înscrieri viitoare"],
    intro: [
      "La C1 corectitudinea nu mai e subiectul. Subiectul e ce se spune fără să fie spus: sensul implicit, cititul printre rânduri, ironia și sarcasmul, umorul cu timing și jocuri de cuvinte, idiomurile avansate și proverbele așa cum se folosesc de fapt. Este nivelul la care începi să înțelegi gluma din camera în care ești, nu după ce ți se explică.",
      "Aici intră și harta socială a limbii: variația regională între Beirut și Muntele Liban, apoi Sud, Nord și Bekaa; sociolingvistica — cine vorbește cum, după clasă, vârstă și comunitate; code-switching-ul libaneză ↔ franceză ↔ engleză; și frazarea elevată, elementele cu aromă fuṣḥā care apar firesc în vorbirea educată. Plus măiestria povestirii, dezbaterea, persuasiunea, negocierea și exprimarea nuanței — atenuare, îndoială, certitudine.",
      "Partea culturală nu e decor: Fairuz pentru limbă și imagistică, Ziad Rahbani pentru ironie și registru, zajal-ul și tradiția poeziei orale, teatrul și monologul, cinematograful și autenticitatea dialectală, religia, politica și referințele istorice așa cum apar în vorbirea de zi cu zi. C1 este și nivelul la care se deschide scrisul: poți alege trackul vorbit sau vorbit + scris, cu alfabetul arab rulând simultan, în paralel — și e vorba de araba libaneză în litere arabe, nu de fuṣḥā.",
    ],
    outcomes: [
      "Prinzi ironia, sarcasmul și gluma în timp real, nu după explicație",
      "Recunoști de unde e cineva și cam din ce mediu, după felul în care vorbește",
      "Faci code-switching între libaneză, franceză și engleză cum o fac libanezii",
      "Susții o dezbatere, negociezi și convingi, cu nuanță și registru controlat",
      "Asculți conversație la viteză nativă și urmărești talk-show-uri și comentariu politic",
      "Opțional: citești și scrii araba libaneză cu alfabetul arab",
    ],
    spokenCore: {
      intro: "Nucleul vorbit (toți cursanții)",
      items: [
        "Recapitulare B2 & diagnostic",
        "Sensul implicit & cititul printre rânduri",
        "Ironia & sarcasmul în libaneză",
        "Umorul: timing, jocuri de cuvinte",
        "Idiomuri avansate I",
        "Idiomuri avansate II",
        "Proverbe & folosirea lor reală",
        "Variație regională: Beirut vs. Muntele Liban",
        "Variație regională: Sud, Nord, Bekaa",
        "Sociolingvistică: cine vorbește cum (clasă, vârstă, comunitate)",
        "Code-switching libaneză ↔ franceză ↔ engleză",
        "Frazare elevată/educată (elementele „fuṣḥā” care apar firesc)",
        "Măiestria povestirii: narațiune lungă",
        "Dezbatere & argumentare I",
        "Dezbatere & argumentare II",
        "Persuasiune & retorică",
        "Negociere & diplomație",
        "Exprimarea nuanței: atenuare, îndoială, certitudine",
        "Discuție abstractă: etică & valori",
        "Discuție abstractă: societate & schimbare",
        "Analiză media: talk-show-uri",
        "Analiză media: știri & comentariu politic",
        "Melodii: Fairuz — limbă & imagistică",
        "Melodii: Ziad Rahbani — ironie & registru",
        "Zajal & tradiția poeziei orale",
        "Teatru & monolog (operele Rahbani)",
        "Cinema: dialog & autenticitate dialectală",
        "Profunzime culturală: religia în vorbirea cotidiană",
        "Profunzime culturală: politica în vorbirea cotidiană",
        "Profunzime culturală: referințe istorice în conversație",
        "Gamă emoțională: durere, bucurie, mânie, tandrețe",
        "Vorbire formală: toasturi, condoleanțe, felicitări",
        "Conversație profesională pe domenii",
        "Discurs spontan: improvizație & jocuri de rol",
        "Ascultare: conversație la viteză nativă",
        "Reducerea accentului & prozodia nativă",
        "Proiect de integrare: susținerea unui discurs",
        "Recapitulare & evaluare (vorbit)",
      ],
    },
    writingStrand: {
      intro:
        "Strandul de scris — 20 de unități, în paralel (doar trackul vorbit + scris). O unitate la fiecare 1–2 lecții, de la litere la scrierea narațiunilor libaneze.",
      items: [
        "Alfabetul: privire de ansamblu & maparea sunet → literă",
        "Litere I + formele inițială/mediană/finală",
        "Litere II + regulile de legare",
        "Litere III + literele care nu se leagă",
        "Litere IV + literele care se confundă",
        "Vocalele scurte (ḥarakāt), sukūn, šadda",
        "Tanwīn, tā marbūṭa, hamza",
        "Tranziție de citire: Arabizi → scriere (cuvinte familiare)",
        "Citirea propozițiilor libaneze scurte",
        "Scrierea de mână: formarea literelor",
        "Ortografia libanezei: cum se scriu sunetele dialectale",
        "Citirea libanezei de pe rețele sociale (postări, comentarii)",
        "Citirea mesajelor & textelor informale",
        "Scrierea propriilor mesaje în alfabet arab",
        "Citirea paragrafelor libaneze mai lungi",
        "Scrierea unei narațiuni libaneze scurte",
        "Convenții ortografice frecvente & variație",
        "Citirea textelor mixte libaneză/cu elemente fuṣḥā",
        "Proiect de scriere: un text personal în alfabet arab",
        "Evaluare (citit & scris)",
      ],
    },
  },
  {
    id: "c2",
    title: "Nivel C2 — Academic & Specializat (Modular)",
    objective:
      "Araba libaneză la nivel academic și specializat. FĂRĂ gramatică fuṣḥā completă — fără cazuri, fără declinări. Doar registrul educat și terminologia pe care profesioniștii și scriitorii libanezi le folosesc efectiv. Blocurile sunt modulare — îți poți prioritiza domeniul (ex. medicină, jurnalism).",
    lessons: 80,
    hours: 120,
    trackLabel: "Vorbit / Scris integrat",
    schedule: ["~10 luni · se deschide după C1 — înscrieri viitoare"],
    intro: [
      "C2 este araba libaneză la nivel academic și specializat — dar fără gramatica fuṣḥā completă. Fără cazuri, fără declinări. Doar registrul educat și terminologia pe care profesioniștii și scriitorii libanezi le folosesc efectiv, în meseriile lor.",
      "Cele 80 de lecții sunt organizate în blocuri modulare, ceea ce înseamnă că îți poți prioritiza domeniul: politică și actualitate, afaceri și economie, drept, sănătate și guvernanță, tehnologie și știință, media și jurnalism, arte, literatură și viață intelectuală. Dacă ești medic, blocul medical contează mai mult decât cel juridic — și programul se poate așeza în consecință.",
      "Primul bloc rămâne comun tuturor: registrul educat față de cel de stradă, adresarea formală, vocabularul elevat și frazarea selectivă „cu aromă fuṣḥā”, polisarea retorică, nuanțele de ton și intenție, plus textele de opinie și eseul cultural — citite și produse. Este nivelul la care limba încetează să fie un obiectiv și devine un instrument de lucru.",
    ],
    outcomes: [
      "Comuți controlat între registrul educat și cel de stradă, inclusiv în adresarea formală",
      "Folosești terminologia domeniului tău — juridic, medical, financiar, tehnic sau editorial",
      "Susții o dezbatere la nivel de expert și citești editoriale cu tot subtextul lor",
      "Scrii un text de opinie sau un eseu cultural în libaneză",
      "Analizezi presa libaneză reală și separi faptul de opinie",
      "Îți alegi blocurile în funcție de meseria ta, nu invers",
    ],
    blocks: [
      {
        title: "Bloc 1 — Registru & rafinament (Lecțiile 1–10)",
        items: [
          "Registru educat vs. de stradă; adresare formală",
          "Vocabular elevat & frazarea selectivă „cu aromă fuṣḥā” a vorbirii educate",
          "Polisare retorică; nuanțe de ton & intenție",
          "Texte de opinie & eseu cultural (citire/producție)",
        ],
      },
      {
        title: "Bloc 2 — Politică & actualitate (Lecțiile 11–20)",
        items: [
          "Vocabular politic; guvern & instituții",
          "Alegeri; terminologia sistemului confesional",
          "Geopolitică; limbajul editorialelor",
          "Dezbatere la nivel de expert",
        ],
      },
      {
        title: "Bloc 3 — Afaceri & economie (Lecțiile 21–30)",
        items: [
          "Finanțe, bănci, comerț; vocabular corporativ",
          "Limbajul contractelor & al negocierii",
          "Comentariu economic; antreprenoriat",
        ],
      },
      {
        title: "Bloc 4 — Drept, sănătate & guvernanță (Lecțiile 31–42)",
        items: [
          "Terminologie juridică; instanțe, drepturi, vocabular civil/notarial",
          "Citirea textelor cu nuanță juridică",
          "Terminologie medicală; doctor–pacient la nivel expert",
          "Discurs de sănătate publică; citirea conținutului medical",
        ],
      },
      {
        title: "Bloc 5 — Tehnologie & știință (Lecțiile 43–52)",
        items: [
          "Vocabular tehnologic; internet & media",
          "Concepte științifice în libaneză",
          "Discurs de popularizare a științei",
        ],
      },
      {
        title: "Bloc 6 — Media & jurnalism (Lecțiile 53–62)",
        items: [
          "Scriere de știri; registrul reportajului",
          "Tehnica interviului; vocea editorială",
          "Fapt vs. opinie; analiza presei libaneze reale",
        ],
      },
      {
        title: "Bloc 7 — Arte, literatură & viață intelectuală (Lecțiile 63–72)",
        items: [
          "Libaneza literară; analiză de poezie",
          "Critică & recenzie; filozofie & idei în conversație",
          "Eseuri culturale",
        ],
      },
      {
        title: "Bloc 8 — Măiestrie & sinteză (Lecțiile 73–80)",
        items: [
          "Discurs interdisciplinar; prezentare academică",
          "Scrierea de texte specializate (track scris)",
          "Conversație spontană la nivel de expert",
          "Proiect-capstone & evaluare finală",
        ],
      },
    ],
    note: "La trackul scris, materialul de citire la C2 este însuși conținutul specializat — strandul de alfabet nu mai e separat, ci devine modul de livrare.",
  },
];

const EN: CurriculumLevel[] = [
  {
    id: "a1",
    title: "Level A1 — Beginner (Survival)",
    objective:
      "Learner can introduce themselves, hold simple daily conversations and handle basic transactions. Oral foundation + Arabizi, no Arabic alphabet.",
    lessons: 32,
    hours: 48,
    trackLabel: "Spoken",
    schedule: [
      "In person (Group 2): Mondays & Wednesdays 19:00–20:30 · starts Wednesday 2 September – 21 December 2026 (32 lessons) · Strada Icoanei 80",
      "Online: group in progress and full — leave your details for the next one",
      "Final exam included",
    ],
    intro: [
      "A1 starts from nothing. It assumes no alphabet, no grammar and no previous contact with Arabic. The first two lessons are about sounds — ح and ع, then ط, غ and ق — and about the arabizi system, which gives you a way to write down what you hear from day one without getting stuck on the Arabic script.",
      "From there the 32 lessons cover exactly what it takes to cope: introducing yourself and the polite formulas, family, nationalities and professions, possessives, gender, the present tense of regular verbs with the بـ particle, numbers to 100, telling the time, the days of the week and daily routine, negation, and the question words (šu, wēn, kīf, ēmta).",
      "The second half leaves the classroom: food and ordering in a restaurant, shopping and prices, colours and descriptions, directions and places around town, transport, the weather, the body and basic health, the house. It closes with an introduction to the past tense, extended dialogues and a final spoken simulation. Final exam included.",
    ],
    outcomes: [
      "Introduce yourself, greet people and hold a short conversation about yourself and your family",
      "Order in a restaurant, shop, and ask what something costs",
      "Ask for and follow directions around town, and use transport",
      "Tell the time, the days and the numbers up to 100",
      "Ask questions with šu, wēn, kīf and ēmta, and negate with ma…",
      "Read and write arabizi — so you can text in Lebanese without the Arabic alphabet",
    ],
    items: [
      "Sounds I: ح ع + the Arabizi system",
      "Sounds II: ط غ ق + greetings",
      "Politeness formulas, personal introduction",
      "Pronouns + implicit “to be”",
      "Vocabulary: family",
      "Nationalities & countries",
      "Professions",
      "Possessives (-i, -ak, -ek)",
      "Gender (masculine/feminine)",
      "Present tense of regular verbs + particle بـ",
      "Numbers 1–20",
      "Numbers 21–100, age",
      "Telling time",
      "Days & week, daily routine",
      "Negation (ma...)",
      "Question words (šu, wēn, kīf, ēmta)",
      "Vocabulary: food",
      "Ordering at a restaurant",
      "Shopping & prices",
      "Colors & descriptions",
      "Directions & places in the city",
      "Transport",
      "Plurals",
      "Demonstratives (hayda/haydi)",
      "Weather & seasons",
      "Body & basic health",
      "House & furniture",
      "Past tense (introduction)",
      "Review & extended dialogues",
      "Final oral simulation",
    ],
  },
  {
    id: "a2",
    title: "Level A2 — Elementary",
    objective:
      "Learner handles most everyday situations, narrates in past/future and expresses simple opinions. Consolidation + real conversational range.",
    lessons: 54,
    hours: 81,
    trackLabel: "Spoken",
    schedule: [
      "In person: Tuesdays & Thursdays 19:00–20:30 · starts Tuesday 1 September 2026 – 4 March 2027 (54 lessons) · Strada Icoanei 80",
      "Online: cohort opening soon — date and schedule to be announced",
      "Runs in parallel with A1 · Final exam included",
    ],
    intro: [
      "A1 gave you the present tense. A2 gives you the rest of time: the past of regular verbs and then the irregular ones, narration in the past, the future with raḥ, and the habitual past with kān. The moment you can say what you did yesterday and what you plan for tomorrow, conversation stops being a series of isolated sentences.",
      "The level also adds the machinery that makes it sound natural: direct and indirect object pronouns, comparatives and superlatives, adjective agreement in depth, broken plurals, the imperative and the negative imperative, modal verbs (lāzim, fī, bidd-), relative clauses with illi, the basic conditional with iza, and connectors (bass, la2an, ma3 inno).",
      "Alongside that, the real situations open up: the doctor and the pharmacy, appointments, phone calls, travel and bookings, the airport and the hotel, money and banking, work and office vocabulary, hobbies. Plus describing people physically and by character, emotions and opinions, the first Lebanese cultural expressions and idioms, extended role plays and listening to real media. 54 lessons, with a final spoken assessment.",
    ],
    outcomes: [
      "Tell someone what you did yesterday and what you are planning, in past and future",
      "Handle the doctor, the pharmacy, a hotel and an airport",
      "Take a phone call in Lebanese instead of avoiding it",
      "Ask for, give and follow instructions using the imperative",
      "Describe people — appearance and character — and give opinions and feelings",
      "Join sentences together with illi, iza and the everyday connectors",
    ],
    items: [
      "A1 review & diagnostic",
      "Past tense of regular verbs (full)",
      "Past tense of irregular/common verbs",
      "Past narration (yesterday's routine)",
      "Future tense (raḥ + verb)",
      "Object pronouns (suffixes)",
      "Indirect object pronouns",
      "Comparatives & superlatives",
      "Adjective agreement (in depth)",
      "Broken plurals (frequent patterns)",
      "Imperative (commands)",
      "Negative imperative",
      "Modal verbs (lāzim, fī, bidd-)",
      "Expressing wants & needs",
      "Food & cooking (extended)",
      "At the doctor / pharmacy",
      "Appointments & meetings",
      "Phone conversations",
      "Giving & following instructions",
      "Habitual past (kān + verb)",
      "Describing people (physical & character)",
      "Emotions & opinions",
      "Weather & plans",
      "Travel & bookings",
      "At the airport / hotel",
      "Money & basic banking",
      "Work & office vocabulary",
      "Hobbies & free time",
      "Relative clauses (illi)",
      "Conditional (basic: iza)",
      "Connectors (bass, la2an, ma3 inno)",
      "Storytelling (linking events)",
      "Lebanese cultural expressions I",
      "Idioms & sayings I",
      "Extended role-plays",
      "Listening to real media (own clips)",
      "Review & integration",
      "Final oral assessment",
    ],
  },
  {
    id: "b1",
    title: "Level B1 — Intermediate (Independent User)",
    objective:
      "B1 is where Lebanese Arabic stops being a set of phrases and becomes a language you think in. You sustain conversations on varied topics, argue a position and follow everyday media — news, interviews, ordinary discussion. The verb system closes completely here: all tenses, weak and doubled verbs, the real and unreal conditional, the passive, the subjunctive and reported speech. Spoken only — no Arabic alphabet.",
    intro: [
      "At A2 you could hold a conversation if the other person met you halfway. At B1 you no longer need them to. The 70 lessons open with an A2 review and diagnostic — so we know exactly what has settled and what has not — and close with extended discourse and debate.",
      "Most of the level is the grammar A1 and A2 deliberately stepped around: consolidating the whole verb system, advanced pronouns and clitic clusters, the full conditional, the passive and participles, subjunctive contexts, complex modals, reported speech and subordination. None of it arrives as a table to memorise — every structure comes in through conversation, in the context where you will actually use it.",
      "Running alongside that, the abstract topics open up — politics, economy and society at an introductory level — plus Lebanese culture, history and regions, idioms, proverbs and humour. Around 8 months, two 90-minute lessons a week, opening once A2 finishes.",
    ],
    outcomes: [
      "Hold a conversation on varied topics without the other person simplifying their speech",
      "Argue an opinion and defend it in a debate",
      "Follow the news and ordinary discussion in Lebanese",
      "Use the real and unreal conditional, the passive and reported speech in normal talk",
      "Build long sentences with relative clauses and subordination",
      "Recognise idioms, proverbs and jokes — and understand why they are funny",
    ],
    blocks: [
      {
        title: "Block 1 — Where you start (Lessons 1–6)",
        items: [
          "A2 review & diagnostic",
        ],
      },
      {
        title: "Block 2 — The verb system, in full (Lessons 7–24)",
        items: [
          "Consolidating the verb system (all tenses, weak & doubled verbs)",
          "Advanced pronouns & clitic clusters",
          "Full conditional system (real & unreal)",
          "Passive voice & participles",
        ],
      },
      {
        title: "Block 3 — The complex sentence (Lessons 25–40)",
        items: [
          "Subjunctive contexts & complex modals",
          "Reported speech",
          "Relative clauses & complex subordination",
        ],
      },
      {
        title: "Block 4 — Abstract topics & opinion (Lessons 41–54)",
        items: [
          "Abstract topics: politics, economy, society (introductory)",
          "Opinion & argumentation",
          "Media & news comprehension",
        ],
      },
      {
        title: "Block 5 — Culture & living register (Lessons 55–64)",
        items: [
          "Culture, history & Lebanese regions",
          "Idioms, proverbs, humor II",
        ],
      },
      {
        title: "Block 6 — Discourse & assessment (Lessons 65–70)",
        items: [
          "Extended discourse & debate",
          "Review & assessment",
        ],
      },
    ],
    lessons: 70,
    hours: 105,
    trackLabel: "Spoken",
    schedule: ["~8 months · opens after A2 finishes (date coming soon)"],
  },
  {
    id: "b2",
    title: "Level B2 — Upper-Intermediate",
    objective:
      "B2 is where you stop merely speaking correctly and start speaking appropriately. You switch between registers — street language to formal — negotiate, analyse media and express yourself spontaneously on complex topics, including professional ones: law, business, medicine, technology. Spoken only.",
    intro: [
      "The difference between B1 and B2 is not how much you know but how well you choose. At B2 the same idea can be said three ways and you pick the one that fits — with a friend, with a client, in an argument. That is what stylistic register, code-switching and nuanced connectors are for: they are the difference between someone who speaks Arabic and someone who sounds Lebanese.",
      "The 70 lessons open with a B1 review and diagnostic, then add abstract and professional vocabulary, persuasion, negotiation and debate, and complex narration and description. The media work steps up from understanding the news to analysing it: films, songs, talk shows.",
      "The last stretch goes into cultural depth — religion, politics, and the dialect variation between Lebanese regions — and finishes on spontaneous extended discourse. Around 8–9 months, two 90-minute lessons a week, opening after B1.",
    ],
    outcomes: [
      "Move naturally between formal and street register depending on who is listening",
      "Negotiate, persuade and hold a position in a debate",
      "Use the professional vocabulary of your own field (law, business, medicine, technology)",
      "Analyse a film, a song or a talk show rather than just follow it",
      "Narrate and describe at length, with nuance and the right connectors",
      "Tell where in Lebanon someone is from by how they speak",
    ],
    blocks: [
      {
        title: "Block 1 — Where you start (Lessons 1–6)",
        items: [
          "B1 review & diagnostic",
        ],
      },
      {
        title: "Block 2 — Register & nuance (Lessons 7–22)",
        items: [
          "Stylistic register (formal vs. street, code-switching)",
          "Nuanced connectors & discourse markers",
        ],
      },
      {
        title: "Block 3 — Professional vocabulary (Lessons 23–38)",
        items: [
          "Abstract & professional vocabulary (law, business, medicine, technology)",
        ],
      },
      {
        title: "Block 4 — Persuasion & narration (Lessons 39–52)",
        items: [
          "Persuasion, negotiation, debate",
          "Complex narration & description",
        ],
      },
      {
        title: "Block 5 — Media & cultural depth (Lessons 53–64)",
        items: [
          "Media: films, songs, talk shows, news analysis",
          "Cultural depth: religion, politics, internal dialect variation",
        ],
      },
      {
        title: "Block 6 — Spontaneity & assessment (Lessons 65–70)",
        items: [
          "Spontaneous extended discourse",
          "Assessment",
        ],
      },
    ],
    lessons: 70,
    hours: 105,
    trackLabel: "Spoken",
    schedule: ["~8–9 months · opens after B1 — future enrollment"],
  },
  {
    id: "c1",
    title: "Level C1 — Advanced (Two Tracks)",
    objective:
      "Advanced user. The writing option begins here. Pick the spoken track (conversational core only) or spoken + written (the Arabic alphabet strand runs SIMULTANEOUSLY in the same lessons). Writing covers Lebanese Arabic in Arabic letters — not fuṣḥā.",
    lessons: 70,
    hours: 105,
    trackLabel: "Spoken / Spoken + Written (simultaneous)",
    schedule: ["~10 months · opens after B2 — future enrollment"],
    intro: [
      "At C1 correctness is no longer the subject. The subject is what gets said without being said: implied meaning, reading between the lines, irony and sarcasm, humour with timing and wordplay, advanced idioms and proverbs as they are actually used. This is the level where you catch the joke in the room you are in, rather than after someone explains it.",
      "It also covers the social map of the language: regional variation between Beirut and Mount Lebanon, then the South, the North and the Bekaa; sociolinguistics — who speaks how, by class, age and community; code-switching between Lebanese, French and English; and elevated phrasing, the fuṣḥā-flavoured elements that turn up naturally in educated speech. Plus storytelling mastery, debate, persuasion, negotiation, and expressing nuance — hedging, doubt, certainty.",
      "The cultural material is not decoration: Fairuz for language and imagery, Ziad Rahbani for irony and register, zajal and the oral poetry tradition, theatre and monologue, cinema and dialect authenticity, and religion, politics and historical reference as they appear in ordinary speech. C1 is also where writing opens up: you choose the spoken track or spoken + written, with the Arabic alphabet running simultaneously alongside it — and that means Lebanese Arabic in Arabic letters, not fuṣḥā.",
    ],
    outcomes: [
      "Catch irony, sarcasm and the joke in real time rather than after the explanation",
      "Tell where someone is from, and roughly their background, by how they speak",
      "Code-switch between Lebanese, French and English the way Lebanese speakers do",
      "Hold a debate, negotiate and persuade, with controlled nuance and register",
      "Follow conversation at native speed, plus talk shows and political commentary",
      "Optionally: read and write Lebanese Arabic in the Arabic alphabet",
    ],
    spokenCore: {
      intro: "Spoken core (all learners)",
      items: [
        "B2 review & diagnostic",
        "Implicit meaning & reading between the lines",
        "Irony & sarcasm in Lebanese",
        "Humor: timing, wordplay",
        "Advanced idioms I",
        "Advanced idioms II",
        "Proverbs & their real-life use",
        "Regional variation: Beirut vs. Mount Lebanon",
        "Regional variation: South, North, Bekaa",
        "Sociolinguistics: who speaks how (class, age, community)",
        "Code-switching Lebanese ↔ French ↔ English",
        "Educated/elevated phrasing (the “fuṣḥā” elements that surface naturally)",
        "Storytelling mastery: long-form narration",
        "Debate & argumentation I",
        "Debate & argumentation II",
        "Persuasion & rhetoric",
        "Negotiation & diplomacy",
        "Expressing nuance: hedging, doubt, certainty",
        "Abstract discussion: ethics & values",
        "Abstract discussion: society & change",
        "Media analysis: talk shows",
        "Media analysis: news & political commentary",
        "Songs: Fairuz — language & imagery",
        "Songs: Ziad Rahbani — irony & register",
        "Zajal & the oral poetry tradition",
        "Theatre & monologue (Rahbani works)",
        "Cinema: dialogue & dialectal authenticity",
        "Cultural depth: religion in everyday speech",
        "Cultural depth: politics in everyday speech",
        "Cultural depth: historical references in conversation",
        "Emotional range: grief, joy, anger, tenderness",
        "Formal speech: toasts, condolences, congratulations",
        "Professional conversation by domain",
        "Spontaneous discourse: improv & role-play",
        "Listening: conversation at native speed",
        "Accent reduction & native prosody",
        "Integration project: delivering a speech",
        "Review & assessment (spoken)",
      ],
    },
    writingStrand: {
      intro:
        "Writing strand — 20 units, in parallel (spoken + written track only). One unit every 1–2 lessons, from letters to writing Lebanese narratives.",
      items: [
        "Alphabet: overview & sound → letter mapping",
        "Letters I + initial/medial/final forms",
        "Letters II + joining rules",
        "Letters III + non-joining letters",
        "Letters IV + easily confused letters",
        "Short vowels (ḥarakāt), sukūn, šadda",
        "Tanwīn, tā marbūṭa, hamza",
        "Reading transition: Arabizi → script (familiar words)",
        "Reading short Lebanese sentences",
        "Handwriting: letter formation",
        "Lebanese spelling: how dialect sounds are written",
        "Reading Lebanese on social media (posts, comments)",
        "Reading messages & informal texts",
        "Writing your own messages in Arabic script",
        "Reading longer Lebanese paragraphs",
        "Writing a short Lebanese narrative",
        "Common spelling conventions & variation",
        "Reading mixed Lebanese / fuṣḥā-flavored texts",
        "Writing project: a personal text in Arabic script",
        "Assessment (reading & writing)",
      ],
    },
  },
  {
    id: "c2",
    title: "Level C2 — Academic & Specialized (Modular)",
    objective:
      "Lebanese Arabic at an academic & specialized level. NO full fuṣḥā grammar — no cases, no declensions. Only the educated register and specialized terminology Lebanese professionals and writers actually use. Blocks are modular — prioritize your domain (e.g. medicine, journalism).",
    lessons: 80,
    hours: 120,
    trackLabel: "Spoken / Written integrated",
    schedule: ["~10 months · opens after C1 — future enrollment"],
    intro: [
      "C2 is Lebanese Arabic at an academic and specialist level — but without full fuṣḥā grammar. No case endings, no declensions. Just the educated register and the terminology Lebanese professionals and writers actually use in their own work.",
      "The 80 lessons are arranged in modular blocks, which means you can prioritise your own field: politics and current affairs, business and economics, law, health and governance, technology and science, media and journalism, arts, literature and intellectual life. If you are a doctor, the medical block matters more than the legal one — and the schedule can be arranged that way.",
      "The first block stays common to everyone: educated versus street register, formal address, elevated vocabulary and the selective fuṣḥā-flavoured phrasing of educated speech, rhetorical polish, shades of tone and intent, plus opinion pieces and the cultural essay, both read and produced. This is the level at which the language stops being the goal and becomes a tool you work with.",
    ],
    outcomes: [
      "Move deliberately between educated and street register, formal address included",
      "Use the terminology of your own field — legal, medical, financial, technical or editorial",
      "Hold an expert-level debate and read editorials with all their subtext",
      "Write an opinion piece or a cultural essay in Lebanese",
      "Analyse the real Lebanese press and separate fact from opinion",
      "Choose the blocks that match your profession, rather than the other way round",
    ],
    blocks: [
      {
        title: "Block 1 — Register & refinement (Lessons 1–10)",
        items: [
          "Educated vs. street register; formal address",
          "Elevated vocabulary & the selective “fuṣḥā-flavored” phrasing of educated speech",
          "Rhetorical polish; nuances of tone & intent",
          "Opinion pieces & cultural essays (reading/production)",
        ],
      },
      {
        title: "Block 2 — Politics & current affairs (Lessons 11–20)",
        items: [
          "Political vocabulary; government & institutions",
          "Elections; terminology of the confessional system",
          "Geopolitics; the language of editorials",
          "Expert-level debate",
        ],
      },
      {
        title: "Block 3 — Business & economy (Lessons 21–30)",
        items: [
          "Finance, banking, trade; corporate vocabulary",
          "The language of contracts & negotiation",
          "Economic commentary; entrepreneurship",
        ],
      },
      {
        title: "Block 4 — Law, health & governance (Lessons 31–42)",
        items: [
          "Legal terminology; courts, rights, civil/notarial vocabulary",
          "Reading texts with legal nuance",
          "Medical terminology; expert-level doctor–patient",
          "Public health discourse; reading medical content",
        ],
      },
      {
        title: "Block 5 — Technology & science (Lessons 43–52)",
        items: [
          "Tech vocabulary; internet & media",
          "Scientific concepts in Lebanese",
          "Science popularization discourse",
        ],
      },
      {
        title: "Block 6 — Media & journalism (Lessons 53–62)",
        items: [
          "News writing; the register of reporting",
          "Interview technique; editorial voice",
          "Fact vs. opinion; analysis of real Lebanese press",
        ],
      },
      {
        title: "Block 7 — Arts, literature & intellectual life (Lessons 63–72)",
        items: [
          "Literary Lebanese; poetry analysis",
          "Criticism & review; philosophy & ideas in conversation",
          "Cultural essays",
        ],
      },
      {
        title: "Block 8 — Mastery & synthesis (Lessons 73–80)",
        items: [
          "Interdisciplinary discourse; academic presentation",
          "Writing specialized texts (written track)",
          "Spontaneous expert-level conversation",
          "Capstone project & final assessment",
        ],
      },
    ],
    note: "On the written track, the C2 reading material IS the specialized content — the alphabet strand is no longer separate; it becomes the delivery mode.",
  },
];

export const getCurriculum = (lang: Lang): CurriculumLevel[] =>
  lang === "ro" ? RO : EN;

/** Compact preview for cards (objective + a few highlight bullets). */
export const getCurriculumPreview = (
  lang: Lang,
  id: CurriculumLevel["id"],
  limit = 4,
): { obj: string; mods: string[] } => {
  const lvl = getCurriculum(lang).find((l) => l.id === id);
  if (!lvl) return { obj: "", mods: [] };
  let mods: string[] = [];
  if (lvl.items) mods = lvl.items.slice(0, limit);
  else if (lvl.spokenCore) mods = lvl.spokenCore.items.slice(0, limit);
  else if (lvl.blocks) mods = lvl.blocks.slice(0, limit).map((b) => b.title);
  return { obj: lvl.objective, mods };
};
