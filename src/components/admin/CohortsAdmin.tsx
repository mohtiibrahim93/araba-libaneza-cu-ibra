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
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import CourseDetailsEditor from "@/components/admin/CourseDetailsEditor";
import type { CourseContent } from "@/lib/courses";
import { MAX_GROUP_SIZE } from "@/lib/groupSize";

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
  /** Language the class is taught in — students only see matching cohorts. */
  teaching_language: "ro" | "en";
  start_date: string;
  schedule_label_ro: string;
  schedule_label_en: string;
  max_seats: number;
  is_active: boolean;
  status: CohortStatus;
  sort_order: number;
  manual_offset?: number;
  // Course model (Phase 1)
  age_category?: string | null;
  course_type?: string | null;
  slug?: string | null;
  title_ro?: string | null;
  title_en?: string | null;
  price_lei?: number | null;
  end_date?: string | null;
  session_count?: number | null;
  total_hours?: number | null;
  image_url?: string | null;
  content?: CourseContent | null;
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const todayIso = () => new Date().toISOString().slice(0, 10);

const blank = (): Cohort => ({
  id: "",
  form_type: "group",
  level: "A1",
  format: "online",
  teaching_language: "ro",
  start_date: todayIso(),
  schedule_label_ro: "",
  schedule_label_en: "",
  // A new cohort starts as online, so it takes the online cap. Switching the
  // format below adjusts it; the database also refuses an online cohort with
  // more than MAX_GROUP_SIZE.online seats (group_cohorts_online_max_seats).
  max_seats: MAX_GROUP_SIZE.online,
  is_active: true,
  status: "forming",
  sort_order: 0,
  manual_offset: 0,
  age_category: "adulti",
  course_type: "grup",
  slug: "",
  title_ro: "",
  title_en: "",
  price_lei: null,
  end_date: null,
  session_count: null,
  total_hours: null,
  image_url: "",
  content: {},
});

const CohortsAdmin = () => {
  const [rows, setRows] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Cohort>(blank());
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <Label className="text-xs">Limba de predare</Label>
            <Select
              value={draft.teaching_language}
              onValueChange={(v) => setDraft({ ...draft, teaching_language: v as "ro" | "en" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="en">Engleză</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Cursanții văd doar grupele predate în limba lor.
            </p>
          </div>
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
              type="number"
              min={1}
              max={draft.format === "online" ? MAX_GROUP_SIZE.online : MAX_GROUP_SIZE.fizic}
              value={draft.max_seats}
              onChange={(e) => setDraft({ ...draft, max_seats: Number(e.target.value) })}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Max. {MAX_GROUP_SIZE.online} online · {MAX_GROUP_SIZE.fizic} fizic
            </p>
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
            <div key={r.id} className="rounded-md border border-border bg-background p-2">
             <div className="grid gap-2 md:grid-cols-[70px_50px_96px_64px_130px_64px_84px_1fr_1fr_150px_auto] items-end">
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
              <Select
                value={r.teaching_language ?? "ro"}
                onValueChange={(v) => update(r.id, { teaching_language: v as "ro" | "en" })}
              >
                <SelectTrigger className="h-9 text-xs" title="Limba de predare"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">RO</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
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
                <Button size="sm" variant="outline" title="Detalii curs"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  {expandedId === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button size="sm" onClick={() => save(r)} disabled={savingId === r.id}>
                  {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvează"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
             </div>
              {expandedId === r.id && (
                <CourseDetailsEditor value={r} onChange={(patch) => update(r.id, patch)} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CohortsAdmin;