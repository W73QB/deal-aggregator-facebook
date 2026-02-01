-- M3.6 User Notifications & Alerts Delivery
-- Migration: 2025-08-28-m36-notifications.sql
-- Purpose: Create notification system tables for multi-channel delivery

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table 1: notifications
-- Core notification records with delivery tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'webhook', 'in_app')),
    template TEXT NOT NULL,
    payload_json JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    dedup_key TEXT,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Indexes for performance
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status_created ON notifications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_dedup_key ON notifications(dedup_key) WHERE dedup_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_idempotency ON notifications(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_dedup_recent ON notifications(dedup_key, created_at);

-- =====================================================
-- Table 2: notification_preferences  
-- User-specific notification settings
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    webhook_enabled BOOLEAN DEFAULT false,
    digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'never')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'UTC',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- Table 3: alert_queue
-- Scheduled alerts waiting for delivery
-- =====================================================

CREATE TABLE IF NOT EXISTS alert_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    filter_id UUID,
    type TEXT NOT NULL CHECK (type IN ('immediate', 'digest', 'system')),
    payload_json JSONB NOT NULL DEFAULT '{}',
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    priority INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    attempts INT DEFAULT 0,
    lock_token TEXT,
    dedup_key TEXT,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT alert_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT alert_queue_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES saved_filters(id) ON DELETE SET NULL
);

-- Indexes for alert_queue table
CREATE INDEX IF NOT EXISTS idx_alert_queue_pending_scheduled ON alert_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_alert_queue_user_id_created ON alert_queue(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_queue_dedup_key ON alert_queue(dedup_key) WHERE dedup_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alert_queue_processing_lock ON alert_queue(status, lock_token) WHERE status = 'processing';

-- =====================================================
-- Table 4: webhook_endpoints
-- User-configured webhook URLs for notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT webhook_endpoints_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT webhook_endpoints_url_check CHECK (url ~ '^https?://')
);

-- Index for webhook_endpoints table
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(active) WHERE active = true;

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alert_queue_updated_at ON alert_queue;
CREATE TRIGGER update_alert_queue_updated_at
    BEFORE UPDATE ON alert_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhook_endpoints_updated_at ON webhook_endpoints;
CREATE TRIGGER update_webhook_endpoints_updated_at
    BEFORE UPDATE ON webhook_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Default Data
-- =====================================================

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id, email_enabled, webhook_enabled, digest_frequency)
SELECT 
    id as user_id,
    true as email_enabled,
    false as webhook_enabled,
    'immediate' as digest_frequency
FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np WHERE np.user_id = users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Views for reporting and monitoring
-- =====================================================

-- View: Notification delivery statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    channel,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(sent_at, NOW()) - created_at))) as avg_delivery_time_seconds
FROM notifications 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), channel, status
ORDER BY hour DESC, channel, status;

-- View: Alert queue health
CREATE OR REPLACE VIEW alert_queue_health AS
SELECT 
    status,
    priority,
    COUNT(*) as count,
    MIN(scheduled_for) as oldest_scheduled,
    MAX(scheduled_for) as newest_scheduled,
    AVG(attempts) as avg_attempts
FROM alert_queue
GROUP BY status, priority
ORDER BY status, priority;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE notifications IS 'Core notification records with delivery tracking and analytics';
COMMENT ON TABLE notification_preferences IS 'User-specific notification settings and preferences';
COMMENT ON TABLE alert_queue IS 'Scheduled alerts waiting for delivery with retry logic';
COMMENT ON TABLE webhook_endpoints IS 'User-configured webhook URLs for real-time notifications';

COMMENT ON COLUMN notifications.dedup_key IS 'Key for deduplication within ALERT_DEDUP_WINDOW_MIN';
COMMENT ON COLUMN notifications.idempotency_key IS 'Key for idempotent delivery (TTL: ALERT_IDEMPOTENCY_TTL_H)';
COMMENT ON COLUMN alert_queue.lock_token IS 'Distributed lock token for worker coordination';
COMMENT ON COLUMN alert_queue.priority IS 'Higher number = higher priority (0=normal, 1=high, 2=urgent)';

-- Migration completed successfully
SELECT 'M3.6 Notifications migration completed successfully' as result;