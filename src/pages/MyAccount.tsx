import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  MessageCircle,
  RefreshCw,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/LocalizedLink";
import { StudentAccountBox } from "@/components/StudentAccount";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_CONTACT_URL } from "@/lib/social";
import { paymentStatusText } from "@/lib/myPayments";
import {
  enrolmentTitle,
  formatDay,
  formatLei,
  paymentMonths,
  type AccountEnrolment,
  type Lang,
} from "@/lib/myAccount";

/**
 * "Contul meu" (owner, 14 Nov 2026): one page where a signed-in student sees
 * their courses, which months are paid, their payments and booked lessons,
 * and can pay the next month of a group course by card.
 *
 * The sign-in is the one the game already uses (email link or Google). What
 * the page shows comes from /api/public/my-account, which asks Supabase Auth
 * who the caller is; the page never says whose data it wants.
 */
interface AccountBooking {
  id: string;
  event_type_slug: string;
  start_at: string;
  end_at: string;
  status: string;
  format: string;
  meet_link: string | null;
  manage_token: string;
  booking_event_types: { name_ro: string; name_en: string } | null;
}

interface AccountData {
  email: string;
  enrolments: AccountEnrolment[];
  bookings: AccountBooking[];
}

const COPY = {
  ro: {
    h1: "Contul meu",
    lead: "Cursurile tale, lunile plătite și lecțiile rezervate, într-un singur loc.",
    loading: "Se încarcă datele tale…",
    error: "Nu am putut încărca datele tale. Încearcă din nou.",
    retry: "Încearcă din nou",
    emptyTitle: "Nu am găsit nicio înscriere pentru această adresă",
    emptyText:
      "Dacă te-ai înscris cu altă adresă de email, ieși din cont și intră cu aceea. Dacă nu știi care este, scrie-ne.",
    whatsapp: "Scrie-ne pe WhatsApp",
    courses: "Cursurile mele",
    signedUp: "Înscris pe",
    upToDate: "Plătit la zi",
    due: "Lună de plătit",
    left: "Retras din grupă",
    finished: "Curs încheiat",
    monthsTitle: "Lunile cursului",
    month: "Luna",
    monthPaid: "plătită",
    monthGranted: "acordată",
    monthDue: "de plătit",
    monthLater: "urmează",
    next: "Următoarea plată",
    of: "din",
    dueNow: "scadentă acum",
    dueFrom: "scadentă din",
    pay: "Plătește luna",
    byCard: "cu cardul",
    payNote:
      "Plătești o singură lună. După aceea nu se face nicio plată automată.",
    subscription: "Lunile se plătesc automat de pe card, prin abonament.",
    allPaid: "Toate lunile sunt plătite.",
    lessonsInPackage: "lecții în pachet",
    payments: "Plăți",
    granted: "Lună acordată",
    refunded: "Rambursat",
    total: "Total plătit",
    preparing: "Se pregătește plata securizată…",
    payFailed: "Plata nu a reușit. Încearcă din nou.",
    prepareFailed:
      "Plata nu a putut fi pregătită. Încearcă din nou peste un minut sau scrie-ne pe WhatsApp.",
    alreadyReceived:
      "Plata pentru această lună a fost deja primită și se înregistrează.",
    nothingToPay: "Nu mai este nimic de plătit pentru această lună.",
    submit: "Plătește",
    processing: "Se procesează…",
    cancel: "Renunță",
    paidTitle: "Plata a fost primită",
    paidWait: "Luna apare ca plătită în câteva secunde.",
    paidDone: "Luna este înregistrată ca plătită. Mulțumim!",
    paidSlow:
      "Dacă luna nu apare ca plătită în câteva minute, scrie-ne pe WhatsApp.",
    lessons: "Lecțiile mele rezervate",
    noLessons: "Nu ai lecții rezervate de acum înainte.",
    online: "Online",
    physical: "La centru, București",
    join: "Intră la lecție",
    manage: "Reprogramează sau anulează",
    help: "Ai o întrebare despre plăți sau vrei să renunți la un curs?",
  },
  en: {
    h1: "My account",
    lead: "Your courses, paid months and booked lessons, in one place.",
    loading: "Loading your details…",
    error: "We could not load your details. Please try again.",
    retry: "Try again",
    emptyTitle: "We found no sign-up for this address",
    emptyText:
      "If you signed up with another email address, sign out and sign in with that one. If you are not sure which, message us.",
    whatsapp: "Message us on WhatsApp",
    courses: "My courses",
    signedUp: "Signed up on",
    upToDate: "Paid up to date",
    due: "A month is due",
    left: "Left the group",
    finished: "Course finished",
    monthsTitle: "The months of the course",
    month: "Month",
    monthPaid: "paid",
    monthGranted: "granted",
    monthDue: "due",
    monthLater: "later",
    next: "Next payment",
    of: "of",
    dueNow: "due now",
    dueFrom: "due from",
    pay: "Pay month",
    byCard: "by card",
    payNote:
      "You pay one month only. Nothing is charged automatically after it.",
    subscription:
      "The months are charged automatically to your card, by subscription.",
    allPaid: "Every month is paid.",
    lessonsInPackage: "lessons in the package",
    payments: "Payments",
    granted: "Granted month",
    refunded: "Refunded",
    total: "Total paid",
    preparing: "Preparing the secure payment…",
    payFailed: "The payment did not go through. Please try again.",
    prepareFailed:
      "The payment could not be prepared. Please try again in a minute or message us on WhatsApp.",
    alreadyReceived:
      "The payment for this month has already been received and is being recorded.",
    nothingToPay: "There is nothing left to pay for this month.",
    submit: "Pay",
    processing: "Processing…",
    cancel: "Cancel",
    paidTitle: "Payment received",
    paidWait: "The month will show as paid in a few seconds.",
    paidDone: "The month is recorded as paid. Thank you!",
    paidSlow:
      "If the month does not show as paid in a few minutes, message us on WhatsApp.",
    lessons: "My booked lessons",
    noLessons: "You have no lessons booked from now on.",
    online: "Online",
    physical: "At the centre, Bucharest",
    join: "Join the lesson",
    manage: "Reschedule or cancel",
    help: "A question about payments, or want to leave a course?",
  },
} as const;
type Copy = (typeof COPY)[Lang];

const card =
  "rounded-2xl border border-[#E7E1D6] bg-card p-5 sm:p-6 dark:border-border";

/** The server's JSON for a failed function call, when there is one. */
async function invokeErrorBody(
  err: unknown,
): Promise<{ error?: unknown; code?: unknown } | null> {
  const ctx = (err as { context?: Response })?.context;
  if (!ctx || typeof ctx.json !== "function") return null;
  try {
    const body = await ctx.clone().json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

async function fetchAccount(
  token: string,
): Promise<AccountData | "signed-out"> {
  const res = await fetch("/api/public/my-account", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return "signed-out";
  if (!res.ok) throw new Error(`my-account ${res.status}`);
  return (await res.json()) as AccountData;
}

// ---------------------------------------------------------------------------
// Paying one month
// ---------------------------------------------------------------------------

const CardForm = ({
  c,
  amount,
  returnUrl,
  onPaid,
  onCancel,
}: {
  c: Copy;
  amount: string;
  returnUrl: string;
  onPaid: () => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    // A card that needs no bank page is confirmed right here; one that does
    // (3-D Secure in another window) comes back to returnUrl.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (error) {
      toast.error(error.message || c.payFailed);
      setBusy(false);
      return;
    }
    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    )
      onPaid();
    else setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <PaymentElement />
      <p className="text-xs text-muted-foreground">{c.payNote}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={!stripe || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <CreditCard />}
          {busy ? c.processing : `${c.submit} ${amount}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {c.cancel}
        </Button>
      </div>
    </form>
  );
};

/** The "pay month N by card" button and, once pressed, the card form. */
const MonthPayment = ({
  c,
  lang,
  enrolment,
  onPaid,
}: {
  c: Copy;
  lang: Lang;
  enrolment: AccountEnrolment;
  onPaid: (registrationId: string, month: number) => void;
}) => {
  const next = enrolment.nextPayment!;
  const [phase, setPhase] = useState<"idle" | "preparing" | "ready">("idle");
  const [secret, setSecret] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);
  const [paidMonth, setPaidMonth] = useState(next.month);
  const amount = formatLei(next.amountLei, lang);

  const start = async () => {
    setPhase("preparing");
    const { data, error } = await supabase.functions.invoke(
      "create-month-payment",
      { body: { registrationId: enrolment.id } },
    );
    if (error || !data?.clientSecret || !data?.publishableKey) {
      const body = error ? await invokeErrorBody(error) : null;
      toast.error(
        body?.code === "processing"
          ? c.alreadyReceived
          : body?.code === "all_paid"
            ? c.nothingToPay
            : c.prepareFailed,
      );
      setPhase("idle");
      return;
    }
    setSecret(data.clientSecret as string);
    setPaidMonth(Number(data.month) || next.month);
    setStripe((s) => s ?? loadStripe(data.publishableKey as string));
    setPhase("ready");
  };

  // Where the bank sends the student back after a 3-D Secure page: this same
  // page, with the sign-up and the month so it can say what was paid.
  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href.split("#")[0]!);
    url.search = "";
    url.searchParams.set("paid", enrolment.id);
    url.searchParams.set("month", String(paidMonth));
    return url.toString();
  }, [enrolment.id, paidMonth]);

  return (
    <div className="mt-4 rounded-xl bg-brand-green/5 p-4">
      <p className="text-sm text-foreground">
        <strong>
          {c.next}: {c.month.toLowerCase()} {next.month} {c.of} {next.total} ·{" "}
          {amount}
        </strong>{" "}
        <span className="text-muted-foreground">
          (
          {next.due || !next.dueFrom
            ? c.dueNow
            : `${c.dueFrom} ${formatDay(next.dueFrom, lang)}`}
          )
        </span>
      </p>
      {phase === "ready" && secret && stripe ? (
        <Elements
          key={secret}
          stripe={stripe}
          options={{ clientSecret: secret, appearance: { theme: "stripe" } }}
        >
          <CardForm
            c={c}
            amount={amount}
            returnUrl={returnUrl}
            onPaid={() => {
              setPhase("idle");
              setSecret(null);
              onPaid(enrolment.id, paidMonth);
            }}
            onCancel={() => {
              setPhase("idle");
              setSecret(null);
            }}
          />
        </Elements>
      ) : (
        <Button
          className="mt-3"
          disabled={phase === "preparing"}
          onClick={() => void start()}
        >
          {phase === "preparing" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <CreditCard />
          )}
          {phase === "preparing"
            ? c.preparing
            : `${c.pay} ${next.month} ${c.byCard} · ${amount}`}
        </Button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// One course
// ---------------------------------------------------------------------------

const monthTone: Record<string, string> = {
  paid: "border-brand-green/40 bg-brand-green/10 text-foreground",
  granted: "border-brand-green/40 bg-brand-green/10 text-foreground",
  due: "border-primary/50 bg-primary/5 text-foreground",
  later: "border-border bg-muted/40 text-muted-foreground",
};

const EnrolmentCard = ({
  c,
  lang,
  enrolment: e,
  onPaid,
}: {
  c: Copy;
  lang: Lang;
  enrolment: AccountEnrolment;
  onPaid: (registrationId: string, month: number) => void;
}) => {
  const schedule = lang === "en" ? e.group?.scheduleEn : e.group?.scheduleRo;
  const totalPaid = e.payments.reduce((sum, p) => sum + p.amountLei, 0);
  const status = e.left
    ? c.left
    : e.months
      ? e.monthsStatus === "unpaid"
        ? c.due
        : e.group?.finished
          ? c.finished
          : c.upToDate
      : paymentStatusText(e.paymentStatus, lang);
  const owing = !e.left && e.monthsStatus === "unpaid";

  return (
    <article className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {enrolmentTitle(e, lang)}
          </h3>
          {schedule && (
            <p className="mt-1 text-sm text-muted-foreground">{schedule}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {c.signedUp} {formatDay(e.signedUpAt, lang)}
            {e.lessons ? ` · ${e.lessons} ${c.lessonsInPackage}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            owing
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {status}
        </span>
      </div>

      {e.months && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">
            {c.monthsTitle}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {e.months.map((m) => {
              const tone =
                m.state === "unpaid"
                  ? m.due && !e.left
                    ? "due"
                    : "later"
                  : m.state;
              const word =
                m.state === "paid"
                  ? c.monthPaid
                  : m.state === "granted"
                    ? c.monthGranted
                    : m.due && !e.left
                      ? c.monthDue
                      : c.monthLater;
              return (
                <li
                  key={m.month}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${monthTone[tone]}`}
                >
                  {c.month} {m.month}: <strong>{word}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {e.nextPayment ? (
        <MonthPayment c={c} lang={lang} enrolment={e} onPaid={onPaid} />
      ) : e.subscription ? (
        <p className="mt-4 text-sm text-muted-foreground">{c.subscription}</p>
      ) : e.noPaymentReason === "all_paid" ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-brand-green" aria-hidden />
          {c.allPaid}
        </p>
      ) : null}

      {e.payments.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">{c.payments}</p>
          <ul className="mt-1 divide-y divide-border text-sm">
            {e.payments.map((p, i) => {
              const months = paymentMonths(p, lang);
              return (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <span className="text-muted-foreground">
                    {formatDay(p.paidAt, lang)}
                    {months ? ` · ${months}` : ""}
                  </span>
                  <span className="font-medium text-foreground">
                    {p.granted ? c.granted : formatLei(p.amountLei, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            {c.total}: {formatLei(totalPaid, lang)}
            {e.refundedLei > 0
              ? ` · ${c.refunded}: ${formatLei(e.refundedLei, lang)}`
              : ""}
          </p>
        </div>
      )}
    </article>
  );
};

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const MyAccount = ({ lang }: { lang: Lang }) => {
  const c = COPY[lang];
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AccountData | null>(null);
  const [failed, setFailed] = useState(false);
  const [paid, setPaid] = useState<"waiting" | "done" | "slow" | null>(null);
  const polling = useRef(false);

  useEffect(() => {
    let off = false;
    void supabase.auth.getSession().then(({ data: s }) => {
      if (off) return;
      setSession(s.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      off = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // An anonymous session (used elsewhere on the site) is not an account.
  const user =
    session?.user && !session.user.is_anonymous ? session.user : null;
  const token = user ? (session?.access_token ?? null) : null;

  const load = useCallback(async () => {
    if (!token) return null;
    try {
      const fresh = await fetchAccount(token);
      if (fresh === "signed-out") {
        setData(null);
        return null;
      }
      setFailed(false);
      setData(fresh);
      return fresh;
    } catch (err) {
      console.error("[my-account] load failed", err);
      setFailed(true);
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setData(null);
      return;
    }
    void load();
  }, [token, load]);

  // After a payment the webhook writes the month a few seconds later: ask
  // again until it shows, then say so; if it takes long, say what to do.
  const waitForMonth = useCallback(
    async (registrationId: string, month: number) => {
      if (polling.current) return;
      polling.current = true;
      setPaid("waiting");
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const fresh = await load();
        const months = fresh?.enrolments.find(
          (e) => e.id === registrationId,
        )?.months;
        if (months && months[month - 1]?.state !== "unpaid") {
          polling.current = false;
          setPaid("done");
          return;
        }
      }
      polling.current = false;
      setPaid("slow");
    },
    [load],
  );

  // Back from the bank's page (3-D Secure): Stripe adds redirect_status and
  // the payment's client secret to the address. Read what is needed, then
  // take them out of the address bar.
  useEffect(() => {
    if (!token || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const registrationId = url.searchParams.get("paid");
    if (!registrationId) return;
    const month = Number(url.searchParams.get("month")) || 0;
    const outcome = url.searchParams.get("redirect_status");
    url.search = "";
    window.history.replaceState(null, "", url.toString());
    if (outcome === "succeeded" && month > 0)
      void waitForMonth(registrationId, month);
    else if (outcome === "failed") toast.error(c.payFailed);
  }, [token, waitForMonth, c.payFailed]);

  const now = Date.now();
  const upcoming = (data?.bookings ?? [])
    .filter((b) => b.status === "confirmed" && Date.parse(b.end_at) > now)
    .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      {/* pt-36 clears the fixed header (band + navbar). */}
      <div className="bg-cream pt-36 pb-12">
        <div className="mx-auto w-full max-w-4xl px-gutter">
          <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {c.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {c.lead}
          </p>
        </div>
      </div>
      <main
        id="main-content"
        className="mx-auto w-full max-w-4xl px-gutter pb-16"
      >
        <div className="mt-10">
          {ready ? (
            <StudentAccountBox user={user} syncing={false} purpose="account" />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {c.loading}
            </p>
          )}
        </div>

        {user && !data && !failed && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {c.loading}
          </p>
        )}

        {user && failed && !data && (
          <div className={`${card} mt-8`}>
            <p className="text-sm text-foreground">{c.error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => void load()}
            >
              <RefreshCw /> {c.retry}
            </Button>
          </div>
        )}

        {paid && (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-brand-green/40 bg-brand-green/5 p-5"
          >
            <p className="flex items-center gap-2 font-semibold text-foreground">
              {paid === "waiting" ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-brand-green" />
              )}
              {c.paidTitle}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {paid === "waiting"
                ? c.paidWait
                : paid === "done"
                  ? c.paidDone
                  : c.paidSlow}
            </p>
          </div>
        )}

        {user && data && data.enrolments.length === 0 && (
          <div className={`${card} mt-8`}>
            <h2 className="font-display text-xl font-bold text-foreground">
              {c.emptyTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.emptyText}</p>
            <Button asChild variant="outline" className="mt-4">
              <a
                href={WHATSAPP_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle /> {c.whatsapp}
              </a>
            </Button>
          </div>
        )}

        {user && data && data.enrolments.length > 0 && (
          <section className="mt-10 space-y-5">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {c.courses}
            </h2>
            {data.enrolments.map((e) => (
              <EnrolmentCard
                key={e.id}
                c={c}
                lang={lang}
                enrolment={e}
                onPaid={(id, month) => void waitForMonth(id, month)}
              />
            ))}
          </section>
        )}

        {user && data && (
          <section className="mt-12 space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {c.lessons}
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">{c.noLessons}</p>
            ) : (
              upcoming.map((b) => (
                <article
                  key={b.id}
                  className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <Calendar
                        className="h-4 w-4 text-brand-green"
                        aria-hidden
                      />
                      {new Intl.DateTimeFormat(
                        lang === "en" ? "en-GB" : "ro-RO",
                        {
                          timeZone: "Europe/Bucharest",
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      ).format(new Date(b.start_at))}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(lang === "en"
                        ? b.booking_event_types?.name_en
                        : b.booking_event_types?.name_ro) ?? ""}
                      {" · "}
                      {b.format === "online" ? c.online : c.physical}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.format === "online" && b.meet_link && (
                      <Button asChild size="sm">
                        <a
                          href={b.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video /> {c.join}
                        </a>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/booking/manage/${b.manage_token}`}>
                        {c.manage}
                      </Link>
                    </Button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {user && data && (
          <p className="mt-12 text-sm text-muted-foreground">
            {c.help}{" "}
            <a
              href={WHATSAPP_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline"
            >
              {c.whatsapp}
            </a>
            .
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyAccount;
