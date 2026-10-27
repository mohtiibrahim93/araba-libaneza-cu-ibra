import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type TrialOutcome = "done" | "excused" | "lost" | null;

export interface TrialBookingLike {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  trial_outcome?: TrialOutcome;
}

const DAY_MS = 86_400_000;

/**
 * The owner's rules for a free trial (12 October 2026):
 * - it took place → used; 24h after the lesson with nothing marked it counts
 *   as done by itself;
 * - cancelled by the centre, or by the student more than 24h ahead → not used;
 * - late cancellation or no-show → the owner decides: excused (not used) or
 *   lost (used).
 * Returns what the admin should read for this booking, and whether the trial
 * is used up by it. Mirrors trial_booking_counts in the database.
 */
export function trialOutcomeState(
  b: TrialBookingLike,
  now = Date.now(),
): { label: string; used: boolean; automatic: boolean } {
  if (b.trial_outcome === "done")
    return { label: "A venit", used: true, automatic: false };
  if (b.trial_outcome === "excused")
    return {
      label: "Nu a venit — scuzat (proba rămâne disponibilă)",
      used: false,
      automatic: false,
    };
  if (b.trial_outcome === "lost")
    return {
      label: "Pierdută (proba e folosită)",
      used: true,
      automatic: false,
    };
  if (b.status === "cancelled")
    return {
      label: "Anulată — proba rămâne disponibilă",
      used: false,
      automatic: true,
    };
  const ended = Date.parse(b.end_at);
  if (Number.isFinite(ended) && now >= ended + DAY_MS)
    return { label: "Făcută (automat, după 24h)", used: true, automatic: true };
  if (Number.isFinite(ended) && now >= ended)
    return { label: "De marcat: a venit?", used: true, automatic: true };
  return { label: "Programată", used: true, automatic: true };
}

/** A small select the owner uses to mark a trial; hidden before the lesson starts unless it was cancelled. */
export function TrialOutcomeControl({
  booking,
  onChanged,
}: {
  booking: TrialBookingLike;
  onChanged?: (outcome: TrialOutcome) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const started = Date.parse(booking.start_at) <= Date.now();
  if (!started && booking.status !== "cancelled") return null;
  const cancelled = booking.status === "cancelled";
  const state = trialOutcomeState(booking);

  const save = async (value: string) => {
    const outcome = (value === "" ? null : value) as TrialOutcome;
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await invokeAdmin<{
        success?: boolean;
        error?: string;
      }>({ action: "set_trial_outcome", id: booking.id, outcome });
      if (failure || data?.error || data?.success !== true)
        throw new Error(data?.error || failure?.message || "Nu s-a salvat.");
      onChanged?.(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu s-a salvat.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-muted-foreground">
        Rezultat probă:{" "}
        <span className="font-medium text-foreground">{state.label}</span>
        <select
          className="mt-1 block w-full rounded border border-input bg-background px-2 py-1 text-xs"
          value={booking.trial_outcome ?? ""}
          disabled={busy}
          onChange={(e) => void save(e.target.value)}
        >
          <option value="">
            {cancelled
              ? "Anulată — proba rămâne disponibilă"
              : "Automat (făcută după 24h)"}
          </option>
          {!cancelled && <option value="done">A venit</option>}
          <option value="excused">
            {cancelled ? "Anulare târzie — scuzat" : "Nu a venit — scuzat"}
          </option>
          <option value="lost">
            {cancelled ? "Anulare târzie — pierdută" : "Nu a venit — pierdută"}
          </option>
        </select>
      </label>
      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
      {booking.trial_outcome === "lost" && (
        <NoShowFeeControl bookingId={booking.id} />
      )}
    </div>
  );
}

interface NoShowFeePreview {
  status: "paid" | "failed" | "refunded" | null;
  last_error?: string | null;
  amount_label: string;
  card?: string | null;
}

/**
 * The trial's no-show fee (owner's decision, 27 October 2026): once a trial is
 * marked lost (no-show or a cancellation under 24 h), the card saved at
 * booking can be charged 150 lei. One confirmation, showing the amount and
 * the card, then the charge; the result is shown, and a declined card leaves
 * it unpaid. The refund button in Înscrieri gives it back case by case.
 */
export function NoShowFeeControl({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<NoShowFeePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const openDialog = async () => {
    setMessage(null);
    setPreview(null);
    setBusy(true);
    try {
      const { data, error: failure } = await invokeAdmin<{
        success?: boolean;
        error?: string;
        data?: NoShowFeePreview;
      }>({ action: "preview_no_show_fee", id: bookingId });
      if (failure || data?.error || !data?.data)
        throw new Error(
          data?.error || failure?.message || "Nu am putut citi cardul.",
        );
      if (data.data.status === "paid" || data.data.status === "refunded") {
        setMessage({
          ok: true,
          text:
            data.data.status === "paid"
              ? `Taxa de ${data.data.amount_label} a fost deja încasată.`
              : "Taxa a fost încasată și apoi rambursată.",
        });
        return;
      }
      setPreview(data.data);
      setOpen(true);
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Nu am putut citi cardul.",
      });
    } finally {
      setBusy(false);
    }
  };

  const charge = async () => {
    setBusy(true);
    try {
      const { data, error: failure } = await invokeAdmin<{
        success?: boolean;
        error?: string;
        data?: { amount_label?: string };
      }>({ action: "charge_no_show_fee", id: bookingId });
      if (data?.success)
        setMessage({
          ok: true,
          text: `Încasat: ${data.data?.amount_label ?? "150 lei"}.`,
        });
      else
        setMessage({
          ok: false,
          text:
            data?.error ||
            failure?.message ||
            "Cardul nu a putut fi debitat. Taxa rămâne neîncasată.",
        });
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void openDialog()}
        disabled={busy}
        className="rounded border border-input px-2 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-60"
      >
        Încasează taxa de neprezentare (150 lei)
      </button>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`text-[11px] ${message.ok ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}
        >
          {message.text}
        </p>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Încasezi taxa de neprezentare?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>
                  Se debitează <strong>{preview?.amount_label}</strong> de pe
                  cardul salvat la programare
                  {preview?.card ? ` (${preview.card})` : ""}.
                </p>
                {preview?.status === "failed" && preview.last_error && (
                  <p className="text-destructive">
                    Încercarea anterioară a eșuat: {preview.last_error}
                  </p>
                )}
                <p className="text-muted-foreground">
                  Se poate rambursa ulterior din Înscrieri (butonul
                  Rambursează), dacă elevul contestă și accepți.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Înapoi</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void charge();
              }}
            >
              Încasează {preview?.amount_label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
