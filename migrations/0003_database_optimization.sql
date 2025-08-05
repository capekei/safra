-- SafraReport Database Optimization Migration
-- Fixes schema inconsistencies and adds world-class performance indexes
-- Migration: 0003_database_optimization.sql

BEGIN;

-- =============================================================================
-- Fix Missing Columns and Schema Inconsistencies
-- =============================================================================

-- Fix reviews table - add missing comment column
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS comment TEXT;

-- Fix categories table - add missing color column
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS color TEXT;

-- Fix provinces table - add missing columns for complete schema
ALTER TABLE provinces 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add unique constraint on provinces slug if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'provinces_slug_unique'
  ) THEN
    ALTER TABLE provinces ADD CONSTRAINT provinces_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Standardize password field naming across all user tables
DO $$ 
BEGIN
  -- Check if admin_users still has 'password' column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'password'
  ) THEN
    ALTER TABLE admin_users RENAME COLUMN password TO password_hash;
  END IF;
END $$;

-- =============================================================================
-- World-Class Performance Indexes
-- =============================================================================

-- Critical Articles Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_published_publishedat_idx 
  ON articles(published, published_at DESC) 
  WHERE published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_category_published_idx 
  ON articles(category_id, published, published_at DESC) 
  WHERE published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_views_trending_idx 
  ON articles(views DESC, published_at DESC) 
  WHERE published = true AND views IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_featured_idx 
  ON articles(is_featured, published_at DESC) 
  WHERE published = true AND is_featured = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_breaking_idx 
  ON articles(is_breaking, published_at DESC) 
  WHERE published = true AND is_breaking = true;

-- Full-text search index for Spanish content
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_search_idx 
  ON articles USING gin(to_tsvector('spanish', title || ' ' || excerpt || ' ' || content))
  WHERE published = true;

-- Author performance index
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_author_published_idx 
  ON articles(author_id, published, published_at DESC) 
  WHERE published = true;

-- Categories optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS categories_slug_idx 
  ON categories(slug) 
  WHERE slug IS NOT NULL;

-- Provinces optimization for Dominican location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS provinces_name_idx 
  ON provinces(name);

-- Geospatial index for province coordinates (Dominican Republic specific)
CREATE INDEX CONCURRENTLY IF NOT EXISTS provinces_location_idx 
  ON provinces USING gist(point(longitude, latitude))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Classifieds performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS classifieds_category_status_idx 
  ON classifieds(category_id, status, created_at DESC) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS classifieds_province_category_idx 
  ON classifieds(province_id, category_id, created_at DESC) 
  WHERE status = 'active';

-- Businesses optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS businesses_category_province_idx 
  ON businesses(category_id, province_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS businesses_rating_idx 
  ON businesses(rating DESC, created_at DESC) 
  WHERE rating IS NOT NULL;

-- Reviews performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS reviews_business_status_idx 
  ON reviews(business_id, status, created_at DESC);

-- User session optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_sessions_token_active_idx 
  ON user_sessions(token, is_active, expires_at) 
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS admin_sessions_token_active_idx 
  ON admin_sessions(token, is_active, expires_at) 
  WHERE is_active = true;

-- User preferences optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_preferences_user_id_idx 
  ON user_preferences(user_id);

-- =============================================================================
-- Dominican Republic Specific Optimizations
-- =============================================================================

-- Create materialized view for trending Dominican news (updates every hour)
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_dominican_articles AS
SELECT 
  a.id, a.title, a.slug, a.excerpt, a.featured_image,
  a.views, a.likes, a.published_at, a.is_breaking, a.is_featured,
  c.name as category_name, c.slug as category_slug,
  p.name as province_name, p.code as province_code,
  -- Dominican trending score algorithm
  (
    (a.views * 0.4) + 
    (a.likes * 0.3) + 
    (EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 3600 * -0.1) + -- Recency factor
    (CASE WHEN a.is_breaking THEN 50 ELSE 0 END) + -- Breaking news boost
    (CASE WHEN a.is_featured THEN 25 ELSE 0 END)   -- Featured boost
  ) as trending_score,
  NOW() as calculated_at
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN provinces p ON a.province_id = p.id
WHERE a.published = true 
  AND a.published_at >= NOW() - INTERVAL '7 days'
  AND a.views > 0
ORDER BY trending_score DESC
LIMIT 100;

-- Index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS trending_dominican_articles_id_idx 
  ON trending_dominican_articles(id);

CREATE INDEX IF NOT EXISTS trending_dominican_articles_score_idx 
  ON trending_dominican_articles(trending_score DESC);

-- =============================================================================
-- Data Integrity and Constraints
-- =============================================================================

-- Ensure article views and likes are non-negative
ALTER TABLE articles 
  ADD CONSTRAINT articles_views_positive CHECK (views >= 0),
  ADD CONSTRAINT articles_likes_positive CHECK (likes >= 0);

-- Ensure review ratings are within valid range (1-5)
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_rating_valid CHECK (rating >= 1 AND rating <= 5);

-- Ensure business ratings are within valid range (0-5)
ALTER TABLE businesses 
  ADD CONSTRAINT businesses_rating_valid CHECK (rating >= 0 AND rating <= 5);

-- =============================================================================
-- Update Statistics and Vacuum
-- =============================================================================

-- Update table statistics for query planner optimization
ANALYZE articles;
ANALYZE categories;
ANALYZE provinces;
ANALYZE classifieds;
ANALYZE businesses;
ANALYZE reviews;
ANALYZE users;
ANALYZE admin_users;

-- Create function to refresh trending articles (Dominican optimized)
CREATE OR REPLACE FUNCTION refresh_trending_dominican_articles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_dominican_articles;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Performance Monitoring Views
-- =============================================================================

-- Create view for database performance monitoring
CREATE OR REPLACE VIEW database_performance_stats AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation,
  most_common_vals,
  most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

COMMIT;

-- =============================================================================
-- Post-Migration Notes
-- =============================================================================

-- Schedule trending articles refresh (add to cron or application scheduler)
-- SELECT cron.schedule('refresh-trending', '0 * * * *', 'SELECT refresh_trending_dominican_articles();');

-- Monitor query performance with:
-- SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;