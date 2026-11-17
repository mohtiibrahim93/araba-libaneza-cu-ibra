import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

/**
 * The student's request to start lessons inside the 14-day withdrawal period
 * (owner, 17 Nov 2026: "protect me from free lessons"; Terms, section 4).
 *
 * A card payment for a group that starts within 14 days asks for it with a
 * box the student ticks, and records it by itself. A student who pays by
 * transfer, cash or at the centre never sees that box: when they ask by email
 * or WhatsApp, the owner records it here, with the day it was received. With
 * it, lessons held are paid if the student withdraws in the 14 days; without
 * it, everything goes back.
 */
const EarlyStartConsent = ({
  registrationId,
  requestedAt,
  onDone,
}: {
  registrationId: string;
  requestedAt: string | null | undefined;
  onDone?: (() => void) | undefined;
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [receivedOn, setReceivedOn] = useState(() =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(
      new Date(),
    ),
  );

  const save = async (requested: boolean) => {
    if (
      !requested &&
      !window.confirm(
        "Ștergi cererea? Dacă se retrage în cele 14 zile, primește tot înapoi, inclusiv lecțiile ținute.",
      )
    )
      return;
    setBusy(true);
    setError("");
    const { data, error: err } = await invokeAdmin<{ error?: string }>({
      action: "set_early_start",
      id: registrationId,
      requested,
      ...(requested ? { received_on: receivedOn } : {}),
    });
    setBusy(false);
    if (err || data?.error)
      return setError(data?.error ?? "Nu am putut salva.");
    setOpen(false);
    onDone?.();
  };

  const day = (iso: string) =>
    new Date(iso).toLocaleString("ro-RO", {
      timeZone: "Europe/Bucharest",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
      <p className="font-semibold text-foreground">
        Începerea în cele 14 zile de retragere
      </p>
      {requestedAt ? (
        <>
          <p className="text-muted-foreground">
            A cerut ca lecțiile să înceapă în cele 14 zile: {day(requestedAt)}.
            Dacă se retrage în acest timp, plătește lecțiile ținute.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save(false)}
            className="text-xs font-semibold text-muted-foreground underline hover:text-foreground disabled:opacity-60"
          >
            Șterge cererea (înregistrată din greșeală)
          </button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            Nu a cerut. Dacă grupa începe în cele 14 zile de la înscriere și se
            retrage în acest timp, primește tot înapoi, inclusiv lecțiile
            ținute.
          </p>
          {open ? (
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs font-semibold text-foreground">
                Primită pe (email sau WhatsApp)
                <input
                  type="date"
                  className="mt-1 block h-9 rounded-lg border border-input bg-background px-2 text-sm"
                  value={receivedOn}
                  onChange={(e) => setReceivedOn(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={busy || !receivedOn}
                onClick={() => void save(true)}
                className="inline-flex min-h-9 items-center rounded-lg bg-foreground px-3 text-sm font-semibold text-background disabled:opacity-60"
              >
                Înregistrează
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-sm"
              >
                Renunță
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted"
            >
              Înregistrează cererea primită pe email sau WhatsApp
            </button>
          )}
        </>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
};

export default EarlyStartConsent;
