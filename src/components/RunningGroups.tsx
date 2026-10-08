import { useEffect, useState } from "react";
import { CalendarDays, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { WHATSAPP_CONTACT_URL } from "@/lib/social";
import { canStillJoin, joinClosesAfter } from "../../supabase/functions/_shared/cohort-sessions";

/**
 * "Grupe în desfășurare" on a level page (October 2026).
 *
 * A running group's progress, from cohort_sessions — the owner's own calendar,
 * synced in the admin (course length from cohort_calendar): which lesson it is on, the next dates, and the whole
 * calendar on request. Only dates and lesson numbers are public; no names, no
 * meeting links.
 *
 * And whether someone can still join (the owner's rule): yes until the last
 * month, by talking to Ibra, with the missed lessons caught up free of charge
 * and more intensively the later they join; not in the last month.
 *
 * Renders nothing until there is something true to show.
 */
interface Session {
  id: string;
  cohort_id: string;
  lesson_number: number;
  starts_at: string;
  ends_at: string;
}
interface RunningCohort {
  id: string;
  level: string | null;
  format: string | null;
  cohort_calendar: { total_lessons: number } | Array<{ total_lessons: number }> | null;
  schedule_label_ro: string | null;
  schedule_label_en: string | null;
}

// Newer than the generated Supabase types; both are public reads (RLS).
type Untyped = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (k: string, v: string) => {
        eq: (k: string, v: string) => Promise<{ data: RunningCohort[] | null; error: unknown }>;
      };
      in: (k: string, v: string[]) => {
        order: (k: string, o: { ascending: boolean }) => Promise<{ data: Session[] | null; error: unknown }>;
      };
    };
  };
};
const db = () => supabase as unknown as Untyped;

const TZ = "Europe/Bucharest";

const COPY = {
  ro: {
    title: "Grupe în desfășurare",
    lead: "Unde a ajuns fiecare grupă, din calendarul lui Ibra.",
    online: "online",
    fizic: "la centru",
    lessonOf: (n: number, t: number) => `Lecția ${n} din ${t}`,
    next: "Următoarele lecții",
    all: "Calendarul complet",
    hide: "Ascunde calendarul",
    joinOpen: (last: number) =>
      `Te mai poți alătura până la lecția ${last}. Lecțiile pierdute le recuperăm împreună, gratuit, într-un ritm mai intens cu cât intri mai târziu.`,
    joinCta: "Scrie-i lui Ibra",
    joinClosed: "Grupa e în ultima lună, așa că nu se mai poate intra. Te așteptăm la următoarea grupă.",
  },
  en: {
    title: "Groups in progress",
    lead: "Where each group has got to, from Ibra's calendar.",
    online: "online",
    fizic: "in person",
    lessonOf: (n: number, t: number) => `Lesson ${n} of ${t}`,
    next: "Next lessons",
    all: "Full calendar",
    hide: "Hide calendar",
    joinOpen: (last: number) =>
      `You can still join until lesson ${last}. We catch up the lessons you missed together, free of charge, at a faster pace the later you join.`,
    joinCta: "Message Ibra",
    joinClosed: "This group is in its last month, so it can't be joined any more. See you in the next group.",
  },
} as const;

const RunningGroups = ({ level, defaultTotal, className = "" }: { level: string; defaultTotal: number; className?: string }) => {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [cohorts, setCohorts] = useState<RunningCohort[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: cs, error } = await db()
        .from("group_cohorts")
        .select("id, level, format, schedule_label_ro, schedule_label_en, cohort_calendar(total_lessons)")
        .eq("level", level)
        .eq("status", "in_progress");
      if (error || !cs?.length || cancelled) return;
      const { data: ss } = await db()
        .from("cohort_sessions")
        .select("id, cohort_id, lesson_number, starts_at, ends_at")
        .in("cohort_id", cs.map((x) => x.id))
        .order("starts_at", { ascending: true });
      if (cancelled) return;
      setCohorts(cs);
      setSessions(ss ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [level]);

  const shown = cohorts.filter((g) => sessions.some((s) => s.cohort_id === g.id));
  if (shown.length === 0) return null;

  const now = Date.now();
  const day = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
  const hour = (iso: string) =>
    new Date(iso).toLocaleTimeString(lang === "en" ? "en-GB" : "ro-RO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

  return (
    <section className={`rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-8 dark:border-border ${className}`}>
      <h2 className="font-display text-2xl font-bold text-foreground">{c.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{c.lead}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {shown.map((g) => {
          const mine = sessions.filter((s) => s.cohort_id === g.id);
          const done = mine.filter((s) => Date.parse(s.ends_at) <= now).reduce((m, s) => Math.max(m, s.lesson_number), 0);
          const link = Array.isArray(g.cohort_calendar) ? g.cohort_calendar[0] : g.cohort_calendar;
          const total = link?.total_lessons ?? defaultTotal;
          const upcoming = mine.filter((s) => Date.parse(s.ends_at) > now);
          const pct = Math.min(100, Math.round((done / total) * 100));
          const label = lang === "en" ? g.schedule_label_en : g.schedule_label_ro;
          const joinable = canStillJoin(done, total);
          return (
            <article key={g.id} className="flex flex-col gap-4 rounded-2xl bg-cream p-5">
              <div>
                <p className="font-semibold text-foreground">
                  {level} · {g.format === "online" ? c.online : c.fizic}
                </p>
                {label && <p className="text-sm text-muted-foreground">{label}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 overflow-hidden rounded-full bg-[#E7E1D6]" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={c.lessonOf(done, total)}>
                  <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{c.lessonOf(done, total)}</p>
              </div>

              {upcoming.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{c.next}</p>
                  <ul className="space-y-1 text-sm text-foreground">
                    {upcoming.slice(0, 4).map((s) => (
                      <li key={s.id} className="flex justify-between gap-3 tabular-nums">
                        <span>{day(s.starts_at)} · {hour(s.starts_at)}</span>
                        <span className="text-muted-foreground">L{s.lesson_number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen(open === g.id ? null : g.id)}
                aria-expanded={open === g.id}
                className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-green hover:underline"
              >
                <CalendarDays className="h-4 w-4" aria-hidden /> {open === g.id ? c.hide : c.all}
              </button>
              {open === g.id && (
                <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                  {mine.map((s) => {
                    const past = Date.parse(s.ends_at) <= now;
                    return (
                      <li key={s.id} className={`flex items-center gap-2 tabular-nums ${past ? "text-muted-foreground" : "text-foreground"}`}>
                        {past ? <Check className="h-3.5 w-3.5 text-brand-green" aria-hidden /> : <span className="h-3.5 w-3.5" />}
                        L{s.lesson_number} · {day(s.starts_at)}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="border-t border-[#E7E1D6] pt-4 text-sm dark:border-border">
                {joinable ? (
                  <>
                    <p className="text-foreground/85">{c.joinOpen(joinClosesAfter(total))}</p>
                    <a
                      href={WHATSAPP_CONTACT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-green px-4 font-semibold text-white hover:opacity-90"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden /> {c.joinCta}
                    </a>
                  </>
                ) : (
                  <p className="text-muted-foreground">{c.joinClosed}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RunningGroups;
