import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, X, ExternalLink, CalendarX2 } from "lucide-react";

interface Booking {
  id: string;
  event_type_slug: string;
  start_at: string;
  end_at: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  format: string;
  notes: string | null;
  status: string;
  meet_link: string | null;
  manage_token: string;
  created_at: string;
  google_event_id: string | null;
  google_sync_error: string | null;
}

const STATUSES = ["all", "confirmed", "cancelled", "rescheduled", "completed"];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    dateStyle: "medium",
    timeStyle: "short",
  });

const BookingsAdmin = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("confirmed");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeAdmin({ action: "list_bookings", status_filter: filter });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRows(data.data);
    } catch {
      toast({ title: "Nu am putut încărca programările", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (b: Booking) => {
    if (!confirm(`Anulezi programarea cu ${b.student_name} (${fmt(b.start_at)})?`)) return;
    setCancellingId(b.id);
    try {
      const { data, error } = await invokeAdmin({ action: "cancel_booking", id: b.id });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Programare anulată" });
      load();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Anulare eșuată",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">Programări</h2>
          <p className="text-sm text-muted-foreground">
            Lecții rezervate prin sistemul nativ. Anularea șterge și evenimentul din Google Calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Nicio programare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-2">Când</th>
                <th className="py-2 pr-2">Tip</th>
                <th className="py-2 pr-2">Student</th>
                <th className="py-2 pr-2">Format</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="py-2 pr-2 whitespace-nowrap">{fmt(b.start_at)}</td>
                  <td className="py-2 pr-2">{b.event_type_slug}</td>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{b.student_name}</div>
                    <div className="text-xs text-muted-foreground">{b.student_email}</div>
                  </td>
                  <td className="py-2 pr-2">
                    {b.format}
                    {b.meet_link && (
                      <a
                        href={b.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 inline-flex items-center text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {b.status}
                    {b.status === "confirmed" && !b.google_event_id && (
                      <span
                        className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                        title={
                          b.google_sync_error
                            ? `Google Calendar: ${b.google_sync_error}`
                            : "Rezervarea nu are un eveniment în Google Calendar."
                        }
                      >
                        <CalendarX2 className="h-3 w-3 shrink-0" aria-hidden />
                        fără Calendar
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel(b)}
                        disabled={cancellingId === b.id}
                      >
                        {cancellingId === b.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
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

export default BookingsAdmin;