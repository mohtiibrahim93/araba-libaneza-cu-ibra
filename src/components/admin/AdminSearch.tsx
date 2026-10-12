import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { formTypeLabels, leadStatusLabels, type LeadStatus, type Registration } from "./types";

/**
 * Ctrl K: find a person by name, email or phone, and open their page.
 *
 * Searches the registrations the panel has already loaded, so it is instant
 * and asks the server nothing.
 */
const norm = (s: string) =>
  s
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const AdminSearch = ({
  open,
  onOpenChange,
  registrations,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  registrations: Registration[];
  onPick: (id: string) => void;
}) => {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const terms = norm(q.trim()).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    const digits = q.replace(/[^\d]/g, "");
    return registrations
      .filter((r) => !r.anonymized_at)
      .filter((r) => {
        const hay = norm(`${r.name} ${r.email ?? ""}`);
        const phoneHit = digits.length >= 4 && r.phone.replace(/[^\d]/g, "").includes(digits);
        return phoneHit || terms.every((t) => hay.includes(t));
      })
      .slice(0, 20);
  }, [q, registrations]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQ("");
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content className="admin-theme fixed inset-x-3 top-3 z-50 mx-auto flex max-h-[80vh] max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl focus:outline-none sm:top-[12vh]">
          <DialogPrimitive.Title className="sr-only">Caută un cursant</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Caută după nume, email sau telefon și deschide fișa cursantului.
          </DialogPrimitive.Description>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              type="text"
              enterKeyHint="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Nume, email sau telefon"
              placeholder="Nume, email sau telefon"
              className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <DialogPrimitive.Close
              aria-label="Închide"
              className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <ul className="overflow-y-auto">
            {q.trim() && results.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Nimeni cu „{q.trim()}”.</li>
            )}
            {results.map((r) => (
              <li key={r.id} className="border-b border-border/60 last:border-0">
                <button
                  type="button"
                  onClick={() => {
                    onPick(r.id);
                    onOpenChange(false);
                    setQ("");
                  }}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {formTypeLabels[r.form_type] ?? r.form_type}
                      {r.email ? ` · ${r.email}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {leadStatusLabels[(r.lead_status || "new") as LeadStatus]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default AdminSearch;
