import { useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import { cohortAdminTitle } from "./RegistrationCourse";

/**
 * Move a group registration into another group (audit, 1 Nov 2026: there was
 * no control for it). admin-registrations move_to_cohort keeps the payments,
 * takes level, format and language from the new group, and refuses a full
 * group unless the owner confirms.
 */
interface CohortOption {
  id: string;
  form_type: string;
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string;
  status: string;
  title_ro: string | null;
  max_seats: number;
}

// Not drafts: a draft group is not live (owner, 3 Nov 2026: A2 online).
const OPEN = ["forming", "minimum_reached", "confirmed", "in_progress"];

export default function MoveToCohort({
  registrationId,
  currentCohortId,
  onDone,
}: {
  registrationId: string;
  currentCohortId: string | null | undefined;
  onDone?: (() => void) | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [cohorts, setCohorts] = useState<CohortOption[] | null>(null);
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || cohorts) return;
    void invokeAdmin<{ data?: CohortOption[] }>({ action: "list_cohorts" })
      .then(({ data }) =>
        setCohorts(
          (data?.data ?? []).filter(
            (c) =>
              c.form_type === "group" &&
              OPEN.includes(c.status) &&
              c.id !== currentCohortId,
          ),
        ),
      )
      .catch(() => setCohorts([]));
  }, [open, cohorts, currentCohortId]);

  const move = async (force: boolean) => {
    if (!target) return;
    setSaving(true);
    try {
      const { data, error } = await invokeAdmin<{
        success?: boolean;
        error?: string;
        code?: string;
      }>({
        action: "move_to_cohort",
        id: registrationId,
        cohort_id: target,
        ...(force ? { force: true } : {}),
      });
      if (error) throw error;
      if (data?.code === "cohort_full" && !force) {
        if (
          window.confirm(
            `${data.error} Îl muți oricum? Grupa va fi peste capacitate.`,
          )
        )
          await move(true);
        return;
      }
      if (data?.error) throw new Error(data.error);
      toast({ title: "Mutat în grupa nouă" });
      setOpen(false);
      onDone?.();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Mutarea a eșuat.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:border-brand-green/60"
      >
        Mută în altă grupă
      </button>
    );

  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-3 text-sm">
      <legend className="px-1 text-xs font-semibold text-muted-foreground">
        Mută în altă grupă
      </legend>
      <select
        aria-label="Grupa nouă"
        value={target}
        disabled={cohorts === null}
        onChange={(e) => setTarget(e.target.value)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3"
      >
        <option value="">
          {cohorts === null ? "Se încarcă grupele…" : "Alege grupa"}
        </option>
        {(cohorts ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {cohortAdminTitle(c)} · {c.start_date}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Plățile rămân la el. Nivelul, formatul și limba se iau de la grupa nouă.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!target || saving}
          onClick={() => void move(false)}
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Se mută…" : "Mută"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4"
        >
          Renunță
        </button>
      </div>
    </fieldset>
  );
}
