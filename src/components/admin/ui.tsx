import type { ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The admin panel's shared vocabulary.
 *
 * Twenty-two screens were written at different times, so each invented its own
 * section heading, its own table, its own "nothing here" and its own spinner —
 * and several invented none, rendering a bare "—" or nothing at all on failure.
 * The result reads as a dozen small tools rather than one panel.
 *
 * These are deliberately thin. They own spacing, weight and colour and nothing
 * else: no data fetching, no state, no action names. A screen adopting them
 * changes how it looks and not what it does, which is the whole point of a
 * visual pass on code with no UI tests.
 */

/** A titled block. The unit every screen is built from. */
export function Section({
  title,
  description,
  icon: Icon,
  actions,
  tone = "default",
  className,
  children,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  /** Buttons, filters — anything that belongs beside the title. */
  actions?: ReactNode;
  tone?: "default" | "warn" | "quiet";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5",
        tone === "warn" && "border-amber-500/40 bg-amber-500/10",
        tone === "quiet" && "border-border bg-muted/30",
        tone === "default" && "border-border bg-background",
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                tone === "warn" ? "text-amber-700 dark:text-amber-400" : "text-foreground",
              )}
            >
              {Icon && (
                <Icon
                  className={cn("h-4 w-4 shrink-0", tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-primary")}
                />
              )}
              {title}
            </h3>
            {description && (
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  tone === "warn" ? "text-amber-700/80 dark:text-amber-400/80" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** The heading above a whole screen, not a block within one. */
export function ScreenHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/**
 * Nothing here — said properly.
 *
 * Several screens rendered a bare "—" or an empty box, which reads as a page
 * that failed rather than a list with nothing in it. An empty state says which
 * of the two it is, and when there is something the reader could do about it,
 * says that too.
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
      {Icon && <Icon className="mb-3 h-7 w-7 text-muted-foreground/70" />}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** One spinner, one size, one place on the screen. */
export function Loading({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label}
    </div>
  );
}

/** A failure the reader can see, instead of a blank area and a console line. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {children}
    </p>
  );
}

/**
 * A table that stays readable on a phone.
 *
 * The admin is used from a phone often enough that it was rebuilt once for
 * that reason. A wide table cannot be made narrow, so it scrolls — but it
 * scrolls inside its own box rather than dragging the whole page sideways.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[32rem] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border py-2 pr-3 text-left text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border/60 py-2.5 pr-3 align-middle", className)}>{children}</td>;
}

/** A number worth looking at, with what it means underneath. */
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
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A small count beside a heading. */
export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs tabular-nums",
        tone === "warn" ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
