import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";

export type UnmatchedEvent = { id: string; summary: string; start_at: string; end_at: string; guest_email?: string | null };

/**
 * Turns one unmatched Google event into a private lesson, once the owner has
 * said who it is for. Nothing is filled from the title; the guest's email is
 * only a suggestion he can change. The lesson keeps the event's own time and
 * the event itself, so no new invitation and no email go out.
 */
export default function ImportCalendarEvent({ event, onDone, onCancel }: { event: UnmatchedEvent; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(event.guest_email ?? "");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paid, setPaid] = useState(false);
  const [format, setFormat] = useState<"online" | "physical">("online");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await invokeAdmin<{ success?: boolean; error?: string }>({
        action: "import_calendar_event",
        event_id: event.id,
        student_name: name.trim(),
        student_email: email.trim(),
        student_phone: phone.trim() || undefined,
        quantity,
        paid,
        format,
      });
      if (failure || data?.error || data?.success !== true) throw new Error(data?.error || failure?.message || "Importul nu a fost confirmat.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Importul a eșuat.");
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1 block w-full rounded border px-2 py-1 text-sm";
  return (
    <form className="mt-2 grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <label className="text-xs sm:col-span-2">Numele cursantului<input className={field} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></label>
      <label className="text-xs">Email<input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="text-xs">Telefon (opțional)<input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label className="text-xs">Câte lecții a luat<input className={field} type="number" min={1} max={60} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} /></label>
      <label className="text-xs">Format
        <select className={field} value={format} onChange={(e) => setFormat(e.target.value === "physical" ? "physical" : "online")}>
          <option value="online">Online</option>
          <option value="physical">La centru</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />A plătit deja</label>
      <p className="text-[11px] text-muted-foreground sm:col-span-2">Lecția păstrează ora și evenimentul din Google. Nu se trimite nicio invitație și niciun email.</p>
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" className="rounded px-3 py-1 text-sm" onClick={onCancel} disabled={busy}>Renunță</button>
        <button type="submit" className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground" disabled={busy || name.trim().length < 2 || !email.includes("@")}>{busy ? "Se importă…" : "Importă lecția"}</button>
      </div>
    </form>
  );
}
