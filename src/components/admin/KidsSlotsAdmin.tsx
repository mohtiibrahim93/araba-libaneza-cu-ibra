import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Plus, Save, Trash2 } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Empty, ErrorNote, Loading, ScreenToolbar, Section, TableWrap, Td, Th, Tr } from "./ui";

/**
 * The weekly slots a kids' course can be booked into.
 *
 * `list_kids_slots`, `upsert_kids_slot` and `delete_kids_slot` have existed and
 * been deployed for some time with nothing in the panel calling them: the
 * slots could only be changed in the database by hand. This is that screen.
 *
 * Note the weekday convention. `kids_class_slots.weekday` is **1 = Monday to
 * 7 = Sunday** (ISO), which `useKidsSlots.ts` documents and the public
 * KidsSlotPicker relies on. It is NOT the same as `availability_rules`, which
 * uses 0 = Sunday to match JavaScript's getDay(). Two tables, two conventions,
 * one letter apart in the column name — so the offset here is deliberate and
 * pinned by a test rather than left to whoever edits this next.
 */

/** Index with `weekday - 1`. Monday first, because 1 is Monday. */
const WEEKDAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"] as const;

interface Slot {
  id: string;
  weekday: number;
  start_time: string;
  duration_min: number;
  format: "online" | "physical";
  location: string | null;
  max_seats: number;
  is_active: boolean;
  sort_order: number;
}

type Draft = Omit<Slot, "id"> & { id?: string };

const blank: Draft = {
  weekday: 1,
  start_time: "17:00",
  duration_min: 60,
  format: "online",
  location: null,
  max_seats: 8,
  is_active: true,
  sort_order: 0,
};

const hhmm = (t: string) => t.slice(0, 5);

const KidsSlotsAdmin = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await invokeAdmin({ action: "list_kids_slots" });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setSlots(data?.data ?? []);
    } catch (e) {
      console.error("[kids slots] load failed", e);
      setError("Intervalele nu au putut fi încărcate.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (s: Draft) => {
    setSaving(s.id ?? "new");
    try {
      const { data, error: err } = await invokeAdmin({ action: "upsert_kids_slot", ...s });
      if (err) throw err;
      // The server validates weekday, time, format, seats and duration, and
      // answers with a Romanian message. Showing it beats a generic failure.
      if (data?.error) throw new Error(data.error);
      toast({ title: s.id ? "Interval salvat" : "Interval adăugat" });
      setDraft(null);
      await load();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Nu s-a putut salva",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: string) => {
    setSaving(id);
    try {
      const { data, error: err } = await invokeAdmin({ action: "delete_kids_slot", id });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Interval șters" });
      await load();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Nu s-a putut șterge",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const Fields = ({ value, onChange }: { value: Draft; onChange: (d: Draft) => void }) => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Ziua</Label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={value.weekday}
          onChange={(e) => onChange({ ...value, weekday: Number(e.target.value) })}
        >
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Ora de început</Label>
        <Input
          type="time"
          className="h-9"
          value={hhmm(value.start_time)}
          onChange={(e) => onChange({ ...value, start_time: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Durată (min)</Label>
        <Input
          type="number"
          min={15}
          className="h-9"
          value={value.duration_min}
          onChange={(e) => onChange({ ...value, duration_min: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Locuri</Label>
        <Input
          type="number"
          min={1}
          className="h-9"
          value={value.max_seats}
          onChange={(e) => onChange({ ...value, max_seats: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Format</Label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={value.format}
          onChange={(e) => onChange({ ...value, format: e.target.value as Slot["format"] })}
        >
          <option value="online">Online</option>
          <option value="physical">La centru</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Locație</Label>
        <Input
          className="h-9"
          placeholder="opțional"
          value={value.location ?? ""}
          onChange={(e) => onChange({ ...value, location: e.target.value || null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Ordine</Label>
        <Input
          type="number"
          className="h-9"
          value={value.sort_order}
          onChange={(e) => onChange({ ...value, sort_order: Number(e.target.value) })}
        />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={value.is_active}
            onChange={(e) => onChange({ ...value, is_active: e.target.checked })}
          />
          Activ pe site
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <ScreenToolbar>
        {!draft && (
          <Button size="sm" onClick={() => setDraft({ ...blank })}>
            <Plus className="h-4 w-4" />
            Adaugă interval
          </Button>
        )}
      </ScreenToolbar>

      {error && <ErrorNote>{error}</ErrorNote>}

      {draft && (
        <Section title="Interval nou" icon={Plus}>
          <Fields value={draft} onChange={setDraft} />
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => void save(draft)} disabled={saving === "new"}>
              <Save className="h-4 w-4" />
              Salvează
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDraft(null)}>
              Renunță
            </Button>
          </div>
        </Section>
      )}

      {loading && slots.length === 0 && <Loading label="Se încarcă…" />}

      {!loading && slots.length === 0 && !draft && (
        <Empty
          icon={CalendarClock}
          title="Niciun interval definit."
          description="Fără intervale, formularul pentru copii nu are ce să ofere. Adaugă primul."
          action={
            <Button size="sm" onClick={() => setDraft({ ...blank })}>
              <Plus className="h-4 w-4" />
              Adaugă interval
            </Button>
          }
        />
      )}

      {slots.length > 0 && (
        <Section title="Intervale" icon={CalendarClock}>
          <TableWrap label="Intervale">
            <thead>
              <tr>
                <Th>Ziua</Th>
                <Th>Ora</Th>
                <Th numeric>Durată</Th>
                <Th>Format</Th>
                <Th numeric>Locuri</Th>
                <Th>Pe site</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-foreground">{WEEKDAYS[s.weekday - 1]}</Td>
                  <Td className="tabular-nums">{hhmm(s.start_time)}</Td>
                  <Td numeric className="text-muted-foreground">{s.duration_min} min</Td>
                  <Td className="text-muted-foreground">
                    {s.format === "online" ? "Online" : "La centru"}
                    {s.location ? ` · ${s.location}` : ""}
                  </Td>
                  <Td numeric className="text-muted-foreground">{s.max_seats}</Td>
                  <Td>
                    {s.is_active ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        activ
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        ascuns
                      </span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDraft({ ...s })}
                        disabled={saving === s.id}
                      >
                        Editează
                      </Button>
                      {/* Deleting a slot is not reversible and the public form
                          reads this table live, so it asks first. */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" disabled={saving === s.id}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Ștergi intervalul de {WEEKDAYS[s.weekday - 1]}, {hhmm(s.start_time)}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Dispare imediat de pe site. Înscrierile deja făcute pe acest interval
                              rămân, dar nu vor mai arăta un interval valid.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Renunță</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void remove(s.id)}>
                              Șterge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>
      )}
    </div>
  );
};

export default KidsSlotsAdmin;
