import { Link } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { blogPostsNewestFirst, L } from "@/lib/blogPosts";
import { useI18n } from "@/lib/i18n";

/**
 * "Citește și" — up to 3 other posts, for internal linking + engagement.
 * Reads the shared registry so it always reflects the live post list.
 */
const RelatedPosts = ({ currentSlug }: { currentSlug: string }) => {
  const { lang } = useI18n();
  const posts = blogPostsNewestFirst.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10" aria-label={lang === "en" ? "Related articles" : "Articole conexe"}>
      <h2 className="font-display text-xl font-bold text-foreground mb-5">{lang === "en" ? "Read next" : "Citește și"}</h2>
      <ul className="grid sm:grid-cols-3 gap-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
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
