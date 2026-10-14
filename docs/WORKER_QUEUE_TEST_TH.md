# Worker queue test — 2026-10-15

ทดสอบบน PostgreSQL 18, ฐาน lineai_test พอร์ต 55432 เท่านั้น
ใช้ AI_MODE=mock, AUTO_REPLY_ENABLED=false จึงไม่เรียก OpenAI และไม่ส่ง LINE

## ผลตรวจ
- HTTP GET /health: 200
- HTTP POST /webhook/line ไม่มีลายเซ็น: 401
- เปิด worker 2 ตัวพร้อมกันและใส่ Event จำลองลง inbox ฐานข้อมูล: ผ่าน
- Worker อ่าน Event และบันทึกผล: ผ่าน
- ส่งต่อเป็น HUMAN mode: ผ่าน
- ลบข้อมูลทดสอบหลังการตรวจ: สคริปต์มีขั้นตอน cleanup

## ข้อจำกัดที่ยังต้องทำ
- ยังไม่ได้ทดสอบ signed HTTP webhook → persisted inbox → workers ครบในรอบเดียว เพราะชุดทดสอบนี้ใส่ Event เข้า DB โดยตรง
- ยังไม่ได้พิสูจน์ exactly-once เมื่อมี worker หลายตัวแย่ง Event พร้อมกันเป็นจำนวนมาก
- ยังไม่ได้ทดสอบการหยุด worker ระหว่าง transaction, retry หลัง partial failure, crash recovery, outbox concurrency และ quota จริง
- ระบบควรมีฐานข้อมูล transaction ครอบคลุมการบันทึกคำตอบ, เคสและ outbox เพื่อความทนทานก่อน Production
- Admin authentication ยังไม่พร้อมเปิดสาธารณะ
- ไม่แก้ .env และไม่เปิด Auto Reply
