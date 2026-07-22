import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CourseContent } from "@/lib/courses";

/** The subset of a course row this editor manages (the Phase 1 course fields). */
export interface CourseEditable {
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

interface Props {
  value: CourseEditable;
  onChange: (patch: Partial<CourseEditable>) => void;
}

// Bilingual prose fields stored in content (JSONB). base -> `${base}_ro`/`_en`.
const PROSE_FIELDS: { base: string; label: string }[] = [
  { base: "short", label: "Descriere scurtă" },
  { base: "long", label: "Descriere completă" },
  { base: "audience", label: "Pentru cine este" },
  { base: "prerequisites", label: "Cerințe / nivel necesar" },
  { base: "objectives", label: "Obiective de învățare" },
  { base: "curriculum", label: "Curriculum" },
  { base: "method", label: "Metoda de predare" },
  { base: "materials", label: "Materiale incluse" },
  { base: "teacher", label: "Profesor" },
  { base: "policies", label: "Politici (absențe / anulări)" },
  { base: "payment", label: "Modalitate de plată" },
];

const numOrNull = (s: string) => (s === "" ? null : Number(s));

const CourseDetailsEditor = ({ value, onChange }: Props) => {
  const content: CourseContent = value.content ?? {};
  const setContent = (patch: Partial<CourseContent>) =>
    onChange({ content: { ...content, ...patch } });

  const faq = content.faq ?? [];
  const setFaq = (next: CourseContent["faq"]) => setContent({ faq: next });

  const cv = (k: string) => (content as Record<string, unknown>)[k] as string | undefined;

  return (
    <div className="mt-2 space-y-4 rounded-md border border-border bg-muted/20 p-3">
      {/* Scalar course fields */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="text-xs">Categorie vârstă</Label>
          <Select value={value.age_category ?? "adulti"} onValueChange={(v) => onChange({ age_category: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="adulti">Adulți</SelectItem>
              <SelectItem value="adolescenti">Adolescenți</SelectItem>
              <SelectItem value="copii">Copii</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tip curs</Label>
          <Select value={value.course_type ?? "grup"} onValueChange={(v) => onChange({ course_type: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="grup">Grup</SelectItem>
              <SelectItem value="privat">Privat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Slug (URL curs)</Label>
          <Input className="h-9 text-xs" placeholder="araba-a1-fizic-grupa-1"
            value={value.slug ?? ""} onChange={(e) => onChange({ slug: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Preț (LEI)</Label>
          <Input className="h-9 text-xs" type="number" min={0}
            value={value.price_lei ?? ""} onChange={(e) => onChange({ price_lei: numOrNull(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Data finalizării</Label>
          <Input className="h-9 text-xs" type="date"
            value={value.end_date ?? ""} onChange={(e) => onChange({ end_date: e.target.value || null })} />
        </div>
        <div>
          <Label className="text-xs">Nr. ședințe</Label>
          <Input className="h-9 text-xs" type="number" min={0}
            value={value.session_count ?? ""} onChange={(e) => onChange({ session_count: numOrNull(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Total ore</Label>
          <Input className="h-9 text-xs" type="number" min={0}
            value={value.total_hours ?? ""} onChange={(e) => onChange({ total_hours: numOrNull(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Imagine (URL)</Label>
          <Input className="h-9 text-xs" placeholder="https://…"
            value={value.image_url ?? ""} onChange={(e) => onChange({ image_url: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs">Titlu curs (RO)</Label>
          <Input className="h-9 text-xs" placeholder="Arabă Libaneză A1 — Grupa 1 (fizic)"
            value={value.title_ro ?? ""} onChange={(e) => onChange({ title_ro: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs">Titlu curs (EN)</Label>
          <Input className="h-9 text-xs" placeholder="Lebanese Arabic A1 — Group 1 (in person)"
            value={value.title_en ?? ""} onChange={(e) => onChange({ title_en: e.target.value })} />
        </div>
      </div>

      {/* Bilingual prose */}
      <div className="space-y-3">
        {PROSE_FIELDS.map(({ base, label }) => (
          <div key={base} className="grid gap-2 md:grid-cols-2">
            <div>
              <Label className="text-[11px] text-muted-foreground">{label} (RO)</Label>
              <textarea
                className="w-full min-h-[52px] rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                value={cv(`${base}_ro`) ?? ""}
                onChange={(e) => setContent({ [`${base}_ro`]: e.target.value } as Partial<CourseContent>)}
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">{label} (EN)</Label>
              <textarea
                className="w-full min-h-[52px] rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                value={cv(`${base}_en`) ?? ""}
                onChange={(e) => setContent({ [`${base}_en`]: e.target.value } as Partial<CourseContent>)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label className="text-xs font-semibold">Întrebări frecvente</Label>
          <Button type="button" size="sm" variant="outline"
            onClick={() => setFaq([...faq, { q_ro: "", q_en: "", a_ro: "", a_en: "" }])}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Adaugă întrebare
          </Button>
        </div>
        <div className="space-y-2">
          {faq.map((item, i) => (
            <div key={i} className="rounded-md border border-border p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Întrebarea {i + 1}</span>
                <Button type="button" size="sm" variant="ghost"
                  onClick={() => setFaq(faq.filter((_, j) => j !== i))}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Input className="h-8 text-xs" placeholder="Întrebare (RO)" value={item.q_ro ?? ""}
                  onChange={(e) => setFaq(faq.map((f, j) => (j === i ? { ...f, q_ro: e.target.value } : f)))} />
                <Input className="h-8 text-xs" placeholder="Question (EN)" value={item.q_en ?? ""}
                  onChange={(e) => setFaq(faq.map((f, j) => (j === i ? { ...f, q_en: e.target.value } : f)))} />
                <textarea className="min-h-[44px] rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  placeholder="Răspuns (RO)" value={item.a_ro ?? ""}
                  onChange={(e) => setFaq(faq.map((f, j) => (j === i ? { ...f, a_ro: e.target.value } : f)))} />
                <textarea className="min-h-[44px] rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  placeholder="Answer (EN)" value={item.a_en ?? ""}
                  onChange={(e) => setFaq(faq.map((f, j) => (j === i ? { ...f, a_en: e.target.value } : f)))} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsEditor;
