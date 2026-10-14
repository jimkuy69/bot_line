import "dotenv/config";
import {randomUUID} from "node:crypto";
import {query,pool} from "../src/db.js";
const u=new URL(process.env.DATABASE_URL||"");
if(process.env.AI_MODE!=="mock"||process.env.AUTO_REPLY_ENABLED!=="false"||u.port!=="55432"||u.pathname!=="/lineai_test")throw Error("Unsafe test environment");
const id=randomUUID(),user="worker-test-"+id;
const event={type:"message",webhookEventId:id,source:{type:"user",userId:user},message:{type:"text",id:"msg-"+id,text:"ขอคุยกับเจ้าหน้าที่ครับ"}};
let passed=false;
try{
 await query("INSERT INTO webhook_events(event_id,payload) VALUES($1,$2::jsonb)",[id,JSON.stringify(event)]);
 for(let i=0;i<40;i++){const r=await query<{processed_at:Date|null}>("SELECT processed_at FROM webhook_events WHERE event_id=$1",[id]);if(r.rows[0]?.processed_at){passed=true;break;}await new Promise(r=>setTimeout(r,250));}
 if(!passed)throw Error("Worker did not process event");
 const r=await query<{mode:string}>("SELECT c.mode FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1",[user]);
 if(r.rows[0]?.mode!=="HUMAN")throw Error("No handoff");
 console.log("WORKER_QUEUE=PASS; HUMAN_HANDOFF=PASS");
}finally{
 await query("DELETE FROM outbox WHERE dedupe_key LIKE $1",[id+":%"]);
 const c=await query<{id:string}>("SELECT c.id FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1",[user]);
 for(const row of c.rows){for(const name of ["support_cases","summaries","messages"])await query("DELETE FROM "+name+" WHERE conversation_id=$1",[row.id]);await query("DELETE FROM conversations WHERE id=$1",[row.id]);}
 await query("DELETE FROM contacts WHERE line_user_id=$1",[user]);await query("DELETE FROM webhook_events WHERE event_id=$1",[id]);await pool.end();
}
