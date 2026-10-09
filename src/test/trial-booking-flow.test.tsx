import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n";
import NativeScheduler from "@/components/NativeScheduler";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";

const api = vi.hoisted(() => ({
  getUser: vi.fn(), signOut: vi.fn(), signInWithOtp: vi.fn(), verifyOtp: vi.fn(),
  invoke: vi.fn(), insert: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: api, functions: { invoke: api.invoke }, from: () => ({ insert: api.insert }),
} }));
vi.mock("@/hooks/useSiteTexts", () => ({ useSiteTexts: () => [] }));
vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
}));

function Trial() {
  return <NativeScheduler eventType="trial" ensureRegistration={useTrialRegistration()} />;
}

let slot: string;
let slotLabel: string;

async function requestCode() {
  render(<I18nProvider initialLang="en"><Trial /></I18nProvider>);
  fireEvent.click(await screen.findByRole("button", { name: new RegExp(slotLabel) }));
  fireEvent.change(screen.getByPlaceholderText("Full name"), { target: { value: "Test Visitor" } });
  fireEvent.change(screen.getByPlaceholderText("email@…"), { target: { value: "visitor@example.test" } });
  fireEvent.change(screen.getByPlaceholderText("Phone"), { target: { value: "+40722123456" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  return screen.findByLabelText("The code from the email");
}

describe("free-trial booking through email verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.getUser.mockResolvedValue({ data: { user: null } });
    api.insert.mockResolvedValue({ error: null });
    api.signInWithOtp.mockResolvedValue({ error: null });
    api.verifyOtp.mockResolvedValue({ error: null });
    api.invoke.mockResolvedValue({
      data: null,
      error: { context: new Response(JSON.stringify({ code: "trial_used" }), { status: 409 }) },
    });
    // A real-shaped availability response; no live slots or registrations are changed.
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 2);
    start.setUTCHours(11, 0, 0, 0);
    slot = start.toISOString();
    const date = slot.slice(0, 10);
    slotLabel = new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit",
    }).format(start);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      event_type: { name_ro: "Probă", name_en: "Trial", duration_min: 30 },
      slots: [slot], slots_by_date: { [date]: [slot] },
    }))));
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("preserves the chosen slot while requesting a code for a new visitor", async () => {
    await requestCode();
    expect(screen.getByText(/your slot, still selected/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and continue" })).toBeDisabled();
    expect(api.signInWithOtp).toHaveBeenCalledWith({
      email: "visitor@example.test", options: { shouldCreateUser: true },
    });
    expect(api.invoke).not.toHaveBeenCalled();
  });

  it("keeps the visitor on the code screen when Auth rejects the code", async () => {
    api.verifyOtp.mockResolvedValue({ error: { message: "Expired token" } });
    const input = await requestCode();
    fireEvent.change(input, { target: { value: "012345" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm and continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("wrong or has expired");
    expect(screen.getByText(/your slot, still selected/)).toBeInTheDocument();
    expect(api.invoke).not.toHaveBeenCalled();
  });

  it("hands the same slot to checkout after verification and shows a server duplicate refusal", async () => {
    const input = await requestCode();
    fireEvent.change(input, { target: { value: "012345" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm and continue" }));
    expect(await screen.findByText("The free trial was already used")).toBeInTheDocument();
    expect(api.verifyOtp).toHaveBeenCalledWith({ email: "visitor@example.test", token: "012345", type: "email" });
    expect(api.invoke).toHaveBeenCalledWith("create-checkout-session", {
      body: expect.objectContaining({
        registrationId: expect.any(String), setup: true, email: "visitor@example.test",
        booking: expect.objectContaining({ start_at: slot, event_type: "trial" }),
      }),
    });
    await waitFor(() => expect(screen.queryByLabelText("The code from the email")).not.toBeInTheDocument());
  });
});
