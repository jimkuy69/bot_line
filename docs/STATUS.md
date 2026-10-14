# Development status — 2026-10-15

Implemented: signed LINE webhook ingestion persisted before acknowledgement, PostgreSQL conversation persistence, OpenAI structured replies with escalation, support summaries, human handoff, admin reply outbox, approved FAQ knowledge entries, browser dashboard, delivery retry keys, Docker/API/worker scaffolding.

## Local setup
1. Install Node 24, PostgreSQL. Make a dedicated TEST database, never a production database.
2. Copy .env.example to .env. Configure DATABASE_URL, ADMIN_API_KEY, and set AUTO_REPLY_ENABLED=false.
3. npm install; npm run db:migrate; npm run typecheck; npm test; npm run build.
4. npm run dev; open http://127.0.0.1:3000/dashboard locally.
5. Start worker separately: node dist/worker.js (after build).
6. To test external webhook, configure HTTPS reverse proxy and isolated LINE test OA only after credentials are set.
7. Store OPENAI_API_KEY and LINE_CHANNEL_SECRET/ACCESS_TOKEN only in local .env (never commit or share in chat).

## Safety / outstanding production blockers
- API key based admin auth is ONLY for private local/staging access; replace with robust sessions, CSRF, RBAC and tenant scoping before public exposure.
- Multi-OA management is NOT implemented; single default LINE channel only.
- A failure partway through an event may result in incomplete event processing because operations aren't a single database transaction. More integration/recovery tests required.
- On delivery, LINE push quota and consent rules apply; keep AUTO_REPLY_ENABLED=false until tests.
- Worker restart/outbox retry recovery uses bounded retries but requires real staging tests for LINE accepted-request-key semantics.
- Must implement end-to-end PostgreSQL integration tests, isolation tests, data retention/deletion, rate limiting, monitoring and adequate secret management before production.
- HTML dashboard is a functional staging UI, not a production-grade customer service console.
- No live OpenAI/LINE calls and no production deployment performed.
- No financial features.
