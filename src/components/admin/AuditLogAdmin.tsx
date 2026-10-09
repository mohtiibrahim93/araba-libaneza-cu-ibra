import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ScrollText, ShieldAlert } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Empty, ErrorNote, Loading, ScreenToolbar, Section, TableWrap, Td, Th, Tr } from "./ui";
import { leadStatusLabels } from "./types";

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
  reschedule_booking: "Mutare lecție",
  book_for_student: "Programare manuală",
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

/**
 * Turns the stored `details` object into something readable.
 *
 * The column printed the raw JSON, so a status change showed as
 * {"to":"no_response","from":"new"} -- the database's own words, in a panel
 * that is Romanian everywhere else, and the only row type that carries details
 * at all. A status change is the common case and reads as an arrow; anything
 * else is listed as plain pairs rather than as a serialised object.
 */
function describeDetails(details: unknown): string {
  if (details == null) return "—";
  if (typeof details === "string") return details;
  if (typeof details !== "object") return String(details);

  const d = details as Record<string, unknown>;
  const name = (v: unknown) =>
    typeof v === "string" ? (leadStatusLabels[v as keyof typeof leadStatusLabels] ?? v) : String(v);

  if ("from" in d && "to" in d) return `${name(d["from"])} → ${name(d["to"])}`;

  // A reschedule carries only the new time, and a raw ISO string in a
  // Romanian panel is not a time anyone reads.
  if ("to" in d && typeof d["to"] === "string" && !Number.isNaN(Date.parse(d["to"] as string))) {
    const when = stamp.format(new Date(d["to"] as string));
    return d["forced"] === true ? `mutată la ${when} (forțat)` : `mutată la ${when}`;
  }

  const pairs = Object.entries(d).map(([k, v]) => `${k}: ${name(v)}`);
  return pairs.length > 0 ? pairs.join(" · ") : "—";
}

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
      <ScreenToolbar>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} aria-label="Reîncarcă">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </ScreenToolbar>

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
          <TableWrap stickyHeader maxHeight="max-h-[70vh]" label="Jurnal">
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
                      {describeDetails(r.details)}
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
