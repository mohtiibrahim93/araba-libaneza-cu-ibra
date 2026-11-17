import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EarlyStartPanel } from "@/pages/Checkout";

/**
 * The box at checkout for a group that starts inside the 14-day withdrawal
 * period, used the way a student uses it.
 */
describe("the early-start box", () => {
  it("cannot continue until the student ticks it themselves", () => {
    const onAccept = vi.fn();
    render(
      <EarlyStartPanel
        english={false}
        startDate="2099-12-01"
        onAccept={onAccept}
      />,
    );
    const box = screen.getByRole("checkbox");
    const go = screen.getByRole("button", { name: "Continuă spre plată" });
    expect(box).not.toBeChecked();
    expect(go).toBeDisabled();
    fireEvent.click(go);
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(box);
    expect(go).toBeEnabled();
    fireEvent.click(go);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("names the day the group starts, or started, in the reader's language", () => {
    const { unmount } = render(
      <EarlyStartPanel english startDate="2099-12-01" onAccept={() => {}} />,
    );
    expect(
      screen.getByText(
        /Your group starts on 1 December 2099, inside that time/,
      ),
    ).toBeInTheDocument();
    unmount();
    render(
      <EarlyStartPanel
        english={false}
        startDate="2026-11-07"
        onAccept={() => {}}
      />,
    );
    expect(
      screen.getByText(
        /Grupa ta a început pe 7 noiembrie 2026, deci în acest timp/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Alege altă grupă" }),
    ).toHaveAttribute("href", "/cursuri/grup");
  });
});
