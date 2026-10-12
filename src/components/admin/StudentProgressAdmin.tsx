import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { formTypeLabels } from "@/components/admin/types";

/**
 * Students with an account (October 2026): their level test result, Yalla
 * progress and any registration under the same email. Read through
 * admin-registrations (list_student_progress); students only ever see their
 * own row.
 */
interface Reg {
  id: string;
  name: string;
  form_type: string;
  level: string | null;
  lead_status: string | null;
  payment_status: string | null;
  created_at: string;
}
interface StudentRow {
  user_id: string;
  email: string | null;
  placement: { level?: string; title?: string; scores?: number[]; date?: string } | null;
  xp: number;
  rounds: number;
  items_seen: number;
  last_played_at: string | null;
  created_at: string;
  registrations: Reg[];
}

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" }) : "—";

const StudentProgressAdmin = () => {
  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const { data, error: fnError } = await invokeAdmin<{ data?: StudentRow[]; error?: string }>({
        action: "list_student_progress",
      });
      if (fnError || data?.error) {
        setError(data?.error ?? "Nu am putut încărca progresul elevilor.");
        setRows([]);
        return;
      }
      setRows(data?.data ?? []);
    })();
  }, []);

  if (!rows) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Elevi cu cont</h2>
        <p className="text-sm text-muted-foreground">
          Cei care și-au salvat progresul din Jocul Yalla într-un cont: rezultatul testului de nivel, progresul din joc și
          înscrierile cu același email.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {rows.length === 0 && !error && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Încă niciun elev cu cont.</p>
      )}
      <div className="space-y-3">
        {rows.map((r) => (
          <article key={r.user_id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="font-semibold text-foreground break-all">{r.email ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  Cont din {fmt(r.created_at)} · ultima dată în joc: {fmt(r.last_played_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                  Test: {r.placement?.level ?? "nefăcut"}
                  {r.placement?.date ? ` · ${fmt(r.placement.date)}` : ""}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1">{r.xp} XP</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{r.rounds} runde</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{r.items_seen} expresii exersate</span>
              </div>
            </div>
            {r.placement?.scores?.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Scor pe secțiuni: {r.placement.scores.join(" · ")}
                {r.placement.title ? ` — ${r.placement.title}` : ""}
              </p>
            ) : null}
            {r.registrations.length > 0 ? (
              <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                {r.registrations.map((g) => (
                  <li key={g.id} className="flex flex-wrap gap-x-3 text-muted-foreground">
                    <span className="font-semibold text-foreground">{g.name}</span>
                    <span>{formTypeLabels[g.form_type] ?? g.form_type}</span>
                    {g.level && <span>nivel {g.level}</span>}
                    <span>{g.lead_status ?? "new"}</span>
                    <span>{g.payment_status ?? "—"}</span>
                    <span>{fmt(g.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">Nicio înscriere cu acest email.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default StudentProgressAdmin;
