import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, MessageCircle, Phone, CreditCard, RotateCcw, Loader2, AlertTriangle, Gift, ArrowLeft, ArrowRight } from "lucide-react";
import PaymentInstructions from "@/components/PaymentInstructions";
import NativeScheduler from "@/components/NativeScheduler";
import type { SubmittedData } from "./types";

const WHATSAPP_URL = "https://wa.me/40763124514";

interface Props {
  data: SubmittedData;
  embedded?: boolean;
  onReset: () => void;
  /** Kids deposit only: true if the Stripe checkout redirect failed after submit. */
  depositCheckoutFailed?: boolean;
  retryingDeposit?: boolean;
  onRetryDepositCheckout?: () => void;
}

/**
 * Post-submit confirmation view.
 *
 * UX:
 *   - Private  → an explicit two-card choice: free trial (first lesson only,
 *                enforced server-side per email) vs. pay for lessons. Both
 *                paths are equally visible — the paid option used to be a
 *                near-invisible text link that owners/students kept missing.
 *   - Group    → payment instructions (no trial).
 *   - Kids     → contact-only confirmation (paid manually or via deposit redirect).
 */
const PostSubmitView = ({
  data,
  embedded,
  onReset,
  depositCheckoutFailed,
  retryingDeposit,
  onRetryDepositCheckout,
}: Props) => {
  const { t, lang } = useI18n();
  // Private only: explicit choice between the free first-lesson trial and
  // paying directly. Starts unchosen so both options are equally visible.
  const [privateChoice, setPrivateChoice] = useState<"trial" | "pay" | null>(null);

  const isPrivate = data.courseType === "private";
  const isGroup = data.courseType === "group";
  // Kids "pay to enroll" path: full group (not the deposit-only fallback).
  // We show payment when they were NOT redirected to the deposit checkout.
  const isKidsPay = data.courseType === "kids" && data.waitlistDeposit !== true;
  const isKidsDeposit = data.courseType === "kids" && data.waitlistDeposit === true;

  const showPrivateChoice = isPrivate && privateChoice === null;
  const showPrivateTrial = isPrivate && privateChoice === "trial";
  const showPayment =
    isGroup || isKidsPay || (isPrivate && privateChoice === "pay");

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
              {showPrivateChoice && (
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold flex items-center justify-center text-primary">
                    2
                  </span>
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    {lang === "ro"
                      ? "Alege mai jos: probă gratuită sau plătește lecțiile direct."
                      : "Choose below: free trial or pay for lessons directly."}
                  </span>
                </li>
              )}
            </ol>
          </div>
        </div>

        {/* Payment card (group, or private when user opted to pay directly) */}
        {isPrivate && privateChoice === "pay" && (
          <button
            type="button"
            onClick={() => setPrivateChoice(null)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "ro" ? "Înapoi la opțiuni" : "Back to options"}
          </button>
        )}
        {showPayment && !isKidsDeposit && (
          <PaymentInstructions
            courseType={data.courseType as "group" | "private" | "kids"}
            email={data.email}
            name={data.name}
            registrationId={data.registrationId}
            quantity={data.quantity}
            plan={data.groupPlan}
          />
        )}

        {/* Kids deposit: checkout redirect failed after submit — offer a retry instead of a dead end. */}
        {isKidsDeposit && depositCheckoutFailed && (
          <div className="bg-background rounded-2xl border border-destructive/30 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-sm text-foreground">{t.kidsDepositFailedDesc}</p>
            </div>
            <button
              type="button"
              onClick={onRetryDepositCheckout}
              disabled={retryingDeposit}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {retryingDeposit ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {t.kidsDepositRetryCta}
            </button>
          </div>
        )}

        {/* Private: explicit choice — free first-lesson trial vs. paying. */}
        {showPrivateChoice && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPrivateChoice("trial")}
              className="text-left bg-background rounded-2xl border-2 border-border hover:border-primary p-6 shadow-sm transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {lang === "ro" ? "E prima ta lecție la noi?" : "Is this your first lesson with us?"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "ro"
                  ? "Programează o probă gratuită — o singură dată de persoană, îți confirmi locul cu cardul (0 lei)."
                  : "Book a free trial — once per person, confirm your spot with your card (0 lei charged)."}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold group-hover:bg-primary/90 transition-colors">
                {lang === "ro" ? "Programează proba gratuită" : "Book the free trial"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrivateChoice("pay")}
              className="text-left bg-background rounded-2xl border-2 border-border hover:border-primary p-6 shadow-sm transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {lang === "ro" ? "Ai mai învățat cu noi?" : "Have you studied with us before?"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "ro"
                  ? "Plătește lecțiile direct — 150 lei/lecție, −20% la pachete de 20+."
                  : "Pay for your lessons directly — 150 lei/lesson, −20% for packs of 20+."}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold group-hover:bg-primary/90 transition-colors">
                {lang === "ro" ? "Plătește lecțiile" : "Pay for lessons"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}

        {/* Free trial booking — native scheduler. */}
        {showPrivateTrial && (
          <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <button
              type="button"
              onClick={() => setPrivateChoice(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "ro" ? "Înapoi la opțiuni" : "Back to options"}
            </button>
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
              registrationId={data.registrationId}
            />
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