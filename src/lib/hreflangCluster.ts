/**
 * The learn-Arabic hreflang cluster. It used to span three languages; the
 * German page was removed on 8 November 2026 (owner: no German site yet) and
 * now redirects to the Romanian member.
 *
 * Every other annotated page is a plain reciprocal RO/EN pair (see
 * landingAnnotations in scripts/seoPrerender.ts). This group is the exception:
 * /de/arabisch-lernen used to catch German searches and named Romanian and
 * English alternates, but neither named it back, so a crawl reported "Some
 * pages don't include hreflang links to all the other pages of the group". A
 * cluster is only honoured when every member links to every other member.
 *
 * The Romanian member is /cursuri-araba, not the homepage. /cursuri-araba and
 * /en/learn-lebanese-arabic already name each other, which is what makes them a
 * real pair; the homepage separately claimed /en/learn-lebanese-arabic as its
 * English version without being named back, so that annotation was one-way and
 * ignored. The homepage has no translation and now declares no hreflang at all.
 */
export const LEARN_CLUSTER = {
  ro: "/cursuri-limba-araba",
  en: "/en/learn-lebanese-arabic",
} as const;

/** Romanian is x-default: it is the site's primary language. */
export const LEARN_X_DEFAULT = LEARN_CLUSTER.ro;

export const LEARN_CLUSTER_PATHS: readonly string[] =
  Object.values(LEARN_CLUSTER);

export const isLearnClusterPath = (path: string): boolean =>
  LEARN_CLUSTER_PATHS.includes(path);
