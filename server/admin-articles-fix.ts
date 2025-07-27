import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { articles, categories, authors } from "@shared/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { logAdminAction } from "./admin-middleware";
import { authenticateSupabase, requireAdmin, type AuthRequest } from "./supabase-auth";
import { DatabaseUser } from "./supabase";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateSupabase as any, requireAdmin as any);

// Get all articles for admin panel
router.get("/articles", (async (req: any, res: Response) => {
  try {
    const { search, categoryId, published, limit = "50" } = req.query;
    
    // Build comprehensive query to get all articles with their relationships
    let query: any = db
      .select({
        article: {
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          content: articles.content,
          published: articles.published,
          isFeatured: articles.isFeatured,
          isBreaking: articles.isBreaking,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          publishedAt: articles.publishedAt,
          authorId: articles.authorId,
          categoryId: articles.categoryId,
        },
        author: {
          id: authors.id,
          name: authors.name,
          email: authors.email,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        }
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id));

    // Apply search filters
    const conditions: any[] = [];
    
    if (search) {
      conditions.push(
        or(
          sql`${articles.title} ILIKE ${`%${search}%`}`,
          sql`${articles.excerpt} ILIKE ${`%${search}%`}`,
          sql`${articles.content} ILIKE ${`%${search}%`}`
        )
      );
    }

    if (categoryId && categoryId !== "all") {
      conditions.push(eq(articles.categoryId, parseInt(categoryId as string)));
    }

    if (published !== undefined && published !== "all") {
      conditions.push(eq(articles.published, published === "true"));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute query with ordering and limit
    const results = await query
      .orderBy(desc(articles.createdAt))
      .limit(parseInt(limit as string));

    // Log admin action
    await logAdminAction(req, {
      action: 'view_articles',
      entityType: 'article',
      entityId: null,
      changes: {
        search,
        categoryId,
        published,
        count: results.length
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching articles for admin:", error);
    res.status(500).json({ error: "Error al obtener artículos" });
  }
}) as any);

// Get article statistics for admin dashboard
router.get("/stats", (async (req: any, res: Response) => {
  try {
    const totalArticles = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles);

    const publishedArticles = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(eq(articles.published, true));

    const featuredArticles = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(eq(articles.isFeatured, true));

    const breakingArticles = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(eq(articles.isBreaking, true));

    // Get today's articles
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayArticles = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(sql`${articles.createdAt} >= ${today}`);

    const stats = {
      total: {
        articles: totalArticles[0]?.count || 0,
        published: publishedArticles[0]?.count || 0,
        featured: featuredArticles[0]?.count || 0,
        breaking: breakingArticles[0]?.count || 0,
        classifieds: 0, // Placeholder
        businesses: 0,  // Placeholder
        reviews: 0,     // Placeholder
        pendingModeration: 0 // Placeholder
      },
      today: {
        articles: todayArticles[0]?.count || 0,
        classifieds: 0, // Placeholder
        reviews: 0      // Placeholder
      }
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}) as any);

// Update article status (publish/unpublish, feature, breaking)
router.patch("/articles/:id/status", (async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { published, isFeatured, isBreaking } = req.body;

    const updateData: any = {};
    
    if (published !== undefined) {
      updateData.published = published;
      updateData.publishedAt = published ? new Date() : null;
    }
    
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
    
    if (isBreaking !== undefined) {
      updateData.isBreaking = isBreaking;
    }

    updateData.updatedAt = new Date();

    const [updatedArticle] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, parseInt(id)))
      .returning();

    if (!updatedArticle) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    await logAdminAction(req, {
      action: 'update_article_status',
      entityType: 'article',
      entityId: id,
      changes: updateData
    });

    res.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article status:", error);
    res.status(500).json({ error: "Error al actualizar estado del artículo" });
  }
}) as any);

// Delete article
router.delete("/articles/:id", (async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedArticle] = await db
      .delete(articles)
      .where(eq(articles.id, parseInt(id)))
      .returning();

    if (!deletedArticle) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    await logAdminAction(req, {
      action: 'delete_article',
      entityType: 'article',
      entityId: id,
      changes: { title: deletedArticle.title }
    });

    res.json({ message: "Artículo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Error al eliminar artículo" });
  }
}) as any);

export default router;