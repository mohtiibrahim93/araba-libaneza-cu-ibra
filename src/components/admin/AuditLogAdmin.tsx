import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ScrollText, ShieldAlert } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Empty, ErrorNote, Loading, ScreenHeader, Section, TableWrap, Td, Th, Tr } from "./ui";

/**
 * Who did what, and when.
 *
 * Every destructive admin action already writes a row here — deleting
 * registrations, anonymising them under GDPR, issuing refunds, cancelling
 * subscriptions, changing a lead's status — and `list_audit_logs` has been
 * deployed the whole time with nothing in the panel calling it. The record was
 * being kept where nobody could read it, which is most of the way to not
 * keeping one.
 *
 * Read-only on purpose. An audit trail that the audited party can edit is not
 * a trail, and there is no server action to change or delete a row even if
 * this screen wanted to.
 */

interface Entry {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  registration_id: string | null;
  details: unknown;
}

/** The actions that actually reach this table, in the words the panel uses. */
const ACTION_LABELS: Record<string, string> = {
  delete: "Ștergere",
  force_delete: "Ștergere forțată",
  anonymize: "Anonimizare (GDPR)",
  refund: "Rambursare",
  cancel_subscription: "Anulare abonament",
  update_status: "Schimbare status",
};

/** The ones that destroy data rather than change it. */
const DESTRUCTIVE = new Set(["delete", "force_delete", "anonymize"]);

const stamp = new Intl.DateTimeFormat("ro-RO", {
  timeZone: "Europe/Bucharest",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const AuditLogAdmin = () => {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await invokeAdmin({ action: "list_audit_logs" });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setRows(data?.data ?? []);
    } catch (e) {
      console.error("[audit log] load failed", e);
      setError("Jurnalul nu a putut fi încărcat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <ScreenHeader
        title="Jurnal"
        description="Acțiunile care șterg sau schimbă date, cu cine le-a făcut. Doar de citit."
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} aria-label="Reîncarcă">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && rows.length === 0 && <Loading label="Se încarcă…" />}

      {!loading && rows.length === 0 && !error && (
        <Empty
          icon={ScrollText}
          title="Jurnalul este gol."
          description="Nimeni nu a șters, anonimizat sau rambursat nimic de când se ține evidența."
        />
      )}

      {rows.length > 0 && (
        <Section
          title="Ultimele 100 de acțiuni"
          icon={ScrollText}
          description="Cele mai recente primele. Jurnalul nu poate fi editat din panou."
        >
          <TableWrap stickyHeader maxHeight="max-h-[70vh]">
            <thead>
              <tr>
                <Th>Când</Th>
                <Th>Cine</Th>
                <Th>Ce</Th>
                <Th>Înscriere</Th>
                <Th>Detalii</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const destructive = DESTRUCTIVE.has(r.action);
                return (
                  <Tr key={r.id}>
                    <Td className="whitespace-nowrap tabular-nums text-muted-foreground">
                      {stamp.format(new Date(r.created_at))}
                    </Td>
                    <Td className="max-w-[14rem] truncate text-foreground">{r.actor}</Td>
                    <Td>
                      <span
                        className={
                          destructive
                            ? "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        }
                      >
                        {destructive && <ShieldAlert className="h-3 w-3" />}
                        {ACTION_LABELS[r.action] ?? r.action}
                      </span>
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {/* The row it refers to may itself have been deleted, so
                          this is an identifier rather than a link. */}
                      {r.registration_id ? r.registration_id.slice(0, 8) : "—"}
                    </Td>
                    <Td className="max-w-[20rem] truncate text-xs text-muted-foreground">
                      {r.details ? JSON.stringify(r.details) : "—"}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableWrap>
        </Section>
      )}
    </div>
  );
};

export default AuditLogAdmin;
