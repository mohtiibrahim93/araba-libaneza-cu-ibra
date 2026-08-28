// Single source of truth for the blog index and routing. Each article page
// still owns its full body + JSON-LD; this registry is the card metadata the
// /blog index and any "related posts" lists read, so they never drift.
// Bilingual: title/description/tag carry both RO and EN, picked by the site
// language toggle (single URL per article, like the rest of the site).

export type Localized = { ro: string; en: string };

export interface BlogPostMeta {
  slug: string;
  title: Localized;
  description: Localized;
  published: string; // ISO date
  readingMinutes: number;
  tag: Localized;
}

/** Pick a localized string for the current language. */
export const L = (v: Localized, lang: "ro" | "en") => v[lang] ?? v.ro;

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "lebanese-arabic-learning-resources",
    title: {
      ro: "Resurse pentru araba libaneză: aplicații și podcasturi",
      en: "The best Lebanese Arabic learning resources (apps, podcasts, media)",
    },
    description: {
      ro: "Ghid curat al aplicațiilor, podcasturilor, cărților și serialelor pentru a învăța araba libaneză — dialect libanez, nu MSA. Recomandate de un profesor nativ.",
      en: "A curated guide to the apps, podcasts, books and TV series worth using to learn Lebanese Arabic — Lebanese dialect, not MSA. Recommended by a native teacher.",
    },
    published: "2026-07-24",
    readingMinutes: 7,
    tag: { ro: "Resurse", en: "Resources" },
  },
  {
    slug: "limbile-vorbite-in-liban",
    title: {
      ro: "Limbile vorbite în Liban: arabă libaneză, MSA, franceză și engleză",
      en: "Languages of Lebanon: Lebanese Arabic, MSA, French and English",
    },
    description: {
      ro: "Ghid complet despre limbile din Liban — araba libaneză (dialectul zilnic), araba standard (MSA), franceza și engleza. Cine ce vorbește și de ce libaneza e cheia.",
      en: "A complete guide to the languages of Lebanon — Lebanese Arabic, Modern Standard Arabic, French and English. Who speaks what, and why Lebanese Arabic is the key.",
    },
    published: "2026-07-24",
    readingMinutes: 7,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "de-ce-invatam-araba-in-2026",
    title: {
      ro: "De ce merită să înveți arabă în 2026 (și de ce dialectul, nu MSA)",
      en: "Why learning Arabic in 2026 matters — and why the dialect, not MSA",
    },
    description: {
      ro: "Arabă e printre cele mai vorbite limbi din lume, cererea pentru vorbitori crește, iar în 2026 dialectele au depășit MSA la căutări online.",
      en: "Arabic is one of the world's most spoken languages, demand is rising, and in 2026 dialects have overtaken MSA in online searches.",
    },
    published: "2026-07-24",
    readingMinutes: 6,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "lebanese-arabic-phrases",
    title: {
      ro: "35+ Expresii în Araba Libaneză pe Care Le Auzi Zilnic în Liban",
      en: "35+ Lebanese Arabic Phrases You'll Actually Hear Every Day",
    },
    description: {
      ro: "Expresiile libaneze care chiar se folosesc, grupate pe situație: salut, prezentare, cafenea, taxi, sentimente, timp. Fiecare cu pronunție în arabizi și scriere arabă, de la un profesor nativ.",
      en: "The Lebanese phrases people really use, grouped by situation: greetings, introductions, café, taxi, feelings, time. Each one with Arabizi pronunciation and Arabic script, from a native teacher.",
    },
    published: "2026-07-24",
    readingMinutes: 7,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "lebanese-family-vocabulary",
    title: {
      ro: "Familia în araba libaneză: vocabular complet",
      en: "Family vocabulary in Lebanese Arabic (core, extended, in-laws)",
    },
    description: {
      ro: "Vocabularul complet al familiei în araba libaneză: părinți, frați, bunici, unchi/mătuși (mamă vs tată), veri, socri, plus pronumele posesive.",
      en: "The complete family vocabulary in Lebanese Arabic: parents, siblings, grandparents, uncles/aunts (maternal vs paternal), cousins, in-laws.",
    },
    published: "2026-07-24",
    readingMinutes: 6,
    tag: { ro: "Vocabular", en: "Vocabulary" },
  },
  {
    slug: "learn-lebanese-arabic",
    title: {
      ro: "Cum înveți araba libaneză: ghid practic pentru începători",
      en: "Learn Lebanese Arabic: a practical beginner's guide",
    },
    description: {
      ro: "Învață araba libaneză pas cu pas: diferențe față de MSA, metode eficiente, greșeli frecvente și primele fraze utile pentru începători.",
      en: "A step-by-step guide to learning Lebanese Arabic: what the Lebanese dialect is, how it differs from MSA, how long it takes, effective methods, common mistakes and your first useful phrases.",
    },
    published: "2026-07-24",
    readingMinutes: 8,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "invata-araba-libaneza-online",
    title: {
      ro: "Cum înveți araba libaneză online (de oriunde)",
      en: "How to learn Lebanese Arabic online (from anywhere)",
    },
    description: {
      ro: "Cum funcționează cursurile de arabă libaneză online: de ce ai nevoie, cum arată o lecție pe Zoom, dacă online e la fel de bun ca fizic și pentru cine e potrivit.",
      en: "How online Lebanese Arabic courses work: what you need, what a Zoom lesson looks like, whether online is as good as in person and who it's for.",
    },
    published: "2026-07-17",
    readingMinutes: 6,
    tag: { ro: "Online", en: "Online" },
  },
  {
    slug: "numere-in-araba-libaneza",
    title: {
      ro: "Numerele în araba libaneză: de la 0 la 1000 (cu tabel)",
      en: "Numbers in Lebanese Arabic: from 0 to 1000 (with a table)",
    },
    description: {
      ro: "Cum numeri în araba libaneză: cifrele 0–10, zecile, sutele și miile, în arabizi și scriere arabă — plus cum ceri prețul și dai un număr de telefon.",
      en: "How to count in Lebanese Arabic: digits 0–10, tens, hundreds and thousands, in Arabizi and Arabic script — plus how to ask a price and give a phone number.",
    },
    published: "2026-07-17",
    readingMinutes: 4,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "cum-alegi-profesor-de-araba",
    title: {
      ro: "Cum alegi un profesor de arabă: întrebările esențiale",
      en: "How to choose an Arabic tutor: the essential questions",
    },
    description: {
      ro: "Ghid pentru a alege profesorul de arabă potrivit: ce să întrebi despre experiență, metodă, preț, format și rezultate — plus semnalele de alarmă de evitat.",
      en: "A guide to choosing the right Arabic tutor: what to ask about experience, method, price, format and results — plus the red flags to avoid.",
    },
    published: "2026-07-17",
    readingMinutes: 6,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "cat-dureaza-sa-inveti-araba-libaneza",
    title: {
      ro: "Cât durează să înveți arabă libaneză?",
      en: "How long does it take to learn Lebanese Arabic?",
    },
    description: {
      ro: "De cât timp ai nevoie ca să vorbești arabă libaneză: durata pe fiecare nivel (A1–C2), câte ore pe săptămână și ce influențează ritmul. Estimări realiste.",
      en: "How much time you need to speak Lebanese Arabic: duration per level (A1–C2), hours per week and what affects your pace. Realistic estimates.",
    },
    published: "2026-07-16",
    readingMinutes: 5,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "araba-pentru-copii-ghidul-parintilor",
    title: {
      ro: "Cursuri de arabă pentru copii: ghidul părinților",
      en: "Arabic courses for kids: a parent's guide",
    },
    description: {
      ro: "De la ce vârstă pot învăța copiii arabă libaneză, cum arată o lecție, ce metode funcționează și cum îi ajuți acasă. Ghid practic pentru părinți.",
      en: "From what age kids can learn Lebanese Arabic, what a lesson looks like, which methods work and how to help at home. A practical parent's guide.",
    },
    published: "2026-07-16",
    readingMinutes: 5,
    tag: { ro: "Copii", en: "Kids" },
  },
  {
    slug: "cat-costa-cursurile-de-araba-libaneza",
    title: {
      ro: "Cât costă cursurile de arabă libaneză în 2026?",
      en: "How much do Lebanese Arabic courses cost in 2026?",
    },
    description: {
      ro: "Prețurile cursurilor de arabă libaneză: grup lunar sau plată integrală cu reducere, lecții private, curs pentru copii și proba gratuită. Fără costuri ascunse.",
      en: "Lebanese Arabic course prices: monthly group or discounted pay-in-full, private lessons, kids course and the free trial. No hidden fees.",
    },
    published: "2026-07-16",
    readingMinutes: 5,
    tag: { ro: "Prețuri", en: "Pricing" },
  },
  {
    slug: "alfabetul-arab-pentru-incepatori",
    title: {
      ro: "Alfabetul Arab: Cele 28 de Litere, Pronunția și Cum Vorbești Fără El",
      en: "The Arabic Alphabet: 28 Letters, Pronunciation & Why You Can Speak Without It",
    },
    description: {
      ro: "Tabelul complet al celor 28 de litere arabe, cu numele și sunetul fiecăreia explicat în română. Scrierea dreapta-la-stânga, formele din cuvânt și sunetele care nu există în română (ح, ع, ق) — de la un profesor nativ libanez.",
      en: "The full table of all 28 Arabic letters, each with its name and sound. Right-to-left writing, how letters change shape inside a word, and the sounds that don't exist in English (ح, ع, ق) — from a native Lebanese teacher.",
    },
    published: "2026-07-16",
    readingMinutes: 7,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "ce-este-arabizi",
    title: {
      ro: "Ce este arabizi și cum îl folosești (cu tabel)",
      en: "What is Arabizi and how to use it (with a table)",
    },
    description: {
      ro: "Arabizi este araba scrisă cu litere latine și cifre. Ce înseamnă cifrele 2, 3, 5, 7, cum citești și de ce e cea mai rapidă cale să începi să vorbești libaneză.",
      en: "Arabizi is Arabic written with Latin letters and numbers. What 2, 3, 5, 7 mean, how to read it and why it's the fastest way to start speaking Lebanese.",
    },
    published: "2026-07-16",
    readingMinutes: 5,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "cultura-libaneza-obiceiuri-mancare-traditii",
    title: {
      ro: "Cultura libaneză: obiceiuri, mâncare și tradiții",
      en: "Lebanese culture: customs, food and traditions",
    },
    description: {
      ro: "Un ghid cald despre cultura Libanului: ospitalitatea, mâncarea (mezze, tabbouleh, kibbeh), muzica și tradițiile — contextul viu din spatele limbii.",
      en: "A warm guide to Lebanese culture: hospitality, food (mezze, tabbouleh, kibbeh), music and traditions — the living context behind the language.",
    },
    published: "2026-07-16",
    readingMinutes: 6,
    tag: { ro: "Cultură", en: "Culture" },
  },
  {
    slug: "cum-saluti-in-libaneza",
    title: {
      ro: "Cum Saluți în Libaneză: Mar7aba, Kifak și Când Folosești Fiecare",
      en: "How to Greet in Lebanese Arabic: Mar7aba, Kifak & When to Use Each",
    },
    description: {
      ro: "Învață saluturile esențiale în araba libaneză: Mar7aba, Kifak și yalla bye, cu pronunție, scriere arabă și când se folosește fiecare.",
      en: "From 'Mar7aba' to 'yalla bye': the greetings you hear daily in Lebanon, with Arabizi pronunciation, Arabic script and the right moment for each — including the masculine and feminine forms.",
    },
    published: "2026-07-16",
    readingMinutes: 4,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "primele-20-de-expresii-libaneze",
    title: {
      ro: "20 de expresii în arabă libaneză pentru începători",
      en: "The first 20 Lebanese Arabic phrases (with pronunciation)",
    },
    description: {
      ro: "Cele mai utile 20 de expresii libaneze pentru începători — salut, politețe, cafenea, taxi — scrise în arabizi cu pronunție și traducere.",
      en: "The 20 most useful Lebanese phrases for beginners — greetings, politeness, café, taxi — written in Arabizi with pronunciation and translation.",
    },
    published: "2026-07-16",
    readingMinutes: 6,
    tag: { ro: "Începători", en: "Beginners" },
  },
  {
    slug: "araba-libaneza-vs-araba-standard",
    title: {
      ro: "Araba libaneză vs araba standard (MSA): ce înveți?",
      en: "Lebanese Arabic vs Standard Arabic (MSA): what do you learn?",
    },
    description: {
      ro: "Comparație clară între araba libaneză (dialect) și araba standard (Fusha/MSA): utilizări practice, dificultate, context cultural și ce curs să alegi.",
      en: "A clear comparison between Lebanese Arabic (dialect) and Standard Arabic (Fusha/MSA): practical uses, difficulty, cultural context and which course to choose.",
    },
    published: "2026-07-15",
    readingMinutes: 7,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "cum-inveti-araba-libaneza",
    title: {
      ro: "Cum înveți araba libaneză în 2026: ghid pentru începători",
      en: "How to learn Lebanese Arabic in 2026: a beginner's guide",
    },
    description: {
      ro: "Ghid pas cu pas pentru a învăța araba libaneză: diferența față de araba standard (Fusha), cât durează, cele mai bune metode, greșeli frecvente și fraze utile.",
      en: "A step-by-step guide to learning Lebanese Arabic: the difference from Standard Arabic (Fusha), how long it takes, the best methods, common mistakes and useful phrases.",
    },
    published: "2026-07-10",
    readingMinutes: 8,
    tag: { ro: "Ghid", en: "Guide" },
  },
  {
    slug: "gramatica-arabei-libaneze",
    title: {
      ro: "Gramatica arabei libaneze: top 5 întrebări (b-, pronume, ordinea cuvintelor)",
      en: "Lebanese Arabic grammar: top 5 questions (b-, pronouns, word order)",
    },
    description: {
      ro: "Ghid clar pentru cele mai frecvente 5 întrebări de gramatică în araba libaneză: prefixul بـ, verbele la trecut cu pronume atașate, pronumele personale/posesive, ordinea cuvintelor și diferențele față de MSA.",
      en: "A clear guide to the top 5 grammar questions in Lebanese Arabic: the بـ prefix, past-tense verbs with attached pronouns, personal and possessive pronouns, word order, and the key differences from MSA.",
    },
    published: "2026-07-24",
    readingMinutes: 9,
    tag: { ro: "Gramatică", en: "Grammar" },
  },
];

/** Newest first — the order the index renders. */
export const blogPostsNewestFirst = [...BLOG_POSTS].sort(
  (a, b) => b.published.localeCompare(a.published),
);
