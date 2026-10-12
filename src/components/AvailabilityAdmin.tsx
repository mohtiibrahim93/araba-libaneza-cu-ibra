import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeField } from "@/components/admin/TimeField";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Rule {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const WD = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

const AvailabilityAdmin = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({ weekday: 1, start_time: "10:00", end_time: "18:00" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_availability_rules" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRules(data.data);
    } catch {
      toast({ title: "Nu am putut încărca disponibilitatea", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (id: string, patch: Partial<Rule>) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (r: Rule) => {
    setSavingId(r.id);
    try {
      const { data, error } = await invokeAdmin({
        action: "upsert_availability_rule",
        id: r.id,
        weekday: r.weekday,
        start_time: r.start_time,
        end_time: r.end_time,
        is_active: r.is_active,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Regulă salvată" });
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
    if (!confirm("Ștergi această regulă?")) return;
    try {
      const { data, error } = await invokeAdmin({ action: "delete_availability_rule", id });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast({ title: "Ștergere eșuată", variant: "destructive" });
    }
  };

  const add = async () => {
    try {
      const { data, error } = await invokeAdmin({
        action: "upsert_availability_rule",
        weekday: newRule.weekday,
        start_time: newRule.start_time,
        end_time: newRule.end_time,
        is_active: true,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRules((prev) => [...prev, data.data]);
      toast({ title: "Regulă adăugată" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Adăugare eșuată",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Disponibilitate săptămânală</h2>
        <p className="text-sm text-muted-foreground">
          Intervalele orare în care studenții pot rezerva. Programările existente în Google Calendar blochează automat sloturile.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-background p-3"
            >
              <div className="space-y-1">
                <Label className="text-xs">Zi</Label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={r.weekday}
                  onChange={(e) => update(r.id, { weekday: Number(e.target.value) })}
                >
                  {WD.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <TimeField
                  label={`Start ${WD[r.weekday] ?? ""}`}
                  value={r.start_time}
                  onChange={(hhmm) => update(r.id, { start_time: hhmm + ":00" })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Final</Label>
                <TimeField
                  label={`Final ${WD[r.weekday] ?? ""}`}
                  value={r.end_time}
                  onChange={(hhmm) => update(r.id, { end_time: hhmm + ":00" })}
                />
              </div>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={r.is_active}
                  onChange={(e) => update(r.id, { is_active: e.target.checked })}
                />
                Activ
              </label>
              <div className="ml-auto flex gap-1">
                <Button size="sm" onClick={() => save(r)} disabled={savingId === r.id}>
                  {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvează"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3">
            <div className="space-y-1">
              <Label className="text-xs">Zi</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={newRule.weekday}
                onChange={(e) => setNewRule({ ...newRule, weekday: Number(e.target.value) })}
              >
                {WD.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start</Label>
              <TimeField
                label="Start, interval nou"
                value={newRule.start_time}
                onChange={(hhmm) => setNewRule({ ...newRule, start_time: hhmm })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Final</Label>
              <TimeField
                label="Final, interval nou"
                value={newRule.end_time}
                onChange={(hhmm) => setNewRule({ ...newRule, end_time: hhmm })}
              />
            </div>
            <Button size="sm" onClick={add} className="ml-auto">
              <Plus className="h-4 w-4" /> Adaugă interval
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AvailabilityAdmin;