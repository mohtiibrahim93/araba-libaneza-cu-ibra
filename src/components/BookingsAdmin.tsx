import CalendarSyncPanel from "./admin/CalendarSyncPanel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  X,
  CalendarX2,
  Phone,
  RefreshCw,
  CalendarClock,
  CalendarPlus,
  Video,
} from "lucide-react";
import { meetingLabel } from "./admin/types";
import LessonEditDialog from "./admin/LessonEditDialog";
import BookLessonDialog from "./admin/BookLessonDialog";
export {
  studentOptionLabel,
  type PrivateStudent,
} from "./admin/BookLessonDialog";
import {
  TrialOutcomeControl,
  type TrialOutcome,
} from "@/components/admin/TrialOutcome";

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
  trial_outcome?: TrialOutcome;
  completed_by?: string | null;
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
  completed: "Făcută",
  rescheduled: "Mutată",
};

/** Who marked a lesson done (after-lesson email, 14 October 2026). */
const COMPLETED_BY_LABEL: Record<string, string> = {
  student: "confirmată de cursant",
  auto: "automat, după 48h",
  admin: "de tine",
};

const BookingsAdmin = ({
  privateOnly = false,
  onChanged,
}: { privateOnly?: boolean; onChanged?: () => void } = {}) => {
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
  const [editing, setEditing] = useState<Booking | null>(null);
  /** Booking a private lesson by hand (BookLessonDialog). */
  const [booking, setBooking] = useState(false);
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
      const { data, error } = await invokeAdmin({
        action: "list_bookings",
        status_filter: "all",
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows((data.data ?? []) as Booking[]);
      setLastSync(new Date());
      loadedOnce.current = true;
    } catch {
      // A failed background poll stays quiet — the visible list is still the
      // last good one, and a toast every 30 seconds would be noise.
      if (!silent)
        toast({
          title: "Nu am putut încărca programările",
          variant: "destructive",
        });
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

  const scopedRows = useMemo(
    () =>
      privateOnly ? rows.filter((b) => b.event_type_slug === "paid") : rows,
    [rows, privateOnly],
  );

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

    return (
      scopedRows
        .filter((b) => inView(b) && matches(b))
        // Upcoming reads soonest-first; everything else most-recent-first.
        .sort((a, b) =>
          view === "upcoming"
            ? a.start_at.localeCompare(b.start_at)
            : b.start_at.localeCompare(a.start_at),
        )
    );
  }, [scopedRows, view, query]);

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: scopedRows.filter(
        (b) =>
          b.status !== "cancelled" && new Date(b.start_at).getTime() >= now,
      ).length,
      past: scopedRows.filter(
        (b) => b.status !== "cancelled" && new Date(b.start_at).getTime() < now,
      ).length,
      cancelled: scopedRows.filter((b) => b.status === "cancelled").length,
      all: scopedRows.length,
    } as Record<View, number>;
  }, [scopedRows]);

  /** The booking's own date and time, as Bucharest shows them. */
  const repairCalendar = async (booking: Booking) => {
    if (
      !confirm(
        "Creezi evenimentul Google pentru această lecție? Verifică mai întâi evenimentele fără asociere din Program pentru a evita dublurile vechi.",
      )
    )
      return;
    try {
      const { data, error } = await invokeAdmin({
        action: "repair_booking_calendar",
        id: booking.id,
      });
      if (error || data?.error || data?.success !== true)
        throw new Error(data?.error || "Repararea nu a fost confirmată.");
      toast({ title: "Lecția este în Google Calendar" });
      void load(true);
    } catch (failure) {
      toast({
        title: failure instanceof Error ? failure.message : "Reparare eșuată",
        variant: "destructive",
      });
    }
  };

  const cancel = async (b: Booking) => {
    if (
      !confirm(`Anulezi programarea cu ${b.student_name} (${fmt(b.start_at)})?`)
    )
      return;
    setCancellingId(b.id);
    try {
      const { data, error } = await invokeAdmin({
        action: "cancel_booking",
        id: b.id,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.success !== true)
        throw new Error(
          "Anularea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
        );
      toast({
        title: data.sync_pending
          ? "Anulată în admin; anularea Google este în așteptare"
          : "Programare anulată",
        ...(data.sync_pending ? { variant: "destructive" as const } : {}),
      });
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
      <CalendarSyncPanel
        onChanged={() => void load(true)}
        showExternal={false}
      />
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {privateOnly ? "Programări private" : "Programări"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Lecții de probă și lecții private rezervate pe site. Anularea șterge
            și evenimentul din Google Calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setBooking(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Programează o lecție privată
          </Button>
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
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
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
              <span className="ml-1 opacity-70 tabular-nums">
                {counts[v.key] ?? 0}
              </span>
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
          {query.trim()
            ? "Nicio programare pentru această căutare."
            : "Nicio programare aici."}
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
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {fmt(b.start_at)}
                  </td>
                  <td className="py-2 pr-2">
                    {EVENT_LABEL[b.event_type_slug] ?? b.event_type_slug}
                    {b.event_type_slug === "trial" && (
                      <TrialOutcomeControl
                        booking={b}
                        onChanged={(outcome) =>
                          setRows((all) =>
                            all.map((row) =>
                              row.id === b.id
                                ? { ...row, trial_outcome: outcome }
                                : row,
                            ),
                          )
                        }
                      />
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{b.student_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.student_email}
                    </div>
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
                        className="ml-2 inline-flex items-center gap-1 rounded-md bg-brand-green px-2 py-1 text-xs font-semibold text-white hover:opacity-90"
                        aria-label={`Deschide ${meetingLabel(b.meet_link)} pentru lecția cu ${b.student_name}`}
                      >
                        <Video className="h-3 w-3" aria-hidden />
                        {meetingLabel(b.meet_link)}
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {STATUS_LABEL[b.status] ?? b.status}
                    {b.status === "completed" && b.completed_by && (
                      <span className="block text-xs text-muted-foreground">
                        {COMPLETED_BY_LABEL[b.completed_by] ?? b.completed_by}
                      </span>
                    )}
                    {b.status === "confirmed" &&
                      (!b.google_event_id || !!b.google_sync_error) && (
                        <span
                          className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                          title={
                            b.google_sync_error
                              ? `Google Calendar: ${b.google_sync_error}`
                              : "Rezervarea nu are un eveniment în Google Calendar."
                          }
                        >
                          <CalendarX2
                            className="h-3 w-3 shrink-0"
                            aria-hidden
                          />
                          {b.google_event_id
                            ? "Calendar în așteptare"
                            : "fără Calendar"}
                          {(!b.google_event_id ||
                            b.google_sync_error ===
                              "calendar_create_pending") && (
                            <button
                              type="button"
                              className="underline"
                              onClick={() => void repairCalendar(b)}
                            >
                              Repară
                            </button>
                          )}
                        </span>
                      )}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(b)}
                      aria-label={`Modifică lecția cu ${b.student_name}`}
                      title="Modifică lecția"
                    >
                      <CalendarClock className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Modifică</span>
                    </Button>
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

      <LessonEditDialog
        lesson={editing}
        onClose={() => setEditing(null)}
        onChanged={() => void load(true)}
      />

      <BookLessonDialog
        open={booking}
        onClose={() => setBooking(false)}
        onBooked={() => {
          void load(true);
          onChanged?.();
        }}
      />
    </section>
  );
};

export default BookingsAdmin;
