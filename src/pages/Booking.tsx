import { useEffect } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, formatLei, physicalPrice } from "@/lib/pricing";

const BookingInner = () => {
  const { t, lang } = useI18n();
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
  // (e.g. from the navbar) is a valid entry point, so show a small landing
  // that routes to the right starting step instead of bouncing to the homepage.
  if (!hasValidRegistration) {
    const en = lang === "en";
    return (
      <main id="main-content" className="min-h-screen bg-background py-12 px-gutter">
        <div className="w-full max-w-2xl 2xl:max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {t.navHome}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{en ? "Book a lesson" : "Rezervă o lecție"}</h1>
          <p className="text-muted-foreground mb-8">{en ? "Choose how you'd like to start:" : "Alege cum vrei să începi:"}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/trial" className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition">
              <h2 className="text-lg font-bold text-foreground mb-1">{en ? "Free trial lesson" : "Lecție de probă gratuită"}</h2>
              <p className="text-sm text-muted-foreground">{en ? "With a native teacher, online or in person. No obligation." : "Cu profesor nativ, online sau fizic. Fără nicio obligație."}</p>
            </Link>
            <Link to="/cursuri" className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition">
              <h2 className="text-lg font-bold text-foreground mb-1">{en ? "Enroll in a course" : "Înscrie-te la un curs"}</h2>
              <p className="text-sm text-muted-foreground">{en ? "Group or private — for adults, teens or kids, online or in Bucharest." : "Grup sau privat — pentru adulți, tineri sau copii, online sau în București."}</p>
            </Link>
          </div>

          {/* Below the two choices: the page was 39 words of visible text,
              which is thin enough that Google can decline to index it. Every
              fact here already appears on /trial or comes from
              booking_event_types. */}
          <section className="mt-section space-y-8 text-left">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{t.bookingLandingWhichH2}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.bookingLandingWhichP}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h3 className="mb-2 font-semibold text-foreground">{t.bookingLandingTrialH3}</h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                    <li>{t.bookingLandingTrialLi1}</li>
                    <li>{t.bookingLandingTrialLi2}</li>
                    <li>{t.bookingLandingTrialLi3}</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h3 className="mb-2 font-semibold text-foreground">{t.bookingLandingEnrollH3}</h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                    <li>{t.bookingLandingEnrollLi1}</li>
                    <li>{t.bookingLandingEnrollLi2}</li>
                    <li>{t.bookingLandingEnrollLi3}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{t.bookingLandingFormatsH2}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.bookingLandingFormatsP}</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{t.bookingLandingPricesH2}</h2>
              {/* Every figure comes from pricing.ts, so the page cannot quote a
                  price the checkout would not charge. */}
              <p className="text-muted-foreground leading-relaxed">
                {t.bookingLandingPricesP
                  .replace("{groupOnline}", formatLei(ONLINE_PRICES.groupMonthly.A1))
                  .replace("{groupFizic}", formatLei(physicalPrice(ONLINE_PRICES.groupMonthly.A1)))
                  .replace("{priv}", formatLei(ONLINE_PRICES.privateLesson))
                  .replace("{privFizic}", formatLei(physicalPrice(ONLINE_PRICES.privateLesson)))}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{t.bookingLandingWhereH2}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.bookingLandingWhereP}</p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{t.bookingLandingWhenH2}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.bookingLandingWhenP}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

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