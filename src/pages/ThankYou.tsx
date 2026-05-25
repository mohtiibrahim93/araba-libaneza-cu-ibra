import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, Video, Calendar, Share2, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";

type CourseType = "group" | "private" | "kids_deposit";

interface SessionDetails {
  amountTotal: number | null;
  currency: string;
  customerEmail: string | null;
  courseType: CourseType | null;
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
  });
  const [errored, setErrored] = useState(false);

  // Fire conversion tracking once on mount
  useEffect(() => {
    trackEvent("Purchase", {
      content_name: fallbackType || details.courseType || "course",
      value: (fallbackAmount || details.amountTotal || 0) / 100,
      currency: (fallbackCurrency || details.currency || "ron").toUpperCase(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
        });
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

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <Helmet>
        <title>{t.thankYouSeoTitle}</title>
        <meta name="description" content={t.thankYouSeoDescription} />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://centruldearabalibaneza.com/thank-you" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="w-12 h-12 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t.thankYouTitle}
          </h1>
          <p className="text-muted-foreground max-w-md">{t.thankYouSubtitle}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-3">{t.thankYouLoading}</p>
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t.thankYouOrderSummary}</h2>
              {errored && (
                <p className="text-sm text-muted-foreground mb-4">{t.thankYouError}</p>
              )}
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">{t.thankYouCourseType}</dt>
                  <dd className="font-medium text-right">{courseLabel}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">{t.thankYouSchedule}</dt>
                  <dd className="font-medium text-right">{scheduleLabel}</dd>
                </div>
                {amountFormatted && (
                  <div className="flex justify-between gap-4 border-b border-border pb-3">
                    <dt className="text-muted-foreground">{t.thankYouAmount}</dt>
                    <dd className="font-semibold text-right">{amountFormatted}</dd>
                  </div>
                )}
                {details.customerEmail && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t.thankYouEmail}</dt>
                    <dd className="font-medium text-right break-all">{details.customerEmail}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">{t.thankYouNextStepsTitle}</h2>
            <ol className="space-y-4">
              {[
                { icon: Mail, title: t.thankYouStep1Title, desc: t.thankYouStep1Desc },
                { icon: Video, title: t.thankYouStep2Title, desc: t.thankYouStep2Desc },
                { icon: Calendar, title: t.thankYouStep3Title, desc: t.thankYouStep3Desc },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <step.icon className="w-4 h-4 text-primary" />
                      {step.title}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">{t.thankYouInviteTitle}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t.thankYouInviteDesc}</p>
            <Button onClick={handleShare} size="lg" className="gap-2">
              <Share2 className="w-4 h-4" />
              {t.thankYouInviteCta}
            </Button>
          </CardContent>
        </Card>

        {details.courseType === "private" && (
          <div className="text-center mb-6">
            <Button asChild size="lg" variant="default">
              <Link to="/booking?type=paid">{t.thankYouSchedulePrivateCta}</Link>
            </Button>
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              {t.thankYouBackHome}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;