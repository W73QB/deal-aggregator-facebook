-- DealRadarUS - Saved Filters & Alerts Schema
-- Migration: 003_saved_filters.sql  
-- Date: 2025-08-27
-- Purpose: Add saved filters and alerts system for M3.2

-- Saved filters table - stores user filter criteria
CREATE TABLE IF NOT EXISTS public.saved_filters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  criteria    JSONB NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT saved_filters_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT saved_filters_user_name_unique UNIQUE (user_id, name)
);

-- Alerts table - stores user alert configurations
CREATE TABLE IF NOT EXISTS public.alerts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filter_id         UUID NOT NULL REFERENCES public.saved_filters(id) ON DELETE CASCADE,
  frequency         TEXT NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT alerts_user_filter_unique UNIQUE (user_id, filter_id)
);

-- Alert deliveries table - tracks individual alert sends
CREATE TABLE IF NOT EXISTS public.alert_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_event_id  UUID REFERENCES public.email_events(id) ON DELETE SET NULL,
  deals_count     INTEGER NOT NULL DEFAULT 0,
  trigger_reason  TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON public.saved_filters (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_is_active ON public.saved_filters (is_active);
CREATE INDEX IF NOT EXISTS idx_saved_filters_created_at ON public.saved_filters (created_at);
CREATE INDEX IF NOT EXISTS idx_saved_filters_criteria_gin ON public.saved_filters USING gin (criteria);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_filter_id ON public.alerts (filter_id);
CREATE INDEX IF NOT EXISTS idx_alerts_frequency ON public.alerts (frequency);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON public.alerts (is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_next_trigger_at ON public.alerts (next_trigger_at);
CREATE INDEX IF NOT EXISTS idx_alerts_last_triggered_at ON public.alerts (last_triggered_at);

CREATE INDEX IF NOT EXISTS idx_alert_deliveries_alert_id ON public.alert_deliveries (alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_user_id ON public.alert_deliveries (user_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_status ON public.alert_deliveries (status);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_created_at ON public.alert_deliveries (created_at);

-- Trigger for updating updated_at timestamp on saved_filters
DROP TRIGGER IF EXISTS trigger_update_saved_filters_updated_at ON public.saved_filters;
CREATE TRIGGER trigger_update_saved_filters_updated_at
    BEFORE UPDATE ON public.saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating updated_at timestamp on alerts
DROP TRIGGER IF EXISTS trigger_update_alerts_updated_at ON public.alerts;
CREATE TRIGGER trigger_update_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next trigger time based on frequency
CREATE OR REPLACE FUNCTION calculate_next_trigger(frequency_val TEXT, base_time TIMESTAMPTZ DEFAULT NOW())
RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE frequency_val
    WHEN 'instant' THEN
      RETURN base_time + INTERVAL '5 minutes';  -- 5 min cooldown for instant
    WHEN 'daily' THEN
      RETURN date_trunc('day', base_time) + INTERVAL '1 day' + INTERVAL '9 hours';  -- 9 AM next day
    WHEN 'weekly' THEN
      RETURN date_trunc('week', base_time) + INTERVAL '1 week' + INTERVAL '2 days' + INTERVAL '9 hours';  -- Tuesday 9 AM
    ELSE
      RETURN base_time + INTERVAL '1 day';  -- Default fallback
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set next_trigger_at when creating/updating alerts
CREATE OR REPLACE FUNCTION set_next_trigger_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Set next_trigger_at based on frequency when creating or updating
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.frequency != NEW.frequency OR OLD.is_active != NEW.is_active)) THEN
    IF NEW.is_active THEN
      NEW.next_trigger_at := calculate_next_trigger(NEW.frequency, COALESCE(NEW.last_triggered_at, NOW()));
    ELSE
      NEW.next_trigger_at := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_next_trigger_time ON public.alerts;
CREATE TRIGGER trigger_set_next_trigger_time
    BEFORE INSERT OR UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION set_next_trigger_time();

-- Comments for documentation
COMMENT ON TABLE public.saved_filters IS 'User-defined search filters with JSONB criteria';
COMMENT ON TABLE public.alerts IS 'User alert configurations linked to saved filters';
COMMENT ON TABLE public.alert_deliveries IS 'Individual alert delivery tracking';

COMMENT ON COLUMN public.saved_filters.criteria IS 'JSONB object containing search parameters (category, price_range, location, keywords, etc.)';
COMMENT ON COLUMN public.alerts.frequency IS 'Alert frequency: instant (5min cooldown), daily (9 AM), weekly (Tuesday 9 AM)';
COMMENT ON COLUMN public.alerts.next_trigger_at IS 'Calculated next trigger time based on frequency';
COMMENT ON COLUMN public.alert_deliveries.trigger_reason IS 'Why alert was triggered (scheduled, new_deals, etc.)';

-- Sample filter criteria examples (commented)
/*
Example saved_filters.criteria JSONB structures:

1. Electronics under $500:
{
  "category": "Electronics",
  "price_max": 500,
  "keywords": ["laptop", "phone", "tablet"],
  "condition": ["new", "like_new"],
  "location_radius": 25
}

2. Furniture in specific location:
{
  "category": "Furniture",
  "location": "San Francisco, CA",
  "location_radius": 15,
  "keywords": ["sofa", "couch", "chair"],
  "price_min": 50,
  "price_max": 1000
}

3. Cars by make/model:
{
  "category": "Vehicles",
  "vehicle_type": "car",
  "make": "Toyota",
  "model": "Camry",
  "year_min": 2015,
  "price_max": 25000,
  "mileage_max": 100000
}
*/