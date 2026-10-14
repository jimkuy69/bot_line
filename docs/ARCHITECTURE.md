# Architecture — LINE AI Smart Admin V1

## Goals
- Thai-first OpenAI assistant, conversational context, per-conversation summaries and automatic saved support cases.
- If the assistant is uncertain, escalate to a human; notify via LINE push to a configured admin user.
- No money, payments, claim approval, or financial transaction workflows.
- Do not alter or deploy OLE88.

## Inbound path
LINE OA webhook -> raw body HMAC verification -> durable webhook event -> customer and conversation -> last messages -> OpenAI Responses API with strict JSON schema -> saved AI response -> outbox -> LINE Push API. On escalation, persist summary + case and set conversation mode HUMAN.

## Operator controls
Admin API: view conversations/messages/cases; change AI/HUMAN mode; queue human replies. The MVP uses a static Admin API key suitable only behind a private VPN or local SSH tunnel, NOT public Internet. Replace with sessions, CSRF and RBAC before exposing a public dashboard. All admin access must be logged.

## Limits and follow-up requirements
- This is a runnable baseline, not a production-complete full multi-tenant platform.
- Single LINE OA is configured via environment variables; DB is shaped for future multi-OA support but channel secrets, per-tenant routing and permission isolation are NOT implemented yet.
- Webhook currently acknowledges asynchronous work in memory: unexpected process shutdown after HTTP 200 can leave an event unprocessed; deploy a durable queue consumer/recovery flow before production.
- Outbox defaults to disabled and uses one-shot execution; uncertain delivery requires reconciliation with LINE and safe operator handling, not blind resend.
- AI responses must not be treated as verified facts. Add approved per-OA Knowledge Base before customer launch.
- Reply Tokens are not used by this baseline. All outbound traffic is Push, which is subject to quota, pricing and permission restrictions.
- PostgreSQL row locks must be strengthened for concurrent workers and tenant isolation prior to scaling.
- Configure secrets in private environment storage, never Git.
- Privacy: define retention, consent, deletion requests, encryption, access logging, and data minimization before storing real conversations.
- Do not turn AUTO_REPLY_ENABLED on until staging verification and review.

## Future modules
Tenant isolation, proper admin auth and UI, file knowledge retrieval, image handling, reliable queue processing, observability, retention jobs, audit-based reporting, model and prompt version management, prompt-injection evals, S3 attachments, webhook retry reconciliation.
