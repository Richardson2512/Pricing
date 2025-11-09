-- Create system_logs table for structured logging
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  category TEXT NOT NULL CHECK (category IN ('user_action', 'payment', 'api_call', 'scraping', 'auth', 'system')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs (no public access)
DROP POLICY IF EXISTS "Only admins can read system logs" ON system_logs;
CREATE POLICY "Only admins can read system logs" ON system_logs
  FOR SELECT USING (false); -- No public access, only service_role

-- System can insert logs (service_role only)
DROP POLICY IF EXISTS "System can insert logs" ON system_logs;
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true); -- Service role can insert

COMMENT ON TABLE system_logs IS 'System-wide structured logging for debugging and monitoring';
COMMENT ON COLUMN system_logs.level IS 'Log level: info, warn, error, debug';
COMMENT ON COLUMN system_logs.category IS 'Log category: user_action, payment, api_call, scraping, auth, system';
COMMENT ON COLUMN system_logs.message IS 'Human-readable log message';
COMMENT ON COLUMN system_logs.user_id IS 'Associated user (if applicable)';
COMMENT ON COLUMN system_logs.metadata IS 'Additional structured data (JSON)';

