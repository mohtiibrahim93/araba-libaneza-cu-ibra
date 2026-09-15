import { useEffect, useState, type RefObject } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Sticky outline of an article's H2s, beside the body from 1024px up.
 *
 * Headings are read from the rendered DOM rather than passed in as a prop, for
 * two reasons: the twenty existing articles write their own markup and mostly
 * do not give their H2s ids, and an owner-published CMS override replaces the
 * body with rendered Markdown that has no ids either. Scanning after paint
 * covers both without touching a single article, and any heading missing an id
 * gets one derived from its text so the link has somewhere to land.
 *
 * Nothing renders when an article has fewer than two headings — an outline of
 * one entry is furniture, not navigation.
 */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

interface Heading {
  id: string;
  text: string;
}

const ArticleOutline = ({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) => {
  const { lang } = useI18n();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  // Re-scan when the language flips: the toggle swaps the body text in place,
  // so the outline has to follow it.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const found: Heading[] = [];
    const seen = new Set<string>();
    root.querySelectorAll("h2").forEach((h) => {
      const text = (h.textContent || "").trim();
      if (!text) return;
      let id = h.id || h.closest("section[id]")?.id || slugify(text);
      while (seen.has(id)) id = `${id}-2`;
      seen.add(id);
      if (!h.id) h.id = id;
      // Clear the fixed navbar when jumped to.
      h.classList.add("scroll-mt-28");
      found.push({ id, text });
    });
    setHeadings(found.length > 1 ? found : []);
  }, [containerRef, lang]);

  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    // Scroll-spy is an enhancement: where IntersectionObserver is missing the
    // outline still renders and its links still work, just without the
    // current-section highlight.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Band just below the navbar, so a heading counts as "current" while its
      // section is what the reader is actually looking at.
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav
      aria-label={lang === "en" ? "On this page" : "Cuprins"}
      className="hidden lg:block sticky top-28 self-start max-h-[calc(100vh-9rem)] overflow-y-auto pr-4"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {lang === "en" ? "On this page" : "Cuprins"}
      </p>
      <ul className="space-y-2 border-l border-border text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "true" : undefined}
              className={`-ml-px block border-l-2 py-0.5 pl-3 leading-snug transition-colors ${
                active === h.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ArticleOutline;
