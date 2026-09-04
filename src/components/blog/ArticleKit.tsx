import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Target, Wrench } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Localized } from "@/lib/blogPosts";

/**
 * Structural blocks for long-form guides: a summary box, numbered steps that
 * each state an outcome and a common mistake, a troubleshooting list, a tools
 * list, a pull quote and a mid-article CTA.
 *
 * Why these specific blocks: each one answers a question a reader arrives with,
 * in a shape search engines and answer engines can lift directly — the summary
 * feeds snippets, the steps feed HowTo, the troubleshooting pairs feed "why is
 * my X not Y" queries. Prose alone buries all three.
 *
 * Everything is bilingual on one URL, like the rest of the blog: pass a plain
 * string for text that is the same in both languages, or {ro, en}.
 */
export type Loc = string | Localized;
export const pick = (v: Loc, lang: "ro" | "en"): string =>
  typeof v === "string" ? v : v[lang] ?? v.ro;

const useLang = () => useI18n().lang as "ro" | "en";
const L = (ro: string, en: string, lang: "ro" | "en") => (lang === "en" ? en : ro);

/** Key takeaways, above the fold. */
export const Tldr = ({ points }: { points: Loc[] }) => {
  const lang = useLang();
  return (
    <aside className="not-prose my-8 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {L("Pe scurt", "In short", lang)}
      </p>
      <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{pick(p, lang)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export interface Step {
  title: Loc;
  body: Loc;
  /** What the reader should be able to do once this step is done. */
  outcome?: Loc;
  /** The error most people make here. */
  mistake?: Loc;
}

/** Numbered steps. Feed the same array to BlogArticleLayout's `steps` for HowTo schema. */
export const Steps = ({ steps }: { steps: Step[] }) => {
  const lang = useLang();
  return (
    <ol className="not-prose my-8 space-y-8 list-none pl-0">
      {steps.map((s, i) => (
        <li key={i} className="border-l-2 border-border pl-5">
          <h3 className="font-display text-lg font-bold text-foreground">
            {i + 1}. {pick(s.title, lang)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{pick(s.body, lang)}</p>
          {s.outcome && (
            <p className="mt-3 flex gap-2 text-sm text-foreground/80">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <strong className="text-foreground">{L("Rezultat", "Expected outcome", lang)}:</strong>{" "}
                {pick(s.outcome, lang)}
              </span>
            </p>
          )}
          {s.mistake && (
            <p className="mt-2 flex gap-2 text-sm text-foreground/80">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <strong className="text-foreground">{L("Greșeala frecventă", "Common mistake", lang)}:</strong>{" "}
                {pick(s.mistake, lang)}
              </span>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};

/** Symptom → fix pairs. */
export const Troubleshooting = ({ items }: { items: { problem: Loc; fix: Loc }[] }) => {
  const lang = useLang();
  return (
    <ul className="not-prose my-6 space-y-3">
      {items.map((it, i) => (
        <li key={i} className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
          <strong className="text-foreground">{pick(it.problem, lang)}</strong>{" "}
          <span className="text-muted-foreground">{pick(it.fix, lang)}</span>
        </li>
      ))}
    </ul>
  );
};

/** What the reader needs to hand. */
export const Toolkit = ({ items }: { items: Loc[] }) => {
  const lang = useLang();
  return (
    <ul className="not-prose my-6 space-y-2 text-sm leading-relaxed text-foreground/85">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{pick(it, lang)}</span>
        </li>
      ))}
    </ul>
  );
};

/** One memorable line. */
export const PullQuote = ({ children }: { children: ReactNode }) => (
  <blockquote className="not-prose my-8 border-l-4 border-primary/60 pl-5 font-display text-lg italic text-foreground/90">
    {children}
  </blockquote>
);

/** Mid-article call to action, so the reader does not have to reach the end. */
export const InlineCta = ({ title, text, href, label }: { title: Loc; text: Loc; href: string; label: Loc }) => {
  const lang = useLang();
  return (
    <div className="not-prose my-10 rounded-2xl border border-border bg-primary/5 p-6 text-center">
      {/* Deliberately not an <h2>: the article outline is built from h2s, and a
          call to action is not a section of the article. */}
      <p className="font-display text-xl font-bold text-foreground">{pick(title, lang)}</p>
      <p className="mt-2 text-sm text-muted-foreground">{pick(text, lang)}</p>
      <Link
        to={href}
        data-cta
        className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {pick(label, lang)}
      </Link>
    </div>
  );
};
