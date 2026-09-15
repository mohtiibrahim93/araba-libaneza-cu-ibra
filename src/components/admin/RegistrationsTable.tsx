import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { invokeAdmin } from "@/lib/adminAuth";
import { ExternalLink, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

/** What supabase/functions/_shared/refund.ts works out for one cancellation. */
export interface RefundPreview {
  tier: "full" | "fee-only" | "pro-rata";
  daysBeforeStart: number | null;
  lessonsRemaining: number;
  nonRefundableBani: number;
  remainingValueBani: number;
  feeBani: number;
  refundBani: number;
  refund_label: string;
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
  onRefund: (id: string, reason: string, lessonsTaken: number) => void;
  onPreviewRefund: (id: string, lessonsTaken: number) => Promise<RefundPreview>;
  onPreviewCancel: (id: string) => Promise<CancelPreview>;
  onCancelSubscription: (id: string) => void;
}

const badge = (cls: string, label: string) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
);

const paymentBadge = (r: Registration) => {
  if (r.refunded_at || r.payment_status === "refunded") return badge("bg-gray-200 text-gray-700", "Rambursat");
  switch (r.payment_status) {
    case "paid":
      return badge("bg-green-100 text-green-800", "Plătit");
    case "pending":
      return badge("bg-yellow-100 text-yellow-800", "În așteptare");
    case "past_due":
      return badge("bg-red-100 text-red-800", "Restanță");
    case "failed":
      return badge("bg-red-100 text-red-800", "Plată eșuată");
    case "expired":
      return badge("bg-gray-100 text-gray-600", "Expirat");
    case "card_saved":
      return badge("bg-blue-100 text-blue-800", "Card salvat · trial");
    default:
      return badge("bg-gray-100 text-gray-600", "Neplătit");
  }
};

const RefundControl = ({
  registration,
  refunding,
  onRefund,
  onPreviewRefund,
}: {
  registration: Registration;
  refunding: boolean;
  onRefund: (id: string, reason: string, lessonsTaken: number) => void;
  onPreviewRefund: (id: string, lessonsTaken: number) => Promise<RefundPreview>;
}) => {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  // How many lessons the student actually attended. The policy keeps those and
  // refunds the rest minus 10%, so this is the one number the owner has to
  // supply — nothing in the system knows it.
  const [lessonsTaken, setLessonsTaken] = useState(0);
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Re-price whenever the dialog opens or the lesson count changes, so the
  // number on the button is always the number that will be charged back.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingPreview(true);
    setPreview(null);
    const timer = setTimeout(async () => {
      try {
        const p = await onPreviewRefund(registration.id, lessonsTaken);
        if (active) setPreview(p);
      } catch {
        if (active) setPreview(null);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, lessonsTaken, registration.id, onPreviewRefund]);

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
          <AlertDialogDescription asChild>
            <div className="space-y-1">
              <p>
                Suma se calculează după politica publicată (Termeni, secțiunea 4). Acțiunea nu
                poate fi anulată.
              </p>
              {loadingPreview ? (
                <p className="text-muted-foreground">Se calculează rambursarea…</p>
              ) : preview ? (
                <>
                  <p className="text-foreground font-medium">
                    Se rambursează {preview.refund_label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {REFUND_TIER_LABEL[preview.tier]}
                  </p>
                  {preview.tier === "pro-rata" && (
                    <p className="text-xs text-muted-foreground">
                      Nerambursabil (lecții făcute): {(preview.nonRefundableBani / 100).toLocaleString("ro-RO")} lei ·
                      taxă 10%: {(preview.feeBani / 100).toLocaleString("ro-RO")} lei ·
                      lecții rămase: {preview.lessonsRemaining}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Nu am putut calcula suma.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1">
          <label htmlFor={`lessons-taken-${registration.id}`} className="text-xs font-medium">
            Lecții deja făcute
          </label>
          <Input
            id={`lessons-taken-${registration.id}`}
            type="number"
            min={0}
            value={lessonsTaken}
            onChange={(e) => setLessonsTaken(Math.max(0, Number(e.target.value) || 0))}
            className="h-9"
          />
          <p className="text-[11px] text-muted-foreground">
            Lecțiile făcute nu se rambursează. Lasă 0 dacă nu a început cursul.
          </p>
        </div>
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
              onRefund(registration.id, reason.trim(), lessonsTaken);
              setOpen(false);
            }}
            disabled={loadingPreview || !preview || preview.refundBani <= 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {preview ? `Rambursează ${preview.refund_label}` : "Rambursează definitiv"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


const REFUND_TIER_LABEL: Record<RefundPreview["tier"], string> = {
  full: "Anulare cu 7+ zile înainte de start — rambursare integrală",
  "fee-only": "Anulare sub 7 zile, cursul nu a început — se reține taxa de 10%",
  "pro-rata": "Cursul a început — lecțiile făcute nu se rambursează, din rest se reține 10%",
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
  onPreviewRefund,
  onPreviewCancel,
  onCancelSubscription,
}: Props) => {
  // Registration ids that already have a (non-cancelled) booking, so trial
  // leads who never picked a slot can be flagged for follow-up.
  const [bookedRegIds, setBookedRegIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await invokeAdmin<{ data?: { registration_id: string | null; status: string }[] }>({
          action: "list_bookings",
        });
        const ids = new Set<string>();
        (data?.data || []).forEach((b) => {
          if (b.registration_id && b.status !== "cancelled") ids.add(b.registration_id);
        });
        if (active) setBookedRegIds(ids);
      } catch {
        /* non-blocking: the flag just won't show if bookings can't load */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
  <div className="border border-border rounded-lg overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="w-10">
            <Checkbox
              checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
              onCheckedChange={onToggleAll}
            />
          </TableHead>
          <TableHead className="min-w-[200px]">Înscris</TableHead>
          <TableHead className="min-w-[150px]">Curs</TableHead>
          <TableHead className="w-[170px]">Status lead</TableHead>
          <TableHead className="min-w-[170px]">Plată</TableHead>
          <TableHead className="min-w-[160px]">Note</TableHead>
          <TableHead className="w-[90px]">Detalii</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} data-state={selected.has(r.id) ? "selected" : undefined}>
            <TableCell className="align-top pt-4">
              <Checkbox
                checked={selected.has(r.id)}
                onCheckedChange={() => onToggleSelect(r.id)}
              />
            </TableCell>
            {/* Cine: nume + contact + data, într-o singură celulă scanabilă */}
            <TableCell className="align-top">
              <p className="font-semibold text-foreground leading-tight">
                {r.name}
                {/* Anyone who registered in English needs an English-taught
                    cohort, and there is none yet — so it is flagged rather than
                    left to be discovered on the first day of class. */}
                {r.language === "en" && (
                  <span
                    title="S-a înscris în engleză — are nevoie de o grupă predată în engleză"
                    className="ml-1.5 inline-flex shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 align-middle"
                  >
                    EN
                  </span>
                )}
              </p>
              {r.email && (
                <span className="flex items-center gap-1.5 max-w-[220px]">
                  <a href={`mailto:${r.email}`} className="block text-xs text-muted-foreground hover:text-primary truncate min-w-0">
                    {r.email}
                  </a>
                  {(r.email_dup_count ?? 1) > 1 && (
                    <span
                      title={`Acest email apare în ${r.email_dup_count} înscrieri`}
                      className="inline-flex shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800"
                    >
                      ×{r.email_dup_count}
                    </span>
                  )}
                </span>
              )}
              {r.anonymized_at && (
                <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                  Anonimizat
                </span>
              )}
              {r.phone && (
                <a href={`tel:${r.phone}`} className="block text-xs text-muted-foreground hover:text-primary">
                  {r.phone}
                </a>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">
                {new Date(r.created_at).toLocaleDateString("ro-RO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </TableCell>
            {/* Ce: tip curs + format/centru/vârstă */}
            <TableCell className="align-top">
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {formTypeLabels[r.form_type] || r.form_type}
              </span>
              {r.form_type === "trial" && !bookedRegIds.has(r.id) && (
                <span className="ml-1 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title="Probă rezervată, dar fără interval orar ales — necesită contactare">
                  Fără interval
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 space-x-1">
                {[
                  r.format,
                  r.center,
                  r.child_age ? `copil ${r.child_age} ani` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
            </TableCell>
            <TableCell className="align-top">
              <Select
                value={r.lead_status || "new"}
                onValueChange={(value) => onStatusChange(r.id, value as LeadStatus)}
                disabled={updatingStatus?.id === r.id}
              >
                <SelectTrigger
                  className="h-8 w-[150px]"
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
            <TableCell className="align-top space-y-1">
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
                <RefundControl
                  registration={r}
                  refunding={refundingId === r.id}
                  onRefund={onRefund}
                  onPreviewRefund={onPreviewRefund}
                />
              )}
            </TableCell>
            <TableCell className="align-top">
              {(r.source || r.track_preference) && (
                <p className="text-[11px] text-muted-foreground">
                  {[
                    r.source ? leadSourceLabels[r.source] : null,
                    r.track_preference ? trackPreferenceLabels[r.track_preference] : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground max-w-[220px] line-clamp-3" title={r.notes || undefined}>
                {r.notes || "—"}
              </p>
            </TableCell>
            <TableCell className="align-top">
              {r.form_type === "private" ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/private-leads/${r.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Detalii
                  </Link>
                </Button>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
  );
};

export default RegistrationsTable;
