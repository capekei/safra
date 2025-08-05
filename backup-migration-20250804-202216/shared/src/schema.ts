import { pgTable, serial, text, integer, timestamp, boolean, json, varchar, decimal } from 'drizzle-orm/pg-core';

// Enhanced users table with unified authentication
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash'), // New field for unified JWT auth
  first_name: text('first_name'),
  last_name: text('last_name'),
  profile_image_url: text('profile_image_url'),
  role: text('role').default('user'),
  email_verified: boolean('email_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  last_login: timestamp('last_login'),
  is_active: boolean('is_active').default(true),
  
  // Security enhancements
  failed_login_attempts: integer('failed_login_attempts').default(0),
  locked_until: timestamp('locked_until'),
  password_changed_at: timestamp('password_changed_at').defaultNow(),
  two_factor_enabled: boolean('two_factor_enabled').default(false),
  two_factor_secret: text('two_factor_secret'),
  
  // Account verification
  email_verification_token: text('email_verification_token'),
  email_verification_expires: timestamp('email_verification_expires'),
  password_reset_token: text('password_reset_token'),
  password_reset_expires: timestamp('password_reset_expires'),
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
  status: text('status'),
  scheduled_for: timestamp('scheduled_for'),
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
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('DOP'),
  category_id: integer('category_id').references(() => classifiedCategories.id),
  province_id: integer('province_id').references(() => provinces.id),
  contact_phone: text('contact_phone'),
  contact_email: text('contact_email'),
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
  description: text('description'),
  category_id: integer('category_id').references(() => businessCategories.id),
  province_id: integer('province_id').references(() => provinces.id),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  images: json('images'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  price_range: text('price_range'),
  hours: json('hours'),
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


// Enhanced session management for both users and admins
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refresh_token: text('refresh_token').unique(),
  expires_at: timestamp('expires_at').notNull(),
  refresh_expires_at: timestamp('refresh_expires_at').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  device_info: json('device_info'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Admin sessions table (enhanced)
export const adminSessions = pgTable('admin_sessions', {
  id: text('id').primaryKey(),
  admin_user_id: integer('admin_user_id').references(() => adminUsers.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refresh_token: text('refresh_token').unique(),
  expires_at: timestamp('expires_at').notNull(),
  refresh_expires_at: timestamp('refresh_expires_at').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  device_info: json('device_info'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
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