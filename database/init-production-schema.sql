-- 🏗️ DealRadarUS Production Database Schema
-- ==========================================
-- Basic production-ready schema for deal aggregation platform

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 🏪 DEALS TABLE - Core deal information
-- ==========================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    discount_percentage INTEGER,
    
    -- Product details
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(200),
    condition VARCHAR(50) DEFAULT 'new', -- new, refurbished, open-box
    
    -- Links and sources
    deal_url TEXT NOT NULL,
    image_url TEXT,
    affiliate_url TEXT,
    source_platform VARCHAR(50), -- amazon, facebook, walmart, etc
    source_id VARCHAR(200), -- external platform ID
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'active', -- active, expired, sold_out, draft
    deal_quality_score INTEGER DEFAULT 0, -- 0-100 quality rating
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Timestamps
    deal_start_date TIMESTAMP WITH TIME ZONE,
    deal_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    UNIQUE(source_platform, source_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_price ON deals(price);
CREATE INDEX IF NOT EXISTS idx_deals_discount ON deals(discount_percentage DESC);

-- ==========================================
-- 📱 SOCIAL MEDIA POSTS - Facebook/social tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Platform details
    platform VARCHAR(50) NOT NULL, -- facebook, twitter, instagram
    platform_post_id VARCHAR(200),
    post_url TEXT,
    
    -- Post content
    post_message TEXT NOT NULL,
    post_image_url TEXT,
    hashtags TEXT[], -- Array of hashtags
    
    -- Performance metrics
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    reach_count INTEGER DEFAULT 0,
    
    -- Status
    post_status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, published, failed, deleted
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(platform, platform_post_id)
);

CREATE INDEX IF NOT EXISTS idx_social_posts_deal_id ON social_posts(deal_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(post_status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for);

-- ==========================================
-- 📊 ANALYTICS - Performance tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- page_view, deal_click, email_signup, etc
    event_category VARCHAR(50), -- user_engagement, conversion, traffic
    
    -- Associated entities
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
    
    -- Event data
    user_session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    page_url TEXT,
    
    -- Additional metadata
    event_data JSONB, -- Flexible data storage
    
    -- Geo and device
    country_code CHAR(2),
    device_type VARCHAR(20), -- desktop, mobile, tablet
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_deal_id ON analytics_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(user_session_id);

-- ==========================================
-- 📧 EMAIL SUBSCRIBERS - Newsletter management  
-- ==========================================
CREATE TABLE IF NOT EXISTS email_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Subscriber details
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Preferences
    deal_categories TEXT[], -- Preferred deal categories
    email_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly, instant
    
    -- Status
    subscription_status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    
    -- Tracking
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    last_email_opened_at TIMESTAMP WITH TIME ZONE,
    
    -- Source tracking
    signup_source VARCHAR(50), -- website, facebook, referral
    referrer_url TEXT,
    
    -- Timestamps
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_verified ON email_subscribers(email_verified);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_subscribed_at ON email_subscribers(subscribed_at DESC);

-- ==========================================
-- 🔧 SYSTEM CONFIGURATION - App settings
-- ==========================================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    
    -- Metadata
    is_sensitive BOOLEAN DEFAULT FALSE, -- For secrets/passwords
    category VARCHAR(50), -- facebook, email, analytics, etc
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic production configuration
INSERT INTO system_config (config_key, config_value, config_type, description, category) VALUES
('site_name', 'DealRadarUS', 'string', 'Website name', 'general'),
('site_url', 'https://dealradarus.com', 'string', 'Primary website URL', 'general'),
('facebook_page_id', '698677080003276', 'string', 'Facebook page ID', 'facebook'),
('ga4_measurement_id', 'G-9ZVTTTBD03', 'string', 'Google Analytics 4 measurement ID', 'analytics'),
('recaptcha_site_key', '6LcpALkrAAAAANYUsEs_wFFMyw3qqz0Ce8UJCLzZ', 'string', 'reCAPTCHA v2 site key', 'security'),
('amazon_affiliate_tag', 'dealradarus-20', 'string', 'Amazon Associates affiliate tag', 'monetization'),
('email_from_address', 'deals@dealradarus.com', 'string', 'Default from email address', 'email'),
('deals_per_page', '20', 'number', 'Number of deals to show per page', 'ui'),
('auto_post_to_facebook', 'true', 'boolean', 'Automatically post new deals to Facebook', 'facebook'),
('deal_quality_threshold', '70', 'number', 'Minimum quality score for auto-posting', 'quality')
ON CONFLICT (config_key) DO NOTHING;

-- ==========================================
-- 🔄 UPDATE TRIGGERS - Auto-update timestamps
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 📊 USEFUL VIEWS - Common queries made easy
-- ==========================================

-- Active deals with performance metrics
CREATE OR REPLACE VIEW active_deals_summary AS
SELECT 
    d.id,
    d.title,
    d.price,
    d.original_price,
    d.discount_percentage,
    d.category,
    d.condition,
    d.views_count,
    d.clicks_count,
    d.deal_quality_score,
    d.created_at,
    d.deal_end_date,
    COUNT(sp.id) as social_posts_count,
    COUNT(ae.id) as analytics_events_count
FROM deals d
LEFT JOIN social_posts sp ON d.id = sp.deal_id
LEFT JOIN analytics_events ae ON d.id = ae.deal_id
WHERE d.status = 'active'
    AND (d.deal_end_date IS NULL OR d.deal_end_date > CURRENT_TIMESTAMP)
GROUP BY d.id
ORDER BY d.created_at DESC;

-- Email subscriber statistics
CREATE OR REPLACE VIEW email_stats_summary AS
SELECT 
    subscription_status,
    COUNT(*) as subscriber_count,
    AVG(total_emails_opened::float / NULLIF(total_emails_sent, 0)) as avg_open_rate,
    AVG(total_clicks::float / NULLIF(total_emails_sent, 0)) as avg_click_rate
FROM email_subscribers
GROUP BY subscription_status;

-- ==========================================
-- 💾 SAMPLE DATA - Basic test data
-- ==========================================

-- Insert a few sample deals for testing
INSERT INTO deals (title, description, price, original_price, discount_percentage, category, condition, deal_url, source_platform, source_id) VALUES
('Sample MacBook Air Deal', 'Great condition refurbished MacBook Air with 1-year warranty', 899.99, 1299.99, 31, 'electronics', 'refurbished', 'https://dealradarus.com/deals/macbook-air-sample', 'amazon', 'sample-macbook-001'),
('Smart Home Security Camera', 'Wi-Fi enabled security camera with night vision', 49.99, 79.99, 38, 'smart-home', 'new', 'https://dealradarus.com/deals/security-camera-sample', 'amazon', 'sample-camera-001'),
('Gaming Headset Open Box', 'Professional gaming headset, open box condition', 29.99, 59.99, 50, 'gaming', 'open-box', 'https://dealradarus.com/deals/gaming-headset-sample', 'walmart', 'sample-headset-001')
ON CONFLICT (source_platform, source_id) DO NOTHING;

-- ==========================================
-- ✅ VERIFICATION QUERIES
-- ==========================================

-- Show created tables
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;