import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

const PrivateLessonsForm = () => {
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
    console.log("Private lesson interest:", data);
    setTimeout(() => {
      toast.success("Cererea a fost înregistrată! Vă vom contacta în curând.");
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <UserCheck className="w-4 h-4" />
            Lecții individuale
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lecții Private de Arabă
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Vrei atenție personalizată? Lasă-ne datele tale și te vom contacta
            pentru a stabili un program flexibil.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-8 border border-border space-y-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="space-y-2">
            <Label htmlFor="priv-name">Nume complet *</Label>
            <Input id="priv-name" name="name" required maxLength={100} placeholder="Ion Popescu" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priv-phone">Telefon *</Label>
            <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder="+40 7XX XXX XXX" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priv-email">Email</Label>
            <Input id="priv-email" name="email" type="email" maxLength={255} placeholder="ion@email.com" />
          </div>

          <div className="space-y-2">
            <Label>Preferință format *</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fizic" id="priv-fizic" />
                <Label htmlFor="priv-fizic" className="cursor-pointer font-normal">Față în față (fizic)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="priv-online" />
                <Label htmlFor="priv-online" className="cursor-pointer font-normal">Online</Label>
              </div>
            </RadioGroup>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "var(--gradient-warm)" }}
          >
            {submitting ? "Se trimite..." : "Vreau să fiu contactat(ă)"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
