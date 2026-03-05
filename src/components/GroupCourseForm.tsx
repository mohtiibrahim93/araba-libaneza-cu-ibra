import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar, Clock, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

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

  return (
    <section id="inscriere" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <CedarTree className="text-secondary/20 mx-auto mb-4" size={36} />
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{t.groupTitle}</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">{t.groupDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Details */}
          <div className="rounded-2xl p-8 bg-card border border-border" style={{ boxShadow: "var(--shadow-md)" }}>
            <h3 className="text-lg font-bold mb-8 uppercase tracking-wider text-secondary text-sm">{t.groupDetails}</h3>
            <div className="space-y-7">
              {[
                { icon: Calendar, label: t.groupStartDate, value: t.groupStartDateVal },
                { icon: Clock, label: t.groupSchedule, value: t.groupScheduleVal },
                { icon: Users, label: t.groupDuration, value: t.groupDurationVal },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-secondary">Format:</strong> {t.groupFormatNote}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl p-8 bg-card border border-border space-y-6" style={{ boxShadow: "var(--shadow-md)" }}>
            <h3 className="text-lg font-bold uppercase tracking-wider text-primary text-sm mb-2">{t.groupFormTitle}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="group-name" className="text-sm font-medium">{t.labelName} *</Label>
              <Input id="group-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-phone" className="text-sm font-medium">{t.labelPhone} *</Label>
              <Input id="group-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-email" className="text-sm font-medium">{t.labelEmail}</Label>
              <Input id="group-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
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
              className="w-full py-3.5 rounded-lg font-semibold bg-primary text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:opacity-50 mt-2"
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
