import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
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
    <section id="private" className="py-24 px-6 bg-accent scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 tracking-tight">{t.privateTitle}</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto text-sm">{t.privateDesc}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="priv-name" className="text-[13px] font-medium">{t.labelName} *</Label>
            <Input id="priv-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-phone" className="text-[13px] font-medium">{t.labelPhone} *</Label>
            <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-email" className="text-[13px] font-medium">{t.labelEmail}</Label>
            <Input id="priv-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11 border-border bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">{t.labelFormat} *</Label>
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
          <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90 disabled:opacity-50">
            {submitting ? t.privateSubmitting : t.privateSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
