import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CourseOverviewAdmin from "@/components/admin/CourseOverviewAdmin";
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/lib/adminAuth", () => ({ invokeAdmin: api.invoke }));
describe("group capacity and payment overview", () => {
  it("shows exact group, configured categories, minimum, occupancy and distinct payment counts", async () => {
    api.invoke.mockResolvedValue({
      data: {
        data: [
          {
            id: "group",
            form_type: "group",
            course_type: "grup",
            title_ro: "A2 English teens",
            level: "A2",
            age_category: "adolescenti",
            format: "online",
            teaching_language: "en",
            status: "forming",
            start_date: "2026-11-03",
            max_seats: 6,
            taken: 4,
            registration_count: 5,
            incomplete_count: 0,
            manual_signup_count: 2,
            manual_offset: 1,
            payments: {
              paid: 1,
              pending: 1,
              failed: 1,
              unpaid: 1,
              refunded: 1,
            },
          },
        ],
      },
      error: null,
    });
    await act(async () => {
      render(<CourseOverviewAdmin />);
    });
    expect(
      screen.getByRole("heading", { name: "A2 English teens" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Minim pentru pornire: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Locuri ocupate: 4 \/ 6/)).toBeInTheDocument();
    expect(screen.getByText(/Locuri libere: 2/)).toBeInTheDocument();
    expect(screen.getByText("Plătit: 1")).toBeInTheDocument();
    expect(screen.getByText("În așteptare: 1")).toBeInTheDocument();
    expect(screen.getByText("Neplătit: 1")).toBeInTheDocument();
    expect(screen.getByText(/Numărătoare manuală: 2/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Limba de predare"), {
      target: { value: "en" },
    });
    expect(
      screen.getByRole("heading", { name: "A2 English teens" }),
    ).toBeInTheDocument();
  });
  it("shows a retryable error instead of an empty or zero-capacity overview", async () => {
    api.invoke.mockResolvedValue({
      data: { error: "counter failed" },
      error: null,
    });
    await act(async () => {
      render(<CourseOverviewAdmin />);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nu am putut încărca grupele",
    );
    expect(
      screen.getByRole("button", { name: "Reîncearcă" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Locuri ocupate:/)).not.toBeInTheDocument();
  });
});
