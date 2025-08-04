-- Enable Row Level Security for all tables
-- This ensures proper access control for the SafraReport application

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE classified_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "articles_public_read" ON articles;
DROP POLICY IF EXISTS "articles_admin_all" ON articles;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
DROP POLICY IF EXISTS "admin_users_self_read" ON admin_users;
DROP POLICY IF EXISTS "admin_sessions_self_manage" ON admin_sessions;
DROP POLICY IF EXISTS "provinces_public_read" ON provinces;
DROP POLICY IF EXISTS "classifieds_public_read" ON classifieds;
DROP POLICY IF EXISTS "businesses_public_read" ON businesses;
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;

-- Articles policies
-- Allow public read access to published articles
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT
  USING (published = true AND status = 'published');

-- Allow admin users to manage all articles
CREATE POLICY "articles_admin_all" ON articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Categories policies
-- Allow public read access to categories
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT
  TO public
  USING (true);

-- Allow admin users to manage categories
CREATE POLICY "categories_admin_all" ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Admin users policies
-- Admin users can only read their own data
CREATE POLICY "admin_users_self_read" ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::integer);

-- Admin sessions policies
-- Admin users can manage their own sessions
CREATE POLICY "admin_sessions_self_manage" ON admin_sessions
  FOR ALL
  TO authenticated
  USING (admin_user_id = auth.uid()::integer);

-- Provinces policies
-- Allow public read access to provinces
CREATE POLICY "provinces_public_read" ON provinces
  FOR SELECT
  TO public
  USING (true);

-- Classifieds policies
-- Allow public read access to active classifieds
CREATE POLICY "classifieds_public_read" ON classifieds
  FOR SELECT
  TO public
  USING (status = 'active');

-- Allow users to manage their own classifieds
CREATE POLICY "classifieds_user_manage" ON classifieds
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Businesses policies
-- Allow public read access to businesses
CREATE POLICY "businesses_public_read" ON businesses
  FOR SELECT
  TO public
  USING (true);

-- Reviews policies
-- Allow public read access to reviews
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "reviews_user_create" ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own reviews
CREATE POLICY "reviews_user_update" ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Classified categories policies
CREATE POLICY "classified_categories_public_read" ON classified_categories
  FOR SELECT
  TO public
  USING (true);

-- Business categories policies
CREATE POLICY "business_categories_public_read" ON business_categories
  FOR SELECT
  TO public
  USING (true);

-- User preferences policies
CREATE POLICY "user_preferences_self_manage" ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Ads policies (admin only)
CREATE POLICY "ads_admin_only" ON ads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Ad placements policies (admin only)
CREATE POLICY "ad_placements_admin_only" ON ad_placements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Ad analytics policies (admin only)
CREATE POLICY "ad_analytics_admin_only" ON ad_analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Moderation queue policies (admin only)
CREATE POLICY "moderation_queue_admin_only" ON moderation_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()::integer 
      AND admin_users.active = true
    )
  );

-- Grant necessary permissions to public role for read-only access
GRANT SELECT ON articles TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON provinces TO anon;
GRANT SELECT ON classifieds TO anon;
GRANT SELECT ON businesses TO anon;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON classified_categories TO anon;
GRANT SELECT ON business_categories TO anon;

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON POLICY "articles_public_read" ON articles IS 'Allow public read access to published articles';
COMMENT ON POLICY "articles_admin_all" ON articles IS 'Allow admin users full access to articles';
COMMENT ON POLICY "categories_public_read" ON categories IS 'Allow public read access to categories';