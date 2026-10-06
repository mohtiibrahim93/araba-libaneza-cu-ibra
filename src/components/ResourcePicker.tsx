import { useState } from "react";
import { CheckCircle2, FileText, Loader2, Check } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useResources } from "@/hooks/useResources";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The /resurse page's PDFs as cards with one form: the visitor ticks the ones
 * they want and leaves their email once, instead of filling the same form three
 * times. Each ticked PDF is still requested on its own from the
 * `resource-download` edge function, so every lead keeps its resource and the
 * emails are the same as before.
 *
 * Admin rows (table `resources`) override title, description and file, and a
 * PDF deactivated there disappears from the list — as with ResourceDownloadForm.
 */

export interface PickerItem {
  resource: string;
  title: string;
  description: string;
  fileHref: string;
}

const ResourcePicker = ({ items, source }: { items: PickerItem[]; source: string }) => {
  const { toast } = useToast();
  const { lang } = useI18n();
  const en = lang === "en";
  const { data: rows } = useResources();

  const visible = items
    .map((it) => {
      const row = rows?.find((r) => r.slug === it.resource);
      if (rows && !row) return null;
      return {
        ...it,
        title: (row && (en ? row.title_en : row.title_ro)) || it.title,
        description: (row && (en ? row.description_en : row.description_ro)) || it.description,
        fileHref: row?.file_url || it.fileHref,
      };
    })
    .filter((x): x is PickerItem => x !== null);

  const [picked, setPicked] = useState<string[]>(() => items.map((i) => i.resource));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<PickerItem[] | null>(null);

  const chosen = visible.filter((v) => picked.includes(v.resource));
  const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!chosen.length) {
      toast({ title: en ? "Pick at least one PDF" : "Alege cel puțin un PDF", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({
        title: en ? "Please tick the consent box" : "Bifează acordul",
        description: en ? "We need your consent to send you the PDFs." : "Avem nevoie de acordul tău ca să îți trimitem PDF-urile.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const ok: PickerItem[] = [];
    let lastError = "";
    for (const it of chosen) {
      try {
        const { data, error } = await supabase.functions.invoke("resource-download", {
          body: { email, name, consent, resource: it.resource, source },
        });
        const msg = (data as { error?: string } | null)?.error;
        if (error || msg) throw new Error(msg || error?.message);
        ok.push(it);
      } catch (err) {
        lastError = err instanceof Error && err.message ? err.message : en ? "Sending failed." : "Trimiterea a eșuat.";
      }
    }
    setLoading(false);
    if (ok.length) setSent(ok);
    if (ok.length < chosen.length) {
      toast({
        title: ok.length
          ? en ? "Some PDFs could not be sent" : "Unele PDF-uri nu au putut fi trimise"
          : en ? "We couldn't send the PDFs" : "Nu am putut trimite PDF-urile",
        description: lastError,
        variant: "destructive",
      });
    }
  };

  if (sent) {
    return (
      <div className="not-prose rounded-2xl border border-brand-green/30 bg-brand-green/5 p-6 space-y-4">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-brand-green" aria-hidden /> {en ? "Done — check your email" : "Gata — verifică-ți emailul"}
        </p>
        <p className="text-sm text-muted-foreground">
          {en ? "We've sent " : "Ți-am trimis "}
          {sent.length === 1 ? (en ? "the PDF" : "PDF-ul") : en ? `${sent.length} PDFs` : `${sent.length} PDF-uri`}
          {en ? " to " : " pe "}
          <strong>{email}</strong>
          {en
            ? ", one email each. If nothing arrives within a few minutes, check Spam or Promotions too."
            : ", câte un email pentru fiecare. Dacă nu apar în câteva minute, uită-te și în Spam sau Promoții."}
        </p>
        <ul className="space-y-2">
          {sent.map((s) => (
            <li key={s.resource}>
              <a href={s.fileHref} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
                <FileText className="h-4 w-4" aria-hidden /> {en ? "Download now: " : "Descarcă acum: "}
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <Link
          to="/trial"
          className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition hover:bg-primary/90"
        >
          {en ? "Book the free trial lesson" : "Rezervă lecția de probă gratuită"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="not-prose space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-foreground">
          {en ? "1. Pick the PDFs you want" : "1. Alege PDF-urile pe care le vrei"}
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {visible.map((it) => {
            const on = picked.includes(it.resource);
            return (
              <label
                key={it.resource}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-2xl border bg-card p-4 transition sm:p-5",
                  on ? "border-brand-green bg-brand-green/5 shadow-sm" : "border-[#E7E1D6] hover:border-brand-green/50",
                )}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(it.resource)} />
                <span
                  className={cn(
                    "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition",
                    on ? "border-brand-green bg-brand-green text-white" : "border-[#D8D0C2] bg-white",
                  )}
                  aria-hidden
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green sm:flex">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <span className="pr-6 font-display text-lg font-bold leading-snug text-foreground">{it.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.description}</span>
                <span className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wide text-brand-green">
                  {en ? "PDF · free" : "PDF · gratuit"}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-2xl bg-cream p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">{en ? "2. Where should we send them?" : "2. Unde ți le trimitem?"}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rp-name" className="text-sm">{en ? "First name" : "Prenume"}</Label>
            <Input id="rp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria" autoComplete="given-name" maxLength={120} className="bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rp-email" className="text-sm">Email *</Label>
            <Input
              id="rp-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={en ? "maria@example.com" : "maria@exemplu.ro"}
              autoComplete="email"
              maxLength={200}
              className="bg-white"
            />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="rp-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <Label htmlFor="rp-consent" className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground">
            {en
              ? "I agree to receive the PDFs and occasional information about courses. I can unsubscribe at any time. See the "
              : "Sunt de acord să primesc PDF-urile și ocazional informații despre cursuri. Mă pot dezabona oricând. Vezi "}
            <Link to="/privacy" className="text-primary underline">{en ? "privacy policy" : "politica de confidențialitate"}</Link>.
          </Label>
        </div>
        <Button type="submit" disabled={loading || !chosen.length} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {en ? "Sending…" : "Se trimite…"}
            </>
          ) : chosen.length === 1 ? (
            en ? "Send me the PDF" : "Trimite-mi PDF-ul"
          ) : en ? (
            `Send me the ${chosen.length} PDFs`
          ) : (
            `Trimite-mi cele ${chosen.length} PDF-uri`
          )}
        </Button>
      </div>
    </form>
  );
};

export default ResourcePicker;
