import { useCallback, useEffect, useMemo, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Circle, Calendar, CreditCard, UserPlus, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formTypeLabels } from "./types";

interface JourneyRow {
  id: string;
  created_at: string;
  form_type: string;
  name: string;
  email: string | null;
  phone: string | null;
  level: string | null;
  format: string | null;
  payment_status: string;
  paid_at: string | null;
  lead_status: string;
  bookings_count: number;
  confirmed_count: number;
  next_booking: { start_at: string; format: string; event_type_slug: string } | null;
  last_booking: { start_at: string; end_at: string } | null;
  class_completed: boolean;
}

type StageKey = "registration" | "booking" | "payment" | "class";

const stageMeta: Record<StageKey, { label: string; Icon: typeof UserPlus }> = {
  registration: { label: "Înscriere", Icon: UserPlus },
  booking: { label: "Programare", Icon: Calendar },
  payment: { label: "Plată", Icon: CreditCard },
  class: { label: "Lecție", Icon: GraduationCap },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    dateStyle: "medium",
    timeStyle: "short",
  });

type FilterKey = "all" | "incomplete" | "completed";

const StudentJourneyAdmin = () => {
  const [rows, setRows] = useState<JourneyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_student_journey" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data.data ?? []);
    } catch {
      toast({ title: "Nu am putut încărca parcursul studenților", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const stages: Record<StageKey, { done: boolean; detail: string }> = {
          registration: { done: true, detail: fmtDate(r.created_at) },
          booking: {
            done: r.confirmed_count > 0,
            detail: r.next_booking
              ? fmtDate(r.next_booking.start_at)
              : r.confirmed_count > 0
                ? `${r.confirmed_count} programări`
                : "—",
          },
          payment: {
            done: r.payment_status === "paid",
            detail:
              r.payment_status === "paid"
                ? r.paid_at
                  ? fmtDate(r.paid_at)
                  : "plătit"
                : r.payment_status,
          },
          class: {
            done: r.class_completed,
            detail: r.class_completed
              ? r.last_booking
                ? fmtDate(r.last_booking.end_at || r.last_booking.start_at)
                : "finalizat"
              : r.next_booking
                ? "în așteptare"
                : "—",
          },
        };
        const completedCount = (["registration", "booking", "payment", "class"] as StageKey[]).filter(
          (k) => stages[k].done,
        ).length;
        return { ...r, stages, completedCount };
      }),
    [rows],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return enriched;
    if (filter === "completed") return enriched.filter((r) => r.completedCount === 4);
    return enriched.filter((r) => r.completedCount < 4);
  }, [enriched, filter]);

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">Parcursul studenților</h2>
          <p className="text-sm text-muted-foreground">
            Înscriere → Programare → Plată → Lecție. Vedere unificată pentru fiecare lead.
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
          {(
            [
              { v: "all", l: "Toate" },
              { v: "incomplete", l: "În progres" },
              { v: "completed", l: "Finalizate" },
            ] as { v: FilterKey; l: string }[]
          ).map((b) => (
            <button
              key={b.v}
              type="button"
              onClick={() => setFilter(b.v)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-[4px] transition-colors",
                filter === b.v
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {b.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Nicio înscriere pentru filtrul selectat.</p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">{r.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{r.email || r.phone}</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-primary/10 text-primary">
                    {formTypeLabels[r.form_type] || r.form_type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.completedCount}/4
                </span>
              </div>
              <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(stageMeta) as StageKey[]).map((key) => {
                  const s = r.stages[key];
                  const { label, Icon } = stageMeta[key];
                  return (
                    <li
                      key={key}
                      className={cn(
                        "rounded-md border px-2 py-1.5 flex items-start gap-1.5",
                        s.done
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-muted/30",
                      )}
                    >
                      {s.done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Icon className="w-3 h-3" />
                          {label}
                        </div>
                        <div
                          className={cn(
                            "text-xs truncate",
                            s.done ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {s.detail}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StudentJourneyAdmin;