import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, X, ExternalLink, CalendarX2, Phone, RefreshCw, CalendarClock, TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TimeField } from "@/components/admin/TimeField";
import { BUCHAREST_TZ, bucharestCivilToUtc } from "@/lib/timezone";

interface Booking {
  id: string;
  event_type_slug: string;
  start_at: string;
  end_at: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  format: string;
  notes: string | null;
  status: string;
  meet_link: string | null;
  manage_token: string;
  created_at: string;
  google_event_id: string | null;
  google_sync_error: string | null;
}

/**
 * What an admin actually wants to see, in the order they want it.
 *
 * The old control was the raw database status list ("all", "confirmed",
 * "cancelled"…) — which cannot answer the one question this panel exists for:
 * *who is coming next*. A confirmed booking from last March sat above
 * tomorrow's one. So the view is now time-based: upcoming first, ascending
 * (soonest at the top), with past and cancelled as separate lenses.
 */
type View = "upcoming" | "past" | "cancelled" | "all";

const VIEWS: { key: View; label: string }[] = [
  { key: "upcoming", label: "Viitoare" },
  { key: "past", label: "Trecute" },
  { key: "cancelled", label: "Anulate" },
  { key: "all", label: "Toate" },
];

// How often the list refreshes itself. A booking that lands while the admin is
// looking at the panel should appear without a reload — that was the whole
// point of asking for a "live" panel — but the tab is often left open all day,
// so refreshing pauses while the tab is hidden.
const POLL_MS = 30_000;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    dateStyle: "medium",
    timeStyle: "short",
  });

const EVENT_LABEL: Record<string, string> = {
  trial: "Probă gratuită",
  paid: "Lecție privată",
};

// The columns used to print the database column straight out, so the table read
// "physical" and "confirmed" in the middle of an otherwise Romanian screen.
const FORMAT_LABEL: Record<string, string> = {
  online: "Online",
  physical: "La centru",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmată",
  cancelled: "Anulată",
  pending: "În așteptare",
};

const BookingsAdmin = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<View>("upcoming");
  const [query, setQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  /**
   * Moving a lesson.
   *
   * The panel could only cancel, so changing a time meant cancelling and
   * asking the student to rebook -- or editing Google Calendar by hand, which
   * is the one direction that does not come back here. The first call reports
   * what the new time clashes with; `warn` holds that, and the second call
   * carries force.
   */
  const [moving, setMoving] = useState<Booking | null>(null);
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("10:00");
  const [moveBusy, setMoveBusy] = useState(false);
  const [moveWarn, setMoveWarn] = useState<{ clashes: string[]; outside: boolean } | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  // Guards the very first load only: a background poll must not blank the
  // table into a spinner under the admin's cursor.
  const loadedOnce = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else if (!loadedOnce.current) setLoading(true);
    try {
      // One fetch serves every lens; the filtering below is local, so
      // switching between "viitoare" and "trecute" is instant.
      const { data, error } = await invokeAdmin({ action: "list_bookings", status_filter: "all" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows((data.data ?? []) as Booking[]);
      setLastSync(new Date());
      loadedOnce.current = true;
    } catch {
      // A failed background poll stays quiet — the visible list is still the
      // last good one, and a toast every 30 seconds would be noise.
      if (!silent) toast({ title: "Nu am putut încărca programările", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  const visible = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();
    const matches = (b: Booking) =>
      !q ||
      b.student_name.toLowerCase().includes(q) ||
      b.student_email.toLowerCase().includes(q) ||
      (b.student_phone ?? "").toLowerCase().includes(q);

    const inView = (b: Booking) => {
      const started = new Date(b.start_at).getTime() < now;
      if (view === "cancelled") return b.status === "cancelled";
      if (view === "upcoming") return b.status !== "cancelled" && !started;
      if (view === "past") return b.status !== "cancelled" && started;
      return true;
    };

    return rows
      .filter((b) => inView(b) && matches(b))
      // Upcoming reads soonest-first; everything else most-recent-first.
      .sort((a, b) =>
        view === "upcoming"
          ? a.start_at.localeCompare(b.start_at)
          : b.start_at.localeCompare(a.start_at),
      );
  }, [rows, view, query]);

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: rows.filter((b) => b.status !== "cancelled" && new Date(b.start_at).getTime() >= now)
        .length,
      past: rows.filter((b) => b.status !== "cancelled" && new Date(b.start_at).getTime() < now)
        .length,
      cancelled: rows.filter((b) => b.status === "cancelled").length,
      all: rows.length,
    } as Record<View, number>;
  }, [rows]);

  /** The booking's own date and time, as Bucharest shows them. */
  const bucharestFields = (iso: string) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: BUCHAREST_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date(iso));
    const g = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
    // Some engines render midnight as hour 24 with hour12:false.
    const hh = g("hour") === "24" ? "00" : g("hour");
    return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${hh}:${g("minute")}` };
  };

  const openMove = (b: Booking) => {
    const f = bucharestFields(b.start_at);
    setMoving(b);
    setMoveDate(f.date);
    setMoveTime(f.time);
    setMoveWarn(null);
  };

  const CLASH_LABEL: Record<string, string> = {
    another_booking: "altă programare",
    calendar: "ceva din Google Calendar",
    group_lesson: "o lecție de grup",
  };

  const submitMove = async (force: boolean) => {
    if (!moving) return;
    const [y, m, d] = moveDate.split("-").map(Number) as (number | undefined)[];
    const [hh, mm] = moveTime.split(":").map(Number) as (number | undefined)[];
    if (y === undefined || m === undefined || d === undefined || hh === undefined || mm === undefined) {
      toast({ title: "Data sau ora nu sunt valide", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(hh) || !Number.isFinite(mm)) {
      toast({ title: "Data sau ora nu sunt valide", variant: "destructive" });
      return;
    }
    setMoveBusy(true);
    try {
      // Bucharest civil time to the instant, DST included — the same helper
      // the rest of the site uses, because an hour out here books the wrong
      // hour for a real student.
      const startAt = bucharestCivilToUtc(y, m, d, hh, mm).toISOString();
      const { data, error } = await invokeAdmin<{
        success?: boolean;
        error?: string;
        code?: string;
        clashes?: string[];
        outside_availability?: boolean;
      }>({ action: "reschedule_booking", id: moving.id, start_at: startAt, force });
      if (error) throw error;
      if (data?.code === "conflict" || data?.code === "outside_availability") {
        setMoveWarn({ clashes: data.clashes ?? [], outside: data.outside_availability === true });
        return;
      }
      if (data?.error) throw new Error(data.error);
      toast({ title: "Lecție mutată", description: "Cursantul a primit un email cu ora nouă." });
      setMoving(null);
      setMoveWarn(null);
      void load(true);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Mutare eșuată",
        variant: "destructive",
      });
    } finally {
      setMoveBusy(false);
    }
  };

  const cancel = async (b: Booking) => {
    if (!confirm(`Anulezi programarea cu ${b.student_name} (${fmt(b.start_at)})?`)) return;
    setCancellingId(b.id);
    try {
      const { data, error } = await invokeAdmin({ action: "cancel_booking", id: b.id });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Programare anulată" });
      void load(true);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Anulare eșuată",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">Programări</h2>
          <p className="text-sm text-muted-foreground">
            Lecții de probă și lecții private rezervate pe site. Anularea șterge și evenimentul din
            Google Calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {refreshing
              ? "Se actualizează…"
              : lastSync
                ? `Actualizat ${lastSync.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`
                : ""}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void load(true)}
            disabled={refreshing}
            aria-label="Reîncarcă programările"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {VIEWS.map((v) => (
            <Button
              key={v.key}
              size="sm"
              variant={view === v.key ? "default" : "outline"}
              onClick={() => setView(v.key)}
            >
              {v.label}
              <span className="ml-1 opacity-70 tabular-nums">{counts[v.key] ?? 0}</span>
            </Button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută după nume, email sau telefon"
          className="h-9 w-full sm:w-72"
          aria-label="Caută programări"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          {query.trim() ? "Nicio programare pentru această căutare." : "Nicio programare aici."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-2">Când</th>
                <th className="py-2 pr-2">Tip</th>
                <th className="py-2 pr-2">Cursant</th>
                <th className="py-2 pr-2">Format</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="py-2 pr-2 whitespace-nowrap">{fmt(b.start_at)}</td>
                  <td className="py-2 pr-2">{EVENT_LABEL[b.event_type_slug] ?? b.event_type_slug}</td>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{b.student_name}</div>
                    <div className="text-xs text-muted-foreground">{b.student_email}</div>
                    {b.student_phone && (
                      <a
                        href={`tel:${b.student_phone}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {b.student_phone}
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {FORMAT_LABEL[b.format] ?? b.format}
                    {b.meet_link && (
                      <a
                        href={b.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 inline-flex items-center text-primary"
                        aria-label="Deschide linkul întâlnirii"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {STATUS_LABEL[b.status] ?? b.status}
                    {b.status === "confirmed" && !b.google_event_id && (
                      <span
                        className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                        title={
                          b.google_sync_error
                            ? `Google Calendar: ${b.google_sync_error}`
                            : "Rezervarea nu are un eveniment în Google Calendar."
                        }
                      >
                        <CalendarX2 className="h-3 w-3 shrink-0" aria-hidden />
                        fără Calendar
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openMove(b)}
                        aria-label={`Mută lecția cu ${b.student_name}`}
                        title="Mută lecția"
                      >
                        <CalendarClock className="h-4 w-4" />
                      </Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel(b)}
                        disabled={cancellingId === b.id}
                        aria-label={`Anulează programarea cu ${b.student_name}`}
                        title="Anulează programarea"
                      >
                        {cancellingId === b.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={moving !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMoving(null);
            setMoveWarn(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mută lecția</DialogTitle>
            <DialogDescription>
              {moving
                ? `${moving.student_name} — acum ${fmt(moving.start_at)}. Cursantul primește un email cu ora nouă, iar evenimentul din Google Calendar se mută cu tot cu linkul de Meet.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                className="h-9 w-40"
                value={moveDate}
                onChange={(e) => {
                  setMoveDate(e.target.value);
                  setMoveWarn(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ora (ora României)</Label>
              <TimeField
                label="Ora nouă"
                value={moveTime}
                onChange={(hhmm) => {
                  setMoveTime(hhmm);
                  setMoveWarn(null);
                }}
              />
            </div>
          </div>

          {/* The first attempt reports rather than refuses: the owner is not
              bound by his own opening hours, but he should not double-book
              himself without being told. */}
          {moveWarn && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="space-y-1">
                {moveWarn.clashes.length > 0 && (
                  <p>
                    Ora asta se suprapune cu{" "}
                    {moveWarn.clashes.map((c) => CLASH_LABEL[c] ?? c).join(" și ")}.
                  </p>
                )}
                {moveWarn.outside && <p>E în afara orelor tale din Disponibilitate.</p>}
                <p className="font-medium">Poți muta oricum, dacă așa ai stabilit cu cursantul.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setMoving(null);
                setMoveWarn(null);
              }}
              disabled={moveBusy}
            >
              Renunță
            </Button>
            <Button onClick={() => void submitMove(moveWarn !== null)} disabled={moveBusy}>
              {moveBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {moveWarn ? "Mută oricum" : "Mută lecția"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default BookingsAdmin;
