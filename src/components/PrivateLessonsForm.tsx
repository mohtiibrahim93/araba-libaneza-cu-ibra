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
    <section id="private" className="py-20 px-4 bg-muted/30 scroll-mt-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <UserCheck className="w-4 h-4" />
            {t.privateBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.privateTitle}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t.privateDesc}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="space-y-2">
            <Label htmlFor="priv-name">{t.labelName} *</Label>
            <Input id="priv-name" name="name" required maxLength={100} placeholder={t.placeholderName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priv-phone">{t.labelPhone} *</Label>
            <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priv-email">{t.labelEmail}</Label>
            <Input id="priv-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} />
          </div>
          <div className="space-y-2">
            <Label>{t.labelFormat} *</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fizic" id="priv-fizic" />
                <Label htmlFor="priv-fizic" className="cursor-pointer font-normal">{t.privateFormatPhysical}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="priv-online" />
                <Label htmlFor="priv-online" className="cursor-pointer font-normal">{t.privateFormatOnline}</Label>
              </div>
            </RadioGroup>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg font-semibold bg-secondary text-secondary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60">
            {submitting ? t.privateSubmitting : t.privateSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
