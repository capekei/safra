-- Enable Row Level Security for SafraReport
-- Simple RLS setup for Neon PostgreSQL without Supabase auth

-- Enable RLS on key tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create bypass policies for application access
-- These policies allow the application to access data when using the database owner role

-- Articles: Allow read access to published articles
CREATE POLICY "articles_published_read" ON articles
  FOR SELECT
  USING (published = true AND status = 'published');

-- Categories: Allow public read access
CREATE POLICY "categories_read" ON categories
  FOR SELECT
  USING (true);

-- Provinces: Allow public read access (no RLS needed for static data)
-- Admin tables: Restrict to application context only

-- Create a database role for the application
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'safra_app') THEN
    CREATE ROLE safra_app;
  END IF;
END
$$;

-- Grant necessary permissions to the application role
GRANT CONNECT ON DATABASE neondb TO safra_app;
GRANT USAGE ON SCHEMA public TO safra_app;

-- Grant table permissions
GRANT SELECT ON articles, categories, provinces, classifieds, businesses, reviews TO safra_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users, admin_sessions, audit_logs TO safra_app;
GRANT INSERT, UPDATE ON articles TO safra_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON classifieds, businesses, reviews TO safra_app;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO safra_app;

-- Create policies that allow the database owner full access (for our current setup)
CREATE POLICY "articles_owner_all" ON articles
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "categories_owner_all" ON categories
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_users_owner_all" ON admin_users
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_sessions_owner_all" ON admin_sessions
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "classifieds_owner_all" ON classifieds
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "businesses_owner_all" ON businesses
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "reviews_owner_all" ON reviews
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ads_owner_all" ON ads
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

CREATE POLICY "audit_logs_owner_all" ON audit_logs
  FOR ALL
  TO neondb_owner
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "articles_owner_all" ON articles IS 'Allow database owner full access to articles';
COMMENT ON POLICY "categories_owner_all" ON categories IS 'Allow database owner full access to categories';