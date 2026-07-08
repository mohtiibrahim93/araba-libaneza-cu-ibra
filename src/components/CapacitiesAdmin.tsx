import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CapacityRow {
  id: string;
  form_type: string;
  level: string | null;
  max_seats: number;
  min_seats: number;
  manual_offset: number;
}

const CapacitiesAdmin = () => {
  const [rows, setRows] = useState<CapacityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_capacities" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data.data);
    } catch {
      toast({ title: "Nu am putut încărca capacitățile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (id: string, patch: Partial<CapacityRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async (row: CapacityRow) => {
    setSavingId(row.id);
    try {
      const { data, error } = await invokeAdmin({
        action: "update_capacity",
        id: row.id,
        max_seats: row.max_seats,
        min_seats: row.min_seats,
        manual_offset: row.manual_offset ?? 0,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Capacitate salvată" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Salvare eșuată",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const labelFor = (r: CapacityRow) =>
    r.form_type === "kids" ? "Curs Copii" : `Curs Grup · ${r.level ?? "—"}`;

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Capacități grupe</h2>
        <p className="text-sm text-muted-foreground">
          Setează numărul maxim de locuri și minimul necesar pentru ca grupa să pornească.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border bg-background p-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{labelFor(r)}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => save(r)}
                  disabled={savingId === r.id}
                >
                  {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvează"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`min-${r.id}`} className="text-xs">
                    Min necesar
                  </Label>
                  <Input
                    id={`min-${r.id}`}
                    type="number"
                    min={1}
                    value={r.min_seats}
                    onChange={(e) => update(r.id, { min_seats: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`max-${r.id}`} className="text-xs">
                    Max locuri
                  </Label>
                  <Input
                    id={`max-${r.id}`}
                    type="number"
                    min={1}
                    value={r.max_seats}
                    onChange={(e) => update(r.id, { max_seats: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`offset-${r.id}`} className="text-xs">
                    Înscrieri manuale
                  </Label>
                  <Input
                    id={`offset-${r.id}`}
                    type="number"
                    min={0}
                    value={r.manual_offset ?? 0}
                    onChange={(e) => update(r.id, { manual_offset: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Înscrieri manuale</span> = studenți veniți din alte surse
                (WhatsApp, TikTok, direct etc.). Se adaugă la contorul public „X / {r.max_seats} locuri ocupate".
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CapacitiesAdmin;