import { describe, expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";
function database(pending = false, sessions: any[] = []) {
 const rows: any[] = [{ id: "b", google_event_id: "e", registration_id: "r", start_at: "2026-10-12T13:30:00Z", end_at: "2026-10-12T14:30:00Z", status: "confirmed", student_email: "new@example.test", google_contact_email: "old@example.test", student_name: "New Name", student_phone: "123", google_sync_error: pending ? "contact_update_pending" : null }];
 return { rows, sessions, from: (table: string) => { let filters: [string, unknown][] = []; let patch: any;
 const q: any = { is: (k: string,v: unknown) => { filters.push([k,v]); return q; }, select: () => q, order: () => q, range: () => q, eq: (k: string,v: unknown) => { filters.push([k,v]); return q; }, update: (p: any) => { patch=p; return q; },
 then: (resolve: any) => { const source=table==="bookings" ? rows : table==="cohort_sessions" ? sessions : []; const selected=source.filter(r=>filters.every(([k,v])=>r[k]===v));
 if(patch) selected.forEach(r=>Object.assign(r,patch)); return Promise.resolve({data:selected.map(r=>({...r})),error:null}).then(resolve); } }; return q; } };
}
const sync = () => (loadEdgeModule("supabase/functions/_shared/calendar-reconciliation.ts", {}) as any).reconcileCalendar;
const config = { lovableKey: "synthetic", calendarKey: "synthetic", from: "2026-10-10T00:00:00Z", to: "2026-10-20T00:00:00Z" };
const event = { id: "e", etag: "v1", summary: "Private lesson", attendees: [{email:"old@example.test"}, {email:"other@example.test"}], start: {dateTime:"2026-10-12T13:30:00+03:00"}, end:{dateTime:"2026-10-12T14:30:00+03:00"} };
describe("Google Calendar reconciliation", () => {
 it("imports exact linked event times respecting the Romanian offset", async () => {
  const db=database(); const out=await sync()(db,config,async()=>Response.json({items:[event]}));
  expect(db.rows[0].start_at).toBe("2026-10-12T10:30:00.000Z"); expect(out.updated).toBe(1);
 });
 it("imports explicit cancellation but never cancels an absent event", async () => {
  const db=database(); await sync()(db,config,async()=>Response.json({items:[{id:"e",status:"cancelled"}]})); expect(db.rows[0].status).toBe("cancelled");
  const missing=database(); const out=await sync()(missing,config,async(url:string)=>url.includes("/events/") ? new Response("",{status:404}) : Response.json({items:[]}));
  expect(missing.rows[0].status).toBe("confirmed"); expect(out.errors.length).toBeGreaterThan(0);
 });
 it("does not overwrite a pending admin change when the Google write fails", async () => {
  const db=database(true); const out=await sync()(db,config,async(_url:string,init:any)=>init?.method==="PATCH" ? new Response("",{status:503}) : Response.json(init?.method==="GET" ? event : {items:[event]}));
  expect(db.rows[0].start_at).toBe("2026-10-12T13:30:00Z"); expect(db.rows[0].google_sync_error).toBeTruthy(); expect(out.errors.length).toBeGreaterThan(0);
 });
 it("preserves other guests when synchronizing updated contact details", async () => {
  const db=database(true); let patch:any;
  const out=await sync()(db,config,async(_url:string,init:any)=> { if(init?.method==="PATCH"){patch=JSON.parse(init.body);return Response.json({...event,...patch});} return Response.json(init?.method==="GET" ? event : {items:[event]}); });
  expect(patch.attendees).toEqual([{email:"new@example.test",displayName:"New Name"},{email:"other@example.test"}]); expect(db.rows[0].google_sync_error).toBeNull(); expect(out.pushed).toBe(1);
 });
 it("reports unlinked events without making up a student or registration", async () => {
  const db=database(); const out=await sync()(db,config,async()=>Response.json({items:[event,{...event,id:"external",summary:"Radu"}]}));
  expect(out.unmatched.map((e:any)=>e.id)).toEqual(["external"]); expect(db.rows).toHaveLength(1);
 });
});
it("retries an admin cancellation and clears the issue only after Google confirms", async () => {
 const db=database(true); db.rows[0].status="cancelled"; db.rows[0].google_sync_error="cancel_update_pending";
 const out=await sync()(db,config,async(_url:string,init:any)=>init?.method==="DELETE" ? new Response(null,{status:204}) : Response.json({items:[event]}));
 expect(out.pushed).toBe(1); expect(db.rows[0].google_sync_error).toBeNull();
});
it("a contact-only edit preserves a time already changed in Google", async () => {
 const db=database(true); let patch:any;
 await sync()(db,config,async(_url:string,init:any)=> { if(init?.method==="PATCH"){patch=JSON.parse(init.body);return Response.json({...event,...patch});} return Response.json(init?.method==="GET" ? event : {items:[event]}); });
 expect(Date.parse(patch.start.dateTime)).toBe(Date.parse(event.start.dateTime));
 expect(db.rows[0].start_at).toBe("2026-10-12T10:30:00.000Z");
});
it("keeps a newer contact change pending when it arrives during a Google update", async () => {
 const db=database(true);
 const out=await sync()(db,config,async(_url:string,init:any)=> { if(init?.method==="PATCH"){db.rows[0].student_email="latest@example.test";return Response.json(event);} return Response.json(init?.method==="GET" ? event : {items:[event]}); });
 expect(db.rows[0].google_sync_error).toBe("contact_update_pending");expect(out.errors.length).toBe(1);
});
it("imports a linked group lesson's changed time", async () => {
 const db=database(false,[{id:"s",google_event_id:"group-event",starts_at:"2026-10-12T13:30:00Z",ends_at:"2026-10-12T14:30:00Z"}]);
 const out=await sync()(db,config,async()=>Response.json({items:[event,{...event,id:"group-event"}]}));
 expect(db.sessions[0].starts_at).toBe("2026-10-12T10:30:00.000Z");expect(out.unmatched).toEqual([]);
});
it("a second contact retry removes the first edited attendee and preserves unrelated guests", async () => {
 const db=database(true); let google:any=structuredClone(event);let first=true;
 const request=async(_url:string,init:any)=>{if(init?.method==="PATCH"){google={...google,...JSON.parse(init.body)};if(first){first=false;db.rows[0].student_email="latest@example.test";}return Response.json(google);}return Response.json(init?.method==="GET"?google:{items:[google]});};
 await sync()(db,config,request); await sync()(db,config,request);
 expect(google.attendees.map((a:any)=>a.email)).toEqual(["latest@example.test","other@example.test"]);
});
it("keeps a saved lesson without a Google link visibly unresolved", async () => {
 const db=database();db.rows[0].google_event_id=null;const out=await sync()(db,config,async()=>Response.json({items:[]}));
 expect(out.errors.length).toBe(1);expect(db.rows[0].google_event_id).toBeNull();
});
