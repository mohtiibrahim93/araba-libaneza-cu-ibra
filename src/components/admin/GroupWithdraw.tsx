import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

/**
 * "Retras" (owner, 13 Nov 2026): mark that a student left their group, or undo
 * it. The seat is freed and nothing more shows as owed. No refund is made and
 * no email is sent. Not shown for a card subscription, which is stopped with
 * "Anulează abonament" so the charges stop too.
 */
const GroupWithdraw = ({
  registrationId,
  withdrawn,
  onDone,
}: {
  registrationId: string;
  withdrawn: boolean;
  onDone?: (() => void) | undefined;
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    if (
      !window.confirm(
        withdrawn
          ? "Readuci cursantul în grupă? Va ocupa din nou un loc."
          : "Marchezi cursantul ca retras din grupă? Locul se eliberează și nu mai apare cu luni de plătit. Nu se face nicio rambursare și nu i se trimite niciun email.",
      )
    )
      return;
    setBusy(true);
    setError("");
    const { data, error: err } = await invokeAdmin<{ error?: string }>({
      action: "set_withdrawn",
      id: registrationId,
      withdrawn: !withdrawn,
    });
    setBusy(false);
    if (err || data?.error)
      return setError(data?.error ?? "Nu am putut salva.");
    onDone?.();
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
      >
        {withdrawn ? "Anulează retragerea" : "Marchează retras din grupă"}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default GroupWithdraw;
