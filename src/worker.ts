import {pool,query} from "./db.js";
import {handleEvent,dispatchOutbox} from "./service.js";
import type {LineEvent} from "./line.js";
// Optional recovery worker. A production installation should run exactly one recovery scheduler.
let stop=false;process.on("SIGTERM",()=>{stop=true;});
while(!stop){try{const results=await query<{event_id:string}>("SELECT event_id FROM webhook_events WHERE processed_at IS NULL AND error IS NOT NULL ORDER BY received_at LIMIT 10");if(results.rowCount)console.warn("Webhook errors require operator review:",results.rows.map(r=>r.event_id));await dispatchOutbox();}catch(err){console.error("worker",err);}await new Promise(resolve=>setTimeout(resolve,3000));}await pool.end();
