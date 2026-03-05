import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar, Clock, Users } from "lucide-react";

const GroupCourseForm = () => {
  const [format, setFormat] = useState("fizic");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      format,
    };
    console.log("Group course registration:", data);
    setTimeout(() => {
      toast.success("Înscrierea a fost trimisă cu succes! Vă vom contacta în curând.");
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section id="inscriere" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Curs de Grup — Arabă Libaneză
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Prezență fizică sau online. Începem pe 17 martie 2026!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Details Card */}
          <div
            className="bg-card rounded-xl p-8 border border-border"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-xl font-semibold mb-6 text-secondary">Detalii curs</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Data start</p>
                  <p className="text-muted-foreground">17 Martie 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Program</p>
                  <p className="text-muted-foreground">
                    Marți & Joi, 19:00 – 20:30
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Durata</p>
                  <p className="text-muted-foreground">
                    ~3 luni • 24 lecții în total
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Format:</strong> Poți alege între prezență fizică și online.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-xl p-8 border border-border space-y-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-xl font-semibold mb-2 text-secondary">Formular de înscriere</h3>

            <div className="space-y-2">
              <Label htmlFor="group-name">Nume complet *</Label>
              <Input id="group-name" name="name" required maxLength={100} placeholder="Ion Popescu" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-phone">Telefon *</Label>
              <Input id="group-phone" name="phone" type="tel" required maxLength={20} placeholder="+40 7XX XXX XXX" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-email">Email</Label>
              <Input id="group-email" name="email" type="email" maxLength={255} placeholder="ion@email.com" />
            </div>

            <div className="space-y-2">
              <Label>Format dorit *</Label>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fizic" id="fizic" />
                  <Label htmlFor="fizic" className="cursor-pointer font-normal">Fizic</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="cursor-pointer font-normal">Online</Label>
                </div>
              </RadioGroup>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-warm)" }}
            >
              {submitting ? "Se trimite..." : "Trimite înscrierea"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GroupCourseForm;
