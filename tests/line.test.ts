import {describe,it,expect,vi,beforeAll} from "vitest";
import {createHmac} from "node:crypto";
let verifySignature:(body:Buffer,signature:string|undefined,secret?:string)=>boolean;
beforeAll(async()=>{vi.stubEnv("DATABASE_URL","postgres://test:test@localhost:5432/lineai_test");({verifySignature}=await import("../src/line.js"));});
describe("LINE signature",()=>{
it("accepts valid raw body signatures",()=>{const raw=Buffer.from('{"events":[]}');const key="secret";const sig=createHmac("sha256",key).update(raw).digest("base64");expect(verifySignature(raw,sig,key)).toBe(true);});
it("rejects invalid signature",()=>{expect(verifySignature(Buffer.from("{}"),"bad","secret")).toBe(false);});
it("rejects missing secret",()=>{expect(verifySignature(Buffer.from("{}"),"abc","")).toBe(false);});
});
