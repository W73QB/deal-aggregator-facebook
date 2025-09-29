-- Monitoring schema for analytics and error logging

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  event_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id VARCHAR(100),
  url TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events (occurred_at);

CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  fingerprint VARCHAR(100),
  message TEXT NOT NULL,
  stack TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'unknown',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_type VARCHAR(50) NOT NULL,
  context JSONB
);

CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs (severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs (error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs (occurred_at);
