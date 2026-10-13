import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

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
    </div>
  );
}
