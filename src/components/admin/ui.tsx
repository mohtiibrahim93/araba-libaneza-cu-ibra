import type { ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The admin panel's design vocabulary.
 *
 * The first version of this file made twenty-seven screens consistent, which
 * was worth doing and was not the same as designing them. Everything came out
 * at one visual weight: identical radius, identical border, identical padding,
 * almost everything at `text-sm`, and none of the brand — grey Inter on white,
 * while the site it administers is deep green, cream and red with Lora as its
 * display face. Tidy, and it could have belonged to any product.
 *
 * What changed here:
 *
 *   - **A type scale with real steps.** Screen titles are Lora, the serif the
 *     public pages use; section titles are a weight above body; meta is a step
 *     below. The eye now has something to anchor on.
 *   - **Rank by weight, not by sameness.** `alert` is loud, `raised` is the
 *     default card, `flush` has no chrome at all. An urgent warning and a quiet
 *     list no longer compete.
 *   - **Density.** This is a tool that gets scanned and acted on, not browsed,
 *     so rows are tighter and more fits on a screen.
 *   - **Tables treated as tables** — hover, a sticky header for long lists, and
 *     numerals that line up.
 *
 * They remain thin on purpose: spacing, weight and colour, and nothing else.
 * No fetching, no state, no action names — a screen adopting them changes how
 * it looks and not what it does, which is the whole point in code with no UI
 * tests.
 */

/* ── Screen ────────────────────────────────────────────────────────────── */

/** The title of a whole screen. Lora, with a rule that sets it apart. */
/**
 * The controls that belong to one screen — a refresh, a period switch, an
 * "add" button.
 *
 * It deliberately carries no title. The shell heads every screen from the
 * navigation entry, so a screen that also titled itself would print the same
 * words twice; that is exactly what used to happen on all twenty.
 */
export function ScreenToolbar({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="-mt-1 mb-5 flex flex-wrap items-center justify-end gap-2">{children}</div>
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

type Tone = "raised" | "flush" | "alert" | "quiet";

const TONE: Record<Tone, string> = {
  // The default: a white card lifting off the cream canvas. A hairline plus a
  // whisper of shadow reads cleaner than the heavy border it replaces.
  raised: "rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
  // No chrome. For a block that is already inside something.
  flush: "",
  // Loud on purpose, and the only tone that uses colour for its surface.
  alert: "rounded-xl border border-amber-500/40 bg-amber-500/10",
  // Explanatory asides: present, not competing.
  quiet: "rounded-xl border border-border/60 bg-muted/40",
};

export function Section({
  title,
  description,
  icon: Icon,
  actions,
  tone = "raised",
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  tone?: Tone;
  className?: string;
  /** Escape hatch for a body that manages its own padding, e.g. a full-bleed table. */
  bodyClassName?: string;
  children: ReactNode;
}) {
  const alert = tone === "alert";
  return (
    <section className={cn(TONE[tone], className)}>
      {(title || actions) && (
        <header
          className={cn(
            "flex flex-wrap items-start justify-between gap-x-4 gap-y-2",
            tone === "flush" ? "mb-3" : "border-b border-border/50 px-4 py-3",
            alert && "border-amber-500/25",
          )}
        >
          <div className="min-w-0">
            <h3
              className={cn(
                "flex items-center gap-2 text-[0.9375rem] font-semibold leading-snug",
                alert ? "text-amber-700 dark:text-amber-400" : "text-foreground",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-[1.05rem] w-[1.05rem] shrink-0",
                    alert ? "text-amber-600 dark:text-amber-400" : "text-primary",
                  )}
                />
              )}
              {title}
            </h3>
            {description && (
              <p
                className={cn(
                  "mt-1 max-w-prose text-xs leading-relaxed",
                  alert ? "text-amber-700/80 dark:text-amber-400/80" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn(tone === "flush" ? "" : "px-4 py-3.5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ── States ────────────────────────────────────────────────────────────── */

/**
 * Nothing here — said properly.
 *
 * Several screens rendered a bare "—" or an empty box, which reads as a page
 * that failed rather than a list with nothing in it.
 */
export function Empty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 h-7 w-7 text-muted-foreground/50" />}
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted-foreground"
      role="status"
    >
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {children}
    </p>
  );
}

/* ── Table ─────────────────────────────────────────────────────────────── */

/**
 * A table that behaves like one.
 *
 * It scrolls inside its own box rather than dragging the page sideways — the
 * panel is used from a phone often enough that the shell was rebuilt once for
 * that reason. `stickyHeader` is for the long lists (registrations, the audit
 * log) where the header leaves the screen before the rows do.
 */
export function TableWrap({
  children,
  stickyHeader,
  maxHeight,
}: {
  children: ReactNode;
  stickyHeader?: boolean;
  maxHeight?: string;
}) {
  return (
    <div
      className={cn("-mx-4 overflow-auto px-4", maxHeight)}
      style={maxHeight ? undefined : undefined}
    >
      <table
        className={cn(
          "w-full min-w-[34rem] border-collapse text-sm",
          stickyHeader && "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-card",
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  numeric,
}: {
  children?: ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <th
      className={cn(
        "border-b border-border py-2 pr-3 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground",
        numeric && "text-right",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  numeric,
}: {
  children?: ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-border/50 py-2 pr-3 align-middle",
        numeric && "text-right tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Row with a hover tint, so the eye can track across a wide table. */
export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-muted/40", className)}>{children}</tr>;
}

/* ── Figures ───────────────────────────────────────────────────────────── */

/** A number worth looking at. The figure leads; the label explains it. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary/70" />}
      </div>
      <p className="mt-1.5 font-display text-[1.75rem] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "warn" | "good";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        tone === "warn" && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
        tone === "good" && "bg-brand-green/10 text-brand-green",
        tone === "default" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
