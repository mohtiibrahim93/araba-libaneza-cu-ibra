import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

/**
 * Absences with a good reason, on a group student's sheet (owner, 17 Nov
 * 2026; Terms, section 4 "Absențe": a lesson counts as held even if the
 * student was absent, except in special situations we accept). The group's
 * lessons held so far, each with a tick; a ticked lesson counts as not held
 * for this student in the refund (the preview in "Contul meu" and the card
 * subscription's refund). Nothing is emailed and no money moves.
 */
interface Lesson {
  lesson_number: number;
  starts_at: string;
  google_event_id: string;
  excused: boolean;
  reason: string | null;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const LessonExcusals = ({ registrationId }: { registrationId: string }) => {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: err } = await invokeAdmin<{
      data?: { lessons: Lesson[] };
      error?: string;
    }>({ action: "list_excusals", registration_id: registrationId });
    if (err || data?.error) {
      setError(data?.error ?? "Lecțiile nu au putut fi încărcate.");
      setLessons([]);
      return;
    }
    setError("");
    setLessons(data?.data?.lessons ?? []);
  }, [registrationId]);

  useEffect(() => {
    if (open && lessons === null) void load();
  }, [open, lessons, load]);

  const toggle = async (lesson: Lesson) => {
    let reason = "";
    if (!lesson.excused) {
      const typed = window.prompt(
        `Absență motivată la lecția ${lesson.lesson_number} (${when(lesson.starts_at)}). Motivul, pe scurt (opțional):`,
        "",
      );
      if (typed === null) return;
      reason = typed;
    }
    setBusy(lesson.google_event_id);
    setError("");
    const { data, error: err } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({
      action: "set_excusal",
      registration_id: registrationId,
      google_event_id: lesson.google_event_id,
      excused: !lesson.excused,
      reason,
    });
    setBusy(null);
    if (err || data?.error || data?.success !== true)
      return setError(data?.error ?? "Nu am putut salva.");
    await load();
  };

  const count = lessons?.filter((l) => l.excused).length ?? 0;

  return (
    <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-semibold text-foreground"
        aria-expanded={open}
      >
        Absențe motivate{lessons !== null ? ` (${count})` : ""}{" "}
        <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <>
          <p className="text-muted-foreground">
            O lecție bifată nu se socotește ținută pentru acest cursant la
            rambursare (Termeni, secțiunea 4, „Absențe”). La rambursarea unei
            plăți cu cardul, scade-le din „lecții ținute”.
          </p>
          {lessons === null ? (
            <p className="text-muted-foreground">Se încarcă…</p>
          ) : lessons.length === 0 ? (
            <p className="text-muted-foreground">
              Nicio lecție a grupei ținută până acum (sau lecțiile nu sunt
              sincronizate din Google Calendar).
            </p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {lessons.map((l) => (
                <li key={l.google_event_id}>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      checked={l.excused}
                      disabled={busy !== null}
                      onChange={() => void toggle(l)}
                    />
                    <span>
                      Lecția {l.lesson_number} · {when(l.starts_at)}
                      {l.excused && l.reason ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {l.reason}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
};

export default LessonExcusals;
