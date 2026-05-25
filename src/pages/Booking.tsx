import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";

const BookingInner = () => {
  const { t, lang } = useI18n();
  const [params] = useSearchParams();
  const type = (params.get("type") === "paid" ? "paid" : "trial") as "trial" | "paid";

  const title =
    type === "paid"
      ? lang === "ro"
        ? `Programează-ți lecția — ${t.siteTitle}`
        : `Book Your Lesson — ${t.siteTitle}`
      : lang === "ro"
        ? `Lecție gratuită de probă — ${t.siteTitle}`
        : `Free Trial Lesson — ${t.siteTitle}`;

  const description =
    type === "paid"
      ? t.bookingPaidDesc
      : lang === "ro"
        ? "Programează o lecție gratuită de 30 de minute de arabă libaneză. Fără obligații, confirmare pe email."
        : "Schedule a free 30-minute Lebanese Arabic lesson. No obligations, email confirmation provided.";

  const ogImage = "https://centruldearabalibaneza.com/og-image.jpg";

  useEffect(() => {
    document.title = title;
  }, [title]);

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
          <ArrowLeft className="w-4 h-4" /> {lang === "ro" ? "Acasă" : "Home"}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {type === "paid"
            ? lang === "ro" ? "Programează-ți lecția" : "Book your lesson"
            : lang === "ro" ? "Lecție gratuită de probă" : "Free trial lesson"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {type === "paid"
            ? lang === "ro" ? "Alege un slot disponibil. Vei primi confirmarea pe email." : "Pick an available slot. You'll receive a confirmation email."
            : lang === "ro" ? "30 de minute, gratuit. Vei primi confirmarea pe email." : "30 minutes, free. You'll receive a confirmation email."}
        </p>
        <NativeScheduler eventType={type} />
      </div>
    </main>
  );
};

const BookingPage = () => <BookingInner />;

export default BookingPage;