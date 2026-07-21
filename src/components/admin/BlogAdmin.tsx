import { useCallback, useEffect, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { BLOG_SEED } from "@/lib/blogSeedBodies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Music, ExternalLink, Trash2, Pencil, FileText } from "lucide-react";

interface OverrideRow {
  slug: string;
  title_ro: string;
  is_published: boolean;
  updated_at: string;
}

interface Draft {
  slug: string;
  title_ro: string;
  title_en: string;
  description_ro: string;
  description_en: string;
  lead_ro: string;
  lead_en: string;
  body_ro: string;
  body_en: string;
  reading_minutes: number;
  is_published: boolean;
}

const emptyDraft = (slug: string): Draft => {
  // Prefill everything from the code registry + the Markdown seed (faithful
  // conversions of the current article bodies), so the owner edits the
  // existing text instead of rewriting it.
  const reg = BLOG_POSTS.find((p) => p.slug === slug);
  const seed = BLOG_SEED[slug];
  return {
    slug,
    title_ro: reg?.title.ro ?? "",
    title_en: reg?.title.en ?? "",
    description_ro: reg?.description.ro ?? "",
    description_en: reg?.description.en ?? "",
    lead_ro: seed?.lead_ro ?? "",
    lead_en: seed?.lead_en ?? "",
    body_ro: seed?.ro ?? "",
    body_en: seed?.en ?? "",
    reading_minutes: reg?.readingMinutes ?? 5,
    is_published: false,
  };
};

/**
 * Blog CMS editor (override model): saving + publishing a version here
 * REPLACES the code-shipped article on the site; deleting it reverts the
 * article to the code version. Bodies are Markdown; images and audio are
 * uploaded to storage and inserted as Markdown at the cursor.
 */
const BlogAdmin = () => {
  const [rows, setRows] = useState<OverrideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"ro" | "en" | null>(null);
  const bodyRoRef = useRef<HTMLTextAreaElement>(null);
  const bodyEnRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadTarget = useRef<"ro" | "en">("ro");

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await invokeAdmin(payload);
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list_blog_articles" });
      setRows(data.data || []);
    } catch {
      toast({ title: "Nu am putut încărca articolele (funcția admin trebuie redeployată?)", variant: "destructive" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = async (slug: string) => {
    setLoadingDraft(true);
    try {
      const data = await call({ action: "get_blog_article", slug });
      if (data.data) {
        // Existing row: keep it, but fill any still-empty bodies/leads from
        // the seed so the original text is always there to edit.
        const base = emptyDraft(slug);
        const row = data.data as Partial<Draft>;
        setDraft({
          ...base,
          ...row,
          lead_ro: row.lead_ro || base.lead_ro,
          lead_en: row.lead_en || base.lead_en,
          body_ro: row.body_ro || base.body_ro,
          body_en: row.body_en || base.body_en,
        });
      } else {
        setDraft(emptyDraft(slug));
      }
    } catch {
      setDraft(emptyDraft(slug));
    } finally {
      setLoadingDraft(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await call({ action: "upsert_blog_article", ...draft });
      toast({
        title: draft.is_published ? "Salvat și publicat — site-ul afișează versiunea ta" : "Salvat ca draft (site-ul afișează încă versiunea din cod)",
      });
      await load();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Salvare eșuată", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async (slug: string) => {
    if (!confirm("Ștergi versiunea editată? Articolul revine la versiunea originală din site.")) return;
    try {
      await call({ action: "delete_blog_article", slug });
      toast({ title: "Versiunea editată a fost ștearsă — articolul folosește iar originalul" });
      if (draft?.slug === slug) setDraft(null);
      await load();
    } catch {
      toast({ title: "Ștergere eșuată", variant: "destructive" });
    }
  };

  const startUpload = (target: "ro" | "en") => {
    pendingUploadTarget.current = target;
    fileInputRef.current?.click();
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !draft) return;
    const target = pendingUploadTarget.current;
    setUploading(target);
    try {
      const buf = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const data = await call({
        action: "upload_blog_media",
        file_name: file.name,
        content_type: file.type,
        data_base64: btoa(binary),
      });
      const isAudio = file.type.startsWith("audio/");
      const snippet = isAudio ? `\n[Ascultă audio](${data.url})\n` : `\n![${file.name}](${data.url})\n`;
      const ref = target === "ro" ? bodyRoRef : bodyEnRef;
      const field = target === "ro" ? "body_ro" : "body_en";
      const ta = ref.current;
      const pos = ta ? ta.selectionStart : draft[field].length;
      const next = draft[field].slice(0, pos) + snippet + draft[field].slice(pos);
      setDraft({ ...draft, [field]: next });
      toast({ title: isAudio ? "Audio urcat și inserat (devine player pe site)" : "Imagine urcată și inserată" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Upload eșuat", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const overrideBySlug = new Map(rows.map((r) => [r.slug, r]));
  const allSlugs = [
    ...BLOG_POSTS.map((p) => ({ slug: p.slug, title: p.title.ro })),
    // Overrides for slugs no longer in the registry (safety)
    ...rows.filter((r) => !BLOG_POSTS.some((p) => p.slug === r.slug)).map((r) => ({ slug: r.slug, title: r.title_ro || r.slug })),
  ];

  const bodyEditor = (langKey: "ro" | "en") => {
    const field = langKey === "ro" ? "body_ro" : "body_en";
    const ref = langKey === "ro" ? bodyRoRef : bodyEnRef;
    if (!draft) return null;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide">Conținut {langKey.toUpperCase()} (Markdown)</Label>
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => startUpload(langKey)} disabled={uploading !== null}>
              {uploading === langKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              <Music className="w-3.5 h-3.5 -ml-1" />
              Imagine/Audio
            </Button>
          </div>
        </div>
        <Textarea
          ref={ref}
          rows={16}
          className="font-mono text-xs"
          placeholder={langKey === "en"
            ? "Empty = the English body falls back to the Romanian one."
            : "## Titlu de secțiune\n\nText… **bold**, [link](/trial), tabele GFM.\nGol + publicat = doar titlul/descrierea sunt suprascrise."}
          value={draft[field]}
          onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
        />
      </div>
    );
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Articole blog — editare</h2>
        <p className="text-sm text-muted-foreground">
          Versiunea salvată și <strong>publicată</strong> aici înlocuiește articolul de pe site.
          Ștergerea versiunii editate readuce originalul. Corpul e Markdown: „## " pentru titluri,
          imagini/audio cu butonul de upload, linkuri interne ca „/trial".
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,audio/*" className="hidden" onChange={onFilePicked} />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : (
        <div className="space-y-1.5 mb-5">
          {allSlugs.map(({ slug, title }) => {
            const o = overrideBySlug.get(slug);
            return (
              <div key={slug} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <div className="min-w-0 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{title}</span>
                  {o ? (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${o.is_published ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                      {o.is_published ? "editat · publicat" : "draft"}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">original</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground" title="Vezi pe site">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {o && (
                    <button type="button" onClick={() => removeOverride(slug)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Șterge versiunea editată">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Button type="button" size="sm" variant="outline" onClick={() => openEditor(slug)}>
                    <Pencil className="w-3.5 h-3.5" /> Editează
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loadingDraft && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se deschide editorul…
        </div>
      )}

      {draft && !loadingDraft && (
        <div className="rounded-md border border-primary/30 bg-background p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Editezi: /blog/{draft.slug}</p>
            <div className="flex items-center gap-2">
              {BLOG_SEED[draft.slug] && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!confirm("Înlocuiești textul din editor cu textul original al articolului?")) return;
                    const seed = BLOG_SEED[draft.slug];
                    setDraft({ ...draft, body_ro: seed.ro, body_en: seed.en, lead_ro: seed.lead_ro, lead_en: seed.lead_en });
                  }}
                >
                  Reîncarcă textul original
                </Button>
              )}
              <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(null)}>Închide</Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Titlu RO</Label>
              <Input value={draft.title_ro} onChange={(e) => setDraft({ ...draft, title_ro: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Titlu EN</Label>
              <Input value={draft.title_en} onChange={(e) => setDraft({ ...draft, title_en: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descriere SEO RO (max 300)</Label>
              <Textarea rows={2} value={draft.description_ro} onChange={(e) => setDraft({ ...draft, description_ro: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descriere SEO EN</Label>
              <Textarea rows={2} value={draft.description_en} onChange={(e) => setDraft({ ...draft, description_en: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Intro (lead) RO — gol = rămâne cel din cod</Label>
              <Textarea rows={2} value={draft.lead_ro} onChange={(e) => setDraft({ ...draft, lead_ro: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Intro (lead) EN</Label>
              <Textarea rows={2} value={draft.lead_en} onChange={(e) => setDraft({ ...draft, lead_en: e.target.value })} />
            </div>
          </div>

          {bodyEditor("ro")}
          {bodyEditor("en")}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} id="blog-pub" />
                <Label htmlFor="blog-pub" className="text-sm">
                  {draft.is_published ? "Publicat (înlocuiește articolul de pe site)" : "Draft (site-ul arată originalul)"}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Min. citire</Label>
                <Input type="number" min={1} max={60} className="w-16 h-8" value={draft.reading_minutes}
                  onChange={(e) => setDraft({ ...draft, reading_minutes: Number(e.target.value) || 5 })} />
              </div>
            </div>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Salvează
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogAdmin;
