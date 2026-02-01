-- M3.7 Performance & Caching Database Optimizations
-- Migration: 2025-08-28-m37-performance-indexes.sql
-- Purpose: Add indexes for optimal cache-enabled query performance

-- =====================================================
-- Reviews Performance Indexes
-- =====================================================

-- Index for deal-specific reviews with sorting options
CREATE INDEX IF NOT EXISTS idx_reviews_deal_sort ON reviews(deal_id, created_at DESC);

-- Index for reviews sorted by helpfulness (most helpful first)
CREATE INDEX IF NOT EXISTS idx_reviews_helpful ON reviews(deal_id, helpful_count DESC, total_votes DESC);

-- Index for reviews by rating (for filtering)
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(deal_id, rating DESC, created_at DESC);

-- Index for user's reviews (for /my-reviews endpoints)
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);

-- Composite index for paginated reviews
CREATE INDEX IF NOT EXISTS idx_reviews_paginated ON reviews(deal_id, created_at DESC, id);

-- =====================================================
-- Comments Performance Indexes  
-- =====================================================

-- Index for comments on deals
CREATE INDEX IF NOT EXISTS idx_comments_deal ON comments(deal_id, created_at ASC);

-- Index for comments on reviews
CREATE INDEX IF NOT EXISTS idx_comments_review ON comments(review_id, created_at ASC);

-- Index for threaded comments (parent-child relationships)
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id, created_at ASC) WHERE parent_id IS NOT NULL;

-- Index for user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id, created_at DESC);

-- Composite index for comment threading with vote counts
CREATE INDEX IF NOT EXISTS idx_comments_threaded ON comments(review_id, parent_id, helpful_count DESC, created_at ASC);

-- =====================================================
-- Reports Performance Indexes
-- =====================================================

-- Index for pending reports (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- Index for reports by content (for moderation)
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id, status);

-- Index for user's reports
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(reporter_id, created_at DESC);

-- Index for admin review queue
CREATE INDEX IF NOT EXISTS idx_reports_admin_queue ON reports(status, created_at ASC) WHERE status IN ('pending', 'reviewing');

-- =====================================================
-- Votes Performance Indexes (if votes table exists)
-- =====================================================

-- Check if votes table exists, create indexes if it does
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'votes') THEN
        -- Index for review votes
        CREATE INDEX IF NOT EXISTS idx_votes_review ON votes(review_id, user_id);
        
        -- Index for comment votes  
        CREATE INDEX IF NOT EXISTS idx_votes_comment ON votes(comment_id, user_id);
        
        -- Index for user's voting history
        CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id, created_at DESC);
    END IF;
END $$;

-- =====================================================
-- Users Performance Indexes (for joins)
-- =====================================================

-- Index for user profile data (commonly joined)
CREATE INDEX IF NOT EXISTS idx_users_profile ON users(id, first_name, last_name, email_verified, created_at);

-- Index for active users (email_verified)
CREATE INDEX IF NOT EXISTS idx_users_active ON users(email_verified, created_at DESC) WHERE email_verified = true;

-- =====================================================
-- Notification System Indexes (M3.6 + M3.7)
-- =====================================================

-- Index for user notifications with status filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status, created_at DESC);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, opened_at, created_at DESC) WHERE opened_at IS NULL;

-- Index for notification delivery tracking
CREATE INDEX IF NOT EXISTS idx_notifications_delivery ON notifications(channel, status, sent_at) WHERE status IN ('sent', 'failed');

-- =====================================================
-- Alert Queue Performance Indexes
-- =====================================================

-- Index for pending alerts processing
CREATE INDEX IF NOT EXISTS idx_alert_queue_processing ON alert_queue(status, scheduled_for ASC) WHERE status IN ('pending', 'processing');

-- Index for alert deduplication
CREATE INDEX IF NOT EXISTS idx_alert_queue_dedup ON alert_queue(user_id, dedup_key, created_at) WHERE dedup_key IS NOT NULL;

-- Index for user alert history
CREATE INDEX IF NOT EXISTS idx_alert_queue_user ON alert_queue(user_id, created_at DESC);

-- =====================================================
-- Full-Text Search Indexes (if needed for search)
-- =====================================================

-- Full-text search on review content (commented out - enable if needed)
-- CREATE INDEX IF NOT EXISTS idx_reviews_search ON reviews USING GIN(to_tsvector('english', title || ' ' || content));

-- Full-text search on comment content (commented out - enable if needed)  
-- CREATE INDEX IF NOT EXISTS idx_comments_search ON comments USING GIN(to_tsvector('english', content));

-- =====================================================
-- Partial Indexes for Performance
-- =====================================================

-- Index only active/published reviews
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(deal_id, created_at DESC) WHERE status = 'published' OR status IS NULL;

-- Index only non-deleted comments
CREATE INDEX IF NOT EXISTS idx_comments_active ON comments(deal_id, created_at ASC) WHERE deleted_at IS NULL;

-- Index only pending/processing notifications
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications(created_at DESC) WHERE status IN ('pending', 'processing');

-- =====================================================
-- Statistics and Analytics Indexes
-- =====================================================

-- Index for review statistics calculations
CREATE INDEX IF NOT EXISTS idx_reviews_stats ON reviews(deal_id, rating, is_verified) WHERE rating IS NOT NULL;

-- Index for comment count statistics
CREATE INDEX IF NOT EXISTS idx_comments_stats ON comments(deal_id) WHERE deleted_at IS NULL;

-- Index for user activity tracking (reviews)
CREATE INDEX IF NOT EXISTS idx_user_activity_reviews ON reviews(user_id, created_at DESC);

-- Index for user activity tracking (comments)
CREATE INDEX IF NOT EXISTS idx_user_activity_comments ON comments(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- Cleanup Old Indexes (if any conflicts)
-- =====================================================

-- Drop any old indexes that might conflict (safely ignore if they don't exist)
DROP INDEX IF EXISTS old_reviews_deal_id_idx;
DROP INDEX IF EXISTS old_comments_review_id_idx;
DROP INDEX IF EXISTS old_reports_status_idx;

-- =====================================================
-- Index Usage Analysis (for monitoring)
-- =====================================================

-- Create a view for index usage monitoring (PostgreSQL specific)
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC, idx_tup_fetch DESC;

-- =====================================================
-- Performance Monitoring
-- =====================================================

-- Enable pg_stat_statements for query performance monitoring
-- (This requires the extension to be installed by a superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- =====================================================
-- Validation Queries
-- =====================================================

-- Verify key indexes are created
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%reviews%' 
    OR indexname LIKE 'idx_%comments%' 
    OR indexname LIKE 'idx_%reports%';
    
    RAISE NOTICE 'Created % performance indexes for M3.7', index_count;
END $$;

-- =====================================================
-- Performance Notes
-- =====================================================

/*
These indexes are optimized for the following query patterns:

1. Reviews:
   - GET /reviews/deal/:dealId?page=1&sort=newest
   - GET /reviews/deal/:dealId?sort=helpful  
   - GET /reviews/user/:userId
   
2. Comments:
   - GET /comments/deal/:dealId
   - GET /comments/review/:reviewId
   - GET /comments/thread/:parentId

3. Reports:
   - GET /reports?status=pending
   - GET /reports/content/:type/:id
   
4. Cache invalidation patterns:
   - reviews:deal:{dealId}:*
   - comments:review:{reviewId}:*
   - reports:queue:*

Index maintenance:
- Indexes will be automatically maintained by PostgreSQL
- Monitor index usage via index_usage_stats view
- Consider REINDEX if performance degrades over time
*/