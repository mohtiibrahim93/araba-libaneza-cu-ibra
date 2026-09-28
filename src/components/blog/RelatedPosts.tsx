import { Link } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { blogPostsNewestFirst, L } from "@/lib/blogPosts";
import { useI18n } from "@/lib/i18n";

/**
 * "Citește și" — 3 other posts, for internal linking + engagement.
 * Reads the shared registry so it always reflects the live post list.
 *
 * The three are the next three in publication order, wrapping round at the
 * end, so every post is linked from exactly three others. It used to take the
 * three newest for every article, which meant those three collected a link
 * from all nineteen while the rest were left with one — the blog index — and
 * a page with one internal link is the "Discovered, currently not indexed"
 * shape Search Console reports. A ring also keeps the choice deterministic,
 * so the server and the browser render the same block.
 *
 * Relevance is barely affected: the whole blog is one subject. If that stops
 * being true, sort candidates by shared tag *within* the ring rather than
 * going back to a global slice, or the older posts lose their links again.
 */
const RelatedPosts = ({ currentSlug }: { currentSlug: string }) => {
  const { lang } = useI18n();
  const all = blogPostsNewestFirst;
  const here = all.findIndex((p) => p.slug === currentSlug);
  // An unknown slug (a draft, or a post pulled from the registry) still gets a
  // block rather than a blank: fall back to the front of the list.
  const start = here === -1 ? 0 : here + 1;
  const posts = Array.from({ length: Math.min(3, Math.max(all.length - 1, 0)) }, (_, i) =>
    all[(start + i) % all.length]!,
  ).filter((p) => p.slug !== currentSlug);
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10" aria-label={lang === "en" ? "Related articles" : "Articole conexe"}>
      <h2 className="font-display text-xl font-bold text-foreground mb-5">{lang === "en" ? "Read next" : "Citește și"}</h2>
      <ul className="grid sm:grid-cols-3 gap-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all"
            >
              <span className="inline-flex w-fit px-2 py-0.5 mb-2 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                {L(p.tag, lang)}
              </span>
              <span className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors flex-1">
                {L(p.title, lang)}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                {lang === "en" ? "Read" : "Citește"} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedPosts;
