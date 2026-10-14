import "dotenv/config";
import {z} from "zod";
const schema=z.object({DATABASE_URL:z.string().min(1),OPENAI_API_KEY:z.string().default(""),OPENAI_MODEL:z.string().default("gpt-4.1-mini"),LINE_CHANNEL_SECRET:z.string().default(""),LINE_CHANNEL_ACCESS_TOKEN:z.string().default(""),ADMIN_API_KEY:z.string().default(""),ADMIN_LINE_USER_ID:z.string().default(""),PORT:z.coerce.number().int().default(3000),AUTO_REPLY_ENABLED:z.enum(["true","false"]).default("false"),AI_MODE:z.enum(["live","mock"]).default("live")});
export const config=schema.parse(process.env);
export const lineEnabled=Boolean(config.LINE_CHANNEL_SECRET&&config.LINE_CHANNEL_ACCESS_TOKEN);
