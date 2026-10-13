import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import type { Registration } from "@/components/admin/types";

vi.mock("@/lib/adminAuth", () => ({
  invokeAdmin: async () => ({ data: { data: [] }, error: null }),
}));
vi.mock("@/lib/router-compat", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));
async function table(rows: unknown[]) {
  await act(async () => {
    render(
      <RegistrationsTable
        rows={rows as Registration[]}
        selected={new Set()}
        updatingStatus={null}
        refundingId={null}
        cancelingId={null}
        onToggleSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onStatusChange={vi.fn()}
        onRefund={vi.fn()}
        onPreviewRefund={vi.fn()}
        onPreviewCancel={vi.fn()}
        onCancelSubscription={vi.fn()}
      />,
    );
  });
}
const row = {
  id: "synthetic",
  name: "Synthetic Student",
  form_type: "group",
  lead_status: "new",
  created_at: "2026-10-11T10:00:00Z",
  format: "online",
  cohort_id: "c1",
};
describe("enrolment group identity", () => {
  it("shows the selected group, date, schedule and teaching language", async () => {
    await table([
      {
        ...row,
        cohort: {
          id: "c1",
          title_ro: "A1 noiembrie",
          level: "A1",
          start_date: "2026-11-02",
          schedule_label_ro: "Luni 19:00",
          status: "forming",
          teaching_language: "en",
        },
      },
    ]);
    expect(screen.getByText("A1 noiembrie")).toBeInTheDocument();
    expect(screen.getByText(/02\.11\.2026/)).toBeInTheDocument();
    expect(screen.getByText(/Luni 19:00/)).toBeInTheDocument();
    expect(screen.getByText(/Predare: Engleză/)).toBeInTheDocument();
  });
  it("flags a missing group rather than guessing from level or format", async () => {
    await table([{ ...row, cohort_id: null, level: "A1", cohort: null }]);
    expect(screen.getByText("Fără grupă atribuită")).toBeInTheDocument();
  });
  it("distinguishes a dangling group reference from an unassigned registration", async () => {
    await table([{ ...row, cohort: null }]);
    expect(
      screen.getByText("Grupa nu mai este disponibilă"),
    ).toBeInTheDocument();
  });
  it("displays the selected group's physical format rather than stale online registration format", async () => {
    await table([
      {
        ...row,
        cohort: {
          id: "c1",
          title_ro: "A1 fizic",
          format: "fizic",
          start_date: "2026-11-02",
          status: "forming",
          teaching_language: null,
        },
        teaching_language: "en",
      },
    ]);
    expect(
      screen.getByText("În persoană", { selector: "p" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Predare: Engleză/)).not.toBeInTheDocument();
  });
});
