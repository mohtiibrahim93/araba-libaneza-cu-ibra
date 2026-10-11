import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import CheckoutEmailGate from "@/components/CheckoutEmailGate";
const auth=vi.hoisted(()=>({getUser:vi.fn(),signInWithOtp:vi.fn(),verifyOtp:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{auth}}));
beforeEach(()=>{vi.clearAllMocks();auth.getUser.mockResolvedValue({data:{user:null}});auth.signInWithOtp.mockResolvedValue({error:null});});
it("requires an OTP for a signed-out registrant before allowing payment",async()=>{
 const ready=vi.fn(); await act(async()=>{render(<CheckoutEmailGate email="student@example.test" onVerified={ready}/>);}); expect(ready).not.toHaveBeenCalled();
 await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Trimite codul"}));});
 auth.verifyOtp.mockResolvedValue({data:{user:{email:"student@example.test",email_confirmed_at:"2026-01-01"}},error:null});
 fireEvent.change(screen.getByLabelText("Codul primit prin email"),{target:{value:"123456"}});
 await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Verifică emailul"}));});expect(ready).toHaveBeenCalledOnce();
});
it("does not reuse another person's signed-in account",async()=>{
 auth.getUser.mockResolvedValue({data:{user:{email:"other@example.test",email_confirmed_at:"2026-01-01"}}}); const ready=vi.fn();
 await act(async()=>{render(<CheckoutEmailGate email="student@example.test" onVerified={ready}/>);});expect(ready).not.toHaveBeenCalled();expect(screen.getByRole("button",{name:"Trimite codul"})).toBeInTheDocument();
});
it("reuses a matching confirmed account",async()=>{
 auth.getUser.mockResolvedValue({data:{user:{email:"student@example.test",email_confirmed_at:"2026-01-01"}}}); const ready=vi.fn();
 await act(async()=>{render(<CheckoutEmailGate email="student@example.test" onVerified={ready}/>);});expect(ready).toHaveBeenCalledOnce();
});
