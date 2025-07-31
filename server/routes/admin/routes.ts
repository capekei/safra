import { Router, Request, Response } from "express";
import { db } from "../../db";
import {
  adminUsers,
  articles,

  classifieds,
  reviews,
  moderationQueue,
  auditLogs,
  provinces,
  categories,
  ads,
  adPlacements,
  adAnalytics
} from "@shared/schema";
import { and, eq, or, desc, ilike, SQL, sql, gte, lte, count } from "drizzle-orm";
// import { authenticateSupabase, requireAdmin, AuthRequest } from "../../middleware/auth"; // Temporarily disabled - using Neon/Drizzle stack
import { safeParseInt } from "./utils";
import { upload, getFileUrl } from "../../upload";
import { DR_ERRORS, safeInsertData } from "../../lib/helpers/dominican";
import { logAdminAction } from "../../middleware/admin";

const router = Router();

// Apply the base authentication middleware to all admin routes
// router.use(authenticateSupabase as any, requireAdmin as any); // Temporarily disabled - using Neon/Drizzle stack

// Articles management
router.get("/articles", (async (req: any, res: Response) => {
  try {
    const { search, categoryId, published, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: (SQL<unknown> | undefined)[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(articles.title, `%${search}%`),
          ilike(articles.content, `%${search}%`)
        )
      );
    }
    if (categoryId) {
      const catId = safeParseInt(categoryId as string, 0);
      if (catId > 0) {
        conditions.push(eq(articles.categoryId, catId));
      }
    }
    if (published !== undefined) {
      conditions.push(eq(articles.published, published === "true"));
    }

    const baseQuery = db
      .select({
        article: articles,

        category: categories,
      })
      .from(articles)

      .leftJoin(categories, eq(articles.categoryId, categories.id));

    const result = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(articles.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(result);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json(DR_ERRORS.DATABASE_ERROR);
  }
}) as any);

router.get("/articles/:id", (async (req: any, res: Response) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de artículo inválido" });

    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json(DR_ERRORS.DATABASE_ERROR);
  }
}) as any);

router.post("/articles", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 3 }]), (async (req: any, res: Response) => {
  try {
    const { id, ...data } = req.body;

    if (!data.title || !data.content) {
      return res.status(400).json({ error: "Título y contenido son requeridos." });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageUrls = files?.images?.map(file => getFileUrl(file.filename, "images")) || [];
    const videoUrls = files?.videos?.map(file => getFileUrl(file.filename, "videos")) || [];

    const slug = data.slug || data.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const articleData = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      slug,
      categoryId: safeParseInt(data.categoryId, 1),
      provinceId: data.provinceId ? safeParseInt(data.provinceId, undefined) : undefined,
      authorId: req.user!.id,
      published: data.published === 'true',
      isFeatured: data.isFeatured === 'true',
      isBreaking: data.isBreaking === 'true',
      featuredImage: data.featuredImage || null,
      videoUrl: data.videoUrl || null,
      images: imageUrls.length > 0 ? imageUrls : null,
      videos: videoUrls.length > 0 ? videoUrls : null,
      tags: data.tags ? JSON.parse(data.tags) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let result;
    if (id && id !== "new") {
      const updateId = safeParseInt(id, 0);
      if (updateId === 0) return res.status(400).json({ error: "ID inválido" });
      
      result = await db.update(articles).set(safeInsertData(articleData)).where(eq(articles.id, updateId)).returning();
      await logAdminAction(req as any, {
        action: "update",
        entityType: "article",
        entityId: updateId.toString(),
        changes: { title: data.title }
      });
    } else {
      result = await db.insert(articles).values(safeInsertData(articleData)).returning();
      await logAdminAction(req as any, { 
        action: "create",
        entityType: "article",
        entityId: (result[0]?.id || 0).toString(),
        changes: { title: data.title }
      });
    }

    res.json({ success: true, article: result[0] });
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json(DR_ERRORS.DATABASE_ERROR);
  }
}) as any);

router.put("/articles/:id", (async (req: any, res: Response) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de artículo inválido" });

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    await logAdminAction(req as any, {
      action: "update",
      entityType: "article", 
      entityId: id.toString(),
      changes: { title: result[0].title }
    });

    res.json({ success: true, article: result[0] });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Error al actualizar artículo" });
  }
}) as any);

router.delete("/articles/:id", (async (req: any, res: Response) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de artículo inválido" });

    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    await db.delete(articles).where(eq(articles.id, id));
    
    await logAdminAction(req as any, {
      action: "delete",
      entityType: "article",
      entityId: id.toString(),
      changes: { title: article.title }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Error al eliminar artículo" });
  }
}) as any);

// Stats endpoint
router.get("/stats", (async (req: any, res: Response) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      totalClassifieds,
      activeClassifieds,
      totalReviews,
      pendingReviews
    ] = await Promise.all([
      db.select({ count: count() }).from(articles),
      db.select({ count: count() }).from(articles).where(eq(articles.published, true)),
      db.select({ count: count() }).from(classifieds),
      db.select({ count: count() }).from(classifieds).where(eq(classifieds.status, "active")),
      db.select({ count: count() }).from(reviews),
      db.select({ count: count() }).from(reviews).where(eq(reviews.approved, false))
    ]);

    res.json({
      articles: {
        total: totalArticles[0]?.count || 0,
        published: publishedArticles[0]?.count || 0,
      },
      classifieds: {
        total: totalClassifieds[0]?.count || 0,
        active: activeClassifieds[0]?.count || 0,
      },
      reviews: {
        total: totalReviews[0]?.count || 0,
        pending: pendingReviews[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}) as any);

// Classifieds management
router.get("/classifieds", (async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(classifieds) as any;
    
    if (status) {
      query = query.where(eq(classifieds.status, status as string));
    }

    const result = await query
      .orderBy(desc(classifieds.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(result);
  } catch (error) {
    console.error("Error fetching classifieds:", error);
    res.status(500).json({ error: "Error al obtener clasificados" });
  }
}) as any);

// Reviews management  
router.get("/reviews", (async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(reviews) as any;
    
    if (status) {
      const isApproved = status === 'approved';
      query = query.where(eq(reviews.approved, isApproved));
    }

    const result = await query
      .orderBy(desc(reviews.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
}) as any);

router.post("/reviews/:id/approve", (async (req: any, res: Response) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID inválido" });

    await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id));
    
    await logAdminAction(req as any, {
      action: "approve",
      entityType: "review",
      entityId: id.toString(),
      changes: { approved: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Error al aprobar reseña" });
  }
}) as any);

router.delete("/reviews/:id", (async (req: any, res: Response) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID inválido" });

    await db.delete(reviews).where(eq(reviews.id, id));
    
    await logAdminAction(req as any, {
      action: "delete",
      entityType: "review",
      entityId: id.toString(),
      changes: { deleted: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
}) as any);

// Users management
router.get("/users", (async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Note: This queries the Supabase users table, not the old adminUsers table
    const result = await db.select().from(adminUsers)
      .orderBy(desc(adminUsers.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}) as any);

// Audit logs
router.get("/audit-logs", (async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(result);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error al obtener logs de auditoría" });
  }
}) as any);

export default router;