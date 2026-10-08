import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { getCurriculum } from "@/data/curriculum";
import { ErrorNote } from "./ui";

/**
 * Grupe › Numele grupelor în calendar (October 2026).
 *
 * The owner names each group once, the way he writes it in Google Calendar —
 * "Curs online A1 - Grupa 1" (the common structure, one click from the group
 * number) — whatever the group is called on the website. Lessons titled
 * "<that name> - L<N>" are then synced and new ones created with it. Changing
 * the name of a group with lessons renames them in Google Calendar quietly
 * (rename_cohort_events, no invitations). Stored in cohort_calendar.
 */
interface Group {
  id: string;
  level: string | null;
  format: string | null;
  start_date: string;
  status: string;
  title_ro: string | null;
  schedule_label_ro: string | null;
  link: { calendar_title: string; total_lessons: number } | null;
}

const STATUS: Record<string, string> = {
  draft: "Draft",
  forming: "În formare",
  minimum_reached: "Minim atins",
  confirmed: "Confirmată",
  full: "Plină",
  in_progress: "În desfășurare",
};

const lessonsFor = (level: string | null) =>
  getCurriculum("ro").find((l) => l.id === (level ?? "").toLowerCase())?.lessons ?? 32;

const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const CohortCalendarNames = ({ onChanged }: { onChanged?: () => void }) => {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [draft, setDraft] = useState<Record<string, { title: string; total: string; grupa: string; rename: boolean }>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: err } = await invokeAdmin<{ data?: Group[]; error?: string }>({ action: "list_cohort_calendar" });
    if (err || data?.error) {
      setError(data?.error ?? "Nu am putut încărca grupele.");
      setGroups([]);
      return;
    }
    const list = data?.data ?? [];
    setGroups(list);
    setDraft(
      Object.fromEntries(
        list.map((g) => [
          g.id,
          {
            title: g.link?.calendar_title ?? "",
            total: String(g.link?.total_lessons ?? lessonsFor(g.level)),
            grupa: "",
            rename: true,
          },
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (g: Group) => {
    const d = draft[g.id];
    if (!d?.title.trim()) return setError("Scrie numele din calendar.");
    setBusy(g.id);
    setError("");
    setNote("");
    const newTitle = d.title.trim();
    // A new name for a group that already has lessons: rename them in Google
    // Calendar first (quietly), so the next sync still finds every lesson.
    if (g.link && newTitle !== g.link.calendar_title && d.rename) {
      // Read the calendar under the old name, so every lesson is known.
      await invokeAdmin({ action: "sync_cohort_sessions", cohort_id: g.id });
      const { data: rn, error: rnErr } = await invokeAdmin<{ error?: string; renamed?: number; failed?: number[] }>({
        action: "rename_cohort_events",
        cohort_id: g.id,
        calendar_title: newTitle,
      });
      if (rnErr || rn?.error) {
        setBusy(null);
        return setError(rn?.error ?? "Nu am putut redenumi lecțiile din calendar.");
      }
      setNote(
        `${rn?.renamed ?? 0} lecții redenumite în Google Calendar, fără invitații trimise` +
          (rn?.failed?.length ? `; nu s-au putut redenumi: L${rn.failed.join(", L")}.` : "."),
      );
    }
    const { data, error: err } = await invokeAdmin<{ error?: string }>({
      action: "upsert_cohort_calendar",
      cohort_id: g.id,
      calendar_title: d.title.trim(),
      total_lessons: Number(d.total),
    });
    setBusy(null);
    if (err || data?.error) return setError(data?.error ?? "Nu am putut salva.");
    await load();
    onChanged?.();
  };

  const remove = async (g: Group) => {
    setBusy(g.id);
    setError("");
    const { data, error: err } = await invokeAdmin<{ error?: string }>({ action: "delete_cohort_calendar", cohort_id: g.id });
    setBusy(null);
    if (err || data?.error) return setError(data?.error ?? "Nu am putut șterge legătura.");
    await load();
    onChanged?.();
  };

  return (
    <section className="space-y-4 rounded-[20px] border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Numele grupelor în calendar</h2>
        <p className="text-sm text-muted-foreground">
          Numele cu care grupa apare în Google Calendar. Structura comună: „Curs online A1 - Grupa 1”, iar lecțiile devin
          „Curs online A1 - Grupa 1 - L13”. Scrie numărul grupei și apasă „Structura comună”, sau scrie numele tău. Se
          sincronizează doar lecțiile cu acest nume urmat de numărul lecției; nu contează cum se numește grupa pe site.
        </p>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {note && <p className="rounded-xl bg-accent px-3 py-2 text-sm">{note}</p>}
      {!groups && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </p>
      )}
      <ul className="divide-y divide-border/70">
        {groups?.map((g) => {
          const d = draft[g.id] ?? { title: "", total: "32", grupa: "", rename: true };
          const changed = d.title.trim() !== (g.link?.calendar_title ?? "") || Number(d.total) !== (g.link?.total_lessons ?? NaN);
          return (
            <li key={g.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-end">
              <div className="min-w-0 lg:w-64">
                <p className="font-semibold">
                  {g.level ?? "Grupă"} · {g.format === "online" ? "online" : g.format === "fizic" ? "la centru" : g.format ?? ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  de pe {fmtDate(g.start_date)} · {STATUS[g.status] ?? g.status}
                  {g.schedule_label_ro ? ` · ${g.schedule_label_ro}` : ""}
                </p>
              </div>
              <label className="flex flex-col gap-1 text-sm text-muted-foreground lg:w-24">
                Grupa nr.
                <span className="flex gap-1">
                  <input
                    inputMode="numeric"
                    value={d.grupa}
                    onChange={(e) => setDraft((x) => ({ ...x, [g.id]: { ...d, grupa: e.target.value.replace(/[^\d]/g, "") } }))}
                    placeholder="1"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground"
                  />
                </span>
              </label>
              <button
                type="button"
                disabled={!d.grupa}
                onClick={() =>
                  setDraft((x) => ({
                    ...x,
                    [g.id]: {
                      ...d,
                      title: `Curs ${g.format === "online" ? "online" : "fizic"} ${g.level ?? ""} - Grupa ${d.grupa}`.replace(/\s+/g, " "),
                    },
                  }))
                }
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted disabled:opacity-40"
              >
                Structura comună
              </button>
              <label className="flex flex-1 flex-col gap-1 text-sm text-muted-foreground">
                Numele din calendar
                <input
                  value={d.title}
                  onChange={(e) => setDraft((x) => ({ ...x, [g.id]: { ...d, title: e.target.value } }))}
                  placeholder="ex. curs online a1, grupa 1"
                  className="h-11 rounded-xl border border-input bg-background px-3 text-base text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-muted-foreground lg:w-28">
                Lecții în total
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={d.total}
                  onChange={(e) => setDraft((x) => ({ ...x, [g.id]: { ...d, total: e.target.value } }))}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-base text-foreground"
                />
              </label>
              <div className="flex flex-col gap-2">
                {g.link && d.title.trim() && d.title.trim() !== g.link.calendar_title && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground lg:max-w-48">
                    <input
                      type="checkbox"
                      checked={d.rename}
                      onChange={(e) => setDraft((x) => ({ ...x, [g.id]: { ...d, rename: e.target.checked } }))}
                      className="h-4 w-4"
                    />
                    Redenumește și lecțiile existente în Google Calendar (fără invitații)
                  </label>
                )}
                <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy === g.id || !changed}
                  onClick={() => void save(g)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-green px-4 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy === g.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvează
                </button>
                {g.link && (
                  <button
                    type="button"
                    disabled={busy === g.id}
                    onClick={() => void remove(g)}
                    aria-label="Scoate legătura cu calendarul"
                    title="Scoate legătura cu calendarul (calendarul nu se schimbă)"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CohortCalendarNames;
