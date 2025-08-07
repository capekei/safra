import { pgTable, serial, text, integer, timestamp, boolean, json, varchar, decimal } from 'drizzle-orm/pg-core';

// Users table optimized for session-based authentication
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: text('password_hash').notNull(),
  first_name: varchar('first_name', { length: 255 }),
  last_name: varchar('last_name', { length: 255 }),
  phone: varchar('phone', { length: 20 }), // Dominican phone format
  province_id: varchar('province_id', { length: 50 }), // User location in DR
  profile_image_url: text('profile_image_url'),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  email_verified: boolean('email_verified').default(false),
  is_active: boolean('is_active').default(true),
  login_attempts: integer('login_attempts').default(0),
  locked_until: timestamp('locked_until'),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Enhanced admin users table with security features
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(), // Renamed for consistency
  first_name: text('first_name'),
  last_name: text('last_name'),
  avatar: text('avatar'),
  role: text('role').default('admin'),
  active: boolean('active').default(true),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  
  // Enhanced security features
  failed_login_attempts: integer('failed_login_attempts').default(0),
  locked_until: timestamp('locked_until'),
  password_changed_at: timestamp('password_changed_at').defaultNow(),
  two_factor_enabled: boolean('two_factor_enabled').default(false),
  two_factor_secret: text('two_factor_secret'),
  last_ip_address: text('last_ip_address'),
  
  // Session management
  session_token: text('session_token'),
  session_expires: timestamp('session_expires'),
});

// Articles table (matching existing database structure)
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  featured_image: text('featured_image'),
  video_url: text('video_url'),
  is_breaking: boolean('is_breaking'),
  is_featured: boolean('is_featured'),
  published: boolean('published'),
  published_at: timestamp('published_at'),
  author_id: integer('author_id').notNull().references(() => adminUsers.id),
  category_id: integer('category_id').notNull(),
  category_ids: json('category_ids'), // Array field
  province_id: integer('province_id'),
  status: text('status').default('draft'), // 'draft', 'pending_review', 'approved', 'published', 'rejected', 'needs_changes'
  scheduled_for: timestamp('scheduled_for'),
  submitted_at: timestamp('submitted_at'),
  approved_at: timestamp('approved_at'),
  approved_by: integer('approved_by').references(() => adminUsers.id),
  images: json('images'), // Array field
  videos: json('videos'), // Array field
  likes: integer('likes'),
  comments: integer('comments'),
  views: integer('views'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  created_at: timestamp('created_at').defaultNow(),
});

// Classifieds table
export const classifieds = pgTable('classifieds', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('DOP'),
  category_id: integer('category_id').references(() => classifiedCategories.id),
  province_id: integer('province_id').references(() => provinces.id),
  contact_phone: text('contact_phone'),
  contact_name: text('contact_name'),
  contact_email: text('contact_email'),
  negotiable: boolean('negotiable').default(false),
  condition: text('condition'), // new, used, refurbished
  delivery_available: boolean('delivery_available').default(false),
  images: json('images'),
  status: text('status').default('pending'),
  user_id: text('user_id').references(() => users.id),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Businesses table
export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  category_id: integer('category_id').references(() => businessCategories.id),
  province_id: integer('province_id').references(() => provinces.id),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  facebook: text('facebook'),
  instagram: text('instagram'),
  twitter: text('twitter'),
  images: json('images'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  price_range: text('price_range'),
  hours: json('hours'),
  verified: boolean('verified').default(false),
  featured: boolean('featured').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  business_id: integer('business_id').references(() => businesses.id),
  user_id: text('user_id').references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  images: json('images'),
  status: text('status').default('pending'),
  approved: boolean('approved').default(false),
  helpful_count: integer('helpful_count').default(0),
  reported: boolean('reported').default(false),
  user_name: text('user_name'),
  user_email: text('user_email'),
  created_at: timestamp('created_at').defaultNow(),
});

// Provinces table
export const provinces = pgTable('provinces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 2 }).notNull().unique(),
  slug: text('slug').notNull().unique(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  created_at: timestamp('created_at').defaultNow(),
});


// Sessions table for session-based authentication
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires_at: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull(),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
});

// Password reset tokens
export const passwordResets = pgTable('password_resets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expires_at: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

// Email verification tokens
export const emailVerifications = pgTable('email_verifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Login attempts tracking (for rate limiting)
export const loginAttempts = pgTable('login_attempts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }),
  ip_address: varchar('ip_address', { length: 45 }).notNull(),
  success: boolean('success').default(false),
  attempted_at: timestamp('attempted_at').defaultNow(),
});

// Enhanced session management for admin users  
export const adminSessions = pgTable('admin_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  admin_user_id: integer('admin_user_id').references(() => adminUsers.id, { onDelete: 'cascade' }),
  expires_at: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull(),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  admin_user_id: integer('admin_user_id').references(() => adminUsers.id),
  action: varchar('action').notNull(),
  entity_type: varchar('entity_type'),
  entity_id: varchar('entity_id'),
  changes: json('changes'),
  ip_address: varchar('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
  details: text('details'),
  success: boolean('success'),
});

// Classified categories table
export const classifiedCategories = pgTable('classified_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  created_at: timestamp('created_at').defaultNow(),
});

// Business categories table
export const businessCategories = pgTable('business_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  created_at: timestamp('created_at').defaultNow(),
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  user_id: varchar('user_id').notNull().references(() => users.id),
  categories: json('categories'),
  keywords: json('keywords'),
  notifications: json('notifications'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Moderation queue table for admin content review
export const moderationQueue = pgTable('moderation_queue', {
  id: serial('id').primaryKey(),
  entity_type: varchar('entity_type').notNull(), // 'article', 'classified', 'review', 'business'
  entity_id: varchar('entity_id').notNull(),
  action_required: varchar('action_required').notNull(), // 'approve', 'reject', 'edit'
  priority: varchar('priority').default('normal'), // 'low', 'normal', 'high', 'urgent'
  assigned_to: integer('assigned_to').references(() => adminUsers.id),
  reason: text('reason'),
  metadata: json('metadata'),
  status: varchar('status').default('pending'), // 'pending', 'in_review', 'completed', 'escalated'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  resolved_at: timestamp('resolved_at'),
});

// Ads table for Dominican Republic marketplace advertising
export const ads = pgTable('ads', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image_url: text('image_url'),
  target_url: text('target_url'),
  advertiser_name: text('advertiser_name').notNull(),
  advertiser_email: text('advertiser_email'),
  advertiser_phone: text('advertiser_phone'),
  category_id: integer('category_id'),
  province_id: integer('province_id').references(() => provinces.id),
  budget_dop: decimal('budget_dop', { precision: 10, scale: 2 }),
  cost_per_click: decimal('cost_per_click', { precision: 10, scale: 2 }),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  status: varchar('status').default('pending'), // 'pending', 'active', 'paused', 'completed', 'rejected'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Ad placements table for tracking where ads appear
export const adPlacements = pgTable('ad_placements', {
  id: serial('id').primaryKey(),
  ad_id: integer('ad_id').references(() => ads.id, { onDelete: 'cascade' }),
  placement_type: varchar('placement_type').notNull(), // 'banner', 'sidebar', 'inline', 'modal'
  page_type: varchar('page_type').notNull(), // 'home', 'article', 'classified', 'business', 'search'
  position: integer('position'), // Order/priority of placement
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// Ad analytics table for tracking Dominican Republic ad performance  
export const adAnalytics = pgTable('ad_analytics', {
  id: serial('id').primaryKey(),
  ad_id: integer('ad_id').references(() => ads.id, { onDelete: 'cascade' }),
  placement_id: integer('placement_id').references(() => adPlacements.id),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  cost_dop: decimal('cost_dop', { precision: 10, scale: 2 }).default('0'),
  revenue_dop: decimal('revenue_dop', { precision: 10, scale: 2 }).default('0'),
  date: timestamp('date').defaultNow(),
  province_id: integer('province_id').references(() => provinces.id),
  device_type: varchar('device_type'), // 'mobile', 'tablet', 'desktop'
  user_agent: text('user_agent'),
  ip_address: varchar('ip_address'),
  created_at: timestamp('created_at').defaultNow(),
});

// Article versions table for editorial version control
export const articleVersions = pgTable('article_versions', {
  id: serial('id').primaryKey(),
  article_id: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  content: json('content').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  changed_by: integer('changed_by').references(() => adminUsers.id),
  changes_summary: text('changes_summary'),
  created_at: timestamp('created_at').defaultNow(),
});

// Article reviews table for editorial workflow
export const articleReviews = pgTable('article_reviews', {
  id: serial('id').primaryKey(),
  article_id: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  reviewer_id: integer('reviewer_id').references(() => adminUsers.id),
  decision: varchar('decision').notNull(), // 'approve', 'reject', 'needs_changes'
  comments: text('comments'),
  reviewed_at: timestamp('reviewed_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
});

// Editorial comments table for article feedback
export const editorialComments = pgTable('editorial_comments', {
  id: serial('id').primaryKey(),
  article_id: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  author_id: integer('author_id').references(() => adminUsers.id),
  text: text('text').notNull(),
  resolved: boolean('resolved').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}); 