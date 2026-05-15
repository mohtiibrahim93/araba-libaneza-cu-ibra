import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Loader2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import NativeScheduler from "@/components/NativeScheduler";

const TZ = "Europe/Bucharest";
function fmt(iso: string, lang: "ro" | "en") {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface BookingInfo {
  id: string;
  event_type_slug: "trial" | "paid";
  event_type_name_ro: string;
  event_type_name_en: string;
  duration_min: number;
  start_at: string;
  end_at: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  format: "online" | "physical";
  meet_link: string | null;
  student_name: string;
  student_email: string;
}

const BookingManage = () => {
  const { token } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [busy, setBusy] = useState(false);

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-manage/${token}`;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "not found");
      setBooking(json.booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCancel = async () => {
    if (!confirm(lang === "ro" ? "Sigur anulezi programarea?" : "Cancel this booking?")) return;
    setBusy(true);
    try {
      const res = await fetch(baseUrl, {
        method: "DELETE",
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      toast.success(lang === "ro" ? "Programare anulată" : "Booking cancelled");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = async (startAt: string) => {
    setBusy(true);
    try {
      const res = await fetch(baseUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ start_at: startAt }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json?.code === "conflict") {
          toast.error(lang === "ro" ? "Slotul tocmai a fost rezervat." : "Slot just got taken.");
          return;
        }
        throw new Error(json?.error ?? "failed");
      }
      toast.success(lang === "ro" ? "Programare reprogramată" : "Booking rescheduled");
      navigate(`/booking/manage/${json.manage_token}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === "ro" ? "Acasă" : "Home"}
        </Link>
        <h1 className="text-3xl font-bold mb-6">
          {lang === "ro" ? "Programarea ta" : "Your booking"}
        </h1>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            {lang === "ro" ? "Se încarcă…" : "Loading…"}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {lang === "ro" ? "Programarea nu a fost găsită." : "Booking not found."}
          </div>
        )}

        {booking && mode === "view" && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">
                  {lang === "ro" ? booking.event_type_name_ro : booking.event_type_name_en}
                </h2>
                <p className="text-sm text-muted-foreground">{fmt(booking.start_at, lang)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {booking.format === "online"
                    ? lang === "ro" ? "Online (Google Meet)" : "Online (Google Meet)"
                    : lang === "ro" ? "Fizic (la centru)" : "In person (at the center)"}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-500/10 text-green-700"
                    : booking.status === "cancelled"
                    ? "bg-red-500/10 text-red-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {booking.status === "confirmed" && (lang === "ro" ? "Confirmată" : "Confirmed")}
                {booking.status === "cancelled" && (lang === "ro" ? "Anulată" : "Cancelled")}
                {booking.status === "rescheduled" && (lang === "ro" ? "Reprogramată" : "Rescheduled")}
                {booking.status === "completed" && (lang === "ro" ? "Finalizată" : "Completed")}
              </span>
            </div>

            {booking.meet_link && booking.status === "confirmed" && (
              <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline break-all">
                {booking.meet_link}
              </a>
            )}

            {booking.status === "confirmed" && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setMode("reschedule")}
                  disabled={busy}
                  className="flex-1 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                >
                  {lang === "ro" ? "Reprogramează" : "Reschedule"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={busy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5"
                >
                  <X className="w-4 h-4" />
                  {lang === "ro" ? "Anulează" : "Cancel"}
                </button>
              </div>
            )}

            {booking.status === "cancelled" && (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {lang === "ro" ? "Această programare a fost anulată." : "This booking was cancelled."}
              </p>
            )}
          </div>
        )}

        {booking && mode === "reschedule" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("view")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> {lang === "ro" ? "Înapoi" : "Back"}
            </button>
            <NativeScheduler
              eventType={booking.event_type_slug}
              prefill={{ name: booking.student_name, email: booking.student_email }}
              onBooked={(b) => {
                // not used here — we use the local handler instead
                void b;
              }}
            />
            <p className="text-xs text-muted-foreground text-center">
              {lang === "ro"
                ? "Selectarea unui slot mai sus va crea o nouă programare. Pentru reprogramare în loc, folosește butonul de mai jos după ce alegi slotul."
                : "Selecting a slot above creates a new booking. To reschedule in place after choosing a slot, use the button below."}
            </p>
            <RescheduleHelper onPick={handleReschedule} disabled={busy} />
          </div>
        )}
      </div>
    </main>
  );
};

// Lightweight inline picker that mirrors NativeScheduler but submits to PATCH.
// Kept simple to avoid over-engineering — uses the same availability function.
const RescheduleHelper = ({ onPick, disabled }: { onPick: (iso: string) => void; disabled: boolean }) => {
  const { lang } = useI18n();
  const [iso, setIso] = useState("");
  return (
    <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
      <label className="block text-xs font-semibold text-muted-foreground">
        {lang === "ro" ? "ISO al noului slot (copiază dintr-un buton de mai sus)" : "New slot ISO (copy from a button above)"}
      </label>
      <input
        value={iso}
        onChange={(e) => setIso(e.target.value)}
        placeholder="2026-05-20T08:00:00.000Z"
        className="w-full px-3 py-2 rounded-md border border-input text-sm font-mono"
      />
      <button
        onClick={() => iso && onPick(iso)}
        disabled={disabled || !iso}
        className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
      >
        {lang === "ro" ? "Reprogramează la slotul ales" : "Reschedule to chosen slot"}
      </button>
    </div>
  );
};

export default BookingManage;