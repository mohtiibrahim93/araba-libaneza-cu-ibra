// Single source of truth for the blog index and routing. Each article page
// still owns its full body + JSON-LD; this registry is the card metadata the
// /blog index and any "related posts" lists read, so they never drift.

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO date
  readingMinutes: number;
  tag: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "cat-costa-cursurile-de-araba-libaneza",
    title: "Cât costă cursurile de arabă libaneză în 2026?",
    description:
      "Prețurile cursurilor de arabă libaneză: grup lunar sau plată integrală cu reducere, lecții private, curs pentru copii și proba gratuită. Fără costuri ascunse.",
    published: "2026-07-16",
    readingMinutes: 5,
    tag: "Prețuri",
  },
  {
    slug: "alfabetul-arab-pentru-incepatori",
    title: "Alfabetul arab pentru începători: cele 28 de litere",
    description:
      "Ghid pentru alfabetul arab: cele 28 de litere, cum se pronunță, scrierea dreapta-la-stânga și de ce nu ai nevoie de alfabet ca să începi să vorbești.",
    published: "2026-07-16",
    readingMinutes: 7,
    tag: "Începători",
  },
  {
    slug: "ce-este-arabizi",
    title: "Ce este arabizi și cum îl folosești (cu tabel)",
    description:
      "Arabizi este araba scrisă cu litere latine și cifre. Ce înseamnă cifrele 2, 3, 5, 7, cum citești și de ce e cea mai rapidă cale să începi să vorbești libaneză.",
    published: "2026-07-16",
    readingMinutes: 5,
    tag: "Începători",
  },
  {
    slug: "cultura-libaneza-obiceiuri-mancare-traditii",
    title: "Cultura libaneză: obiceiuri, mâncare și tradiții",
    description:
      "Un ghid cald despre cultura Libanului: ospitalitatea, mâncarea (mezze, tabbouleh, kibbeh), muzica și tradițiile — contextul viu din spatele limbii.",
    published: "2026-07-16",
    readingMinutes: 6,
    tag: "Cultură",
  },
  {
    slug: "cum-saluti-in-libaneza",
    title: "Cum saluți în libaneză: ghid complet de politețe",
    description:
      "Toate formulele de salut în araba libaneză: bună dimineața, ce faci, bine ai venit, pa — cu pronunție în arabizi, scriere arabă și când folosești fiecare.",
    published: "2026-07-16",
    readingMinutes: 4,
    tag: "Începători",
  },
  {
    slug: "primele-20-de-expresii-libaneze",
    title: "Primele 20 de expresii în araba libaneză (cu pronunție)",
    description:
      "Cele mai utile 20 de expresii libaneze pentru începători — salut, politețe, cafenea, taxi — scrise în arabizi cu pronunție și traducere.",
    published: "2026-07-16",
    readingMinutes: 6,
    tag: "Începători",
  },
  {
    slug: "araba-libaneza-vs-araba-standard",
    title: "Araba libaneză vs araba standard (MSA): ce înveți?",
    description:
      "Comparație clară între araba libaneză (dialect) și araba standard (Fusha/MSA): utilizări practice, dificultate, context cultural și ce curs să alegi.",
    published: "2026-07-15",
    readingMinutes: 7,
    tag: "Ghid",
  },
  {
    slug: "cum-inveti-araba-libaneza",
    title: "Cum înveți araba libaneză în 2026: ghid pentru începători",
    description:
      "Ghid pas cu pas pentru a învăța araba libaneză: diferența față de araba standard (Fusha), cât durează, cele mai bune metode, greșeli frecvente și fraze utile.",
    published: "2026-07-10",
    readingMinutes: 8,
    tag: "Ghid",
  },
];

/** Newest first — the order the index renders. */
export const blogPostsNewestFirst = [...BLOG_POSTS].sort(
  (a, b) => b.published.localeCompare(a.published),
);
