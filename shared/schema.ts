import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, date, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  categories: json("categories").$type<string[]>().default([]),
  keywords: json("keywords").$type<string[]>().default([]),
  notifications: json("notifications").$type<{
    breaking: boolean;
    daily: boolean;
    weekly: boolean;
  }>().default({ breaking: true, daily: false, weekly: false }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Authors table removed - using users table instead

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  videoUrl: text("video_url"), // External video URL (YouTube, Vimeo, etc.)
  isBreaking: boolean("is_breaking").default(false),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  authorId: varchar("author_id").references(() => users.id).notNull(), // References users table
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  categoryIds: integer("category_ids").array(), // Multiple categories
  provinceId: integer("province_id").references(() => provinces.id), // Region/Province
  status: text("status").default("draft"), // draft, published, scheduled
  scheduledFor: timestamp("scheduled_for"), // For future publishing
  images: text("images").array(), // Array of uploaded image URLs
  videos: text("videos").array(), // Array of uploaded video URLs
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const classifiedCategories = pgTable("classified_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
});

export const classifieds = pgTable("classifieds", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: text("currency").default("DOP"),
  images: json("images").$type<string[]>().default([]),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactWhatsapp: text("contact_whatsapp"),
  contactEmail: text("contact_email"),
  provinceId: integer("province_id").references(() => provinces.id),
  municipality: text("municipality"),
  categoryId: integer("category_id").references(() => classifiedCategories.id).notNull(),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessCategories = pgTable("business_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  images: json("images").$type<string[]>().default([]),
  priceRange: integer("price_range").default(1), // 1-4 ($, $$, $$$, $$$$)
  categoryId: integer("category_id").references(() => businessCategories.id).notNull(),
  provinceId: integer("province_id").references(() => provinces.id),
  municipality: text("municipality"),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }).default("0.0"),
  totalReviews: integer("total_reviews").default(0),
  verified: boolean("verified").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email"),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  content: text("content").notNull(),
  images: json("images").$type<string[]>().default([]),
  helpful: integer("helpful").default(0),
  approved: boolean("approved").default(false),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

// Authors relations removed - using users table instead

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  province: one(provinces, {
    fields: [articles.provinceId],
    references: [provinces.id],
  }),
}));

export const provincesRelations = relations(provinces, ({ many }) => ({
  classifieds: many(classifieds),
  businesses: many(businesses),
}));

export const classifiedCategoriesRelations = relations(classifiedCategories, ({ many }) => ({
  classifieds: many(classifieds),
}));

export const classifiedsRelations = relations(classifieds, ({ one }) => ({
  category: one(classifiedCategories, {
    fields: [classifieds.categoryId],
    references: [classifiedCategories.id],
  }),
  province: one(provinces, {
    fields: [classifieds.provinceId],
    references: [provinces.id],
  }),
}));

export const businessCategoriesRelations = relations(businessCategories, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  category: one(businessCategories, {
    fields: [businesses.categoryId],
    references: [businessCategories.id],
  }),
  province: one(provinces, {
    fields: [businesses.provinceId],
    references: [provinces.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
}));

// Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Author schema removed - using users table instead

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  comments: true,
  views: true,
});

export const insertClassifiedSchema = createInsertSchema(classifieds).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  averageRating: true,
  totalReviews: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  helpful: true,
  approved: true,
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Author types removed - using users table instead

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Province = typeof provinces.$inferSelect;

export type ClassifiedCategory = typeof classifiedCategories.$inferSelect;
export type Classified = typeof classifieds.$inferSelect;
export type InsertClassified = z.infer<typeof insertClassifiedSchema>;

export type BusinessCategory = typeof businessCategories.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Extended types for API responses with joins
export type ArticleWithRelations = Article & {
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description: string | null;
    createdAt: Date;
  } | null;
  province?: {
    id: number;
    name: string;
    code: string;
  } | null;
  authorUsername?: string | null;
};

export type ClassifiedWithRelations = Classified & {
  category: ClassifiedCategory | null;
  province: Province | null;
};

export type BusinessWithRelations = Business & {
  category: BusinessCategory | null;
  province: Province | null;
};

export type ReviewWithRelations = Review & {
  user?: User | null;
  business?: Business | null;
};

export type UserReviewWithBusiness = Review & {
  business: Business | null;
};

export type UserClassified = Classified & {
  category: ClassifiedCategory | null;
  province: Province | null;
};

// Admin users table for CMS
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(), // bcrypt hashed password
  auth0Id: varchar("auth0_id").unique(), // Link to Auth0 user ID (optional)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("editor"), // super_admin, admin, editor, moderator
  avatar: text("avatar"),
  replitId: text("replit_id").unique(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs for tracking admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => adminUsers.id).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 255 }),
  entityId: varchar("entity_id", { length: 255 }),
  changes: jsonb("changes"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content moderation queue
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // classified, review
  entityId: integer("entity_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedBy: text("submitted_by"), // email or name of submitter
  moderatedBy: integer("moderated_by").references(() => adminUsers.id),
  moderationNotes: text("moderation_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  moderatedAt: timestamp("moderated_at"),
});

// Admin sessions for JWT
export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(), // Use text ID for session IDs
  adminUserId: integer("admin_user_id").references(() => adminUsers.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for admin tables
export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  auditLogs: many(auditLogs),
  moderationQueues: many(moderationQueue),
  sessions: many(adminSessions),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [auditLogs.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  moderator: one(adminUsers, {
    fields: [moderationQueue.moderatedBy],
    references: [adminUsers.id],
  }),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminSessions.adminUserId],
    references: [adminUsers.id],
  }),
}));

// Admin schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({
  id: true,
  createdAt: true,
  moderatedAt: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

// Admin types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;



// Ads management tables
export const adPlacements = pgTable("ad_placements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  width: integer("width"),
  height: integer("height"),
  position: text("position").notNull(), // header, sidebar, article, footer
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  advertiser: text("advertiser").notNull(),
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),
  placementId: integer("placement_id").references(() => adPlacements.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetProvinces: json("target_provinces").$type<number[]>().default([]), // Empty = all provinces
  targetCategories: json("target_categories").$type<number[]>().default([]), // Empty = all categories
  maxImpressions: integer("max_impressions"),
  maxClicks: integer("max_clicks"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  status: varchar("status", { length: 20 }).default("active"),
  active: boolean("active").default(true),
  createdBy: integer("created_by").references(() => adminUsers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adAnalytics = pgTable("ad_analytics", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").references(() => ads.id).notNull(),
  date: date("date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  provinceId: integer("province_id").references(() => provinces.id),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ad relations
export const adPlacementsRelations = relations(adPlacements, ({ many }) => ({
  ads: many(ads),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  placement: one(adPlacements, {
    fields: [ads.placementId],
    references: [adPlacements.id],
  }),
  creator: one(adminUsers, {
    fields: [ads.createdBy],
    references: [adminUsers.id],
  }),
  analytics: many(adAnalytics),
}));

export const adAnalyticsRelations = relations(adAnalytics, ({ one }) => ({
  ad: one(ads, {
    fields: [adAnalytics.adId],
    references: [ads.id],
  }),
  province: one(provinces, {
    fields: [adAnalytics.provinceId],
    references: [provinces.id],
  }),
  category: one(categories, {
    fields: [adAnalytics.categoryId],
    references: [categories.id],
  }),
}));

// Ad schemas
export const insertAdPlacementSchema = createInsertSchema(adPlacements).omit({
  id: true,
  createdAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  impressions: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdAnalyticsSchema = createInsertSchema(adAnalytics).omit({
  id: true,
  createdAt: true,
});

// Ad types
export type AdPlacement = typeof adPlacements.$inferSelect;
export type InsertAdPlacement = z.infer<typeof insertAdPlacementSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type AdAnalytics = typeof adAnalytics.$inferSelect;
export type InsertAdAnalytics = z.infer<typeof insertAdAnalyticsSchema>;
