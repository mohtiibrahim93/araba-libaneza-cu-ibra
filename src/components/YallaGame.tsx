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
import { useCallback, useEffect, useRef, useState } from "react";
import { useCardOverrides, type CardOverrides } from "@/hooks/useCardOverrides";
import { ExternalLink } from "lucide-react";

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

  // Published teacher corrections, applied into the game once it has booted.
  //
  // The frame is same-origin, so the page can reach into it and call the
  // game's own YallaAcademy.commitEdits — the same entry point the teacher
  // workspace uses. That means no protocol to invent and no change to the
  // game: it applies published corrections through the code path it already
  // trusts.
  //
  // The published set is passed whole rather than card by card, so it is
  // self-healing: a correction the teacher reverts disappears for everyone on
  // the next load instead of lingering as an orphan nobody can see to remove.
  //
  // Local edits are layered on top. A teacher part-way through a batch has
  // unpublished work in this browser, and commitEdits replaces the whole map —
  // passing only the published set would silently destroy it.
  const published = useCardOverrides();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const applyOverrides = useCallback(() => {
    const win = frameRef.current?.contentWindow as
      | (Window & {
          YallaAcademy?: { commitEdits?: (e: CardOverrides) => void };
        })
      | null
      | undefined;
    const commit = win?.YallaAcademy?.commitEdits;
    if (typeof commit !== "function") return false;
    try {
      let local: CardOverrides = {};
      try {
        local = JSON.parse(win!.localStorage.getItem("yalla-teacher-edits-v1") || "{}");
      } catch {
        /* unreadable local edits are not a reason to skip published ones */
      }
      commit({ ...published, ...local });
      return true;
    } catch {
      // Never let a correction failure break the game. The bundled cards are
      // always a correct, if slightly stale, fallback.
      return false;
    }
  }, [published]);

  // "Publish corrections", shown only to a signed-in owner.
  //
  // Visibility is a convenience, not the security boundary: the edge function
  // checks the caller's email against ADMIN_EMAILS and the table has no public
  // write policy, so a signed-in non-admin pressing this gets a refusal from
  // the server rather than a write.
  const [signedIn, setSignedIn] = useState(false);
  const [publishing, setPublishing] = useState<"idle" | "saving" | "done" | "error">("idle");
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setSignedIn(Boolean(data.session));
      } catch {
        /* not signed in, or offline — the control simply stays hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const publish = useCallback(async () => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    setPublishing("saving");
    try {
      const edits = JSON.parse(win.localStorage.getItem("yalla-teacher-edits-v1") || "{}");
      const { invokeAdmin } = await import("@/lib/adminAuth");
      const { data, error } = await invokeAdmin({ action: "save_card_overrides", edits });
      setPublishing(error || (data as { error?: string })?.error ? "error" : "done");
    } catch {
      setPublishing("error");
    }
  }, []);

  useEffect(() => {
    if (!mounted || !Object.keys(published).length) return;
    // The game defines YallaAcademy while its own scripts run, which may be
    // after the frame's load event. Retry briefly rather than race it.
    if (applyOverrides()) return;
    let tries = 0;
    const id = window.setInterval(() => {
      if (applyOverrides() || ++tries > 20) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [mounted, published, applyOverrides]);

  return (
    <section aria-label={c.label} className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex min-h-12 items-center justify-between gap-4 border-b border-border bg-muted/30 px-4 sm:px-5">
        <span className="truncate text-sm font-semibold text-foreground">Yalla</span>
        {signedIn && (
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishing === "saving"}
            className="ml-auto mr-4 shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/60 disabled:opacity-60"
          >
            {publishing === "saving"
              ? "Se publică…"
              : publishing === "done"
                ? "Publicat ✓"
                : publishing === "error"
                  ? "Nu s-a publicat"
                  : "Publică corecturile"}
          </button>
        )}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          {c.open}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      {/* `key` forces a remount when the mode changes: the game reads its view
          from the query string once, at start-up, so swapping the src alone
          would leave the previous view rendered. */}
      <iframe
        ref={frameRef}
        key={mode}
        src={mounted ? src : undefined}
        title={TITLES[mode]}
        allow="microphone 'self'"
        className="block h-[78dvh] min-h-[38rem] max-h-[56rem] w-full border-0 bg-card"
      />
    </section>
  );
};

export default YallaGame;
