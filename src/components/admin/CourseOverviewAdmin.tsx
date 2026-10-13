import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { minGroupSize } from "@/lib/groupSize";
import {
  describeRegistrationCourse,
  emptyCourseFilters,
  matchesCourseFilters,
} from "@/lib/adminCourseFilters";
import CourseFilters from "./CourseFilters";
import {
  courseDate,
  cohortStatusLabels,
  teachingLanguageLabels,
  ageCategoryLabels,
} from "./RegistrationCourse";
import { paymentStatusLabels, type RegistrationCohort } from "./types";

interface CourseSummary extends RegistrationCohort {
  form_type: string;
  course_type: string | null;
  max_seats: number;
  taken: number | null;
  manual_offset: number;
  registration_count: number;
  incomplete_count: number;
  manual_signup_count: number;
  payments: Record<string, number>;
}
const descriptor = (c: CourseSummary) =>
  describeRegistrationCourse({ cohort: c });
export default function CourseOverviewAdmin({
  onShowRegistrations,
}: { onShowRegistrations?: (id: string, name: string) => void } = {}) {
  const [rows, setRows] = useState<CourseSummary[]>([]);
  const [filters, setFilters] = useState(emptyCourseFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: failure } = await invokeAdmin({
        action: "course_overview",
      });
      if (failure || data?.error || !Array.isArray(data?.data))
        throw new Error("Cannot load groups");
      setRows(
        data.data.filter((c: CourseSummary) => c.course_type !== "privat"),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const visible = rows
    .filter((c) => matchesCourseFilters(descriptor(c), filters))
    .sort(
      (a, b) =>
        (a.start_date ?? "").localeCompare(b.start_date ?? "") ||
        a.id.localeCompare(b.id),
    );
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Grupe — înscrieri și locuri</h2>
          <p className="text-sm text-muted-foreground">
            Grupele configurate, cu datele de start, capacitatea și plățile
            înregistrate.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void load()}
        >
          Actualizează grupele
        </Button>
      </div>
      {loading ? (
        <p>Se încarcă…</p>
      ) : error ? (
        <div role="alert" className="space-y-2">
          <p>Nu am putut încărca grupele. Numărătoarea nu este disponibilă.</p>
          <Button onClick={() => void load()}>Reîncearcă</Button>
        </div>
      ) : (
        <>
          <CourseFilters
            rows={rows.map(descriptor)}
            value={filters}
            onChange={setFilters}
            includePayment={false}
          />
          <p className="text-xs text-muted-foreground">
            Locurile ocupate folosesc regula existentă: înscrieri
            calificate/convertite, numărători manuale și ajustări. Plățile sunt
            afișate separat. Minim pentru pornire: jumătate din capacitate,
            rotunjit în sus.
          </p>
          {visible.length === 0 ? (
            <p>Nicio grupă pentru filtrele selectate.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visible.map((c) => (
                <article
                  key={c.id}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {c.title_ro || `Grupă ${c.level || ""}`.trim()}
                    </h3>
                    <p className="text-sm">
                      {c.format === "online"
                        ? "Online"
                        : c.format === "fizic"
                          ? "În persoană"
                          : "Format nespecificat"}{" "}
                      ·{" "}
                      {c.age_category
                        ? (ageCategoryLabels[c.age_category] ?? c.age_category)
                        : "Vârstă nespecificată"}{" "}
                      · {c.level || "Nivel nespecificat"}
                    </p>
                    <p className="text-sm">
                      Predare:{" "}
                      {c.teaching_language
                        ? (teachingLanguageLabels[c.teaching_language] ??
                          c.teaching_language)
                        : "Nespecificată"}
                    </p>
                    <p className="text-sm">
                      Start: {courseDate(c.start_date)}
                      {c.end_date ? ` · Final: ${courseDate(c.end_date)}` : ""}
                    </p>
                    <p className="text-sm">
                      {cohortStatusLabels[c.status] ?? c.status}
                    </p>
                    {c.schedule_label_ro && (
                      <p className="text-sm">
                        {c.schedule_label_ro} · ora României
                      </p>
                    )}
                  </div>
                  <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p>Minim pentru pornire: {minGroupSize(c.max_seats)}</p>
                    <p>
                      Locuri ocupate: {c.taken ?? "Nespecificat"} /{" "}
                      {c.max_seats}
                    </p>
                    {c.taken !== null && (
                      <p>Locuri libere: {Math.max(0, c.max_seats - c.taken)}</p>
                    )}
                    {c.taken !== null && c.taken > c.max_seats && (
                      <p className="text-amber-700">
                        Peste capacitate: {c.taken - c.max_seats}
                      </p>
                    )}
                  </div>
                  <p className="text-sm">
                    Înregistrări: {c.registration_count}
                    {c.incomplete_count > 0
                      ? ` (${c.incomplete_count} incomplete)`
                      : ""}
                  </p>
                  <div
                    className="flex flex-wrap gap-x-3 gap-y-1 text-xs"
                    aria-label="Plăți înregistrate"
                  >
                    {Object.entries({
                      paid: 0,
                      unpaid: 0,
                      pending: 0,
                      failed: 0,
                      refunded: 0,
                      ...c.payments,
                    }).map(([status, count]) => (
                      <span key={status}>
                        {paymentStatusLabels[status] ??
                          (status === "unspecified" ? "Nespecificat" : status)}
                        : {count}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Numărătoare manuală: {c.manual_signup_count} · Ajustare de
                    locuri: {c.manual_offset ?? 0}. Aceste numere nu confirmă
                    plata.
                  </p>
                  {onShowRegistrations && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onShowRegistrations(
                          c.id,
                          c.title_ro || `Grupă ${c.level || ""}`.trim(),
                        )
                      }
                    >
                      Vezi înscrierile grupei
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
