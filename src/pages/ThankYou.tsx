import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { CheckCircle2, Mail, Video, Calendar, Share2, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { trackPurchase } from "@/lib/tracking";

type CourseType = "group" | "private" | "kids_deposit";

interface SessionDetails {
  amountTotal: number | null;
  currency: string;
  customerEmail: string | null;
  courseType: CourseType | null;
  registrationId: string | null;
}

const ThankYou = () => {
  const { t, lang } = useI18n();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const fallbackType = params.get("type") as CourseType | null;
  const fallbackAmount = Number.parseInt(params.get("amount") || "0", 10);
  const fallbackCurrency = params.get("currency") || "ron";

  const [loading, setLoading] = useState(!!sessionId);
  const [details, setDetails] = useState<SessionDetails>({
    amountTotal: fallbackAmount || null,
    currency: fallbackCurrency,
    customerEmail: null,
    courseType: fallbackType,
    registrationId: params.get("registration_id"),
  });
  const [errored, setErrored] = useState(false);
  /** True only once Stripe has said this session is paid. Opening the page
   *  directly used to announce "your payment is confirmed" for no payment. */
  const [paid, setPaid] = useState(false);
  /** Guards against a second send if the effect re-runs. */
  const purchaseSent = useRef(false);

  // The route serves the Romanian title (see src/routes/thank-you.tsx); this
  // keeps the tab in the visitor's language without adding a second <title> to
  // the document, which is how the duplicate titles got there in the first place.
  useEffect(() => {
    document.title = t.thankYouSeoTitle;
  }, [t.thankYouSeoTitle]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const url = `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
            Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
          },
        });
        if (!res.ok) throw new Error("session fetch failed");
        const data = await res.json();
        if (cancelled) return;
        setDetails({
          amountTotal: data.amountTotal,
          currency: data.currency || "ron",
          customerEmail: data.customerEmail,
          courseType: data.courseType,
          registrationId: data.registrationId ?? null,
        });

        // Only now, and only if Stripe says the session is paid. This used to
        // fire on mount, so simply opening or reloading /thank-you recorded a
        // sale that may never have completed. transaction_id is the Stripe
        // session id, which lets GA4 discard the duplicate on a reload.
        if (data.paymentStatus === "paid") setPaid(true);
        if (data.paymentStatus === "paid" && !purchaseSent.current) {
          purchaseSent.current = true;
          trackPurchase({
            transactionId: sessionId,
            value: (data.amountTotal || 0) / 100,
            currency: data.currency || "ron",
            courseType: data.courseType,
          });
        }
      } catch (e) {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const courseLabel = (() => {
    switch (details.courseType) {
      case "group":
        return t.thankYouCourseGroup;
      case "private":
        return t.thankYouCoursePrivate;
      case "kids_deposit":
        return t.thankYouCourseKids;
      default:
        return "—";
    }
  })();

  const scheduleLabel = (() => {
    switch (details.courseType) {
      case "group":
        return t.thankYouScheduleGroup;
      case "private":
        return t.thankYouSchedulePrivate;
      case "kids_deposit":
        return t.thankYouScheduleKids;
      default:
        return "—";
    }
  })();

  const amountFormatted = details.amountTotal
    ? new Intl.NumberFormat(lang === "ro" ? "ro-RO" : "en-US", {
        style: "currency",
        currency: (details.currency || "ron").toUpperCase(),
        minimumFractionDigits: 0,
      }).format(details.amountTotal / 100)
    : null;

  const shareUrl = "https://centruldearabalibaneza.com/";

  const handleShare = async () => {
    const shareData = {
      title: t.siteTitle,
      text: t.thankYouShareMessage,
      url: shareUrl,
    };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch {
        /* user canceled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t.thankYouInviteCopied);
    } catch {
      window.prompt(t.thankYouInviteCta, shareUrl);
    }
  };

  // Only the rows we actually know. With no Stripe session (the page opened
  // directly, or the lookup failed) the summary used to show "—" rows.
  const summaryRows = [
    details.courseType ? [t.thankYouCourseType, courseLabel] : null,
    details.courseType ? [t.thankYouSchedule, scheduleLabel] : null,
    amountFormatted ? [t.thankYouAmount, amountFormatted] : null,
    details.customerEmail ? [t.thankYouEmail, details.customerEmail] : null,
  ].filter((r): r is [string, string] => r !== null);

  const card = "rounded-2xl border border-[#E7E1D6] bg-card p-6 dark:border-border";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="bg-cream pt-36 pb-12">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-gutter text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-brand-green/20 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-green animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="h-11 w-11 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">{t.thankYouTitle}</h1>
            <p className="mt-3 max-w-md text-lg text-muted-foreground">
              {paid ? t.thankYouSubtitle : t.thankYouSubtitleUnconfirmed}
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-5 px-gutter py-10">
          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">{t.thankYouLoading}</p>
            </div>
          ) : (
            (summaryRows.length > 0 || errored) && (
              <section className={card}>
                <h2 className="mb-4 font-display text-xl font-bold text-foreground">{t.thankYouOrderSummary}</h2>
                {errored && <p className="mb-4 text-sm text-muted-foreground">{t.thankYouError}</p>}
                <dl className="space-y-3 text-sm">
                  {summaryRows.map(([k, v], i) => (
                    <div key={k} className={cn("flex justify-between gap-4", i < summaryRows.length - 1 && "border-b border-[#E7E1D6] pb-3 dark:border-border")}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="break-all text-right font-semibold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )
          )}

          {details.courseType === "private" && details.registrationId && (
            <div className="text-center">
              <Link
                to={`/booking?type=paid&registration_id=${details.registrationId}`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {t.thankYouSchedulePrivateCta}
              </Link>
            </div>
          )}

          <section className={card}>
            <h2 className="mb-5 font-display text-xl font-bold text-foreground">{t.thankYouNextStepsTitle}</h2>
            <ol className="space-y-5">
              {[
                { icon: Mail, title: t.thankYouStep1Title, desc: t.thankYouStep1Desc },
                { icon: Video, title: t.thankYouStep2Title, desc: t.thankYouStep2Desc },
                { icon: Calendar, title: t.thankYouStep3Title, desc: t.thankYouStep3Desc },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <step.icon className="h-4 w-4 text-brand-green" aria-hidden />
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl bg-cream p-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">{t.thankYouInviteTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t.thankYouInviteDesc}</p>
            <button
              type="button"
              onClick={handleShare}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-green px-5 font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              {t.thankYouInviteCta}
            </button>
          </section>

          <div className="pt-2 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t.thankYouBackHome}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ThankYou;