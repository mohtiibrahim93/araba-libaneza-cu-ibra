import { Link as RouterLink, type LinkProps } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { languageCounterpart } from "@/lib/languageRoutes";

/**
 * A <Link> that stays in the reader's language.
 *
 * The blog articles are bilingual components rendered at two URLs each, and
 * their in-body links were written as Romanian paths — `/blog/<slug>`. An
 * English reader on /en/blog/x who followed one landed on /blog/y: the
 * Romanian address, still rendering English, because nothing resets the
 * language on the way out of /en/. That is the duplicate-content problem the
 * English URLs were created to solve, reintroduced one link at a time.
 *
 * It also starved the English pages of links. Every English article had
 * exactly one route in — its own index — because all forty-three in-article
 * links pointed at the Romanian half of the site.
 *
 * So: when the reader is in English and a counterpart URL exists, go there
 * instead. When none exists the original is kept, which is correct — a
 * Romanian-only guide should still be reachable rather than silently dropped.
 * Query strings and hashes are preserved.
 */
export const Link = ({ to, ...rest }: LinkProps) => {
  const { lang } = useI18n();

  let dest = to;
  if (lang === "en" && typeof to === "string" && to.startsWith("/") && !to.startsWith("/en/")) {
    const cut = to.search(/[?#]/);
    const path = cut === -1 ? to : to.slice(0, cut);
    const tail = cut === -1 ? "" : to.slice(cut);
    const counterpart = languageCounterpart(path, "en");
    if (counterpart) dest = counterpart + tail;
  }

  return <RouterLink to={dest} {...rest} />;
};

export default Link;
