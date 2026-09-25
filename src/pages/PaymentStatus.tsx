import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackPurchase } from "@/lib/tracking";

type Status = "pending" | "succeeded" | "failed" | "canceled";

const MAX_POLLS = 12;
const POLL_INTERVAL_MS = 1500;

function mapRegistrationPaymentStatus(s: string | null | undefined): Status | null {
  if (!s) return null;
  if (s === "paid") return "succeeded";
  if (s === "failed") return "failed";
  if (s === "expired") return "canceled";
  if (s === "refunded") return "succeeded";
  return null;
}

const PaymentStatus = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const registrationId = params.get("registration_id") || "";
  const courseType = params.get("courseType") || "";
  const amountParam = Number.parseInt(params.get("amount") || "0", 10);
  const currency = (params.get("currency") || "ron").toUpperCase();
  const piClientSecret = params.get("payment_intent_client_secret");
  const redirectStatus = params.get("redirect_status"); // succeeded | failed | ...

  const [status, setStatus] = useState<Status>("pending");
  const [amount, setAmount] = useState<number>(amountParam || 0);
  const [message, setMessage] = useState<string>("Confirmăm plata...");
  // A ref, not state: this guards a side effect that must happen at most once,
  // and a state update is not visible to the polling closure that set it.
  const purchaseSent = useRef(false);

  // Stripe's PaymentIntent id, recovered from the client secret. It identifies
  // the payment itself, so it is the right transaction_id — GA4 deduplicates on
  // it, which is what makes a page reload harmless.
  const paymentIntentId = piClientSecret ? piClientSecret.split("_secret")[0] : "";

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    /**
     * `confirmed` means the server vouched for this status.
     *
     * `redirect_status` is a URL parameter Stripe appends on the way back. It
     * is good enough to show the visitor a result, but it is not evidence that
     * money moved — anyone can type it — so `purchase` must never be based on
     * it. Only the database read below can confirm a sale.
     */
    const check = async (): Promise<{ status: Status; confirmed: boolean }> => {
      // 1) DB is source of truth (webhook writes here)
      if (registrationId) {
        try {
          const base = import.meta.env["VITE_SUPABASE_URL"] as string;
          const anon = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
          const res = await fetch(
            `${base}/functions/v1/get-payment-status?registration_id=${encodeURIComponent(registrationId)}`,
            {
              headers: { apikey: anon, Authorization: `Bearer ${anon}` },
            },
          );
          if (res.ok) {
            const json = await res.json();
            const mapped = mapRegistrationPaymentStatus(json?.payment_status);
            if (mapped) return { status: mapped, confirmed: true };
          }
        } catch (e) {
          console.warn("[payment-status] fetch failed", e);
        }
      }

      // 3) Final fallback: redirect_status from Stripe. Shown to the visitor,
      //    never counted as a sale — hence confirmed: false.
      if (redirectStatus === "succeeded") return { status: "succeeded", confirmed: false };
      if (redirectStatus === "failed") return { status: "failed", confirmed: false };
      return { status: "pending", confirmed: false };
    };

    const loop = async () => {
      while (!cancelled && attempt < MAX_POLLS) {
        attempt += 1;
        try {
          const { status: s, confirmed } = await check();
          if (cancelled) return;
          if (s !== "pending") {
            setStatus(s);
            // Only a server-confirmed success counts, and only once. The
            // transaction id must be a real one: "unknown" would collapse
            // every such sale into a single GA4 transaction.
            const transactionId = paymentIntentId || registrationId;
            if (s === "succeeded" && confirmed && transactionId && !purchaseSent.current) {
              purchaseSent.current = true;
              trackPurchase({
                transactionId,
                value: (amount || amountParam || 0) / 100,
                currency,
                courseType,
              });
            }
            return;
          }
          setMessage(`Confirmăm plata... (${attempt}/${MAX_POLLS})`);
        } catch (e) {
          console.error("[payment-status] check failed", e);
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
      if (!cancelled) {
        // Still pending after all attempts — treat as pending (webhook may arrive later).
        setStatus("pending");
        setMessage(
          "Plata este încă în procesare. Vei primi confirmarea pe email în câteva minute.",
        );
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId, piClientSecret, redirectStatus]);

  const formattedAmount =
    amount > 0
      ? new Intl.NumberFormat("ro-RO", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
        }).format(amount / 100)
      : null;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-gutter">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            {status === "pending" && (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Confirmăm plata</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </>
            )}

            {status === "succeeded" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" strokeWidth={2.5} />
                <h1 className="text-2xl font-bold">Plată reușită</h1>
                <p className="text-sm text-muted-foreground">
                  Îți mulțumim! Am înregistrat plata cu succes.
                </p>
                {formattedAmount && (
                  <p className="text-lg font-semibold text-foreground">{formattedAmount}</p>
                )}
                <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild size="lg">
                    <Link
                      to={`/thank-you?type=${encodeURIComponent(courseType)}&amount=${amount}&currency=${currency.toLowerCase()}${registrationId ? `&registration_id=${registrationId}` : ""}`}
                    >
                      Continuă
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Acasă
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {(status === "failed" || status === "canceled") && (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto" strokeWidth={2.5} />
                <h2 className="text-2xl font-bold">
                  {status === "canceled" ? "Plata a fost anulată" : "Plata a eșuat"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Nu am reușit să procesăm plata. Poți să încerci din nou sau să ne scrii pe
                  WhatsApp la 0763 124 514.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => navigate(-1)} size="lg">
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    Încearcă din nou
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Acasă
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {registrationId && (
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            Ref înscriere: {registrationId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;