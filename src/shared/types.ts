import { InferModel } from 'drizzle-orm';
import { 
  articles, 
  categories, 
  classifieds, 
  businesses, 
  classifiedCategories, 
  businessCategories, 
  provinces, 
  reviews, 
  adminUsers, 
  adminSessions, 
  auditLogs,
  users,
  userPreferences,
  moderationQueue,
  ads,
  adPlacements,
  adAnalytics,
  articleVersions,
  articleReviews,
  editorialComments
} from './schema';

// Article types
export type Article = InferModel<typeof articles>;
export type NewArticle = InferModel<typeof articles, 'insert'>;

// Category types
export type Category = InferModel<typeof categories>;
export type NewCategory = InferModel<typeof categories, 'insert'>;

// Classified types
export type Classified = InferModel<typeof classifieds>;
export type NewClassified = InferModel<typeof classifieds, 'insert'>;

// Business types
export type Business = InferModel<typeof businesses>;
export type NewBusiness = InferModel<typeof businesses, 'insert'>;

// Review types
export type Review = InferModel<typeof reviews>;
export type NewReview = InferModel<typeof reviews, 'insert'>;

// Province types
export type Province = InferModel<typeof provinces>;
export type NewProvince = InferModel<typeof provinces, 'insert'>;

// Admin types
export type AdminUser = InferModel<typeof adminUsers>;
export type NewAdminUser = InferModel<typeof adminUsers, 'insert'>;
export type AdminSession = InferModel<typeof adminSessions>;
export type NewAdminSession = InferModel<typeof adminSessions, 'insert'>;

// Audit types
export type AuditLog = InferModel<typeof auditLogs>;
export type NewAuditLog = InferModel<typeof auditLogs, 'insert'>;

// Category types
export type ClassifiedCategory = InferModel<typeof classifiedCategories>;
export type NewClassifiedCategory = InferModel<typeof classifiedCategories, 'insert'>;
export type BusinessCategory = InferModel<typeof businessCategories>;
export type NewBusinessCategory = InferModel<typeof businessCategories, 'insert'>;

// User types
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;
export type UpsertUser = InferModel<typeof users, 'insert'>;


// User preferences types
export type UserPreference = InferModel<typeof userPreferences>;
export type NewUserPreference = InferModel<typeof userPreferences, 'insert'>;

// Common relation types for complex queries
export type ArticleWithRelations = Article & {
  category?: Category;
  province?: Province;
  authorName?: string;
};

export type ClassifiedWithRelations = Classified & {
  category?: ClassifiedCategory;
  province?: Province;
};

export type BusinessWithRelations = Business & {
  category?: BusinessCategory;
  province?: Province;
  reviews?: Review[];
};

export type ReviewWithRelations = Review & {
  business?: Business;
};

// Admin types
export type ModerationQueue = InferModel<typeof moderationQueue>;
export type NewModerationQueue = InferModel<typeof moderationQueue, 'insert'>;

export type Ad = InferModel<typeof ads>;
export type NewAd = InferModel<typeof ads, 'insert'>;

export type AdPlacement = InferModel<typeof adPlacements>;
export type NewAdPlacement = InferModel<typeof adPlacements, 'insert'>;

export type AdAnalytics = InferModel<typeof adAnalytics>;
export type NewAdAnalytics = InferModel<typeof adAnalytics, 'insert'>;

// Editorial workflow types
export type ArticleVersion = InferModel<typeof articleVersions>;
export type NewArticleVersion = InferModel<typeof articleVersions, 'insert'>;

export type ArticleReview = InferModel<typeof articleReviews>;
export type NewArticleReview = InferModel<typeof articleReviews, 'insert'>;

export type EditorialComment = InferModel<typeof editorialComments>;
export type NewEditorialComment = InferModel<typeof editorialComments, 'insert'>;

// Insert types for common operations
export type InsertArticle = NewArticle;
export type InsertClassified = NewClassified;
export type InsertBusiness = NewBusiness;
export type InsertReview = NewReview; 