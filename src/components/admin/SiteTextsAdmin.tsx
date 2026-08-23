import { useCallback, useEffect, useMemo, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { translations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, Save, Search } from "lucide-react";

interface TextRow {
  key: string;
  value_ro: string;
  value_en: string;
}

/** Rough section grouping so the key list is browsable, not a wall of names. */
const SECTIONS: { label: string; test: (k: string) => boolean }[] = [
  { label: "Meniu & navigație", test: (k) => /^nav|menu|footer/i.test(k) },
  { label: "Homepage & hero", test: (k) => /^hero|^steps?|^why|^social|^cta/i.test(k) },
  { label: "Cursuri & programe", test: (k) => /^curs|^program|^track|^level|^kids|^copii|^grup/i.test(k) },
  { label: "Prețuri & plată", test: (k) => /pric|pret|price|plat|pay|checkout|abonament/i.test(k) },
  { label: "Formulare", test: (k) => /form|field|submit|valid|consent|register|inscri/i.test(k) },
  { label: "FAQ & blog", test: (k) => /faq|blog|articol|resurs/i.test(k) },
];

const sectionOf = (key: string) => SECTIONS.find((s) => s.test(key))?.label ?? "Restul site-ului";

/**
 * Owner editor for every shared string on the site (RO + EN). Rows are stored
 * as overrides on top of the code dictionary — deleting a row restores the
 * original text.
 */
const SiteTextsAdmin = () => {
  const [overrides, setOverrides] = useState<Record<string, TextRow>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { ro: string; en: string }>>({});

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await invokeAdmin(payload);
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list_site_texts" });
      const map: Record<string, TextRow> = {};
      for (const row of (data?.data ?? []) as TextRow[]) map[row.key] = row;
      setOverrides(map);
    } catch (e) {
      toast({ title: "Nu am putut încărca textele", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const allKeys = useMemo(() => Object.keys(translations.ro).sort(), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allKeys
      .filter((k) => {
        if (onlyEdited && !overrides[k]) return false;
        if (!q) return true;
        const ro = String((translations.ro as Record<string, string>)[k] ?? "");
        const en = String((translations.en as Record<string, string>)[k] ?? "");
        const ov = overrides[k];
        return (
          k.toLowerCase().includes(q) ||
          ro.toLowerCase().includes(q) ||
          en.toLowerCase().includes(q) ||
          (ov?.value_ro ?? "").toLowerCase().includes(q) ||
          (ov?.value_en ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 300);
  }, [allKeys, query, onlyEdited, overrides]);

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {};
    for (const k of rows) (g[sectionOf(k)] ||= []).push(k);
    return g;
  }, [rows]);

  const valueFor = (key: string, lang: "ro" | "en") => {
    const draft = drafts[key];
    if (draft) return lang === "ro" ? draft.ro : draft.en;
    const ov = overrides[key];
    if (ov) return lang === "ro" ? ov.value_ro : ov.value_en;
    return String((translations[lang] as Record<string, string>)[key] ?? "");
  };

  const setDraft = (key: string, lang: "ro" | "en", value: string) => {
    setDrafts((d) => ({
      ...d,
      [key]: {
        ro: lang === "ro" ? value : valueFor(key, "ro"),
        en: lang === "en" ? value : valueFor(key, "en"),
      },
    }));
  };

  const save = async (key: string) => {
    setSavingKey(key);
    try {
      const value_ro = valueFor(key, "ro");
      const value_en = valueFor(key, "en");
      await call({ action: "upsert_site_text", key, value_ro, value_en });
      setOverrides((o) => ({ ...o, [key]: { key, value_ro, value_en } }));
      setDrafts(({ [key]: _drop, ...rest }) => rest);
      toast({ title: "Text salvat", description: key });
    } catch (e) {
      toast({ title: "Salvare eșuată", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const reset = async (key: string) => {
    setSavingKey(key);
    try {
      await call({ action: "delete_site_text", key });
      setOverrides(({ [key]: _drop, ...rest }) => rest);
      setDrafts(({ [key]: _d, ...rest }) => rest);
      toast({ title: "Revenit la textul original", description: key });
    } catch (e) {
      toast({ title: "Operațiune eșuată", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10">
        <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă textele…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Aici corectezi orice text din site (română și engleză). Modificările apar imediat pe site.
        „Revino la original” șterge versiunea ta și readuce textul din cod.
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Caută un cuvânt din site (ex: „probă gratuită”)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant={onlyEdited ? "default" : "outline"} onClick={() => setOnlyEdited((v) => !v)}>
          Doar modificate ({Object.keys(overrides).length})
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Niciun text găsit pentru căutarea asta.</p>
      ) : null}

      {Object.entries(grouped).map(([section, keys]) => (
        <section key={section} className="space-y-3">
          <h3 className="font-semibold text-foreground">{section}</h3>
          {keys.map((key) => {
            const edited = Boolean(overrides[key]);
            const dirty = Boolean(drafts[key]);
            return (
              <div
                key={key}
                className={`rounded-lg border p-4 space-y-3 ${edited ? "border-primary/50 bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-muted-foreground">{key}</code>
                  <div className="flex gap-2">
                    {edited ? (
                      <Button size="sm" variant="ghost" onClick={() => reset(key)} disabled={savingKey === key}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Revino la original
                      </Button>
                    ) : null}
                    <Button size="sm" onClick={() => save(key)} disabled={savingKey === key || !dirty}>
                      {savingKey === key ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                      Salvează
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Română</Label>
                    <Textarea rows={2} value={valueFor(key, "ro")} onChange={(e) => setDraft(key, "ro", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Engleză</Label>
                    <Textarea rows={2} value={valueFor(key, "en")} onChange={(e) => setDraft(key, "en", e.target.value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      {rows.length >= 300 ? (
        <p className="text-sm text-muted-foreground">
          Se afișează primele 300 de texte. Folosește căutarea ca să ajungi la ce vrei să corectezi.
        </p>
      ) : null}
    </div>
  );
};

export default SiteTextsAdmin;
