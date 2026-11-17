import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

/**
 * Withdrawals, cancellations and moves the student sent from "Contul meu"
 * (owner, 17 Nov 2026; Terms, section 4), on their sheet: when, the
 * statement as sent, what they were shown, and "Rezolvată" once the refund,
 * the credit or the move is done. While a withdrawal or a cancellation is
 * open, the refund buttons count from the moment it was sent.
 */
interface Request {
  id: string;
  kind: "withdrawal" | "cancellation" | "transfer";
  requested_at: string;
  statement: string;
  shown: {
    paidLei?: number;
    backLei?: number;
    creditLei?: number;
    keptLei?: number;
    cancelFeeLei?: number;
    stripeFee?: boolean;
    certain?: boolean;
  } | null;
  subscription_stopped_at: string | null;
  acknowledged_at: string | null;
  handled_at: string | null;
  handled_by: string | null;
  handled_note: string | null;
}

const KIND = {
  withdrawal: "Retragere din contract (14 zile)",
  cancellation: "Anulare",
  transfer: "Cerere de mutare în altă grupă",
} as const;

const when = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CancelRequests = ({
  registrationId,
  onDone,
}: {
  registrationId: string;
  onDone?: (() => void) | undefined;
}) => {
  const [rows, setRows] = useState<Request[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await invokeAdmin<{
      data?: Request[];
      error?: string;
    }>({ action: "list_cancel_requests", registration_id: registrationId });
    if (err || data?.error) {
      setRows([]);
      return;
    }
    setRows(data?.data ?? []);
  }, [registrationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (id: string) => {
    const note = window.prompt(
      "Cererea e rezolvată. O notă scurtă (opțional), de ex. „rambursat 500 lei pe 20 nov”:",
      "",
    );
    if (note === null) return;
    setBusy(true);
    setError("");
    const { data, error: err } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({ action: "resolve_cancel_request", id, note });
    setBusy(false);
    if (err || data?.error || data?.success !== true)
      return setError(data?.error ?? "Nu am putut salva.");
    await load();
    onDone?.();
  };

  if (!rows?.length) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border p-3 text-sm">
      <p className="font-semibold text-foreground">Cereri din Contul meu</p>
      {rows.map((r) => (
        <div key={r.id} className="space-y-1">
          <p className="text-foreground">
            <b>{KIND[r.kind]}</b> · trimisă pe {when(r.requested_at)}
            {r.handled_at ? ` · rezolvată pe ${when(r.handled_at)}` : ""}
          </p>
          <p className="rounded-lg bg-muted/50 p-2 text-foreground">
            „{r.statement}”
          </p>
          {r.kind !== "transfer" && r.shown && (
            <p className="text-muted-foreground">
              {r.shown.certain === false
                ? "Nu i s-a arătat o sumă: lecțiile grupei nu erau toate în sistem. Calculeaz-o după Termeni."
                : `I s-a arătat: plătit ${r.shown.paidLei ?? 0} lei · înapoi ${r.shown.backLei ?? 0} lei${r.shown.stripeFee ? " (minus comisionul Stripe)" : ""} · credit ${r.shown.creditLei ?? 0} lei · lecții ținute ${r.shown.keptLei ?? 0} lei${r.shown.cancelFeeLei ? ` · taxa de 10% ${r.shown.cancelFeeLei} lei` : ""}.`}
            </p>
          )}
          {r.subscription_stopped_at && (
            <p className="text-muted-foreground">
              Abonamentul cu cardul a fost oprit pe{" "}
              {when(r.subscription_stopped_at)}.
            </p>
          )}
          {!r.acknowledged_at && !r.handled_at && (
            <p className="font-semibold text-destructive">
              Confirmarea pe email nu a plecat: trimite-i-o tu, cu data și ora
              de mai sus.
            </p>
          )}
          {r.handled_note && (
            <p className="text-muted-foreground">Notă: {r.handled_note}</p>
          )}
          {!r.handled_at && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void resolve(r.id)}
              className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"
            >
              Rezolvată
            </button>
          )}
        </div>
      ))}
      {rows.some((r) => !r.handled_at && r.kind !== "transfer") && (
        <p className="text-xs text-muted-foreground">
          Cât timp cererea e deschisă, rambursarea se calculează de la data
          trimiterii. Apasă „Rezolvată” după ce ai rambursat sau ai dat
          creditul.
        </p>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
};

export default CancelRequests;
