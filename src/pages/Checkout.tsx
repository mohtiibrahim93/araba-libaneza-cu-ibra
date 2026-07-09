import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trackCheckoutStart } from "@/lib/tracking";

type CourseType = "group" | "private";

const COURSE_LABEL: Record<CourseType, string> = {
  group: "Curs de Grup",
  private: "Lecție Privată",
};

const PaymentForm = ({
  amount,
  currency,
  courseType,
  registrationId,
  monthsTotal,
}: {
  amount: number;
  currency: string;
  courseType: CourseType;
  registrationId: string;
  monthsTotal: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const returnUrl = new URL(`${window.location.origin}/payment-status`);
    returnUrl.searchParams.set("courseType", courseType);
    returnUrl.searchParams.set("amount", String(amount));
    returnUrl.searchParams.set("currency", currency);
    if (registrationId) returnUrl.searchParams.set("registration_id", registrationId);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl.toString(),
      },
    });
    if (error) {
      toast.error(error.message || "Plata a eșuat. Te rugăm să încerci din nou.");
      setSubmitting(false);
    }
  };

  const fmt = (bani: number) =>
    new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(bani / 100);
  const formatted = fmt(amount);
  const isSubscription = courseType === "group" && monthsTotal > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSubscription && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            Abonament lunar · {monthsTotal} luni
          </p>
          <p className="text-muted-foreground mt-1">
            {fmt(amount)} / lună, facturat lunar timp de {monthsTotal} luni (total{" "}
            {fmt(amount * monthsTotal)}). Se oprește automat după ultima lună. Achiți prima
            lună acum.
          </p>
        </div>
      )}
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || submitting} size="lg">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se procesează...
          </>
        ) : (
          <>Plătește {formatted}{isSubscription ? " / lună" : ""}</>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Plată securizată procesată de Stripe. Datele cardului tău nu sunt stocate pe acest site.
      </p>
    </form>
  );
};

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const courseType = (params.get("courseType") as CourseType) || "group";
  const email = params.get("email") || "";
  const name = params.get("name") || "";
  const registrationId = params.get("registrationId") || "";
  const quantity = Math.max(1, Math.min(100, Number.parseInt(params.get("quantity") || "1", 10) || 1));
  // Group only: "monthly" (subscription, default) vs "full" (pay the whole
  // course upfront as one charge). Private ignores this.
  const groupPlan = params.get("plan") === "full" ? "full" : "monthly";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [amount, setAmount] = useState(0);
  const [monthsTotal, setMonthsTotal] = useState(0);
  const [currency, setCurrency] = useState("ron");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"initializing" | "ready" | "error">("initializing");
  const [stripeLoadFailed, setStripeLoadFailed] = useState(false);

  const title = "Finalizează plata — centrul de araba libaneza";
  const description = `Plată securizată prin Stripe pentru ${COURSE_LABEL[courseType]}. Datele cardului nu sunt stocate pe acest site.`;
  const ogImage = "https://centruldearabalibaneza.com/og-image.jpg";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!courseType || !["group", "private"].includes(courseType)) {
          throw new Error("Tip de curs invalid");
        }
        trackCheckoutStart(courseType);
        // Group monthly → subscription. Group pay-in-full and private → a
        // one-time PaymentIntent (the edge function derives the amount).
        const useSubscription = courseType === "group" && groupPlan === "monthly";
        const { data, error: invokeError } = useSubscription
          ? await supabase.functions.invoke("create-subscription", {
              body: { email, name, registrationId },
            })
          : await supabase.functions.invoke("create-payment-intent", {
              body: { courseType, email, name, registrationId, quantity },
            });
        if (invokeError) throw invokeError;
        // Safe diagnostic log: never print full clientSecret or full key.
        console.info("[checkout] payment-intent response", {
          amount: data?.amount,
          currency: data?.currency,
          hasClientSecret: Boolean(data?.clientSecret),
          publishableKeyPrefix: typeof data?.publishableKey === "string"
            ? data.publishableKey.slice(0, 8) + "…"
            : null,
        });
        if (!data?.clientSecret || !data?.publishableKey) {
          throw new Error("Răspuns invalid de la server (lipsă clientSecret / publishableKey)");
        }
        if (typeof data.amount !== "number" || data.amount <= 0) {
          throw new Error("Sumă invalidă returnată de server");
        }
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        const promise = loadStripe(data.publishableKey);
        setStripePromise(promise);
        promise
          .then((s) => {
            if (!cancelled && !s) setStripeLoadFailed(true);
          })
          .catch(() => {
            if (!cancelled) setStripeLoadFailed(true);
          });
        setAmount(data.amount);
        setMonthsTotal(typeof data.monthsTotal === "number" ? data.monthsTotal : 0);
        setCurrency(data.currency);
        setPhase("ready");
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Eroare la inițializarea plății";
        setError(msg);
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseType, email, name, registrationId, quantity, groupPlan]);

  const options = useMemo(
    () =>
      clientSecret
        ? { clientSecret, appearance: { theme: "stripe" as const } }
        : undefined,
    [clientSecret],
  );

  const canRenderElements =
    phase === "ready" && !!clientSecret && !!stripePromise && !!options && amount > 0;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/checkout" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/checkout" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </button>

        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Finalizează plata</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {COURSE_LABEL[courseType as CourseType] || courseType}
              {name && ` • ${name}`}
            </p>
          </div>

          {phase === "error" || stripeLoadFailed ? (
            <div className="text-center py-8 space-y-4">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-destructive font-medium">
                {stripeLoadFailed
                  ? "Nu am putut încărca modulul de plată securizat."
                  : error || "Nu am putut pregăti plata"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stripeLoadFailed
                  ? "Se pare că un ad blocker, VPN sau setare de confidențialitate (ex. Brave Shields, AdGuard, mod privat cu blocare trackere) blochează js.stripe.com. Dezactivează-l pentru acest site și reîncarcă pagina, sau deschide într-un browser fără blocare. Alternativ scrie-ne pe WhatsApp la 0763 124 514."
                  : "Reîncearcă sau contactează-ne pe WhatsApp la 0763 124 514."}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reîncearcă
              </Button>
            </div>
          ) : !canRenderElements ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">
                Se pregătește plata securizată...
              </p>
            </div>
          ) : (
            <Elements stripe={stripePromise!} options={options!}>
              <PaymentForm
                amount={amount}
                currency={currency}
                courseType={courseType as CourseType}
                registrationId={registrationId}
                monthsTotal={monthsTotal}
              />
            </Elements>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Conexiune securizată SSL · 3D Secure
        </div>
      </div>
    </div>
  );
};

export default Checkout;