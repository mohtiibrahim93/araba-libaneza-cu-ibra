import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import BookingsAdmin from "@/components/BookingsAdmin";
import type { Registration } from "@/components/admin/types";
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/lib/adminAuth", () => ({ invokeAdmin: api.invoke }));
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
describe("private lessons section", () => {
  it("includes website, manual and incomplete private enrolments, but not groups", async () => {
    api.invoke.mockResolvedValue({ data: { data: [] }, error: null });
    const { default: PrivateLessonsAdmin } = await import("@/components/admin/PrivateLessonsAdmin");
    const registrations = [
      { id: "web", name: "Website Private", form_type: "private", format: "online", source: "form", payment_status: "pending", lead_status: "incomplete" },
      { id: "manual", name: "Manual Private", form_type: "private", format: "fizic", source: "admin", payment_status: "unpaid", lead_status: "contacted" },
      { id: "group", name: "Group Student", form_type: "group" },
    ] as Registration[];
    await act(async () => { render(<PrivateLessonsAdmin registrations={registrations} onOpen={vi.fn()} onChanged={vi.fn()} />); });
    expect(screen.getByText("Website Private")).toBeInTheDocument();
    expect(screen.getByText("Manual Private")).toBeInTheDocument();
    expect(screen.queryByText("Group Student")).not.toBeInTheDocument();
    expect(screen.getByText("În așteptare", { selector: "td" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Programează o lecție privată" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Format", { selector: "select" }), { target: { value: "fizic" } });
    expect(screen.queryByText("Website Private")).not.toBeInTheDocument();
    expect(screen.getByText("Manual Private")).toBeInTheDocument();
  });
  it("scopes bookings and their counts to private lessons when requested", async () => {
    const base = { start_at: new Date(Date.now() + 86400000).toISOString(), end_at: new Date(Date.now() + 90000000).toISOString(), status: "confirmed", format: "online", student_email: "synthetic@example.test" };
    api.invoke.mockResolvedValue({ data: { data: [
      { ...base, id: "p", event_type_slug: "paid", student_name: "Private Booking" },
      { ...base, id: "t", event_type_slug: "trial", student_name: "Trial Booking" },
    ] }, error: null });
    await act(async () => { render(<BookingsAdmin privateOnly />); });
    expect(screen.getByText("Private Booking")).toBeInTheDocument();
    expect(screen.queryByText("Trial Booking")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Viitoare.*1/ })).toBeInTheDocument();
  });
});
