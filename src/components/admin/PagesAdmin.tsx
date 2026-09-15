import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { PAGE_SEEDS } from "@/data/pageSeeds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Trash2, Plus, ExternalLink, Image as ImageIcon } from "lucide-react";

interface FaqItem { q: string; a: string }

interface PageRow {
  path: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  lead: string;
  body_md: string;
  faq: FaqItem[];
  is_published: boolean;
  updated_at?: string;
}

const emptyRow = (path = ""): PageRow => ({
  path,
  meta_title: "",
  meta_description: "",
  h1: "",
  lead: "",
  body_md: "",
  faq: [],
  is_published: true,
});

/**
 * Owner editor for the SEO landing pages: meta, H1, intro, Markdown body and
 * FAQ. Every field is an override — left empty, the page keeps the version
 * shipped in code. Deleting the row restores the original page entirely.
 */
const PagesAdmin = () => {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<PageRow | null>(null);
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
      const data = await call({ action: "list_page_contents" });
      setRows(((data?.data ?? []) as PageRow[]).map((r) => ({ ...r, faq: Array.isArray(r.faq) ? r.faq : [] })));
    } catch (e) {
      toast({ title: "Nu am putut încărca paginile", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const byPath = useMemo(() => {
    const m: Record<string, PageRow> = {};
    for (const r of rows) m[r.path] = r;
    return m;
  }, [rows]);

  const knownPaths = useMemo(() => {
    const set = new Set(PAGE_SEEDS.map((s) => s.path));
    for (const r of rows) set.add(r.path);
    return [...set].sort();
  }, [rows]);

  const openPage = (path: string) => {
    const existing = byPath[path];
    if (existing) { setDraft({ ...existing }); return; }
    const seed = PAGE_SEEDS.find((s) => s.path === path);
    setDraft(seed ? { ...emptyRow(path), ...seed } : emptyRow(path));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await call({ action: "upsert_page_content", ...draft });
      toast({ title: "Pagina a fost salvată", description: draft.path });
      setDraft(null);
      await load();
    } catch (e) {
      toast({ title: "Salvare eșuată", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (path: string) => {
    if (!window.confirm(`Ștergi versiunea editată pentru ${path}? Pagina revine la varianta din cod.`)) return;
    try {
      await call({ action: "delete_page_content", path });
      toast({ title: "Versiune ștearsă", description: path });
      if (draft?.path === path) setDraft(null);
      await load();
    } catch (e) {
      toast({ title: "Ștergere eșuată", description: String((e as Error).message), variant: "destructive" });
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Nu am putut citi fișierul"));
        reader.readAsDataURL(file);
      });
      const data = await call({ action: "upload_blog_media", file_name: file.name, data_base64: base64 });
      const url = data?.url as string;
      setDraft((d) => (d ? { ...d, body_md: `${d.body_md}\n\n![${file.name}](${url})\n` } : d));
      toast({ title: "Imagine adăugată în corpul paginii" });
    } catch (e) {
      toast({ title: "Upload eșuat", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10">
        <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă paginile…
      </div>
    );
  }

  if (draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">Editezi {draft.path}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDraft(null)}>Renunță</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Salvează
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Cale pagină</Label>
          <Input value={draft.path} onChange={(e) => setDraft({ ...draft, path: e.target.value })} placeholder="/arabizi" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Titlu SEO (meta title)</Label>
            <Input value={draft.meta_title} onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Descriere SEO (meta description)</Label>
            <Input value={draft.meta_description} onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Titlu pagină (H1)</Label>
          <Input value={draft.h1} onChange={(e) => setDraft({ ...draft, h1: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label>Intro</Label>
          <Textarea rows={2} value={draft.lead} onChange={(e) => setDraft({ ...draft, lead: e.target.value })} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Label>Corp pagină (Markdown)</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); }}
              />
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
                Adaugă imagine
              </Button>
            </div>
          </div>
          <Textarea
            rows={16}
            className="font-mono text-sm"
            placeholder="Lasă gol ca să păstrezi conținutul actual al paginii. Scrie aici pentru a-l înlocui complet."
            value={draft.body_md}
            onChange={(e) => setDraft({ ...draft, body_md: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Gol = pagina rămâne exact cum e acum. Completat = corpul paginii e înlocuit cu textul tău (titluri cu ##, liste cu -, linkuri [text](/cursuri)).
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Întrebări frecvente</Label>
            <Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, faq: [...draft.faq, { q: "", a: "" }] })}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Adaugă întrebare
            </Button>
          </div>
          {draft.faq.map((item, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <Input
                placeholder="Întrebare"
                value={item.q}
                onChange={(e) => {
                  const faq = [...draft.faq]; faq[i] = { ...(faq[i] ?? { q: "", a: "" }), q: e.target.value }; setDraft({ ...draft, faq });
                }}
              />
              <Textarea
                rows={2}
                placeholder="Răspuns"
                value={item.a}
                onChange={(e) => {
                  const faq = [...draft.faq]; faq[i] = { ...(faq[i] ?? { q: "", a: "" }), a: e.target.value }; setDraft({ ...draft, faq });
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, faq: draft.faq.filter((_, j) => j !== i) })}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Șterge întrebarea
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
          <span className="text-sm text-muted-foreground">Versiunea ta e activă pe site</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Editezi meta, titlul, introducerea, corpul și întrebările frecvente pentru paginile de conținut.
        Câmpurile lăsate goale păstrează textul actual din site.
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setDraft(emptyRow())}>
          <Plus className="w-4 h-4 mr-1" /> Pagină nouă (cale manuală)
        </Button>
      </div>

      <div className="space-y-2">
        {knownPaths.map((path) => {
          const row = byPath[path];
          return (
            <div key={path} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{row?.h1 || PAGE_SEEDS.find((s) => s.path === path)?.h1 || path}</div>
                <code className="text-xs text-muted-foreground">{path}</code>
                {row ? (
                  <span className="ml-2 text-xs text-primary">
                    {row.is_published ? "versiune editată activă" : "versiune editată (ascunsă)"}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={path} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary" aria-label={`Deschide ${path}`}>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Button size="sm" variant="outline" onClick={() => openPage(path)}>Editează</Button>
                {row ? (
                  <Button size="sm" variant="ghost" onClick={() => remove(path)} aria-label="Șterge versiunea">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PagesAdmin;
