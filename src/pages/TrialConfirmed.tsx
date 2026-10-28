import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/tracking";

const TZ = "Europe/Bucharest";

/**
 * Where Stripe sends a visitor back after saving the card for a free trial
 * (owner's request, 27 October 2026) — it used to be a toast on the homepage.
 *
 * The booking itself is made by the webhook once the card is saved, so this
 * page shows what was chosen (passed back in the return URL by
 * create-checkout-session) and what happens next; the confirmation email
 * carries the Zoom link or the address and the personal manage link.
 * Nothing here is trusted: the values only fill in the text.
 */
const TrialConfirmed = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const [params] = useSearchParams();
  const startRaw = params.get("start");
  const start =
    startRaw && Number.isFinite(Date.parse(startRaw))
      ? new Date(startRaw)
      : null;
  const online = params.get("format") !== "physical";
  const minutes = Number.parseInt(params.get("min") || "", 10);

  // The trial conversion: the return from saving the card (it used to fire
  // from the homepage toast).
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("trial_booking_complete", {
      event_type: "trial",
      source: "card_saved",
    });
  }, []);

  const locale = en ? "en-GB" : "ro-RO";
  const dateLabel = start
    ? new Intl.DateTimeFormat(locale, {
        timeZone: TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(start)
    : null;
  const timeLabel = start
    ? new Intl.DateTimeFormat(locale, {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(start)
    : null;
  const manageHref = en ? "/en/my-bookings" : "/rezervari";

  const row = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-base font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main
        id="main-content"
        className="mx-auto w-full max-w-2xl px-gutter pb-28 pt-36"
      >
        <div className="mb-8 text-center">
          <CheckCircle2
            className="mx-auto mb-4 h-14 w-14 text-emerald-600"
            aria-hidden="true"
          />
          <h1 className="font-display text-display-md font-bold tracking-tight text-foreground">
            {en
              ? "Your free trial lesson is booked"
              : "Lecția de probă gratuită e rezervată"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {en
              ? "Your card was saved — nothing was charged."
              : "Cardul a fost salvat — nu s-a încasat nimic."}
          </p>
        </div>

        <section
          aria-label={en ? "Your booking" : "Rezervarea ta"}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          {row(
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />,
            en ? "What" : "Ce",
            en
              ? `Free trial lesson with Ibra${Number.isFinite(minutes) && minutes > 0 ? ` · ${minutes} min` : ""}`
              : `Lecție de probă gratuită cu Ibra${Number.isFinite(minutes) && minutes > 0 ? ` · ${minutes} min` : ""}`,
          )}
          {dateLabel &&
            timeLabel &&
            row(
              <Clock className="h-5 w-5" aria-hidden="true" />,
              en ? "When (Bucharest time)" : "Când (ora României)",
              `${dateLabel}, ${timeLabel}`,
            )}
          {row(
            online ? (
              <Video className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MapPin className="h-5 w-5" aria-hidden="true" />
            ),
            en ? "Where" : "Unde",
            online
              ? en
                ? "Online, on Zoom"
                : "Online, pe Zoom"
              : en
                ? "In person: Raduga Creative Center, Str. Icoanei 80, Bucharest"
                : "Fizic: Raduga Creative Center, Str. Icoanei 80, București",
          )}
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            {en ? "What happens next" : "Ce urmează"}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              {en
                ? `In a few minutes you get a confirmation email with ${online ? "the Zoom link" : "the address"}, a calendar invitation and your personal link to manage the booking.`
                : `În câteva minute primești pe email confirmarea, cu ${online ? "linkul de Zoom" : "adresa"}, invitația în calendar și linkul tău pentru a gestiona programarea.`}
            </li>
            <li>
              {en
                ? "We send you a reminder every morning until the lesson, and one an hour before it."
                : "Îți trimitem un memento în fiecare dimineață până la lecție și unul cu o oră înainte."}
            </li>
            <li>
              {en
                ? "No email within 15 minutes? Check spam, or message us on WhatsApp at +40 763 124 514."
                : "Nu primești emailul în 15 minute? Verifică spam-ul sau scrie-ne pe WhatsApp la +40 763 124 514."}
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          <h2 className="mb-2 text-base font-semibold">
            {en ? "The 24-hour rule" : "Regula de 24 de ore"}
          </h2>
          <p>
            {en
              ? "You can cancel or reschedule free of charge at least 24 hours before the lesson. If you do not show up, or cancel later than that, 150 lei is charged to your card — the price of a private lesson. The fee may be refunded if you appeal it."
              : "Poți anula sau reprograma gratuit cu cel puțin 24 de ore înainte de lecție. Dacă nu te prezinți sau anulezi mai târziu, se încasează de pe card 150 lei, cât o lecție privată. Taxa poate fi rambursată dacă o contești."}
          </p>
        </section>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to={manageHref}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {en ? "Manage my booking" : "Gestionează programarea"}
          </Link>
          <Link
            to={en ? "/en" : "/"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {en ? "Back to the home page" : "Înapoi la pagina principală"}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrialConfirmed;
