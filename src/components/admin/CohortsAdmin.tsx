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

type CohortStatus =
  | "draft"
  | "forming"
  | "minimum_reached"
  | "confirmed"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

const STATUSES: { value: CohortStatus; label: string }[] = [
  { value: "draft", label: "Draft (ascuns)" },
  { value: "forming", label: "În formare" },
  { value: "minimum_reached", label: "Minim atins" },
  { value: "confirmed", label: "Confirmată" },
  { value: "full", label: "Plină (waitlist)" },
  { value: "in_progress", label: "În desfășurare" },
  { value: "completed", label: "Încheiată" },
  { value: "cancelled", label: "Anulată" },
];

interface Cohort {
  id: string;
  form_type: "group" | "kids";
  level: string | null;
  format: string | null;
  start_date: string;
  schedule_label_ro: string;
  schedule_label_en: string;
  max_seats: number;
  is_active: boolean;
  status: CohortStatus;
  sort_order: number;
  manual_offset?: number;
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const todayIso = () => new Date().toISOString().slice(0, 10);

const blank = (): Cohort => ({
  id: "",
  form_type: "group",
  level: "A1",
  format: "online",
  start_date: todayIso(),
  schedule_label_ro: "",
  schedule_label_en: "",
  max_seats: 10,
  is_active: true,
  status: "forming",
  sort_order: 0,
  manual_offset: 0,
});

const CohortsAdmin = () => {
  const [rows, setRows] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Cohort>(blank());

  const call = async (action: string, extra: Record<string, unknown> | Cohort = {}) => {
    const { data, error } = await invokeAdmin({ action, ...(extra as Record<string, unknown>) });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call("list_cohorts");
      setRows(data.data || []);
    } catch {
      toast({ title: "Nu am putut încărca cohortele", variant: "destructive" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (id: string, patch: Partial<Cohort>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async (row: Cohort) => {
    setSavingId(row.id);
    try {
      await call("upsert_cohort", row);
      toast({ title: "Cohortă salvată" });
      await load();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Salvare eșuată",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Ștergi această cohortă?")) return;
    try {
      await call("delete_cohort", { id });
      toast({ title: "Cohortă ștearsă" });
      await load();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Ștergere eșuată",
        variant: "destructive",
      });
    }
  };

  const create = async () => {
    try {
      await call("upsert_cohort", draft);
      toast({ title: "Cohortă creată" });
      setDraft(blank());
      await load();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Creare eșuată",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Cohorte grupe</h2>
        <p className="text-sm text-muted-foreground">
          Configurează 1–3 date de start per nivel. Studenții aleg cohorta dorită la înscriere.
        </p>
      </div>

      {/* Create new */}
      <div className="mb-4 rounded-md border border-dashed border-border p-3 bg-muted/20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Adaugă cohortă
        </p>
        <div className="grid gap-2 md:grid-cols-6">
          <div>
            <Label className="text-xs">Tip</Label>
            <Select
              value={draft.form_type}
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  form_type: v as "group" | "kids",
                  level: v === "kids" ? null : "A1",
                  format: v === "kids" ? null : (draft.format ?? "online"),
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Grup</SelectItem>
                <SelectItem value="kids">Copii</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {draft.form_type === "group" && (
            <div>
              <Label className="text-xs">Nivel</Label>
              <Select value={draft.level ?? "A1"} onValueChange={(v) => setDraft({ ...draft, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {draft.form_type === "group" && (
            <div>
              <Label className="text-xs">Format</Label>
              <Select value={draft.format ?? "online"} onValueChange={(v) => setDraft({ ...draft, format: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="fizic">Fizic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs">Start</Label>
            <Input
              type="date"
              value={draft.start_date}
              onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Locuri</Label>
            <Input
              type="number" min={1}
              value={draft.max_seats}
              onChange={(e) => setDraft({ ...draft, max_seats: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Program (RO)</Label>
            <Input
              placeholder="Ex: Luni & Miercuri 19:00"
              value={draft.schedule_label_ro}
              onChange={(e) => setDraft({ ...draft, schedule_label_ro: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Program (EN)</Label>
            <Input
              placeholder="Ex: Mon & Wed 7pm"
              value={draft.schedule_label_en}
              onChange={(e) => setDraft({ ...draft, schedule_label_en: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={create}>
            <Plus className="w-4 h-4 mr-1" /> Adaugă
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio cohortă configurată.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="grid gap-2 md:grid-cols-[70px_50px_96px_130px_64px_84px_1fr_1fr_150px_auto] items-end rounded-md border border-border bg-background p-2">
              <div className="text-xs font-semibold">{r.form_type === "kids" ? "Copii" : "Grup"}</div>
              <div className="text-xs font-semibold">{r.level ?? "—"}</div>
              {r.form_type === "kids" ? (
                <div className="text-xs text-muted-foreground self-center">—</div>
              ) : (
                <Select
                  value={r.format ?? "online"}
                  onValueChange={(v) => update(r.id, { format: v })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="fizic">Fizic</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Input
                type="date"
                value={r.start_date}
                onChange={(e) => update(r.id, { start_date: e.target.value })}
              />
              <Input
                type="number" min={1}
                value={r.max_seats}
                onChange={(e) => update(r.id, { max_seats: Number(e.target.value) })}
              />
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Manual</Label>
                <Input
                  type="number" min={0}
                  title="Înscrieri manuale (WhatsApp/TikTok/direct)"
                  value={r.manual_offset ?? 0}
                  onChange={(e) => update(r.id, { manual_offset: Math.max(0, Number(e.target.value)) })}
                />
              </div>
              <Input
                placeholder="Program RO"
                value={r.schedule_label_ro}
                onChange={(e) => update(r.id, { schedule_label_ro: e.target.value })}
              />
              <Input
                placeholder="Schedule EN"
                value={r.schedule_label_en}
                onChange={(e) => update(r.id, { schedule_label_en: e.target.value })}
              />
              <div className="min-w-[150px]">
                <Select
                  value={r.status ?? (r.is_active ? "forming" : "cancelled")}
                  onValueChange={(v) => update(r.id, { status: v as CohortStatus })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => save(r)} disabled={savingId === r.id}>
                  {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvează"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CohortsAdmin;