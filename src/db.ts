import pg from "pg";
import {config} from "./config.js";
export const pool=new pg.Pool({connectionString:config.DATABASE_URL,max:10});
export async function query<T extends pg.QueryResultRow=pg.QueryResultRow>(sql:string,args:unknown[]=[]){return pool.query<T>(sql,args);}
