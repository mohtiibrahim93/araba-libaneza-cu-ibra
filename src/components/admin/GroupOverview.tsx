import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, Users, Wifi, MapPin } from "lucide-react";

// Mirror of the cohort shape returned by the admin `list_cohorts` action.
interface Cohort {
  id: string;
  form_type: "group" | "kids";
  level: string | null;
  format: string | null;
  start_date: string;
  schedule_label_ro: string;
  status: string;
  max_seats: number;
  manual_offset?: number;
}

type StatusMeta = { label: string; tone: string; open: boolean };

// How each cohort status reads at a glance, and whether it still accepts sign-ups.
const STATUS_META: Record<string, StatusMeta> = {
  draft: { label: "Draft (ascuns)", tone: "bg-muted text-muted-foreground border-border", open: false },
  forming: { label: "În formare", tone: "bg-primary/10 text-primary border-primary/30", open: true },
  minimum_reached: { label: "Minim atins", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", open: true },
  confirmed: { label: "Confirmată", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", open: true },
  full: { label: "Plină (waitlist)", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", open: false },
  in_progress: { label: "În desfășurare", tone: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30", open: false },
  completed: { label: "Încheiată", tone: "bg-muted text-muted-foreground border-border", open: false },
  cancelled: { label: "Anulată", tone: "bg-destructive/10 text-destructive border-destructive/30", open: false },
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const FORMATS: { key: "online" | "fizic"; label: string; icon: typeof Wifi }[] = [
  { key: "online", label: "Online", icon: Wifi },
  { key: "fizic", label: "Fizic", icon: MapPin },
];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(y, m - 1, d),
  );
}

const CohortLine = ({ c, taken }: { c: Cohort; taken: number }) => {
  const meta = STATUS_META[c.status] ?? STATUS_META.forming;
  const seatsLeft = Math.max(0, c.max_seats - taken);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground whitespace-nowrap">{fmtDate(c.start_date)}</span>
        <span className={`ml-1 inline-flex shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${meta.tone}`}>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{taken}</span>/{c.max_seats}
        <span className="text-[10px]">({seatsLeft} libere)</span>
      </div>
    </div>
  );
};

const FormatColumn = ({
  label,
  icon: Icon,
  cohorts,
  counts,
}: {
  label: string;
  icon: typeof Wifi;
  cohorts: Cohort[];
  counts: Map<string, number>;
}) => {
  const openCount = cohorts.filter((c) => (STATUS_META[c.status] ?? STATUS_META.forming).open).length;
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </div>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            openCount > 0
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {openCount > 0 ? `${openCount} deschisă${openCount > 1 ? "e" : ""}` : "închis"}
        </span>
      </div>
      {cohorts.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic px-1 py-1">Nicio cohortă</p>
      ) : (
        <div className="space-y-1.5">
          {cohorts.map((c) => (
            <CohortLine key={c.id} c={c} taken={counts.get(c.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
};

const GroupOverview = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: adminData, error: adminErr }, { data: countRows }] = await Promise.all([
        invokeAdmin({ action: "list_cohorts" }),
        supabase.rpc("get_cohort_signup_counts"),
      ]);
      if (adminErr) throw adminErr;
      if (adminData?.error) throw new Error(adminData.error);
      setCohorts((adminData?.data as Cohort[]) || []);
      const map = new Map<string, number>();
      (countRows || []).forEach((r: { cohort_id: string; taken: number }) =>
        map.set(r.cohort_id, Number(r.taken) || 0),
      );
      setCounts(map);
    } catch {
      toast({ title: "Nu am putut încărca privirea de ansamblu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupCohorts = cohorts.filter((c) => c.form_type === "group");
  const kidsCohorts = cohorts.filter((c) => c.form_type === "kids");
  const cohortsFor = (level: string, format: "online" | "fizic") =>
    groupCohorts
      .filter((c) => c.level === level && (c.format === format || c.format == null))
      .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const totalOpen = cohorts.filter((c) => (STATUS_META[c.status] ?? STATUS_META.forming).open).length;

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">Privire de ansamblu — cohorte</h2>
          <p className="text-sm text-muted-foreground">
            Fiecare nivel, cu variantele online și fizic alături. Statusul și locurele se actualizează
            din înscrieri. Editează detaliile în „Cohorte grupe" mai jos.
          </p>
        </div>
        {!loading && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {totalOpen} cohortă{totalOpen === 1 ? "" : "e"} deschisă{totalOpen === 1 ? "" : "e"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {LEVEL_ORDER.map((level) => (
            <div key={level} className="rounded-lg border border-border bg-background p-3">
              <h3 className="mb-2 text-sm font-bold text-foreground">{level}</h3>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map((f) => (
                  <FormatColumn
                    key={f.key}
                    label={f.label}
                    icon={f.icon}
                    cohorts={cohortsFor(level, f.key)}
                    counts={counts}
                  />
                ))}
              </div>
            </div>
          ))}

          {kidsCohorts.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-3">
              <h3 className="mb-2 text-sm font-bold text-foreground">Copii</h3>
              <FormatColumn
                label="Curs copii"
                icon={Users}
                cohorts={[...kidsCohorts].sort((a, b) => a.start_date.localeCompare(b.start_date))}
                counts={counts}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GroupOverview;
