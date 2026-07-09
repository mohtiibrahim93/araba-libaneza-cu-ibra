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

interface CancelPreview {
  within_grace: boolean;
  grace_days: number;
  refund_amount: number;
  currency: string;
}

interface Props {
  rows: Registration[];
  selected: Set<string>;
  updatingStatus: { id: string; status: LeadStatus } | null;
  refundingId: string | null;
  cancelingId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onRefund: (id: string, reason: string) => void;
  onPreviewCancel: (id: string) => Promise<CancelPreview>;
  onCancelSubscription: (id: string) => void;
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

const CancelSubscriptionControl = ({
  registration,
  canceling,
  onPreviewCancel,
  onCancelSubscription,
}: {
  registration: Registration;
  canceling: boolean;
  onPreviewCancel: (id: string) => Promise<CancelPreview>;
  onCancelSubscription: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<CancelPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Only group registrations with a live subscription can be cancelled.
  if (!registration.stripe_subscription_id) return null;
  if (registration.subscription_status === "canceled" || registration.canceled_at) {
    return (
      <p className="text-xs text-muted-foreground">
        Abonament anulat
        {typeof registration.refunded_amount === "number" && registration.refunded_amount > 0
          ? ` · rambursat ${(registration.refunded_amount / 100).toLocaleString("ro-RO")}`
          : ""}
      </p>
    );
  }

  const onOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next) {
      setLoadingPreview(true);
      setPreview(null);
      try {
        setPreview(await onPreviewCancel(registration.id));
      } catch {
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const refundLabel =
    preview && preview.refund_amount > 0
      ? `${(preview.refund_amount / 100).toLocaleString("ro-RO")} ${preview.currency}`
      : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={canceling}
          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
          Anulează abonament
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulezi abonamentul pentru {registration.name}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-1">
              <p>Se opresc toate lunile viitoare. Acțiunea nu poate fi anulată.</p>
              {loadingPreview ? (
                <p className="text-muted-foreground">Se calculează rambursarea…</p>
              ) : refundLabel ? (
                <p className="text-foreground font-medium">
                  Se rambursează {refundLabel} din luna curentă (în fereastra de{" "}
                  {preview?.grace_days} zile).
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Fără rambursare pentru luna curentă (în afara ferestrei de 5 zile).
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Înapoi</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onCancelSubscription(registration.id);
              setOpen(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Anulează abonamentul
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
  cancelingId,
  onToggleSelect,
  onToggleAll,
  onStatusChange,
  onRefund,
  onPreviewCancel,
  onCancelSubscription,
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
              {r.stripe_subscription_id && typeof r.months_total === "number" && (
                <p className="text-xs text-muted-foreground">
                  Abonament: {r.months_paid ?? 0}/{r.months_total} luni
                </p>
              )}
              {r.stripe_subscription_id ? (
                <CancelSubscriptionControl
                  registration={r}
                  canceling={cancelingId === r.id}
                  onPreviewCancel={onPreviewCancel}
                  onCancelSubscription={onCancelSubscription}
                />
              ) : (
                <RefundControl registration={r} refunding={refundingId === r.id} onRefund={onRefund} />
              )}
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
