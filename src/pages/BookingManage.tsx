import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Download, Loader2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import NativeScheduler from "@/components/NativeScheduler";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const BookingManageInner = () => {
  const { token } = useParams();
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

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
    if (!confirm(t.manageConfirmCancel)) return;
    setBusy(true);
    try {
      const res = await fetch(baseUrl, {
        method: "DELETE",
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? t.manageGenericError);
      toast.success(t.manageCancelledToast);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.manageGenericError);
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
          toast.error(t.manageSlotTaken);
          setPendingSlot(null);
          return;
        }
        throw new Error(json?.error ?? t.manageGenericError);
      }
      toast.success(t.manageRescheduledToast);
      setPendingSlot(null);
      setRescheduleOpen(false);
      navigate(`/booking/manage/${json.manage_token}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.manageGenericError);
    } finally {
      setBusy(false);
    }
  };

  const handleIcs = () => {
    if (!booking) return;
    const manageUrl = `${window.location.origin}/booking/manage/${token}`;
    const ics = buildIcs({
      uid: `${booking.id}@centruldearabalibaneza.com`,
      title: `${t.icsTitlePrefix} — ${lang === "ro" ? booking.event_type_name_ro : booking.event_type_name_en}`,
      description: booking.meet_link
        ? `${t.icsZoomLabel}: ${booking.meet_link}\n${t.icsManageLabel}: ${manageUrl}`
        : `${t.icsManageLabel}: ${manageUrl}`,
      location: booking.meet_link ?? "Raduga Creative Center, Strada Icoanei 80, București",
      startISO: booking.start_at,
      endISO: booking.end_at,
      url: manageUrl,
      organizerEmail: "mohtiibrahim@gmail.com",
      organizerName: "Ibra — Centrul de Arabă Libaneză",
      attendeeEmail: booking.student_email,
      attendeeName: booking.student_name,
    });
    downloadIcs(`lectie-${booking.id}.ics`, ics);
  };

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.navHome}
        </Link>
        <h1 className="text-3xl font-bold mb-6">
          {t.manageHeading}
        </h1>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.manageLoading}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {t.manageNotFound}
          </div>
        )}

        {booking && (
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
                  {booking.format === "online" ? t.bookingFormatOnline : t.bookingFormatPhysical}
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
                {booking.status === "confirmed" && t.manageStatusConfirmed}
                {booking.status === "cancelled" && t.manageStatusCancelled}
                {booking.status === "rescheduled" && t.manageStatusRescheduled}
                {booking.status === "completed" && t.manageStatusCompleted}
              </span>
            </div>

            {booking.format === "online" && booking.status === "confirmed" && (
              <div className="rounded-md bg-muted/40 border border-border p-3">
                <p className="text-xs font-medium mb-1">{t.bookingZoomLinkLabel}</p>
                {booking.meet_link ? (
                  <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline break-all">
                    {booking.meet_link}
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">{t.bookingZoomNotice}</p>
                )}
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleIcs}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                >
                  <Download className="w-4 h-4" />
                  {t.bookingAddToCalendar}
                </button>
                <button
                  onClick={() => setRescheduleOpen(true)}
                  disabled={busy}
                  className="flex-1 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                >
                  {t.manageRescheduleButton}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={busy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5"
                >
                  <X className="w-4 h-4" />
                  {t.manageCancelButton}
                </button>
              </div>
            )}

            {booking.status === "cancelled" && (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t.manageCancelledNotice}
              </p>
            )}
          </div>
        )}

        {booking && (
          <Dialog open={rescheduleOpen} onOpenChange={(o) => { if (!busy) setRescheduleOpen(o); }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.manageRescheduleDialogTitle}</DialogTitle>
                <DialogDescription>{t.bookingRescheduleHelp}</DialogDescription>
              </DialogHeader>
              <NativeScheduler
                eventType={booking.event_type_slug}
                mode="pick"
                currentSlotIso={booking.start_at}
                onPick={(iso) => setPendingSlot(iso)}
              />
            </DialogContent>
          </Dialog>
        )}

        {booking && (
          <AlertDialog open={!!pendingSlot} onOpenChange={(o) => { if (!o && !busy) setPendingSlot(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.manageRescheduleConfirmTitle}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t.manageRescheduleFromLabel}:</span>{" "}
                      <span className="font-medium text-foreground line-through">{fmt(booking.start_at, lang)}</span>
                    </div>
                    {pendingSlot && (
                      <div>
                        <span className="text-muted-foreground">{t.manageRescheduleToLabel}:</span>{" "}
                        <span className="font-semibold text-foreground">{fmt(pendingSlot, lang)}</span>
                      </div>
                    )}
                    <p className="pt-2">{t.manageRescheduleConfirmQuestion}</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>{t.manageCancelButton}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={busy}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pendingSlot) handleReschedule(pendingSlot);
                  }}
                >
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t.manageConfirmCta}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </main>
  );
};

const BookingManage = () => <BookingManageInner />;

export default BookingManage;