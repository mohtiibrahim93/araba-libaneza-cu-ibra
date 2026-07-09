import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

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

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SOURCES = ["whatsapp", "tiktok", "instagram", "direct", "telefon", "other"];
const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  instagram: "Instagram",
  direct: "Direct",
  telefon: "Telefon",
  other: "Altă sursă",
};

type Draft = {
  form_type: "group" | "kids";
  level: string;
  format: "fizic" | "online";
  source: string;
  count: string;
};

const EMPTY_DRAFT: Draft = {
  form_type: "group",
  level: "A1",
  format: "fizic",
  source: "whatsapp",
  count: "1",
};

const ManualSignupsAdmin = () => {
  const [rows, setRows] = useState<ManualSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_manual_signups" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data.data);
    } catch {
      toast({ title: "Nu am putut încărca înscrierile manuale", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    const n = Number(draft.count);
    if (!Number.isInteger(n) || n < 0) {
      toast({ title: "Număr invalid", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await invokeAdmin({
        action: "upsert_manual_signup",
        form_type: draft.form_type,
        level: draft.form_type === "kids" ? null : draft.level,
        format: draft.form_type === "kids" ? null : draft.format,
        source: draft.source,
        count: n,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Înscriere manuală salvată" });
      setDraft(EMPTY_DRAFT);
      load();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Salvare eșuată",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const { data, error } = await invokeAdmin({ action: "delete_manual_signup", id });
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
    const fmt = r.format === "fizic" ? "Fizic" : r.format === "online" ? "Online" : "—";
    return `Grup · ${r.level ?? "—"} · ${fmt}`;
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Înscrieri manuale (alte surse)</h2>
        <p className="text-sm text-muted-foreground">
          Adaugă cursanți veniți din WhatsApp, TikTok, direct etc. Se adună la numărul afișat
          „X/Y locuri ocupate” pentru grupa aleasă.
        </p>
      </div>

      {/* Add form */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-border bg-background p-3">
        <div className="space-y-1">
          <Label className="text-xs">Tip</Label>
          <Select
            value={draft.form_type}
            onValueChange={(v) => setDraft((d) => ({ ...d, form_type: v as "group" | "kids" }))}
          >
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="group">Grup</SelectItem>
              <SelectItem value="kids">Copii</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {draft.form_type === "group" && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Nivel</Label>
              <Select value={draft.level} onValueChange={(v) => setDraft((d) => ({ ...d, level: v }))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Format</Label>
              <Select
                value={draft.format}
                onValueChange={(v) => setDraft((d) => ({ ...d, format: v as "fizic" | "online" }))}
              >
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fizic">Fizic</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Sursă</Label>
          <Select value={draft.source} onValueChange={(v) => setDraft((d) => ({ ...d, source: v }))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Număr</Label>
          <Input
            type="number"
            min={0}
            className="w-20"
            value={draft.count}
            onChange={(e) => setDraft((d) => ({ ...d, count: e.target.value }))}
          />
        </div>

        <Button type="button" size="sm" onClick={add} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adaugă
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio înscriere manuală încă.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground min-w-[150px]">{rowLabel(r)}</span>
              <span className="text-muted-foreground">{SOURCE_LABELS[r.source] || r.source}</span>
              <span className="font-semibold text-primary">+{r.count}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(r.id)}
                disabled={deletingId === r.id}
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
