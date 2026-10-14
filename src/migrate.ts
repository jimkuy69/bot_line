import {readFile} from "node:fs/promises";
import {query,pool} from "./db.js";
const sql=await readFile(new URL("../sql/001_init.sql",import.meta.url),"utf8");
await query(sql);console.log("Migration applied");await pool.end();
