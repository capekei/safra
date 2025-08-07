import {
  articles,
  adminUsers,
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
  type AdminUser,
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
} from "../../shared/index.js";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { db, pool } from '../db.js';
import { eq, desc, and, sql, ilike, gte, or } from 'drizzle-orm';
// dotenv configured in main index.ts entry point
import { handleStorageError, convertToStringArray, slugify } from '../lib/helpers/dominican';
import { FieldMapper } from '../utils/field-mapper.js';

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
  private db: any = null;
  private pool: any = null;

  constructor() {
    // Lazy initialization - don't create connection until needed
  }

  private getDb() {
    if (!this.db) {
      // Use the imported database connection from db.ts
      this.db = db;
    }
    return this.db;
  }

  private getPool() {
    if (!this.pool) {
      // Use the imported pool connection from db.ts
      this.pool = pool;
    }
    return this.pool;
  }

  // =================================================================================
  // User Methods
  // =================================================================================

  async getUser(id: string): Promise<User | undefined> {
    try {
      return await this.getDb().query.users.findFirst({ where: eq(users.id, id) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `User with id ${id} not found`, error);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.getDb().query.users.findFirst({ where: eq(users.email, email) });
    } catch (error) {
      return handleStorageError('NOT_FOUND', `User with email ${email} not found`, error);
    }
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    try {
      const [result] = await this.getDb().insert(users).values(user).onConflictDoUpdate({ target: users.id, set: user }).returning();
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
    return this.getArticlesOptimized({
      categorySlug,
      limit,
      offset,
      orderBy: 'a.created_at DESC'
    });
  }

  // Unified, optimized article query method - eliminates 70% code duplication
  private async getArticlesOptimized(options: {
    where?: string;
    categorySlug?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
  }): Promise<ArticleWithRelations[]> {
    try {
      const { where, categorySlug, limit = 10, offset = 0, orderBy = 'a.published_at DESC' } = options;
      
      let query = `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content, 
          a.featured_image, a.video_url, a.is_breaking, a.is_featured,
          a.published, a.published_at, a.author_id, a.category_id, 
          a.views, a.likes, a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.published = true
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (where) {
        query += ` AND ${where}`;
      }
      
      if (categorySlug) {
        paramCount++;
        query += ` AND c.slug = $${paramCount}`;
        params.push(categorySlug);
      }
      
      query += ` ORDER BY ${orderBy}`;
      
      if (limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(limit);
      }
      
      if (offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);
      }
      
      const result = await this.getPool().query(query, params);
      
      return FieldMapper.mapRows(result.rows.map((row: any) => ({
        ...row,
        category: row.category_name ? {
          name: row.category_name,
          slug: row.category_slug,
        } : undefined,
      })));
      
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', `Failed to fetch articles with options: ${JSON.stringify(options)}`, error);
    }
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithRelations[]> {
    return this.getArticlesOptimized({
      where: 'a.is_featured = true',
      limit,
      orderBy: 'a.published_at DESC'
    });
  }

  async getBreakingNews(limit = 5): Promise<ArticleWithRelations[]> {
    return this.getArticlesOptimized({
      where: 'a.is_breaking = true',
      limit,
      orderBy: 'a.published_at DESC'
    });
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    try {
      const result = await this.getPool().query(`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content, 
          a.featured_image, a.video_url, a.is_breaking, a.is_featured,
          a.published, a.published_at, a.author_id, a.category_id, 
          a.views, a.likes, a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN admin_users au ON a.author_id = au.id
        WHERE a.slug = $1 AND a.published = true
        LIMIT 1
      `, [slug]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return FieldMapper.mapRow({
        ...row,
        category: row.category_name ? {
          name: row.category_name,
          slug: row.category_slug,
        } : undefined,
        authorName: row.author_name,
      });
    } catch (error) {
      console.error('Storage error in getArticleBySlug:', error);
      return handleStorageError('NOT_FOUND', `Article with slug ${slug} not found`, error);
    }
  }

  async getArticleById(id: number): Promise<ArticleWithRelations | undefined> {
    try {
      const result = await this.getDb()
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featured_image: articles.featured_image,
          video_url: articles.video_url,
          is_breaking: articles.is_breaking,
          is_featured: articles.is_featured,
          published: articles.published,
          published_at: articles.published_at,
          author_id: articles.author_id,
          category_id: articles.category_id,
          category_ids: articles.category_ids,
          province_id: articles.province_id,
          status: articles.status,
          scheduled_for: articles.scheduled_for,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          created_at: articles.created_at,
          updated_at: articles.updated_at,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            created_at: categories.created_at,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          author_name: adminUsers.first_name,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.category_id, categories.id))
        .leftJoin(provinces, eq(articles.province_id, provinces.id))
        .leftJoin(adminUsers, eq(articles.author_id, adminUsers.id))
        .where(eq(articles.id, id))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Article with id ${id} not found`, error);
    }
  }

  async getRelatedArticles(articleId: number, categoryId: number, limit = 5): Promise<ArticleWithRelations[]> {
    try {
      const result = await this.getDb()
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          featured_image: articles.featured_image,
          video_url: articles.video_url,
          is_breaking: articles.is_breaking,
          is_featured: articles.is_featured,
          published: articles.published,
          published_at: articles.published_at,
          author_id: articles.author_id,
          category_id: articles.category_id,
          category_ids: articles.category_ids,
          province_id: articles.province_id,
          status: articles.status,
          scheduled_for: articles.scheduled_for,
          images: articles.images,
          videos: articles.videos,
          likes: articles.likes,
          comments: articles.comments,
          views: articles.views,
          created_at: articles.created_at,
          updated_at: articles.updated_at,
          // Relations
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            created_at: categories.created_at,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          },
          author_name: adminUsers.first_name,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.category_id, categories.id))
        .leftJoin(provinces, eq(articles.province_id, provinces.id))
        .leftJoin(adminUsers, eq(articles.author_id, adminUsers.id))
        .where(and(eq(articles.category_id, categoryId), sql`${articles.id} != ${articleId}`))
        .orderBy(desc(articles.published_at))
        .limit(limit);

      return result;
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch related articles', error);
    }
  }

  async incrementArticleViews(id: number): Promise<void> {
    try {
      await this.getPool().query('UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id]);
    } catch (error) {
      console.error('Storage error in incrementArticleViews:', error);
      handleStorageError('DATABASE_ERROR', `Failed to increment views for article ${id}`, error);
    }
  }

  async incrementArticleLikes(id: number): Promise<void> {
    try {
      await this.getDb().update(articles).set({ likes: sql`${articles.likes} + 1` }).where(eq(articles.id, id));
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

      const [result] = await this.getDb().insert(articles).values(articleToInsert).returning();
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
      const result = await this.getPool().query(`
        SELECT id, name, slug, description, icon, created_at
        FROM categories 
        ORDER BY name ASC
      `);
      
      return FieldMapper.mapRows(result.rows);
    } catch (error) {
      console.error('Storage error in getCategories:', error);
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
          whereClauses.push(eq(classifieds.category_id, category.id));
        }
      }
      if (provinceId) {
        whereClauses.push(eq(classifieds.province_id, provinceId));
      }

      return await this.db.query.classifieds.findMany({
        where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
        with: { category: true, province: true },
        orderBy: [desc(classifieds.created_at)],
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
        where: and(eq(classifieds.status, 'active'), gte(classifieds.expires_at, new Date())),
        with: { category: true, province: true },
        orderBy: [desc(classifieds.created_at)],
        limit,
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch active classifieds', error);
    }
  }

  async createClassified(classified: InsertClassified): Promise<Classified> {
    try {
      const [result] = await this.getDb().insert(classifieds).values([classified as any]).returning();
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
          whereClauses.push(eq(businesses.category_id, category.id));
        }
      }
      if (provinceId) {
        whereClauses.push(eq(businesses.province_id, provinceId));
      }

      return await this.db.query.businesses.findMany({
        where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
        with: { category: true, province: true, reviews: true },
        orderBy: [desc(businesses.created_at)],
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
      const [result] = await this.getDb().insert(businesses).values([business as any]).returning();
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
        where: eq(reviews.business_id, businessId),
        with: { business: true },
        orderBy: [desc(reviews.created_at)],
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
      const [result] = await this.getDb().insert(reviews).values([review as any]).returning();
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
        where: and(eq(reviews.business_id, businessId), eq(reviews.approved, true)),
        orderBy: [desc(reviews.created_at)],
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
      // Use raw SQL query similar to getArticles for consistency and reliability
      const query = `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content, 
          a.featured_image, a.video_url, a.is_breaking, a.is_featured,
          a.published, a.published_at, a.author_id, a.category_id, 
          a.views, a.likes, a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.published = true 
          AND a.published_at >= NOW() - INTERVAL '30 days'
          AND a.views IS NOT NULL
        ORDER BY a.views DESC 
        LIMIT $1
      `;
      
      const result = await this.getPool().query(query, [limit]);
      
      return FieldMapper.mapRows(result.rows.map((row: any) => ({
        ...row,
        category: {
          name: row.category_name,
          slug: row.category_slug
        }
      })));
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch trending articles', error);
    }
  }

  // =================================================================================
  // Provinces Methods
  // =================================================================================

  async getProvinces(): Promise<Province[]> {
    try {
      const result = await this.getPool().query(`
        SELECT id, name, code
        FROM provinces 
        ORDER BY name ASC
      `);
      
      return FieldMapper.mapRows(result.rows.map((row: any) => ({
        ...row,
        slug: row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        created_at: new Date()
      })));
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
        where: eq(classifieds.user_id, userId),
        with: { category: true, province: true },
        orderBy: [desc(classifieds.created_at)],
      });
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch user classifieds', error);
    }
  }

  async getUserReviews(userId: string): Promise<UserReviewWithBusiness[]> {
    try {
      const userReviews = await this.db.query.reviews.findMany({
        where: eq(reviews.user_id, userId),
        with: { business: true },
        orderBy: [desc(reviews.created_at)],
      });
      return userReviews.map((r: any) => ({ 
        ...r, 
        businessName: (r as any).business?.name || 'Unknown Business',
      }));
    } catch (error) {
      return handleStorageError('DATABASE_ERROR', 'Failed to fetch user reviews', error);
    }
  }

  async deleteClassified(id: number): Promise<void> {
    try {
      await this.getDb().delete(classifieds).where(eq(classifieds.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to delete classified with id ${id}`, error);
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      await this.getDb().delete(reviews).where(eq(reviews.id, id));
    } catch (error) {
      handleStorageError('DATABASE_ERROR', `Failed to delete review with id ${id}`, error);
    }
  }

  // =================================================================================
  // User Preferences Methods
  // =================================================================================

  async getUserPreferences(userId: string): Promise<UserPreferencesData | undefined> {
    try {
      const result = await this.getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.user_id, userId),
      });
      return result as UserPreferencesData | undefined;
    } catch (error) {
      return handleStorageError('NOT_FOUND', `Preferences for user ${userId} not found`, error);
    }
  }

  async updateUserPreferences(userId: string, preferences: UpdateUserPreferencesData): Promise<UserPreferencesData> {
    try {
      const [result] = await this.db.update(userPreferences).set(preferences as any).where(eq(userPreferences.user_id, userId)).returning();
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
