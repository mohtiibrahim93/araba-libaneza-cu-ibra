import { useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

/**
 * Add one student by hand — someone who wrote on WhatsApp, TikTok or called.
 *
 * Creates a real registration in the exact group (admin-registrations
 * add_manual_registration), so the student takes a seat, appears in the
 * registrations list and gets the group's emails (e.g. "your group starts for
 * sure"). The older "Înscrieri manuale" counter below only adds a number to a
 * level and cannot tell two groups of the same level apart.
 */

interface CohortOption {
  id: string;
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string;
  status: string | null;
  max_seats: number;
  form_type: string;
}

const SOURCES: [string, string][] = [
  ["whatsapp", "WhatsApp"],
  ["tiktok", "TikTok"],
  ["instagram", "Instagram"],
  ["direct", "Direct"],
  ["telefon", "Telefon"],
  ["other", "Altă sursă"],
];
const METHODS: [string, string][] = [
  ["cash", "Cash"],
  ["transfer", "Transfer bancar"],
  ["card", "Card"],
  ["paypal", "PayPal"],
];
const ACTIVE = ["forming", "minimum_reached", "confirmed", "full", "in_progress"];

const empty = { name: "", phone: "", email: "", cohort_id: "", source: "whatsapp", paid: "no", payment_method: "cash", notes: "" };

const ManualStudentForm = ({ onAdded }: { onAdded?: () => void }) => {
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await invokeAdmin<{ data?: CohortOption[] }>({ action: "list_cohorts" });
      setCohorts((data?.data ?? []).filter((c) => ACTIVE.includes(c.status ?? "")));
    })();
  }, []);

  const label = (c: CohortOption) =>
    `${c.form_type === "kids" ? "Copii" : c.level ?? "—"} · ${c.format === "fizic" ? "fizic" : "online"} · ${
      c.teaching_language === "en" ? "engleză" : "română"
    } · start ${c.start_date}`;

  const save = async () => {
    setSaving(true);
    try {
      const { data, error } = await invokeAdmin<{ error?: string }>({
        action: "add_manual_registration",
        name: f.name,
        phone: f.phone,
        email: f.email,
        cohort_id: f.cohort_id,
        source: f.source,
        paid: f.paid === "yes",
        payment_method: f.paid === "yes" ? f.payment_method : null,
        notes: f.notes,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `${f.name} a fost adăugat(ă) în grupă` });
      setF(empty);
      onAdded?.();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Salvare eșuată", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const select = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">Adaugă un cursant manual</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Pentru cineva venit pe WhatsApp, TikTok, telefon etc. Intră direct în grupa aleasă: ocupă un loc, apare în
        lista de înscrieri și primește emailurile grupei.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="ms-name">Nume *</Label>
          <Input id="ms-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ms-phone">Telefon *</Label>
          <Input id="ms-phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={40} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ms-email">Email</Label>
          <Input id="ms-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={320} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ms-cohort">Grupa *</Label>
          <select id="ms-cohort" className={select} value={f.cohort_id} onChange={(e) => setF({ ...f, cohort_id: e.target.value })}>
            <option value="">Alege grupa…</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {label(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ms-source">Sursa *</Label>
          <select id="ms-source" className={select} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
            {SOURCES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ms-paid">A plătit?</Label>
          <select id="ms-paid" className={select} value={f.paid} onChange={(e) => setF({ ...f, paid: e.target.value })}>
            <option value="no">Nu încă</option>
            <option value="yes">Da</option>
          </select>
        </div>
        {f.paid === "yes" && (
          <div className="space-y-1.5">
            <Label htmlFor="ms-method">Cum a plătit</Label>
            <select id="ms-method" className={select} value={f.payment_method} onChange={(e) => setF({ ...f, payment_method: e.target.value })}>
              {METHODS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="ms-notes">Notițe</Label>
          <Input id="ms-notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} maxLength={2000} />
        </div>
      </div>
      <Button className="mt-4" onClick={save} disabled={saving || !f.name.trim() || !f.phone.trim() || !f.cohort_id}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
        Adaugă în grupă
      </Button>
    </section>
  );
};

export default ManualStudentForm;
