import { useEffect } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import BookingLanding from "@/components/booking/BookingLanding";

const BookingInner = () => {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const type = (params.get("type") === "paid" ? "paid" : "trial") as "trial" | "paid";
  const registrationId = params.get("registration_id");
  const hasValidRegistration =
    !!registrationId && /^[0-9a-f-]{36}$/i.test(registrationId);

  // Only the tab title, set by the effect below. The head itself — for the
  // indexable /booking entry point — is served by the route from
  // src/lib/seoHead.ts; this page wrote a second copy of it, which is how the
  // HTML ended up with two titles and two descriptions.
  const title = `${type === "paid" ? t.bookingPageSeoTitlePaid : t.bookingPageSeoTitleTrial} — ${t.siteTitle}`;

  // Keep this hook before the early return so hook order stays stable across
  // renders — otherwise a re-render without a valid registration id throws
  // "rendered fewer hooks than expected" and blanks the whole app.
  useEffect(() => {
    if (hasValidRegistration) document.title = title;
  }, [title, hasValidRegistration]);

  // Bookings must be tied to a registration. Reaching /booking without one
  // (e.g. from the navbar) is a valid entry point: the Programare page, where
  // the visitor picks a course, then a date, then books.
  if (!hasValidRegistration) return <BookingLanding />;

  return (
    <main className="min-h-screen bg-background py-12 px-gutter">
      <div className="w-full max-w-2xl 2xl:max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t.navHome}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {type === "paid" ? t.bookingPageTitlePaid : t.bookingPageTitleTrial}
        </h1>
        <p className="text-muted-foreground mb-8">
          {type === "paid" ? t.bookingPageSubtitlePaid : t.bookingPageSubtitleTrial}
        </p>
        <NativeScheduler eventType={type} registrationId={registrationId} />
      </div>
    </main>
  );
};

const BookingPage = () => <BookingInner />;

export default BookingPage;