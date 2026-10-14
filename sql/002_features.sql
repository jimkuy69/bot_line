CREATE TABLE IF NOT EXISTS knowledge_entries(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),channel_id text NOT NULL REFERENCES channels(id),question text NOT NULL,answer text NOT NULL,enabled boolean NOT NULL DEFAULT true,updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS knowledge_channel_idx ON knowledge_entries(channel_id,enabled);
CREATE UNIQUE INDEX IF NOT EXISTS support_case_open_idx ON support_cases(conversation_id) WHERE status='OPEN';
ALTER TABLE outbox ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE outbox ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
ALTER TABLE outbox ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE IF NOT EXISTS settings(channel_id text PRIMARY KEY REFERENCES channels(id),persona text NOT NULL DEFAULT 'You are a helpful Thai support assistant.',auto_reply boolean NOT NULL DEFAULT false,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS delivery_attempts(id bigserial PRIMARY KEY,outbox_id uuid NOT NULL REFERENCES outbox(id),outcome text NOT NULL,status_code integer,created_at timestamptz NOT NULL DEFAULT now());
