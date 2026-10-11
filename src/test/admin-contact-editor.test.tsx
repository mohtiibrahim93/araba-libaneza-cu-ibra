import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import ContactEditor from "@/components/admin/ContactEditor";
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/lib/adminAuth", () => ({ invokeAdmin: api.invoke }));
beforeEach(() => api.invoke.mockReset());
const person = { id: "r", name: "Student", email: "contact@example.test", account_email: "login@example.test", phone: "123" } as any;
it("saves contact details and refreshes only on explicit success", async () => {
 const changed = vi.fn(); api.invoke.mockResolvedValue({ data: { success: true }, error: null });
 render(<ContactEditor person={person} onChanged={changed} />);
 fireEvent.click(screen.getByRole("button", { name: "Editează contactul" }));
 fireEvent.change(screen.getByLabelText("Nume"), { target: { value: "Updated Student" } });
 await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Salvează contactul" })); });
 expect(api.invoke).toHaveBeenCalledWith(expect.objectContaining({ action: "update_contact", id: "r", name: "Updated Student", email: "contact@example.test", phone: "123" }));
 expect(changed).toHaveBeenCalledOnce();
});
it("keeps edits visible and reports a rejected save", async () => {
 api.invoke.mockResolvedValue({ data: { error: "Save failed" }, error: null }); const changed = vi.fn();
 render(<ContactEditor person={person} onChanged={changed} />); fireEvent.click(screen.getByRole("button", { name: "Editează contactul" }));
 await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Salvează contactul" })); });
 expect(screen.getByRole("alert")).toHaveTextContent("Save failed"); expect(changed).not.toHaveBeenCalled();
 expect(screen.getByText(/login@example.test/)).toBeInTheDocument();
});
