-- ===================================
-- SafraReport Row Level Security (RLS) Policies
-- ===================================
-- This file contains all RLS policies for production security
-- Run this on your Supabase database to enable proper access control

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE classified_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- ===================================
-- PUBLIC READ POLICIES (Anonymous Users)
-- ===================================

-- Articles: Public can read published articles
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (published = true);

-- Categories: Public can read all categories
CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

-- Provinces: Public can read all provinces
CREATE POLICY "Public can read provinces" ON provinces
    FOR SELECT USING (true);

-- Classifieds: Public can read approved classifieds
CREATE POLICY "Public can read approved classifieds" ON classifieds
    FOR SELECT USING (status = 'approved');

-- Classified Categories: Public can read all
CREATE POLICY "Public can read classified categories" ON classified_categories
    FOR SELECT USING (true);

-- Businesses: Public can read active businesses
CREATE POLICY "Public can read active businesses" ON businesses
    FOR SELECT USING (active = true);

-- Business Categories: Public can read all
CREATE POLICY "Public can read business categories" ON business_categories
    FOR SELECT USING (true);

-- Reviews: Public can read approved reviews
CREATE POLICY "Public can read approved reviews" ON reviews
    FOR SELECT USING (approved = true);

-- ===================================
-- USER POLICIES (Authenticated Users)
-- ===================================

-- Users: Users can read and update their own profile
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- User Preferences: Users can manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid()::text = user_id);

-- Classifieds: Users can create and manage their own classifieds
CREATE POLICY "Users can create classifieds" ON classifieds
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can read their own classifieds" ON classifieds
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own classifieds" ON classifieds
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Reviews: Users can create reviews (pending approval)
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (true); -- All authenticated users can create reviews

-- ===================================
-- ADMIN POLICIES (Admin Users Only)
-- ===================================

-- Admin Users: Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        )
    );

-- Admin Sessions: Admins can only see their own sessions
CREATE POLICY "Admins can manage their own sessions" ON admin_sessions
    FOR ALL USING (admin_user_id = current_setting('app.current_admin_id')::integer);

-- Articles: Admins can manage all articles
CREATE POLICY "Admins can manage articles" ON articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin', 'editor') 
            AND au.is_active = true
        )
    );

-- Categories: Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin') 
            AND au.is_active = true
        )
    );

-- Classifieds: Admins can manage all classifieds
CREATE POLICY "Admins can manage classifieds" ON classifieds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin', 'moderator') 
            AND au.is_active = true
        )
    );

-- Businesses: Admins can manage businesses
CREATE POLICY "Admins can manage businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin', 'moderator') 
            AND au.is_active = true
        )
    );

-- Reviews: Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin', 'moderator') 
            AND au.is_active = true
        )
    );

-- Audit Logs: Admins can read audit logs (insert handled by triggers)
CREATE POLICY "Admins can read audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin') 
            AND au.is_active = true
        )
    );

-- Moderation Queue: Moderators can manage moderation queue
CREATE POLICY "Moderators can manage moderation queue" ON moderation_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = current_setting('app.current_admin_id')::integer 
            AND au.role IN ('admin', 'super_admin', 'moderator') 
            AND au.is_active = true
        )
    );

-- ===================================
-- SECURITY FUNCTIONS
-- ===================================

-- Function to set current admin user context
CREATE OR REPLACE FUNCTION set_current_admin_user(admin_id integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_admin_id', admin_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.id = current_setting('app.current_admin_id', true)::integer 
        AND au.role IN ('admin', 'super_admin') 
        AND au.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- TRIGGERS FOR AUDIT LOGGING
-- ===================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_logs (
        admin_user_id,
        action,
        entity_type,
        entity_id,
        changes,
        details
    ) VALUES (
        current_setting('app.current_admin_id', true)::integer,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE 
            WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
            WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        END,
        'Automated audit log entry'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_articles ON articles;
CREATE TRIGGER audit_articles
    AFTER INSERT OR UPDATE OR DELETE ON articles
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS audit_classifieds ON classifieds;
CREATE TRIGGER audit_classifieds
    AFTER INSERT OR UPDATE OR DELETE ON classifieds
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS audit_businesses ON businesses;
CREATE TRIGGER audit_businesses
    AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS audit_admin_users ON admin_users;
CREATE TRIGGER audit_admin_users
    AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- ===================================
-- USAGE INSTRUCTIONS
-- ===================================

/*
To use these RLS policies in your application:

1. Run this SQL file on your Supabase database
2. In your server middleware, set the admin context:
   
   // After authenticating admin user
   await db.execute(sql`SELECT set_current_admin_user(${adminUserId})`);

3. For public API endpoints, no context setting needed
4. For user endpoints, ensure Supabase auth is properly configured

Example middleware usage:
```typescript
export const setAdminContext = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  if (req.adminUser) {
    await db.execute(sql`SELECT set_current_admin_user(${req.adminUser.id})`);
  }
  next();
};
```

Security Notes:
- All tables have RLS enabled by default (deny all)
- Public endpoints only allow reading approved/published content
- Users can only manage their own data
- Admins have role-based access (super_admin > admin > editor/moderator)
- All admin actions are automatically logged
- Session management is secure and isolated per admin
*/
