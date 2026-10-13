import { useMemo, useState } from "react";
import BookingsAdmin from "@/components/BookingsAdmin";
import { Input } from "@/components/ui/input";
import {
  describeRegistrationCourse,
  emptyCourseFilters,
  matchesCourseFilters,
} from "@/lib/adminCourseFilters";
import CourseFilters from "./CourseFilters";
import RegistrationCourse, {
  registrationFormatLabel,
} from "./RegistrationCourse";
import {
  leadStatusLabels,
  leadSourceLabels,
  partialRefundNote,
  paymentStatusLabels,
  type Registration,
} from "./types";

export default function PrivateLessonsAdmin({
  registrations,
  onOpen,
  onChanged,
}: {
  registrations: Registration[];
  onOpen: (id: string) => void;
  onChanged: () => void;
}) {
  const [filters, setFilters] = useState(emptyCourseFilters);
  const [query, setQuery] = useState("");
  const privateRows = useMemo(
    () => registrations.filter((r) => r.form_type === "private"),
    [registrations],
  );
  const visible = privateRows.filter(
    (r) =>
      matchesCourseFilters(describeRegistrationCourse(r), filters) &&
      [r.name, r.email, r.phone].some((v) =>
        v
          ?.toLocaleLowerCase("ro-RO")
          .includes(query.trim().toLocaleLowerCase("ro-RO")),
      ),
  );
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <h2 className="text-lg font-semibold">
            Lecții private — înscrieri ({visible.length}/{privateRows.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Înscrieri de pe site și adăugate manual. Cererile incomplete sunt
            păstrate și marcate; nu înseamnă o lecție rezervată.
          </p>
        </div>
        <Input
          aria-label="Caută înscrieri private"
          placeholder="Nume, email sau telefon"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <CourseFilters
          rows={privateRows.map(describeRegistrationCourse)}
          value={filters}
          onChange={setFilters}
        />
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nicio înscriere privată pentru filtrele selectate.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2">Cursant</th>
                  <th className="p-2">Curs</th>
                  <th className="p-2">Înscriere</th>
                  <th className="p-2">Plată</th>
                  <th className="p-2">Sursă</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2 align-top">
                      <button
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                        onClick={() => onOpen(r.id)}
                      >
                        {r.name}
                      </button>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      <p className="text-xs text-muted-foreground">{r.phone}</p>
                    </td>
                    <td className="p-2 align-top">
                      {registrationFormatLabel(r)}
                      <RegistrationCourse registration={r} />
                    </td>
                    <td className="p-2 align-top">
                      {leadStatusLabels[r.lead_status] ??
                        r.lead_status ??
                        "Nespecificat"}
                    </td>
                    <td className="p-2 align-top">
                      {paymentStatusLabels[r.payment_status ?? ""] ??
                        r.payment_status ??
                        "Nespecificat"}
                      {partialRefundNote(r) ? ` · ${partialRefundNote(r)}` : ""}
                    </td>
                    <td className="p-2 align-top">
                      {r.source
                        ? (leadSourceLabels[r.source] ?? r.source)
                        : "Nespecificată"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <BookingsAdmin privateOnly onChanged={onChanged} />
    </div>
  );
}
