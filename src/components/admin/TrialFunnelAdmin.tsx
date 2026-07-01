import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { useI18n } from "@/lib/i18n";
import { Loader2, GraduationCap, CalendarCheck, CheckCircle2, Trophy } from "lucide-react";

interface TrialRow {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string;
  booked: boolean;
  booking_start_at: string | null;
  attended: boolean;
  converted: boolean;
  converted_to: string | null;
  converted_at: string | null;
}

interface Counts {
  registered: number;
  booked: number;
  attended: number;
  converted: number;
}

const fmt = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("ro-RO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

const TrialFunnelAdmin = () => {
  const { t } = useI18n();
  const [rows, setRows] = useState<TrialRow[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_trial_funnel" });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data?.data ?? []);
      setCounts(data?.counts ?? null);
    } catch (e) {
      console.error("[trial funnel] load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pct = (n: number) =>
    counts && counts.registered > 0 ? Math.round((n / counts.registered) * 100) : 0;

  const steps = counts
    ? [
        { label: t.trialFunnelStepRegistered, value: counts.registered, icon: GraduationCap, percent: 100 },
        { label: t.trialFunnelStepBooked, value: counts.booked, icon: CalendarCheck, percent: pct(counts.booked) },
        { label: t.trialFunnelStepAttended, value: counts.attended, icon: CheckCircle2, percent: pct(counts.attended) },
        { label: t.trialFunnelStepConverted, value: counts.converted, icon: Trophy, percent: pct(counts.converted) },
      ]
    : [];

  return (
    <section className="mb-10 rounded-2xl border border-border bg-background p-6">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{t.trialFunnelTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.trialFunnelSubtitle}</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {steps.map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <s.icon className="w-4 h-4 text-primary" />
                  {s.label}
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.percent}%</div>
              </div>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 pr-3">Lead</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">{t.trialFunnelStepBooked}</th>
                    <th className="py-2 pr-3">{t.trialFunnelStepAttended}</th>
                    <th className="py-2 pr-3">{t.trialFunnelStepConverted}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="py-2 pr-3 font-medium text-foreground">{r.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{r.email || "—"}</td>
                      <td className="py-2 pr-3">{r.booked ? fmt(r.booking_start_at) : "—"}</td>
                      <td className="py-2 pr-3">
                        {r.attended ? <span className="text-primary">✓</span> : "—"}
                      </td>
                      <td className="py-2 pr-3">
                        {r.converted ? (
                          <span className="inline-flex items-center gap-1 text-primary font-medium">
                            ✓ {r.converted_to}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default TrialFunnelAdmin;