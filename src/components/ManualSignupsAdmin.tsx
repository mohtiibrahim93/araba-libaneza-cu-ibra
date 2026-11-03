import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface ManualSignup {
  id: string;
  form_type: string;
  level: string | null;
  format: string | null;
  source: string;
  count: number;
  note: string | null;
  updated_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  instagram: "Instagram",
  direct: "Direct",
  telefon: "Telefon",
  other: "Altă sursă",
};

const ManualSignupsAdmin = () => {
  const [rows, setRows] = useState<ManualSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({
        action: "list_manual_signups",
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data.data);
    } catch {
      toast({
        title: "Nu am putut încărca înscrierile manuale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    if (
      !confirm(
        "Ștergi această înscriere manuală? Locurile ocupate se recalculează.",
      )
    )
      return;
    setDeletingId(id);
    try {
      const { data, error } = await invokeAdmin({
        action: "delete_manual_signup",
        id,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast({ title: "Ștergere eșuată", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const rowLabel = (r: ManualSignup) => {
    if (r.form_type === "kids") return "Copii";
    const fmt =
      r.format === "fizic" ? "Fizic" : r.format === "online" ? "Online" : "—";
    return `Grup · ${r.level ?? "—"} · ${fmt}`;
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          Numere vechi de locuri (fără nume)
        </h2>
        <p className="text-sm text-muted-foreground">
          Locuri adăugate demult doar ca număr, fără un cursant anume. Ele ocupă
          în continuare locuri, așa că rămân aici; le poți șterge când nu mai
          sunt valabile. Un cursant nou îl adaugi doar cu „Adaugă un cursant
          manual” de mai sus, unde alegi exact grupa.
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Niciun număr vechi.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground min-w-[150px]">
                {rowLabel(r)}
              </span>
              <span className="text-muted-foreground">
                {SOURCE_LABELS[r.source] || r.source}
              </span>
              <span className="font-semibold text-primary">+{r.count}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(r.id)}
                disabled={deletingId === r.id}
                aria-label={`Șterge numărul ${rowLabel(r)} +${r.count}`}
              >
                {deletingId === r.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManualSignupsAdmin;
