import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Baby } from "lucide-react";

const KidsCourseForm = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      parentName: formData.get("parentName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      childAge: formData.get("childAge"),
      notes: formData.get("notes"),
    };
    console.log("Kids course interest:", data);
    setTimeout(() => {
      toast.success("Cererea a fost înregistrată! Vă vom contacta pentru detalii.");
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Baby className="w-4 h-4" />
            Cursuri pentru copii
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Curs de Arabă pentru Copii
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Avem deja 3 copii înscriși! Doar prezență fizică.
            Completați formularul și vă vom contacta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-8 border border-border space-y-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="p-3 rounded-lg bg-accent/10 text-accent text-sm font-medium text-center">
            ⭐ 3 copii deja înscriși — locuri limitate!
          </div>

          <div className="space-y-2">
            <Label htmlFor="kid-parent">Numele părintelui *</Label>
            <Input id="kid-parent" name="parentName" required maxLength={100} placeholder="Maria Ionescu" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kid-phone">Telefon *</Label>
            <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder="+40 7XX XXX XXX" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kid-email">Email</Label>
            <Input id="kid-email" name="email" type="email" maxLength={255} placeholder="maria@email.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kid-age">Vârsta copilului</Label>
            <Input id="kid-age" name="childAge" maxLength={20} placeholder="ex: 8 ani" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kid-notes">Observații</Label>
            <Textarea id="kid-notes" name="notes" maxLength={500} placeholder="Orice informații adiționale..." rows={3} />
          </div>

          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            📍 Cursul pentru copii este disponibil <strong>doar cu prezență fizică</strong>.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "var(--gradient-warm)" }}
          >
            {submitting ? "Se trimite..." : "Înscrie copilul"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KidsCourseForm;
