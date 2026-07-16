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
