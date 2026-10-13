import CalendarSyncPanel from "./admin/CalendarSyncPanel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  X,
  ExternalLink,
  CalendarX2,
  Phone,
  RefreshCw,
  CalendarClock,
  TriangleAlert,
  CalendarPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrialOutcomeControl,
  type TrialOutcome,
} from "@/components/admin/TrialOutcome";
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
  trial_outcome?: TrialOutcome;
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
export interface PrivateStudent {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  quantity: number;
  lessons_used: number;
  payment_status: string | null;
  source: string | null;
}

/** "Name — email · 2/5 lecții · plătit" — enough to tell two students apart. */
export function studentOptionLabel(s: PrivateStudent): string {
  const paid = s.payment_status === "paid" ? "plătit" : "neplătit";
  return `${s.name || "Fără nume"} — ${s.email || "fără email"} · ${s.lessons_used}/${s.quantity} lecții · ${paid}`;
}

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
  const [moving, setMoving] = useState<Booking | null>(null);
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("10:00");
  const [moveBusy, setMoveBusy] = useState(false);
  const [moveWarn, setMoveWarn] = useState<{
    clashes: string[];
    outside: boolean;
  } | null>(null);
  /**
   * Booking a private lesson for someone by hand.
   *
   * A group signup could be added from the panel; a private lesson has a time,
   * so it could not be added at all. The owner agrees an hour on WhatsApp and
   * had nowhere to record it, which is how a lesson ends up in Google Calendar
   * and nowhere else.
   */
  const [booking, setBooking] = useState(false);
  const [bkName, setBkName] = useState("");
  const [bkEmail, setBkEmail] = useState("");
  const [bkPhone, setBkPhone] = useState("");
  const [bkDate, setBkDate] = useState("");
  const [bkTime, setBkTime] = useState("18:00");
  const [bkFormat, setBkFormat] = useState<"online" | "physical">("online");
  const [bkQuantity, setBkQuantity] = useState(1);
  const [bkPaid, setBkPaid] = useState(false);
  const [bkNotes, setBkNotes] = useState("");
  const [bkBusy, setBkBusy] = useState(false);
  const [bkWarn, setBkWarn] = useState<string[] | null>(null);
  // An existing private student (website purchase or an earlier hand booking).
  // When one is chosen the lesson goes on their registration and their stored
  // details are used; empty means a new student, as before.
  const [bkStudentId, setBkStudentId] = useState("");
  // "Lecție în plus": same student, but a registration of its own (package used up).
  const [bkExtra, setBkExtra] = useState(false);
  const [bkStudents, setBkStudents] = useState<PrivateStudent[] | null>(null);
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
    return {
      date: `${g("year")}-${g("month")}-${g("day")}`,
      time: `${hh}:${g("minute")}`,
    };
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
    if (
      y === undefined ||
      m === undefined ||
      d === undefined ||
      hh === undefined ||
      mm === undefined
    ) {
      toast({ title: "Data sau ora nu sunt valide", variant: "destructive" });
      return;
    }
    if (
      !Number.isFinite(y) ||
      !Number.isFinite(m) ||
      !Number.isFinite(d) ||
      !Number.isFinite(hh) ||
      !Number.isFinite(mm)
    ) {
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
        sync_pending?: boolean;
        error?: string;
        code?: string;
        clashes?: string[];
        outside_availability?: boolean;
      }>({
        action: "reschedule_booking",
        id: moving.id,
        start_at: startAt,
        force,
      });
      if (error) throw error;
      if (data?.code === "conflict" || data?.code === "outside_availability") {
        setMoveWarn({
          clashes: data.clashes ?? [],
          outside: data.outside_availability === true,
        });
        return;
      }
      if (data?.error) throw new Error(data.error);
      if (data?.success !== true)
        throw new Error(
          "Mutarea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
        );
      toast({
        title: data.sync_pending
          ? "Lecție mutată în admin; sincronizarea Google este în așteptare"
          : "Lecție mutată",
        description: data.sync_pending
          ? "Reîncearcă sincronizarea din Program."
          : "Confirmarea cu ora nouă a fost solicitată prin email.",
        ...(data.sync_pending ? { variant: "destructive" as const } : {}),
      });
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

  const openBooking = () => {
    const now = new Date();
    const f = bucharestFields(
      new Date(now.getTime() + 24 * 3600_000).toISOString(),
    );
    setBkName("");
    setBkEmail("");
    setBkPhone("");
    setBkDate(f.date);
    setBkTime("18:00");
    setBkFormat("online");
    setBkQuantity(1);
    setBkPaid(false);
    setBkNotes("");
    setBkWarn(null);
    setBkStudentId("");
    setBkExtra(false);
    setBooking(true);
    setBkStudents(null);
    void invokeAdmin<{ data?: PrivateStudent[]; error?: string }>({
      action: "private_students",
    })
      .then(({ data }) =>
        setBkStudents(Array.isArray(data?.data) ? data.data : []),
      )
      .catch(() => setBkStudents([]));
  };

  const chooseStudent = (id: string) => {
    setBkStudentId(id);
    setBkWarn(null);
    const s = bkStudents?.find((x) => x.id === id);
    if (!s) return;
    setBkName(s.name ?? "");
    setBkEmail(s.email ?? "");
    setBkPhone(s.phone ?? "");
  };

  const submitBooking = async (force: boolean) => {
    const [y, m, d] = bkDate.split("-").map(Number) as (number | undefined)[];
    const [hh, mm] = bkTime.split(":").map(Number) as (number | undefined)[];
    if (
      y === undefined ||
      m === undefined ||
      d === undefined ||
      hh === undefined ||
      mm === undefined ||
      ![y, m, d, hh, mm].every((n) => Number.isFinite(n))
    ) {
      toast({ title: "Data sau ora nu sunt valide", variant: "destructive" });
      return;
    }
    setBkBusy(true);
    try {
      const startAt = bucharestCivilToUtc(y, m, d, hh, mm).toISOString();
      const { data, error } = await invokeAdmin<{
        success?: boolean;
        sync_pending?: boolean;
        error?: string;
        code?: string;
        clashes?: string[];
      }>({
        action: "book_for_student",
        ...(bkStudentId
          ? {
              registration_id: bkStudentId,
              ...(bkExtra ? { extra: true } : {}),
            }
          : {}),
        student_name: bkName.trim(),
        student_email: bkEmail.trim(),
        student_phone: bkPhone.trim(),
        start_at: startAt,
        format: bkFormat,
        quantity: bkQuantity,
        paid: bkPaid,
        notes: bkNotes.trim() || undefined,
        force,
      });
      if (error) throw error;
      if (data?.code === "conflict") {
        setBkWarn(data.clashes ?? []);
        return;
      }
      if (data?.error) throw new Error(data.error);
      if (data?.success !== true)
        throw new Error(
          "Programarea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
        );
      toast({
        title: data.sync_pending
          ? "Lecție salvată; Google Calendar este în așteptare"
          : "Lecție programată",
        description:
          "Confirmarea prin email a fost solicitată, cu linkul lecției.",
      });
      setBooking(false);
      setBkWarn(null);
      void load(true);
      onChanged?.();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Programarea a eșuat",
        variant: "destructive",
      });
    } finally {
      setBkBusy(false);
    }
  };

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
          <Button size="sm" onClick={openBooking}>
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
                        className="ml-1 inline-flex items-center text-primary"
                        aria-label="Deschide linkul întâlnirii"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {STATUS_LABEL[b.status] ?? b.status}
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
                    {moveWarn.clashes
                      .map((c) => CLASH_LABEL[c] ?? c)
                      .join(" și ")}
                    .
                  </p>
                )}
                {moveWarn.outside && (
                  <p>E în afara orelor tale din Disponibilitate.</p>
                )}
                <p className="font-medium">
                  Poți muta oricum, dacă așa ai stabilit cu cursantul.
                </p>
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
            <Button
              onClick={() => void submitMove(moveWarn !== null)}
              disabled={moveBusy}
            >
              {moveBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {moveWarn ? "Mută oricum" : "Mută lecția"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={booking}
        onOpenChange={(open) => {
          if (!open) {
            setBooking(false);
            setBkWarn(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Programează o lecție privată</DialogTitle>
            <DialogDescription>
              Pentru cineva cu care ai stabilit deja ora. Primește confirmarea
              pe email, cu linkul lecției și cu linkul de reprogramare, iar
              evenimentul intră în Google Calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs" htmlFor="bk-existing-student">
                Cursant existent (opțional)
              </Label>
              <select
                id="bk-existing-student"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={bkStudentId}
                disabled={bkStudents === null}
                onChange={(e) => {
                  if (e.target.value) chooseStudent(e.target.value);
                  else {
                    setBkStudentId("");
                    setBkExtra(false);
                    setBkName("");
                    setBkEmail("");
                    setBkPhone("");
                  }
                }}
              >
                <option value="">
                  {bkStudents === null
                    ? "Se încarcă cursanții…"
                    : "Cursant nou"}
                </option>
                {(bkStudents ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {studentOptionLabel(s)}
                  </option>
                ))}
              </select>
              {bkStudentId && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={bkExtra}
                    onChange={(e) => {
                      setBkExtra(e.target.checked);
                      setBkWarn(null);
                    }}
                  />
                  Lecție în plus (separat de pachetul lui, cu aceleași date)
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                {bkStudentId && bkExtra
                  ? "Se creează o înscriere nouă pentru această lecție, cu datele lui salvate. Pachetul lui rămâne neatins."
                  : bkStudentId
                    ? "Lecția se adaugă la înscrierea lui. Datele de mai jos sunt cele salvate; emailul contului și al plății nu se schimbă."
                    : "Alege un cursant înscris pe site sau programat deja de tine, ca lecția să intre la el, nu ca înscriere nouă."}
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Nume</Label>
              <Input
                className="h-9"
                value={bkName}
                disabled={!!bkStudentId}
                onChange={(e) => setBkName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                className="h-9"
                type="email"
                value={bkEmail}
                disabled={!!bkStudentId}
                onChange={(e) => setBkEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefon (opțional)</Label>
              <Input
                className="h-9"
                value={bkPhone}
                disabled={!!bkStudentId}
                onChange={(e) => setBkPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input
                className="h-9"
                type="date"
                value={bkDate}
                onChange={(e) => {
                  setBkDate(e.target.value);
                  setBkWarn(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ora (ora României)</Label>
              <TimeField
                label="Ora lecției"
                value={bkTime}
                onChange={(hhmm) => {
                  setBkTime(hhmm);
                  setBkWarn(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Format</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={bkFormat}
                onChange={(e) =>
                  setBkFormat(
                    e.target.value === "physical" ? "physical" : "online",
                  )
                }
              >
                <option value="online">Online</option>
                <option value="physical">La centru</option>
              </select>
            </div>
            {(!bkStudentId || bkExtra) && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Câte lecții a luat</Label>
                  <Input
                    className="h-9"
                    type="number"
                    min={1}
                    max={60}
                    value={bkQuantity}
                    onChange={(e) =>
                      setBkQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                  {/* Only the first lesson is booked now. The number is what the
                  package allows, so the rest can be booked later without the
                  quota refusing them. */}
                  <p className="text-[11px] text-muted-foreground">
                    Se programează doar prima. Restul le poți programa mai
                    târziu.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={bkPaid}
                    onChange={(e) => setBkPaid(e.target.checked)}
                  />
                  A plătit deja
                </label>
              </>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Notițe (opțional)</Label>
              <Input
                className="h-9"
                value={bkNotes}
                onChange={(e) => setBkNotes(e.target.value)}
              />
            </div>
          </div>

          {bkWarn && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="space-y-1">
                <p>
                  Ora asta se suprapune cu{" "}
                  {bkWarn.map((c) => CLASH_LABEL[c] ?? c).join(" și ")}.
                </p>
                <p className="font-medium">
                  Poți programa oricum, dacă așa ai stabilit.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setBooking(false);
                setBkWarn(null);
              }}
              disabled={bkBusy}
            >
              Renunță
            </Button>
            <Button
              onClick={() => void submitBooking(bkWarn !== null)}
              disabled={
                bkBusy || bkName.trim().length < 2 || !bkEmail.includes("@")
              }
            >
              {bkBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bkWarn ? "Programează oricum" : "Programează lecția"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default BookingsAdmin;
