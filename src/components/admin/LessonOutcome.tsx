import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import {
  countsAgainstPackage,
  packageLessonLabel,
} from "../../../supabase/functions/_shared/package-lessons";

export type LessonOutcome = "excused" | "lost" | null;

export interface PackageLessonLike {
  id: string;
  start_at: string;
  status: string;
  event_type_slug: string;
  trial_outcome?: string | null;
  lesson_number?: number | null;
  package_total?: number | null;
}

const DAY_MS = 86_400_000;

/** Lessons that belong to a package: not the trial, not the level check. */
export function isPackageLesson(b: { event_type_slug: string }) {
  return (
    b.event_type_slug !== "trial" && b.event_type_slug !== "verificare-nivel"
  );
}

/**
 * Asks before cancelling. Inside the last 24 hours it also asks who
 * cancelled: the owner's rule is that a student's late cancellation counts
 * against the package (pierdută), the owner's own does not. Returns null when
 * the owner changes their mind.
 */
export function askCancelLesson(
  b: { student_name: string; start_at: string; event_type_slug: string },
  whenLabel: string,
): { late_by_student: boolean } | null {
  if (!confirm(`Anulezi lecția cu ${b.student_name} (${whenLabel})?`))
    return null;
  const late = Date.parse(b.start_at) - Date.now() < DAY_MS;
  if (!late || !isPackageLesson(b)) return { late_by_student: false };
  return {
    late_by_student: confirm(
      "Lecția începe în mai puțin de 24 de ore.\n\n" +
        "OK — cursantul a anulat târziu: lecția se numără din pachet (pierdută).\n" +
        "Cancel — am anulat eu: lecția nu se numără.\n\n" +
        "Poți schimba oricând după aceea (Scuzat / Pierdută).",
    ),
  };
}

/** "L3/10" next to a package lesson. */
export function PackageLessonBadge({ lesson }: { lesson: PackageLessonLike }) {
  if (!lesson.lesson_number || !lesson.package_total) return null;
  return (
    <span
      className="ml-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
      title={`Lecția ${lesson.lesson_number} din ${lesson.package_total} din pachet`}
    >
      {packageLessonLabel(lesson.lesson_number, lesson.package_total)}
    </span>
  );
}

/**
 * The owner's word on a package lesson that took place or was cancelled:
 * scuzat (does not count) or pierdută (counts). Hidden before the lesson
 * starts unless it was cancelled.
 */
export function LessonOutcomeControl({
  lesson,
  onChanged,
}: {
  lesson: PackageLessonLike;
  onChanged?: (outcome: LessonOutcome) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!isPackageLesson(lesson) || lesson.status === "rescheduled") return null;
  const started = Date.parse(lesson.start_at) <= Date.now();
  const cancelled = lesson.status === "cancelled";
  if (!started && !cancelled) return null;
  const counts = countsAgainstPackage(lesson);

  const save = async (value: string) => {
    const outcome = (value === "" ? null : value) as LessonOutcome;
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await invokeAdmin<{
        success?: boolean;
        error?: string;
      }>({ action: "set_lesson_outcome", id: lesson.id, outcome });
      if (failure || data?.error || data?.success !== true)
        throw new Error(data?.error || failure?.message || "Nu s-a salvat.");
      onChanged?.(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu s-a salvat.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-muted-foreground">
        Din pachet:{" "}
        <span className="font-medium text-foreground">
          {counts ? "se numără" : "nu se numără"}
        </span>
        <select
          className="mt-1 block w-full rounded border border-input bg-background px-2 py-1 text-xs"
          value={
            lesson.trial_outcome === "excused" ||
            lesson.trial_outcome === "lost"
              ? lesson.trial_outcome
              : ""
          }
          disabled={busy}
          onChange={(e) => void save(e.target.value)}
        >
          <option value="">
            {cancelled
              ? "Anulată la timp — nu se numără"
              : "A avut loc — se numără"}
          </option>
          <option value="excused">Scuzat — nu se numără</option>
          <option value="lost">
            {cancelled
              ? "Anulare târzie — pierdută (se numără)"
              : "Nu a venit — pierdută (se numără)"}
          </option>
        </select>
      </label>
      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
