import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Video,
} from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Empty, ErrorNote, Loading, Pill, ScreenToolbar, Section } from "./ui";

/**
 * The screen the panel opens on.
 *
 * It used to be four all-time totals and two all-time funnels. Nobody opens an
 * admin panel to find out how many registrations there have ever been, and
 * since the Analiză tab exists that was also a second, worse answer to a
 * question it handles properly.
 *
 * So this is a worklist: lessons about to happen, people nobody has replied to,
 * people who said yes and never paid, groups about to start, and anything the
 * system itself is unhappy about. Every row goes somewhere you can act.
 *
 * When all five are empty it says so and stops. An empty worklist is a good
 * morning, and the screen should look like one rather than like a page that
 * failed to load.
 */

interface Lesson {
  id: string;
  start_at: string;
  event_type_slug: string;
  format: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  meet_link: string | null;
  google_sync_error: string | null;
  manage_token: string;
}
interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  form_type: string;
  level: string | null;
  format: string | null;
  payment_status?: string;
  waitingDays: number;
}
interface Cohort {
  id: string;
  title_ro: string | null;
  title_en: string | null;
  level: string | null;
  format: string | null;
  start_date: string;
  status: string;
  teaching_language: string | null;
}
interface Problem {
  kind: string;
  id: string;
  detail: string;
}
interface Today {
  now: string;
  lessons: Lesson[];
  uncontacted: Lead[];
  unpaid: Lead[];
  cohortsStartingSoon: Cohort[];
  problems: Problem[];
}

const TZ = "Europe/Bucharest";
const timeFmt = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "azi" / "mâine" where that is clearer than the date. */
const dayLabel = (iso: string, now: string) => {
  const key = (d: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d));
  const today = key(now);
  const tomorrow = key(new Date(Date.parse(now) + 86_400_000).toISOString());
  const k = key(iso);
  if (k === today) return "Azi";
  if (k === tomorrow) return "Mâine";
  return dayFmt.format(new Date(iso));
};

const waitLabel = (d: number) => (d === 0 ? "azi" : d === 1 ? "de ieri" : `de ${d} zile`);

/** A worklist block: a shared Section with the count beside its title. */
const Card = ({
  title,
  count,
  icon: Icon,
  tone = "default",
  children,
}: {
  title: string;
  count: number;
  icon: typeof Clock;
  tone?: "default" | "warn";
  children: React.ReactNode;
}) => (
  <Section
    title={title}
    icon={Icon}
    // The worklist speaks in two voices — a problem, or a list — which map onto
    // the two tones that matter here.
    tone={tone === "warn" ? "alert" : "raised"}
    actions={<Pill tone={tone === "warn" ? "warn" : "default"}>{count}</Pill>}
  >
    {children}
  </Section>
);

const TodayAdmin = ({ onGoToLeads }: { onGoToLeads?: () => void }) => {
  const [data, setData] = useState<Today | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res, error: err } = await invokeAdmin({ action: "list_today" });
      if (err) throw err;
      if (res?.error) throw new Error(res.error);
      setData(res?.data ?? null);
    } catch (e) {
      console.error("[today] load failed", e);
      setError("Lista de azi nu a putut fi încărcată.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const nothingToDo =
    data &&
    data.lessons.length === 0 &&
    data.uncontacted.length === 0 &&
    data.unpaid.length === 0 &&
    data.cohortsStartingSoon.length === 0 &&
    data.problems.length === 0;

  return (
    <div className="space-y-5">
      <ScreenToolbar>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} aria-label="Reîncarcă">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </ScreenToolbar>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && !data && <Loading label="Se încarcă…" />}

      {nothingToDo && (
        <Empty
          icon={CheckCircle2}
          title="Nimic de rezolvat acum."
          description="Nicio lecție în următoarele două zile, niciun lead necontactat, nicio plată în așteptare."
        />
      )}

      {data && !nothingToDo && (
        <div className="space-y-5">
          {data.problems.length > 0 && (
            <Card title="Ce nu merge" count={data.problems.length} icon={AlertTriangle} tone="warn">
              <ul className="space-y-2">
                {data.problems.map((p) => (
                  <li key={`${p.kind}-${p.id}`} className="text-sm text-amber-700 dark:text-amber-400">
                    <span className="font-medium">
                      {p.kind === "calendar" ? "Calendar" : "Plată"}:
                    </span>{" "}
                    {p.detail}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-amber-700/80 dark:text-amber-400/80">
                O lecție care nu s-a sincronizat există aici, dar nu și în calendarul tău — e
                lecția la care riști să nu ajungi.
              </p>
            </Card>
          )}

          {data.lessons.length > 0 && (
            <Card title="Lecții, azi și mâine" count={data.lessons.length} icon={CalendarDays}>
              <ul className="divide-y divide-border/60">
                {data.lessons.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <span className="w-16 shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {timeFmt.format(new Date(l.start_at))}
                    </span>
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      {dayLabel(l.start_at, data.now)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {l.student_name}
                      {l.event_type_slug === "trial" && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          probă
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {l.format === "online" ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                      {l.format === "online" ? "online" : "la centru"}
                    </span>
                    {l.meet_link && (
                      <a
                        href={l.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Intră
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.uncontacted.length > 0 && (
            <Card title="Nu le-a răspuns nimeni" count={data.uncontacted.length} icon={MessageCircle}>
              <p className="mb-3 text-xs text-muted-foreground">
                Cei mai vechi primii — așteptarea cea mai lungă e cea mai urgentă.
              </p>
              <ul className="divide-y divide-border/60">
                {data.uncontacted.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.form_type}</span>
                    <span className="text-xs text-muted-foreground">{waitLabel(r.waitingDays)}</span>
                    <a
                      href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      WhatsApp <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.unpaid.length > 0 && (
            <Card title="Au spus da, n-au plătit" count={data.unpaid.length} icon={CreditCard}>
              <ul className="divide-y divide-border/60">
                {data.unpaid.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.form_type}
                      {r.level ? ` · ${r.level}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{waitLabel(r.waitingDays)}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {r.payment_status}
                    </span>
                  </li>
                ))}
              </ul>
              {onGoToLeads && (
                <Button variant="outline" size="sm" className="mt-3" onClick={onGoToLeads}>
                  Vezi toate înscrierile
                </Button>
              )}
            </Card>
          )}

          {data.cohortsStartingSoon.length > 0 && (
            <Card
              title="Grupe care încep curând"
              count={data.cohortsStartingSoon.length}
              icon={GraduationCap}
            >
              <ul className="divide-y divide-border/60">
                {data.cohortsStartingSoon.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {c.title_ro || c.title_en || c.level || "Grupă"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {c.level}
                      {c.format ? ` · ${c.format}` : ""}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">{c.start_date}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Locurile ocupate se văd în Grupe — acolo se calculează, inclusiv ajustarea manuală.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TodayAdmin;
