import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
        className="space-y-3 rounded border p-4"
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
            className="h-11 w-full rounded-md border border-input bg-background px-3"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground"
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
    <section className="space-y-3 rounded border p-4">
      <h2 className="font-semibold">
        {english
          ? "Verify your registration email"
          : "Verifică emailul înscrierii"}
      </h2>
      <p className="text-sm">{email}</p>
      <p className="text-sm text-muted-foreground">
        {english
          ? "We verify your email before opening payment. Verification does not save a card or confirm a payment."
          : "Verificăm emailul înainte de plată. Verificarea nu salvează un card și nu confirmă plata."}
      </p>
      {!sent ? (
        <button
          type="button"
          disabled={busy}
          className="rounded bg-primary p-2 text-primary-foreground"
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
              setError(
                failure instanceof Error
                  ? failure.message
                  : "Nu am putut trimite codul.",
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
                throw new Error(
                  english
                    ? "Use the email from your registration."
                    : "Folosește emailul înscrierii.",
                );
              callback.current();
            } catch (failure) {
              setError(
                failure instanceof Error
                  ? failure.message
                  : "Verificare eșuată.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block">
            {english ? "Code received by email" : "Codul primit prin email"}
            <input
              className="mt-1 block rounded border p-2"
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
            className="rounded bg-primary p-2 text-primary-foreground"
          >
            {english ? "Verify email" : "Verifică emailul"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="ml-3"
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
