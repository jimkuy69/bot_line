# PostgreSQL Staging / Dashboard verification — 2026-10-15
- Isolated PostgreSQL 18 cluster: `.local-pg/` on 127.0.0.1:55432; DB `lineai_test`. Existing services on 5432 untouched.
- Local credentials only in ignored `.env`. Prior env copy in ignored `.local-secrets/`.
- Authenticated DB connection: PASS.
- Migrations 001, 002, 003: PASS.
- HTTP /health 200, /ready 200, /dashboard 200.
- Admin API (local): get agent 200, save draft 200, mock preview 200 (escalation true for admin request), publish 200, rollback 200, create FAQ 201.
- Initial Publish failed due to empty JSON request body; fixed parser to accept empty JSON as {}.
- Server bound to 127.0.0.1 only for local staging.
- Important: AI generation unavailable until OpenAI API credits, LINE webhook not connected, no live LINE pushes, AUTO_REPLY_ENABLED=false.
- Static Admin API Key and single-OA architecture are NOT production-ready.
## Starting the isolated database
```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D 'C:\Users\ADMIN\bot_line_build\.local-pg' -l 'C:\Users\ADMIN\bot_line_build\.local-secrets\postgres.log' -o '-h 127.0.0.1 -p 55432' -w start
```
Then `npm run dev`; view `http://127.0.0.1:3000/dashboard`.
Never rerun `setup-local-db.ps1` or `recover-local-db.ps1` on an initialized database. The recovery helper temporarily changes local PostgreSQL authentication and is not an operational startup script.
