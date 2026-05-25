import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, MessageCircle, ArrowLeft, CheckCircle2, Download, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import GdprCheckbox from "@/components/GdprCheckbox";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { ro as roLocale, enGB as enLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import LocalTimezoneToggle from "@/components/LocalTimezoneToggle";
import { getLocalTz, shortTzLabel, useShowLocalTz } from "@/lib/timezone";

const TZ = "Europe/Bucharest";
const WHATSAPP_FALLBACK =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Vreau să rezerv o lecție.");

type EventType = "trial" | "paid";
type Format = "online" | "physical";

interface Props {
  eventType?: EventType;
  prefill?: { name?: string; email?: string; phone?: string };
  defaultFormat?: Format;
  onBooked?: (b: { booking_id: string; manage_token: string; meet_link?: string | null }) => void;
  /**
   * "create" (default) shows the full booking form and creates a new booking.
   * "pick" simply calls onPick(iso) after the user selects a slot — used in the
   * reschedule flow where we PATCH an existing booking instead of creating one.
   */
  mode?: "create" | "pick";
  onPick?: (iso: string) => void;
}

interface AvailabilityResp {
  event_type: { name_ro: string; name_en: string; duration_min: number };
  slots: string[];
  slots_by_date: Record<string, string[]>;
}

function localDateKey(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(d); // YYYY-MM-DD
}
function fmtSlotTime(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function fmtTimeInTz(iso: string, tz: string) {
  return new Intl.DateTimeFormat("ro-RO", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function fmtFullLocal(iso: string, lang: "ro" | "en") {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
function fmtFullInTz(iso: string, lang: "ro" | "en", tz: string) {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
function fmtDayHeader(dateKey: string, lang: "ro" | "en") {
  // dateKey YYYY-MM-DD interpreted as local date
  const [y, m, d] = dateKey.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(probe);
}

const NativeScheduler = ({
  eventType = "trial",
  prefill,
  defaultFormat = "online",
  onBooked,
  mode = "create",
  onPick,
}: Props) => {
  const { t, lang } = useI18n();
  const showLocalTz = useShowLocalTz();
  const localTz = useMemo(() => getLocalTz(), []);
  const localTzLabel = useMemo(() => shortTzLabel(localTz), [localTz]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityResp | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    start_at: string;
    meet_link?: string | null;
    manage_token: string;
    end_at?: string;
    booking_id?: string;
  } | null>(null);

  // Form fields
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [format, setFormat] = useState<Format>(defaultFormat);
  const [notes, setNotes] = useState("");
  const [gdpr, setGdpr] = useState(false);

  const dateRange = useMemo(() => {
    const today = new Date();
    const from = localDateKey(today);
    const toDate = new Date(today.getTime() + 30 * 86400000);
    const to = localDateKey(toDate);
    return { from, to };
  }, []);

  const selectedSlotRef = useRef<string | null>(null);
  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  const loadAvailability = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const url =
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-availability` +
          `?event_type=${eventType}&date_from=${dateRange.from}&date_to=${dateRange.to}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "load failed");
        setData((prev) => {
          // Detect a selected slot that just got taken
          const stillAvailable: boolean =
            !selectedSlotRef.current || (json.slots ?? []).includes(selectedSlotRef.current);
          if (prev && !stillAvailable && selectedSlotRef.current) {
            toast.info(t.schedulerSlotTaken);
            setSelectedSlot(null);
          }
          return json;
        });
        setSelectedDate((prev) => {
          if (prev && (json.slots_by_date?.[prev]?.length ?? 0) > 0) return prev;
          return Object.keys(json.slots_by_date ?? {}).sort()[0] ?? null;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [eventType, dateRange.from, dateRange.to, t.schedulerSlotTaken],
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Real-time: refresh slots when any booking changes (new bookings, cancellations).
  useEffect(() => {
    if (mode !== "create") return;
    const channel = supabase
      .channel(`booking-availability-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void loadAvailability({ silent: true });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, loadAvailability]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    if (!name.trim() || !email.trim()) {
      toast.error(t.schedulerNameRequired);
      return;
    }
    if (!gdpr) {
      toast.error(t.bookingGdprRequired);
      return;
    }
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("booking-create", {
        body: {
          event_type: eventType,
          start_at: selectedSlot,
          format,
          student_name: name.trim(),
          student_email: email.trim(),
          student_phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
          language: lang,
          gdpr_consent: true,
        },
      });
      if (res.error) throw res.error;
      const payload = res.data as { ok: boolean; booking_id: string; manage_token: string; meet_link?: string | null; start_at: string; end_at?: string; code?: string; error?: string };
      if (!payload?.ok) {
        if (payload?.code === "conflict") {
          toast.error(t.schedulerSlotTaken);
          setSelectedSlot(null);
          await loadAvailability();
          return;
        }
        throw new Error(payload?.error ?? t.schedulerBookingFailed);
      }
      setConfirmed({
        start_at: payload.start_at,
        end_at: payload.end_at,
        meet_link: payload.meet_link ?? null,
        manage_token: payload.manage_token,
        booking_id: payload.booking_id,
      });
      onBooked?.({ booking_id: payload.booking_id, manage_token: payload.manage_token, meet_link: payload.meet_link });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.schedulerBookingFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-lg border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          {t.schedulerLoadingSlots}
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6 px-4 rounded-lg border border-dashed border-border bg-muted/30">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground max-w-md">{t.bookingPlaceholder}</p>
        <a
          href={WHATSAPP_FALLBACK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    );
  }

  if (confirmed) {
    const manageUrl = `${window.location.origin}/booking/manage/${confirmed.manage_token}`;
    const handleIcs = () => {
      const endIso =
        confirmed.end_at ??
        new Date(new Date(confirmed.start_at).getTime() + (data?.event_type.duration_min ?? 60) * 60000).toISOString();
      const ics = buildIcs({
        uid: `${confirmed.booking_id ?? confirmed.manage_token}@centruldearabalibaneza.com`,
        title: `${t.icsTitlePrefix} — ${(lang === "ro" ? data?.event_type.name_ro : data?.event_type.name_en) ?? ""}`,
        description: confirmed.meet_link
          ? `${t.icsZoomLabel}: ${confirmed.meet_link}\n${t.icsManageLabel}: ${manageUrl}`
          : `${t.icsManageLabel}: ${manageUrl}`,
        location: confirmed.meet_link ?? "Raduga Creative Center, București",
        startISO: confirmed.start_at,
        endISO: endIso,
        url: manageUrl,
        organizerEmail: "mohtiibrahim@gmail.com",
        organizerName: "Ibra — Centrul de Arabă Libaneză",
        attendeeEmail: email || undefined,
        attendeeName: name || undefined,
      });
      downloadIcs(`lectie-${confirmed.booking_id ?? "araba"}.ics`, ics);
    };
    const courseName = lang === "ro" ? data.event_type.name_ro : data.event_type.name_en;
    const formatLabel = format === "online" ? t.bookingFormatOnline : t.bookingFormatPhysical;
    const startDate = new Date(confirmed.start_at);
    const dateStr = new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
      timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(startDate);
    const timeStr = new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
      timeZone: TZ, hour: "2-digit", minute: "2-digit",
    }).format(startDate);
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={2.5} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            {t.confirmedHeading}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.confirmedEmailNote}
          </p>
        </div>

        <div className="rounded-lg bg-muted/40 border border-border p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedDateLabel}</span>
            <span className="font-medium text-right">{dateStr}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedTimeLabel}</span>
            <span className="font-medium text-right">{timeStr}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedCourseLabel}</span>
            <span className="font-medium text-right">{courseName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedFormatLabel}</span>
            <span className="font-medium text-right">{formatLabel}</span>
          </div>
          {format === "online" && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{t.bookingZoomNotice}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleIcs} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {t.bookingAddToCalendar}
          </Button>
          <Button asChild className="flex-1">
            <a href={manageUrl}>{t.bookingManageButton}</a>
          </Button>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          {t.confirmedBackHome}
        </Link>
      </div>
    );
  }

  const dateKeys = Object.keys(data.slots_by_date).sort();
  const slotsForDate = selectedDate ? data.slots_by_date[selectedDate] ?? [] : [];
  const availableDateSet = new Set(dateKeys);
  const availableDates = dateKeys.map((k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const selectedDateObj = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;
  const minDate = availableDates[0];
  const maxDate = availableDates[availableDates.length - 1];

  if (dateKeys.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8 px-4 rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground max-w-md">
          {t.schedulerNoSlots30d}
        </p>
        <a
          href={WHATSAPP_FALLBACK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    );
  }

  // Confirm form
  if (selectedSlot && mode === "create") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <button
          onClick={() => setSelectedSlot(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.schedulerBackToSlots}
        </button>
        <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
          <span className="font-semibold">{fmtFullLocal(selectedSlot, lang)}</span>
          <span className="text-muted-foreground"> · {data.event_type.duration_min} min</span>
          {showLocalTz && localTz !== TZ && (
            <div className="mt-1 text-xs text-muted-foreground">
              {t.tzYourTime} ({localTzLabel}): <span className="font-medium text-foreground">{fmtFullInTz(selectedSlot, lang, localTz)}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.schedulerNamePlaceholder}
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@…"
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.schedulerPhonePlaceholder}
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full px-3 py-2 rounded-md border border-input text-sm bg-background"
          >
            <option value="online">{t.bookingFormatOnline}</option>
            <option value="physical">{t.bookingFormatPhysical}</option>
          </select>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.schedulerNotesPlaceholder}
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-input text-sm resize-none"
        />
        <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
        <button
          onClick={handleConfirm}
          disabled={submitting || !gdpr}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.schedulerConfirmButton}
        </button>
      </div>
    );
  }

  // Day picker + slots
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {t.schedulerPickDay}
        </h3>
        <span className="text-xs text-muted-foreground">{TZ}</span>
      </div>
      <LocalTimezoneToggle />
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
        <div className="flex justify-center md:justify-start">
          <CalendarPicker
            mode="single"
            selected={selectedDateObj}
            onSelect={(d) => {
              if (d) setSelectedDate(localDateKey(d));
            }}
            defaultMonth={selectedDateObj ?? minDate}
            fromDate={minDate}
            toDate={maxDate}
            disabled={(date) => !availableDateSet.has(localDateKey(date))}
            modifiers={{ available: availableDates }}
            modifiersClassNames={{
              available:
                "font-semibold text-primary after:content-[''] after:block after:w-1 after:h-1 after:rounded-full after:bg-primary after:mx-auto after:mt-0.5",
            }}
            locale={lang === "ro" ? roLocale : enLocale}
            weekStartsOn={1}
            className={cn("p-3 pointer-events-auto rounded-md border border-border")}
          />
        </div>
        <div className="space-y-3">
          {selectedDate && (
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {fmtDayHeader(selectedDate, lang)}
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slotsForDate.map((iso) => (
              <button
                key={iso}
                onClick={() => {
                  if (mode === "pick") {
                    onPick?.(iso);
                  } else {
                    setSelectedSlot(iso);
                  }
                }}
                className="px-2 py-2 rounded-md border border-border text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center leading-tight"
              >
                <span>{fmtSlotTime(iso)}</span>
                {showLocalTz && localTz !== TZ && (
                  <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    {fmtTimeInTz(iso, localTz)}
                  </span>
                )}
              </button>
            ))}
          </div>
          {slotsForDate.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.schedulerNoTimesToday}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NativeScheduler;