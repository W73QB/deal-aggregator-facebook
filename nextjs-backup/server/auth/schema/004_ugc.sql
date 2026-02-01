-- =====================================================
-- M3.3 UGC (User-Generated Content) Database Schema
-- DealRadarUS - Reviews, Ratings, Comments & Reports
-- =====================================================

-- Drop existing objects if they exist (for development)
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE; 
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS content_type;
DROP FUNCTION IF EXISTS calculate_avg_rating(UUID);
DROP FUNCTION IF EXISTS update_deal_rating_stats();

-- Create custom types
CREATE TYPE content_type AS ENUM ('review', 'comment');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'dismissed', 'action_taken');

-- Reviews table - user reviews for deals/products
CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deal_id         TEXT NOT NULL, -- External deal ID from marketplace
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  is_verified     BOOLEAN NOT NULL DEFAULT false, -- Verified purchase
  is_approved     BOOLEAN NOT NULL DEFAULT true,  -- Moderation status
  helpful_count   INTEGER NOT NULL DEFAULT 0,
  total_votes     INTEGER NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}',    -- Purchase date, price paid, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT reviews_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  CONSTRAINT reviews_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),
  CONSTRAINT reviews_user_deal_unique UNIQUE (user_id, deal_id)
);

-- Comments table - threaded comments on reviews and deals
CREATE TABLE IF NOT EXISTS public.comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deal_id         TEXT, -- Deal ID (if top-level comment)
  review_id       UUID REFERENCES public.reviews(id) ON DELETE CASCADE, -- Parent review
  parent_id       UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Thread parent
  content         TEXT NOT NULL,
  is_approved     BOOLEAN NOT NULL DEFAULT true,
  helpful_count   INTEGER NOT NULL DEFAULT 0,
  total_votes     INTEGER NOT NULL DEFAULT 0,
  is_deleted      BOOLEAN NOT NULL DEFAULT false, -- Soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT comments_content_length CHECK (char_length(content) >= 3 AND char_length(content) <= 2000),
  CONSTRAINT comments_target_check CHECK (deal_id IS NOT NULL OR review_id IS NOT NULL)
);

-- Reports table - abuse/spam reporting system
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type    content_type NOT NULL,
  content_id      UUID NOT NULL, -- Review or comment ID
  reason          TEXT NOT NULL,
  description     TEXT,
  status          report_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  action_taken    TEXT, -- Description of moderation action
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT reports_reason_length CHECK (char_length(reason) >= 5 AND char_length(reason) <= 100),
  CONSTRAINT reports_description_length CHECK (description IS NULL OR char_length(description) <= 1000),
  CONSTRAINT reports_unique_user_content UNIQUE (reporter_id, content_type, content_id)
);

-- Deal statistics table - aggregated stats for deals
CREATE TABLE IF NOT EXISTS public.deal_stats (
  deal_id         TEXT PRIMARY KEY,
  review_count    INTEGER NOT NULL DEFAULT 0,
  avg_rating      DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT deal_stats_rating_range CHECK (avg_rating >= 0.0 AND avg_rating <= 5.0)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Reviews indexes
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_deal_id ON public.reviews(deal_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_reviews_deal_rating ON public.reviews(deal_id, rating, is_approved);
CREATE INDEX idx_reviews_helpful ON public.reviews(helpful_count DESC, total_votes DESC);

-- Full-text search on reviews
CREATE INDEX idx_reviews_content_search ON public.reviews 
  USING GIN (to_tsvector('english', title || ' ' || content));

-- Comments indexes  
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_deal_id ON public.comments(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_comments_review_id ON public.comments(review_id) WHERE review_id IS NOT NULL;
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_is_approved ON public.comments(is_approved);
CREATE INDEX idx_comments_is_deleted ON public.comments(is_deleted);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Full-text search on comments
CREATE INDEX idx_comments_content_search ON public.comments 
  USING GIN (to_tsvector('english', content)) WHERE is_deleted = false;

-- Reports indexes
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_content_type_id ON public.reports(content_type, content_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_reviewed_by ON public.reports(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- Deal stats indexes
CREATE INDEX idx_deal_stats_avg_rating ON public.deal_stats(avg_rating DESC);
CREATE INDEX idx_deal_stats_review_count ON public.deal_stats(review_count DESC);
CREATE INDEX idx_deal_stats_last_activity ON public.deal_stats(last_activity DESC);

-- =====================================================
-- POSTGRESQL FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to calculate average rating for a deal
CREATE OR REPLACE FUNCTION calculate_avg_rating(p_deal_id TEXT)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(ROUND(AVG(rating), 2), 0.0)
  INTO avg_rating
  FROM public.reviews
  WHERE deal_id = p_deal_id AND is_approved = true;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to update deal statistics
CREATE OR REPLACE FUNCTION update_deal_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.deal_stats (deal_id, review_count, avg_rating, last_activity)
    VALUES (
      NEW.deal_id,
      (SELECT COUNT(*) FROM public.reviews WHERE deal_id = NEW.deal_id AND is_approved = true),
      calculate_avg_rating(NEW.deal_id),
      NOW()
    )
    ON CONFLICT (deal_id)
    DO UPDATE SET
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE deal_id = NEW.deal_id AND is_approved = true),
      avg_rating = calculate_avg_rating(NEW.deal_id),
      last_activity = NOW(),
      updated_at = NOW();
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.deal_stats (deal_id, review_count, avg_rating, last_activity)
    VALUES (
      OLD.deal_id,
      (SELECT COUNT(*) FROM public.reviews WHERE deal_id = OLD.deal_id AND is_approved = true),
      calculate_avg_rating(OLD.deal_id),
      NOW()
    )
    ON CONFLICT (deal_id)
    DO UPDATE SET
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE deal_id = OLD.deal_id AND is_approved = true),
      avg_rating = calculate_avg_rating(OLD.deal_id),
      last_activity = NOW(),
      updated_at = NOW();
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment count for deals
CREATE OR REPLACE FUNCTION update_deal_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update for deal comments
    IF NEW.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_stats (deal_id, comment_count, last_activity)
      VALUES (
        NEW.deal_id,
        (SELECT COUNT(*) FROM public.comments WHERE deal_id = NEW.deal_id AND is_approved = true AND is_deleted = false),
        NOW()
      )
      ON CONFLICT (deal_id)
      DO UPDATE SET
        comment_count = (SELECT COUNT(*) FROM public.comments WHERE deal_id = NEW.deal_id AND is_approved = true AND is_deleted = false),
        last_activity = NOW(),
        updated_at = NOW();
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- Update for deal comments
    IF OLD.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_stats (deal_id, comment_count, last_activity)
      VALUES (
        OLD.deal_id,
        (SELECT COUNT(*) FROM public.comments WHERE deal_id = OLD.deal_id AND is_approved = true AND is_deleted = false),
        NOW()
      )
      ON CONFLICT (deal_id)
      DO UPDATE SET
        comment_count = (SELECT COUNT(*) FROM public.comments WHERE deal_id = OLD.deal_id AND is_approved = true AND is_deleted = false),
        last_activity = NOW(),
        updated_at = NOW();
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-update deal statistics when reviews change
CREATE TRIGGER trigger_reviews_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_rating_stats();

-- Trigger to auto-update deal comment stats
CREATE TRIGGER trigger_comments_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_comment_stats();

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_deal_stats_updated_at
  BEFORE UPDATE ON public.deal_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- INITIAL DATA & CONFIGURATION
-- =====================================================

-- Create some sample deal stats for testing
INSERT INTO public.deal_stats (deal_id, review_count, avg_rating, comment_count) VALUES
('test-deal-1', 0, 0.0, 0),
('test-deal-2', 0, 0.0, 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCHEMA VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('reviews', 'comments', 'reports', 'deal_stats');
  
  IF table_count = 4 THEN
    RAISE NOTICE '✅ All 4 UGC tables created successfully';
  ELSE
    RAISE EXCEPTION '❌ Expected 4 UGC tables, found %', table_count;
  END IF;
END
$$;

-- Verify functions were created
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN ('calculate_avg_rating', 'update_deal_rating_stats', 'update_deal_comment_stats', 'set_updated_at');
  
  IF function_count = 4 THEN
    RAISE NOTICE '✅ All 4 UGC functions created successfully';
  ELSE
    RAISE NOTICE '⚠️  Expected 4 UGC functions, found %', function_count;
  END IF;
END
$$;

-- Verify triggers were created
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
  AND event_object_table IN ('reviews', 'comments', 'reports', 'deal_stats');
  
  IF trigger_count >= 6 THEN
    RAISE NOTICE '✅ All UGC triggers created successfully (% total)', trigger_count;
  ELSE
    RAISE NOTICE '⚠️  Expected 6+ UGC triggers, found %', trigger_count;
  END IF;
END
$$;

RAISE NOTICE '🎉 M3.3 UGC Database Schema Migration Completed Successfully!';