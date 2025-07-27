import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  adminUsers,
  articles,
  authors,
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

// Custom middleware and utilities
import { authenticateSupabase, requireAdmin } from './supabase-auth';
import { logAdminAction } from "./admin-middleware";
import { safeParseInt } from './utils';
import { upload, getFileUrl } from "./upload";
import { DatabaseUser } from './supabase';

const router = Router();

// Apply the base authentication middleware to all admin routes
router.use(authenticateSupabase, requireAdmin);

// Articles management
router.get("/articles", async (req: Request & { user?: DatabaseUser }, res) => {
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
        author: authors,
        category: categories,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
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
    res.status(500).json({ error: "Error al obtener artículos" });
  }
});

router.get("/articles/:id", async (req: Request & { user?: DatabaseUser }, res: Response) => {
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
    res.status(500).json({ error: "Error al obtener artículo" });
  }
});

router.post("/articles", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 3 }]), async (req: Request & { user?: DatabaseUser }, res: Response) => {
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
      status: data.status || 'published',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      publishedAt: data.published === 'true' && !data.publishedAt ? new Date() : (data.publishedAt ? new Date(data.publishedAt) : null),
    };

    if (id) {
      const articleId = safeParseInt(id, 0);
      if (articleId === 0) return res.status(400).json({ error: "ID de artículo inválido" });

      const [updated] = await db.update(articles).set({ ...articleData, updatedAt: new Date() }).where(eq(articles.id, articleId)).returning();
      await logAdminAction(req, { action: "update", entityType: "article", entityId: String(articleId), changes: articleData });
      res.json(updated);
    } else {
      const [created] = await db.insert(articles).values(articleData).returning();
      await logAdminAction(req, { action: "create", entityType: "article", entityId: String(created.id), changes: articleData });
      res.status(201).json(created);
    }
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json({ error: "Error al guardar el artículo." });
  }
});

router.put("/articles/:id", requireRole(['admin', 'editor']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de artículo inválido" });

    const data = req.body;
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
      images: data.images || null,
      videos: data.videos || null,
      status: data.status || 'published',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      publishedAt: data.published === 'true' && !data.publishedAt ? new Date() : (data.publishedAt ? new Date(data.publishedAt) : null),
      updatedAt: new Date(),
    };

    const [updated] = await db.update(articles).set(articleData).where(eq(articles.id, id)).returning();
    await logAdminAction(req, { action: "update", entityType: "article", entityId: String(id), changes: articleData });
    res.json(updated);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Error al actualizar el artículo." });
  }
});

router.delete("/articles/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de artículo inválido" });

    await db.delete(articles).where(eq(articles.id, id));
    await logAdminAction(req, { action: "delete", entityType: "article", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Error al eliminar artículo" });
  }
});

// Moderation queue
router.get("/moderation", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const { status = "pending" } = req.query;

    const queue = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.status, status as string))
      .orderBy(desc(moderationQueue.createdAt));

    const enrichedQueue = await Promise.all(
      queue.map(async (item) => {
        let entity: any = null;
        if (item.entityId === null) return { ...item, entity };

        try {
          if (item.entityType === "classified") {
            [entity] = await db.select().from(classifieds).where(eq(classifieds.id, item.entityId));
          } else if (item.entityType === "review") {
            [entity] = await db.select().from(reviews).where(eq(reviews.id, item.entityId));
          }
        } catch (e) {
          console.error(`Failed to fetch entity ${item.entityType}:${item.entityId}`, e);
        }
        return { ...item, entity };
      })
    );

    res.json(enrichedQueue);
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    res.status(500).json({ error: "Error al obtener cola de moderación" });
  }
});

router.post("/moderation/:id/approve", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de item inválido" });

    const [item] = await db.select().from(moderationQueue).where(eq(moderationQueue.id, id));
    if (!item || !item.entityId) return res.status(404).json({ error: "Item de moderación no encontrado o inválido." });

    await db.transaction(async (tx) => {
      await tx.update(moderationQueue).set({ status: 'approved', moderatedBy: req.user!.id, moderatedAt: new Date() }).where(eq(moderationQueue.id, id));
      if (item.entityType === 'classified') {
        await tx.update(classifieds).set({ active: true }).where(eq(classifieds.id, item.entityId));
      } else if (item.entityType === 'review') {
        await tx.update(reviews).set({ approved: true }).where(eq(reviews.id, item.entityId));
      }
      await logAdminAction(req, { action: "approve", entityType: item.entityType, entityId: String(item.entityId), changes: { status: 'approved' } });
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error approving content:", error);
    res.status(500).json({ error: "Error al aprobar contenido." });
  }
});

router.post("/moderation/:id/reject", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de item inválido" });
    const { notes } = req.body;

    const [item] = await db.select().from(moderationQueue).where(eq(moderationQueue.id, id));
    if (!item || !item.entityId) return res.status(404).json({ error: "Item de moderación no encontrado o inválido." });

    await db.transaction(async (tx) => {
      await tx.update(moderationQueue).set({ status: 'rejected', moderatedBy: req.user!.id, moderationNotes: notes, moderatedAt: new Date() }).where(eq(moderationQueue.id, id));
      if (item.entityType === 'classified') {
        await tx.update(classifieds).set({ active: false }).where(eq(classifieds.id, item.entityId));
      } else if (item.entityType === 'review') {
        await tx.update(reviews).set({ approved: false }).where(eq(reviews.id, item.entityId));
      }
      await logAdminAction(req, { action: "reject", entityType: item.entityType, entityId: String(item.entityId), changes: { status: 'rejected', notes } });
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error rejecting content:", error);
    res.status(500).json({ error: "Error al rechazar contenido." });
  }
});

// Dashboard statistics
router.get("/stats", requireRole(['admin', 'editor', 'moderator']), async (req, res) => {
  try {
    const [articleCount] = await db.select({ count: sql`count(*)::int` }).from(articles);
    const [classifiedCount] = await db.select({ count: sql`count(*)::int` }).from(classifieds);
    const [userCount] = await db.select({ count: sql`count(*)::int` }).from(adminUsers);
    const [reviewCount] = await db.select({ count: sql`count(*)::int` }).from(reviews);
    const [pendingCount] = await db.select({ count: sql`count(*)::int` }).from(moderationQueue).where(eq(moderationQueue.status, 'pending'));

    res.json({
      articles: articleCount.count,
      classifieds: classifiedCount.count,
      users: userCount.count,
      reviews: reviewCount.count,
      pending: pendingCount.count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Classifieds management
router.get("/classifieds", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const { search, categoryId, provinceId, active } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (search) {
      conditions.push(or(ilike(classifieds.title, `%${search}%`), ilike(classifieds.description, `%${search}%`)));
    }
    if (categoryId) {
      const catId = safeParseInt(categoryId as string, 0);
      if (catId > 0) conditions.push(eq(classifieds.categoryId, catId));
    }
    if (provinceId) {
      const provId = safeParseInt(provinceId as string, 0);
      if (provId > 0) conditions.push(eq(classifieds.provinceId, provId));
    }
    if (active !== undefined) {
      conditions.push(eq(classifieds.active, active === 'true'));
    }

    const results = await db.select().from(classifieds).where(and(...conditions)).orderBy(desc(classifieds.createdAt));
    res.json(results);
  } catch (error) {
    console.error("Error fetching classifieds:", error);
    res.status(500).json({ error: "Error al obtener clasificados" });
  }
});

router.post("/classifieds", requireRole(['admin', 'moderator']), upload.array('images', 10), async (req: AuthRequest, res) => {
  try {
    const { title, description, categoryId, price, contactName, contactPhone, provinceId, expiresAt } = req.body;
    const images = (req.files as Express.Multer.File[])?.map(file => getFileUrl(file.filename, 'images')) || [];

    if (!title || !description || !contactName || !contactPhone) {
        return res.status(400).json({ error: 'Título, descripción, nombre y teléfono de contacto son requeridos.' });
    }

    const classifiedData = {
      title,
      description,
      categoryId: safeParseInt(categoryId, 1),
      price: (parseFloat(price) || 0).toString(),
      contactName,
      contactPhone,
      provinceId: safeParseInt(provinceId, 1),
      userId: String(req.user!.id),
      images: images.length > 0 ? images : null,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      active: true, // New classifieds are active by default, can be moderated later
    };

    const [created] = await db.insert(classifieds).values(classifiedData).returning();
    await logAdminAction(req, { action: "create", entityType: "classified", entityId: String(created.id), changes: classifiedData });
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating classified:", error);
    res.status(500).json({ error: "Error al crear clasificado" });
  }
});

router.put("/classifieds/:id", requireRole(['admin', 'moderator']), upload.array('images', 10), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de clasificado inválido" });

    const { title, description, categoryId, price, contactName, contactPhone, provinceId, active, expiresAt } = req.body;
    const images = (req.files as Express.Multer.File[])?.map(file => getFileUrl(file.filename, 'images')) || [];

    const classifiedData: Partial<typeof classifieds.$inferInsert> = {
      title,
      description,
      categoryId: safeParseInt(categoryId, 1),
      price: (parseFloat(price) || 0).toString(),
      contactName,
      contactPhone,
      provinceId: safeParseInt(provinceId, 1),
      active: active === 'true',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    if (images.length > 0) {
        classifiedData.images = images;
    }

    const [updated] = await db.update(classifieds).set(classifiedData).where(eq(classifieds.id, id)).returning();
    await logAdminAction(req, { action: "update", entityType: "classified", entityId: String(id), changes: classifiedData });
    res.json(updated);
  } catch (error) {
    console.error("Error updating classified:", error);
    res.status(500).json({ error: "Error al actualizar clasificado" });
  }
});

router.delete("/classifieds/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de clasificado inválido" });

    await db.delete(classifieds).where(eq(classifieds.id, id));
    await logAdminAction(req, { action: "delete", entityType: "classified", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting classified:", error);
    res.status(500).json({ error: "Error al eliminar clasificado" });
  }
});

// Reviews management
router.get("/reviews", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const { approved, entityType, entityId } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (approved !== undefined) {
      conditions.push(eq(reviews.approved, approved === 'true'));
    }
    if (entityType) {
      // entityType not available in reviews table - skip filter
    }
    if (entityId) {
      conditions.push(eq(reviews.businessId, safeParseInt(entityId as string, 0)));
    }

    const results = await db.select().from(reviews).where(and(...conditions)).orderBy(desc(reviews.createdAt));
    res.json(results);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

router.post("/reviews/:id/approve", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    const [review] = await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id)).returning();
    await logAdminAction(req, { action: "approve", entityType: "review", entityId: String(id), changes: { approved: true } });
    res.json(review);
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Error al aprobar reseña" });
  }
});

router.delete("/reviews/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    await db.delete(reviews).where(eq(reviews.id, id));
    await logAdminAction(req, { action: "delete", entityType: "review", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

// Admin Users management
router.get("/users", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(adminUsers);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.put("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    if (id === req.user!.id) {
      return res.status(403).json({ error: "No puedes modificar tu propio rol o estado." });
    }

    const { role, active } = req.body;
    const userData: Partial<typeof adminUsers.$inferInsert> = {};
    if (role) userData.role = role;
    if (active !== undefined) userData.active = active;

    const [updated] = await db.update(adminUsers).set(userData).where(eq(adminUsers.id, id)).returning();
    await logAdminAction(req, { action: "update", entityType: "adminUser", entityId: String(id), changes: userData });
    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    if (id === req.user!.id) {
      return res.status(403).json({ error: "No puedes eliminar tu propia cuenta." });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    await logAdminAction(req, { action: "delete", entityType: "adminUser", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Audit logs
router.get("/audit-logs", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { userId, entity, action } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (userId) {
      conditions.push(eq(auditLogs.adminUserId, safeParseInt(userId as string, 0)));
    }
    if (entity) {
      conditions.push(eq(auditLogs.entityType, entity as string));
    }
    if (action) {
      conditions.push(eq(auditLogs.action, action as string));
    }

    const logs = await db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error al obtener registros de auditoría" });
  }
});

// Database management
router.post("/db/query", requireRole(['admin']), async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim().toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: "Solo se permiten consultas SELECT." });
    }
    const result = await db.execute(sql.raw(query));
    res.json(result);
  } catch (error: any) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message || "Error ejecutando consulta" });
  }
});

// Ads Management
router.get('/ads/stats', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const [activeAdsResult] = await db.select({ count: count(ads.id) }).from(ads).where(eq(ads.status, 'active'));
    const [todayImpressionsResult] = await db.select({ sum: sql<number>`sum(impressions)` }).from(ads).where(gte(ads.createdAt, today));
    const [todayClicksResult] = await db.select({ sum: sql<number>`sum(clicks)` }).from(ads).where(gte(ads.createdAt, today));
    const [yesterdayImpressionsResult] = await db.select({ sum: sql<number>`sum(impressions)` }).from(ads).where(and(gte(ads.createdAt, yesterday), lte(ads.createdAt, today)));

    const todayImpressions = todayImpressionsResult?.sum || 0;
    const todayClicks = todayClicksResult?.sum || 0;
    const yesterdayImpressions = yesterdayImpressionsResult?.sum || 0;

    const impressionGrowth = yesterdayImpressions > 0
      ? Math.round(((todayImpressions - yesterdayImpressions) / yesterdayImpressions) * 100)
      : 0;

    const ctr = todayImpressions > 0
      ? ((todayClicks / todayImpressions) * 100).toFixed(2)
      : '0';

    // Estimated revenue (example calculation)
    const estimatedRevenue = (todayImpressions * 0.01) + (todayClicks * 0.5); // RD$0.01 per impression, RD$0.50 per click

    res.json({
      activeAds: parseInt(activeAdsResult?.count?.toString() || '0'),
      todayImpressions,
      todayClicks,
      impressionGrowth,
      ctr,
      estimatedRevenue: Math.round(estimatedRevenue),
    });
  } catch (error) {
    console.error("Error fetching ad stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

router.post("/ads", authenticateAdmin, async (req, res) => {
  try {
    const data = req.body;

    const [newAd] = await db.insert(ads)
      .values({
        ...data,
        createdBy: (req as AuthRequest).adminUser!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await logAdminAction(req as AuthRequest, {
      action: "create",
      entityType: "ad",
      entityId: String(newAd.id),
      changes: { title: newAd.title }
    });

    res.json(newAd);
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: "Error al crear anuncio" });
  }
});

router.patch("/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const adId = safeParseInt(id, 0);
    if (adId === 0) return res.status(400).json({ error: "ID de anuncio inválido" });

    await db.update(ads)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, adId));

    await logAdminAction(req as AuthRequest, {
      action: "update",
      entityType: "ad",
      entityId: String(adId),
      changes: data
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({ error: "Error al actualizar anuncio" });
  }
});

router.delete("/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const adId = safeParseInt(id, 0);
    if (adId === 0) return res.status(400).json({ error: "ID de anuncio inválido" });

    const [adToDelete] = await db.select()
      .from(ads)
      .where(eq(ads.id, adId));

    if (!adToDelete) {
      return res.status(404).json({ error: "Anuncio no encontrado" });
    }

    await db.delete(ads).where(eq(ads.id, adId));

    await logAdminAction(req as AuthRequest, {
      action: "delete",
      entityType: "ad",
      entityId: String(adId),
      changes: { title: adToDelete.title }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: "Error al eliminar anuncio" });
  }
});

// Add endpoint to get provinces for targeting
router.get("/provinces", authenticateAdmin, async (req, res) => {
  try {
    const provincesList = await db.select()
      .from(provinces)
      .orderBy(provinces.name);

    res.json(provincesList);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ error: "Error al obtener provincias" });
  }
});

// Add endpoint to get categories for targeting
router.get("/categories", authenticateAdmin, async (req, res) => {
  try {
    const categoriesList = await db.select()
      .from(categories)
      .orderBy(categories.name);

    res.json(categoriesList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Ads Management
router.get('/ads/stats', authenticateAdmin, async (req, res) => {
  try {
    const { approved, businessId } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (approved !== undefined) {
      conditions.push(eq(reviews.approved, approved === 'true'));
    }
    if (businessId) {
      const id = safeParseInt(businessId as string, 0);
      if (id > 0) conditions.push(eq(reviews.businessId, id));
    }

    const results = await db.select().from(reviews).where(and(...conditions)).orderBy(desc(reviews.createdAt));
    res.json(results);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

router.post("/reviews/:id/approve", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    const [updated] = await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id)).returning();
        await logAdminAction(req, { action: "approve", entityType: "review", entityId: String(id), changes: { approved: true } });
    res.json(updated);
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Error al aprobar reseña" });
  }
});

router.delete("/reviews/:id", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    await db.delete(reviews).where(eq(reviews.id, id));
        await logAdminAction(req, { action: "delete", entityType: "review", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

// Admin Users management
router.get("/users", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const users = await db.select({ id: adminUsers.id, username: adminUsers.username, email: adminUsers.email, role: adminUsers.role, createdAt: adminUsers.createdAt }).from(adminUsers);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.put("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });
    const { username, email, role } = req.body;

    if (id === req.user!.id && role && role !== req.user!.role) {
        return res.status(403).json({ error: 'No puede cambiar su propio rol.' });
    }

    const updateData: Partial<typeof adminUsers.$inferInsert> = { username, email, role };
    const [updated] = await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id)).returning();
        await logAdminAction(req, { action: "update", entityType: "adminUser", entityId: String(id), changes: { username, email, role } });
    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    if (id === req.user!.id) {
        return res.status(403).json({ error: 'No puede eliminarse a sí mismo.' });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
        await logAdminAction(req, { action: "delete", entityType: "adminUser", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Audit logs
router.get("/audit-logs", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { userId, entityType, action } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (userId) {
      const id = safeParseInt(userId as string, 0);
      if (id > 0) conditions.push(eq(auditLogs.adminUserId, id));
    }
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType as string));
    }
    if (action) {
      conditions.push(eq(auditLogs.action, action as string));
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(200); // Limit results for performance

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error al obtener registros de auditoría" });
  }
});

// Database management - highly sensitive, admin only
router.post("/db/query", requireRole(['admin']), async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim().toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: "Query inválida o no permitida. Solo se permiten consultas SELECT." });
    }
    
    // DANGER: Raw query endpoint. Restricted to SELECT statements.
    const result = await db.execute(sql.raw(query));
    res.json(result);
  } catch (error: any) {
    console.error("Error executing DB query:", error);
    res.status(500).json({ error: "Error al ejecutar consulta", changes: error.message });
  }
});

router.delete("/classifieds/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de clasificado inválido" });

    await db.delete(classifieds).where(eq(classifieds.id, id));
        await logAdminAction(req, { action: "delete", entityType: "classified", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting classified:", error);
    res.status(500).json({ error: "Error al eliminar clasificado" });
  }
});

router.post("/reviews/:id/approve", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    const [updated] = await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id)).returning();
        await logAdminAction(req, { action: "approve", entityType: "review", entityId: String(id), changes: { approved: true } });
    res.json(updated);
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Error al aprobar reseña" });
  }
});

router.delete("/reviews/:id", requireRole(['admin', 'moderator']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de reseña inválido" });

    await db.delete(reviews).where(eq(reviews.id, id));
        await logAdminAction(req, { action: "delete", entityType: "review", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

// Admin Users management
router.get("/users", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const users = await db.select({ id: adminUsers.id, firstName: adminUsers.firstName, lastName: adminUsers.lastName, email: adminUsers.email, role: adminUsers.role, createdAt: adminUsers.createdAt }).from(adminUsers);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.put("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });
    const { firstName, lastName, email, role } = req.body;

    if (id === req.user!.id && role !== req.user!.role) {
        return res.status(403).json({ error: 'No puede cambiar su propio rol.' });
    }

    const updateData: Partial<typeof adminUsers.$inferInsert> = { firstName, lastName, email, role };
    const [updated] = await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id)).returning();
        await logAdminAction(req, { action: "update", entityType: "adminUser", entityId: String(id), changes: { firstName, lastName, email, role } });
    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    if (id === req.user!.id) {
        return res.status(403).json({ error: 'No puede eliminarse a sí mismo.' });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
        await logAdminAction(req, { action: "delete", entityType: "adminUser", entityId: String(id), changes: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Audit logs
router.get("/audit-logs", requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { userId, entity, action } = req.query;
    const conditions: (SQL<unknown> | undefined)[] = [];

    if (userId) {
      const id = safeParseInt(userId as string, 0);
      if (id > 0) conditions.push(eq(auditLogs.adminUserId, id));
    }
    if (entity) {
      conditions.push(eq(auditLogs.entityType, entity as string));
    }
    if (action) {
      conditions.push(eq(auditLogs.action, action as string));
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(200); // Limit results for performance

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error al obtener registros de auditoría" });
  }
});

// Database management - highly sensitive, admin only
router.post("/db/query", requireRole(['admin']), async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim().toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: "Query inválida o no permitida. Solo se permiten consultas SELECT." });
    }
    
    // DANGER: Raw query endpoint. Restricted to SELECT statements.
    const result = await db.execute(sql.raw(query));
    res.json(result);
  } catch (error: any) {
    console.error("Error executing DB query:", error);
    res.status(500).json({ error: "Error al ejecutar consulta", changes: error.message });
  }
});

router.delete("/users/:id", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    if (id === req.user!.id) {
      return res.status(403).json({ error: "No puedes eliminar tu propia cuenta" });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));

    await logAdminAction(req, { 
      action: "delete", 
      entityType: "adminUser", 
      entityId: id.toString(), 
      changes: { id } 
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

router.post("/users", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const userData = req.body;

    // In a real app, you'd invite a user via Auth0 Management API
    // Here, we'll just create the local record.
        const newUser = {
      ...userData,
    };

    const [created] = await db.insert(adminUsers).values(newUser).returning();

        await logAdminAction(req, { action: "create", entityType: "adminUser", entityId: String(created.id), changes: newUser });

    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

router.put("/users/:id", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    const userData = req.body;
    const [updated] = await db
      .update(adminUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();

        await logAdminAction(req, { action: "update", entityType: "adminUser", entityId: String(id), changes: userData });

    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const id = safeParseInt(req.params.id, 0);
    if (id === 0) return res.status(400).json({ error: "ID de usuario inválido" });

    // Prevent self-deletion
    if (id === req.user!.id) {
      return res.status(403).json({ error: "No puedes eliminar tu propia cuenta" });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));

        await logAdminAction(req, { action: "delete", entityType: "adminUser", entityId: String(id), changes: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

router.patch("/users/:id", authenticateAdmin, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, firstName, lastName } = req.body;
    
    const updateData: any = {
      username,
      email,
      role,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      updatedAt: new Date()
    };
    
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    await db.update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, parseInt(id)));
    
    await logAdminAction(req as AuthRequest, {
      action: "update",
      entityType: "adminUser",
      entityId: String(parseInt(id)),
      changes: { username }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", authenticateAdmin, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (parseInt(id) === (req as AuthRequest).adminUser!.id) {
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
    }
    
    const [userToDelete] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.id, parseInt(id)));
    
    if (!userToDelete) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    await db.delete(adminUsers).where(eq(adminUsers.id, parseInt(id)));
    
    await logAdminAction(req as AuthRequest, {
      action: "delete",
      entityType: "adminUser",
      entityId: String(parseInt(id)),
      changes: { username: userToDelete.username }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Enhanced audit logs endpoint
router.get("/audit-logs", authenticateAdmin, async (req, res) => {
  try {
    const { search, action, entity, user: userId, dateRange } = req.query;
    
    let query = db.select({
      id: auditLogs.id,
      userId: auditLogs.adminUserId,
      userName: adminUsers.username,
      userRole: adminUsers.role,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      changes: auditLogs.changes,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.createdAt,
      success: sql<boolean>`true`.as('success'),
    })
    .from(auditLogs)
    .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id));
    
    // Apply filters
    const conditions: any[] = [];
    
    if (action && action !== 'all') {
      conditions.push(eq(auditLogs.action, action as string));
    }
    
    if (entity && entity !== 'all') {
      conditions.push(eq(auditLogs.entityType, entity as string));
    }
    
    if (userId && userId !== 'all') {
      conditions.push(eq(auditLogs.adminUserId, parseInt(userId as string)));
    }
    
    if (search) {
      conditions.push(sql`${auditLogs.changes}::text ILIKE ${`%${search}%`}`);
    }
    
    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      conditions.push(gte(auditLogs.createdAt, startDate));
    }

    const logs = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(auditLogs.createdAt))
      .limit(500);
    
    // Get unique users for filter
    const uniqueUsers = await db.select({
      id: adminUsers.id,
      username: adminUsers.username
    })
    .from(adminUsers);
    
    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      today: await db.select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, today))
        .then(r => parseInt(r[0]?.count?.toString() || '0')),
      
      activeUsers: await db.select({ count: sql<number>`count(DISTINCT ${auditLogs.adminUserId})` })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, today))
        .then(r => parseInt(r[0]?.count?.toString() || '0')),
      
      errors: 0, // Since we don't track errors in audit logs
      
      mostActiveUser: await db.select({
        username: adminUsers.username,
        count: sql<number>`count(*)`
      })
        .from(auditLogs)
        .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id))
        .where(gte(auditLogs.createdAt, today))
        .groupBy(adminUsers.username)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(1)
        .then(r => r[0]?.username || 'N/A')
    };

    res.json({
      data: logs,
      users: uniqueUsers,
      stats
    });
  } catch (error) {
    console.error("Error fetching enhanced audit logs:", error);
    res.status(500).json({ error: "Error al obtener registros de auditoría" });
  }
});

router.get("/audit-logs/export", authenticateAdmin, async (req, res) => {
  try {
    const { search, action, entity, user: userId, dateRange, format } = req.query;
    
    // Same query as above but without limit
    let query = db.select({
      id: auditLogs.id,
      userId: auditLogs.adminUserId,
      userName: adminUsers.username,
      userRole: adminUsers.role,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      changes: auditLogs.changes,
      ipAddress: auditLogs.ipAddress,
      timestamp: auditLogs.createdAt,
      success: sql<boolean>`true`.as('success'),
    })
    .from(auditLogs)
    .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id));
    
    // Apply same filters...
    const conditions: any[] = [];
    
    if (action && action !== 'all') {
      conditions.push(eq(auditLogs.action, action as string));
    }
    
    if (entity && entity !== 'all') {
      conditions.push(eq(auditLogs.entityType, entity as string));
    }
    
    if (userId && userId !== 'all') {
      conditions.push(eq(auditLogs.adminUserId, parseInt(userId as string)));
    }
    
    if (search) {
      conditions.push(sql`${auditLogs.changes}::text ILIKE ${`%${search}%`}`);
    }

    const logs = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(auditLogs.createdAt));
    
    // Convert to CSV
    const csv = [
      'ID,Usuario,Rol,Acción,Entidad,ID Entidad,Detalles,IP,Fecha/Hora,Éxito',
      ...logs.map(log => 
        `${log.id},${log.userName},${log.userRole},${log.action},${log.entityType},${log.entityId || ''},${JSON.stringify(log.changes || {})},${log.ipAddress},${log.timestamp},${log.success ? 'Sí' : 'No'}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ error: "Error al exportar registros" });
  }
});

// Ads management endpoints
router.get("/ads", authenticateAdmin, async (req, res) => {
  try {
    const { placement, search, status } = req.query;
    
    let query = db.select({
      id: ads.id,
      title: ads.title,
      advertiser: ads.advertiser,
      imageUrl: ads.imageUrl,
      targetUrl: ads.targetUrl,
      placementId: ads.placementId,
      placementName: adPlacements.name,
      startDate: ads.startDate,
      endDate: ads.endDate,
      targetProvinces: ads.targetProvinces,
      targetCategories: ads.targetCategories,
      maxImpressions: ads.maxImpressions,
      maxClicks: ads.maxClicks,
      impressions: ads.impressions,
      clicks: ads.clicks,
      active: ads.active,
      createdAt: ads.createdAt,
    })
    .from(ads)
    .leftJoin(adPlacements, eq(ads.placementId, adPlacements.id));
    
    const conditions: any[] = [];
    
    if (placement && placement !== 'all') {
      conditions.push(eq(ads.placementId, parseInt(placement as string)));
    }
    
    if (search) {
      conditions.push(
        or(
          sql`${ads.title} ILIKE ${`%${search}%`}`,
          sql`${ads.advertiser} ILIKE ${`%${search}%`}`
        )
      );
    }
    
    if (status && status !== 'all') {
      const now = new Date();
      switch (status) {
        case 'active':
          conditions.push(
            and(
              eq(ads.active, true),
              lte(ads.startDate, now),
              gte(ads.endDate, now)
            )
          );
          break;
        case 'scheduled':
          conditions.push(
            and(
              eq(ads.active, true),
              gte(ads.startDate, now)
            )
          );
          break;
        case 'ended':
          conditions.push(lte(ads.endDate, now));
          break;
        case 'inactive':
          conditions.push(eq(ads.active, false));
          break;
      }
    }
    
    const results = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(ads.createdAt));
    
    res.json({ ads: results });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Error al obtener anuncios" });
  }
});

router.get("/ads/placements", authenticateAdmin, async (req, res) => {
  try {
    const placements = await db.select()
      .from(adPlacements)
      .where(eq(adPlacements.active, true))
      .orderBy(adPlacements.position);
    
    res.json(placements);
  } catch (error) {
    console.error("Error fetching ad placements:", error);
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
});

router.get("/ads/stats", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Active ads count
    const [activeAdsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(
        and(
          eq(ads.active, true),
          lte(ads.startDate, now),
          gte(ads.endDate, now)
        )
      );
    
    // Today's impressions and clicks
    const [todayStats] = await db.select({
      impressions: sql<number>`sum(${adAnalytics.impressions})`,
      clicks: sql<number>`sum(${adAnalytics.clicks})`
    })
    .from(adAnalytics)
    .where(eq(adAnalytics.date, today.toISOString().split('T')[0]));
    
    // Yesterday's impressions for growth calculation
    const [yesterdayStats] = await db.select({
      impressions: sql<number>`sum(${adAnalytics.impressions})`
    })
    .from(adAnalytics)
    .where(eq(adAnalytics.date, yesterday.toISOString().split('T')[0]));
    
    const todayImpressions = parseInt(todayStats?.impressions?.toString() || '0');
    const todayClicks = parseInt(todayStats?.clicks?.toString() || '0');
    const yesterdayImpressions = parseInt(yesterdayStats?.impressions?.toString() || '0');
    
    const impressionGrowth = yesterdayImpressions > 0
      ? Math.round(((todayImpressions - yesterdayImpressions) / yesterdayImpressions) * 100)
      : 0;
    
    const ctr = todayImpressions > 0
      ? ((todayClicks / todayImpressions) * 100).toFixed(2)
      : '0';
    
    // Estimated revenue (example calculation)
    const estimatedRevenue = (todayImpressions * 0.01) + (todayClicks * 0.5); // RD$0.01 per impression, RD$0.50 per click
    
    res.json({
      activeAds: parseInt(activeAdsResult?.count?.toString() || '0'),
      todayImpressions,
      todayClicks,
      impressionGrowth,
      ctr,
      estimatedRevenue: Math.round(estimatedRevenue),
    });
  } catch (error) {
    console.error("Error fetching ad stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

router.post("/ads", authenticateAdmin, async (req, res) => {
  try {
    const data = req.body;
    
    const [newAd] = await db.insert(ads)
      .values({
        ...data,
        createdBy: (req as AuthRequest).adminUser!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
        await logAdminAction(req as AuthRequest, { 
      action: "create", 
      entityType: "ad", 
      entityId: String(newAd.id), 
      changes: { title: newAd.title } 
    });
    
    res.json(newAd);
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: "Error al crear anuncio" });
  }
});

router.patch("/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
        const adId = safeParseInt(id, 0);
    if (adId === 0) return res.status(400).json({ error: "ID de anuncio inválido" });

    await db.update(ads)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, adId));
    
            await logAdminAction(req as AuthRequest, { 
      action: "update", 
      entityType: "ad", 
      entityId: String(adId), 
      changes: data 
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({ error: "Error al actualizar anuncio" });
  }
});

router.delete("/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const adId = safeParseInt(id, 0);
    if (adId === 0) return res.status(400).json({ error: "ID de anuncio inválido" });

    const [adToDelete] = await db.select()
      .from(ads)
      .where(eq(ads.id, adId));
    
    if (!adToDelete) {
      return res.status(404).json({ error: "Anuncio no encontrado" });
    }
    
    await db.delete(ads).where(eq(ads.id, adId));
    
    await logAdminAction(req as AuthRequest, { 
      action: "delete", 
      entityType: "ad", 
      entityId: String(adId), 
      changes: { title: adToDelete.title } 
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: "Error al eliminar anuncio" });
  }
});

// Add endpoint to get provinces for targeting
router.get("/provinces", authenticateAdmin, async (req, res) => {
  try {
    const provincesList = await db.select()
      .from(provinces)
      .orderBy(provinces.name);
    
    res.json(provincesList);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ error: "Error al obtener provincias" });
  }
});

// Add endpoint to get categories for targeting
router.get("/categories", authenticateAdmin, async (req, res) => {
  try {
    const categoriesList = await db.select()
      .from(categories)
      .orderBy(categories.name);
    
    res.json(categoriesList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

export default router;