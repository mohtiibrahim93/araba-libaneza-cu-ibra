import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, MessageCircle, ArrowLeft, CheckCircle2, Download, Home, CreditCard, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import GdprCheckbox from "@/components/GdprCheckbox";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { ro as roLocale, enGB as enLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import LocalTimezoneToggle from "@/components/LocalTimezoneToggle";
import { getLocalTz, shortTzLabel, useShowLocalTz } from "@/lib/timezone";
import { ONLINE_PRICES, formatLei, priceFor } from "@/lib/pricing";

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
  onBooked?: (b: { booking_id: string; manage_token: string; meet_link?: string | null | undefined }) => void;
  /**
   * "create" (default) shows the full booking form and creates a new booking.
   * "pick" simply calls onPick(iso) after the user selects a slot — used in the
   * reschedule flow where we PATCH an existing booking instead of creating one.
   */
  mode?: "create" | "pick";
  onPick?: (iso: string) => void;
  /**
   * In "pick" mode, the ISO of the currently booked slot. It is highlighted in
   * the grid and always selectable even if it's outside the returned
   * availability (since the slot is "taken" by the user themselves).
   */
  currentSlotIso?: string;
  /**
   * Required in "create" mode. Every booking must reference the registration
   * that produced it; bookings without one are rejected by the backend.
   *
   * A caller that wants to show the slots *before* asking for anything can
   * leave this out and pass `ensureRegistration` instead.
   */
  registrationId?: string;
  /**
   * Creates the registration on demand, from the details this component just
   * collected, and returns its id.
   *
   * /trial used to ask for name, email and phone on its own screen purely to
   * have a registration row before the grid could be shown — so a visitor gave
   * their details before seeing whether any time suited them, and then gave
   * them again in the confirm form below. This lets the page put the grid
   * first and create the row at the moment of booking instead. The backend
   * contract is unchanged: booking-create still receives a registration_id.
   */
  ensureRegistration?: (details: {
    name: string;
    email: string;
    phone: string;
  }) => Promise<string | null>;
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
  const [y = 1970, m = 1, d = 1] = dateKey.split("-").map(Number);
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
  ensureRegistration,
  currentSlotIso,
  registrationId,
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
    meet_link?: string | null | undefined;
    manage_token: string;
    end_at?: string | undefined;
    booking_id?: string | undefined;
  } | null>(null);
  // Trial-only: the server rejects a second free trial for the same email.
  const [trialUsed, setTrialUsed] = useState(false);
  // Trial-only: redirect state for the 0-lei card-on-file confirmation step.
  const [savingCard, setSavingCard] = useState(false);
  // The registration this booking ended up attached to. On /trial the row is
  // created at confirm time, so without keeping it here the card-confirmation
  // step never rendered (the prop is undefined for a fresh visitor).
  const [bookedRegistrationId, setBookedRegistrationId] = useState<string | null>(null);


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
          `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/booking-availability` +
          `?event_type=${eventType}&date_from=${dateRange.from}&date_to=${dateRange.to}` +
          `&format=${format}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] },
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
    // `format` is in here on purpose: an in-person trial is offered at
    // weekends only, so switching format changes which slots exist.
    [eventType, dateRange.from, dateRange.to, format, t.schedulerSlotTaken],
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Periodic refresh of slot availability (every 30s). We intentionally do NOT
  // subscribe to the `bookings` table via Realtime because rows contain PII
  // (student email/phone, manage_token, meet_link) that must not be broadcast
  // to anon/authenticated subscribers.
  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadAvailability({ silent: true });
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadAvailability]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    if (mode === "create" && !registrationId && !ensureRegistration) {
      toast.error(t.schedulerBookingFailed);
      return;
    }
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
      // Either the caller already had a registration, or it makes one now from
      // what was just typed. Never both, and never a booking without one.
      const resolvedRegistrationId =
        registrationId ??
        (await ensureRegistration?.({ name: name.trim(), email: email.trim(), phone: phone.trim() })) ??
        null;
      if (mode === "create" && !resolvedRegistrationId) {
        toast.error(t.schedulerBookingFailed);
        setSubmitting(false);
        return;
      }
      const res = await supabase.functions.invoke("booking-create", {
        body: {
          registration_id: resolvedRegistrationId,
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
      if (res.error) {
        // Non-2xx responses arrive as a FunctionsHttpError with the original
        // Response on .context — pull the JSON body out so the structured
        // codes (conflict / trial_used) survive instead of degrading to a
        // generic failure toast.
        const ctx = (res.error as { context?: Response }).context;
        let errPayload: { code?: string; error?: string } | null = null;
        if (ctx && typeof ctx.json === "function") {
          try {
            errPayload = await ctx.json();
          } catch {
            errPayload = null;
          }
        }
        if (errPayload?.code === "conflict") {
          toast.error(t.schedulerSlotTaken);
          setSelectedSlot(null);
          await loadAvailability();
          return;
        }
        if (errPayload?.code === "trial_used") {
          setTrialUsed(true);
          return;
        }
        throw new Error(errPayload?.error ?? t.schedulerBookingFailed);
      }
      const payload = res.data as { ok: boolean; booking_id: string; manage_token: string; meet_link?: string | null; start_at: string; end_at?: string; code?: string; error?: string };
      if (!payload?.ok) {
        if (payload?.code === "conflict") {
          toast.error(t.schedulerSlotTaken);
          setSelectedSlot(null);
          await loadAvailability();
          return;
        }
        if (payload?.code === "trial_used") {
          setTrialUsed(true);
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

  // Trial-only 0-lei card confirmation: opens a Stripe setup-mode page that
  // saves the card without charging (commitment step against no-shows).
  const startCardConfirmation = async () => {
    if (!registrationId) return;
    setSavingCard(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout-session", {
        body: { registrationId, setup: true },
      });
      if (fnError) throw fnError;
      if (!data?.url) throw new Error("missing url");
      window.location.href = data.url;
    } catch (e) {
      console.error("[scheduler] card confirmation failed", e);
      toast.error(
        lang === "ro"
          ? "Nu am putut deschide pagina Stripe. Locul tău rămâne rezervat."
          : "Could not open the Stripe page. Your spot is still reserved.",
      );
      setSavingCard(false);
    }
  };

  if (trialUsed) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 space-y-4">
        <h3 className="font-bold text-foreground">
          {lang === "ro" ? "Proba gratuită a fost deja folosită" : "The free trial was already used"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {lang === "ro"
            ? "Emailul tău are deja o probă gratuită programată sau ținută — proba e doar pentru prima lecție. Poți continua direct cu lecții plătite (150 lei/lecție) sau scrie-ne pe WhatsApp dacă crezi că e o greșeală."
            : "Your email already has a scheduled or completed free trial — the trial is for the first lesson only. You can continue with paid lessons (150 lei/lesson), or message us on WhatsApp if you think this is a mistake."}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            <Link
              to={`/booking?type=paid${registrationId ? `&registration_id=${encodeURIComponent(registrationId)}` : ""}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {lang === "ro" ? "Programează o lecție plătită" : "Book a paid lesson"}
            </Link>
          </Button>
          {registrationId && (
            <Button asChild variant="outline" className="flex-1">
              <Link
                to={`/checkout?courseType=private&registrationId=${encodeURIComponent(registrationId)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {lang === "ro" ? "Plătește lecția" : "Pay for the lesson"}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1">
            <a href={WHATSAPP_FALLBACK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

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
        location: confirmed.meet_link ?? "Raduga Creative Center, Strada Icoanei 80, București",
        startISO: confirmed.start_at,
        endISO: endIso,
        url: manageUrl,
        organizerEmail: "marhaba@centruldearabalibaneza.com",
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
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6 shadow-xs">
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
          {showLocalTz && localTz !== TZ && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.tzYourTime} ({localTzLabel})</span>
              <span className="font-medium text-right">{fmtTimeInTz(confirmed.start_at, localTz)}</span>
            </div>
          )}
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

        {/* Free trial: 0-lei card-on-file confirmation. Saves the card via a
            Stripe setup session — nothing is charged — to firm up the spot. */}
        {eventType === "trial" && registrationId && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-left space-y-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ro"
                    ? "Ultimul pas: confirmă-ți locul cu cardul — 0 lei"
                    : "Last step: confirm your spot with your card — 0 lei"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ro"
                    ? "Nu încasăm absolut nimic — cardul se salvează în siguranță la Stripe doar ca să confirmi serios locul. Nicio plată nu se face vreodată fără acordul tău."
                    : "We charge absolutely nothing — the card is stored securely with Stripe only to firmly confirm your spot. No payment is ever made without your approval."}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === "ro"
                    ? "Anularea sau reprogramarea e gratuită dacă o faci cu cel puțin 24 de ore înainte de lecție — folosește linkul din emailul de confirmare."
                    : "Cancelling or rescheduling is free as long as you do it at least 24 hours before the lesson — use the link in your confirmation email."}
                </p>
              </div>
            </div>
            <Button onClick={startCardConfirmation} disabled={savingCard} className="w-full">
              {savingCard ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {lang === "ro" ? "Confirmă locul (0 lei)" : "Confirm my spot (0 lei)"}
            </Button>
          </div>
        )}

        {/* Paid private lesson: the slot is held, payment is the final step.
            Sends the visitor to the existing Stripe checkout page. */}
        {eventType === "paid" && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-left space-y-3">
            <div className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ro"
                    ? `Ultimul pas: plătește lecția — ${formatLei(priceFor(ONLINE_PRICES.privateLesson, format === "physical" ? "fizic" : "online"))} lei`
                    : `Last step: pay for the lesson — ${formatLei(priceFor(ONLINE_PRICES.privateLesson, format === "physical" ? "fizic" : "online"))} lei`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ro"
                    ? "Intervalul tău este rezervat. Plata se face securizat prin Stripe (card, Apple Pay sau Google Pay) și îți confirmă definitiv lecția."
                    : "Your time slot is reserved. Payment is handled securely by Stripe (card, Apple Pay or Google Pay) and confirms the lesson for good."}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === "ro"
                    ? "Anularea sau reprogramarea e gratuită cu cel puțin 24 de ore înainte de lecție."
                    : "Cancelling or rescheduling is free at least 24 hours before the lesson."}
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link
                to={`/checkout?courseType=private${registrationId ? `&registrationId=${encodeURIComponent(registrationId)}` : ""}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {lang === "ro" ? "Plătește lecția" : "Pay for the lesson"}
              </Link>
            </Button>
          </div>
        )}


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
  // Merge the current (own) slot into availability so the user can see it
  // highlighted even if it's outside the standard availability window.
  const slotsByDate: Record<string, string[]> = { ...data.slots_by_date };
  if (currentSlotIso) {
    const key = localDateKey(new Date(currentSlotIso));
    const list = slotsByDate[key] ? [...slotsByDate[key]] : [];
    if (!list.includes(currentSlotIso)) list.push(currentSlotIso);
    list.sort();
    slotsByDate[key] = list;
  }
  const mergedDateKeys = Object.keys(slotsByDate).sort();
  const slotsForDate = selectedDate ? slotsByDate[selectedDate] ?? [] : [];
  const availableDateSet = new Set(mergedDateKeys);
  const availableDates = mergedDateKeys.map((k) => {
    const [y = 1970, m = 1, d = 1] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const selectedDateObj = selectedDate
    ? (() => {
        const [y = 1970, m = 1, d = 1] = selectedDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;
  const minDate = availableDates[0];
  const maxDate = availableDates[availableDates.length - 1];

  if (mergedDateKeys.length === 0) {
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
          {eventType === "trial" && format === "physical" && (
            // Without this the weekday slots simply disappear when you switch,
            // which reads as a bug rather than a rule.
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {t.schedulerPhysicalTrialWeekend}
            </p>
          )}
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
            {...(selectedDateObj !== undefined ? { selected: selectedDateObj } : {})}
            onSelect={(d) => {
              if (d) setSelectedDate(localDateKey(d));
            }}
            {...((selectedDateObj ?? minDate) !== undefined ? { defaultMonth: (selectedDateObj ?? minDate) as Date } : {})}
            {...(minDate !== undefined ? { fromDate: minDate } : {})}
            {...(maxDate !== undefined ? { toDate: maxDate } : {})}
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
          {/* Weekday evenings offer only a handful of slots while weekend days
              run all day. Someone who lands on a weekday sees three times,
              decides nothing fits and leaves — without ever discovering the
              open days. Point at the roomiest day in range instead of letting
              them find it by chance. Derived from the fetched availability, so
              it stays correct when the schedule changes. */}
          {(() => {
            if (!selectedDate || slotsForDate.length > 4) return null;
            const best = mergedDateKeys
              .filter((k) => k !== selectedDate)
              .map((k) => ({ k, n: slotsByDate[k]?.length ?? 0 }))
              .sort((a, b) => b.n - a.n)[0];
            if (!best || best.n < 6 || best.n < slotsForDate.length * 2) return null;
            return (
              <button
                type="button"
                onClick={() => setSelectedDate(best.k)}
                className="w-full text-left rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
              >
                {lang === "en" ? (
                  <>
                    Not many times here. <strong>{fmtDayHeader(best.k, lang)}</strong> has{" "}
                    <strong>{best.n} slots</strong> across the day — tap to see them.
                  </>
                ) : (
                  <>
                    Puține intervale aici. <strong>{fmtDayHeader(best.k, lang)}</strong> are{" "}
                    <strong>{best.n} intervale</strong> pe parcursul zilei — apasă ca să le vezi.
                  </>
                )}
              </button>
            );
          })()}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slotsForDate.map((iso) => {
              const isCurrent = currentSlotIso === iso;
              return (
                <button
                  key={iso}
                  onClick={() => {
                    if (isCurrent) return;
                    if (mode === "pick") {
                      onPick?.(iso);
                    } else {
                      setSelectedSlot(iso);
                    }
                  }}
                  disabled={isCurrent}
                  title={isCurrent ? t.manageCurrentSlotBadge : undefined}
                  className={cn(
                    // min-h-11 (44px) is the comfortable touch target on a
                    // phone; the previous 36px height made mis-taps likely in
                    // this dense grid. Desktop keeps the tighter look at sm:.
                    "px-2 py-2 min-h-11 sm:min-h-0 justify-center rounded-md border text-sm font-medium transition-colors flex flex-col items-center leading-tight",
                    isCurrent
                      ? "border-amber-500 bg-amber-50 text-amber-900 cursor-not-allowed"
                      : "border-border hover:border-primary hover:bg-primary/5",
                  )}
                >
                  <span>{fmtSlotTime(iso)}</span>
                  {showLocalTz && localTz !== TZ && (
                    <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                      {fmtTimeInTz(iso, localTz)}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] uppercase tracking-wide mt-0.5 text-amber-700">
                      {t.manageCurrentSlotBadge}
                    </span>
                  )}
                </button>
              );
            })}
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