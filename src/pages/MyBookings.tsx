import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { Calendar, Clock, Loader2, Mail, MapPin, RefreshCw, Video, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Lang = "ro" | "en";
type BookingStatus = "confirmed" | "cancelled" | "rescheduled" | "completed";

interface BookingRow {
  id: string;
  event_type_slug: "trial" | "paid";
  start_at: string;
  end_at: string;
  status: BookingStatus;
  format: "online" | "physical";
  meet_link: string | null;
  manage_token: string;
  booking_event_types: { name_ro: string; name_en: string; duration_min: number } | null;
}

const COPY = {
  ro: {
    h1: "Rezervările mele",
    lead: "Primește pe email un link privat pentru toate lecțiile rezervate cu această adresă.",
    email: "Adresa de email folosită la rezervare",
    send: "Trimite linkul privat",
    sending: "Se trimite…",
    sentTitle: "Verifică-ți emailul",
    sentBody: "Dacă există rezervări pentru această adresă, vei primi un link valabil 30 de minute. Verifică și folderul Spam.",
    loading: "Se încarcă rezervările…",
    invalid: "Linkul nu este valid sau a expirat. Cere un link nou mai jos.",
    empty: "Nu am găsit rezervări pentru această adresă.",
    requestAgain: "Cere alt link",
    online: "Online",
    physical: "La centru, București",
    meet: "Intră la lecție",
    reschedule: "Reprogramează",
    cancel: "Anulează",
    cancelling: "Se anulează…",
    cancelConfirm: "Sigur vrei să anulezi această rezervare?",
    cancelledToast: "Rezervarea a fost anulată.",
    actionError: "Rezervarea nu a putut fi actualizată. Încearcă din nou.",
    deadline: "Poți anula sau reprograma direct de aici.",
    expires: "Din motive de siguranță, acest acces expiră în 30 de minute.",
    statuses: { confirmed: "Confirmată", cancelled: "Anulată", rescheduled: "Reprogramată", completed: "Încheiată" },
  },
  en: {
    h1: "My bookings",
    lead: "Receive a private email link for every lesson booked with this address.",
    email: "Email address used for booking",
    send: "Send private link",
    sending: "Sending…",
    sentTitle: "Check your email",
    sentBody: "If bookings exist for this address, you will receive a link valid for 30 minutes. Check your Spam folder too.",
    loading: "Loading your bookings…",
    invalid: "This link is invalid or has expired. Request a new one below.",
    empty: "We found no bookings for this address.",
    requestAgain: "Request another link",
    online: "Online",
    physical: "At the Bucharest centre",
    meet: "Join lesson",
    reschedule: "Reschedule",
    cancel: "Cancel",
    cancelling: "Cancelling…",
    cancelConfirm: "Are you sure you want to cancel this booking?",
    cancelledToast: "Your booking was cancelled.",
    actionError: "The booking could not be updated. Please try again.",
    deadline: "You can cancel or reschedule directly from here.",
    expires: "For your security, this access expires after 30 minutes.",
    statuses: { confirmed: "Confirmed", cancelled: "Cancelled", rescheduled: "Rescheduled", completed: "Completed" },
  },
} as const;

function formatDate(value: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: "Europe/Bucharest",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const MyBookings = ({ lang }: { lang: Lang }) => {
  const c = COPY[lang];
  const [params, setParams] = useSearchParams();
  const token = params.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [invalid, setInvalid] = useState(false);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!token) return;
    setLoading(true);
    setInvalid(false);
    try {
      const response = await fetch(`/api/public/bookings-access?token=${encodeURIComponent(token)}`);
      if (!response.ok) throw new Error("invalid");
      const body = await response.json() as { bookings?: BookingRow[] };
      setBookings(body.bookings ?? []);
    } catch {
      setInvalid(true);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
    // The token is the only input to this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const requestLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch("/api/public/bookings-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      if (!response.ok) throw new Error("request failed");
      setSent(true);
    } catch {
      toast.error(c.actionError);
    } finally {
      setSending(false);
    }
  };

  const cancelBooking = async (booking: BookingRow) => {
    if (!window.confirm(c.cancelConfirm)) return;
    setCancellingId(booking.id);
    try {
      const response = await fetch(
        `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/booking-manage/${booking.manage_token}`,
        { method: "DELETE", headers: { apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] } },
      );
      if (!response.ok) throw new Error("cancel failed");
      toast.success(c.cancelledToast);
      await loadBookings();
    } catch {
      toast.error(c.actionError);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-gutter py-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{c.h1}</h1>
          <p className="mt-4 text-muted-foreground">{c.lead}</p>
        </div>

        {!token && !sent && (
          <form onSubmit={requestLink} className="mt-10 max-w-xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="bookings-email">{c.email}</Label>
              <Input id="bookings-email" type="email" required autoComplete="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? <Loader2 className="animate-spin" /> : <Mail />}
              {sending ? c.sending : c.send}
            </Button>
          </form>
        )}

        {!token && sent && (
          <div className="mt-10 max-w-xl rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">{c.sentTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.sentBody}</p>
            <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>{c.requestAgain}</Button>
          </div>
        )}

        {token && loading && (
          <div className="mt-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" />{c.loading}</div>
        )}

        {token && !loading && invalid && (
          <div className="mt-10 max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-sm text-destructive">{c.invalid}</p>
            <Button variant="outline" className="mt-4" onClick={() => setParams({})}>{c.requestAgain}</Button>
          </div>
        )}

        {token && !loading && !invalid && (
          <section className="mt-10 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{c.expires}</p>
              <Button variant="outline" size="sm" onClick={() => setParams({})}>{c.requestAgain}</Button>
            </div>
            {bookings.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">{c.empty}</p>}
            {bookings.map((booking) => {
              const active = booking.status === "confirmed";
              const name = lang === "ro" ? booking.booking_event_types?.name_ro : booking.booking_event_types?.name_en;
              return (
                <article key={booking.id} className="rounded-lg border border-border bg-card p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{name ?? (booking.event_type_slug === "trial" ? "Trial" : "Private lesson")}</h2>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><Calendar />{formatDate(booking.start_at, lang)}</p>
                        <p className="flex items-center gap-2">{booking.format === "online" ? <Video /> : <MapPin />}{booking.format === "online" ? c.online : c.physical}</p>
                        <p className="flex items-center gap-2"><Clock />{booking.booking_event_types?.duration_min ?? Math.round((Date.parse(booking.end_at) - Date.parse(booking.start_at)) / 60000)} min</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">{c.statuses[booking.status]}</span>
                  </div>
                  {active && booking.meet_link && (
                    <Button asChild variant="outline" size="sm" className="mt-5"><a href={booking.meet_link} target="_blank" rel="noopener noreferrer"><Video />{c.meet}</a></Button>
                  )}
                  {active && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="mb-3 text-xs text-muted-foreground">{c.deadline}</p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild variant="outline"><Link to={`/booking/manage/${booking.manage_token}`}><RefreshCw />{c.reschedule}</Link></Button>
                        <Button variant="destructive" disabled={cancellingId === booking.id} onClick={() => void cancelBooking(booking)}>
                          {cancellingId === booking.id ? <Loader2 className="animate-spin" /> : <X />}
                          {cancellingId === booking.id ? c.cancelling : c.cancel}
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;