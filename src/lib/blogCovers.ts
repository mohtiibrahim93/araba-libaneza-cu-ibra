// Cover photo per blog article.
//
// Kept out of blogPosts.ts on purpose: that registry is the card *text* and is
// referenced by the SEO tests, while this is presentation. One file, one job.
//
// The image files live in public/blog/<slug>.webp at 1200x900 (4:3). The /blog
// card crops 4:3 and the article hero crops 16:9 from the same file, which is
// why every scene keeps its subject centred with room around it.
//
// alt describes the photographed scene, not the article — a screen reader user
// gets the same information a sighted reader gets from glancing at the image.

import type { Localized } from "@/lib/blogPosts";

export interface BlogCover {
  /** Site-root-relative path, e.g. /blog/ce-este-arabizi.webp */
  src: string;
  alt: Localized;
}

const SCENES: Record<string, Localized> = {
  "lebanese-arabic-learning-resources": {
    ro: "Un telefon care redă un podcast în arabă, lângă căști și cărți de studiu pe un birou",
    en: "A phone playing an Arabic podcast beside headphones and study books on a desk",
  },
  "limbile-vorbite-in-liban": {
    ro: "Indicatoare stradale din Beirut scrise în arabă, franceză și engleză",
    en: "Beirut street signs written in Arabic, French and English",
  },
  "de-ce-invatam-araba-in-2026": {
    ro: "O cursantă care ia notițe în arabă la o masă luminoasă de cafenea",
    en: "A learner taking notes in Arabic at a bright café table",
  },
  "lebanese-arabic-phrases": {
    ro: "Doi prieteni care discută la o masă de cafenea din Beirut",
    en: "Two friends in conversation at a Beirut café table",
  },
  "lebanese-family-vocabulary": {
    ro: "O familie libaneză din trei generații, adunată în jurul mesei",
    en: "A three-generation Lebanese family gathered around a table",
  },
  "invata-araba-libaneza-online": {
    ro: "Un laptop pe care se vede o lecție de arabă live, acasă",
    en: "A laptop showing a live Arabic video lesson at home",
  },
  "numere-in-araba-libaneza": {
    ro: "O tarabă din piața din Beirut, cu prețuri scrise de mână în cifre arabe",
    en: "A Beirut market stall with prices handwritten in Arabic numerals",
  },
  "cum-alegi-profesor-de-araba": {
    ro: "Un profesor și un cursant într-o lecție unu la unu, față în față",
    en: "A teacher and student in a one-to-one lesson, face to face",
  },
  "cat-dureaza-sa-inveti-araba-libaneza": {
    ro: "Un caiet de studiu cu un plan săptămână cu săptămână, lângă un calendar",
    en: "A study notebook showing a week-by-week plan beside a calendar",
  },
  "araba-pentru-copii-ghidul-parintilor": {
    ro: "Un părinte și un copil care exersează împreună literele arabe",
    en: "A parent and child practising Arabic letters together",
  },
  "cat-costa-cursurile-de-araba-libaneza": {
    ro: "Un caiet cu un buget de curs calculat, lângă un calculator de birou",
    en: "A notebook with a course budget worked out beside a calculator",
  },
  "alfabetul-arab-pentru-incepatori": {
    ro: "Literele alfabetului arab scrise de mână pe o fișă de exerciții",
    en: "Arabic alphabet letters handwritten across a practice sheet",
  },
  "ce-este-arabizi": {
    ro: "Ecranul unui telefon cu o conversație scrisă în arabizi, cu litere latine",
    en: "A phone screen showing a chat written in Arabizi, using Latin letters",
  },
  "cultura-libaneza-obiceiuri-mancare-traditii": {
    ro: "Un platou de mezze libanez întins pe toată masa, pentru a fi împărțit",
    en: "A Lebanese mezze spread shared across a full table",
  },
  "cum-saluti-in-libaneza": {
    ro: "Două persoane care se salută cald pe o stradă din Beirut",
    en: "Two people greeting each other warmly on a Beirut street",
  },
  "primele-20-de-expresii-libaneze": {
    ro: "Cartonașe cu expresii libaneze, așezate pe o masă",
    en: "Flashcards of Lebanese phrases laid out on a table",
  },
  "araba-libaneza-vs-araba-standard": {
    ro: "Un ziar în arabă standard, lângă expresii în dialect notate într-un caiet",
    en: "A Standard Arabic newspaper beside dialect phrases jotted in a notebook",
  },
  "cum-inveti-araba-libaneza": {
    ro: "Un birou de studiu cu un manual de arabă, un caiet și un plan de învățare",
    en: "A study desk with an Arabic textbook, notebook and a learning plan",
  },
  "gramatica-arabei-libaneze": {
    ro: "O tablă albă pe care un verb arab este conjugat pas cu pas",
    en: "A whiteboard showing an Arabic verb conjugated step by step",
  },
};

/** The cover for an article, or undefined when it has no photo yet. */
export const getBlogCover = (slug: string): BlogCover | undefined => {
  const alt = SCENES[slug];
  return alt ? { src: `/blog/${slug}.webp`, alt } : undefined;
};
