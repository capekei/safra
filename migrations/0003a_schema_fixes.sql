-- SafraReport Schema Fixes (Part 1)
-- Migration: 0003a_schema_fixes.sql

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

-- Data integrity constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_views_positive') THEN
    ALTER TABLE articles ADD CONSTRAINT articles_views_positive CHECK (views >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_likes_positive') THEN
    ALTER TABLE articles ADD CONSTRAINT articles_likes_positive CHECK (likes >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_valid') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_rating_valid CHECK (rating >= 1 AND rating <= 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_rating_valid') THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_rating_valid CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;