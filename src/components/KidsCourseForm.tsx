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
    <section id="kids" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Baby className="w-3.5 h-3.5" />
            {t.kidsBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t.kidsTitle}</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{t.kidsDesc}</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl p-8 bg-card border border-border space-y-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="p-3 rounded-lg bg-primary/8 border border-primary/15 text-primary text-sm font-medium text-center">
            ⭐ {t.kidsAlready}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-parent" className="text-sm font-medium">{t.kidsParentName} *</Label>
            <Input id="kid-parent" name="parentName" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-phone" className="text-sm font-medium">{t.labelPhone} *</Label>
            <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-email" className="text-sm font-medium">{t.labelEmail}</Label>
            <Input id="kid-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-age" className="text-sm font-medium">{t.kidsChildAge}</Label>
            <Input id="kid-age" name="childAge" maxLength={20} placeholder={t.kidsChildAgePlaceholder} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-notes" className="text-sm font-medium">{t.kidsNotes}</Label>
            <Textarea id="kid-notes" name="notes" maxLength={500} placeholder={t.kidsNotesPlaceholder} rows={3} />
          </div>
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            📍 {t.kidsPhysicalOnly}
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-lg font-semibold bg-primary text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:opacity-50">
            {submitting ? t.kidsSubmitting : t.kidsSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KidsCourseForm;
