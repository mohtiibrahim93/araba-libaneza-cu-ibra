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
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
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
}: {
  amount: number;
  currency: string;
  courseType: CourseType;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?payment=success&type=${courseType}`,
      },
    });
    if (error) {
      toast.error(error.message || "Plata a eșuat. Te rugăm să încerci din nou.");
      setSubmitting(false);
    }
  };

  const formatted = new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || submitting} size="lg">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se procesează...
          </>
        ) : (
          <>Plătește {formatted}</>
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

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("ron");
  const [error, setError] = useState<string | null>(null);

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
        const { data, error: invokeError } = await supabase.functions.invoke(
          "create-payment-intent",
          { body: { courseType, email, name, registrationId, quantity } },
        );
        if (invokeError) throw invokeError;
        if (!data?.clientSecret || !data?.publishableKey) {
          throw new Error("Răspuns invalid de la server");
        }
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        setStripePromise(loadStripe(data.publishableKey));
        setAmount(data.amount);
        setCurrency(data.currency);
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Eroare la inițializarea plății";
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseType, email, name, registrationId, quantity]);

  const options = useMemo(
    () =>
      clientSecret
        ? { clientSecret, appearance: { theme: "stripe" as const } }
        : undefined,
    [clientSecret],
  );

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

          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Încearcă din nou
              </Button>
            </div>
          ) : !clientSecret || !stripePromise || !options ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">Se pregătește plata...</p>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm amount={amount} currency={currency} courseType={courseType as CourseType} />
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