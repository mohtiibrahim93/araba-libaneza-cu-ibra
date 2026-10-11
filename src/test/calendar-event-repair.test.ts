import { expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";
const helpers=()=>loadEdgeModule("supabase/functions/_shared/calendar-reconciliation.ts",{}) as any;
const booking={id:"booking-id",start_at:"2026-11-02T10:00:00Z",end_at:"2026-11-02T11:00:00Z",student_name:"Student",student_email:"student@example.test",student_phone:"123",format:"online",meet_link:"https://zoom.example.test",status:"confirmed",google_event_id:null,google_sync_error:null};
const config={lovableKey:"synthetic",calendarKey:"synthetic"};
function db(){const row:any=structuredClone(booking);return {row,from:()=>{let filters:((r:any)=>boolean)[]=[];let patch:any;const result=()=>{const match=filters.every(f=>f(row));if(match&&patch)Object.assign(row,patch);return {data:match?[{id:row.id}]:[],error:null};};const q:any={update:(p:any)=>{patch=p;return q;},eq:(k:string,v:any)=>{filters.push(r=>r[k]===v);return q;},is:(k:string,v:any)=>{filters.push(r=>r[k]===v);return q;},in:(k:string,v:any[])=>{filters.push(r=>v.includes(r[k]));return q;},select:()=>q,maybeSingle:async()=>{const r=result();return {data:r.data[0]??null,error:null};},then:(resolve:any)=>Promise.resolve(result()).then(resolve)};return q;}};}
it("repairs without another booking and uses a deterministic event identity",async()=>{
 const store=db();let body:any;await helpers().repairBookingCalendar(store,booking,config,async(_url:string,init:any)=>{body=JSON.parse(init.body);expect(store.row.google_sync_error).toBe("calendar_create_pending");return Response.json({id:body.id});});
 expect(body.extendedProperties.private.booking_id).toBe(booking.id);expect(store.row.google_event_id).toBe(body.id);expect(body.description).toContain(booking.meet_link);expect(store.row.google_sync_error).toBeNull();
 expect(await helpers().googleBookingEventId(booking.id)).toBe(body.id);
});
it("recovers the exact owned event while preserving Google edits and guests",async()=>{
 const eventId=await helpers().googleBookingEventId(booking.id),store=db();const methods:string[]=[];
 await helpers().repairBookingCalendar(store,booking,config,async(_url:string,init:any)=>{methods.push(init.method);return init.method==="POST"?new Response(null,{status:409}):Response.json({id:eventId,start:{dateTime:"2026-11-02T15:00:00+02:00"},end:{dateTime:"2026-11-02T16:00:00+02:00"},attendees:[{email:"teacher@example.test"}],extendedProperties:{private:{booking_id:booking.id}}});});
 expect(methods).toEqual(["POST","GET"]);expect(store.row.start_at).toBe("2026-11-02T13:00:00.000Z");expect(store.row.google_sync_error).toBe("contact_update_pending");
 await expect(helpers().repairBookingCalendar(db(),booking,config,async(_url:string,init:any)=>init.method==="POST"?new Response(null,{status:409}):Response.json({id:eventId,extendedProperties:{private:{booking_id:"other"}}}))).rejects.toThrow();
});
it("keeps durable retry state after a failed Google create",async()=>{
 const store=db();await expect(helpers().repairBookingCalendar(store,booking,config,async()=>new Response(null,{status:503}))).rejects.toThrow();expect(store.row.google_sync_error).toBe("calendar_create_pending");expect(store.row.google_event_id).toBe(await helpers().googleBookingEventId(booking.id));
});
it("tracks cleanup if cancellation wins while creation is in flight",async()=>{
 const store=db();await expect(helpers().repairBookingCalendar(store,booking,config,async(_url:string,init:any)=>{if(init.method==="POST"){store.row.status="cancelled";store.row.google_sync_error=null;return Response.json({id:JSON.parse(init.body).id});}return new Response(null,{status:503});})).rejects.toThrow();expect(store.row.google_sync_error).toBe("cancel_update_pending");
});
