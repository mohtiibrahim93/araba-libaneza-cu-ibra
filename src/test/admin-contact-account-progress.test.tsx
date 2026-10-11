import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import PersonSheet from "@/components/admin/PersonSheet";
vi.mock("@/lib/adminAuth",()=>({invokeAdmin:async()=>({data:{data:[{email:"login@example.test",xp:42,rounds:3,items_seen:5,placement:{level:"A1"}}]},error:null})}));
it("keeps student account progress tied to the original login after a contact email edit",async()=>{
 render(<PersonSheet person={{id:"r",name:"Student",email:"new-contact@example.test",account_email:"login@example.test",phone:"123",form_type:"private",created_at:"2026-01-01",payment_status:"unpaid"} as any} onClose={()=>{}} onStatusChange={()=>{}} updating={false} onShowInTable={()=>{}}/>);
 expect(await screen.findByText("42 XP")).toBeInTheDocument();
});
