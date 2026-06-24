import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formTypeLabels,
  leadStatusLabels,
  leadSourceLabels,
  trackPreferenceLabels,
  type CourseTypeFilter,
  type LeadStatusFilter,
  type Registration,
} from "@/components/admin/types";

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllRegistrationsCsv(
  rows: Registration[],
  courseFilter: CourseTypeFilter,
  statusFilter: LeadStatusFilter,
) {
  const headers = [
    "Data",
    "Tip",
    "Nume",
    "Telefon",
    "Email",
    "Centru",
    "Format",
    "Sursă",
    "Track",
    "Status lead",
    "Vârsta copil",
    "Note",
  ];
  const data = rows.map((r) => [
    new Date(r.created_at).toLocaleString("ro-RO"),
    formTypeLabels[r.form_type] || r.form_type,
    r.name,
    r.phone,
    r.email || "",
    r.center || "",
    r.format || "",
    r.source ? leadSourceLabels[r.source] : "",
    r.track_preference ? trackPreferenceLabels[r.track_preference] : "",
    leadStatusLabels[r.lead_status || "new"],
    r.child_age || "",
    r.notes || "",
  ]);
  const courseSuffix = courseFilter === "all" ? "toate" : courseFilter;
  const statusSuffix = statusFilter === "all" ? "toate-statusurile" : statusFilter;
  const filename = `inscrieri_${courseSuffix}_${statusSuffix}_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  downloadCsv(filename, headers, data);
}

function privateExportFilename(
  ext: "csv" | "pdf",
  statusFilter: LeadStatusFilter,
  search: string,
) {
  const statusSuffix = statusFilter === "all" ? "toate-statusurile" : statusFilter;
  const searchSuffix = search.trim()
    ? `_mesaj-${search
        .trim()
        .toLocaleLowerCase("ro-RO")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "")}`
    : "";
  return `leaduri_private_${statusSuffix}${searchSuffix}_${new Date()
    .toISOString()
    .slice(0, 10)}.${ext}`;
}

export function exportPrivateLeadsCsv(
  rows: Registration[],
  statusFilter: LeadStatusFilter,
  search: string,
) {
  const headers = ["Data", "Nume", "Telefon", "Email", "Format", "Sursă", "Track", "Status lead", "Mesaj"];
  const data = rows.map((r) => [
    new Date(r.created_at).toLocaleString("ro-RO"),
    r.name,
    r.phone,
    r.email || "",
    r.format || "",
    r.source ? leadSourceLabels[r.source] : "",
    r.track_preference ? trackPreferenceLabels[r.track_preference] : "",
    leadStatusLabels[r.lead_status || "new"],
    r.notes || "",
  ]);
  downloadCsv(privateExportFilename("csv", statusFilter, search), headers, data);
}

export function exportPrivateLeadsPdf(
  rows: Registration[],
  statusFilter: LeadStatusFilter,
  search: string,
) {
  const doc = new jsPDF({ orientation: "landscape" });
  const statusLabel =
    statusFilter === "all" ? "Toate statusurile" : leadStatusLabels[statusFilter];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Lead-uri lectii private", 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Filtru status: ${statusLabel} · Total: ${rows.length}`, 14, 24);

  autoTable(doc, {
    startY: 32,
    head: [["Data", "Nume", "Telefon", "Email", "Format", "Sursă", "Track", "Status", "Mesaj"]],
    body: rows.map((r) => [
      new Date(r.created_at).toLocaleString("ro-RO"),
      r.name,
      r.phone,
      r.email || "—",
      r.format || "—",
      r.source ? leadSourceLabels[r.source] : "—",
      r.track_preference ? trackPreferenceLabels[r.track_preference] : "—",
      leadStatusLabels[r.lead_status || "new"],
      r.notes || "—",
    ]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255] },
    columnStyles: { 8: { cellWidth: 78 } },
    margin: { left: 14, right: 14 },
  });

  doc.save(privateExportFilename("pdf", statusFilter, search));
}