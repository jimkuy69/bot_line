# คู่มือ LINE AI Smart Admin (ทดสอบ)

## สถานะ
- OpenAI / LINE API token: ตรวจสิทธิ์ HTTP 200 แล้ว ไม่ได้แปลว่าส่งข้อความหรือสร้างคำตอบผ่าน
- ระบบยังไม่เปิดใช้งานกับลูกค้าจริง; AUTO_REPLY_ENABLED=false
- PostgreSQL localhost:5432 ยังไม่ยอมรับรหัส (28P01); ต้องแก้ด้วยข้อมูลบัญชีฐานข้อมูลที่ถูกต้อง
- Docker Desktop daemon ยังไม่ทำงาน
- ห้ามส่งคีย์หรือไฟล์ .env ให้ใคร และห้าม commit ขึ้น GitHub

## เปิดโปรเจกต์
เปิด VS Code: C:\Users\ADMIN\bot_line_build
Repository: https://github.com/jimkuy69/bot_line
เปิด PowerShell ในโฟลเดอร์ แล้วรัน:
```powershell
npm install
npm run typecheck
npm test
npm run build
```
อย่ารัน migrate จนกว่า DATABASE_URL จะชี้ฐานข้อมูลว่างเฉพาะโปรเจกต์ และผ่านการทวนชื่อฐานข้อมูล/สิทธิ์เรียบร้อย เนื่องจาก migration จะเปลี่ยน schema

## ตั้งค่า .env
คัดลอก .env.example เป็น .env แล้วใส่ OPENAI_API_KEY, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, DATABASE_URL และ ADMIN_API_KEY (สร้างแบบสุ่มไว้แล้วในเครื่องนี้); ห้ามเปิดเผยค่า.
AUTO_REPLY_ENABLED=false จนกว่าจะตรวจครบ

## การเปิดเซิร์ฟเวอร์ทดสอบ (หลังฐานข้อมูลพร้อม)
```powershell
npm run db:migrate
npm run dev
```
Worker แยกหน้าต่าง หลัง npm run build:
```powershell
node dist/worker.js
```
Health: http://127.0.0.1:3000/health
Ready: http://127.0.0.1:3000/ready
Dashboard: http://127.0.0.1:3000/dashboard

## การใช้ Dashboard
กรอก Admin API Key จาก .env ลงช่อง Connect ในหน้าทดสอบบน localhost เท่านั้น
- Conversations: รายการลูกค้า คลิกอ่านบทสนทนา
- Human mode: หยุด AI และให้แอดมินรับช่วง
- AI mode: ส่งคืนให้ AI ตอบ
- Send: ส่งข้อความโดยแอดมินผ่าน outbox (ต้องเปิด outbound และมี Worker; ทดสอบกับบัญชีทดสอบเท่านั้น)
- Escalations: รายการเคสที่ AI ตอบไม่ได้
- Approved FAQ: ใส่คำถามและคำตอบที่อนุมัติแล้ว เพิ่มลงคลังความรู้

## ทดสอบ LINE จริงอย่างปลอดภัย
สร้าง LINE OA ทดสอบแยกจากบัญชีที่มีลูกค้า ก่อนชี้ Webhook ต้องมี HTTPS reverse proxy และ backend ที่ /webhook/line
ตรวจ LINE Verify และข้อความจากบัญชีทดสอบ จากนั้นจึงพิจารณาเปิด AUTO_REPLY_ENABLED=true เฉพาะ OA ทดสอบ
หมายเหตุ: ระบบส่งออกเป็น Push API จึงอาจนับโควตา/มีค่าบริการ
LINE Channel Secret ใช้ตรวจ x-line-signature; ห้ามลง Log ข้อความ Secret/Token

## ข้อจำกัดก่อน Production
- ยังเป็น single OA ไม่ใช่ multi-OA จริง
- Authentication Dashboard ปัจจุบันใช้ static API key ไม่เหมาะเปิด Internet
- ยังไม่มี end-to-end test กับ PostgreSQL / LINE reply / OpenAI generation
- การกู้คืนงานกลางคัน, concurrent workers, deletion/retention, audit coverage, rate limit และ security tests ยังต้องทำเพิ่ม
- ไม่รวมการเงิน
