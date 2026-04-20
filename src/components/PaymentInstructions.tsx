import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { MessageCircle, Banknote, CreditCard, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    if (!courseType) return;
    setLoading(true);
    trackCheckoutStart(courseType);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { courseType, email, name, registrationId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error(t.paymentStripeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-foreground">{t.paymentTitle}</h3>
      <p className="text-sm text-muted-foreground">{t.paymentDesc}</p>

      <ul className="space-y-2">
        {courseType && (
          <li>
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 flex-shrink-0" />}
              {t.paymentStripe}
            </button>
          </li>
        )}
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Banknote className="w-4 h-4 text-primary flex-shrink-0" />
          {t.paymentCash}
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
          {t.paymentTransfer} — {t.paymentIban}
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
          {t.paymentPaypal}
        </li>
      </ul>

      <p className="text-xs text-muted-foreground italic">{t.paymentNote}</p>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {t.paymentWhatsapp}
      </a>
    </div>
  );
};

export default PaymentInstructions;
