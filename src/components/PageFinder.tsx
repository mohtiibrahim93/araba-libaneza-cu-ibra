/**
 * The recommendation block shown to anyone who did not land where they meant to.
 *
 * Used twice: on the 404 page (compact, plus the "did you mean" guesses derived
 * from the wrong address) and on the dedicated /te-ajutam · /en/find-your-page
 * pages (full lists). One component so the two cannot drift apart.
 *
 * The search runs entirely in the browser over the route registry — no request,
 * no waiting, and it works on the 404 page where there is nothing to fetch.
 */
import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Search } from "lucide-react";
import { L, blogPostsNewestFirst } from "@/lib/blogPosts";
import { getBlogCover } from "@/lib/blogCovers";
import {
  COURSE_PICKS,
  RESOURCE_PICKS,
  searchPages,
  suggestFor,
  type FoundPage,
} from "@/lib/pageFinder";
import { trackEvent } from "@/lib/tracking";

interface Props {
  lang: "ro" | "en";
  /** The address that did not exist, when this is rendered on the 404 page. */
  wrongPath?: string;
  /** Full lists (dedicated page) instead of a shortlist (404). */
  full?: boolean;
}

const T = {
  suggestions: { ro: "Cel mai probabil căutai", en: "You were probably looking for" },
  searchLabel: { ro: "Caută în site", en: "Search the site" },
  searchPlaceholder: {
    ro: "Ex: curs pentru copii, alfabet, prețuri…",
    en: "e.g. kids course, alphabet, prices…",
  },
  noResults: {
    ro: "Nimic pentru acest cuvânt. Încearcă „curs”, „copii”, „alfabet” sau „prețuri”.",
    en: "Nothing for that word. Try “course”, “kids”, “alphabet” or “prices”.",
  },
  courses: { ro: "Cursuri", en: "Courses" },
  resources: { ro: "Resurse gratuite și jocul", en: "Free resources and the game" },
  blog: { ro: "Articole din blog", en: "From the blog" },
  allBlog: { ro: "Vezi toate articolele", en: "See all articles" },
} as const;

const cardClass =
  "block rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary";

function ResultLink({ page, event, lang }: { page: FoundPage; event: string; lang: "ro" | "en" }) {
  return (
    <Link
      to={page.path}
      className={cardClass}
      onClick={() => trackEvent(event, { target: page.path, lang })}
    >
      <span className="block text-sm font-semibold">{page.title}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{page.description}</span>
    </Link>
  );
}

const PageFinder = ({ lang, wrongPath, full = false }: Props) => {
  const [query, setQuery] = useState("");
  const suggestions = useMemo(() => (wrongPath ? suggestFor(wrongPath) : []), [wrongPath]);
  const results = useMemo(() => searchPages(query, lang), [query, lang]);
  const posts = full ? blogPostsNewestFirst.slice(0, 9) : blogPostsNewestFirst.slice(0, 3);
  const courses = full ? COURSE_PICKS : COURSE_PICKS.slice(0, 3);
  const resources = full ? RESOURCE_PICKS : RESOURCE_PICKS.slice(0, 3);

  return (
    <div className="space-y-12">
      {suggestions.length > 0 && (
        <section aria-labelledby="pf-suggestions">
          <h2 id="pf-suggestions" className="text-lg font-semibold">
            {T.suggestions[lang]}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {suggestions.map((p) => (
              <ResultLink key={p.path} page={p} event="404Suggestion" lang={lang} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="pf-search">
        <h2 id="pf-search" className="text-lg font-semibold">
          {T.searchLabel[lang]}
        </h2>
        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={T.searchLabel[lang]}
            placeholder={T.searchPlaceholder[lang]}
            className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        {query.trim().length > 1 && (
          <div className="mt-4" aria-live="polite">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">{T.noResults[lang]}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((p) => (
                  <ResultLink key={p.path} page={p} event="PageFinderSearchClick" lang={lang} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="pf-courses">
        <h2 id="pf-courses" className="text-lg font-semibold">
          {T.courses[lang]}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.to} to={c.to} className={cardClass}>
              <span className="block text-sm font-semibold">{c.label[lang]}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{c.note[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="pf-resources">
        <h2 id="pf-resources" className="text-lg font-semibold">
          {T.resources[lang]}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <Link key={r.to} to={r.to} className={cardClass}>
              <span className="block text-sm font-semibold">{r.label[lang]}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{r.note[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="pf-blog">
        <h2 id="pf-blog" className="text-lg font-semibold">
          {T.blog[lang]}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const cover = getBlogCover(p.slug);
            const to = lang === "en" ? `/en/blog/${p.slug}` : `/blog/${p.slug}`;
            return (
              <Link
                key={p.slug}
                to={to}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
              >
                {cover && (
                  <img
                    src={cover.src}
                    alt={L(cover.alt, lang)}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <span className="block p-4">
                  <span className="block text-sm font-semibold">{L(p.title, lang)}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {L(p.description, lang)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-sm">
          <Link to={lang === "en" ? "/en/blog" : "/blog"} className="font-medium text-primary hover:underline">
            {T.allBlog[lang]} →
          </Link>
        </p>
      </section>
    </div>
  );
};

export default PageFinder;
