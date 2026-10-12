import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowLeft,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Optional small counter shown beside the item. */
  badge?: number;
  /** One-line explanation shown under the page heading when the item is active. */
  hint?: string;
}

/**
 * One of the seven places in the admin (October 2026 redesign). A section is
 * what the rail and the phone's bottom bar show; its items are the tabs along
 * the top of the screen once you are in it.
 */
export interface AdminSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminNavItem[];
  /** A count that needs attention, shown on the section itself. */
  badge?: number;
  /** In the phone's bottom bar; the rest live under "Mai mult". */
  primary?: boolean;
  /** Drawn after a divider in the rail: the site and the settings, not the work. */
  secondary?: boolean;
}

interface Props {
  sections: AdminSection[];
  active: string;
  onChange: (value: string) => void;
  adminEmail: string;
  onLogout: () => void;
  /** null while unknown; false when a lesson did not reach Google Calendar. */
  calendarOk: boolean | null;
  onSearch: () => void;
  onAddExternal: () => void;
  children: React.ReactNode;
}

const TZ = "Europe/Bucharest";

/** "Bună dimineața" before noon, "Bună ziua" until six, then "Bună seara". */
export function greeting(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(now),
  );
  if (hour < 12) return "Bună dimineața, Ibra";
  if (hour < 18) return "Bună ziua, Ibra";
  return "Bună seara, Ibra";
}

const todayLabel = () =>
  new Intl.DateTimeFormat("ro-RO", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-arabic text-lg font-bold text-white"
    >
      ع
    </span>
    <span className="flex flex-col leading-tight">
      <span className="font-display text-base font-bold text-foreground">Arabă cu Ibra</span>
      <span className="text-xs text-muted-foreground">Administrare</span>
    </span>
  </div>
);

const CalendarStatus = ({ ok, onOpen }: { ok: boolean | null; onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-muted"
  >
    <span
      aria-hidden
      className={cn(
        "h-2.5 w-2.5 shrink-0 rounded-full",
        ok === null ? "bg-border" : ok ? "bg-emerald-600" : "bg-amber-600",
      )}
    />
    {ok === null ? "Calendar…" : ok ? "Calendar sincronizat" : "Calendar: de verificat"}
  </button>
);

/**
 * Admin chrome, redesigned (October 2026).
 *
 * Twenty-one tabs in six groups became seven places. On a computer they are a
 * rail on the left; on a phone the four you use daily sit in a bottom bar and
 * the rest under "Mai mult". Inside a place, its screens are tabs along the
 * top. Search and "Înscriere externă" are always one tap away, and the
 * calendar's health is always visible instead of waiting to be looked for.
 *
 * The shell still owns the one page heading, so no screen titles itself.
 */
const AdminShell = ({
  sections,
  active,
  onChange,
  adminEmail,
  onLogout,
  calendarOk,
  onSearch,
  onAddExternal,
  children,
}: Props) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const section = (sections.find((s) => s.items.some((i) => i.value === active)) ?? sections[0])!;
  const current = (section.items.find((i) => i.value === active) ?? section.items[0])!;
  const isHome = section.id === "home";
  const heading = isHome ? greeting() : section.label;

  // Ctrl/Cmd+K opens search from anywhere in the admin.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSearch]);

  const go = (s: AdminSection) => s.items[0] && onChange(s.items[0].value);
  const openCalendarHealth = () => onChange("calendar-health");

  const railLink = (s: AdminSection) => {
    const Icon = s.icon;
    const on = s.id === section.id;
    return (
      <li key={s.id}>
        <button
          type="button"
          onClick={() => go(s)}
          aria-current={on ? "page" : undefined}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[0.9375rem] transition-colors",
            on ? "bg-brand-green font-semibold text-white" : "font-medium text-foreground hover:bg-muted",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1 text-left">{s.label}</span>
          {!!s.badge && (
            <span
              className={cn(
                "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums",
                on ? "bg-white/20 text-white" : "bg-admin-warn-bg text-admin-warn-fg",
              )}
            >
              {s.badge}
            </span>
          )}
        </button>
      </li>
    );
  };

  const primary = sections.filter((s) => s.primary);
  const more = sections.filter((s) => !s.primary);
  const moreActive = more.some((s) => s.id === section.id);

  return (
    <div className="admin-theme min-h-screen bg-admin-canvas text-foreground">
      <div className="flex">
        {/* Rail (computer) */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-admin-nav-border bg-admin-nav px-3.5 py-5 lg:flex">
          <div className="px-2.5 pb-5">
            <Brand />
          </div>
          <nav aria-label="Navigare admin" className="min-h-0 flex-1 overflow-y-auto">
            <ul className="space-y-1">{sections.filter((s) => !s.secondary).map(railLink)}</ul>
            <div className="mx-2 my-3 h-px bg-admin-nav-border" />
            <ul className="space-y-1">{sections.filter((s) => s.secondary).map(railLink)}</ul>
          </nav>
          <div className="space-y-0.5 border-t border-admin-nav-border pt-3">
            <CalendarStatus ok={calendarOk} onOpen={openCalendarHealth} />
            <Link
              to="/admin/notifications"
              className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Send className="h-4 w-4" aria-hidden /> Notificări
            </Link>
            <Link
              to="/"
              className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Înapoi pe site
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Ieși din cont
            </button>
            <p className="truncate px-3 pt-1 text-xs text-admin-nav-muted">{adminEmail || "—"}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar (phone). The section name lives here because the page
              heading scrolls away and there is no rail. */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-admin-nav-border bg-admin-nav/95 pl-4 pr-2 backdrop-blur lg:hidden">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-arabic text-lg font-bold text-white"
            >
              ع
            </span>
            <p className="min-w-0 flex-1 truncate font-display text-[1.0625rem] font-bold lg:hidden">
              {section.label}
            </p>
            <button
              type="button"
              aria-label="Caută"
              onClick={onSearch}
              className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Înscriere externă"
              onClick={onAddExternal}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
          </header>

          <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 lg:px-11 lg:pb-14 lg:pt-7">
            {/* Search + add (computer) */}
            <div className="mb-7 hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={onSearch}
                className="flex h-[46px] flex-1 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 text-left text-muted-foreground hover:border-brand-green/50"
              >
                <Search className="h-[18px] w-[18px]" aria-hidden />
                <span className="flex-1">Caută un cursant după nume, email sau telefon…</span>
                <kbd className="rounded-md border border-border px-1.5 py-0.5 font-sans text-xs">Ctrl K</kbd>
              </button>
              <button
                type="button"
                onClick={onAddExternal}
                className="flex h-[46px] items-center gap-2 rounded-xl bg-brand-green px-[18px] font-semibold text-white hover:opacity-90"
              >
                <Plus className="h-[18px] w-[18px]" aria-hidden /> Înscriere externă
              </button>
            </div>

            {/* The one page heading. Acasă greets; every other place is named. */}
            <header className="mb-5 flex flex-col gap-1.5">
              {isHome && (
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-green">
                  {todayLabel()}
                </span>
              )}
              <h1 className="font-display text-[1.875rem] font-semibold leading-tight sm:text-4xl lg:text-[2.5rem]">
                {heading}
              </h1>
              {current?.hint && <p className="max-w-2xl text-[0.9375rem] text-muted-foreground">{current.hint}</p>}
            </header>

            {section.items.length > 1 && (
              <div
                role="tablist"
                aria-label={section.label}
                className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
              >
                {section.items.map((item) => {
                  const on = item.value === current.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => onChange(item.value)}
                      className={cn(
                        "flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] px-3.5 text-[0.9375rem] transition-colors",
                        on
                          ? "border-brand-green font-bold text-brand-green dark:border-primary dark:text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                      {!!item.badge && <span className="text-xs tabular-nums opacity-80">· {item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Bottom bar (phone) */}
      <nav
        aria-label="Navigare admin"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[76px] items-stretch border-t border-admin-nav-border bg-card px-1.5 pb-2 lg:hidden"
      >
        {primary.map((s) => {
          const Icon = s.icon;
          const on = s.id === section.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s)}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-xs",
                on ? "font-bold text-brand-green dark:text-primary" : "font-semibold text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-[30px] w-14 items-center justify-center rounded-full",
                  on && "bg-accent",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              {s.label}
              {!!s.badge && (
                <span className="absolute right-[calc(50%-26px)] top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {s.badge}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
            moreActive ? "font-bold text-brand-green dark:text-primary" : "font-semibold text-muted-foreground",
          )}
        >
          <span className={cn("flex h-[30px] w-14 items-center justify-center rounded-full", moreActive && "bg-accent")}>
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </span>
          Mai mult
        </button>
      </nav>

      {/* "Mai mult" (phone) */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mai mult">
          <button
            type="button"
            aria-label="Închide"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-admin-canvas px-4 pb-8 pt-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-2xl font-semibold">Mai mult</p>
              <button
                type="button"
                aria-label="Închide"
                onClick={() => setMoreOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {more.map((s) => (
                <div key={s.id} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
                  <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                    {s.items.map((item) => (
                      <li key={item.value} className="border-b border-border/60 last:border-0">
                        <button
                          type="button"
                          onClick={() => {
                            onChange(item.value);
                            setMoreOpen(false);
                          }}
                          className={cn(
                            "flex min-h-[52px] w-full items-center px-4 text-left font-semibold",
                            item.value === active && "text-brand-green dark:text-primary",
                          )}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                <li className="border-b border-border/60">
                  <CalendarStatus
                    ok={calendarOk}
                    onOpen={() => {
                      openCalendarHealth();
                      setMoreOpen(false);
                    }}
                  />
                </li>
                <li className="border-b border-border/60">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-[52px] items-center gap-2.5 px-4 font-semibold"
                  >
                    <Send className="h-4 w-4" aria-hidden /> Notificări
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-[52px] items-center gap-2.5 px-4 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Înapoi pe site
                  </Link>
                </li>
              </ul>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-12 w-full rounded-2xl border border-border bg-card font-semibold text-muted-foreground"
              >
                Ieși din cont
              </button>
              <p className="truncate text-center text-xs text-muted-foreground">{adminEmail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShell;
