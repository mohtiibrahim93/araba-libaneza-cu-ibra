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

  return (
    <section id="inscriere" className="py-20 px-4 scroll-mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.groupTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.groupDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-xl font-semibold mb-6 text-secondary">{t.groupDetails}</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{t.groupStartDate}</p>
                  <p className="text-muted-foreground">{t.groupStartDateVal}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{t.groupSchedule}</p>
                  <p className="text-muted-foreground">{t.groupScheduleVal}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{t.groupDuration}</p>
                  <p className="text-muted-foreground">{t.groupDurationVal}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Format:</strong> {t.groupFormatNote}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-xl font-semibold mb-2 text-secondary">{t.groupFormTitle}</h3>
            <div className="space-y-2">
              <Label htmlFor="group-name">{t.labelName} *</Label>
              <Input id="group-name" name="name" required maxLength={100} placeholder={t.placeholderName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-phone">{t.labelPhone} *</Label>
              <Input id="group-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-email">{t.labelEmail}</Label>
              <Input id="group-email" name="email" type="email" maxLength={255} placeholder={t.placeholderEmail} />
            </div>
            <div className="space-y-2">
              <Label>{t.groupFormatLabel} *</Label>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fizic" id="fizic" />
                  <Label htmlFor="fizic" className="cursor-pointer font-normal">{t.groupPhysical}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="cursor-pointer font-normal">{t.groupOnline}</Label>
                </div>
              </RadioGroup>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
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
