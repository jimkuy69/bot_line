# การทดสอบเชื่อมต่อจริง — 15 ตุลาคม 2026 (เวลาไทย)
 
## ผลการตรวจ
- เครื่อง DESKTOP-8FVIJGT: Remote Desktop Commander Online
- OpenAI GET /v1/models: HTTP 200, คีย์ยืนยันตัวตนผ่าน
- OpenAI Responses API สร้างข้อความ: HTTP 429, code=credit_balance_exhausted (ไม่สำเร็จ; ต้องตรวจเครดิต/วงเงินใน OpenAI Platform)
- LINE GET /v2/bot/info: HTTP 200, Channel Access Token ใช้ได้
- PostgreSQL: service version 16 และ 18 ทำงานอยู่ แต่ DATABASE_URL (localhost:5432, user lineai, database lineai) ได้ error=28P01 รหัสผ่าน/สิทธิ์ไม่ถูกต้อง
- Docker CLI ติดตั้งแล้ว แต่ Docker Desktop Linux Engine ยังไม่ทำงาน
- LINE Webhook HTTPS และ LINE ส่งข้อความจริง: ยังไม่ได้ทดสอบ; AUTO_REPLY_ENABLED=false

## แหล่งอ้างอิง LINE
- https://developers.line.biz/en/docs/messaging-api/receiving-messages/
- https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
- https://developers.line.biz/en/docs/messaging-api/verify-webhook-url/
- https://developers.line.biz/en/reference/messaging-api/

## สิ่งที่ต้องทำก่อน E2E
1. ตรวจ OpenAI Platform Billing / Credits และการตั้งค่า Usage Limits แล้วทดสอบ Responses API อีกครั้ง
2. ยืนยันสิทธิ์และรหัส PostgreSQL ให้ DATABASE_URL ชี้ฐานข้อมูลทดสอบแยกจากโปรเจกต์อื่น ห้ามรีเซ็ตรหัสฐานข้อมูลร่วมโดยไม่ตรวจผลกระทบ
3. เมื่อฐานข้อมูลทดสอบพร้อม ค่อย migrate แล้วตรวจ /ready, ตาราง, Event persistence
4. ตั้งค่า HTTPS callback กับ LINE OA **ทดสอบแยก** จาก Production; ตรวจ webhook signature, Verify empty events, dedup
5. ทดสอบการส่ง Reply/Push และ human handoff อย่างจำกัด
6. ตัดสินใจเรื่องข้อมูลส่วนบุคคล: การเก็บ แสดง ลบ และระยะเก็บ
7. ทดสอบความปลอดภัย/ความทนทานและระบบแอดมินก่อน Production

## ข้อควรระวัง
อย่า Push .env หรือส่งคีย์ผ่านแชท ไม่มีการเปลี่ยนรหัสฐานข้อมูลหรือเปิด Auto Reply ในรอบนี้
