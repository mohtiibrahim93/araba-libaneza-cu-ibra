import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, MessageCircle, Phone, CreditCard, RotateCcw } from "lucide-react";
import PaymentInstructions from "@/components/PaymentInstructions";
import NativeScheduler from "@/components/NativeScheduler";
import type { SubmittedData } from "./types";

const WHATSAPP_URL = "https://wa.me/40763124514";

interface Props {
  data: SubmittedData;
  embedded?: boolean;
  onReset: () => void;
}

/**
 * Post-submit confirmation view.
 *
 * UX (Option A — default to free trial for private):
 *   - Private  → free trial Calendly is the primary action.
 *                A subtle "Plătește direct" link below the embed lets
 *                returning students opt into the paid flow.
 *   - Group    → payment instructions (no trial).
 *   - Kids     → contact-only confirmation (paid manually or via deposit redirect).
 */
const PostSubmitView = ({ data, embedded, onReset }: Props) => {
  const { t } = useI18n();
  // Private only: students can switch from "free trial" → "pay directly".
  const [privatePayDirectly, setPrivatePayDirectly] = useState(false);

  const isPrivate = data.courseType === "private";
  const isGroup = data.courseType === "group";
  const isKidsDeposit = data.courseType === "kids" && data.waitlistDeposit === true;

  const showPrivateTrial = isPrivate && !privatePayDirectly;
  const showPayment =
    isGroup || (isPrivate && privatePayDirectly);

  return (
    <section
      id={embedded ? undefined : "inscriere"}
      className={embedded ? "" : "py-20 px-6 scroll-mt-24"}
    >
      <div className={embedded ? "space-y-6" : "max-w-2xl mx-auto space-y-6"}>
        {/* Confirmation header */}
        <div className="bg-background rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground">{t.mainLeadSuccessTitle}</h2>
              <p className="text-muted-foreground mt-1">{t.mainLeadSuccessDesc}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t.successNextStepsTitle}</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-foreground">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-xs font-semibold flex items-center justify-center text-foreground">
                  1
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {t.successStepConfirm}
                </span>
              </li>
              {showPayment && (
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold flex items-center justify-center text-primary">
                    2
                  </span>
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    {t.successStepPay}
                  </span>
                </li>
              )}
            </ol>
          </div>
        </div>

        {/* Payment card (group, or private when user opted to pay directly) */}
        {showPayment && !isKidsDeposit && (
          <PaymentInstructions
            courseType={data.courseType as "group" | "private"}
            email={data.email}
            name={data.name}
            registrationId={data.registrationId}
            quantity={data.quantity}
          />
        )}

        {/* Free trial booking — Calendly. Default for Private. */}
        {showPrivateTrial && (
          <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t.bookingIntroTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.bookingIntroDesc}</p>
              </div>
            </div>
            <NativeScheduler
              eventType="trial"
              prefill={{ name: data.name, email: data.email }}
            />
            {/* Subtle secondary action — keeps the paid path accessible
                without competing with the primary trial CTA. */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setPrivatePayDirectly(true)}
                className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
              >
                {t.trialSkipCta}
              </button>
            </div>
          </div>
        )}

        {/* Utility actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t.successAgain}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PostSubmitView;