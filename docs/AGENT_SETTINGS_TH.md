# ตั้งค่า AI ผ่าน Dashboard (Staging)
1. หลังเชื่อม PostgreSQL **ฐานข้อมูลเฉพาะ bot_line** และรัน migration 001–003 แล้ว เปิดเซิร์ฟเวอร์และเข้า /dashboard ผ่าน localhost
2. ใส่ Admin API Key จาก .env ของเครื่อง (ไม่ส่งคีย์ผ่านแชท)
3. AI Settings: เลือก Model, Persona, Enabled
4. กด Save Draft เพื่อบันทึกแบบร่าง ยังไม่เปลี่ยนการตั้งค่า Published
5. กด Mock Preview เพื่อทดสอบข้อความจำลอง ไม่เรียก OpenAI และ LINE; Mock ไม่ได้พิสูจน์คุณภาพคำตอบจริง
6. กด Publish เพื่อให้ Worker ใช้ค่าโมเดล/Persona/Enabled จากเวอร์ชันนั้น (AUTO_REPLY_ENABLED ใน .env ยังต้องเปิดแยก)
7. กด Rollback ข้างเวอร์ชันเก่าเพื่อเปลี่ยน Published กลับไปใช้เวอร์ชันนั้น
ข้อจำกัด: ยังไม่ได้ทดสอบ Migration/PostgreSQL จริง, ระบบยังเป็นหนึ่ง LINE Channel เท่านั้น, Auth เป็น API Key สำหรับ Staging ไม่เหมาะเผยแพร่ Dashboard ต่อสาธารณะ. อย่าเปิด Production. เครดิต OpenAI ยังไม่พร้อม ทดสอบ Mock ได้เท่านั้น.
