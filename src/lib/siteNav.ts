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
        { to: "/cursuri/grup", label: "Group course (A1–C2)" },
        { to: "/cursuri/private", label: "Private lessons" },
        { to: "/cursuri/copii", label: "Kids (6–10)" },
        { to: "/en/arabic-for-teenagers", label: "Teens (11–17)" },
        { to: "/cursuri/adulti", label: "Adults" },
        { to: "/en/arabic-classes-near-me", label: "Arabic classes in Bucharest" },
        { to: "/en/arabic-tutor", label: "1-on-1 Arabic tutor" },
      ]
    : [
        { to: "/cursuri/grup", label: "Curs de grup (A1–C2)" },
        { to: "/cursuri/private", label: "Lecții private" },
        { to: "/cursuri/copii", label: "Copii (6–10)" },
        { to: "/cursuri-araba-adolescenti", label: "Adolescenți (11–17)" },
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
        { to: "/en/learn-lebanese-arabic", label: "Learn Lebanese Arabic" },
        { to: "/en/how-to-learn-lebanese-arabic", label: "How to learn it" },
        { to: "/blog/lebanese-arabic-learning-resources", label: "Free learning resources" },
        { to: "/blog/lebanese-arabic-phrases", label: "Essential phrases" },
        { to: "/en/arabic-dialects-guide", label: "Arabic dialects guide" },
        { to: "/en/lebanese-arabic-vs-msa-vs-egyptian", label: "Lebanese vs MSA vs Egyptian" },
      ]
    : [
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
