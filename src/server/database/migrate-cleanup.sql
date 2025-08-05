-- SafraReport Database Migration: Clean up legacy constraints and update schema
-- Run this to fix database schema issues before running tests

-- Drop legacy author constraints if they exist
DO $$ 
BEGIN
    -- Drop foreign key constraint from articles to authors (legacy)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_author_id_authors_id_fk') THEN
        ALTER TABLE articles DROP CONSTRAINT articles_author_id_authors_id_fk;
    END IF;
    
    -- Drop authors table if it exists (legacy)
    DROP TABLE IF EXISTS authors CASCADE;
    
    -- Ensure admin_users table has all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'password_hash') THEN
        ALTER TABLE admin_users ADD COLUMN password_hash TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
        ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'last_login_at') THEN
        ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMP;
    END IF;
    
    -- Ensure articles.author_id references users.id (not authors)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_author_id_users_id_fk') THEN
        -- Add foreign key to users table
        ALTER TABLE articles ADD CONSTRAINT articles_author_id_users_id_fk 
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Create admin_sessions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Create audit_logs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_user_id INTEGER NOT NULL REFERENCES admin_users(id),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255),
        entity_id VARCHAR(255),
        changes JSONB,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
    );
    
END $$;
