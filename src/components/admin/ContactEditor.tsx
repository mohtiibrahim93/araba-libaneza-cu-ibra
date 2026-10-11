import { useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import type { Registration } from "./types";

export default function ContactEditor({ person, onChanged }: { person: Registration; onChanged?: (() => void) | undefined }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(person.name);
  const [email, setEmail] = useState(person.email ?? "");
  const [phone, setPhone] = useState(person.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setEditing(false); setError(""); setSaved(false); setName(person.name); setEmail(person.email ?? ""); setPhone(person.phone ?? ""); }, [person.id, person.name, person.email, person.phone]);
  if (person.anonymized_at) return null;
  return <section className="rounded-xl border border-border p-3 space-y-3">
    {!editing ? <><button type="button" onClick={() => { setEditing(true); setSaved(false); }} className="font-semibold text-brand-green">Editează contactul</button>{saved && <p role="status">Contact salvat.</p>}</> :
      <form className="space-y-3" onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setError("");
        try {
          const { data, error: requestError } = await invokeAdmin({ action: "update_contact", id: person.id, name, email, phone });
          if (requestError || data?.error || data?.success !== true) throw new Error(data?.error || requestError?.message || "Contactul nu a fost salvat.");
          setEditing(false); setSaved(true); onChanged?.();
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Contactul nu a fost salvat."); }
        finally { setBusy(false); }
      }}>
        <label className="block">Nume<input className="mt-1 block w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} disabled={busy} /></label>
        <label className="block">Email de contact<input className="mt-1 block w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} disabled={busy} /></label>
        <label className="block">Telefon<input className="mt-1 block w-full rounded border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} disabled={busy} /></label>
        <p className="text-xs text-muted-foreground">Contul și istoricul plăților rămân asociate cu {person.account_email ?? person.email ?? "adresa inițială"}. Datele de contact se actualizează în lecțiile legate de această înscriere.</p>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <button disabled={busy} type="submit" className="rounded bg-brand-green px-3 py-2 text-white">{busy ? "Se salvează…" : "Salvează contactul"}</button>
        <button disabled={busy} type="button" className="ml-3" onClick={() => setEditing(false)}>Renunță</button>
      </form>}
  </section>;
}
