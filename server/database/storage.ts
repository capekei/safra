import {
  articles,
  categories,
  classifieds,
  classifiedCategories,
  businesses,
  businessCategories,
  reviews,
  provinces,
  users,
  userPreferences,
  type Article,
  type Category,
  type Classified,
  type ClassifiedCategory,
  type Business,
  type BusinessCategory,
  type Review,
  type Province,
  type User,
  type UpsertUser,
  type InsertArticle,
  type InsertClassified,
  type InsertBusiness,
  type InsertReview,
  type ArticleWithRelations,
  type ClassifiedWithRelations,
  type BusinessWithRelations,
  type ReviewWithRelations
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, sql, ilike, gte, or } from 'drizzle-orm';
import { handleStorageError, convertToStringArray, slugify } from '../lib/helpers/dominican';

// Typed interfaces for user-generated content
export interface CreateUserClassifiedData {
  title: string;
  description: string;
  contactInfo: string;
  categoryId: number;
  provinceId: number;
  price?: number;
  images?: string[];
  userId: string;
}

export interface CreateUserReviewData {
  businessId: number;
  reviewerName?: string;
  content: string;
  rating: number;
  title: string;
  images?: string[];
  userId: string;
}

export interface UserPreferencesData {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  preferredCategories: string[];
  preferredProvinces: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesData {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  preferredCategories?: string[];
  preferredProvinces?: string[];
}

export interface UserReviewWithBusiness extends Review {
  businessName: string;
}

// Storage interface definition
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Articles and news
  getArticles(limit?: number, offset?: number, categorySlug?: string): Promise<ArticleWithRelations[]>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithRelations[]>;
  getBreakingNews(limit?: number): Promise<ArticleWithRelations[]>;
  getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined>;
  getArticleById(id: number): Promise<ArticleWithRelations | undefined>;
  getRelatedArticles(articleId: number, categoryId: number, limit?: number): Promise<ArticleWithRelations[]>;
  incrementArticleViews(id: number): Promise<void>;
  incrementArticleLikes(id: number): Promise<void>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  // Classifieds
  getClassifieds(limit?: number, offset?: number, categorySlug?: string, provinceId?: number): Promise<ClassifiedWithRelations[]>;
  getClassifiedById(id: number): Promise<ClassifiedWithRelations | undefined>;
  getActiveClassifieds(limit?: number): Promise<ClassifiedWithRelations[]>;
  createClassified(classified: InsertClassified): Promise<Classified>;
  getClassifiedCategories(): Promise<ClassifiedCategory[]>;

  // Businesses
  getBusinesses(limit?: number, offset?: number, categorySlug?: string, provinceId?: number): Promise<BusinessWithRelations[]>;
  getBusinessBySlug(slug: string): Promise<BusinessWithRelations | undefined>;
  getBusinessById(id: number): Promise<BusinessWithRelations | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessCategories(): Promise<BusinessCategory[]>;

  // Reviews
  getReviewsByBusiness(businessId: number, limit?: number): Promise<ReviewWithRelations[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  getApprovedReviews(businessId: number): Promise<Review[]>;

  // Trending and provinces
  getTrendingArticles(limit?: number): Promise<ArticleWithRelations[]>;
  getProvinces(): Promise<Province[]>;

  // User-generated content
  createUserClassified(classified: CreateUserClassifiedData): Promise<Classified>;
  createUserReview(review: CreateUserReviewData): Promise<Review>;
  getUserClassifieds(userId: string): Promise<ClassifiedWithRelations[]>;
  getUserReviews(userId: string): Promise<UserReviewWithBusiness[]>;
  deleteClassified(id: number): Promise<void>;
  deleteReview(id: number): Promise<void>;

  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferencesData | undefined>;
  updateUserPreferences(userId: string, preferences: UpdateUserPreferencesData): Promise<UserPreferencesData>;

  // Business lookup
  getBusinessByName(name: string): Promise<Business | undefined>;
  searchBusinesses(query: string): Promise<Business[]>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    this.db = db;
  }

  // =================================================================================
  // User Methods
  // =================================================================================

  async getUser(id: string): Promise<User | undefined> {
    try {
      return await this.db.query.users.findFirst({ where: eq(users.id, id) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `User with id ${id} not found`, error);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.db.query.users.findFirst({ where: eq(users.email, email) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `User with email ${email} not found`, error);
    }
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    try {
      const [result] = await this.db.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: user }).returning();
      if (!result) {
        throw new Error('Upsert operation failed to return user.');
      }
      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to upsert user', error);
    }
  }

  // =================================================================================
  // Articles and News Methods
  // =================================================================================

  async getArticles(limit = 10, offset = 0, categorySlug?: string): Promise<ArticleWithRelations[]> {
    try {
      if (categorySlug) {
        const category = await this.getCategoryBySlug(categorySlug);
        if (!category) return [];

        return await this.db
          .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            excerpt: articles.excerpt,
            content: articles.content,
            featuredImage: articles.featuredImage,
            videoUrl: articles.videoUrl,
            isBreaking: articles.isBreaking,
            isFeatured: articles.isFeatured,
            published: articles.published,
            publishedAt: articles.publishedAt,
            authorId: articles.authorId,
            categoryId: articles.categoryId,
            categoryIds: articles.categoryIds,
            provinceId: articles.provinceId,
            status: articles.status,
            scheduledFor: articles.scheduledFor,
            images: articles.images,
            videos: articles.videos,
            likes: articles.likes,
            comments: articles.comments,
            views: articles.views,
            createdAt: articles.createdAt,
            updatedAt: articles.updatedAt,
            category: {
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
              icon: categories.icon,
              description: categories.description,
              createdAt: categories.createdAt,
            },
            province: {
              id: provinces.id,
              name: provinces.name,
              code: provinces.code,
            },
            authorUsername: users.firstName,
          })
          .from(articles)
          .leftJoin(categories, eq(articles.categoryId, categories.id))
          .leftJoin(provinces, eq(articles.provinceId, provinces.id))
          .leftJoin(users, eq(articles.authorId, users.id))
          .where(and(eq(articles.categoryId, category.id), eq(articles.published, true)))
          .orderBy(desc(articles.publishedAt))
          .offset(offset)
          .limit(limit);
      }
      return await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(eq(articles.published, true))
        .orderBy(desc(articles.publishedAt))
        .offset(offset)
        .limit(limit);
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch articles', error);
    }
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithRelations[]> {
    try {
      return await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(and(eq(articles.isFeatured, true), eq(articles.published, true)))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch featured articles', error);
    }
  }

  async getBreakingNews(limit = 5): Promise<ArticleWithRelations[]> {
    try {
      return await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(and(eq(articles.isBreaking, true), eq(articles.published, true)))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch breaking news', error);
    }
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    try {
      const result = await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(eq(articles.slug, slug))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Article with slug ${slug} not found`, error);
    }
  }

  async getArticleById(id: number): Promise<ArticleWithRelations | undefined> {
    try {
      const result = await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(eq(articles.id, id))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Article with id ${id} not found`, error);
    }
  }

  async getRelatedArticles(articleId: number, categoryId: number, limit = 5): Promise<ArticleWithRelations[]> {
    try {
      const result = await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          // Relations
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(and(eq(articles.categoryId, categoryId), sql`${articles.id} != ${articleId}`))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);

      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch related articles', error);
    }
  }

  async incrementArticleViews(id: number): Promise<void> {
    try {
      await this.db.update(articles).set({ views: sql`${articles.views} + 1` }).where(eq(articles.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to increment views for article ${id}`, error);
    }
  }

  async incrementArticleLikes(id: number): Promise<void> {
    try {
      await this.db.update(articles).set({ likes: sql`${articles.likes} + 1` }).where(eq(articles.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to increment likes for article ${id}`, error);
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      const articleToInsert = {
        ...article,
        slug: slugify(article.title),
        images: convertToStringArray(article.images),
        videos: convertToStringArray(article.videos),
      };

      const [result] = await this.db.insert(articles).values(articleToInsert).returning();
      if (!result) {
        throw new Error('Article creation failed.');
      }
      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to create article', error);
    }
  }

  // =================================================================================
  // Category Methods
  // =================================================================================

  async getCategories(): Promise<Category[]> {
    try {
      return await this.db.query.categories.findMany({ orderBy: [desc(categories.name)] });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch categories', error);
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      return await this.db.query.categories.findFirst({ where: eq(categories.slug, slug) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Category with slug ${slug} not found`, error);
    }
  }

  // =================================================================================
  // Classifieds Methods
  // =================================================================================

  async getClassifieds(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<ClassifiedWithRelations[]> {
    try {
      const whereClauses = [];
      if (categorySlug) {
        const category = await this.getClassifiedCategoryBySlug(categorySlug);
        if(category) {
          whereClauses.push(eq(classifieds.categoryId, category.id));
        }
      }
      if (provinceId) {
        whereClauses.push(eq(classifieds.provinceId, provinceId));
      }

      return await this.db.query.classifieds.findMany({
        where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
        with: { category: true, province: true },
        orderBy: [desc(classifieds.createdAt)],
        limit,
        offset,
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch classifieds', error);
    }
  }

  async getClassifiedById(id: number): Promise<ClassifiedWithRelations | undefined> {
    try {
      return await this.db.query.classifieds.findFirst({
        where: eq(classifieds.id, id),
        with: { category: true, province: true },
      });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Classified with id ${id} not found`, error);
    }
  }

  async getActiveClassifieds(limit = 10): Promise<ClassifiedWithRelations[]> {
    try {
      return await this.db.query.classifieds.findMany({
        where: and(eq(classifieds.status, 'active'), gte(classifieds.expiresAt, new Date())),
        with: { category: true, province: true },
        orderBy: [desc(classifieds.createdAt)],
        limit,
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch active classifieds', error);
    }
  }

  async createClassified(classified: InsertClassified): Promise<Classified> {
    try {
      const [result] = await this.db.insert(classifieds).values([classified as any]).returning();
      if (!result) {
        throw new Error('Classified creation failed.');
      }
      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to create classified', error);
    }
  }

  async getClassifiedCategories(): Promise<ClassifiedCategory[]> {
    try {
      return await this.db.query.classifiedCategories.findMany({ orderBy: [desc(classifiedCategories.name)] });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch classified categories', error);
    }
  }

  private async getClassifiedCategoryBySlug(slug: string): Promise<ClassifiedCategory | undefined> {
    try {
      return await this.db.query.classifiedCategories.findFirst({ where: eq(classifiedCategories.slug, slug) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Classified category with slug ${slug} not found`, error);
    }
  }

  // =================================================================================
  // Businesses and Reviews Methods
  // =================================================================================

  async getBusinesses(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<BusinessWithRelations[]> {
    try {
      const whereClauses = [];
      if (categorySlug) {
        const category = await this.getBusinessCategoryBySlug(categorySlug);
        if(category) {
          whereClauses.push(eq(businesses.categoryId, category.id));
        }
      }
      if (provinceId) {
        whereClauses.push(eq(businesses.provinceId, provinceId));
      }

      return await this.db.query.businesses.findMany({
        where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
        with: { category: true, province: true, reviews: true },
        orderBy: [desc(businesses.createdAt)],
        limit,
        offset,
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch businesses', error);
    }
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithRelations | undefined> {
    try {
      return await this.db.query.businesses.findFirst({
        where: eq(businesses.slug, slug),
        with: { category: true, province: true, reviews: true },
      });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Business with slug ${slug} not found`, error);
    }
  }

  async getBusinessById(id: number): Promise<BusinessWithRelations | undefined> {
    try {
      return await this.db.query.businesses.findFirst({
        where: eq(businesses.id, id),
        with: { category: true, province: true, reviews: true },
      });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Business with id ${id} not found`, error);
    }
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    try {
      const [result] = await this.db.insert(businesses).values([business as any]).returning();
      if (!result) {
        throw new Error('Business creation failed.');
      }
      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to create business', error);
    }
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    try {
      return await this.db.query.businessCategories.findMany({ orderBy: [desc(businessCategories.name)] });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch business categories', error);
    }
  }

  private async getBusinessCategoryBySlug(slug: string): Promise<BusinessCategory | undefined> {
    try {
      return await this.db.query.businessCategories.findFirst({ where: eq(businessCategories.slug, slug) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Business category with slug ${slug} not found`, error);
    }
  }

  // =================================================================================
  // Reviews Methods
  // =================================================================================

  async getReviewsByBusiness(businessId: number, limit = 10): Promise<ReviewWithRelations[]> {
    try {
      return await this.db.query.reviews.findMany({
        where: eq(reviews.businessId, businessId),
        with: { business: true },
        orderBy: [desc(reviews.createdAt)],
        limit,
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch reviews', error);
    }
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    try {
      return await this.db.query.reviews.findFirst({
        where: eq(reviews.id, id),
      });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Review with id ${id} not found`, error);
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    try {
      const [result] = await this.db.insert(reviews).values([review as any]).returning();
      if (!result) {
        throw new Error('Review creation failed.');
      }
      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to create review', error);
    }
  }

  async getApprovedReviews(businessId: number): Promise<Review[]> {
    try {
      return await this.db.query.reviews.findMany({
        where: and(eq(reviews.businessId, businessId), eq(reviews.approved, true)),
        orderBy: [desc(reviews.createdAt)],
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch approved reviews', error);
    }
  }

  // =================================================================================
  // Trending Methods
  // =================================================================================

  async getTrendingArticles(limit = 5): Promise<ArticleWithRelations[]> {
    try {
      const result = await this.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featuredImage: articles.featuredImage,
          videoUrl: articles.videoUrl,
          isBreaking: articles.isBreaking,
          isFeatured: articles.isFeatured,
          published: articles.published,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
          categoryIds: articles.categoryIds,
          provinceId: articles.provinceId,
          status: articles.status,
          scheduledFor: articles.scheduledFor,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          // Relations
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          authorUsername: users.firstName,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(provinces, eq(articles.provinceId, provinces.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(gte(articles.publishedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
        .orderBy(desc(articles.views))
        .limit(limit);

      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch trending articles', error);
    }
  }

  // =================================================================================
  // Provinces Methods
  // =================================================================================

  async getProvinces(): Promise<Province[]> {
    try {
      return await this.db.query.provinces.findMany({ orderBy: [desc(provinces.name)] });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch provinces', error);
    }
  }

  // =================================================================================
  // User Generated Content Methods
  // =================================================================================

  async createUserClassified(classifiedData: CreateUserClassifiedData): Promise<Classified> {
    return this.createClassified(classifiedData as unknown as InsertClassified);
  }

  async createUserReview(reviewData: CreateUserReviewData): Promise<Review> {
    return this.createReview(reviewData as InsertReview);
  }

  async getUserClassifieds(userId: string): Promise<ClassifiedWithRelations[]> {
    try {
      return await this.db.query.classifieds.findMany({
        where: eq(classifieds.userId, userId),
        with: { category: true, province: true },
        orderBy: [desc(classifieds.createdAt)],
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch user classifieds', error);
    }
  }

  async getUserReviews(userId: string): Promise<UserReviewWithBusiness[]> {
    try {
      const userReviews = await this.db.query.reviews.findMany({
        where: eq(reviews.userId, userId),
        with: { business: true },
        orderBy: [desc(reviews.createdAt)],
      });
      return userReviews.map(r => ({ 
        ...r, 
        businessName: r.business.name,
      }));
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch user reviews', error);
    }
  }

  async deleteClassified(id: number): Promise<void> {
    try {
      await this.db.delete(classifieds).where(eq(classifieds.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to delete classified with id ${id}`, error);
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      await this.db.delete(reviews).where(eq(reviews.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to delete review with id ${id}`, error);
    }
  }

  // =================================================================================
  // User Preferences Methods
  // =================================================================================

  async getUserPreferences(userId: string): Promise<UserPreferencesData | undefined> {
    try {
      const result = await this.db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
      return result as UserPreferencesData | undefined;
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Preferences for user ${userId} not found`, error);
    }
  }

  async updateUserPreferences(userId: string, preferences: UpdateUserPreferencesData): Promise<UserPreferencesData> {
    try {
      const [result] = await this.db.update(userPreferences).set(preferences as any).where(eq(userPreferences.userId, userId)).returning();
      if(!result) {
        throw new Error('Failed to update preferences');
      }
      return result as unknown as UserPreferencesData;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', `Failed to update preferences for user ${userId}`, error);
    }
  }

  // =================================================================================
  // Business Lookup Methods
  // =================================================================================

  async getBusinessByName(name: string): Promise<Business | undefined> {
    try {
      return await this.db.query.businesses.findFirst({ where: ilike(businesses.name, `%${name}%`) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Business with name ${name} not found`, error);
    }
  }

  async searchBusinesses(query: string): Promise<Business[]> {
    try {
      return await this.db.query.businesses.findMany({ 
        where: or(ilike(businesses.name, `%${query}%`), ilike(businesses.description, `%${query}%`))
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Error searching businesses', error);
    }
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
