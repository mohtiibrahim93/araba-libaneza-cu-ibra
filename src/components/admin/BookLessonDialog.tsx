import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeField } from "@/components/admin/TimeField";
import { bucharestCivilToUtc } from "@/lib/timezone";
import { bucharestFields, CLASH_LABEL } from "./LessonEditDialog";

/**
 * Booking a private lesson by hand, for a new or an existing student. Moved
 * out of Toate lecțiile (14 October 2026) so Săptămâna can open it too, with
 * the date and time of the empty slot the owner clicked already filled in.
 */
export interface PrivateStudent {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  quantity: number;
  lessons_used: number;
  payment_status: string | null;
  source: string | null;
}

/** "Name — email · 2/5 lecții · plătit" — enough to tell two students apart. */
export function studentOptionLabel(s: PrivateStudent): string {
  const paid =
    s.payment_status === "paid"
      ? "plătit"
      : s.payment_status === "free"
        ? "gratuit"
        : "neplătit";
  return `${s.name || "Fără nume"} — ${s.email || "fără email"} · ${s.lessons_used}/${s.quantity} lecții · ${paid}`;
}

export default function BookLessonDialog({
  open,
  initial,
  onClose,
  onBooked,
}: {
  open: boolean;
  /**
   * Date (YYYY-MM-DD) and time (HH:MM, Romania) to start from; with
   * studentId, that private student is already chosen ("Programează
   * următoarea" in their package card).
   */
  initial?: {
    date: string;
    time: string;
    studentId?: string;
    format?: "online" | "physical";
  } | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  /**
   * Booking a private lesson for someone by hand.
   *
   * A group signup could be added from the panel; a private lesson has a time,
   * so it could not be added at all. The owner agrees an hour on WhatsApp and
   * had nowhere to record it, which is how a lesson ends up in Google Calendar
   * and nowhere else.
   */
  const [bkName, setBkName] = useState("");
  const [bkEmail, setBkEmail] = useState("");
  const [bkPhone, setBkPhone] = useState("");
  const [bkDate, setBkDate] = useState("");
  const [bkTime, setBkTime] = useState("18:00");
  const [bkFormat, setBkFormat] = useState<"online" | "physical">("online");
  const [bkQuantity, setBkQuantity] = useState(1);
  const [bkPaid, setBkPaid] = useState(false);
  // "Gratuită (recuperare)": a lesson given for free. Excludes "A plătit deja".
  const [bkFree, setBkFree] = useState(false);
  const [bkNotes, setBkNotes] = useState("");
  const [bkBusy, setBkBusy] = useState(false);
  const [bkWarn, setBkWarn] = useState<string[] | null>(null);
  // An existing private student (website purchase or an earlier hand booking).
  // When one is chosen the lesson goes on their registration and their stored
  // details are used; empty means a new student, as before.
  const [bkStudentId, setBkStudentId] = useState("");
  // "Lecție în plus": same student, but a registration of its own (package used up).
  const [bkExtra, setBkExtra] = useState(false);
  const [bkStudents, setBkStudents] = useState<PrivateStudent[] | null>(null);

  const reset = (initial?: {
    date: string;
    time: string;
    studentId?: string;
    format?: "online" | "physical";
  }) => {
    const now = new Date();
    const f = bucharestFields(
      new Date(now.getTime() + 24 * 3600_000).toISOString(),
    );
    setBkName("");
    setBkEmail("");
    setBkPhone("");
    setBkDate(initial?.date ?? f.date);
    setBkTime(initial?.time ?? "18:00");
    setBkFormat(initial?.format ?? "online");
    setBkQuantity(1);
    setBkPaid(false);
    setBkFree(false);
    setBkNotes("");
    setBkWarn(null);
    setBkStudentId("");
    setBkExtra(false);
    setBkStudents(null);
    void invokeAdmin<{ data?: PrivateStudent[]; error?: string }>({
      action: "private_students",
    })
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : [];
        setBkStudents(list);
        const s = initial?.studentId
          ? list.find((x) => x.id === initial.studentId)
          : undefined;
        if (s) {
          setBkStudentId(s.id);
          setBkName(s.name ?? "");
          setBkEmail(s.email ?? "");
          setBkPhone(s.phone ?? "");
        }
      })
      .catch(() => setBkStudents([]));
  };

  useEffect(() => {
    if (open) reset(initial ?? undefined);
  }, [open, initial]);

  const chooseStudent = (id: string) => {
    setBkStudentId(id);
    setBkWarn(null);
    const s = bkStudents?.find((x) => x.id === id);
    if (!s) return;
    setBkName(s.name ?? "");
    setBkEmail(s.email ?? "");
    setBkPhone(s.phone ?? "");
  };

  const submitBooking = async (force: boolean) => {
    const [y, m, d] = bkDate.split("-").map(Number) as (number | undefined)[];
    const [hh, mm] = bkTime.split(":").map(Number) as (number | undefined)[];
    if (
      y === undefined ||
      m === undefined ||
      d === undefined ||
      hh === undefined ||
      mm === undefined ||
      ![y, m, d, hh, mm].every((n) => Number.isFinite(n))
    ) {
      toast({ title: "Data sau ora nu sunt valide", variant: "destructive" });
      return;
    }
    setBkBusy(true);
    try {
      const startAt = bucharestCivilToUtc(y, m, d, hh, mm).toISOString();
      const { data, error } = await invokeAdmin<{
        success?: boolean;
        sync_pending?: boolean;
        error?: string;
        code?: string;
        clashes?: string[];
      }>({
        action: "book_for_student",
        ...(bkStudentId
          ? {
              registration_id: bkStudentId,
              ...(bkExtra ? { extra: true } : {}),
            }
          : {}),
        student_name: bkName.trim(),
        student_email: bkEmail.trim(),
        student_phone: bkPhone.trim(),
        start_at: startAt,
        format: bkFormat,
        quantity: bkQuantity,
        paid: bkPaid && !bkFree,
        ...(bkFree ? { free: true } : {}),
        notes: bkNotes.trim() || undefined,
        force,
      });
      if (error) throw error;
      if (data?.code === "conflict") {
        setBkWarn(data.clashes ?? []);
        return;
      }
      if (data?.error) throw new Error(data.error);
      if (data?.success !== true)
        throw new Error(
          "Programarea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
        );
      toast({
        title: data.sync_pending
          ? "Lecție salvată; Google Calendar este în așteptare"
          : "Lecție programată",
        description:
          "Confirmarea prin email a fost solicitată, cu linkul lecției.",
      });
      setBkWarn(null);
      onBooked();
      onClose();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Programarea a eșuat",
        variant: "destructive",
      });
    } finally {
      setBkBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setBkWarn(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Programează o lecție privată</DialogTitle>
          <DialogDescription>
            Pentru cineva cu care ai stabilit deja ora. Primește confirmarea pe
            email, cu linkul lecției și cu linkul de reprogramare, iar
            evenimentul intră în Google Calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs" htmlFor="bk-existing-student">
              Cursant existent (opțional)
            </Label>
            <select
              id="bk-existing-student"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={bkStudentId}
              disabled={bkStudents === null}
              onChange={(e) => {
                if (e.target.value) chooseStudent(e.target.value);
                else {
                  setBkStudentId("");
                  setBkExtra(false);
                  setBkName("");
                  setBkEmail("");
                  setBkPhone("");
                }
              }}
            >
              <option value="">
                {bkStudents === null ? "Se încarcă cursanții…" : "Cursant nou"}
              </option>
              {(bkStudents ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {studentOptionLabel(s)}
                </option>
              ))}
            </select>
            {bkStudentId && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bkExtra}
                  onChange={(e) => {
                    setBkExtra(e.target.checked);
                    setBkWarn(null);
                  }}
                />
                Lecție în plus (separat de pachetul lui, cu aceleași date)
              </label>
            )}
            <p className="text-[11px] text-muted-foreground">
              {bkStudentId && bkExtra
                ? "Se creează o înscriere nouă pentru această lecție, cu datele lui salvate. Pachetul lui rămâne neatins."
                : bkStudentId
                  ? "Lecția se adaugă la înscrierea lui. Datele de mai jos sunt cele salvate; emailul contului și al plății nu se schimbă."
                  : "Alege un cursant înscris pe site sau programat deja de tine, ca lecția să intre la el, nu ca înscriere nouă."}
            </p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Nume</Label>
            <Input
              className="h-9"
              value={bkName}
              disabled={!!bkStudentId}
              onChange={(e) => setBkName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              className="h-9"
              type="email"
              value={bkEmail}
              disabled={!!bkStudentId}
              onChange={(e) => setBkEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefon (opțional)</Label>
            <Input
              className="h-9"
              value={bkPhone}
              disabled={!!bkStudentId}
              onChange={(e) => setBkPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Input
              className="h-9"
              type="date"
              value={bkDate}
              onChange={(e) => {
                setBkDate(e.target.value);
                setBkWarn(null);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ora (ora României)</Label>
            <TimeField
              label="Ora lecției"
              value={bkTime}
              onChange={(hhmm) => {
                setBkTime(hhmm);
                setBkWarn(null);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Format</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={bkFormat}
              onChange={(e) =>
                setBkFormat(
                  e.target.value === "physical" ? "physical" : "online",
                )
              }
            >
              <option value="online">Online</option>
              <option value="physical">La centru</option>
            </select>
          </div>
          {(!bkStudentId || bkExtra) && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Câte lecții a luat</Label>
                <Input
                  className="h-9"
                  type="number"
                  min={1}
                  max={60}
                  value={bkQuantity}
                  onChange={(e) =>
                    setBkQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                />
                {/* Only the first lesson is booked now. The number is what the
                  package allows, so the rest can be booked later without the
                  quota refusing them. */}
                <p className="text-[11px] text-muted-foreground">
                  Se programează doar prima. Restul le poți programa mai târziu.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={bkPaid}
                  onChange={(e) => {
                    setBkPaid(e.target.checked);
                    if (e.target.checked) setBkFree(false);
                  }}
                />
                A plătit deja
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={bkFree}
                  onChange={(e) => {
                    setBkFree(e.target.checked);
                    if (e.target.checked) setBkPaid(false);
                  }}
                />
                Gratuită (recuperare) — nu datorează nimic
              </label>
            </>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Notițe (opțional)</Label>
            <Input
              className="h-9"
              value={bkNotes}
              onChange={(e) => setBkNotes(e.target.value)}
            />
          </div>
        </div>

        {bkWarn && (
          <div
            role="alert"
            className="flex gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="space-y-1">
              <p>
                Ora asta se suprapune cu{" "}
                {bkWarn.map((c) => CLASH_LABEL[c] ?? c).join(" și ")}.
              </p>
              <p className="font-medium">
                Poți programa oricum, dacă așa ai stabilit.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              setBkWarn(null);
            }}
            disabled={bkBusy}
          >
            Renunță
          </Button>
          <Button
            onClick={() => void submitBooking(bkWarn !== null)}
            disabled={
              bkBusy || bkName.trim().length < 2 || !bkEmail.includes("@")
            }
          >
            {bkBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {bkWarn ? "Programează oricum" : "Programează lecția"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
