import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "@/lib/router-compat";
import type { NavLink } from "@/lib/siteNav";
import { cn } from "@/lib/utils";

/**
 * A navbar menu whose links are in the served HTML.
 *
 * The Radix dropdown this replaces rendered its contents through a portal and
 * mounted them only while open, so every link under Cursuri and Resurse was
 * absent from the HTML the server sends: invisible to crawlers, and to the
 * assistants we want citing these pages. That is why the footer grew to
 * forty-odd links — it was the only navigation that reached the page source.
 *
 * Radix's `forceMount` does not fix it: with the content permanently mounted,
 * its dismissable layer treats the trigger's own pointerdown as a click
 * outside and closes the menu in the same tick it opens. So this is a plain
 * disclosure instead — a button, and a list that is always rendered and
 * carries the `hidden` attribute while closed. Hidden keeps it out of sight
 * and out of the tab order; the anchors are still in the markup, which is the
 * whole point. These are real navigation links, shown on click, not links
 * hidden to inflate anything.
 */
interface NavDropdownProps {
  label: string;
  items: NavLink[];
}

const NavDropdown = ({ label, items }: NavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();
  const location = useLocation();

  // The panel is never unmounted, so nothing closes it when a link inside
  // navigates. Close on every route change rather than on each link's onClick,
  // which would miss keyboard activation and middle-click returns.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <ul
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md"
      >
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block rounded-xs px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavDropdown;
