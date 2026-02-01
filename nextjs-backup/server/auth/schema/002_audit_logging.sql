-- DealRadarUS - Audit Logging Schema
-- Migration: 002_audit_logging.sql  
-- Date: 2025-08-27
-- Purpose: Add email events and auth audit logging tables

-- Email events table - tracks all email activities
CREATE TABLE IF NOT EXISTS public.email_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message_id    TEXT,
  email_type    TEXT NOT NULL CHECK (email_type IN ('verification', 'password_reset', 'welcome', 'notification')),
  recipient     CITEXT NOT NULL,
  subject       TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'bounced')),
  error_message TEXT,
  duration_ms   INTEGER,
  smtp_response TEXT,
  template_used TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auth audit table - tracks authentication activities
CREATE TABLE IF NOT EXISTS public.auth_audit (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email      CITEXT,
  action     TEXT NOT NULL CHECK (action IN ('signup', 'login', 'logout', 'refresh', 'verify_email', 'forgot_password', 'reset_password', 'failed_login')),
  status     TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  error_code TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON public.email_events (user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON public.email_events (email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON public.email_events (status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events (created_at);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON public.auth_audit (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_email ON public.auth_audit (email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_action ON public.auth_audit (action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip_address ON public.auth_audit (ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON public.auth_audit (created_at);

-- Trigger for updating updated_at timestamp on email_events
DROP TRIGGER IF EXISTS trigger_update_email_events_updated_at ON public.email_events;
CREATE TRIGGER trigger_update_email_events_updated_at
    BEFORE UPDATE ON public.email_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.email_events IS 'Email activity tracking for all system emails';
COMMENT ON TABLE public.auth_audit IS 'Authentication and authorization audit log';

COMMENT ON COLUMN public.email_events.email_type IS 'Type: verification, password_reset, welcome, notification';
COMMENT ON COLUMN public.email_events.status IS 'Status: queued, sent, delivered, failed, bounced';
COMMENT ON COLUMN public.auth_audit.action IS 'Action: signup, login, logout, refresh, verify_email, forgot_password, reset_password, failed_login';
COMMENT ON COLUMN public.auth_audit.metadata IS 'Additional context data as JSON';

-- Sample queries for monitoring (commented)
/*
-- Recent failed login attempts by IP
SELECT ip_address, COUNT(*) as attempts, MAX(created_at) as latest_attempt 
FROM public.auth_audit 
WHERE action = 'failed_login' AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address 
ORDER BY attempts DESC;

-- Email delivery success rate by type
SELECT email_type, 
       COUNT(*) as total_emails,
       COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
       ROUND(COUNT(*) FILTER (WHERE status = 'sent') * 100.0 / COUNT(*), 2) as success_rate
FROM public.email_events 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY email_type;
*/