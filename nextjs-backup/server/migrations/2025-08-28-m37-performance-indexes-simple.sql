-- M3.7 Performance & Caching Database Optimizations
-- Migration: 2025-08-28-m37-performance-indexes-simple.sql
-- Purpose: Add core performance indexes for cache-enabled queries

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

-- Index for user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id, created_at DESC);

-- =====================================================
-- Reports Performance Indexes
-- =====================================================

-- Index for pending reports (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- Index for reports by content (for moderation)
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id, status);

-- Index for user's reports
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(reporter_id, created_at DESC);

-- =====================================================
-- Users Performance Indexes (for joins)
-- =====================================================

-- Index for user profile data (commonly joined)
CREATE INDEX IF NOT EXISTS idx_users_profile ON users(id, first_name, last_name, email_verified, created_at);

-- =====================================================
-- Partial Indexes for Performance
-- =====================================================

-- Index only published reviews
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(deal_id, created_at DESC) WHERE is_approved = true;

-- Index for review statistics calculations  
CREATE INDEX IF NOT EXISTS idx_reviews_stats ON reviews(deal_id, rating, is_verified) WHERE rating IS NOT NULL;

-- =====================================================
-- Validation
-- =====================================================

-- Verify key indexes are created
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND (indexname LIKE 'idx_%reviews%' 
         OR indexname LIKE 'idx_%comments%' 
         OR indexname LIKE 'idx_%reports%'
         OR indexname LIKE 'idx_%users%');
    
    RAISE NOTICE 'Created % core performance indexes for M3.7', index_count;
END $$;