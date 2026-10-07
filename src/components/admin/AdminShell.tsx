import { useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowLeft,
  LogOut,
  Menu,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Optional small counter shown on the right of the item. */
  badge?: number;
  /** One-line explanation shown in the page header when the item is active. */
  hint?: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

interface Props {
  groups: AdminNavGroup[];
  active: string;
  onChange: (value: string) => void;
  adminEmail: string;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * Admin chrome: a grouped sidebar on desktop, a slide-in drawer on phones.
 *
 * The previous shell put ten tabs in one horizontally scrolling strip, which
 * on a 400px phone meant most sections were invisible and every label was
 * truncated. Grouping the sections and giving each screen a real title makes
 * it navigable at any width without touching any of the section content.
 */
const AdminShell = ({ groups, active, onChange, adminEmail, onLogout, children }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const allItems = groups.flatMap((g) => g.items);
  const current = allItems.find((i) => i.value === active) ?? allItems[0];

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-admin-nav-muted">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.value === active;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.value);
                      onNavigate?.();
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-[0.8125rem] transition-colors",
                      isActive
                        // A cream pill, not a tinted one. A 15% red wash over a
                        // dark green rail is almost the same colour as the rail:
                        // it rendered as a slightly different dark box, which is
                        // not an answer to "where am I". Inverting the surface is
                        // unambiguous, and works in both themes because the rail
                        // is dark in both.
                        // A tinted pill plus a red marker. On a neutral rail
                        // this is unmistakable without inverting the surface.
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-admin-nav-fg/70 hover:bg-muted hover:text-admin-nav-fg",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[0.6875rem] tabular-nums text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-admin-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Deschide meniul"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[0.9375rem] font-semibold text-foreground">
              {current?.label}
            </p>
            {current?.hint && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {current.hint}
              </p>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/admin/notifications">
              <Send className="h-4 w-4" />
              Notificări
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Site
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Ieși</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-3 py-5 sm:px-6 sm:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          {/* Ten sections became eighteen, so the sidebar is taller than most
              screens: it scrolls inside itself and keeps the signed-in address
              pinned at the bottom rather than pushing it off. */}
          {/* A quiet rail. It is chrome, not content: a hairline against the
              canvas and nothing else, so the eye goes to the data. */}
          <div className="sticky top-[4.5rem] flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-xl border border-admin-nav-border bg-admin-nav">
            <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
              <NavList />
            </div>
            <div className="border-t border-admin-nav-border px-4 py-2.5">
              <p className="truncate text-[0.6875rem] text-admin-nav-muted">{adminEmail || "—"}</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 space-y-6">
          <div className="lg:hidden">
            <h1 className="font-display text-xl font-semibold text-foreground">{current?.label}</h1>
            {current?.hint && (
              <p className="mt-0.5 text-sm text-muted-foreground">{current.hint}</p>
            )}
          </div>
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Închide meniul"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col overflow-y-auto bg-admin-nav p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-base font-semibold text-admin-nav-fg">Administrare</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Închide meniul"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavList onNavigate={() => setMenuOpen(false)} />
            <div className="mt-6 space-y-2 border-t border-admin-nav-border pt-4">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/admin/notifications" onClick={() => setMenuOpen(false)}>
                  <Send className="h-4 w-4" />
                  Notificări
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <ArrowLeft className="h-4 w-4" />
                  Înapoi pe site
                </Link>
              </Button>
              <p className="truncate px-1 pt-2 text-xs text-admin-nav-muted">{adminEmail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShell;
