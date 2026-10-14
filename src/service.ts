import {query} from "./db.js";
import {decide,summarize} from "./ai.js";
import {knowledgeFor,knowledgeInstructions} from "./knowledge.js";
import type {LineEvent} from "./line.js";
import {config} from "./config.js";
import {dispatchOutbox} from "./delivery.js";
export {dispatchOutbox};
export async function handleEvent(event:LineEvent){
 const id=event.webhookEventId;if(!id)return;
 const userId=event.source?.userId;
 if(!userId||event.type!=="message"){await query("UPDATE webhook_events SET processed_at=now() WHERE event_id=$1",[id]);return;}
 const channel="default", contactId=channel+":"+userId;
 await query("INSERT INTO channels(id,name) VALUES($1,'LINE OA') ON CONFLICT DO NOTHING",[channel]);
 await query("INSERT INTO contacts(id,channel_id,line_user_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",[contactId,channel,userId]);
 const conv=await query<{id:string;mode:string}>("INSERT INTO conversations(contact_id) VALUES($1) ON CONFLICT(contact_id) DO UPDATE SET updated_at=now() RETURNING id,mode",[contactId]);
 const c=conv.rows[0]!;
 const content=event.message?.type==="text"?event.message.text?.trim():undefined;
 const text=content||"[Unsupported or empty message: "+(event.message?.type||"unknown")+"]";
 const inserted=await query("INSERT INTO messages(conversation_id,direction,sender,content,line_message_id) VALUES($1,'IN','USER',$2,$3) ON CONFLICT(line_message_id) DO NOTHING RETURNING id",[c.id,text,event.message?.id||id]);
 if(!inserted.rowCount){await query("UPDATE webhook_events SET processed_at=now() WHERE event_id=$1",[id]);return;}
 if(c.mode==="HUMAN"){await query("UPDATE webhook_events SET processed_at=now() WHERE event_id=$1",[id]);return;}
 const rows=await query<{sender:string;content:string}>("SELECT sender,content FROM (SELECT sender,content,created_at,id FROM messages WHERE conversation_id=$1 ORDER BY created_at DESC,id DESC LIMIT 20) t ORDER BY created_at ASC,id ASC",[c.id]);
 const history=rows.rows.map(m=>({role:m.sender==="USER"?"user" as const:"assistant" as const,content:m.content}));
 const cfg=await query<{persona:string;auto_reply:boolean}>("SELECT persona,auto_reply FROM settings WHERE channel_id=$1",[channel]);
 const facts=await knowledgeFor(channel);
 const result=content?await decide(history,cfg.rows[0]?.persona||"",knowledgeInstructions(facts)):{answer:"รับข้อความแล้วครับ ผมจะส่งให้เจ้าหน้าที่ตรวจสอบต่อครับ",escalate:true,reason:"UNSUPPORTED_MESSAGE"};
 // Persist outcomes in a transaction? Message and outbox insertion are idempotent by webhook event ID.
 await query("INSERT INTO messages(conversation_id,direction,sender,content,line_message_id) VALUES($1,'OUT','AI',$2,$3) ON CONFLICT(line_message_id) DO NOTHING",[c.id,result.answer,"ai:"+id]);
 await query("INSERT INTO outbox(dedupe_key,target_user_id,channel_id,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",[id+":customer",userId,channel,result.answer]);
 if(result.escalate){
 const summary=await summarize(history);
 const caseRow=await query<{id:string}>("INSERT INTO support_cases(conversation_id,summary) VALUES($1,$2) ON CONFLICT(conversation_id) WHERE status='OPEN' DO UPDATE SET summary=EXCLUDED.summary RETURNING id",[c.id,summary]);
 await query("INSERT INTO summaries(conversation_id,body) VALUES($1,$2)",[c.id,summary]);
 await query("UPDATE conversations SET mode='HUMAN',updated_at=now() WHERE id=$1",[c.id]);
 if(config.ADMIN_LINE_USER_ID)await query("INSERT INTO outbox(dedupe_key,target_user_id,channel_id,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",[id+":admin",config.ADMIN_LINE_USER_ID,channel,"เคสใหม่ "+caseRow.rows[0]?.id+"\n"+summary.slice(0,2800)]);
 }
 await query("UPDATE webhook_events SET processed_at=now(),error=NULL WHERE event_id=$1",[id]);
}
