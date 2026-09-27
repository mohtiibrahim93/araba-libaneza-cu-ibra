/**
 * The site's category structure, in one place.
 *
 * These menus used to live inside Navbar.tsx, and the navbar renders them in a
 * Radix dropdown that mounts its contents only when opened. The prerendered
 * HTML therefore contained none of them: /arabizi and /fara-alfabet-arab
 * appeared zero times on the homepage, and /meditatii-araba only in the body
 * and footer, never the header. Every curated menu link — and with it the whole
 * hierarchy signal, which pages belong under Courses and which under Resources
 * — was invisible to anything that does not run JavaScript.
 *
 * The site survived on in-body and footer links (no orphans, max depth 2), but
 * the categorisation never reached a crawler. Exporting the data lets the
 * footer render the same structure as real anchors in the static HTML, so
 * humans and crawlers get one navigation, not two.
 */
/**
 * Navigation links follow the reader's language.
 *
 * This file used to import Link from router-compat, so every entry pointed at
 * the Romanian URL it was written as — on all 119 pages, English readers
 * included. src/components/LocalizedLink.tsx swaps in the counterpart when the
 * reader is in English and one exists, and leaves the path alone when it does
 * not (a Romanian-only page such as /joc stays reachable).
 *
 * It also starved the English half of the site of internal links: the nav and
 * the footer are on every page, so the Romanian pages collected ~96 links each
 * while their English twins collected one or two. Google had indexed neither
 * /en/courses/private nor six of the English articles — "Discovered, currently
 * not indexed", the state a page gets when nothing much points at it.
 */
export interface NavLink {
  to: string;
  label: string;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export const courseMenu = (lang: "ro" | "en"): NavLink[] =>
  lang === "en"
    ? [
        // The course pages have English twins now, so the English menu points at
        // those rather than sending an English reader to a Romanian URL. It is
        // also what gives /en/courses/* their internal links: without them the
        // pages existed only in the sitemap.
        { to: "/en/courses/group", label: "Group course (A1–C2)" },
        { to: "/en/courses/private", label: "Private lessons" },
        { to: "/en/courses/children", label: "Kids (6–11)" },
        { to: "/en/arabic-for-teenagers", label: "Teens (12–17)" },
        { to: "/en/courses/adults", label: "Adults" },
        { to: "/en/arabic-classes-near-me", label: "Arabic classes in Bucharest" },
        { to: "/en/arabic-tutor", label: "1-on-1 Arabic tutor" },
      ]
    : [
        { to: "/cursuri/grup", label: "Curs de grup (A1–C2)" },
        { to: "/cursuri/private", label: "Lecții private" },
        { to: "/cursuri/copii", label: "Copii (6–11)" },
        { to: "/cursuri-araba-adolescenti", label: "Adolescenți (12–17)" },
        { to: "/cursuri/adulti", label: "Adulți" },
        { to: "/cursuri-araba-bucuresti", label: "Cursuri în București" },
        { to: "/meditatii-araba", label: "Meditații 1:1" },
      ];

/**
 * In English the resource menu points at the English guides, so the /en/* pages
 * get real internal links instead of living only in the sitemap.
 */
export const resourceMenu = (lang: "ro" | "en"): NavLink[] =>
  lang === "en"
    ? [
        // The game is Romanian-only, so the English label says so rather than
        // sending a reader to a page they cannot use without warning.
        { to: "/joc", label: "The Yalla game (in Romanian)" },
        { to: "/en/learn-lebanese-arabic", label: "Learn Lebanese Arabic" },
        { to: "/en/how-to-learn-lebanese-arabic", label: "How to learn it" },
        { to: "/blog/lebanese-arabic-learning-resources", label: "Free learning resources" },
        { to: "/blog/lebanese-arabic-phrases", label: "Essential phrases" },
        { to: "/en/arabic-dialects-guide", label: "Arabic dialects guide" },
        { to: "/en/lebanese-arabic-vs-msa-vs-egyptian", label: "Lebanese vs MSA vs Egyptian" },
      ]
    : [
        { to: "/joc", label: "Jocul Yalla" },
        { to: "/resurse", label: "Resurse gratuite" },
        { to: "/invata-araba-gratis", label: "Învață araba gratis" },
        { to: "/arabizi", label: "Arabizi" },
        { to: "/fara-alfabet-arab", label: "Fără alfabet arab" },
        { to: "/dialecte-arabe", label: "Dialectele arabe" },
        { to: "/ce-araba-sa-inveti", label: "Ce arabă să înveți" },
        { to: "/araba-pentru-partener", label: "Arabă pentru partener" },
        { to: "/araba-in-familie", label: "Arabă în familie" },
      ];

/** Both menus with their headings — what the footer renders as a site map. */
export const navGroups = (lang: "ro" | "en"): NavGroup[] => [
  { heading: lang === "en" ? "Courses" : "Cursuri", links: courseMenu(lang) },
  { heading: lang === "en" ? "Resources" : "Resurse", links: resourceMenu(lang) },
];
