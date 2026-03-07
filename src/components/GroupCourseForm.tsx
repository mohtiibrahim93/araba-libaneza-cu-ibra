import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar, Clock, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const GroupCourseForm = () => {
  const { t } = useI18n();
  const [format, setFormat] = useState("fizic");
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
    { icon: Calendar, label: t.groupStartDate, value: t.groupStartDateVal },
    { icon: Clock, label: t.groupSchedule, value: t.groupScheduleVal },
    { icon: Users, label: t.groupDuration, value: t.groupDurationVal },
  ];

  return (
    <section id="inscriere" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-secondary font-semibold text-center mb-2">—</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">{t.groupTitle}</h2>
        <p className="text-muted-foreground text-center mb-14 max-w-md mx-auto">{t.groupDesc}</p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Details */}
          <div className="rounded-lg p-7 bg-card border border-border">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-7">{t.groupDetails}</h3>
            <div className="space-y-6">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-muted-foreground text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-3 rounded bg-secondary/5 border border-secondary/10">
              <p className="text-sm text-muted-foreground">
                <strong className="text-secondary">Format:</strong> {t.groupFormatNote}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-lg p-7 bg-card border border-border space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">{t.groupFormTitle}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="group-name" className="text-sm font-medium">{t.labelName} *</Label>
              <Input id="group-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-phone" className="text-sm font-medium">{t.labelPhone} *</Label>
              <Input id="group-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-email" className="text-sm font-medium">{t.labelEmail}</Label>
              <Input id="group-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.groupFormatLabel} *</Label>
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
              className="w-full py-3 rounded font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
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
