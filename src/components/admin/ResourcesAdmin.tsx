import { useCallback, useEffect, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2, Pencil, Plus, ExternalLink, Upload } from "lucide-react";

interface ResourceRow {
  slug: string;
  title_ro: string;
  title_en: string;
  description_ro: string;
  description_en: string;
  file_url: string;
  email_template: string;
  is_active: boolean;
  sort_order: number;
  updated_at?: string;
}

const emptyDraft = (): ResourceRow => ({
  slug: "",
  title_ro: "",
  title_en: "",
  description_ro: "",
  description_en: "",
  file_url: "",
  email_template: "",
  is_active: true,
  sort_order: 0,
});

/**
 * Admin editor for the free downloadable resources (lead magnets). Rows here
 * drive the title, description and PDF link shown by the download forms on the
 * public pages, plus which transactional email template is sent.
 */
const ResourcesAdmin = () => {
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ResourceRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await invokeAdmin(payload);
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list_resources" });
      setRows((data?.data ?? []) as ResourceRow[]);
    } catch (err) {
      toast({
        title: "Nu am putut încărca resursele",
        description: err instanceof Error ? err.message : "Eroare necunoscută",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await call({ action: "upsert_resource", ...draft });
      toast({ title: "Resursă salvată" });
      setDraft(null);
      await load();
    } catch (err) {
      toast({
        title: "Salvarea a eșuat",
        description: err instanceof Error ? err.message : "Eroare necunoscută",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slug: string) => {
    if (!confirm(`Ștergi resursa „${slug}”? Formularul ei dispare de pe site.`)) return;
    try {
      await call({ action: "delete_resource", slug });
      toast({ title: "Resursă ștearsă" });
      await load();
    } catch (err) {
      toast({
        title: "Ștergerea a eșuat",
        description: err instanceof Error ? err.message : "Eroare necunoscută",
        variant: "destructive",
      });
    }
  };

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buf.length; i += 8192) {
        binary += String.fromCharCode(...buf.subarray(i, i + 8192));
      }
      const data = await call({
        action: "upload_resource_file",
        file_name: file.name,
        data_base64: btoa(binary),
      });
      setDraft((d) => (d ? { ...d, file_url: data.url as string } : d));
      toast({ title: "PDF încărcat" });
    } catch (err) {
      toast({
        title: "Încărcarea a eșuat",
        description: err instanceof Error ? err.message : "Eroare necunoscută",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const field = (
    key: keyof ResourceRow,
    label: string,
    multiline = false,
    placeholder = "",
  ) => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {multiline ? (
        <Textarea
          rows={3}
          value={String(draft?.[key] ?? "")}
          placeholder={placeholder}
          onChange={(e) => setDraft((d) => (d ? { ...d, [key]: e.target.value } : d))}
        />
      ) : (
        <Input
          value={String(draft?.[key] ?? "")}
          placeholder={placeholder}
          onChange={(e) => setDraft((d) => (d ? { ...d, [key]: e.target.value } : d))}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă resursele…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Resurse gratuite</h2>
          <p className="text-sm text-muted-foreground">
            Titlul, descrierea și PDF-ul folosite de formularele de descărcare de pe site.
          </p>
        </div>
        <Button onClick={() => setDraft(emptyDraft())} className="gap-1.5">
          <Plus className="w-4 h-4" /> Resursă nouă
        </Button>
      </div>

      <div className="rounded-xl border border-border divide-y">
        {rows.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Nicio resursă încă.</p>
        )}
        {rows.map((r) => (
          <div key={r.slug} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <p className="font-semibold text-foreground">{r.title_ro || r.slug}</p>
              <p className="text-xs text-muted-foreground">
                {r.slug} · {r.is_active ? "activă" : "ascunsă"} · ordine {r.sort_order}
              </p>
            </div>
            {r.file_url && (
              <a
                href={r.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary inline-flex items-center gap-1"
              >
                PDF <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Button variant="outline" size="sm" onClick={() => setDraft(r)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Editează
            </Button>
            <Button variant="ghost" size="sm" onClick={() => remove(r.slug)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {draft && (
        <div className="rounded-xl border border-border p-5 space-y-4">
          <h3 className="font-semibold">
            {rows.some((r) => r.slug === draft.slug) ? "Editează resursa" : "Resursă nouă"}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {field("slug", "Slug (identificator, ex. plan-30-zile)", false, "plan-30-zile")}
            {field("email_template", "Template email transactional", false, "plan-30-zile")}
            {field("title_ro", "Titlu (RO)")}
            {field("title_en", "Titlu (EN)")}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {field("description_ro", "Descriere (RO)", true)}
            {field("description_en", "Descriere (EN)", true)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {field("file_url", "Link PDF", false, "/plan-30-zile-araba-libaneza.pdf")}
            <div className="space-y-1.5">
              <Label className="text-sm">Încarcă PDF nou</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 w-full"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Se încarcă…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Alege fișier PDF</>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
              />
              <Label className="text-sm">Activă pe site</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Ordine</Label>
              <Input
                type="number"
                className="w-24"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={save} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvează
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Renunță
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesAdmin;
