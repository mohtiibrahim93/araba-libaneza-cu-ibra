import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const GroupCourseForm = () => {
  const { t } = useI18n();
  const [format, setFormat] = useState("fizic");
  const [center, setCenter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    console.log("Group course registration:", {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      format,
    });
    setTimeout(() => {
      toast.success(t.groupSuccess);
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  const details = [
    { label: t.groupStartDate, value: t.groupStartDateVal },
    { label: t.groupSchedule, value: t.groupScheduleVal },
    { label: t.groupDuration, value: t.groupDurationVal },
  ];

  return (
    <section id="inscriere" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 tracking-tight">{t.groupTitle}</h2>
        <p className="text-muted-foreground text-center mb-16 max-w-md mx-auto text-sm">{t.groupDesc}</p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Details */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-8">{t.groupDetails}</h3>
            <div className="space-y-6">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 py-3 px-4 border-l-2 border-primary/30">
              <p className="text-sm text-muted-foreground">{t.groupFormatNote}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-2">{t.groupFormTitle}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="group-name" className="text-[13px] font-medium">{t.labelName} *</Label>
              <Input id="group-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11 border-border bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-phone" className="text-[13px] font-medium">{t.labelPhone} *</Label>
              <Input id="group-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11 border-border bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-email" className="text-[13px] font-medium">{t.labelEmail}</Label>
              <Input id="group-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11 border-border bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">{t.centerLabel} *</Label>
              <Select value={center} onValueChange={setCenter} required>
                <SelectTrigger className="h-11 border-border bg-background">
                  <SelectValue placeholder={t.centerPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bucuresti">{t.centerBucharest}</SelectItem>
                  <SelectItem value="cluj">{t.centerCluj}</SelectItem>
                  <SelectItem value="timisoara">{t.centerTimisoara}</SelectItem>
                  <SelectItem value="online">{t.centerOnline}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">{t.groupFormatLabel} *</Label>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fizic" id="fizic" />
                  <Label htmlFor="fizic" className="cursor-pointer font-normal text-sm">{t.groupPhysical}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="cursor-pointer font-normal text-sm">{t.groupOnline}</Label>
                </div>
              </RadioGroup>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t.groupSubmitting : t.groupSubmit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GroupCourseForm;
