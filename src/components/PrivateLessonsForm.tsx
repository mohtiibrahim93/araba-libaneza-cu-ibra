import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PrivateLessonsForm = () => {
  const { t } = useI18n();
  const [format, setFormat] = useState("fizic");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    console.log("Private lesson interest:", {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      format,
    });
    setTimeout(() => {
      toast.success(t.privateSuccess);
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section id="private" className="py-24 px-6 bg-muted/40 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wider mb-6">
            <UserCheck className="w-3.5 h-3.5" />
            {t.privateBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t.privateTitle}</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{t.privateDesc}</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl p-8 bg-card border border-border space-y-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="space-y-1.5">
            <Label htmlFor="priv-name" className="text-sm font-medium">{t.labelName} *</Label>
            <Input id="priv-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-phone" className="text-sm font-medium">{t.labelPhone} *</Label>
            <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-email" className="text-sm font-medium">{t.labelEmail}</Label>
            <Input id="priv-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.labelFormat} *</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-6 pt-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fizic" id="priv-fizic" />
                <Label htmlFor="priv-fizic" className="cursor-pointer font-normal text-sm">{t.privateFormatPhysical}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="priv-online" />
                <Label htmlFor="priv-online" className="cursor-pointer font-normal text-sm">{t.privateFormatOnline}</Label>
              </div>
            </RadioGroup>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-lg font-semibold bg-secondary text-secondary-foreground transition-all duration-200 hover:brightness-110 disabled:opacity-50">
            {submitting ? t.privateSubmitting : t.privateSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
