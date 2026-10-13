import { useId } from "react";
import {
  courseFilterKeys,
  courseFilterOptions,
  type CourseFilters as Filters,
} from "@/lib/adminCourseFilters";
import {
  cohortStatusLabels,
  teachingLanguageLabels,
  ageCategoryLabels,
} from "./RegistrationCourse";
import { paymentStatusLabels } from "./types";
import { Button } from "@/components/ui/button";

const labels = {
  format: "Format",
  age: "Vârstă",
  level: "Nivel",
  teachingLanguage: "Limba de predare",
  status: "Starea grupei",
  payment: "Plată",
};
const valueLabels: Record<string, string> = {
  ...cohortStatusLabels,
  ...teachingLanguageLabels,
  ...ageCategoryLabels,
  ...paymentStatusLabels,
  online: "Online",
  fizic: "În persoană",
  unspecified: "Nespecificat",
};
export default function CourseFilters({
  rows,
  value,
  onChange,
  includePayment = true,
}: {
  rows: Filters[];
  value: Filters;
  onChange: (next: Filters) => void;
  includePayment?: boolean;
}) {
  const prefix = useId();
  const options = courseFilterOptions(rows);
  return (
    <div className="flex flex-wrap items-end gap-3">
      {courseFilterKeys
        .filter((key) => includePayment || key !== "payment")
        .map((key) => (
          <div key={key} className="space-y-1">
            <label
              className="block text-xs font-medium"
              htmlFor={`${prefix}-${key}`}
            >
              {labels[key]}
            </label>
            <select
              id={`${prefix}-${key}`}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="all">Toate</option>
              {options[key].map((option) => (
                <option key={option} value={option}>
                  {valueLabels[option] ?? option}
                </option>
              ))}
            </select>
          </div>
        ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange({
            format: "all",
            age: "all",
            level: "all",
            teachingLanguage: "all",
            status: "all",
            payment: "all",
          })
        }
      >
        Resetează detaliile cursului
      </Button>
    </div>
  );
}
