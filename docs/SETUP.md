# Developer setup

1. Install Node.js 22+ and PostgreSQL 15+. Create a dedicated database and minimally privileged database user.
2. Copy .env.example to .env; set DATABASE_URL. Add OpenAI API key and LINE channel secret/token ONLY in private environment variables.
3. npm install
4. npm run db:migrate
5. npm run typecheck && npm test && npm run build
6. npm run dev (local binding 127.0.0.1:3000)
7. Use an HTTPS reverse proxy with raw request body preservation to receive POST /webhook/line.
8. Configure the Webhook URL in a dedicated test LINE OA. Keep AUTO_REPLY_ENABLED=false until webhook and database verification.
9. Configure ADMIN_API_KEY and ADMIN_LINE_USER_ID using private secrets. The /admin endpoints are intended for SSH-tunneled staging ONLY.
10. Test with synthetic users and data; do not connect to customers or production until all items in docs/ARCHITECTURE.md are addressed.

Health endpoint: GET /health. Readiness: GET /ready. The admin API requires X-Admin-Key header. Do not publicly expose this key or /admin routes.

Note: OpenAI API use is charged separately from ChatGPT subscriptions, and LINE Push messages may count toward monthly quotas.
