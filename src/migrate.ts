import {readFile} from "node:fs/promises";
import {query,pool} from "./db.js";
for(const n of ["001_init.sql","002_features.sql","003_agent_versions.sql"]){const sql=await readFile(new URL("../sql/"+n,import.meta.url),"utf8");await query(sql);console.log("Applied "+n);}await pool.end();
