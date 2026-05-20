import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, MessageCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

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
}: Props) => {
  const { t, lang } = useI18n();

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
  } | null>(null);

  // Form fields
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [format, setFormat] = useState<Format>(defaultFormat);
  const [notes, setNotes] = useState("");

  const dateRange = useMemo(() => {
    const today = new Date();
    const from = localDateKey(today);
    const toDate = new Date(today.getTime() + 30 * 86400000);
    const to = localDateKey(toDate);
    return { from, to };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
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
        if (cancelled) return;
        setData(json);
        const firstDate = Object.keys(json.slots_by_date ?? {}).sort()[0] ?? null;
        setSelectedDate(firstDate);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventType, dateRange.from, dateRange.to]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    if (!name.trim() || !email.trim()) {
      toast.error(lang === "ro" ? "Completează numele și emailul" : "Fill in name and email");
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
        },
      });
      if (res.error) throw res.error;
      const payload = res.data as { ok: boolean; booking_id: string; manage_token: string; meet_link?: string | null; start_at: string; code?: string; error?: string };
      if (!payload?.ok) {
        if (payload?.code === "conflict") {
          toast.error(lang === "ro" ? "Slotul tocmai a fost rezervat. Alege altul." : "Slot just got taken. Pick another.");
          // refresh
          setSelectedSlot(null);
          setLoading(true);
          const url =
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-availability` +
            `?event_type=${eventType}&date_from=${dateRange.from}&date_to=${dateRange.to}`;
          const r = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
          const j = await r.json();
          setData(j);
          setLoading(false);
          return;
        }
        throw new Error(payload?.error ?? "booking failed");
      }
      setConfirmed({ start_at: payload.start_at, meet_link: payload.meet_link ?? null, manage_token: payload.manage_token });
      onBooked?.({ booking_id: payload.booking_id, manage_token: payload.manage_token, meet_link: payload.meet_link });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-lg border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          {lang === "ro" ? "Se încarcă sloturile…" : "Loading slots…"}
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
    return (
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">
              {lang === "ro" ? "Programarea a fost confirmată" : "Booking confirmed"}
            </h3>
            <p className="text-sm text-muted-foreground">{fmtFullLocal(confirmed.start_at, lang)}</p>
          </div>
        </div>
        {confirmed.meet_link && (
          <a
            href={confirmed.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary underline break-all"
          >
            {confirmed.meet_link}
          </a>
        )}
        <p className="text-xs text-muted-foreground">
          {lang === "ro"
            ? "Vei primi un email cu detaliile. Poți reprograma sau anula de aici:"
            : "You'll get an email with details. Manage or cancel here:"}{" "}
          <a href={manageUrl} className="text-primary underline">
            {lang === "ro" ? "deschide pagina" : "open page"}
          </a>
        </p>
      </div>
    );
  }

  const dateKeys = Object.keys(data.slots_by_date).sort();
  const slotsForDate = selectedDate ? data.slots_by_date[selectedDate] ?? [] : [];

  if (dateKeys.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8 px-4 rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground max-w-md">
          {lang === "ro"
            ? "Nu sunt sloturi disponibile în următoarele 30 de zile. Scrie-ne pe WhatsApp."
            : "No available slots in the next 30 days. Message us on WhatsApp."}
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
  if (selectedSlot) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <button
          onClick={() => setSelectedSlot(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "ro" ? "Înapoi la sloturi" : "Back to slots"}
        </button>
        <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
          <span className="font-semibold">{fmtFullLocal(selectedSlot, lang)}</span>
          <span className="text-muted-foreground"> · {data.event_type.duration_min} min</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "ro" ? "Nume complet" : "Full name"}
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
            placeholder={lang === "ro" ? "Telefon (opțional)" : "Phone (optional)"}
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full px-3 py-2 rounded-md border border-input text-sm bg-background"
          >
            <option value="online">{lang === "ro" ? "Online (Zoom)" : "Online (Zoom)"}</option>
            <option value="physical">{lang === "ro" ? "Fizic (la centru)" : "In person (at the center)"}</option>
          </select>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={lang === "ro" ? "Note (opțional)" : "Notes (optional)"}
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-input text-sm resize-none"
        />
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {lang === "ro" ? "Confirmă programarea" : "Confirm booking"}
        </button>
      </div>
    );
  }

  // Day picker + slots
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {lang === "ro" ? "Alege o zi" : "Pick a day"}
        </h3>
        <span className="text-xs text-muted-foreground">{TZ}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {dateKeys.map((k) => {
          const active = k === selectedDate;
          const count = data.slots_by_date[k]?.length ?? 0;
          return (
            <button
              key={k}
              onClick={() => setSelectedDate(k)}
              className={`shrink-0 px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div>{fmtDayHeader(k, lang)}</div>
              <div className={`mt-0.5 text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {count} {lang === "ro" ? "sloturi" : "slots"}
              </div>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slotsForDate.map((iso) => (
          <button
            key={iso}
            onClick={() => setSelectedSlot(iso)}
            className="px-2 py-2 rounded-md border border-border text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {fmtSlotTime(iso)}
          </button>
        ))}
      </div>
      {slotsForDate.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {lang === "ro" ? "Nicio oră disponibilă în această zi." : "No times available this day."}
        </p>
      )}
    </div>
  );
};

export default NativeScheduler;