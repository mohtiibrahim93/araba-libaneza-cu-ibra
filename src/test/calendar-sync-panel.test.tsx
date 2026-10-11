import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import CalendarSyncPanel from "@/components/admin/CalendarSyncPanel";
const api=vi.hoisted(()=>({invoke:vi.fn()})); vi.mock("@/lib/adminAuth",()=>({invokeAdmin:api.invoke}));
beforeEach(()=>api.invoke.mockReset());
it("shows an unlinked event and the sync result without inventing a booking",async()=>{
 api.invoke.mockResolvedValue({data:{success:true,data:{updated:1,pushed:0,errors:[],unmatched:[{id:"e",summary:"Radu",start_at:"2026-10-11T12:30:00Z",end_at:"2026-10-11T13:30:00Z"}]}},error:null}); const changed=vi.fn();
 await act(async()=>{render(<CalendarSyncPanel onChanged={changed}/>);});
 expect(screen.getByText("Radu")).toBeInTheDocument(); expect(screen.getByText(/15:30/)).toBeInTheDocument();expect(changed).toHaveBeenCalledOnce();
});
it("reports a failed sync and lets the admin retry",async()=>{
 api.invoke.mockResolvedValueOnce({data:{error:"Google unavailable"},error:null}).mockResolvedValue({data:{success:true,data:{updated:0,pushed:0,errors:[],unmatched:[]}},error:null});
 await act(async()=>{render(<CalendarSyncPanel/>);}); expect(screen.getByRole("alert")).toHaveTextContent("Google unavailable");
 await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Sincronizează Google Calendar"}));});expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
it("queues the new week and ignores a stale in-flight result",async()=>{
 let finish:any; api.invoke.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue({data:{success:true,data:{updated:0,pushed:0,errors:[],unmatched:[]}},error:null});
 const view=render(<CalendarSyncPanel from="2026-10-01T00:00:00Z" to="2026-10-08T00:00:00Z"/>);
 view.rerender(<CalendarSyncPanel from="2026-10-08T00:00:00Z" to="2026-10-15T00:00:00Z"/>);
 await act(async()=>{finish({data:{success:true,data:{updated:0,pushed:0,errors:[],unmatched:[{id:"old",summary:"Old week",start_at:"2026-10-02T10:00:00Z",end_at:"2026-10-02T11:00:00Z"}]}},error:null});});
 expect(screen.queryByText("Old week")).not.toBeInTheDocument();expect(api.invoke).toHaveBeenCalledTimes(2);
});
