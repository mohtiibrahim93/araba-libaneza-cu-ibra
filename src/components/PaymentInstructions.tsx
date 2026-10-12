import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useNavigate } from "@/lib/router-compat";
import {
  MessageCircle,
  Banknote,
  CreditCard,
  Building2,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/40763124514";

interface PaymentInstructionsProps {
  courseType?: "group" | "private" | "kids" | undefined;
  /**
   * Whether the money has already arrived. False everywhere this renders
   * today — it is the screen shown straight after submitting — and it is the
   * reason the alternatives carry a warning rather than reading as three
   * equally good ways to have your place already.
   */
  paid?: boolean | undefined;
  email?: string | undefined;
  name?: string | undefined;
  registrationId?: string | undefined;
  quantity?: number | undefined;
  /** Group / kids only: monthly subscription vs. pay the whole course upfront. */
  plan?: "monthly" | "full" | undefined;
}

const PaymentInstructions = ({ courseType, email, name, registrationId, quantity, plan, paid }: PaymentInstructionsProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleStripeCheckout = () => {
    if (!courseType) return;
    // No begin_checkout here. This button only navigates to /checkout, which
    // fires the event itself on arrival. Tracking both counted every checkout
    // twice, and the arrival is the better place: it also catches visitors who
    // reach /checkout from a payment link rather than from this button.
    const params = new URLSearchParams({ courseType });
    if (email) params.set("email", email);
    if (name) params.set("name", name);
    if (registrationId) params.set("registrationId", registrationId);
    if (quantity && quantity > 1) params.set("quantity", String(quantity));
    if ((courseType === "group" || courseType === "kids") && plan) params.set("plan", plan);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="bg-background rounded-2xl border border-border shadow-xs p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">{t.paymentTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t.paymentDesc}</p>
      </div>

      {courseType && (
        <div className="space-y-3">
          <button
            onClick={handleStripeCheckout}
            className="group w-full flex items-center justify-between gap-4 rounded-xl bg-primary text-primary-foreground px-5 py-4 font-semibold shadow-xs hover:bg-primary/90 transition-colors"
          >
            <span className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              {t.paymentPrimaryCta}
            </span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {t.paymentSecure}
          </p>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setShowAlternatives((s) => !s)}
          className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <span>
            {showAlternatives ? t.paymentAlternativesHide : t.paymentAlternativesToggle}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAlternatives ? "rotate-180" : ""}`}
          />
        </button>

        {showAlternatives && (
          <div className="mt-4 space-y-3">
            {/* Cash, transfer and PayPal all stay on offer. What they do not
                do is hold the place on their own: the card clears in seconds,
                the other three clear when Ibra has seen the money. Listing
                them with no word on that read as "any of these and you are
                in", which for a group with a seat cap is not true. */}
            {!paid && (
              <p
                role="status"
                className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              >
                {t.paymentAlternativesUnpaid}
                {(courseType === "group" || courseType === "kids") && ` ${t.paymentAlternativesUnpaidSeat}`}
              </p>
            )}
            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-sm text-foreground">
                <Banknote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t.paymentCash}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground">
                <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  {t.paymentTransfer} — {t.paymentIban}
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground">
                <CreditCard className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t.paymentPaypal}</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground italic">{t.paymentNote}</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.paymentWhatsapp}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInstructions;
