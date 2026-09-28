import { Link } from "@/components/LocalizedLink";
import { useI18n } from "@/lib/i18n";
import { languageCounterpart } from "@/lib/languageRoutes";

/**
 * "Celelalte comparații" — the five sibling comparisons, at the foot of each one.
 *
 * Each comparison used to name two or three siblings in its prose, chosen by
 * whoever wrote the page. A live crawl of all 121 sitemap URLs found every
 * spoke sitting at two to four inbound links as a result, in both languages —
 * the thin-linking shape Search Console files under "Discovered, currently not
 * indexed". A complete list on every spoke makes it five siblings each, and it
 * is what a reader comparing dialects wants anyway.
 *
 * Addressed by Romanian path throughout, including from the English pages:
 * LocalizedLink swaps in the English URL for an English reader, so the pairs in
 * languageRoutes stay the one place the two halves are mapped.
 */
const COMPARISONS = [
  { path: "/dialecte-arabe/libaneza-vs-egipteana", ro: "libaneză vs. egipteană", en: "Lebanese vs. Egyptian" },
  { path: "/dialecte-arabe/libaneza-vs-siriana", ro: "libaneză vs. siriană", en: "Lebanese vs. Syrian" },
  { path: "/dialecte-arabe/levantina-vs-golf", ro: "levantina vs. araba din Golf", en: "Levantine vs. Gulf" },
  { path: "/dialecte-arabe/levantina-vs-irakiana", ro: "levantina vs. araba irakiană", en: "Levantine vs. Iraqi" },
  { path: "/dialecte-arabe/levantina-vs-maghrebina", ro: "levantina vs. araba maghrebină", en: "Levantine vs. Maghrebi" },
  {
    path: "/dialecte-arabe/levantina-vs-peninsulara",
    ro: "levantina vs. araba din Peninsula Arabică",
    en: "Levantine vs. Peninsular",
  },
] as const;

const DialectSiblings = ({ current }: { current: string }) => {
  const { lang } = useI18n();
  // `current` may arrive as either half's URL, so both are compared.
  const others = COMPARISONS.filter(
    (c) => c.path !== current && languageCounterpart(c.path, "en") !== current,
  );

  return (
    <>
      <h2>{lang === "en" ? "The other comparisons" : "Celelalte comparații"}</h2>
      <ul>
        {others.map((c) => (
          <li key={c.path}>
            <Link to={c.path}>{lang === "en" ? c.en : c.ro}</Link>
          </li>
        ))}
        <li>
          <Link to="/dialecte-arabe">
            {lang === "en" ? "All the dialects, side by side" : "Toate dialectele, pe scurt"}
          </Link>
        </li>
      </ul>
    </>
  );
};

export default DialectSiblings;
