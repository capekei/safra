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
import { db } from "./db";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";

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

  // User Generated Content
  createUserClassified(classified: any): Promise<any>;
  createUserReview(review: any): Promise<any>;
  getUserClassifieds(userId: string): Promise<any[]>;
  getUserReviews(userId: string): Promise<any[]>;
  getClassifiedById(id: number): Promise<any | undefined>;
  getReviewById(id: number): Promise<any | undefined>;
  deleteClassified(id: number): Promise<void>;
  deleteReview(id: number): Promise<void>;

  // User Preferences
  getUserPreferences(userId: string): Promise<any | undefined>;
  updateUserPreferences(userId: string, preferences: any): Promise<any>;

  // Business lookup
  getBusinessByName(name: string): Promise<Business | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Articles and News
  async getArticles(limit: number = 20, offset: number = 0, categorySlug?: string) {
    try {
      console.log(`Storage: Getting articles with limit=${limit}, offset=${offset}, category=${categorySlug}`);

      let query = db
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
        .where(eq(articles.published, true));

      if (categorySlug) {
        query = query.where(
          and(
            eq(articles.published, true),
            eq(categories.slug, categorySlug)
          )
        );
      }

      const result = await query;
      console.log(`Storage: Found ${result.length} articles`);
      return result;
    } catch (error) {
      console.error('Error in getArticles:', error);
      console.error('Database connection status:', db ? 'Connected' : 'Not connected');
      throw error;
    }
  }

  async getFeaturedArticles(limit = 5): Promise<Article[]> {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        isBreaking: articles.isBreaking,
        isFeatured: articles.isFeatured,
        published: articles.published,
        publishedAt: articles.publishedAt,
        authorId: articles.authorId,
        categoryId: articles.categoryId,
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
  }

  async getBreakingNews(): Promise<Article[]> {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        isBreaking: articles.isBreaking,
        isFeatured: articles.isFeatured,
        published: articles.published,
        publishedAt: articles.publishedAt,
        authorId: articles.authorId,
        categoryId: articles.categoryId,
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
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined> {
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        isBreaking: articles.isBreaking,
        isFeatured: articles.isFeatured,
        published: articles.published,
        publishedAt: articles.publishedAt,
        authorId: articles.authorId,
        categoryId: articles.categoryId,
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
      .where(and(eq(articles.published, true), eq(articles.slug, slug)))
      .limit(1);

    return result[0] || undefined;
  }

  async getArticleById(id: number): Promise<ArticleWithRelations | undefined> {
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        isBreaking: articles.isBreaking,
        isFeatured: articles.isFeatured,
        published: articles.published,
        publishedAt: articles.publishedAt,
        authorId: articles.authorId,
        categoryId: articles.categoryId,
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
      .where(eq(articles.id, id))
      .limit(1);

    return result[0] || undefined;
  }

  async getRelatedArticles(articleId: number, categoryId: number, limit = 4): Promise<ArticleWithRelations[]> {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        isBreaking: articles.isBreaking,
        isFeatured: articles.isFeatured,
        published: articles.published,
        publishedAt: articles.publishedAt,
        authorId: articles.authorId,
        categoryId: articles.categoryId,
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
      .where(and(
        eq(articles.published, true),
        eq(articles.categoryId, categoryId),
        sql`${articles.id} != ${articleId}`
      ))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  async incrementArticleViews(id: number): Promise<void> {
    await db
      .update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, id));
  }

  async incrementArticleLikes(id: number): Promise<void> {
    await db
      .update(articles)
      .set({ likes: sql`${articles.likes} + 1` })
      .where(eq(articles.id, id));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db
      .insert(articles)
      .values(article)
      .returning();
    return newArticle;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  // Authors
  async getAuthors(): Promise<Author[]> {
    return await db.select().from(authors).orderBy(authors.name);
  }

  async getAuthorById(id: number): Promise<Author | undefined> {
    const [author] = await db.select().from(authors).where(eq(authors.id, id));
    return author || undefined;
  }

  // Classifieds
  async getClassifieds(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<Classified[]> {
    let query = db
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
        provinceId: classifieds.provinceId,
        municipality: classifieds.municipality,
        categoryId: classifieds.categoryId,
        active: classifieds.active,
        featured: classifieds.featured,
        expiresAt: classifieds.expiresAt,
        createdAt: classifieds.createdAt,
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
      .where(and(eq(classifieds.active, true), gte(classifieds.expiresAt, new Date())));

    if (categorySlug) {
      query = query.where(and(
        eq(classifieds.active, true), 
        gte(classifieds.expiresAt, new Date()),
        eq(classifiedCategories.slug, categorySlug)
      ));
    }

    if (provinceId) {
      query = query.where(and(
        eq(classifieds.active, true), 
        gte(classifieds.expiresAt, new Date()),
        eq(classifieds.provinceId, provinceId)
      ));
    }

    return await query
      .orderBy(desc(classifieds.featured), desc(classifieds.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getClassifiedById(id: number): Promise<Classified | undefined> {
    const result = await db
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
        provinceId: classifieds.provinceId,
        municipality: classifieds.municipality,
        categoryId: classifieds.categoryId,
        active: classifieds.active,
        featured: classifieds.featured,
        expiresAt: classifieds.expiresAt,
        createdAt: classifieds.createdAt,
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

    return result[0] || undefined;
  }

  async getActiveClassifieds(limit = 20): Promise<Classified[]> {
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
        provinceId: classifieds.provinceId,
        municipality: classifieds.municipality,
        categoryId: classifieds.categoryId,
        active: classifieds.active,
        featured: classifieds.featured,
        expiresAt: classifieds.expiresAt,
        createdAt: classifieds.createdAt,
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
      .where(and(eq(classifieds.active, true), gte(classifieds.expiresAt, new Date())))
      .orderBy(desc(classifieds.featured), desc(classifieds.createdAt))
      .limit(limit);
  }

  async createClassified(classified: InsertClassified): Promise<Classified> {
    const [newClassified] = await db
      .insert(classifieds)
      .values(classified)
      .returning();
    return newClassified;
  }

  async getClassifiedCategories(): Promise<ClassifiedCategory[]> {
    return await db.select().from(classifiedCategories).orderBy(classifiedCategories.name);
  }

  // Businesses
  async getBusinesses(limit = 20, offset = 0, categorySlug?: string, provinceId?: number): Promise<Business[]> {
    let query = db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        email: businesses.email,
        website: businesses.website,
        images: businesses.images,
        priceRange: businesses.priceRange,
        categoryId: businesses.categoryId,
        provinceId: businesses.provinceId,
        municipality: businesses.municipality,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        verified: businesses.verified,
        active: businesses.active,
        createdAt: businesses.createdAt,
        category: {
          id: businessCategories.id,
          name: businessCategories.name,
          slug: businessCategories.slug,
          icon: businessCategories.icon,
        },
        province: {
          id: provinces.id,
          name: provinces.name,
          code: provinces.code,
        }
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
      .where(eq(businesses.active, true));

    if (categorySlug) {
      query = query.where(and(eq(businesses.active, true), eq(businessCategories.slug, categorySlug)));
    }

    if (provinceId) {
      query = query.where(and(eq(businesses.active, true), eq(businesses.provinceId, provinceId)));
    }

    return await query
      .orderBy(desc(businesses.verified), desc(businesses.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        email: businesses.email,
        website: businesses.website,
        images: businesses.images,
        priceRange: businesses.priceRange,
        categoryId: businesses.categoryId,
        provinceId: businesses.provinceId,
        municipality: businesses.municipality,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        verified: businesses.verified,
        active: businesses.active,
        createdAt: businesses.createdAt,
        category: {
          id: businessCategories.id,
          name: businessCategories.name,
          slug: businessCategories.slug,
          icon: businessCategories.icon,
        },
        province: {
          id: provinces.id,
          name: provinces.name,
          code: provinces.code,
        }
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
      .where(and(eq(businesses.active, true), eq(businesses.slug, slug)))
      .limit(1);

    return result[0] || undefined;
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        address: businesses.address,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        email: businesses.email,
        website: businesses.website,
        images: businesses.images,
        priceRange: businesses.priceRange,
        categoryId: businesses.categoryId,
        provinceId: businesses.provinceId,
        municipality: businesses.municipality,
        averageRating: businesses.averageRating,
        totalReviews: businesses.totalReviews,
        verified: businesses.verified,
        active: businesses.active,
        createdAt: businesses.createdAt,
        category: {
          id: businessCategories.id,
          name: businessCategories.name,
          slug: businessCategories.slug,
          icon: businessCategories.icon,
        },
        province: {
          id: provinces.id,
          name: provinces.name,
          code: provinces.code,
        }
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
      .where(eq(businesses.id, id))
      .limit(1);

    return result[0] || undefined;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db
      .insert(businesses)
      .values(business)
      .returning();
    return newBusiness;
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    return await db.select().from(businessCategories).orderBy(businessCategories.name);
  }

  // Reviews
  async getReviewsByBusiness(businessId: number, limit = 20): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.businessId, businessId), eq(reviews.approved, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getApprovedReviews(businessId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.businessId, businessId), eq(reviews.approved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  // Provinces
  async getProvinces(): Promise<Province[]> {
    return await db.select().from(provinces).orderBy(provinces.name);
  }

  // User Generated Content
  async createUserClassified(classified: any): Promise<any> {
    const [newClassified] = await db
      .insert(classifieds)
      .values(classified)
      .returning();
    return newClassified;
  }

  async createUserReview(review: any): Promise<any> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getUserClassifieds(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(classifieds)
      .where(eq(classifieds.userId, userId))
      .orderBy(desc(classifieds.createdAt));
  }

  async getUserReviews(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getClassifiedById(id: number): Promise<any | undefined> {
    const [classified] = await db
      .select()
      .from(classifieds)
      .where(eq(classifieds.id, id))
      .limit(1);
    return classified;
  }

  async getReviewById(id: number): Promise<any | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    return review;
  }

  async deleteClassified(id: number): Promise<void> {
    await db.delete(classifieds).where(eq(classifieds.id, id));
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // User Content
  async getUserClassifieds(userId: string): Promise<any[]> {
    const userClassifieds = await db
      .select()
      .from(classifieds)
      .where(eq(classifieds.userId, userId))
      .orderBy(desc(classifieds.createdAt));
    return userClassifieds;
  }

  async createUserClassified(data: any): Promise<any> {
    const [classified] = await db
      .insert(classifieds)
      .values({
        ...data,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        views: 0,
      })
      .returning();
    return classified;
  }

  async getUserReviews(userId: string): Promise<any[]> {
    const userReviews = await db
      .select({
        id: reviews.id,
        businessName: businesses.name,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        approved: reviews.approved,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
    return userReviews;
  }

  async createUserReview(data: any): Promise<any> {
    const [review] = await db
      .insert(reviews)
      .values(data)
      .returning();
    return review;
  }

  async searchBusinesses(query: string): Promise<any[]> {
    const results = await db
      .select()
      .from(businesses)
      .where(sql`LOWER(${businesses.name}) LIKE LOWER(${'%' + query + '%'})`)
      .limit(10);
    return results;
  }

  async createBusiness(data: any): Promise<any> {
    const [business] = await db
      .insert(businesses)
      .values({
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })
      .returning();
    return business;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<any | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return prefs;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    const existing = await this.getUserPreferences(userId);

    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ userId, ...preferences })
        .returning();
      return created;
    }
  }

  // Business lookup
  async getBusinessByName(name: string): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.name, name))
      .limit(1);
    return business;
  }

  // Trending articles
  async getTrendingArticles(limit: number = 5): Promise<ArticleWithRelations[]> {
    // Get most viewed and recent articles with relations
    const trending = await db
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
      .orderBy(desc(articles.views), desc(articles.publishedAt))
      .limit(limit);
    return trending;
  }
}

export const storage = new DatabaseStorage();