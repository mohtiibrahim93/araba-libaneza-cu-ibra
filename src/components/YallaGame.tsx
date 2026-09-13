/**
 * Yalla — the practice game, embedded from /public/yalla.
 *
 * The game is a self-contained static app (its own content bank, learning
 * engine, teacher workspace and Anki export) served from this domain rather
 * than a third-party host. It is framed rather than ported because its styles
 * are global and would otherwise collide with the site's; the iframe keeps the
 * two CSS worlds apart while still serving everything from one origin.
 *
 * Same origin is what makes the rest work: the microphone grant below, the
 * game's relative asset paths, and its localStorage progress all depend on it.
 *
 * Progress lives in the visitor's own browser — this is deliberately not an
 * account. Nothing here syncs across devices, and the page must not imply it
 * does; the game's own transfer control is how a learner moves progress.
 */
import { useEffect, useState } from "react";

type YallaGameProps = {
  /** Which of the game's own views to open on. `journey` is the practice game. */
  mode?: "journey" | "placement" | "speaking" | "exports";
  /** Romanian by default; the chrome around the game follows the site language. */
  lang?: "ro" | "en";
};

const COPY = {
  ro: { open: "Deschide pe tot ecranul", label: "Yalla — joc de arabă libaneză" },
  en: { open: "Open full screen", label: "Yalla — Lebanese Arabic game" },
} as const;

const TITLES: Record<NonNullable<YallaGameProps["mode"]>, string> = {
  journey: "Yalla — joacă și învață",
  placement: "Yalla — orientare, versiune pilot",
  speaking: "Yalla — exersează cu voce tare",
  exports: "Yalla — exporturi",
};

const YallaGame = ({ mode = "journey", lang = "ro" }: YallaGameProps) => {
  const src = `/yalla/index.html?view=${mode}`;
  const c = COPY[lang];

  // The frame gets its src only after mount, and this is not a micro-
  // optimisation: the page is prerendered, so a src in the static HTML makes
  // the browser start fetching the game immediately, and hydration then
  // replaces the iframe element and starts the whole fetch again. Measured,
  // every one of the game's assets was requested twice — about a megabyte of
  // JavaScript begun and then aborted — while the page itself was still
  // trying to become interactive.
  //
  // Nothing is lost by deferring it. Crawlers never attribute iframe content
  // to the embedding page, so the static HTML was never indexing the game
  // anyway; /joaca ranks on its own prose either way.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section aria-label={c.label} className="w-full">
      <div className="mb-3 flex justify-end px-gutter">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {c.open} ↗
        </a>
      </div>
      {/* `key` forces a remount when the mode changes: the game reads its view
          from the query string once, at start-up, so swapping the src alone
          would leave the previous view rendered. */}
      <iframe
        key={mode}
        src={mounted ? src : undefined}
        title={TITLES[mode]}
        allow="microphone 'self'"
        className="w-full rounded-2xl border border-border bg-card"
        style={{ height: "85dvh", minHeight: 600 }}
      />
    </section>
  );
};

export default YallaGame;
