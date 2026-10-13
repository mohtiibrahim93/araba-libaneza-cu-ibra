import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { bucharestCivilToUtc, BUCHAREST_TZ } from "@/lib/timezone";

/** "YYYY-MM-DDTHH:mm" in Bucharest time, for a datetime-local input. */
const bucharestInput = (iso: string) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: BUCHAREST_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p["year"]}-${p["month"]}-${p["day"]}T${p["hour"] === "24" ? "00" : p["hour"]}:${p["minute"]}`;
};

/**
 * Move or remove one group lesson from the admin. Google Calendar is changed
 * first (the group's guests get Google's usual update), then the site; the
 * lesson keeps its length when moved. The time typed is Romania's.
 */
export default function GroupSessionActions({
  session,
  onChanged,
}: {
  session: {
    id: string;
    lesson_number: number;
    starts_at: string;
    ends_at: string;
  };
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => bucharestInput(session.starts_at));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const call = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await invokeAdmin<{
        success?: boolean;
        error?: string;
      }>({ ...body, id: session.id });
      if (failure || data?.error || data?.success !== true)
        throw new Error(data?.error || failure?.message || "Nu s-a salvat.");
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu s-a salvat.");
    } finally {
      setBusy(false);
    }
  };

  const move = () => {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!m) return setError("Alege data și ora.");
    const start = bucharestCivilToUtc(+m[1]!, +m[2]!, +m[3]!, +m[4]!, +m[5]!);
    const length = Date.parse(session.ends_at) - Date.parse(session.starts_at);
    void call({
      action: "move_cohort_session",
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + length).toISOString(),
    });
  };

  const remove = () => {
    if (
      window.confirm(
        `Ștergi lecția ${session.lesson_number} din site și din Google Calendar? Cursanții grupei primesc anunțul de la Google.`,
      )
    ) {
      void call({ action: "delete_cohort_session" });
    }
  };

  return (
    <div className="mt-2 space-y-1.5">
      {editing ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="datetime-local"
            aria-label={`Noua oră pentru lecția ${session.lesson_number} (ora României)`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground"
          />
          <button
            type="button"
            disabled={busy}
            onClick={move}
            className="rounded border px-2 py-1 text-xs font-semibold disabled:opacity-50"
          >
            Salvează
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(false)}
            className="rounded px-2 py-1 text-xs"
          >
            Renunță
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(true)}
            className="rounded border border-current/30 px-2 py-1 text-xs font-semibold disabled:opacity-50"
          >
            Mută
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="rounded border border-current/30 px-2 py-1 text-xs font-semibold disabled:opacity-50"
          >
            Șterge
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
