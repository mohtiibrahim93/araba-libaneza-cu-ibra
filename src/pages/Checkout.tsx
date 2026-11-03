import { useI18n } from "@/lib/i18n";
import CheckoutEmailGate from "@/components/CheckoutEmailGate";
import {
  readCheckoutContact,
  saveCheckoutContact,
} from "@/lib/checkoutContact";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
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

type CourseType = "group" | "private" | "kids";

const COURSE_LABEL: Record<CourseType, string> = {
  group: "Curs de Grup",
  private: "Lecție Privată",
  kids: "Grupa de Copii",
};

// supabase.functions.invoke wraps non-2xx responses in a FunctionsHttpError
// whose .context holds the original Response — without this, every server
// error degrades to the cryptic "Edge Function returned a non-2xx status code".
type InvokeErrorBody = {
  error?: unknown;
  code?: unknown;
  plan?: unknown;
  planOptions?: unknown;
};
async function readInvokeBody(err: unknown): Promise<InvokeErrorBody | null> {
  const ctx = (err as { context?: Response })?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.clone().json();
      if (body && typeof body === "object") return body as InvokeErrorBody;
    } catch {
      /* not json */
    }
  }
  return null;
}
async function readInvokeError(err: unknown): Promise<string | null> {
  const body = await readInvokeBody(err);
  return body && typeof body.error === "string" && body.error
    ? body.error
    : null;
}

type Plan = "monthly" | "full";
type PlanOptions = {
  monthly: { amount: number; monthsTotal: number };
  full: { amount: number; fullBase: number };
};
const asPlan = (v: unknown): Plan | null =>
  v === "full" || v === "monthly" ? v : null;
const asPlanOptions = (v: unknown): PlanOptions | null => {
  const o = v as PlanOptions | null | undefined;
  return o &&
    typeof o.monthly?.amount === "number" &&
    typeof o.full?.amount === "number"
    ? o
    : null;
};
const lei = (bani: number) =>
  new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(
    bani / 100,
  );

/** Monthly subscription vs. whole course upfront (−15%): same figures as the form. */
const PlanChooser = ({
  plan,
  options,
  disabled,
  english,
  titles,
  onChange,
}: {
  plan: Plan;
  options: PlanOptions;
  disabled: boolean;
  english: boolean;
  titles: { monthly: string; full: string };
  onChange: (p: Plan) => void;
}) => {
  const items: {
    plan: Plan;
    title: string;
    big: string;
    sub: string;
    badge?: string;
  }[] = [
    {
      plan: "monthly",
      title: titles.monthly,
      big: `${lei(options.monthly.amount)} LEI / ${english ? "month" : "lună"}`,
      sub: `× ${options.monthly.monthsTotal} ${english ? "months" : "luni"}`,
    },
    {
      plan: "full",
      title: titles.full,
      big: `${lei(options.full.amount)} LEI`,
      sub: `${lei(options.full.fullBase)} LEI`,
      badge: "−15%",
    },
  ];
  return (
    <div
      className="grid grid-cols-2 gap-2 mb-6"
      role="radiogroup"
      aria-label={english ? "Payment plan" : "Mod de plată"}
    >
      {items.map((o) => {
        const active = plan === o.plan;
        return (
          <button
            key={o.plan}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(o.plan)}
            className={`text-left rounded-lg border p-3 transition-colors disabled:opacity-60 ${
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {o.title}
              </span>
              {o.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-[4px]">
                  {o.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-base font-bold text-foreground">{o.big}</p>
            <p
              className={`text-[11px] text-muted-foreground ${o.plan === "full" ? "line-through" : ""}`}
            >
              {o.sub}
            </p>
          </button>
        );
      })}
    </div>
  );
};

const PaymentForm = ({
  amount,
  currency,
  courseType,
  registrationId,
  monthsTotal,
  sig,
}: {
  amount: number;
  currency: string;
  courseType: CourseType;
  registrationId: string;
  monthsTotal: number;
  /** Server-signed registration id: what lets the status page show "paid". */
  sig: string;
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
    if (registrationId)
      returnUrl.searchParams.set("registration_id", registrationId);
    // The signed id proves the payment on /payment-status (audit P0-4); the
    // email no longer travels in the URL (audit P0-3).
    if (sig) returnUrl.searchParams.set("sig", sig);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl.toString(),
      },
    });
    if (error) {
      toast.error(
        error.message || "Plata a eșuat. Te rugăm să încerci din nou.",
      );
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
  const isSubscription =
    (courseType === "group" || courseType === "kids") && monthsTotal > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSubscription && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            Abonament lunar · {monthsTotal} luni
          </p>
          <p className="text-muted-foreground mt-1">
            {fmt(amount)} / lună, facturat lunar timp de {monthsTotal} luni
            (total {fmt(amount * monthsTotal)}). Se oprește automat după ultima
            lună. Achiți prima lună acum.
          </p>
        </div>
      )}
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || submitting}
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se procesează...
          </>
        ) : (
          <>
            Plătește {formatted}
            {isSubscription ? " / lună" : ""}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Plată securizată procesată de Stripe. Datele cardului tău nu sunt
        stocate pe acest site.
      </p>
    </form>
  );
};

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const checkoutStartSent = useRef(false);
  const courseType = (params.get("courseType") as CourseType) || "group";
  const registrationId = params.get("registrationId") || "";
  // The email and name arrive through this tab's sessionStorage, not the
  // address (src/lib/checkoutContact.ts). An older link that still carries
  // them is read once, stored, and the address is cleaned. A visitor with
  // nothing stored types the email in the verification step.
  const urlEmail = params.get("email") || "";
  const urlName = params.get("name") || "";
  const [contact, setContact] = useState<{ email: string; name: string }>({
    email: urlEmail,
    name: urlName,
  });
  useEffect(() => {
    if (urlEmail) {
      saveCheckoutContact(registrationId, { email: urlEmail, name: urlName });
      const clean = new URL(window.location.href);
      clean.searchParams.delete("email");
      clean.searchParams.delete("name");
      window.history.replaceState(window.history.state, "", clean.toString());
      return;
    }
    const stored = readCheckoutContact(registrationId);
    if (stored) setContact(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);
  const email = contact.email;
  const name = contact.name;
  const typeEmail = useCallback(
    (typed: string) => {
      const next = { email: typed.trim(), name: contact.name };
      setContact(next);
      saveCheckoutContact(registrationId, next);
    },
    [contact.name, registrationId],
  );
  const quantity = Math.max(
    1,
    Math.min(100, Number.parseInt(params.get("quantity") || "1", 10) || 1),
  );
  // Group / kids: "monthly" (subscription) vs "full" (whole course upfront,
  // −15%). The registration row holds the plan; the `plan` URL parameter is
  // only a first guess so the right payment is prepared without a round trip.
  // The server answers plan_mismatch when the row says otherwise, and we
  // follow the row. Private ignores this.
  const hasPlan = courseType === "group" || courseType === "kids";
  const [plan, setPlan] = useState<Plan>(
    params.get("plan") === "full" ? "full" : "monthly",
  );
  const [planOptions, setPlanOptions] = useState<PlanOptions | null>(null);
  // A switch the buyer made on this page, sent once as `changePlan` so the
  // server writes it to the row before preparing the payment.
  const pendingChange = useRef<Plan | null>(null);
  // Force the hosted-Stripe-Checkout fallback: set via `?fallback=1` when the
  // user returns from cancel_url, or auto-flipped below if js.stripe.com fails
  // to load / times out in this browser.
  const forceFallback = params.get("fallback") === "1";

  const { lang, t } = useI18n();
  const english = lang === "en";
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const emailVerified = !!email && verifiedEmail === email;
  // The registration form cannot send the student their confirmation: they are
  // not signed in yet, and notify-registration only mails the address on the
  // row to someone who has proved they own it. This is where they prove it.
  // The function sends it once per registration, so a revisit sends nothing.
  const onEmailVerified = useCallback(() => {
    setVerifiedEmail(email);
    if (registrationId) {
      void supabase.functions.invoke("notify-registration", {
        body: { registrationId },
      });
    }
  }, [email, registrationId]);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [amount, setAmount] = useState(0);
  const [sig, setSig] = useState("");
  const [monthsTotal, setMonthsTotal] = useState(0);
  const [currency, setCurrency] = useState("ron");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"initializing" | "ready" | "error">(
    "initializing",
  );
  const [stripeLoadFailed, setStripeLoadFailed] = useState(false);
  const [hostedLoading, setHostedLoading] = useState(false);
  // Set when the automatic redirect to Stripe's hosted page failed too —
  // only then do we show the manual button + WhatsApp escape hatch.
  const [hostedAutoFailed, setHostedAutoFailed] = useState(false);

  const showFallback = stripeLoadFailed || forceFallback;

  // The head lives in src/routes/checkout.tsx: written here as well, both
  // copies ended up in the same HTML.

  useEffect(() => {
    if (!emailVerified) return;
    // Opened directly, or from a stale link: there is no registration to
    // charge. Say so in plain words instead of passing the server's
    // "registrationId is required" through to the visitor.
    if (!registrationId) {
      setError(
        window.location.pathname.startsWith("/en")
          ? "We couldn't find your registration. Please start again from the course sign-up form."
          : "Nu am găsit înscrierea ta. Te rugăm să pornești din nou de la formularul de înscriere al cursului.",
      );
      setPhase("error");
      return;
    }
    let cancelled = false;
    // Back from Stripe's hosted page (cancel): the embedded form is not tried
    // again. Group / kids get the stored plan and both amounts so the buyer
    // can switch before going back to Stripe.
    if (forceFallback) {
      if (!hasPlan) {
        setPhase("ready");
        return;
      }
      (async () => {
        const { data } = await supabase.functions.invoke(
          "create-checkout-session",
          { body: { registrationId, email, quote: true } },
        );
        if (cancelled) return;
        const p = asPlan(data?.plan);
        if (p) setPlan(p);
        setPlanOptions(asPlanOptions(data?.planOptions));
        setPhase("ready");
      })();
      return () => {
        cancelled = true;
      };
    }
    setPhase("initializing");
    setClientSecret(null);
    (async () => {
      try {
        if (!courseType || !["group", "private", "kids"].includes(courseType)) {
          throw new Error("Tip de curs invalid");
        }
        // Once per visit to this page. The effect re-runs when the query
        // params, the plan or the fallback flag change, and a retry is not a
        // second checkout.
        if (!checkoutStartSent.current) {
          checkoutStartSent.current = true;
          trackCheckoutStart(courseType);
        }
        // Group / kids monthly → subscription. Pay-in-full and private → a
        // one-time PaymentIntent (the edge function derives the amount).
        const changePlan = pendingChange.current ?? undefined;
        const useSubscription = hasPlan && plan === "monthly";
        const { data, error: invokeError } = useSubscription
          ? await supabase.functions.invoke("create-subscription", {
              body: { email, name, registrationId, changePlan },
            })
          : await supabase.functions.invoke("create-payment-intent", {
              body: {
                courseType,
                email,
                name,
                registrationId,
                quantity,
                changePlan,
              },
            });
        if (invokeError) {
          const body = await readInvokeBody(invokeError);
          // The row holds the other plan: follow it (this re-runs the effect).
          const rowPlan = asPlan(body?.plan);
          if (
            !cancelled &&
            body?.code === "plan_mismatch" &&
            rowPlan &&
            rowPlan !== plan
          ) {
            pendingChange.current = null;
            setPlanOptions(asPlanOptions(body?.planOptions));
            setPlan(rowPlan);
            return;
          }
          throw new Error(
            (typeof body?.error === "string" && body.error) ||
              invokeError.message ||
              "Eroare la inițializarea plății",
          );
        }
        pendingChange.current = null;
        // Safe diagnostic log: never print full clientSecret or full key.
        console.info("[checkout] payment-intent response", {
          amount: data?.amount,
          currency: data?.currency,
          hasClientSecret: Boolean(data?.clientSecret),
          publishableKeyPrefix:
            typeof data?.publishableKey === "string"
              ? data.publishableKey.slice(0, 8) + "…"
              : null,
        });
        if (!data?.clientSecret || !data?.publishableKey) {
          throw new Error(
            "Răspuns invalid de la server (lipsă clientSecret / publishableKey)",
          );
        }
        if (typeof data.amount !== "number" || data.amount <= 0) {
          throw new Error("Sumă invalidă returnată de server");
        }
        if (cancelled) return;
        const opts = asPlanOptions(data.planOptions);
        if (opts) setPlanOptions(opts);
        setClientSecret(data.clientSecret);
        // One Stripe.js load per page: a plan switch only needs a new secret.
        if (!stripePromise) {
          const promise = loadStripe(data.publishableKey);
          setStripePromise(promise);
          promise
            .then((s) => {
              if (!s) setStripeLoadFailed(true);
            })
            .catch(() => setStripeLoadFailed(true));
        }
        setAmount(data.amount);
        setSig(typeof data.sig === "string" ? data.sig : "");
        setMonthsTotal(
          typeof data.monthsTotal === "number" ? data.monthsTotal : 0,
        );
        setCurrency(data.currency);
        setPhase("ready");
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Eroare la inițializarea plății";
        setError(msg);
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    courseType,
    email,
    name,
    registrationId,
    quantity,
    plan,
    forceFallback,
    emailVerified,
  ]);

  const switchPlan = (next: Plan) => {
    if (next === plan) return;
    pendingChange.current = next;
    setPlan(next);
  };

  // Watchdog: some blockers never reject the js.stripe.com fetch, they just
  // hang. If Stripe.js hasn't resolved after 6 s while we're supposedly
  // "ready", flip to the hosted-checkout fallback so the visitor is never
  // stuck on a spinner.
  useEffect(() => {
    if (phase !== "ready" || !stripePromise || stripeLoadFailed) return;
    let resolved = false;
    stripePromise
      .then(() => {
        resolved = true;
      })
      .catch(() => {
        resolved = true;
      });
    const t = window.setTimeout(() => {
      if (!resolved) {
        console.warn("[checkout] Stripe.js load watchdog fired", {
          ua: navigator.userAgent,
          online: navigator.onLine,
          cookieEnabled: navigator.cookieEnabled,
        });
        setStripeLoadFailed(true);
      }
    }, 6000);
    return () => window.clearTimeout(t);
  }, [phase, stripePromise, stripeLoadFailed]);

  const startHostedCheckout = async () => {
    if (!registrationId) {
      toast.error("Lipsă identificator înregistrare — reia formularul.");
      return;
    }
    setHostedLoading(true);
    try {
      // The plan shown here is written to the row first (changePlan), so the
      // hosted session charges exactly what the buyer picked.
      const { data, error: invokeError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            registrationId,
            email,
            ...(hasPlan ? { changePlan: plan } : {}),
          },
        },
      );
      if (invokeError) {
        const serverMsg = await readInvokeError(invokeError);
        throw new Error(serverMsg ?? "Nu am putut deschide pagina Stripe.");
      }
      if (!data?.url) throw new Error("Server nu a returnat URL-ul de plată.");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Nu am putut deschide pagina Stripe.",
      );
      setHostedLoading(false);
      setHostedAutoFailed(true);
    }
  };

  // When the embedded card form can't load, don't stop at an error screen —
  // go straight to Stripe's hosted page with the plan already on the row. The
  // manual button below stays as a backup if the automatic redirect fails.
  // Back from Stripe's cancel page (forceFallback) a group / kids buyer gets
  // the plan choice and a button instead, so they can switch before paying.
  const offerChoiceFirst = forceFallback && hasPlan;
  const autoRedirectRef = useRef(false);
  useEffect(() => {
    if (
      !emailVerified ||
      !showFallback ||
      offerChoiceFirst ||
      autoRedirectRef.current ||
      !registrationId
    )
      return;
    autoRedirectRef.current = true;
    void startHostedCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFallback, registrationId, emailVerified, offerChoiceFirst]);

  const options = useMemo(
    () =>
      clientSecret
        ? { clientSecret, appearance: { theme: "stripe" as const } }
        : undefined,
    [clientSecret],
  );

  const canRenderElements =
    !showFallback &&
    phase === "ready" &&
    !!clientSecret &&
    !!stripePromise &&
    !!options &&
    amount > 0;

  const chooser =
    emailVerified && hasPlan && planOptions ? (
      <PlanChooser
        plan={plan}
        options={planOptions}
        english={english}
        titles={{ monthly: t.groupPlanMonthly, full: t.groupPlanFull }}
        disabled={hostedLoading || (!showFallback && phase === "initializing")}
        onChange={switchPlan}
      />
    ) : null;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-gutter">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </button>

        <div className="bg-background rounded-2xl border border-border shadow-xs p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Finalizează plata
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {COURSE_LABEL[courseType as CourseType] || courseType}
              {name && ` • ${name}`}
            </p>
          </div>

          {chooser}

          {!emailVerified ? (
            <CheckoutEmailGate
              email={email}
              english={english}
              onVerified={onEmailVerified}
              onEmailEntered={typeEmail}
            />
          ) : offerChoiceFirst && !hostedAutoFailed ? (
            /* Back from Stripe's page: choose the plan (above), then go back. */
            <div className="text-center space-y-3">
              <Button
                onClick={startHostedCheckout}
                disabled={hostedLoading || phase !== "ready"}
                size="lg"
                className="w-full"
              >
                {hostedLoading || phase !== "ready" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se pregătește...
                  </>
                ) : english ? (
                  "Continue to secure Stripe payment"
                ) : (
                  "Continuă către plata securizată Stripe"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Plată securizată procesată de Stripe.
              </p>
            </div>
          ) : showFallback && !hostedAutoFailed ? (
            /* Seamless path: the embedded form can't load here, so we're
               already redirecting to Stripe's hosted page — no error screen,
               no extra click. */
            <div className="text-center py-12" role="status" aria-live="polite">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">
                Te redirecționăm către pagina securizată Stripe...
              </p>
            </div>
          ) : showFallback ? (
            /* The automatic redirect itself failed — manual button + escape hatch. */
            <div className="text-center py-6 space-y-5">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-foreground font-medium">
                Nu am putut deschide automat pagina de plată Stripe.
              </p>
              <Button
                onClick={startHostedCheckout}
                disabled={hostedLoading || !registrationId}
                size="lg"
                className="w-full"
              >
                {hostedLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se pregătește...
                  </>
                ) : (
                  "Încearcă din nou pagina Stripe"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Dacă nici asta nu funcționează, scrie-ne pe WhatsApp la{" "}
                <a href="https://wa.me/40763124514" className="underline">
                  0763 124 514
                </a>{" "}
                și trimitem un link de plată direct.
              </p>
            </div>
          ) : phase === "error" ? (
            <div className="text-center py-8 space-y-4">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-destructive font-medium">
                {error || "Nu am putut pregăti plata"}
              </p>
              <p className="text-xs text-muted-foreground">
                Reîncearcă sau contactează-ne pe WhatsApp la 0763 124 514.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
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
            <Elements
              key={clientSecret!}
              stripe={stripePromise!}
              options={options!}
            >
              <PaymentForm
                amount={amount}
                currency={currency}
                courseType={courseType as CourseType}
                registrationId={registrationId}
                monthsTotal={monthsTotal}
                sig={sig}
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
