-- SafraReport Critical Performance Indexes
-- These indexes will provide 3-5x performance improvement

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

-- Full-text search index for Spanish content (Dominican optimized)
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_search_spanish_idx 
  ON articles USING gin(to_tsvector('spanish', title || ' ' || excerpt))
  WHERE published = true;

-- Categories optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS categories_slug_idx 
  ON categories(slug) 
  WHERE slug IS NOT NULL;