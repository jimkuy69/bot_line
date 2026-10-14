import {pool,query} from "./db.js";
import {handleEvent} from "./service.js";
import {dispatchOutbox} from "./delivery.js";
import type {LineEvent} from "./line.js";
let stop=false;process.on("SIGTERM",()=>{stop=true;});
while(!stop){
 try{
  const rows=await query<{event_id:string;payload:LineEvent}>("UPDATE webhook_events SET claimed_at=now(),attempts=attempts+1 WHERE event_id IN (SELECT event_id FROM webhook_events WHERE processed_at IS NULL AND (claimed_at IS NULL OR claimed_at<now()-interval '2 minutes') AND attempts<5 ORDER BY received_at LIMIT 8 FOR UPDATE SKIP LOCKED) RETURNING event_id,payload");
  for(const e of rows.rows){try{await handleEvent(e.payload);}catch(error){console.error("event failed",e.event_id,error);await query("UPDATE webhook_events SET claimed_at=NULL,error=$2 WHERE event_id=$1",[e.event_id,String(error).slice(0,500)]);}}
  await dispatchOutbox();
 }catch(error){console.error("worker failure",error);}
 await new Promise(r=>setTimeout(r,1500));
}
await pool.end();
