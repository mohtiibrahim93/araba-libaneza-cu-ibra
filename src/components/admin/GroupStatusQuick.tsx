import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import { cohortAdminTitle, cohortStatusLabels } from "./RegistrationCourse";

/**
 * Grupe › Starea grupelor (owner, 8 Nov 2026: "I can't set it to în
 * desfășurare or în formare"). One select per group at the top of the tab;
 * saves through the same upsert_cohort as the full editor, with the whole row,
 * so only the status changes.
 */
const QUICK = [
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
  "in_progress",
  "completed",
  "cancelled",
  "draft",
] as const;

type Row = Record<string, unknown> & {
  id: string;
  form_type: string;
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string;
  status: string;
  course_type?: string | null;
};

export default function GroupStatusQuick() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await invokeAdmin<{ data?: Row[] }>({
      action: "list_cohorts",
    });
    setRows(
      (data?.data ?? []).filter(
        (r) =>
          r.course_type !== "privat" &&
          r.status !== "completed" &&
          r.status !== "cancelled",
      ),
    );
  }, []);
  useEffect(() => {
    void load().catch(() => setRows([]));
  }, [load]);

  const setStatus = async (row: Row, status: string) => {
    setBusy(row.id);
    try {
      const { data, error } = await invokeAdmin<{ error?: string }>({
        ...row,
        action: "upsert_cohort",
        status,
      });
      if (error || data?.error) throw new Error(data?.error ?? "Nesalvat");
      toast({ title: `Stare: ${cohortStatusLabels[status] ?? status}` });
      await load();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Nu am putut salva.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">Starea grupelor</h2>
        <p className="text-sm text-muted-foreground">
          Schimbă direct: în formare, în desfășurare, încheiată…
        </p>
      </div>
      {rows === null ? (
        <p className="text-sm">Se încarcă…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm">Nicio grupă activă.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className="text-sm font-medium">
                {cohortAdminTitle(r as never)} · {r.start_date}
              </span>
              <select
                aria-label={`Starea grupei ${cohortAdminTitle(r as never)}`}
                value={r.status}
                disabled={busy === r.id}
                onChange={(e) => void setStatus(r, e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              >
                {QUICK.map((s) => (
                  <option key={s} value={s}>
                    {cohortStatusLabels[s] ?? s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
