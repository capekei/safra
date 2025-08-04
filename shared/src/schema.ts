import { pgTable, serial, text, integer, timestamp, boolean, json, varchar, decimal } from 'drizzle-orm/pg-core';

// Users table (matching existing database structure)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  first_name: text('first_name'),
  last_name: text('last_name'),
  profile_image_url: text('profile_image_url'),
  role: text('role'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  avatar: text('avatar'),
  replit_id: text('replit_id'),
  role: text('role').default('admin'),
  active: boolean('active').default(true),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
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


// Admin sessions table
export const adminSessions = pgTable('admin_sessions', {
  id: text('id').primaryKey(),
  admin_user_id: integer('admin_user_id').references(() => adminUsers.id),
  token: text('token').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
  is_active: boolean('is_active').default(true),
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