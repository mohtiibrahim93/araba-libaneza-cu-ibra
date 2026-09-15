import { useCallback, useEffect, useState } from "react";
import { BellRing, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invokeAdmin } from "@/lib/adminAuth";

interface CourseRequest {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  level: string | null;
  format: string | null;
  preferred_language: string | null;
  lesson_type: string | null;
  status: string;
  notes: string | null;
}

/** "Anunță-mă când pornește grupa" requests (public.course_requests). */
const CourseRequestsAdmin = () => {
  const [rows, setRows] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await invokeAdmin({ action: "list_course_requests" });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRows(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BellRing className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Cereri „anunță-mă” <span className="text-muted-foreground font-normal">({rows.length})</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Persoane care așteaptă să pornească o grupă (grupe tineri, niveluri viitoare).
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : rows.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground py-4">Nicio cerere momentan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 px-3 font-medium">Nume</th>
                <th className="py-2 px-3 font-medium">Contact</th>
                <th className="py-2 px-3 font-medium">Format</th>
                <th className="py-2 pl-3 font-medium">Pentru</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("ro-RO", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 px-3">
                    <a href={`tel:${r.phone}`} className="block text-foreground hover:text-primary">{r.phone}</a>
                    {r.email && <a href={`mailto:${r.email}`} className="block text-xs text-muted-foreground hover:text-primary">{r.email}</a>}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{r.format || "—"}</td>
                  <td className="py-2.5 pl-3 text-muted-foreground max-w-[240px]">
                    {(r.notes || r.lesson_type || "—").replace(/^Cerere „anunță-mă”:\s*/, "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CourseRequestsAdmin;
