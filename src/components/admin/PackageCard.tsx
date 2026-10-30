import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Loader2, Trash2 } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeField } from "@/components/admin/TimeField";
import { bucharestCivilToUtc } from "@/lib/timezone";
import BookLessonDialog from "./BookLessonDialog";
import { bucharestFields, CLASH_LABEL } from "./LessonEditDialog";
import {
  LessonOutcomeControl,
  PackageLessonBadge,
  type PackageLessonLike,
} from "./LessonOutcome";

/**
 * A private student's package in their sheet (owner's request, 26 October
 * 2026): "Lecția 3 din 10", every lesson numbered by date with Scuzat /
 * Pierdută, and booking the next lesson — or the next several, weekly —
 * without retyping anything.
 */
interface PackageLesson extends PackageLessonLike {
  end_at: string;
  format: string;
}
interface PackageData {
  registration_id: string;
  name: string | null;
  quantity: number;
  used: number;
  lessons: PackageLesson[];
}

const WEEK_MS = 7 * 86_400_000;
const STATUS: Record<string, string> = {
  confirmed: "programată",
  completed: "făcută",
  cancelled: "anulată",
};
const when = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

/** A civil date (YYYY-MM-DD) plus some days, without time-zone shifts. */
function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10);
}

/**
 * Where the n-th next lesson goes by default (n = 1, 2…): weekly after the
 * last lesson, same weekday and Romanian hour (also across a clock change),
 * skipping weeks already past; with no lesson yet, from tomorrow at 18:00.
 */
function nextSlot(lessons: PackageLesson[], n = 1) {
  const last = [...lessons]
    .filter((l) => l.status !== "cancelled")
    .sort((a, b) => Date.parse(b.start_at) - Date.parse(a.start_at))[0];
  const today = bucharestFields(new Date().toISOString()).date;
  if (!last) return { date: addDays(today, 1 + (n - 1) * 7), time: "18:00" };
  const { date, time } = bucharestFields(last.start_at);
  let first = addDays(date, 7);
  while (first <= today) first = addDays(first, 7);
  return { date: addDays(first, (n - 1) * 7), time };
}

function toUtc(date: string, time: string): string | null {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (![y, m, d, hh, mm].every((n) => Number.isFinite(n))) return null;
  return bucharestCivilToUtc(y!, m!, d!, hh!, mm!).toISOString();
}

export default function PackageCard({
  registrationId,
}: {
  registrationId: string;
}) {
  const [pkg, setPkg] = useState<PackageData | null | undefined>(undefined);
  const [booking, setBooking] = useState(false);
  // "Pachet nou": the same student, a new registration with its own count.
  const [newPackage, setNewPackage] = useState(false);
  const [series, setSeries] = useState(false);

  const load = useCallback(async () => {
    const { data } = await invokeAdmin<{ data?: PackageData; error?: string }>({
      action: "package_lessons",
      registration_id: registrationId,
    });
    const d = data?.data;
    setPkg(d && Array.isArray(d.lessons) ? d : null);
  }, [registrationId]);

  useEffect(() => {
    setPkg(undefined);
    void load();
  }, [load]);

  if (pkg === undefined)
    return (
      <p className="text-sm text-muted-foreground">
        <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> Pachet…
      </p>
    );
  if (!pkg) return null;

  const left = Math.max(0, pkg.quantity - pkg.used);
  const lastFormat =
    [...pkg.lessons].reverse().find((l) => l.status !== "cancelled")?.format ===
    "physical"
      ? "physical"
      : "online";

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">Pachet</h3>
        <p className="text-sm">
          <b>{pkg.used}</b> din <b>{pkg.quantity}</b> lecții folosite
          {left === 1 && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              mai e 1 lecție
            </span>
          )}
          {left === 0 && (
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
              pachet terminat
            </span>
          )}
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div
          className="h-full bg-brand-green"
          style={{
            width: `${Math.min(100, (pkg.used / pkg.quantity) * 100)}%`,
          }}
        />
      </div>

      {pkg.lessons.length > 0 && (
        <ul className="mt-3 space-y-2">
          {pkg.lessons.map((l) => (
            <li
              key={l.id}
              className="rounded-lg border border-border/70 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-x-2">
                <PackageLessonBadge lesson={l} />
                <span
                  className={l.lesson_number ? "" : "line-through opacity-70"}
                >
                  {when(l.start_at)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {STATUS[l.status] ?? l.status}
                  {l.trial_outcome === "excused" && " · scuzat"}
                  {l.trial_outcome === "lost" && " · pierdută"}
                </span>
              </div>
              <LessonOutcomeControl lesson={l} onChanged={() => void load()} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => setBooking(true)}
          disabled={left === 0}
        >
          <CalendarPlus className="mr-1 h-4 w-4" />
          Programează următoarea
        </Button>
        {left > 1 && (
          <Button size="sm" variant="outline" onClick={() => setSeries(true)}>
            Programează următoarele {left}
          </Button>
        )}
      </div>
      {left <= 1 && (
        <div className="mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNewPackage(true)}
          >
            Pachet nou ({pkg.quantity} lecții)
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Aceleași date ale cursantului; lecțiile noi se numără de la 1.
            Bifează „A plătit deja” dacă a plătit.
          </p>
        </div>
      )}

      <BookLessonDialog
        open={booking}
        initial={
          booking
            ? {
                ...nextSlot(pkg.lessons),
                studentId: pkg.registration_id,
                format: lastFormat,
              }
            : null
        }
        onClose={() => setBooking(false)}
        onBooked={() => void load()}
      />
      <BookLessonDialog
        open={newPackage}
        initial={
          newPackage
            ? {
                ...nextSlot(pkg.lessons),
                studentId: pkg.registration_id,
                format: lastFormat,
                newPackage: { quantity: pkg.quantity, paid: false },
              }
            : null
        }
        onClose={() => setNewPackage(false)}
        onBooked={() => void load()}
      />
      {series && (
        <SeriesDialog
          pkg={pkg}
          count={left}
          format={lastFormat}
          onClose={() => setSeries(false)}
          onBooked={() => void load()}
        />
      )}
    </section>
  );
}

interface SeriesRow {
  key: number;
  date: string;
  time: string;
  state: "todo" | "busy" | "done" | "clash" | "error";
  note?: string | undefined;
}

/**
 * The next N lessons, one a week at the last lesson's hour. Every row can be
 * changed or removed before booking; a row that clashes stays, with what it
 * clashes with, and can be booked anyway. Only the first lesson emails the
 * student: the rest arrive as Google invitations.
 */
function SeriesDialog({
  pkg,
  count,
  format,
  onClose,
  onBooked,
}: {
  pkg: PackageData;
  count: number;
  format: "online" | "physical";
  onClose: () => void;
  onBooked: () => void;
}) {
  const [rows, setRows] = useState<SeriesRow[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      key: i,
      ...nextSlot(pkg.lessons, i + 1),
      state: "todo" as const,
    })),
  );
  const [busy, setBusy] = useState(false);

  const update = (key: number, patch: Partial<SeriesRow>) =>
    setRows((all) => all.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const bookRow = async (row: SeriesRow, force: boolean, quiet: boolean) => {
    const startAt = toUtc(row.date, row.time);
    if (!startAt) {
      update(row.key, { state: "error", note: "Data sau ora nu sunt valide." });
      return false;
    }
    update(row.key, { state: "busy", note: undefined });
    const { data, error } = await invokeAdmin<{
      success?: boolean;
      error?: string;
      code?: string;
      clashes?: string[];
    }>({
      action: "book_for_student",
      registration_id: pkg.registration_id,
      start_at: startAt,
      format,
      force,
      quiet,
    });
    if (!error && data?.success === true) {
      update(row.key, { state: "done" });
      return true;
    }
    if (data?.code === "conflict") {
      update(row.key, {
        state: "clash",
        note: `Se suprapune cu ${(data.clashes ?? []).map((c) => CLASH_LABEL[c] ?? c).join(", ") || "altceva"}.`,
      });
      return false;
    }
    update(row.key, {
      state: "error",
      note: data?.error || error?.message || "Programarea a eșuat.",
    });
    return false;
  };

  const bookAll = async () => {
    setBusy(true);
    let first = true;
    // In date order, one at a time, so each gets the next number.
    const todo = [...rows]
      .filter((r) => r.state === "todo" || r.state === "error")
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    let booked = 0;
    for (const r of todo) {
      if (await bookRow(r, false, !first)) {
        booked += 1;
        first = false;
      }
    }
    setBusy(false);
    onBooked();
    toast({ title: `${booked} lecții programate` });
  };

  const pending = rows.filter((r) => r.state !== "done");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Programează următoarele lecții</DialogTitle>
          <DialogDescription>
            {pkg.name}: o lecție pe săptămână, la aceeași oră. Schimbă sau
            șterge ce nu se potrivește, apoi programează.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="rounded-lg border border-border p-2">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="h-9 flex-1"
                  value={r.date}
                  disabled={r.state === "done" || busy}
                  onChange={(e) =>
                    update(r.key, { date: e.target.value, state: "todo" })
                  }
                />
                <div className="w-28">
                  <TimeField
                    label="Ora"
                    value={r.time}
                    onChange={(hhmm) =>
                      r.state !== "done" &&
                      update(r.key, { time: hhmm, state: "todo" })
                    }
                  />
                </div>
                {r.state === "done" ? (
                  <span className="text-xs font-semibold text-brand-green">
                    ✓
                  </span>
                ) : r.state === "busy" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Șterge rândul"
                    disabled={busy}
                    onClick={() =>
                      setRows((all) => all.filter((x) => x.key !== r.key))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {r.note && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  {r.note}{" "}
                  {r.state === "clash" && (
                    <button
                      type="button"
                      className="underline"
                      disabled={busy}
                      onClick={() => void bookRow(r, true, true).then(onBooked)}
                    >
                      Programează oricum
                    </button>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Închide
          </Button>
          <Button
            onClick={() => void bookAll()}
            disabled={busy || !pending.some((r) => r.state !== "clash")}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Programează {pending.filter((r) => r.state !== "clash").length}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
