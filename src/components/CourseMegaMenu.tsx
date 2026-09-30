import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "@/lib/router-compat";
import { Link } from "@/components/LocalizedLink";
import type { NavLink } from "@/lib/siteNav";
import type { Cohort } from "@/lib/cohortTypes";
import { cohortHref, longDate } from "@/lib/nextCohort";
import { cn } from "@/lib/utils";

/**
 * "Cursuri" in the menu: a wide panel with every level, the other courses,
 * the quiz and level test, and the next course to join.
 *
 * Same disclosure pattern as NavDropdown (see the comment there): the panel is
 * always rendered and carries `hidden` while closed, so every course link stays
 * in the served HTML for crawlers. Level status follows the programmes section
 * (A1 and A2 take sign-ups, the rest are coming).
 */

const LEVELS = [
  { id: "A1", ro: "Începător", en: "Beginner" },
  { id: "A2", ro: "Elementar", en: "Elementary" },
  { id: "B1", ro: "Intermediar", en: "Intermediate" },
  { id: "B2", ro: "Intermediar superior", en: "Upper intermediate" },
  { id: "C1", ro: "Avansat", en: "Advanced" },
  { id: "C2", ro: "Academic", en: "Academic" },
];
const OPEN = new Set(["A1", "A2"]);

interface Props {
  label: string;
  lang: "ro" | "en";
  otherCourses: NavLink[];
  next: Cohort | null;
}

const CourseMegaMenu = ({ label, lang, otherCourses, next }: Props) => {
  const en = lang === "en";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();
  const location = useLocation();

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

  const heading = "mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground";
  const item = "flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[15px] text-foreground transition-colors hover:bg-cream";

  return (
    <div ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-[10px] px-3 py-2 text-foreground transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          open && "bg-cream",
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 px-gutter"
      >
        <div className="mx-auto grid max-w-content gap-7 rounded-b-3xl border border-t-0 border-[#E7E1D6] bg-card p-7 shadow-[0_18px_40px_rgba(26,26,26,0.08)] lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] dark:border-border">
          <div>
            <p className={heading}>{en ? "Group courses · adults" : "Cursuri de grup · adulți"}</p>
            <ul className="flex flex-col gap-0.5">
              {LEVELS.map((l) => (
                <li key={l.id}>
                  <Link to={`/cursuri/grup/${l.id.toLowerCase()}`} className={item}>
                    <span>
                      <b className="font-semibold">{l.id}</b> · {en ? l.en : l.ro}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                        OPEN.has(l.id) ? "bg-brand-green/10 text-brand-green" : "bg-cream text-muted-foreground",
                      )}
                    >
                      {OPEN.has(l.id) ? (en ? "Open" : "Înscrieri deschise") : en ? "Coming soon" : "În curând"}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/cursuri/grup" className={cn(item, "font-semibold text-brand-green")}>
                  {en ? "All group levels →" : "Toate nivelurile de grup →"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={heading}>{en ? "Other courses" : "Alte cursuri"}</p>
            <ul className="flex flex-col gap-0.5">
              {otherCourses.map((c) => (
                <li key={c.to}>
                  <Link to={c.to} className={item}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={heading}>{en ? "Not sure what to pick?" : "Nu știi ce să alegi?"}</p>
            <ul className="flex flex-col gap-0.5">
              <li>
                <a href="/quiz" className={item}>{en ? "Quiz · 30 seconds" : "Quiz · 30 de secunde"}</a>
              </li>
              <li>
                <Link to="/test-de-nivel" className={item}>{en ? "Level test (the Yalla game)" : "Test de nivel (jocul Yalla)"}</Link>
              </li>
              <li>
                <Link to="/cursuri" className={cn(item, "font-semibold text-brand-green")}>{en ? "All courses →" : "Toate cursurile →"}</Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-cream p-5">
            {next ? (
              <>
                <span className="text-sm text-muted-foreground">{en ? "Next course" : "Următorul curs"}</span>
                <span className="font-display text-lg font-bold leading-snug text-foreground">
                  {next.level} {next.format === "fizic" ? (en ? "in person" : "fizic") : "online"} · {longDate(next.start_date, lang)}
                </span>
                <span className="text-sm text-foreground/70">
                  {(en ? next.schedule_label_en : next.schedule_label_ro).split(" · ")[0]}
                  {" · "}
                  {en
                    ? `taught in ${next.teaching_language === "en" ? "English" : "Romanian"} · ${next.seatsLeft} of ${next.max_seats} seats free`
                    : `în ${next.teaching_language === "en" ? "engleză" : "română"} · ${next.seatsLeft} din ${next.max_seats} locuri libere`}
                </span>
                <Link
                  to={cohortHref(next)}
                  className="mt-2 inline-flex h-10 w-fit items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {en ? "Sign up" : "Înscrie-te"}
                </Link>
              </>
            ) : (
              <>
                <span className="font-display text-lg font-bold leading-snug text-foreground">
                  {en ? "The first trial lesson is free." : "Prima lecție de probă e gratuită."}
                </span>
                <Link
                  to="/trial"
                  className="mt-2 inline-flex h-10 w-fit items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {en ? "Book it →" : "Rezervă →"}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMegaMenu;
