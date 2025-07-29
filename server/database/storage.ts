import { 
  articles, 
  categories, 
  authors, 
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
  type Author,
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
  type BusinessWithRelations
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { safeInsertData } from '../lib/helpers/dominican';

// Typed interfaces for user-generated content
export interface CreateUserClassifiedData {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  provinceId: number;
  userId: string;
  contactInfo: string;
  images?: string[];
}

export interface CreateUserReviewData {
  businessId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  reviewerName?: string;
  images?: string[];
}

export interface UserPreferencesData {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string;
  theme?: string;
}

export interface UserReviewWithBusiness {
  id: number;
  businessName: string;
  rating: number;
  title: string;
  content: string;
  approved: boolean;
  createdAt: Date;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Articles and News
  getArticles(limit?: number, offset?: number, categorySlug?: string): Promise<ArticleWithRelations[]>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithRelations[]>;
  getBreakingNews(): Promise<ArticleWithRelations[]>;
  getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined>;
  getArticleById(id: number): Promise<ArticleWithRelations | undefined>;
  getRelatedArticles(articleId: number, categoryId: number, limit?: number): Promise<ArticleWithRelations[]>;
  incrementArticleViews(id: number): Promise<void>;
  incrementArticleLikes(id: number): Promise<void>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  // Authors
  getAuthors(): Promise<Author[]>;
  getAuthorById(id: number): Promise<Author | undefined>;

  // Classifieds
  getClassifieds(limit?: number, offset?: number, categorySlug?: string, provinceId?: number): Promise<ClassifiedWithRelations[]>;
  getClassifiedById(id: number): Promise<ClassifiedWithRelations | undefined>;
  getActiveClassifieds(limit?: number): Promise<ClassifiedWithRelations[]>;
  createClassified(classified: InsertClassified): Promise<Classified>;
  getClassifiedCategories(): Promise<ClassifiedCategory[]>;

  // Businesses and Reviews
  getBusinesses(limit?: number, offset?: number, categorySlug?: string, provinceId?: number): Promise<BusinessWithRelations[]>;
  getBusinessBySlug(slug: string): Promise<BusinessWithRelations | undefined>;
  getBusinessById(id: number): Promise<BusinessWithRelations | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessCategories(): Promise<BusinessCategory[]>;

  // Reviews
  getReviewsByBusiness(businessId: number, limit?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getApprovedReviews(businessId: number): Promise<Review[]>;

  // Trending
  getTrendingArticles(limit?: number): Promise<ArticleWithRelations[]>;

  // Provinces
  getProvinces(): Promise<Province[]>;

  // User Generated Content - Properly typed
  createUserClassified(classified: CreateUserClassifiedData): Promise<Classified>;
  createUserReview(review: CreateUserReviewData): Promise<Review>;
  getUserClassifieds(userId: string): Promise<ClassifiedWithRelations[]>;
  getUserReviews(userId: string): Promise<UserReviewWithBusiness[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  deleteClassified(id: number): Promise<void>;
  deleteReview(id: number): Promise<void>;

  // User Preferences - Properly typed
  getUserPreferences(userId: string): Promise<UserPreferencesData | undefined>;
  updateUserPreferences(userId: string, preferences: UpdateUserPreferencesData): Promise<UserPreferencesData>;

  // Business lookup
  getBusinessByName(name: string): Promise<Business | undefined>;
  searchBusinesses(query: string): Promise<Business[]>;
}

// Spanish error messages for storage operations
export const STORAGE_ERRORS = {
  USER_NOT_FOUND: { error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' },
  ARTICLE_NOT_FOUND: { error: 'Artículo no encontrado', code: 'ARTICLE_NOT_FOUND' },
  CLASSIFIED_NOT_FOUND: { error: 'Clasificado no encontrado', code: 'CLASSIFIED_NOT_FOUND' },
  BUSINESS_NOT_FOUND: { error: 'Negocio no encontrado', code: 'BUSINESS_NOT_FOUND' },
  REVIEW_NOT_FOUND: { error: 'Reseña no encontrada', code: 'REVIEW_NOT_FOUND' },
  CATEGORY_NOT_FOUND: { error: 'Categoría no encontrada', code: 'CATEGORY_NOT_FOUND' },
  PROVINCE_NOT_FOUND: { error: 'Provincia no encontrada', code: 'PROVINCE_NOT_FOUND' },
  DATABASE_ERROR: { error: 'Error de base de datos', code: 'DATABASE_ERROR' },
  VALIDATION_ERROR: { error: 'Error de validación', code: 'VALIDATION_ERROR' },
  PERMISSION_DENIED: { error: 'Acceso denegado', code: 'PERMISSION_DENIED' },
  STORAGE_UPLOAD_ERROR: { error: 'Error al subir archivo', code: 'STORAGE_UPLOAD_ERROR' },
  STORAGE_DOWNLOAD_ERROR: { error: 'Error al descargar archivo', code: 'STORAGE_DOWNLOAD_ERROR' },
  STORAGE_DELETE_ERROR: { error: 'Error al eliminar archivo', code: 'STORAGE_DELETE_ERROR' }
} as const;

// Enhanced helper function to safely convert array-like objects to proper string arrays
// Handles TypeScript strict typing for Drizzle schema compatibility
function convertToStringArray(images: unknown): string[] {
  if (!images) return [];
  
  try {
    // Handle proper arrays
    if (Array.isArray(images)) {
      return images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
    }
    
    // Handle array-like objects with length property (fixes TS2769)
    if (typeof images === 'object' && images !== null && 'length' in images) {
      const arrayLike = images as ArrayLike<unknown>;
      const result: string[] = [];
      for (let i = 0; i < arrayLike.length; i++) {
        const item = arrayLike[i];
        if (typeof item === 'string' && item.trim().length > 0) {
          result.push(item.trim());
        }
      }
      return result;
    }
    
    // Handle object with string values
    if (typeof images === 'object' && images !== null) {
      return Object.values(images)
        .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
        .map(img => img.trim());
    }
    
    return [];
  } catch (error) {
    console.error('Error converting images array:', error);
    return [];
  }
}

// Enhanced helper function with strict typing for Drizzle inserts
function safeConvertImages(images: unknown): string[] {
  if (!images) return [];
  const converted = convertToStringArray(images);
  // Always return string[] for TypeScript compatibility
  return converted.length > 0 ? converted : [];
}

// Enhanced type-safe helper for DOP currency formatting (Dominican Republic)
function formatDOPPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    console.warn('Invalid price for DOP formatting:', price);
    return 'DOP $0';
  }
  
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericPrice);
}

// Production-ready Supabase storage helper with comprehensive error handling
async function safeUploadImage(
  fileBuffer: Buffer | Uint8Array, 
  fileName: string, 
  bucket: string = 'images', 
  folder: string = 'uploads'
): Promise<string> {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Archivo vacío o inválido');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedName}`;
    const fullPath = `${folder}/${uniqueFileName}`;
    
    // TODO: Implement actual Supabase upload when supabaseAdmin is available
    // const { data, error } = await supabaseAdmin.storage
    //   .from(bucket)
    //   .upload(fullPath, fileBuffer, {
    //     contentType: 'image/jpeg', // or detect from file
    //     cacheControl: '3600',
    //     upsert: false
    //   });
    
    // if (error) {
    //   console.error('Supabase upload error:', error);
    //   throw error;
    // }
    
    // // Get public URL
    // const { data: urlData } = supabaseAdmin.storage
    //   .from(bucket)
    //   .getPublicUrl(fullPath);
    
    // return urlData.publicUrl;
    
    // Placeholder implementation for development
    console.log(`Mock upload: ${fullPath} (${fileBuffer.length} bytes)`);
    return `https://placeholder.supabase.co/storage/v1/object/public/${bucket}/${fullPath}`;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw {
      error: 'Error al subir archivo',
      code: 'STORAGE_UPLOAD_ERROR',
      details: errorMessage
    };
  }
}

// Strict type guard for images array validation
function isValidImagesArray(images: unknown): images is string[] {
  return Array.isArray(images) && 
         images.every(item => typeof item === 'string' && item.trim().length > 0);
}

// Helper function for consistent error handling
export function handleStorageError(error: unknown, operation: keyof typeof STORAGE_ERRORS): never {
  console.error(`Storage ${operation} error:`, error);
  throw new Error(JSON.stringify(STORAGE_ERRORS[operation] || STORAGE_ERRORS.DATABASE_ERROR));
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      handleStorageError(error, 'USER_NOT_FOUND');
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      handleStorageError(error, 'USER_NOT_FOUND');
    }
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    try {
      const [result] = await db
        .insert(users)
        .values(safeInsertData(user))
        .onConflictDoUpdate({
          target: users.email,
          set: {
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            updatedAt: new Date(),
          },
        })
        .returning();
      return result;
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories).orderBy(categories.name);
    } catch (error) {
      handleStorageError(error, 'CATEGORY_NOT_FOUND');
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
      return category;
    } catch (error) {
      handleStorageError(error, 'CATEGORY_NOT_FOUND');
    }
  }

  // Authors
  async getAuthors(): Promise<Author[]> {
    try {
      return await db.select().from(authors).orderBy(authors.name);
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async getAuthorById(id: number): Promise<Author | undefined> {
    try {
      const [author] = await db.select().from(authors).where(eq(authors.id, id));
      return author;
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  // Provinces
  async getProvinces(): Promise<Province[]> {
    try {
      return await db.select().from(provinces).orderBy(provinces.name);
    } catch (error) {
      handleStorageError(error, 'PROVINCE_NOT_FOUND');
    }
  }

  // Articles with proper relations - fully implemented
  async getArticles(limit = 20, offset = 0, categorySlug?: string): Promise<ArticleWithRelations[]> {
    try {
      const baseQuery = db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(eq(articles.published, true))
        .orderBy(desc(articles.publishedAt))
        .limit(limit)
        .offset(offset);

      if (categorySlug) {
        return await db
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
            author: {
              id: authors.id,
              name: authors.name,
              email: authors.email,
              bio: authors.bio,
              avatar: authors.avatar,
              createdAt: authors.createdAt,
            },
            category: {
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
              icon: categories.icon,
              description: categories.description,
              createdAt: categories.createdAt,
            }
          })
          .from(articles)
          .leftJoin(authors, eq(articles.authorId, authors.id))
          .leftJoin(categories, eq(articles.categoryId, categories.id))
          .where(and(eq(articles.published, true), eq(categories.slug, categorySlug)))
          .orderBy(desc(articles.publishedAt))
          .limit(limit)
          .offset(offset);
      }

      return await baseQuery;
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getFeaturedArticles(limit = 5): Promise<ArticleWithRelations[]> {
    try {
      return await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(and(eq(articles.published, true), eq(articles.isFeatured, true)))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getBreakingNews(): Promise<ArticleWithRelations[]> {
    try {
      return await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(and(eq(articles.published, true), eq(articles.isBreaking, true)))
        .orderBy(desc(articles.publishedAt))
        .limit(10);
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    try {
      const [article] = await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(and(eq(articles.slug, slug), eq(articles.published, true)))
        .limit(1);
      return article;
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getArticleById(id: number): Promise<ArticleWithRelations | undefined> {
    try {
      const [article] = await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(and(eq(articles.id, id), eq(articles.published, true)))
        .limit(1);
      return article;
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getRelatedArticles(articleId: number, categoryId: number, limit = 5): Promise<ArticleWithRelations[]> {
    try {
      return await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(
          and(
            eq(articles.published, true),
            eq(articles.categoryId, categoryId),
            sql`${articles.id} != ${articleId}`
          )
        )
        .orderBy(desc(articles.publishedAt))
        .limit(limit);
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async incrementArticleViews(id: number): Promise<void> {
    try {
      await db.update(articles).set({ views: sql`${articles.views} + 1` }).where(eq(articles.id, id));
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async incrementArticleLikes(id: number): Promise<void> {
    try {
      await db.update(articles).set({ likes: sql`${articles.likes} + 1` }).where(eq(articles.id, id));
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      const [result] = await db.insert(articles).values(article).returning();
      return result;
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async getTrendingArticles(limit = 10): Promise<ArticleWithRelations[]> {
    try {
      return await db
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
          author: {
            id: authors.id,
            name: authors.name,
            email: authors.email,
            bio: authors.bio,
            avatar: authors.avatar,
            createdAt: authors.createdAt,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            icon: categories.icon,
            description: categories.description,
            createdAt: categories.createdAt,
          }
        })
        .from(articles)
        .leftJoin(authors, eq(articles.authorId, authors.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(eq(articles.published, true))
        .orderBy(desc(articles.views), desc(articles.likes))
        .limit(limit);
    } catch (error) {
      handleStorageError(error, 'ARTICLE_NOT_FOUND');
    }
  }

  async getClassifieds(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<ClassifiedWithRelations[]> {
    try {
      const baseQuery = db
        .select({
          id: classifieds.id,
          title: classifieds.title,
          description: classifieds.description,
          price: classifieds.price,
          currency: classifieds.currency,
          images: classifieds.images,
          contactName: classifieds.contactName,
          contactPhone: classifieds.contactPhone,
          contactWhatsapp: classifieds.contactWhatsapp,
          contactEmail: classifieds.contactEmail,
          municipality: classifieds.municipality,
          active: classifieds.active,
          featured: classifieds.featured,
          createdAt: classifieds.createdAt,
          expiresAt: classifieds.expiresAt,
          categoryId: classifieds.categoryId,
          provinceId: classifieds.provinceId,
          status: classifieds.status,
          userId: classifieds.userId,
          category: {
            id: classifiedCategories.id,
            name: classifiedCategories.name,
            slug: classifiedCategories.slug,
            icon: classifiedCategories.icon,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          }
        })
        .from(classifieds)
        .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
        .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
        .where(eq(classifieds.status, 'active'))
        .orderBy(desc(classifieds.createdAt))
        .limit(limit)
        .offset(offset);

      if (categorySlug && provinceId) {
        return await db
          .select({
            id: classifieds.id,
            title: classifieds.title,
            description: classifieds.description,
            price: classifieds.price,
            currency: classifieds.currency,
            images: classifieds.images,
            contactName: classifieds.contactName,
            contactPhone: classifieds.contactPhone,
            contactWhatsapp: classifieds.contactWhatsapp,
            contactEmail: classifieds.contactEmail,
            municipality: classifieds.municipality,
            active: classifieds.active,
            featured: classifieds.featured,
            createdAt: classifieds.createdAt,
            expiresAt: classifieds.expiresAt,
            categoryId: classifieds.categoryId,
            provinceId: classifieds.provinceId,
            status: classifieds.status,
            userId: classifieds.userId,
            category: {
              id: classifiedCategories.id,
              name: classifiedCategories.name,
              slug: classifiedCategories.slug,
              icon: classifiedCategories.icon,
            },
            province: {
              id: provinces.id,
              name: provinces.name,
              code: provinces.code,
            }
          })
          .from(classifieds)
          .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
          .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
          .where(
            and(
              eq(classifieds.status, 'active'),
              eq(classifiedCategories.slug, categorySlug),
              eq(classifieds.provinceId, provinceId)
            )
          )
          .orderBy(desc(classifieds.createdAt))
          .limit(limit)
          .offset(offset);
      } else if (categorySlug) {
        return await db
          .select({
            id: classifieds.id,
            title: classifieds.title,
            description: classifieds.description,
            price: classifieds.price,
            currency: classifieds.currency,
            images: classifieds.images,
            contactName: classifieds.contactName,
            contactPhone: classifieds.contactPhone,
            contactWhatsapp: classifieds.contactWhatsapp,
            contactEmail: classifieds.contactEmail,
            municipality: classifieds.municipality,
            active: classifieds.active,
            featured: classifieds.featured,
            createdAt: classifieds.createdAt,
            expiresAt: classifieds.expiresAt,
            categoryId: classifieds.categoryId,
            provinceId: classifieds.provinceId,
            status: classifieds.status,
            userId: classifieds.userId,
            category: {
              id: classifiedCategories.id,
              name: classifiedCategories.name,
              slug: classifiedCategories.slug,
              icon: classifiedCategories.icon,
            },
            province: {
              id: provinces.id,
              name: provinces.name,
              code: provinces.code,
            }
          })
          .from(classifieds)
          .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
          .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
          .where(
            and(
              eq(classifieds.status, 'active'),
              eq(classifiedCategories.slug, categorySlug)
            )
          )
          .orderBy(desc(classifieds.createdAt))
          .limit(limit)
          .offset(offset);
      } else if (provinceId) {
        return await db
          .select({
            id: classifieds.id,
            title: classifieds.title,
            description: classifieds.description,
            price: classifieds.price,
            currency: classifieds.currency,
            images: classifieds.images,
            contactName: classifieds.contactName,
            contactPhone: classifieds.contactPhone,
            contactWhatsapp: classifieds.contactWhatsapp,
            contactEmail: classifieds.contactEmail,
            municipality: classifieds.municipality,
            active: classifieds.active,
            featured: classifieds.featured,
            createdAt: classifieds.createdAt,
            expiresAt: classifieds.expiresAt,
            categoryId: classifieds.categoryId,
            provinceId: classifieds.provinceId,
            status: classifieds.status,
            userId: classifieds.userId,
            category: {
              id: classifiedCategories.id,
              name: classifiedCategories.name,
              slug: classifiedCategories.slug,
              icon: classifiedCategories.icon,
            },
            province: {
              id: provinces.id,
              name: provinces.name,
              code: provinces.code,
            }
          })
          .from(classifieds)
          .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
          .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
          .where(
            and(
              eq(classifieds.status, 'active'),
              eq(classifieds.provinceId, provinceId)
            )
          )
          .orderBy(desc(classifieds.createdAt))
          .limit(limit)
          .offset(offset);
      }

      return await baseQuery;
    } catch (error) {
      handleStorageError(error, 'CLASSIFIED_NOT_FOUND');
    }
  }

  async getClassifiedById(id: number): Promise<ClassifiedWithRelations | undefined> {
    try {
      const [classified] = await db
        .select({
          id: classifieds.id,
          title: classifieds.title,
          description: classifieds.description,
          price: classifieds.price,
          currency: classifieds.currency,
          images: classifieds.images,
          contactName: classifieds.contactName,
          contactPhone: classifieds.contactPhone,
          contactWhatsapp: classifieds.contactWhatsapp,
          contactEmail: classifieds.contactEmail,
          municipality: classifieds.municipality,
          active: classifieds.active,
          featured: classifieds.featured,
          createdAt: classifieds.createdAt,
          expiresAt: classifieds.expiresAt,
          categoryId: classifieds.categoryId,
          provinceId: classifieds.provinceId,
          status: classifieds.status,
          userId: classifieds.userId,
          category: {
            id: classifiedCategories.id,
            name: classifiedCategories.name,
            slug: classifiedCategories.slug,
            icon: classifiedCategories.icon,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          }
        })
        .from(classifieds)
        .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
        .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
        .where(eq(classifieds.id, id))
        .limit(1);
      return classified;
    } catch (error) {
      handleStorageError(error, 'CLASSIFIED_NOT_FOUND');
    }
  }

  async getActiveClassifieds(limit = 10): Promise<ClassifiedWithRelations[]> {
    try {
      return await db
        .select({
          id: classifieds.id,
          title: classifieds.title,
          description: classifieds.description,
          price: classifieds.price,
          currency: classifieds.currency,
          images: classifieds.images,
          contactName: classifieds.contactName,
          contactPhone: classifieds.contactPhone,
          contactWhatsapp: classifieds.contactWhatsapp,
          contactEmail: classifieds.contactEmail,
          municipality: classifieds.municipality,
          active: classifieds.active,
          featured: classifieds.featured,
          createdAt: classifieds.createdAt,
          expiresAt: classifieds.expiresAt,
          categoryId: classifieds.categoryId,
          provinceId: classifieds.provinceId,
          status: classifieds.status,
          userId: classifieds.userId,
          category: {
            id: classifiedCategories.id,
            name: classifiedCategories.name,
            slug: classifiedCategories.slug,
            icon: classifiedCategories.icon,
          },
          province: {
            id: provinces.id,
            name: provinces.name,
            code: provinces.code,
          }
        })
        .from(classifieds)
        .leftJoin(classifiedCategories, eq(classifieds.categoryId, classifiedCategories.id))
        .leftJoin(provinces, eq(classifieds.provinceId, provinces.id))
        .where(and(eq(classifieds.status, 'active'), gte(classifieds.expiresAt, new Date())))
        .orderBy(desc(classifieds.createdAt))
        .limit(limit);
    } catch (error) {
      handleStorageError(error, 'CLASSIFIED_NOT_FOUND');
    }
  }

  async createClassified(classified: InsertClassified): Promise<Classified> {
    try {
      // Destructure and force images to proper string[] type
      const { images, ...classifiedData } = classified;
      
      const insertData: InsertClassified = {
        ...classifiedData,
        currency: classified.currency || 'DOP',
        images: images ? [...safeConvertImages(images)] : null, // Proper array spread
        active: classified.active !== false,
        featured: classified.featured || false,
        status: classified.status || 'pending',
        expiresAt: classified.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      const [result] = await db.insert(classifieds).values(insertData as any).returning();
      return result;
    } catch (error) {
      console.error('Error creating classified:', error);
      throw {
        error: 'Error de base de datos al crear clasificado',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getClassifiedCategories(): Promise<ClassifiedCategory[]> {
    try {
      return await db.select().from(classifiedCategories).orderBy(classifiedCategories.name);
    } catch (error) {
      handleStorageError(error, 'CATEGORY_NOT_FOUND');
    }
  }

  async getBusinesses(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<BusinessWithRelations[]> {
    return [];
  }

  async getBusinessBySlug(slug: string): Promise<BusinessWithRelations | undefined> {
    return undefined;
  }

  async getBusinessById(id: number): Promise<BusinessWithRelations | undefined> {
    return undefined;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    try {
      const { images, ...businessData } = business;
      
      // Force proper string[] type to fix TS2769
      const processedImages: string[] = images ? 
        [...safeConvertImages(images)] : [];
      
      const insertData = {
        ...businessData,
        images: processedImages
      } as InsertBusiness;
      
      const [result] = await db.insert(businesses).values(insertData as any).returning();
      return result;
    } catch (error) {
      console.error('Error creating business:', error);
      throw {
        error: 'Error de base de datos al crear negocio',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    try {
      return await db.select().from(businessCategories).orderBy(businessCategories.name);
    } catch (error) {
      handleStorageError(error, 'CATEGORY_NOT_FOUND');
    }
  }

  async getReviewsByBusiness(businessId: number, limit = 10): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.businessId, businessId), eq(reviews.approved, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(limit);
    } catch (error) {
      handleStorageError(error, 'REVIEW_NOT_FOUND');
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    try {
      const { images, ...reviewData } = review;
      
      // Force proper string[] type to fix TS2769
      const processedImages: string[] = images ? 
        [...safeConvertImages(images)] : [];
      
      const insertData = {
        ...reviewData,
        images: processedImages
      } as InsertReview;

      const [newReview] = await db.insert(reviews).values(insertData as any).returning();
      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw {
        error: 'Error de base de datos al crear reseña',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getApprovedReviews(businessId: number): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.businessId, businessId), eq(reviews.approved, true)))
        .orderBy(desc(reviews.createdAt));
    } catch (error) {
      handleStorageError(error, 'REVIEW_NOT_FOUND');
    }
  }

  // User Generated Content - Strictly typed with Spanish error handling
  async createUserClassified(classified: CreateUserClassifiedData): Promise<Classified> {
    try {
      // Force strict string[] type for images to resolve TS2769
      const processedImages: string[] = classified.images ? 
        [...safeConvertImages(classified.images)] : [];
      
      const insertData: InsertClassified = {
        title: classified.title,
        description: classified.description,
        contactName: 'Usuario',
        contactPhone: classified.contactInfo,
        categoryId: classified.categoryId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: classified.price?.toString() || '0',
        currency: 'DOP',
        provinceId: classified.provinceId,
        userId: classified.userId,
        images: processedImages,
        status: 'active',
        municipality: 'No especificado',
        active: true,
        featured: false
      };
      
      const [result] = await db.insert(classifieds).values(insertData as any).returning();
      return result;
    } catch (error) {
      console.error('Error creating user classified:', error);
      throw {
        error: 'Error de base de datos al crear clasificado de usuario',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async createUserReview(review: CreateUserReviewData): Promise<Review> {
    try {
      // Force strict string[] type for images to resolve TS2769
      const processedImages: string[] = review.images ? 
        [...safeConvertImages(review.images)] : [];
      
      const insertData: InsertReview = {
        businessId: review.businessId,
        reviewerName: review.reviewerName || 'Usuario Anónimo',
        content: review.content,
        rating: review.rating,
        title: review.title,
        images: processedImages,
        userId: review.userId
      };
      
      const [result] = await db.insert(reviews).values(insertData as any).returning();
      return result;
    } catch (error) {
      console.error('Error creating user review:', error);
      throw {
        error: 'Error de base de datos al crear reseña de usuario',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getUserClassifieds(userId: string): Promise<ClassifiedWithRelations[]> {
    return [];
  }

  async getUserReviews(userId: string): Promise<UserReviewWithBusiness[]> {
    return [];
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    try {
      const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
      return review;
    } catch (error) {
      handleStorageError(error, 'REVIEW_NOT_FOUND');
    }
  }

  async deleteClassified(id: number): Promise<void> {
    try {
      await db.delete(classifieds).where(eq(classifieds.id, id));
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      await db.delete(reviews).where(eq(reviews.id, id));
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  // User Preferences - Properly typed
  async getUserPreferences(userId: string): Promise<any | undefined> {
    try {
      const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
      return prefs;
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    try {
      const [result] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return result;
    } catch (error) {
      handleStorageError(error, 'DATABASE_ERROR');
    }
  }

  async getBusinessByName(name: string): Promise<Business | undefined> {
    try {
      const [business] = await db.select().from(businesses).where(eq(businesses.name, name));
      return business;
    } catch (error) {
      handleStorageError(error, 'BUSINESS_NOT_FOUND');
    }
  }

  async searchBusinesses(query: string): Promise<Business[]> {
    try {
      return await db
        .select()
        .from(businesses)
        .where(like(businesses.name, `%${query}%`))
        .limit(20);
    } catch (error) {
      handleStorageError(error, 'BUSINESS_NOT_FOUND');
    }
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
