-- DealRadarUS - User Authentication Schema
-- Migration: 001_users.sql  
-- Date: 2025-08-26
-- Purpose: Create user accounts, sessions, and password reset tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Users table - stores user account information
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          CITEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  first_name     TEXT,
  last_name      TEXT,
  newsletter_subscribed BOOLEAN NOT NULL DEFAULT FALSE,
  preferences    JSONB DEFAULT '{}',
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table - stores user session tokens
CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  user_agent    TEXT,
  ip_address    INET,
  expires_at    TIMESTAMPTZ NOT NULL,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password reset table - stores password reset tokens
CREATE TABLE IF NOT EXISTS public.password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email verification table - stores email verification tokens
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users (email_verified);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON public.sessions (refresh_token);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON public.password_resets (user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON public.password_resets (expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON public.password_resets (token_hash);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON public.email_verifications (token_hash);

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User accounts for DealRadarUS authentication system';
COMMENT ON TABLE public.sessions IS 'User sessions with refresh tokens for JWT authentication';  
COMMENT ON TABLE public.password_resets IS 'Password reset tokens with expiration';
COMMENT ON TABLE public.email_verifications IS 'Email verification tokens for new accounts';

COMMENT ON COLUMN public.users.preferences IS 'JSON object storing user preferences like saved filters, notification settings';
COMMENT ON COLUMN public.sessions.refresh_token IS 'Secure token for refreshing JWT access tokens';
COMMENT ON COLUMN public.users.email IS 'Case-insensitive email using CITEXT extension';

-- Deals table - stores deal information
CREATE TABLE IF NOT EXISTS public.deals (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  image            TEXT,
  original_price   NUMERIC(10, 2) NOT NULL,
  sale_price       NUMERIC(10, 2) NOT NULL,
  discount         INTEGER,
  rating           NUMERIC(2, 1),
  category         TEXT,
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  store            TEXT,
  affiliate_url    TEXT,
  tags             TEXT,
  stock_count      INTEGER,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for deals table
CREATE INDEX IF NOT EXISTS idx_deals_category ON public.deals (category);
CREATE INDEX IF NOT EXISTS idx_deals_featured ON public.deals (featured);
CREATE INDEX IF NOT EXISTS idx_deals_sale_price ON public.deals (sale_price);
CREATE INDEX IF NOT EXISTS idx_deals_rating ON public.deals (rating);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals (created_at);

-- Apply trigger to deals table
DROP TRIGGER IF EXISTS trigger_update_deals_updated_at ON public.deals;
CREATE TRIGGER trigger_update_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.deals IS 'Stores all deal information scraped or submitted';
