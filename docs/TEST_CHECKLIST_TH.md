# เช็กลิสต์ก่อนทดสอบจริง

- [x] GitHub repository และชุดโค้ด
- [x] OpenAI credential endpoint HTTP 200
- [x] LINE bot info endpoint HTTP 200
- [x] ตั้ง Admin API Key แบบสุ่มใน .env เฉพาะคอม (ไม่พิมพ์ค่า)
- [x] AUTO_REPLY_ENABLED=false
- [ ] PostgreSQL database URL login ผ่าน (พบ 28P01)
- [ ] ตรวจยืนยันฐานข้อมูลเป็น instance ว่างที่อนุญาตให้ migrate
- [ ] ทำ migration และเช็กตารางจริง
- [ ] ทดสอบ Event persistence, duplicate webhook, transaction recovery
- [ ] ทดสอบ OpenAI สร้างคำตอบภาษาไทยจริง
- [ ] ทดสอบ FAQ retrieval / escalation จริง
- [ ] เปิด Docker Engine หรือเลือก local PostgreSQL ที่ถูกต้อง
- [ ] Staging LINE OA และ HTTPS Webhook
- [ ] ทดสอบ LINE push กับผู้ใช้ทดสอบโดยสมัครใจ
- [ ] ทดสอบ Human inbox, report, log และการกู้คืน
- [ ] เพิ่ม Admin sessions / RBAC / CSRF, tenant isolation, retention ก่อน production

ห้ามถือว่าระบบพร้อมให้บริการเพียงเพราะ typecheck, unit test และ build ผ่าน
