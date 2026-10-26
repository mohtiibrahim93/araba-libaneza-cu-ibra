import { useEffect, useState } from "react";
import { Loader2, TriangleAlert, Video } from "lucide-react";
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
import { BUCHAREST_TZ, bucharestCivilToUtc } from "@/lib/timezone";
import { meetingLabel } from "./types";
import { askCancelLesson } from "./LessonOutcome";

/**
 * "Modifică lecția" (owner's request, 14 October 2026): one window for a
 * lesson, opened from Acasă, Săptămâna and Toate lecțiile. Date and time,
 * length, online or at the centre, notes; cancel; join the video.
 *
 * Length, format and notes are saved first (update_booking_details); a new
 * time then goes through reschedule_booking, which patches Google Calendar,
 * emails the student and keeps the lesson's length. The first move attempt
 * reports a clash or hours outside Disponibilitate instead of refusing, and
 * only a second click ("Mută oricum") overrides it.
 */
export interface EditableLesson {
  id: string;
  student_name: string;
  start_at: string;
  end_at: string;
  format: string;
  notes?: string | null;
  status: string;
  meet_link?: string | null;
  event_type_slug?: string;
}

export const CLASH_LABEL: Record<string, string> = {
  another_booking: "altă programare",
  calendar: "ceva din Google Calendar",
  group_lesson: "o lecție de grup",
};

export function bucharestFields(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUCHAREST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return {
    date: `${g("year")}-${g("month")}-${g("day")}`,
    time: `${hh}:${g("minute")}`,
  };
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", {
    timeZone: BUCHAREST_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default function LessonEditDialog({
  lesson,
  moveTo,
  onClose,
  onChanged,
}: {
  lesson: EditableLesson | null;
  /** A new date and time to start from (a lesson dropped on the week grid). */
  moveTo?: { date: string; time: string } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [format, setFormat] = useState<"online" | "physical">("online");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [moveWarn, setMoveWarn] = useState<{
    clashes: string[];
    outside: boolean;
  } | null>(null);

  useEffect(() => {
    if (!lesson) return;
    const f = moveTo ?? bucharestFields(lesson.start_at);
    setDate(f.date);
    setTime(f.time);
    setDuration(
      Math.max(
        15,
        Math.round(
          (Date.parse(lesson.end_at) - Date.parse(lesson.start_at)) / 60_000,
        ),
      ),
    );
    setFormat(lesson.format === "physical" ? "physical" : "online");
    setNotes(lesson.notes ?? "");
    setMoveWarn(null);
  }, [lesson, moveTo]);

  if (!lesson) return null;
  const active = lesson.status === "confirmed";
  const original = bucharestFields(lesson.start_at);
  const origDuration = Math.round(
    (Date.parse(lesson.end_at) - Date.parse(lesson.start_at)) / 60_000,
  );
  const timeChanged = date !== original.date || time !== original.time;
  const detailsChanged =
    duration !== origDuration ||
    format !== (lesson.format === "physical" ? "physical" : "online") ||
    notes.trim() !== (lesson.notes ?? "").trim();

  const saveDetails = async () => {
    const { data, error } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({
      action: "update_booking_details",
      id: lesson.id,
      duration_min: duration,
      format,
      notes,
    });
    if (error || data?.error || data?.success !== true)
      throw new Error(
        data?.error || error?.message || "Modificarea nu a fost salvată.",
      );
  };

  const move = async (force: boolean): Promise<boolean> => {
    const [y, m, d] = date.split("-").map(Number) as (number | undefined)[];
    const [hh, mm] = time.split(":").map(Number) as (number | undefined)[];
    if (
      y === undefined ||
      m === undefined ||
      d === undefined ||
      hh === undefined ||
      mm === undefined ||
      ![y, m, d, hh, mm].every(Number.isFinite)
    ) {
      throw new Error("Data sau ora nu sunt valide");
    }
    // Bucharest civil time to the instant, DST included.
    const startAt = bucharestCivilToUtc(y, m, d, hh, mm).toISOString();
    const { data, error } = await invokeAdmin<{
      success?: boolean;
      sync_pending?: boolean;
      error?: string;
      code?: string;
      clashes?: string[];
      outside_availability?: boolean;
    }>({
      action: "reschedule_booking",
      id: lesson.id,
      start_at: startAt,
      force,
    });
    if (error) throw error;
    if (data?.code === "conflict" || data?.code === "outside_availability") {
      setMoveWarn({
        clashes: data.clashes ?? [],
        outside: data.outside_availability === true,
      });
      return false;
    }
    if (data?.error) throw new Error(data.error);
    if (data?.success !== true)
      throw new Error(
        "Mutarea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
      );
    toast({
      title: data.sync_pending
        ? "Lecție mutată în admin; sincronizarea Google este în așteptare"
        : "Lecție mutată",
      description: data.sync_pending
        ? "Reîncearcă sincronizarea din Program."
        : "Cursantul primește un email cu ora nouă.",
      ...(data.sync_pending ? { variant: "destructive" as const } : {}),
    });
    return true;
  };

  const save = async () => {
    setBusy(true);
    try {
      if (detailsChanged && !moveWarn) await saveDetails();
      if (timeChanged) {
        const moved = await move(moveWarn !== null);
        if (!moved) {
          onChanged();
          return;
        }
      } else if (detailsChanged) {
        toast({ title: "Lecție modificată" });
      }
      setMoveWarn(null);
      onChanged();
      onClose();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Modificare eșuată",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const cancelLesson = async () => {
    const choice = askCancelLesson(
      { ...lesson, event_type_slug: lesson.event_type_slug ?? "" },
      fmt(lesson.start_at),
    );
    if (!choice) return;
    setBusy(true);
    try {
      const { data, error } = await invokeAdmin<{
        success?: boolean;
        sync_pending?: boolean;
        error?: string;
      }>({ action: "cancel_booking", id: lesson.id, ...choice });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.success !== true)
        throw new Error(
          "Anularea nu a fost confirmată. Reîncarcă programările înainte de a încerca din nou.",
        );
      toast({
        title: data.sync_pending
          ? "Anulată în admin; anularea Google este în așteptare"
          : "Programare anulată",
        ...(data.sync_pending ? { variant: "destructive" as const } : {}),
      });
      onChanged();
      onClose();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Anulare eșuată",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifică lecția</DialogTitle>
          <DialogDescription>
            {lesson.student_name} — {fmt(lesson.start_at)}.{" "}
            {active
              ? "Dacă schimbi ora, durata sau locul, se actualizează și Google Calendar, iar cursantul este anunțat."
              : "Lecția nu mai este programată; poți schimba doar notițele."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Input
              type="date"
              className="h-9"
              value={date}
              disabled={!active}
              onChange={(e) => {
                setDate(e.target.value);
                setMoveWarn(null);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ora (ora României)</Label>
            <TimeField
              label="Ora"
              value={time}
              onChange={(hhmm) => {
                if (active) {
                  setTime(hhmm);
                  setMoveWarn(null);
                }
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Durata</Label>
            <select
              aria-label="Durata"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={duration}
              disabled={!active}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {Array.from(new Set([30, 45, 60, 75, 90, 120, duration]))
                .sort((a, b) => a - b)
                .map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Unde</Label>
            <select
              aria-label="Unde"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={format}
              disabled={!active}
              onChange={(e) =>
                setFormat(e.target.value === "physical" ? "physical" : "online")
              }
            >
              <option value="online">Online (Zoom)</option>
              <option value="physical">La centru</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Notițe (doar pentru tine)</Label>
            <textarea
              aria-label="Notițe"
              className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {moveWarn && (
          <div
            role="alert"
            className="flex gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="space-y-1">
              {moveWarn.clashes.length > 0 && (
                <p>
                  Ora asta se suprapune cu{" "}
                  {moveWarn.clashes
                    .map((c) => CLASH_LABEL[c] ?? c)
                    .join(" și ")}
                  .
                </p>
              )}
              {moveWarn.outside && (
                <p>E în afara orelor tale din Disponibilitate.</p>
              )}
              <p className="font-medium">
                Poți muta oricum, dacă așa ai stabilit cu cursantul.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {lesson.meet_link && (
              <a
                href={lesson.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1 rounded-md bg-brand-green px-3 text-sm font-semibold text-white hover:opacity-90"
              >
                <Video className="h-4 w-4" aria-hidden />{" "}
                {meetingLabel(lesson.meet_link)}
              </a>
            )}
            {active && (
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => void cancelLesson()}
                disabled={busy}
              >
                Anulează lecția
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Închide
            </Button>
            <Button
              onClick={() => void save()}
              disabled={busy || (!timeChanged && !detailsChanged)}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {moveWarn
                ? "Mută oricum"
                : timeChanged
                  ? "Mută lecția"
                  : "Salvează"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
