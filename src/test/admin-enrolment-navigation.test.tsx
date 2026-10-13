import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Admin from "@/pages/Admin";
const fixture = vi.hoisted(() => {
  const cohort = {
    id: "selected-group",
    title_ro: "Synthetic A1 group",
    level: "A1",
    start_date: "2026-11-02",
    status: "forming",
    format: "online",
    age_category: "adulti",
    teaching_language: "ro",
  };
  const base = {
    created_at: "2026-10-11T10:00:00Z",
    phone: "",
    email: null,
    payment_status: "unpaid",
  };
  return {
    cohort,
    registrations: [
      {
        ...base,
        id: "group-person",
        name: "Incomplete Group Student",
        form_type: "group",
        cohort_id: cohort.id,
        cohort,
        lead_status: "incomplete",
      },
      {
        ...base,
        id: "private-person",
        name: "Private Person",
        form_type: "private",
        lead_status: "new",
        source: "form",
      },
    ],
  };
});
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: { user: { email: "admin@example.test" } } },
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));
vi.mock("@/integrations/lovable", () => ({ lovable: {} }));
vi.mock("@/lib/router-compat", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("@/lib/adminAuth", () => ({
  invokeAdmin: async ({ action }: { action?: string }) => ({
    error: null,
    data: {
      data: !action
        ? fixture.registrations
        : action === "course_overview"
          ? [
              {
                ...fixture.cohort,
                form_type: "group",
                course_type: "grup",
                max_seats: 6,
                taken: 0,
                registration_count: 1,
                incomplete_count: 1,
                manual_signup_count: 0,
                manual_offset: 0,
                payments: { unpaid: 1 },
              },
            ]
          : [],
    },
  }),
}));
vi.mock("@/components/admin/TodayAdmin", () => ({ default: () => null }));
vi.mock("@/components/admin/CohortSessionsAdmin", () => ({
  default: () => null,
}));
vi.mock("@/components/admin/CohortCalendarNames", () => ({
  default: () => null,
}));
vi.mock("@/components/admin/CohortsAdmin", () => ({ default: () => null }));
const go = async (name: string) => {
  await act(async () => {
    fireEvent.click(screen.getAllByRole("button", { name })[0]!);
  });
};
const openGroup = async () => {
  await act(async () => {
    render(<Admin />);
  });
  await go("Grupe");
  await go("Vezi înscrierile grupei");
};
describe("enrolment navigation", () => {
  it("shows incomplete registrations when drilling into the group's full registration total", async () => {
    await openGroup();
    expect(screen.getByText("Incomplete Group Student")).toBeInTheDocument();
  });
  it("clears prior group filters when opening a private student in the main enrolment table", async () => {
    await openGroup();
    await go("Lecții private");
    await go("Private Person");
    await go("Plăți, rambursări și ștergere: vezi în Înscrieri");
    expect(screen.getByText("Private Person")).toBeInTheDocument();
    expect(
      screen.queryByText("Grupă: Synthetic A1 group"),
    ).not.toBeInTheDocument();
  });
});
