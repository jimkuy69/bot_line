import {query} from "./db.js";
import {config} from "./config.js";
export type DeliveryResult={outcome:"sent"|"duplicate"|"retry"|"permanent"|"uncertain";status?:number};
export async function deliver(to:string,text:string,id:string):Promise<DeliveryResult>{
 if(!config.LINE_CHANNEL_ACCESS_TOKEN)return {outcome:"permanent"};
 try{
 const r=await fetch("https://api.line.me/v2/bot/message/push",{method:"POST",headers:{"Authorization":"Bearer "+config.LINE_CHANNEL_ACCESS_TOKEN,"Content-Type":"application/json","X-Line-Retry-Key":id},body:JSON.stringify({to,messages:[{type:"text",text:text.slice(0,5000)}]}),signal:AbortSignal.timeout(10000)});
 if(r.ok)return {outcome:"sent",status:r.status};
 if(r.status===409&&r.headers.has("x-line-accepted-request-id"))return {outcome:"duplicate",status:409};
 if(r.status===429||r.status>=500)return {outcome:"retry",status:r.status};
 return {outcome:"permanent",status:r.status};
 }catch{return {outcome:"uncertain"};}
}
export async function dispatchOutbox(){
 if(config.AUTO_REPLY_ENABLED!=="true"||config.AI_MODE==="mock")return 0;
 const rows=await query<{id:string;target_user_id:string;body:string;created_at:Date}>("UPDATE outbox SET status='SENDING',claimed_at=now(),attempts=attempts+1 WHERE id IN (SELECT id FROM outbox WHERE ((status='PENDING' AND next_attempt_at<=now()) OR (status='SENDING' AND claimed_at<now()-interval '2 minutes')) AND attempts<4 AND created_at>now()-interval '23 hours' ORDER BY created_at LIMIT 15 FOR UPDATE SKIP LOCKED) RETURNING id,target_user_id,body,created_at");
 let sent=0;
 for(const row of rows.rows){
 const result=await deliver(row.target_user_id,row.body,row.id);
 const status=result.outcome==="sent"||result.outcome==="duplicate"?"SENT":result.outcome==="retry"||result.outcome==="uncertain"?"PENDING":"FAILED";
 await query("UPDATE outbox SET status=$2,last_error=$3,sent_at=CASE WHEN $2='SENT' THEN now() ELSE sent_at END,claimed_at=NULL,next_attempt_at=now()+interval '30 seconds'*LEAST(attempts*attempts,25) WHERE id=$1",[row.id,status,result.outcome+(result.status?":"+result.status:"")]);
 await query("INSERT INTO delivery_attempts(outbox_id,outcome,status_code) VALUES($1,$2,$3)",[row.id,result.outcome,result.status||null]);
 if(status==="SENT")sent++;
 }
 return sent;
}
