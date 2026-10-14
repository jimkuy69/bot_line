import "dotenv/config";
import {randomUUID} from "node:crypto";
import {query,pool} from "../src/db.js";
import {handleEvent} from "../src/service.js";
import {config} from "../src/config.js";
import type {LineEvent} from "../src/line.js";
function ok(v:unknown,label:string){if(!v)throw Error("FAIL "+label);console.log("PASS "+label);}
if(config.AI_MODE!=="mock"||config.AUTO_REPLY_ENABLED!=="false")throw Error("Safe mock config required");
const uri=new URL(config.DATABASE_URL);
if(uri.hostname!=="127.0.0.1"||uri.port!=="55432"||uri.pathname!=="/lineai_test")throw Error("Test database guard");
const user="mock-test-"+randomUUID(),eventId=randomUUID();
const event:LineEvent={type:"message",webhookEventId:eventId,source:{type:"user",userId:user},message:{type:"text",id:"mock-msg-"+eventId,text:"ขอคุยกับแอดมินครับ"}};
try{
 await query("INSERT INTO webhook_events(event_id,payload) VALUES($1,$2::jsonb)",[eventId,JSON.stringify(event)]);
 await handleEvent(event);
 const r=await query<{mode:string;id:string}>("SELECT c.id,c.mode FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1",[user]);
 ok(r.rows[0]?.mode==="HUMAN","handoff mode HUMAN");
 const id=r.rows[0]!.id;
 const cases=await query<{summary:string}>("SELECT summary FROM support_cases WHERE conversation_id=$1",[id]);
 ok(cases.rowCount===1&&cases.rows[0]!.summary.startsWith("[MOCK SUMMARY]"),"one stored mock summary/case");
 const msgs=await query<{sender:string}>("SELECT sender FROM messages WHERE conversation_id=$1",[id]);
 ok(msgs.rows.filter(x=>x.sender==="USER").length===1&&msgs.rows.filter(x=>x.sender==="AI").length===1,"inbound and mock answer stored");
 await handleEvent(event);
 const again=await query<{total:string}>("SELECT count(*)::text total FROM messages WHERE conversation_id=$1",[id]);
 ok(Number(again.rows[0]!.total)===2,"duplicate event does not duplicate messages");
 const outbound=await query<{status:string}>("SELECT status FROM outbox WHERE dedupe_key=$1",[eventId+":customer"]);
 ok(outbound.rows[0]?.status==="PENDING","outbox queued not sent");
 const state=await query<{processed_at:Date}>("SELECT processed_at FROM webhook_events WHERE event_id=$1",[eventId]);
 ok(Boolean(state.rows[0]?.processed_at),"webhook marked processed");
 console.log("MOCK_E2E=PASS (no OpenAI or LINE network requests)");
}finally{
 await query("DELETE FROM outbox WHERE dedupe_key LIKE $1",[eventId+":%"]);
 await query("DELETE FROM support_cases WHERE conversation_id IN (SELECT c.id FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1)",[user]);
 await query("DELETE FROM summaries WHERE conversation_id IN (SELECT c.id FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1)",[user]);
 await query("DELETE FROM messages WHERE conversation_id IN (SELECT c.id FROM conversations c JOIN contacts t ON t.id=c.contact_id WHERE t.line_user_id=$1)",[user]);
 await query("DELETE FROM conversations WHERE contact_id IN (SELECT id FROM contacts WHERE line_user_id=$1)",[user]);
 await query("DELETE FROM contacts WHERE line_user_id=$1",[user]);
 await query("DELETE FROM webhook_events WHERE event_id=$1",[eventId]);
 await pool.end();
}
