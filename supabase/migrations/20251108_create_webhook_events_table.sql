-- Create webhook_events table for Dodo Payments webhook tracking and idempotency

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for fast webhook ID lookups (idempotency check)
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage webhook events
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE webhook_events IS 'Tracks Dodo Payments webhook events for idempotency and audit trail';
COMMENT ON COLUMN webhook_events.webhook_id IS 'Unique webhook ID from Dodo Payments (prevents duplicate processing)';
COMMENT ON COLUMN webhook_events.event_type IS 'Event type (e.g., payment.succeeded, payment.failed)';
COMMENT ON COLUMN webhook_events.payload IS 'Full webhook payload for debugging and audit';

