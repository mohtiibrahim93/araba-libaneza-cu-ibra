import { useI18n } from "@/lib/i18n";
import { MessageCircle, Banknote, CreditCard, Building2 } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/40763124514";

const PaymentInstructions = () => {
  const { t } = useI18n();

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-foreground">{t.paymentTitle}</h3>
      <p className="text-sm text-muted-foreground">{t.paymentDesc}</p>

      <ul className="space-y-2">
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
          {t.paymentCard}
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
