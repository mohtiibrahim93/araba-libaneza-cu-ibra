import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, MessageCircle, ArrowLeft, CheckCircle2, Download, Home, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { isValidPhone } from "@/components/RegistrationForm/LeadFields";
import { toast } from "sonner";
import GdprCheckbox from "@/components/GdprCheckbox";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { ro as roLocale, enGB as enLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import LocalTimezoneToggle from "@/components/LocalTimezoneToggle";
import { getLocalTz, shortTzLabel, useShowLocalTz } from "@/lib/timezone";
import { ONLINE_PRICES, formatLei, priceFor, privateDiscountFor } from "@/lib/pricing";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

/**
 * The embedded card form for a private purchase — the same Stripe Elements
 * payment /checkout uses. The PaymentIntent already carries the chosen slot;
 * stripe-webhook books it on payment_intent.succeeded.
 */
const InlinePrivatePay = ({
  amount,
  currency,
  registrationId,
  email,
  lang,
  onLoadError,
}: {
  amount: number;
  currency: string;
  registrationId: string;
  email: string;
  lang: "ro" | "en";
  onLoadError: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    const returnUrl = new URL(`${window.location.origin}/payment-status`);
    returnUrl.searchParams.set("courseType", "private");
    returnUrl.searchParams.set("amount", String(amount));
    returnUrl.searchParams.set("currency", currency);
    returnUrl.searchParams.set("registration_id", registrationId);
    if (email) returnUrl.searchParams.set("email", email);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl.toString() },
    });
    if (error) {
      toast.error(
        error.message ||
          (lang === "ro"
            ? "Plata a eșuat. Nimic nu a fost rezervat — încearcă din nou."
            : "The payment failed. Nothing was booked — please try again."),
      );
      setPaying(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement onLoadError={onLoadError} />
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {lang === "ro" ? `Plătește ${formatLei(amount / 100)} lei` : `Pay ${formatLei(amount / 100)} lei`}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        {lang === "ro"
          ? "Plată securizată procesată de Stripe. Datele cardului tău nu sunt stocate pe acest site."
          : "Secure payment processed by Stripe. Your card details are not stored on this site."}
      </p>
    </form>
  );
};

const TZ = "Europe/Bucharest";
const WHATSAPP_FALLBACK =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Vreau să rezerv o lecție.");

type EventType = "trial" | "paid" | "verificare-nivel";
type Format = "online" | "physical";

interface Props {
  eventType?: EventType;
  prefill?: { name?: string; email?: string; phone?: string };
  defaultFormat?: Format;
  onBooked?: (b: { booking_id: string; manage_token: string; meet_link?: string | null | undefined }) => void;
  /**
   * "create" (default) shows the full booking form and creates a new booking.
   * "pick" simply calls onPick(iso) after the user selects a slot — used in the
   * reschedule flow where we PATCH an existing booking instead of creating one.
   */
  mode?: "create" | "pick";
  onPick?: (iso: string) => void;
  /**
   * In "pick" mode, the ISO of the currently booked slot. It is highlighted in
   * the grid and always selectable even if it's outside the returned
   * availability (since the slot is "taken" by the user themselves).
   */
  currentSlotIso?: string;
  /**
   * Required in "create" mode. Every booking must reference the registration
   * that produced it; bookings without one are rejected by the backend.
   *
   * A caller that wants to show the slots *before* asking for anything can
   * leave this out and pass `ensureRegistration` instead.
   */
  registrationId?: string;
  /**
   * Creates the registration on demand, from the details this component just
   * collected, and returns its id.
   *
   * /trial used to ask for name, email and phone on its own screen purely to
   * have a registration row before the grid could be shown — so a visitor gave
   * their details before seeing whether any time suited them, and then gave
   * them again in the confirm form below. This lets the page put the grid
   * first and create the row at the moment of booking instead. The backend
   * contract is unchanged: booking-create still receives a registration_id.
   */
  ensureRegistration?: (details: {
    name: string;
    email: string;
    phone: string;
  }) => Promise<string | null>;
  /**
   * A new private-lesson purchase (with `registrationId` from the form). The
   * details are already collected, so the confirm step only asks how to book:
   * the first lesson, or the same day and time every week for the whole
   * package — and then goes to Stripe. Nothing is booked here: stripe-webhook
   * books the lesson(s) once the payment clears.
   */
  purchase?: { quantity: number; email: string; format: Format };
  /**
   * Which screen the scheduler is on, for a parent that heads it with a step
   * number. A private purchase is two screens — the times, then the summary
   * and the card — under one heading owned by the form above, which otherwise
   * keeps saying "choose a day and time" while you are paying.
   */
  onPhaseChange?: (phase: "pick" | "pay") => void;
}

interface AvailabilityResp {
  event_type: { name_ro: string; name_en: string; duration_min: number };
  slots: string[];
  slots_by_date: Record<string, string[]>;
}

function localDateKey(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(d); // YYYY-MM-DD
}
function fmtSlotTime(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function fmtTimeInTz(iso: string, tz: string) {
  return new Intl.DateTimeFormat("ro-RO", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function fmtFullLocal(iso: string, lang: "ro" | "en") {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
function fmtFullInTz(iso: string, lang: "ro" | "en", tz: string) {
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
function fmtDayHeader(dateKey: string, lang: "ro" | "en") {
  // dateKey YYYY-MM-DD interpreted as local date
  const [y = 1970, m = 1, d = 1] = dateKey.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(probe);
}

const NativeScheduler = ({
  eventType = "trial",
  prefill,
  defaultFormat = "online",
  onBooked,
  mode = "create",
  onPick,
  ensureRegistration,
  currentSlotIso,
  registrationId,
  purchase,
  onPhaseChange,
}: Props) => {
  const { t, lang } = useI18n();
  const showLocalTz = useShowLocalTz();
  const localTz = useMemo(() => getLocalTz(), []);
  const localTzLabel = useMemo(() => shortTzLabel(localTz), [localTz]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityResp | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Kept in step with the `selectedSlot && mode === "create" && purchase`
  // branch below, which is the screen that asks for the card.
  const payPhase = Boolean(selectedSlot) && mode === "create" && Boolean(purchase);
  useEffect(() => {
    onPhaseChange?.(payPhase ? "pay" : "pick");
  }, [payPhase, onPhaseChange]);
  const [confirmed, setConfirmed] = useState<{
    start_at: string;
    meet_link?: string | null | undefined;
    manage_token: string;
    end_at?: string | undefined;
    booking_id?: string | undefined;
  } | null>(null);
  // Trial-only: the server rejects a second free trial for the same email.
  const [trialUsed, setTrialUsed] = useState(false);
  /**
   * The free trial's email confirmation, held in this component on purpose.
   *
   * create-checkout-session and booking-create both require an Auth-confirmed
   * email matching the registration, which is the rule in AGENTS.md and is
   * not negotiable here. A first-time visitor has no account, so the card
   * step answered 403 and the free trial could not be completed by anyone who
   * was not already signed in.
   *
   * So the missing step is added rather than the gate removed: a six-digit
   * code to the address they just typed. Everything else — the slot, the
   * name, the phone, the notes, the format — stays in this component's state
   * while they read their email, because this is a branch of the same render
   * and not a different page. Nothing is re-entered, and the code screen
   * shows the slot so it is visible that nothing was lost.
   */
  const [verifyFor, setVerifyFor] = useState<{ email: string; registrationId: string } | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  // Resend cooldown. Supabase Auth rate-limits sends on its own; this stops
  // someone tapping the button six times while the first email is in flight
  // and then being locked out by that limit.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  // Paid lessons: every lesson the registration bought is already booked.
  const [lessonsUsedUp, setLessonsUsedUp] = useState(false);
  // Purchase: the embedded Stripe payment, once its intent is ready.
  const [embeddedPay, setEmbeddedPay] = useState<{
    clientSecret: string;
    stripe: Promise<StripeJs | null>;
    amount: number;
    currency: string;
  } | null>(null);
  // Trial-only: redirect state for the 0-lei card-on-file confirmation step.
  // The registration this booking ended up attached to. On /trial the row is
  // created at confirm time, so without keeping it here the card-confirmation
  // step never rendered (the prop is undefined for a fresh visitor).
  const [bookedRegistrationId, setBookedRegistrationId] = useState<string | null>(null);
  // Either the one handed in by the page, or the one created at confirm time.
  const effectiveRegistrationId = registrationId ?? bookedRegistrationId;

  // The no-show rule, stated before anyone picks a time rather than only in the
  // Stripe panel at the end. A held slot that nobody turns up for costs the
  // same as a private lesson, so the visitor is told that upfront.
  // When rescheduling ("pick") there is no card step, so only the 24-hour /
  // 150-lei rule is repeated there.
  const policyNotice =
    eventType === "trial" && mode === "pick" ? (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
        {lang === "ro" ? (
          <>
            Poți anula sau reprograma gratuit cu cel puțin 24 de ore înainte. Dacă nu te prezinți
            sau anulezi mai târziu de 24 de ore, se reține <strong>150 lei</strong>, cât o lecție
            privată.
          </>
        ) : (
          <>
            You can cancel or reschedule free of charge at least 24 hours ahead. If you do not show
            up, or cancel later than 24 hours, <strong>150 lei</strong> is charged — the price of a
            private lesson.
          </>
        )}
      </div>
    ) : eventType === "trial" ? (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
        {lang === "ro" ? (
          <>
            <strong>Înainte să alegi ora:</strong> proba costă 0 lei, dar la final îți confirmi locul
            cu cardul prin Stripe (nu se încasează nimic acum). Poți anula sau reprograma gratuit cu
            cel puțin 24 de ore înainte. Dacă nu te prezinți sau anulezi mai târziu de 24 de ore, se
            reține <strong>150 lei</strong>, cât o lecție privată.
          </>
        ) : (
          <>
            <strong>Before you pick a time:</strong> the trial costs 0 lei, but at the end you
            confirm your spot with your card through Stripe (nothing is charged now). You can cancel
            or reschedule free of charge at least 24 hours ahead. If you do not show up, or cancel
            later than 24 hours, <strong>150 lei</strong> is charged — the price of a private lesson.
          </>
        )}
      </div>
    ) : null;




  // Form fields
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [format, setFormat] = useState<Format>(purchase?.format ?? defaultFormat);
  // Purchase only: book the first lesson, or the same slot every week.
  const [weekly, setWeekly] = useState(false);
  const [notes, setNotes] = useState("");
  const [gdpr, setGdpr] = useState(false);

  const dateRange = useMemo(() => {
    const today = new Date();
    const from = localDateKey(today);
    const toDate = new Date(today.getTime() + 30 * 86400000);
    const to = localDateKey(toDate);
    return { from, to };
  }, []);

  const selectedSlotRef = useRef<string | null>(null);
  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  const loadAvailability = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const url =
          `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/booking-availability` +
          `?event_type=${eventType}&date_from=${dateRange.from}&date_to=${dateRange.to}` +
          `&format=${format}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "load failed");
        setData((prev) => {
          // Detect a selected slot that just got taken
          const stillAvailable: boolean =
            !selectedSlotRef.current || (json.slots ?? []).includes(selectedSlotRef.current);
          if (prev && !stillAvailable && selectedSlotRef.current) {
            toast.info(t.schedulerSlotTaken);
            setSelectedSlot(null);
          }
          return json;
        });
        setSelectedDate((prev) => {
          if (prev && (json.slots_by_date?.[prev]?.length ?? 0) > 0) return prev;
          return Object.keys(json.slots_by_date ?? {}).sort()[0] ?? null;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    // `format` is in here on purpose: an in-person trial is offered at
    // weekends only, so switching format changes which slots exist.
    [eventType, dateRange.from, dateRange.to, format, t.schedulerSlotTaken],
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Periodic refresh of slot availability (every 30s). We intentionally do NOT
  // subscribe to the `bookings` table via Realtime because rows contain PII
  // (student email/phone, manage_token, meet_link) that must not be broadcast
  // to anon/authenticated subscribers.
  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadAvailability({ silent: true });
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadAvailability]);

  const purchaseBooking = () => ({
    event_type: eventType,
    start_at: selectedSlot,
    format,
    language: lang,
    weekly: weekly && (purchase?.quantity ?? 1) > 1,
  });

  // Fallback: Stripe's hosted page with the chosen slot (when Stripe.js
  // cannot load in this browser — the same rule /checkout follows).
  const openHostedCheckout = async () => {
    if (!selectedSlot || !purchase || !registrationId) return;
    setSubmitting(true);
    const { data, error: fnError } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        registrationId,
        email: purchase.email,
        booking: purchaseBooking(),
      },
    });
    if (fnError || !data?.url) {
      console.error("[scheduler] could not open the payment page", fnError);
      toast.error(
        lang === "ro"
          ? "Nu am putut deschide pagina de plată. Nimic nu a fost rezervat — încearcă din nou."
          : "Could not open the payment page. Nothing was booked — please try again.",
      );
      setSubmitting(false);
      return;
    }
    window.location.href = data.url;
  };

  // Purchase: pay inside the site (Stripe Elements). The PaymentIntent carries
  // the slot; the webhook books it once the payment clears.
  const handlePay = async () => {
    if (!selectedSlot || !purchase || !registrationId) return;
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          courseType: "private",
          email: purchase.email,
          name: prefill?.name,
          registrationId,
          booking: purchaseBooking(),
        },
      });
      if (fnError || !data?.clientSecret || !data?.publishableKey || !(data.amount > 0)) {
        throw new Error("payment intent unavailable");
      }
      const stripe = await Promise.race<StripeJs | null>([
        loadStripe(data.publishableKey).catch(() => null),
        new Promise<null>((r) => window.setTimeout(() => r(null), 6000)),
      ]);
      if (!stripe) throw new Error("stripe.js unavailable");
      setEmbeddedPay({
        clientSecret: data.clientSecret,
        stripe: Promise.resolve(stripe),
        amount: data.amount,
        currency: data.currency ?? "ron",
      });
      setSubmitting(false);
    } catch (e) {
      console.warn("[scheduler] embedded payment unavailable, using hosted checkout", e);
      await openHostedCheckout();
    }
  };

  // A changed choice needs a fresh intent (its metadata holds the slot).
  useEffect(() => {
    setEmbeddedPay(null);
  }, [weekly, selectedSlot]);

  // Non-2xx from an edge function arrives as a FunctionsHttpError with the
  // original Response on .context; without reading it the structured codes
  // (trial_used, conflict) degrade to a generic failure toast.
  const readFunctionError = async (err: unknown): Promise<{ code?: string; error?: string } | null> => {
    const ctx = (err as { context?: Response } | null)?.context;
    if (!ctx || typeof ctx.json !== "function") return null;
    try {
      return (await ctx.json()) as { code?: string; error?: string };
    } catch {
      return null;
    }
  };

  /** Hands the visitor to Stripe for the 0-lei card save. */
  const startTrialCardStep = async (regId: string, slotIso: string) => {
    const { data: res, error: fnError } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        registrationId: regId,
        setup: true,
        email: email.trim(),
        booking: {
          event_type: eventType,
          start_at: slotIso,
          format,
          notes: notes.trim() || undefined,
          language: lang,
        },
      },
    });
    if (fnError || !res?.url) {
      const payload = await readFunctionError(fnError);
      // Checked before Stripe now, so a second trial is refused here rather
      // than after a card has been saved for nothing.
      if (payload?.code === "trial_used") {
        setTrialUsed(true);
        return;
      }
      console.error("[scheduler] could not open the card step", fnError);
      toast.error(
        payload?.error ??
          (lang === "ro"
            ? "Nu am putut deschide pagina Stripe. Intervalul nu a fost rezervat — încearcă din nou."
            : "Could not open the Stripe page. Your slot was not reserved — please try again."),
      );
      return;
    }
    window.location.href = res.url;
  };

  /**
   * True when Auth already holds a confirmed session for this address, so the
   * code screen can be skipped entirely — the owner testing the funnel, or
   * anyone coming back while their session is still alive.
   */
  const alreadyVerified = async (addr: string) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user?.email_confirmed_at && !user.is_anonymous && user.email?.trim().toLowerCase() === addr) {
      return true;
    }
    // A session for a different address has to go: Supabase keeps one per
    // client, and verifyOtp would otherwise be confirming the wrong person.
    // This does sign an admin out of the panel in the same browser if they
    // book a trial under another address, which is the rarer of the two.
    if (user) await supabase.auth.signOut();
    return false;
  };

  const sendCode = async (addr: string) => {
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true },
    });
    if (otpErr) {
      // Supabase Auth rate-limits sends per address and per IP; its message is
      // more use than ours would be.
      setCodeError(otpErr.message);
      return false;
    }
    setResendIn(60);
    return true;
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    if (mode === "create" && !registrationId && !ensureRegistration) {
      toast.error(t.schedulerBookingFailed);
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error(t.schedulerNameRequired);
      return;
    }
    // The phone number is not optional here either. A free trial that nobody
    // turns up to costs a real slot, and the phone is the only channel that
    // reliably reaches someone before the lesson — the placeholder used to say
    // "optional" and nothing validated it, so trials arrived with no number.
    if (!isValidPhone(phone)) {
      toast.error(t.validPhoneError);
      return;
    }
    if (!gdpr) {
      toast.error(t.bookingGdprRequired);
      return;
    }
    setSubmitting(true);
    try {
      // Either the caller already had a registration, or it makes one now from
      // what was just typed. Never both, and never a booking without one.
      const resolvedRegistrationId =
        registrationId ??
        (await ensureRegistration?.({ name: name.trim(), email: email.trim(), phone: phone.trim() })) ??
        null;
      if (mode === "create" && !resolvedRegistrationId) {
        toast.error(t.schedulerBookingFailed);
        setSubmitting(false);
        return;
      }
      setBookedRegistrationId(resolvedRegistrationId);

      // A free trial is not booked here. The card is the commitment, so the
      // slot goes to Stripe with the visitor and the booking is created by the
      // webhook once the card is actually saved — which is what survives them
      // closing the tab on Stripe's page.
      //
      // The lead is already safe: ensureRegistration wrote name, email and
      // phone above, so an abandoned card step still leaves someone to contact.
      if (eventType === "trial" && mode === "create" && resolvedRegistrationId) {
        // The card step needs a confirmed email, so it is asked for here if
        // Auth does not already have one. The slot and the typed details stay
        // in state; nothing is repeated afterwards.
        const addr = email.trim().toLowerCase();
        if (!(await alreadyVerified(addr))) {
          setCodeError(null);
          setCode("");
          const sent = await sendCode(addr);
          setVerifyFor({ email: email.trim(), registrationId: resolvedRegistrationId });
          if (!sent) {
            // Still show the screen: the message says why, and Resend is there.
            console.warn("[scheduler] could not send the confirmation code");
          }
          setSubmitting(false);
          return;
        }
        await startTrialCardStep(resolvedRegistrationId, selectedSlot);
        setSubmitting(false);
        return;
      }

      const res = await supabase.functions.invoke("booking-create", {
        body: {
          registration_id: resolvedRegistrationId,
          event_type: eventType,
          start_at: selectedSlot,
          format,
          student_name: name.trim(),
          student_email: email.trim(),
          student_phone: phone.trim(),
          notes: notes.trim() || undefined,
          language: lang,
          gdpr_consent: true,
        },
      });
      if (res.error) {
        // Non-2xx responses arrive as a FunctionsHttpError with the original
        // Response on .context — pull the JSON body out so the structured
        // codes (conflict / trial_used) survive instead of degrading to a
        // generic failure toast.
        const ctx = (res.error as { context?: Response }).context;
        let errPayload: { code?: string; error?: string } | null = null;
        if (ctx && typeof ctx.json === "function") {
          try {
            errPayload = await ctx.json();
          } catch {
            errPayload = null;
          }
        }
        if (errPayload?.code === "conflict") {
          toast.error(t.schedulerSlotTaken);
          setSelectedSlot(null);
          await loadAvailability();
          return;
        }
        if (errPayload?.code === "trial_used") {
          setTrialUsed(true);
          return;
        }
        if (errPayload?.code === "lessons_used_up") {
          setLessonsUsedUp(true);
          return;
        }
        if (errPayload?.code === "payment_required") {
          throw new Error(
            lang === "ro"
              ? "Lecția se poate programa după plată. Rezervă lecțiile din pagina lecțiilor private."
              : "The lesson can be booked once it is paid. Book your lessons from the private lessons page.",
          );
        }
        throw new Error(errPayload?.error ?? t.schedulerBookingFailed);
      }
      const payload = res.data as { ok: boolean; booking_id: string; manage_token: string; meet_link?: string | null; start_at: string; end_at?: string; code?: string; error?: string };
      if (!payload?.ok) {
        if (payload?.code === "conflict") {
          toast.error(t.schedulerSlotTaken);
          setSelectedSlot(null);
          await loadAvailability();
          return;
        }
        if (payload?.code === "lessons_used_up") {
          setLessonsUsedUp(true);
          return;
        }
        if (payload?.code === "trial_used") {
          setTrialUsed(true);
          return;
        }
        throw new Error(payload?.error ?? t.schedulerBookingFailed);
      }
      setConfirmed({
        start_at: payload.start_at,
        end_at: payload.end_at,
        meet_link: payload.meet_link ?? null,
        manage_token: payload.manage_token,
        booking_id: payload.booking_id,
      });
      onBooked?.({ booking_id: payload.booking_id, manage_token: payload.manage_token, meet_link: payload.meet_link });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.schedulerBookingFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (lessonsUsedUp) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 space-y-4">
        <p className="text-sm text-foreground">
          {lang === "ro"
            ? "Ai programat deja toate lecțiile plătite. Pentru mai multe lecții, rezervă un pachet nou din pagina lecțiilor private."
            : "You have already booked all the lessons you paid for. For more lessons, book a new package from the private lessons page."}
        </p>
        <Button asChild>
          <Link to={lang === "ro" ? "/cursuri/private#register" : "/en/courses/private#register"}>
            <Calendar className="w-4 h-4 mr-2" />
            {lang === "ro" ? "Lecțiile private" : "Private lessons"}
          </Link>
        </Button>
      </div>
    );
  }

  if (trialUsed) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 space-y-4">
        <h3 className="font-bold text-foreground">
          {lang === "ro" ? "Proba gratuită a fost deja folosită" : "The free trial was already used"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {lang === "ro"
            ? "Emailul tău are deja o probă gratuită programată sau ținută — proba e doar pentru prima lecție. Poți continua direct cu lecții plătite (150 lei/lecție) sau scrie-ne pe WhatsApp dacă crezi că e o greșeală."
            : "Your email already has a scheduled or completed free trial — the trial is for the first lesson only. You can continue with paid lessons (150 lei/lesson), or message us on WhatsApp if you think this is a mistake."}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            {/* The private-lessons form: details, day and time, then payment. */}
            <Link to="/cursuri/private#register">
              <Calendar className="w-4 h-4 mr-2" />
              {lang === "ro" ? "Programează o lecție plătită" : "Book a paid lesson"}
            </Link>
          </Button>
          {effectiveRegistrationId && (
            <Button asChild variant="outline" className="flex-1">
              <Link
                to={`/checkout?courseType=private&registrationId=${encodeURIComponent(effectiveRegistrationId)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {lang === "ro" ? "Plătește lecția" : "Pay for the lesson"}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1">
            <a href={WHATSAPP_FALLBACK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (verifyFor) {
    const en = lang === "en";
    const submitCode = async () => {
      const token = code.replace(/\D/g, "");
      if (token.length !== 6) {
        setCodeError(en ? "The code has six digits." : "Codul are șase cifre.");
        return;
      }
      setSubmitting(true);
      setCodeError(null);
      const { error: vErr } = await supabase.auth.verifyOtp({
        email: verifyFor.email.trim().toLowerCase(),
        token,
        type: "email",
      });
      if (vErr) {
        setCodeError(
          en
            ? "That code is wrong or has expired. Ask for a new one below."
            : "Codul e greșit sau a expirat. Cere unul nou mai jos.",
        );
        setSubmitting(false);
        return;
      }
      // Confirmed: straight on to the card step with the slot still selected.
      await startTrialCardStep(verifyFor.registrationId, selectedSlot ?? "");
      setSubmitting(false);
    };

    return (
      <div className="rounded-2xl border border-[#E7E1D6] bg-card p-5 sm:p-6 space-y-5 dark:border-border">
        <button
          type="button"
          onClick={() => {
            setVerifyFor(null);
            setCode("");
            setCodeError(null);
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {en ? "Change my email" : "Modifică emailul"}
        </button>

        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {en ? "Confirm your email" : "Confirmă adresa de email"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {en ? (
              <>
                We sent a six-digit code to <span className="font-medium text-foreground">{verifyFor.email}</span>.
                Type it here and we go straight on — you will not have to enter anything again.
              </>
            ) : (
              <>
                Ți-am trimis un cod de șase cifre la{" "}
                <span className="font-medium text-foreground">{verifyFor.email}</span>. Scrie-l aici și continuăm
                direct — nu mai trebuie să reintroduci nimic.
              </>
            )}
          </p>
        </div>

        {/* Shown so it is visible that the slot is still held in this screen. */}
        {selectedSlot && (
          <div className="rounded-xl bg-brand-green/5 border border-brand-green/20 px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">{fmtFullLocal(selectedSlot, lang)}</span>
            <span className="text-muted-foreground">
              {" "}
              · {en ? "your slot, still selected" : "intervalul tău, încă ales"}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="trial-code" className="block text-sm font-semibold text-foreground">
            {en ? "The code from the email" : "Codul din email"}
          </label>
          <input
            id="trial-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitCode();
            }}
            // one-time-code lets iOS and Android offer the code from the
            // notification, which is most of the friction gone on a phone.
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            aria-invalid={codeError ? true : undefined}
            aria-describedby={codeError ? "trial-code-error" : undefined}
            className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center font-mono text-2xl tracking-[0.4em] text-foreground"
            placeholder="······"
          />
          {codeError && (
            <p id="trial-code-error" role="alert" className="text-sm font-medium text-destructive">
              {codeError}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void submitCode()}
          disabled={submitting || code.length !== 6}
          className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {en ? "Confirm and continue" : "Confirmă și continuă"}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {en
              ? "No account, no password — the code only proves the address is yours."
              : "Fără cont și fără parolă — codul doar confirmă că adresa e a ta."}
          </span>
          <button
            type="button"
            disabled={resendIn > 0 || submitting}
            onClick={() => {
              setCodeError(null);
              void sendCode(verifyFor.email.trim().toLowerCase());
            }}
            className="font-semibold text-foreground underline underline-offset-2 disabled:no-underline disabled:opacity-60"
          >
            {resendIn > 0
              ? en
                ? `Resend in ${resendIn}s`
                : `Trimite din nou în ${resendIn}s`
              : en
                ? "Resend the code"
                : "Trimite codul din nou"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-lg border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          {t.schedulerLoadingSlots}
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6 px-4 rounded-lg border border-dashed border-border bg-muted/30">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground max-w-md">{t.bookingPlaceholder}</p>
        <a
          href={WHATSAPP_FALLBACK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    );
  }

  if (confirmed) {
    const manageUrl = `${window.location.origin}/booking/manage/${confirmed.manage_token}`;
    const handleIcs = () => {
      const endIso =
        confirmed.end_at ??
        new Date(new Date(confirmed.start_at).getTime() + (data?.event_type.duration_min ?? 60) * 60000).toISOString();
      const ics = buildIcs({
        uid: `${confirmed.booking_id ?? confirmed.manage_token}@centruldearabalibaneza.com`,
        title: `${t.icsTitlePrefix} — ${(lang === "ro" ? data?.event_type.name_ro : data?.event_type.name_en) ?? ""}`,
        description: confirmed.meet_link
          ? `${t.icsZoomLabel}: ${confirmed.meet_link}\n${t.icsManageLabel}: ${manageUrl}`
          : `${t.icsManageLabel}: ${manageUrl}`,
        location: confirmed.meet_link ?? "Raduga Creative Center, Strada Icoanei 80, București",
        startISO: confirmed.start_at,
        endISO: endIso,
        url: manageUrl,
        organizerEmail: "marhaba@centruldearabalibaneza.com",
        organizerName: "Ibra — Centrul de Arabă Libaneză",
        attendeeEmail: email || undefined,
        attendeeName: name || undefined,
      });
      downloadIcs(`lectie-${confirmed.booking_id ?? "araba"}.ics`, ics);
    };
    const courseName = lang === "ro" ? data.event_type.name_ro : data.event_type.name_en;
    const formatLabel = format === "online" ? t.bookingFormatOnline : t.bookingFormatPhysical;
    const startDate = new Date(confirmed.start_at);
    const dateStr = new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
      timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(startDate);
    const timeStr = new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
      timeZone: TZ, hour: "2-digit", minute: "2-digit",
    }).format(startDate);
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6 shadow-xs">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={2.5} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            {t.confirmedHeading}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.confirmedEmailNote}
          </p>
        </div>

        <div className="rounded-lg bg-muted/40 border border-border p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedDateLabel}</span>
            <span className="font-medium text-right">{dateStr}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedTimeLabel}</span>
            <span className="font-medium text-right">{timeStr}</span>
          </div>
          {showLocalTz && localTz !== TZ && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.tzYourTime} ({localTzLabel})</span>
              <span className="font-medium text-right">{fmtTimeInTz(confirmed.start_at, localTz)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedCourseLabel}</span>
            <span className="font-medium text-right">{courseName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t.confirmedFormatLabel}</span>
            <span className="font-medium text-right">{formatLabel}</span>
          </div>
          {format === "online" && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{t.bookingZoomNotice}</p>
            </div>
          )}
        </div>

        {/* The trial's card step used to live here, after the booking was
            already made — the screen said "Your booking is confirmed!" and then
            asked for a card, which told people they could simply walk away.
            The card now comes first, before anything is reserved, so by the
            time a trial exists it already has one. */}

        {/* No payment step here any more: a paid lesson can only be booked
            once it is paid (booking-create refuses otherwise), so whoever
            reaches this screen has already paid. */}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleIcs} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {t.bookingAddToCalendar}
          </Button>
          <Button asChild className="flex-1">
            <a href={manageUrl}>{t.bookingManageButton}</a>
          </Button>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          {t.confirmedBackHome}
        </Link>
      </div>
    );
  }

  const dateKeys = Object.keys(data.slots_by_date).sort();
  // Merge the current (own) slot into availability so the user can see it
  // highlighted even if it's outside the standard availability window.
  const slotsByDate: Record<string, string[]> = { ...data.slots_by_date };
  if (currentSlotIso) {
    const key = localDateKey(new Date(currentSlotIso));
    const list = slotsByDate[key] ? [...slotsByDate[key]] : [];
    if (!list.includes(currentSlotIso)) list.push(currentSlotIso);
    list.sort();
    slotsByDate[key] = list;
  }
  const mergedDateKeys = Object.keys(slotsByDate).sort();
  const slotsForDate = selectedDate ? slotsByDate[selectedDate] ?? [] : [];
  const availableDateSet = new Set(mergedDateKeys);
  const availableDates = mergedDateKeys.map((k) => {
    const [y = 1970, m = 1, d = 1] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const selectedDateObj = selectedDate
    ? (() => {
        const [y = 1970, m = 1, d = 1] = selectedDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;
  const minDate = availableDates[0];
  const maxDate = availableDates[availableDates.length - 1];

  if (mergedDateKeys.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8 px-4 rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground max-w-md">
          {t.schedulerNoSlots30d}
        </p>
        <a
          href={WHATSAPP_FALLBACK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    );
  }

  // Purchase: how to book, the total, and the way to Stripe.
  if (selectedSlot && mode === "create" && purchase) {
    const qty = Math.max(1, purchase.quantity);
    const unit = priceFor(ONLINE_PRICES.privateLesson, format === "physical" ? "fizic" : "online");
    const total = Math.round(unit * qty * (1 - privateDiscountFor(qty)));
    const when = fmtFullLocal(selectedSlot, lang);
    const choices: { id: boolean; title: string; text: string }[] = [
      {
        id: false,
        title: lang === "ro" ? "Doar prima lecție" : "Only the first lesson",
        text:
          lang === "ro"
            ? qty > 1
              ? "Celelalte lecții le programezi după plată, din pagina de confirmare, sau împreună cu Ibra."
              : "Lecția ta, la ora aleasă."
            : qty > 1
              ? "You book the other lessons after paying, from the confirmation page, or together with Ibra."
              : "Your lesson, at the time you picked.",
      },
      ...(qty > 1
        ? [
            {
              id: true,
              title:
                lang === "ro"
                  ? `Aceeași zi și oră, în fiecare săptămână (${qty} lecții)`
                  : `Same day and time, every week (${qty} lessons)`,
              text:
                lang === "ro"
                  ? "Toate lecțiile pachetului se programează acum, câte una pe săptămână."
                  : "Every lesson in the package is booked now, one a week.",
            },
          ]
        : []),
    ];
    return (
      <div className="rounded-2xl border border-[#E7E1D6] bg-card p-5 sm:p-6 space-y-5 dark:border-border">
        <button
          onClick={() => setSelectedSlot(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.schedulerBackToSlots}
        </button>
        <div className="rounded-xl bg-brand-green/5 border border-brand-green/20 px-4 py-3">
          <span className="font-semibold text-foreground">{when}</span>
          <span className="text-muted-foreground"> · {data.event_type.duration_min} min</span>
          {showLocalTz && localTz !== TZ && (
            <div className="mt-1 text-xs text-muted-foreground">
              {t.tzYourTime} ({localTzLabel}): <span className="font-medium text-foreground">{fmtFullInTz(selectedSlot, lang, localTz)}</span>
            </div>
          )}
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold text-foreground">
            {lang === "ro" ? "Cum programăm?" : "How should we book?"}
          </legend>
          {choices.map((c) => (
            <label
              key={String(c.id)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                weekly === c.id ? "border-brand-green bg-brand-green/5" : "border-border hover:border-brand-green/50",
              )}
            >
              <input
                type="radio"
                name="booking-plan"
                checked={weekly === c.id}
                onChange={() => setWeekly(c.id)}
                className="mt-1 accent-[hsl(var(--brand-green))]"
              />
              <span>
                <span className="block font-semibold text-foreground">{c.title}</span>
                <span className="block text-sm text-muted-foreground">{c.text}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">
            {qty} × {formatLei(unit)} lei{privateDiscountFor(qty) > 0 ? ` · −${Math.round(privateDiscountFor(qty) * 100)}%` : ""}
          </span>
          <span className="font-display text-2xl font-bold text-foreground">{formatLei(total)} lei</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {lang === "ro"
            ? "Lecția se confirmă după plată: primești confirmarea pe email, iar Ibra îți scrie ca să se prezinte. Dacă nu finalizezi plata, nu se rezervă nimic. Anularea sau reprogramarea e gratuită cu cel puțin 24 de ore înainte."
            : "The lesson is confirmed once paid: you get a confirmation email, and Ibra writes to introduce himself. If you don't complete the payment, nothing is booked. Cancelling or rescheduling is free at least 24 hours ahead."}
        </p>
        {embeddedPay && registrationId ? (
          <Elements
            stripe={embeddedPay.stripe}
            options={{ clientSecret: embeddedPay.clientSecret, appearance: { theme: "stripe" } }}
          >
            <InlinePrivatePay
              amount={embeddedPay.amount}
              currency={embeddedPay.currency}
              registrationId={registrationId}
              email={purchase.email}
              lang={lang}
              onLoadError={() => {
                setEmbeddedPay(null);
                void openHostedCheckout();
              }}
            />
          </Elements>
        ) : (
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {lang === "ro" ? `Plătește ${formatLei(total)} lei` : `Pay ${formatLei(total)} lei`}
          </button>
        )}
      </div>
    );
  }

  // Confirm form
  if (selectedSlot && mode === "create") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <button
          onClick={() => setSelectedSlot(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.schedulerBackToSlots}
        </button>
        <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
          <span className="font-semibold">{fmtFullLocal(selectedSlot, lang)}</span>
          <span className="text-muted-foreground"> · {data.event_type.duration_min} min</span>
          {showLocalTz && localTz !== TZ && (
            <div className="mt-1 text-xs text-muted-foreground">
              {t.tzYourTime} ({localTzLabel}): <span className="font-medium text-foreground">{fmtFullInTz(selectedSlot, lang, localTz)}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.schedulerNamePlaceholder}
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@…"
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.schedulerPhonePlaceholder}
            className="w-full px-3 py-2 rounded-md border border-input text-sm"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full px-3 py-2 rounded-md border border-input text-sm bg-background"
          >
            <option value="online">{t.bookingFormatOnline}</option>
            <option value="physical">{t.bookingFormatPhysical}</option>
          </select>
          {eventType === "trial" && format === "physical" && (
            // Without this the weekday slots simply disappear when you switch,
            // which reads as a bug rather than a rule.
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {t.schedulerPhysicalTrialWeekend}
            </p>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.schedulerNotesPlaceholder}
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-input text-sm resize-none"
        />
        <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
        {policyNotice}

        <button
          onClick={handleConfirm}
          disabled={submitting || !gdpr}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.schedulerConfirmButton}
        </button>
      </div>
    );
  }

  // Day picker + slots
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {t.schedulerPickDay}
        </h3>
        <span className="text-xs text-muted-foreground">{TZ}</span>
      </div>
      {policyNotice}
      <LocalTimezoneToggle />

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
        <div className="flex justify-center md:justify-start">
          <CalendarPicker
            mode="single"
            {...(selectedDateObj !== undefined ? { selected: selectedDateObj } : {})}
            onSelect={(d) => {
              if (d) setSelectedDate(localDateKey(d));
            }}
            {...((selectedDateObj ?? minDate) !== undefined ? { defaultMonth: (selectedDateObj ?? minDate) as Date } : {})}
            {...(minDate !== undefined ? { fromDate: minDate } : {})}
            {...(maxDate !== undefined ? { toDate: maxDate } : {})}
            disabled={(date) => !availableDateSet.has(localDateKey(date))}
            modifiers={{ available: availableDates }}
            modifiersClassNames={{
              available:
                "font-semibold text-primary after:content-[''] after:block after:w-1 after:h-1 after:rounded-full after:bg-primary after:mx-auto after:mt-0.5",
            }}
            locale={lang === "ro" ? roLocale : enLocale}
            weekStartsOn={1}
            className={cn("p-3 pointer-events-auto rounded-md border border-border")}
          />
        </div>
        <div className="space-y-3">
          {selectedDate && (
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {fmtDayHeader(selectedDate, lang)}
            </div>
          )}
          {/* Weekday evenings offer only a handful of slots while weekend days
              run all day. Someone who lands on a weekday sees three times,
              decides nothing fits and leaves — without ever discovering the
              open days. Point at the roomiest day in range instead of letting
              them find it by chance. Derived from the fetched availability, so
              it stays correct when the schedule changes. */}
          {(() => {
            if (!selectedDate || slotsForDate.length > 4) return null;
            const best = mergedDateKeys
              .filter((k) => k !== selectedDate)
              .map((k) => ({ k, n: slotsByDate[k]?.length ?? 0 }))
              .sort((a, b) => b.n - a.n)[0];
            if (!best || best.n < 6 || best.n < slotsForDate.length * 2) return null;
            return (
              <button
                type="button"
                onClick={() => setSelectedDate(best.k)}
                className="w-full text-left rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
              >
                {lang === "en" ? (
                  <>
                    Not many times here. <strong>{fmtDayHeader(best.k, lang)}</strong> has{" "}
                    <strong>{best.n} slots</strong> across the day — tap to see them.
                  </>
                ) : (
                  <>
                    Puține intervale aici. <strong>{fmtDayHeader(best.k, lang)}</strong> are{" "}
                    <strong>{best.n} intervale</strong> pe parcursul zilei — apasă ca să le vezi.
                  </>
                )}
              </button>
            );
          })()}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slotsForDate.map((iso) => {
              const isCurrent = currentSlotIso === iso;
              return (
                <button
                  key={iso}
                  onClick={() => {
                    if (isCurrent) return;
                    if (mode === "pick") {
                      onPick?.(iso);
                    } else {
                      setSelectedSlot(iso);
                    }
                  }}
                  disabled={isCurrent}
                  title={isCurrent ? t.manageCurrentSlotBadge : undefined}
                  className={cn(
                    // min-h-11 (44px) is the comfortable touch target on a
                    // phone; the previous 36px height made mis-taps likely in
                    // this dense grid. Desktop keeps the tighter look at sm:.
                    "px-2 py-2 min-h-11 sm:min-h-0 justify-center rounded-md border text-sm font-medium transition-colors flex flex-col items-center leading-tight",
                    isCurrent
                      ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 cursor-not-allowed"
                      : "border-border hover:border-primary hover:bg-primary/5",
                  )}
                >
                  <span>{fmtSlotTime(iso)}</span>
                  {showLocalTz && localTz !== TZ && (
                    <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                      {fmtTimeInTz(iso, localTz)}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] uppercase tracking-wide mt-0.5 text-amber-700">
                      {t.manageCurrentSlotBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {slotsForDate.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.schedulerNoTimesToday}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NativeScheduler;