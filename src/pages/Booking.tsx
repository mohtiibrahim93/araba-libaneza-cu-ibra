import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";

const BookingInner = () => {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const type = (params.get("type") === "paid" ? "paid" : "trial") as "trial" | "paid";
  const registrationId = params.get("registration_id");
  const hasValidRegistration =
    !!registrationId && /^[0-9a-f-]{36}$/i.test(registrationId);

  const title = `${type === "paid" ? t.bookingPageSeoTitlePaid : t.bookingPageSeoTitleTrial} — ${t.siteTitle}`;
  const description = type === "paid" ? t.bookingPaidDesc : t.bookingTrialSeoDesc;

  const ogImage = "https://centruldearabalibaneza.com/og-image.png";

  // Keep this hook before the early return so hook order stays stable across
  // renders — otherwise a re-render without a valid registration id throws
  // "rendered fewer hooks than expected" and blanks the whole app.
  useEffect(() => {
    if (hasValidRegistration) document.title = title;
  }, [title, hasValidRegistration]);

  // Bookings must be tied to a registration. If no id is present, send users
  // back to the registration form (Step 1 of the journey).
  if (!hasValidRegistration) {
    return <Navigate to="/#programs" replace />;
  }

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://centruldearabalibaneza.com/booking`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://centruldearabalibaneza.com/booking`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
      </Helmet>
      <div className="max-w-2xl mx-auto">
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