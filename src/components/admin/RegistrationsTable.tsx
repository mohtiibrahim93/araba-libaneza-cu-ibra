import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  formTypeLabels,
  leadStatusLabels,
  leadSourceLabels,
  trackPreferenceLabels,
  LEAD_STATUSES,
} from "./types";
import type { LeadStatus, Registration } from "./types";

interface Props {
  rows: Registration[];
  selected: Set<string>;
  updatingStatus: { id: string; status: LeadStatus } | null;
  refundingId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onRefund: (id: string, reason: string) => void;
}

const paymentBadge = (r: Registration) => {
  if (r.refunded_at) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">Rambursat</span>;
  }
  if (r.payment_status === "paid") {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Plătit</span>;
  }
  if (r.payment_status === "pending") {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">În așteptare</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Neplătit</span>;
};

const RefundControl = ({
  registration,
  refunding,
  onRefund,
}: {
  registration: Registration;
  refunding: boolean;
  onRefund: (id: string, reason: string) => void;
}) => {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  if (registration.refunded_at) {
    return (
      <p className="text-xs text-muted-foreground" title={registration.refund_reason || undefined}>
        {new Date(registration.refunded_at).toLocaleDateString("ro-RO")}
      </p>
    );
  }
  if (registration.payment_status !== "paid") return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={refunding} className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
          {refunding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
          Rambursează
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rambursezi plata pentru {registration.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se procesează o rambursare completă în Stripe. Acțiunea nu poate fi anulată.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motiv (opțional)"
          maxLength={500}
          className="min-h-20"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Anulează</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onRefund(registration.id, reason.trim());
              setOpen(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Rambursează definitiv
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const RegistrationsTable = ({
  rows,
  selected,
  updatingStatus,
  refundingId,
  onToggleSelect,
  onToggleAll,
  onStatusChange,
  onRefund,
}: Props) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
              onCheckedChange={onToggleAll}
            />
          </TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Nume</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Centru</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Sursă</TableHead>
          <TableHead>Track</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plată</TableHead>
          <TableHead>Vârstă copil</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Detalii</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} data-state={selected.has(r.id) ? "selected" : undefined}>
            <TableCell>
              <Checkbox
                checked={selected.has(r.id)}
                onCheckedChange={() => onToggleSelect(r.id)}
              />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
              {new Date(r.created_at).toLocaleDateString("ro-RO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {formTypeLabels[r.form_type] || r.form_type}
              </span>
            </TableCell>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{r.phone}</TableCell>
            <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
            <TableCell>{r.center || "—"}</TableCell>
            <TableCell>{r.format || "—"}</TableCell>
            <TableCell className="text-xs">
              {r.source ? leadSourceLabels[r.source] : "—"}
            </TableCell>
            <TableCell className="text-xs">
              {r.track_preference ? trackPreferenceLabels[r.track_preference] : "—"}
            </TableCell>
            <TableCell>
              <Select
                value={r.lead_status || "new"}
                onValueChange={(value) => onStatusChange(r.id, value as LeadStatus)}
                disabled={updatingStatus?.id === r.id}
              >
                <SelectTrigger
                  className="h-8 w-[160px]"
                  aria-busy={updatingStatus?.id === r.id}
                >
                  {updatingStatus?.id === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {leadStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="space-y-1">
              {paymentBadge(r)}
              <RefundControl registration={r} refunding={refundingId === r.id} onRefund={onRefund} />
            </TableCell>
            <TableCell>{r.child_age || "—"}</TableCell>
            <TableCell className="max-w-[200px] truncate">{r.notes || "—"}</TableCell>
            <TableCell>
              {r.form_type === "private" ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/private-leads/${r.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Detalii
                  </Link>
                </Button>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default RegistrationsTable;
