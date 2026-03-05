import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Baby } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const KidsCourseForm = () => {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    console.log("Kids course interest:", {
      parentName: formData.get("parentName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      childAge: formData.get("childAge"),
      notes: formData.get("notes"),
    });
    setTimeout(() => {
      toast.success(t.kidsSuccess);
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section id="kids" className="py-20 px-4 scroll-mt-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Baby className="w-4 h-4" />
            {t.kidsBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.kidsTitle}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t.kidsDesc}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium text-center">
            ⭐ {t.kidsAlready}
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-parent">{t.kidsParentName} *</Label>
            <Input id="kid-parent" name="parentName" required maxLength={100} placeholder={t.placeholderName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-phone">{t.labelPhone} *</Label>
            <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-email">{t.labelEmail}</Label>
            <Input id="kid-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-age">{t.kidsChildAge}</Label>
            <Input id="kid-age" name="childAge" maxLength={20} placeholder={t.kidsChildAgePlaceholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-notes">{t.kidsNotes}</Label>
            <Textarea id="kid-notes" name="notes" maxLength={500} placeholder={t.kidsNotesPlaceholder} rows={3} />
          </div>
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            📍 {t.kidsPhysicalOnly}
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60">
            {submitting ? t.kidsSubmitting : t.kidsSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KidsCourseForm;
