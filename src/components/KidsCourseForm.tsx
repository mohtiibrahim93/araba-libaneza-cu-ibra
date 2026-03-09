import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 tracking-tight">{t.kidsTitle}</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto text-sm">{t.kidsDesc}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="py-3 px-4 border-l-2 border-primary/40 text-sm text-foreground/80">
            {t.kidsAlready}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-parent" className="text-[13px] font-medium">{t.kidsParentName} *</Label>
            <Input id="kid-parent" name="parentName" required maxLength={100} placeholder={t.placeholderName} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-phone" className="text-[13px] font-medium">{t.labelPhone} *</Label>
            <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-email" className="text-[13px] font-medium">{t.labelEmail}</Label>
            <Input id="kid-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-age" className="text-[13px] font-medium">{t.kidsChildAge}</Label>
            <Input id="kid-age" name="childAge" maxLength={20} placeholder={t.kidsChildAgePlaceholder} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kid-notes" className="text-[13px] font-medium">{t.kidsNotes}</Label>
            <Textarea id="kid-notes" name="notes" maxLength={500} placeholder={t.kidsNotesPlaceholder} rows={3} className="border-border bg-background" />
          </div>
          <p className="text-[13px] text-muted-foreground">📍 {t.kidsPhysicalOnly}</p>
          <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90 disabled:opacity-50">
            {submitting ? t.kidsSubmitting : t.kidsSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KidsCourseForm;
