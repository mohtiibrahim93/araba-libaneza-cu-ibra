import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const PrivateLessonsForm = () => {
  const { t } = useI18n();
  const [format, setFormat] = useState("fizic");
  const [center, setCenter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("registrations").insert({
      form_type: "private",
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      center,
      format,
    });

    if (error) {
      toast.error("A apărut o eroare. Încercați din nou.");
      console.error("Registration error:", error);
    } else {
      toast.success(t.privateSuccess);
      (e.target as HTMLFormElement).reset();
      setCenter("");
      setFormat("fizic");
    }
    setSubmitting(false);
  };

  return (
    <section id="private" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t.privateTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.privateDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background rounded-2xl border border-border p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="priv-name" className="text-sm">{t.labelName} *</Label>
            <Input id="priv-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-phone" className="text-sm">{t.labelPhone} *</Label>
            <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priv-email" className="text-sm">{t.labelEmail}</Label>
            <Input id="priv-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
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
          <div className="space-y-2">
            <Label className="text-sm">{t.labelFormat} *</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-6 pt-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fizic" id="priv-fizic" />
                <Label htmlFor="priv-fizic" className="cursor-pointer text-sm font-normal">{t.privateFormatPhysical}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="priv-online" />
                <Label htmlFor="priv-online" className="cursor-pointer text-sm font-normal">{t.privateFormatOnline}</Label>
              </div>
            </RadioGroup>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 disabled:opacity-50">
            {submitting ? t.privateSubmitting : t.privateSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
