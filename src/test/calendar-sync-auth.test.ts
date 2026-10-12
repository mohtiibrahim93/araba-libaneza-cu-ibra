import { expect, it } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";
const handler = (env:Record<string,string>) => loadEdgeHandler("supabase/functions/calendar-sync/index.ts", {
 "https://esm.sh/@supabase/supabase-js@2":{createClient:()=>({})},"../_shared/calendar-reconciliation.ts":{reconcileCalendar:async()=>({errors:[],updated:0,pushed:0,unmatched:[]})},
},env);
it("fails closed when cron credentials are absent or wrong",async()=>{
 expect((await handler({})(new Request("https://example.test/sync",{method:"POST"}))).status).toBe(403);
 expect((await handler({CRON_SECRET:"synthetic"})(new Request("https://example.test/sync",{method:"POST",headers:{"x-cron-secret":"wrong"}}))).status).toBe(403);
});
it("accepts the existing cron secret and rejects other methods",async()=>{
 const h=handler({CRON_SECRET:"synthetic"});expect((await h(new Request("https://example.test/sync",{method:"POST",headers:{"x-cron-secret":"synthetic"}}))).status).toBe(200);
 expect((await h(new Request("https://example.test/sync"))).status).toBe(405);
});
