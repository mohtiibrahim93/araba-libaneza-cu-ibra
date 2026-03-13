import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const KidsCourseForm = () => {
  const { t } = useI18n();
  const [center, setCenter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("registrations").insert({
      form_type: "kids",
      name: String(formData.get("parentName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      center,
      child_age: String(formData.get("childAge") || "").trim() || null,
      notes: String(formData.get("notes") || "").trim() || null,
    });

    if (error) {
      toast.error("A apărut o eroare. Încercați din nou.");
      console.error("Registration error:", error);
    } else {
      toast.success(t.kidsSuccess);
      (e.target as HTMLFormElement).reset();
      setCenter("");
    }
    setSubmitting(false);
  };

  return (
    <section id="kids" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t.kidsTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.kidsDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background rounded-2xl border border-border p-6 space-y-4">
          <div className="bg-primary/10 text-primary text-sm font-medium rounded-lg px-4 py-3">
            {t.kidsAlready}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-parent" className="text-sm">{t.kidsParentName} *</Label>
            <Input id="kid-parent" name="parentName" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-phone" className="text-sm">{t.labelPhone} *</Label>
            <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-email" className="text-sm">{t.labelEmail}</Label>
            <Input id="kid-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-age" className="text-sm">{t.kidsChildAge}</Label>
            <Input id="kid-age" name="childAge" maxLength={20} placeholder={t.kidsChildAgePlaceholder} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-notes" className="text-sm">{t.kidsNotes}</Label>
            <Textarea id="kid-notes" name="notes" maxLength={500} placeholder={t.kidsNotesPlaceholder} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t.centerLabel} *</Label>
            <Select value={center} onValueChange={setCenter} required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t.centerPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bucuresti">{t.centerBucharest}</SelectItem>
                <SelectItem value="online">{t.centerOnline}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">📍 {t.kidsPhysicalOnly}</p>
          <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 disabled:opacity-50">
            {submitting ? t.kidsSubmitting : t.kidsSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KidsCourseForm;
