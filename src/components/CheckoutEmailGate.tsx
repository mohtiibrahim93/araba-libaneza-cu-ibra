import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
/** Our own message, safe to show as it is. */
class WrongEmail extends Error {}

const isRateLimited = (failure: unknown) => {
  const f = failure as { status?: number; code?: string; message?: string };
  return (
    f?.status === 429 ||
    /rate|security purposes|seconds/i.test(String(f?.code ?? f?.message ?? ""))
  );
};

export default function CheckoutEmailGate({
  email,
  onVerified,
  onEmailEntered,
  english = false,
}: {
  email: string;
  onVerified: () => void;
  /**
   * The checkout page no longer carries the email in its address: a visitor
   * who arrives without it (a payment link opened from an email) types it
   * here, then verifies it like anyone else.
   */
  onEmailEntered?: (email: string) => void;
  english?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const [checking, setChecking] = useState(true),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [code, setCode] = useState(""),
    [error, setError] = useState("");
  const callback = useRef(onVerified);
  callback.current = onVerified;
  const matches = useCallback(
    (
      user:
        | {
            email?: string | undefined;
            email_confirmed_at?: string | undefined;
            is_anonymous?: boolean | undefined;
          }
        | null
        | undefined,
    ) =>
      !!user?.email_confirmed_at &&
      !user.is_anonymous &&
      user.email?.trim().toLowerCase() === email.trim().toLowerCase(),
    [email],
  );
  useEffect(() => {
    let active = true;
    setChecking(true);
    setSent(false);
    setError("");
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) {
          if (matches(data.user)) callback.current();
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [matches]);
  if (checking)
    return (
      <p role="status">
        {english ? "Checking your account…" : "Se verifică contul…"}
      </p>
    );
  if (!email && onEmailEntered)
    return (
      <form
        className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(typed.trim()))
            onEmailEntered(typed);
        }}
      >
        <label className="block space-y-1 text-sm">
          <span>
            {english
              ? "The email you registered with"
              : "Emailul cu care te-ai înscris"}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-3"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 w-full"
        >
          {english ? "Continue" : "Continuă"}
        </button>
      </form>
    );
  if (!email)
    return (
      <p role="alert">
        {english
          ? "A registration email is required to pay online. Please return to the form and add your email."
          : "Plata online necesită emailul înscrierii. Revino la formular și adaugă adresa de email."}
      </p>
    );
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">
        {english
          ? "Verify your registration email"
          : "Verifică emailul înscrierii"}
      </h2>
      <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
        {email}
      </p>
      <p className="text-sm text-muted-foreground">
        {english
          ? "We verify your email before opening payment. Verification does not save a card or confirm a payment."
          : "Verificăm emailul înainte de plată. Verificarea nu salvează un card și nu confirmă plata."}
      </p>
      {!sent ? (
        <button
          type="button"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 w-full"
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: true },
              });
              if (error) throw error;
              setSent(true);
            } catch (failure) {
              // Supabase's own text ("For security purposes, you can only
              // request this after 37 seconds") was shown raw (audit P1 #8).
              console.error("[checkout] send code failed", failure);
              setError(
                isRateLimited(failure)
                  ? english
                    ? "A code was sent a moment ago. Wait a minute, then try again."
                    : "Ți-am trimis un cod chiar acum. Așteaptă un minut și încearcă din nou."
                  : english
                    ? "We could not send the code. Try again in a minute."
                    : "Nu am putut trimite codul. Încearcă din nou peste un minut.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {english ? "Send code" : "Trimite codul"}
        </button>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: code.trim(),
                type: "email",
              });
              if (error) throw error;
              if (!matches(data.user))
                throw new WrongEmail(
                  english
                    ? "Use the email from your registration."
                    : "Folosește emailul înscrierii.",
                );
              callback.current();
            } catch (failure) {
              console.error("[checkout] verify code failed", failure);
              setError(
                failure instanceof WrongEmail
                  ? failure.message
                  : english
                    ? "That code is not right or has expired. Check the latest email, or send a new code."
                    : "Codul nu e corect sau a expirat. Verifică ultimul email sau cere un cod nou.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block">
            {english ? "Code received by email" : "Codul primit prin email"}
            <input
              className="mt-1.5 block h-12 w-full rounded-xl border border-input bg-background px-3 text-lg tracking-[0.3em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              required
              minLength={6}
              maxLength={10}
              disabled={busy}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 w-full"
          >
            {english ? "Verify email" : "Verifică emailul"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="w-full text-sm font-medium text-brand-green underline-offset-4 hover:underline"
            onClick={() => {
              setSent(false);
              setCode("");
            }}
          >
            {english ? "Send another code" : "Trimite alt cod"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
