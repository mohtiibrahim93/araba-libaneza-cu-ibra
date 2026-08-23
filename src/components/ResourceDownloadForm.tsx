import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useResource } from "@/hooks/useResources";
import { useI18n } from "@/lib/i18n";

export interface ResourceDownloadFormProps {
  /** Resource key known by the `resource-download` edge function. */
  resource: string;
  /** Which page the lead came from — stored with the lead for attribution. */
  source: string;
  title: string;
  description: string;
  /** Static PDF path, offered as an immediate download after submit. */
  fileHref: string;
  /** Suffix for input ids so multiple forms can live on the same page. */
  idPrefix?: string;
}

/**
 * Reusable lead magnet form: name + email + GDPR consent, saved in the backend,
 * then the resource link is emailed via the transactional queue.
 */
const ResourceDownloadForm = ({
  resource,
  source,
  title,
  description,
  fileHref,
  idPrefix = resource,
}: ResourceDownloadFormProps) => {
  const { toast } = useToast();
  const { language } = useI18n();
  // Admin-editable overrides (title, description, PDF link, visibility).
  const { resource: row, loaded } = useResource(resource);
  const displayTitle = row ? (language === "en" ? row.title_en : row.title_ro) || title : title;
  const displayDescription = row
    ? (language === "en" ? row.description_en : row.description_ro) || description
    : description;
  const displayFileHref = row?.file_url || fileHref;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!consent) {
      toast({ title: "Bifează acordul", description: "Avem nevoie de acordul tău ca să îți trimitem PDF-ul.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resource-download", {
        body: { email, name, consent, resource, source },
      });
      const errMessage = (data as { error?: string } | null)?.error;
      if (error || errMessage) {
        throw new Error(errMessage || error?.message || "Trimiterea a eșuat.");
      }
      setDone(true);
    } catch (err) {
      toast({
        title: "Nu am putut trimite PDF-ul",
        description: err instanceof Error ? err.message : "Încearcă din nou în câteva momente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Row deleted/deactivated in admin -> hide the form entirely.
  if (loaded && !row) return null;

  if (done) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3 not-prose">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden /> Gata — verifică-ți emailul
        </p>
        <p className="text-sm text-muted-foreground">
          Ți-am trimis PDF-ul pe <strong>{email}</strong>. Dacă nu apare în câteva minute, uită-te și
          în Spam sau Promoții.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/trial"
            className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm no-underline hover:bg-primary/90 transition"
          >
            Rezervă lecția de probă gratuită
          </Link>
          <a
            href={displayFileHref}
            className="inline-block border border-border px-5 py-2.5 rounded-lg font-semibold text-sm text-foreground no-underline hover:bg-muted transition"
          >
            Descarcă acum PDF-ul
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-muted/30 p-6 space-y-4 not-prose">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5 text-primary shrink-0" aria-hidden />
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{displayDescription}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-name`} className="text-sm">Prenume</Label>
          <Input id={`${idPrefix}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria" autoComplete="given-name" maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-email`} className="text-sm">Email *</Label>
          <Input id={`${idPrefix}-email`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@exemplu.ro" autoComplete="email" maxLength={200} />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id={`${idPrefix}-consent`} checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        <Label htmlFor={`${idPrefix}-consent`} className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed">
          Sunt de acord să primesc PDF-ul și ocazional informații despre cursuri. Mă pot dezabona
          oricând. Vezi{" "}
          <Link to="/privacy" className="text-primary underline">politica de confidențialitate</Link>.
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se trimite…</>) : "Trimite-mi PDF-ul"}
      </Button>
    </form>
  );
};

export default ResourceDownloadForm;
