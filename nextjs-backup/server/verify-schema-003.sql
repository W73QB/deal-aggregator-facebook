-- Schema verification queries for Migration 003
-- Verifies saved_filters and alerts tables structure

-- Check all public tables
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;

-- Check saved_filters table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'saved_filters' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check alerts table columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'alerts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check alert_deliveries table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'alert_deliveries' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all indexes for new tables
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (tablename IN ('saved_filters', 'alerts', 'alert_deliveries'))
ORDER BY tablename, indexname;