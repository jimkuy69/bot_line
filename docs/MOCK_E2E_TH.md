# Mock E2E verification — 2026-10-15
Test database: isolated PostgreSQL lineai_test, 127.0.0.1:55432.
Run with local environment AI_MODE=mock, AUTO_REPLY_ENABLED=false:
```powershell
$env:AI_MODE='mock'; $env:AUTO_REPLY_ENABLED='false'; npx tsx scripts/test-mock-e2e.ts
```
PASS: handoff HUMAN, stored mock summary/case, inbound+AI message, duplicate event suppression, outbox PENDING, webhook processed. Synthetic records deleted after test.
Mock does not call OpenAI; delivery is disabled in mock mode.
**Limitations:** happy-path only; test invokes handleEvent directly rather than HTTP signature+worker processing, so webhook-to-worker end-to-end is not yet verified. Error recovery, concurrency, idempotence after partial failure, and multi-OA isolation still need coverage. Keep AUTO_REPLY_ENABLED=false; do not use production.
