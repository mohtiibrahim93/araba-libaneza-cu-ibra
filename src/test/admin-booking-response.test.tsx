import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import BookingsAdmin from "@/components/BookingsAdmin";

const api = vi.hoisted(() => ({ invoke: vi.fn(), toast: vi.fn() }));
vi.mock("@/components/admin/CalendarSyncPanel", () => ({
  default: () => null,
}));
vi.mock("@/lib/adminAuth", () => ({ invokeAdmin: api.invoke }));
vi.mock("@/hooks/use-toast", () => ({ toast: api.toast }));

async function submitBooking() {
  await act(async () => {
    render(<BookingsAdmin />);
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Programează o lecție privată" }),
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.change(dialog.querySelector("input:not([type])")!, {
    target: { value: "Synthetic Student" },
  });
  fireEvent.change(dialog.querySelector('input[type="email"]')!, {
    target: { value: "student@example.test" },
  });
  fireEvent.change(dialog.querySelector('input[type="date"]')!, {
    target: { value: "2026-11-01" },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Programează lecția" }));
  });
}

describe("manual booking confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it.each([null, {}, { data: [] }, { success: false }])(
    "keeps the form open for an unconfirmed result %j",
    async (result) => {
      api.invoke.mockImplementation(async ({ action }) => ({
        data: action === "list_bookings" ? { data: [] } : result,
        error: null,
      }));
      await submitBooking();
      await waitFor(() =>
        expect(api.toast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: "destructive" }),
        ),
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(api.toast).not.toHaveBeenCalledWith(
        expect.objectContaining({ title: "Lecție programată" }),
      );
    },
  );
  it("closes the form only after explicit successful creation", async () => {
    api.invoke.mockImplementation(async ({ action }) => ({
      data:
        action === "list_bookings"
          ? { data: [] }
          : { success: true, booking_id: "new-booking" },
      error: null,
    }));
    await submitBooking();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(api.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Lecție programată" }),
    );
  });
  it("keeps the conflict warning until the owner confirms the override", async () => {
    let attempts = 0;
    api.invoke.mockImplementation(async ({ action }) => ({
      // The dialog also loads the private-student list; only the booking attempts count.
      data:
        action === "list_bookings" || action === "private_students"
          ? { data: [] }
          : ++attempts === 1
            ? { error: "slot taken", code: "conflict", clashes: ["calendar"] }
            : { success: true, registration_id: "new-registration" },
      error: null,
    }));
    await submitBooking();
    expect(screen.getByRole("alert")).toHaveTextContent("Google Calendar");
    expect(api.toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "Lecție programată" }),
    );
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Programează oricum" }),
      );
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(api.invoke).toHaveBeenCalledWith(
      expect.objectContaining({ action: "book_for_student", force: true }),
    );
    expect(api.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Lecție programată" }),
    );
  });
  it.each(["reschedule_booking", "cancel_booking"])(
    "does not show success for an unconfirmed %s",
    async (action) => {
      const row = {
        id: "existing-booking",
        student_name: "Synthetic Student",
        student_email: "student@example.test",
        event_type_slug: "paid",
        start_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        end_at: new Date(Date.now() + 7 * 86400000 + 3600000).toISOString(),
        status: "confirmed",
        format: "online",
      };
      vi.spyOn(window, "confirm").mockReturnValue(true);
      api.invoke.mockImplementation(async ({ action: called }) => ({
        data: called === "list_bookings" ? { data: [row] } : { data: [] },
        error: null,
      }));
      await act(async () => {
        render(<BookingsAdmin />);
      });
      if (action === "reschedule_booking") {
        fireEvent.click(
          screen.getByRole("button", {
            name: "Mută lecția cu Synthetic Student",
          }),
        );
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: "Mută lecția" }));
        });
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      } else {
        await act(async () => {
          fireEvent.click(
            screen.getByRole("button", {
              name: "Anulează programarea cu Synthetic Student",
            }),
          );
        });
      }
      expect(api.toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" }),
      );
      expect(api.toast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          title:
            action === "reschedule_booking"
              ? "Lecție mutată"
              : "Programare anulată",
        }),
      );
    },
  );
});
