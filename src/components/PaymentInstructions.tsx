import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Banknote,
  CreditCard,
  Building2,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { trackCheckoutStart } from "@/lib/tracking";

const WHATSAPP_URL = "https://wa.me/40763124514";

interface PaymentInstructionsProps {
  courseType?: "group" | "private";
  email?: string;
  name?: string;
  registrationId?: string;
}

const PaymentInstructions = ({ courseType, email, name, registrationId }: PaymentInstructionsProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleStripeCheckout = () => {
    if (!courseType) return;
    trackCheckoutStart(courseType);
    const params = new URLSearchParams({ courseType });
    if (email) params.set("email", email);
    if (name) params.set("name", name);
    if (registrationId) params.set("registrationId", registrationId);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">{t.paymentTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t.paymentDesc}</p>
      </div>

      {courseType && (
        <div className="space-y-3">
          <button
            onClick={handleStripeCheckout}
            className="group w-full flex items-center justify-between gap-4 rounded-xl bg-primary text-primary-foreground px-5 py-4 font-semibold shadow-sm hover:bg-primary/90 transition-colors"
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
