import { Router } from "express";
import { db } from "./db";
import { 
  adminUsers, 
  adminSessions,
  articles,
  categories,
  authors,
  classifieds,
  businesses,
  reviews,
  moderationQueue,
  auditLogs,
  users,
  ads,
  adPlacements,
  adAnalytics,
  provinces
} from "@shared/schema";
import { eq, desc, and, or, like, sql, gte, lte, lt, isNull } from "drizzle-orm";
// Authentication helpers
import { 
  authenticateAdmin,
  logAdminAction,
  requireRole,
  type AuthRequest 
} from "./admin-middleware";
import { hashPassword, comparePassword } from "./auth-middleware";
import { verifyToken } from "./unified-auth";
import { z } from "zod";
import { upload, getFileUrl } from "./upload";
// Replit auth will be handled in main routes

const router = Router();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Admin user schema
const createAdminSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "editor", "moderator"]),
});



// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find admin user
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    if (!user.active) {
      res.status(403).json({ error: "Cuenta desactivada" });
      return;
    }

    // Generate token
    const token = generateToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

    // Create session
    await db.insert(adminSessions).values({
      adminUserId: user.id,
      token,
      expiresAt,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, user.id));

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Datos inválidos", details: error.errors });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Logout endpoint
router.post("/logout", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.cookies?.adminToken;
    
    if (token) {
      await db
        .delete(adminSessions)
        .where(eq(adminSessions.token, token));
    }

    res.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
});

// Get current user
router.get("/me", authenticateAdmin, async (req: AuthRequest, res) => {
  res.json({ user: req.adminUser });
});

// Admin users management (admin only)
router.get("/users", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    const users = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        username: adminUsers.username,
        firstName: adminUsers.firstName,
        lastName: adminUsers.lastName,
        role: adminUsers.role,
        active: adminUsers.active,
        lastLogin: adminUsers.lastLogin,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));

    res.json(users);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Create admin user (admin only)
router.post("/users", authenticateAdmin, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const data = createAdminSchema.parse(req.body);
    const hashedPassword = await hashPassword(data.password);

    const [newUser] = await db
      .insert(adminUsers)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        username: adminUsers.username,
        firstName: adminUsers.firstName,
        lastName: adminUsers.lastName,
        role: adminUsers.role,
      });

    await logAdminAction(
      req.adminUser!.id,
      "create",
      "admin_user",
      newUser.id,
      { username: newUser.username, role: newUser.role },
      req
    );

    res.json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Datos inválidos", details: error.errors });
      return;
    }
    console.error("Error creating admin user:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Articles management
router.get("/articles", authenticateAdmin, async (req, res) => {
  try {
    const { search, categoryId, published, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Apply filters
    const conditions: any[] = [];
    if (search) {
      conditions.push(
        sql`${articles.title} ILIKE ${`%${search}%`} OR ${articles.content} ILIKE ${`%${search}%`}`
      );
    }
    if (categoryId) {
      conditions.push(eq(articles.categoryId, Number(categoryId)));
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

// Get single article
router.get("/articles/:id", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      res.status(404).json({ error: "Artículo no encontrado" });
      return;
    }

    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Error al obtener artículo" });
  }
});

// Create/update article with file uploads
router.post(
  "/articles", 
  authenticateAdmin, 
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 }
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { id, ...data } = req.body;
      
      // Enhanced validation for required fields
      if (!data.title || data.title.trim().length === 0) {
        return res.status(400).json({ 
          error: "Título requerido", 
          message: "El título del artículo es obligatorio" 
        });
      }
      
      if (!data.content || data.content.trim().length === 0) {
        return res.status(400).json({ 
          error: "Contenido requerido", 
          message: "El contenido del artículo es obligatorio" 
        });
      }

      // Safe integer conversion with validation
      const safeParseInt = (value: any, defaultValue: number = 1): number => {
        if (value === null || value === undefined || value === "" || value === "null") {
          return defaultValue;
        }
        const parsed = typeof value === 'string' ? parseInt(value) : Number(value);
        return isNaN(parsed) ? defaultValue : parsed;
      };
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Process uploaded files
      const imageUrls = files?.images?.map(file => getFileUrl(file.filename, "images")) || [];
      const videoUrls = files?.videos?.map(file => getFileUrl(file.filename, "videos")) || [];

      // Parse array fields
      let categoryIds = [];
      if (data.categoryIds) {
        categoryIds = typeof data.categoryIds === 'string' 
          ? JSON.parse(data.categoryIds) 
          : data.categoryIds;
      }

      // Handle scheduled publishing
      const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
      
      // Prepare article data with safe conversions
      // Generate slug if not provided
      const slug = data.slug || data.title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const articleData = {
        title: data.title.trim(),
        excerpt: (data.excerpt || "").trim(),
        content: data.content.trim(),
        slug: slug,
        categoryId: safeParseInt(data.categoryId, 1),
        provinceId: data.provinceId ? safeParseInt(data.provinceId, null) : null,
        authorId: safeParseInt(data.authorId, 1),
        published: data.published === "true" || data.published === true,
        isFeatured: data.isFeatured === "true" || data.isFeatured === true,
        isBreaking: data.isBreaking === "true" || data.isBreaking === true,
        featuredImage: data.featuredImage && data.featuredImage.trim() ? data.featuredImage.trim() : null,
        videoUrl: data.videoUrl && data.videoUrl.trim() ? data.videoUrl.trim() : null,
        images: imageUrls.length > 0 ? imageUrls : null,
        videos: videoUrls.length > 0 ? videoUrls : null,
        categoryIds: categoryIds.length > 0 ? categoryIds.map(id => safeParseInt(id, 1)) : [1],
        status: data.status || "published",
        scheduledFor,
        publishedAt: (data.published === "true" || data.published === true) && !data.publishedAt ? new Date() : data.publishedAt,
      };

      console.log("🔄 Processing article data:", { 
        title: articleData.title, 
        categoryId: articleData.categoryId,
        authorId: articleData.authorId,
        provinceId: articleData.provinceId,
        categoryIds: articleData.categoryIds
      });

      if (id) {
        // Update existing article
        const [updated] = await db
          .update(articles)
          .set({
            ...articleData,
            updatedAt: new Date(),
          })
          .where(eq(articles.id, id))
          .returning();

        await logAdminAction(
          req.adminUser!.id,
          "update",
          "article",
          id,
          articleData,
          req
        );

        res.json(updated);
      } else {
        // Create new article with enhanced logging
        console.log("🔄 Creating new article:", { title: data.title, authorId: articleData.authorId });
        const [created] = await db
          .insert(articles)
          .values(articleData)
          .returning();

        await logAdminAction(
          req.adminUser!.id,
          "create",
          "article",
          created.id,
          articleData,
          req
        );

        res.json(created);
      }
    } catch (error) {
      console.error("❌ Error saving article:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        error: "Error al guardar artículo",
        message: `No se pudo guardar el artículo: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }
);

// Update article (for backward compatibility)
router.put("/articles/:id", authenticateAdmin, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    
    // Generate slug if not provided
    const slug = data.slug || data.title.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
      
    // Prepare article data with proper type conversions
    const articleData = {
      title: data.title,
      excerpt: data.excerpt || "",
      content: data.content,
      slug: slug,
      categoryId: data.categoryId ? Number(data.categoryId) : 1,
      provinceId: data.provinceId ? Number(data.provinceId) : null,
      authorId: data.authorId ? Number(data.authorId) : 1,
      published: Boolean(data.published),
      isFeatured: Boolean(data.isFeatured),
      isBreaking: Boolean(data.isBreaking),
      featuredImage: data.featuredImage || null,
      videoUrl: data.videoUrl || null,
      images: data.images || null,
      videos: data.videos || null,
      categoryIds: data.categoryIds && data.categoryIds.length > 0 ? data.categoryIds.map(Number) : null,
      status: data.status || "published",
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      publishedAt: data.published && !data.publishedAt ? new Date() : data.publishedAt,
      updatedAt: new Date(),
    };
    
    // Update existing article
    const [updated] = await db
      .update(articles)
      .set(articleData)
      .where(eq(articles.id, id))
      .returning();

    await logAdminAction(
      req.adminUser!.id,
      "update",
      "article",
      id,
      articleData,
      req
    );

    res.json(updated);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Error al actualizar artículo" });
  }
});

// Delete article
router.delete("/articles/:id", authenticateAdmin, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    
    await db
      .delete(articles)
      .where(eq(articles.id, id));

    await logAdminAction(
      req.adminUser!.id,
      "delete",
      "article",
      id,
      undefined,
      req
    );

    res.json({ message: "Artículo eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Error al eliminar artículo" });
  }
});

// Moderation queue
router.get("/moderation", authenticateAdmin, async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const queue = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.status, status as string))
      .orderBy(desc(moderationQueue.createdAt));

    // Fetch related entities
    const enrichedQueue = await Promise.all(
      queue.map(async (item) => {
        let entity = null;
        
        if (item.entityType === "classified") {
          [entity] = await db
            .select()
            .from(classifieds)
            .where(eq(classifieds.id, item.entityId));
        } else if (item.entityType === "review") {
          [entity] = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, item.entityId));
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

// Moderate content
router.post("/moderation/:id", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;

    // Get moderation item
    const [item] = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.id, id));

    if (!item) {
      res.status(404).json({ error: "Item no encontrado" });
      return;
    }

    // Update moderation queue
    await db
      .update(moderationQueue)
      .set({
        status,
        moderatedBy: req.adminUser!.id,
        moderationNotes: notes,
        moderatedAt: new Date(),
      })
      .where(eq(moderationQueue.id, id));

    // Update entity status
    if (item.entityType === "classified") {
      await db
        .update(classifieds)
        .set({ active: status === "approved" })
        .where(eq(classifieds.id, item.entityId));
    } else if (item.entityType === "review") {
      await db
        .update(reviews)
        .set({ approved: status === "approved" })
        .where(eq(reviews.id, item.entityId));
    }

    await logAdminAction(
      req.adminUser!.id,
      status === "approved" ? "approve" : "reject",
      item.entityType,
      item.entityId,
      { notes },
      req
    );

    res.json({ message: "Contenido moderado exitosamente" });
  } catch (error) {
    console.error("Error moderating content:", error);
    res.status(500).json({ error: "Error al moderar contenido" });
  }
});

// Dashboard stats
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(articles),
      db.select({ count: sql<number>`count(*)` }).from(classifieds).where(eq(classifieds.active, true)),
      db.select({ count: sql<number>`count(*)` }).from(businesses),
      db.select({ count: sql<number>`count(*)` }).from(reviews).where(eq(reviews.approved, true)),
      db.select({ count: sql<number>`count(*)` }).from(moderationQueue).where(eq(moderationQueue.status, "pending")),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentStats = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(articles).where(gte(articles.createdAt, today)),
      db.select({ count: sql<number>`count(*)` }).from(classifieds).where(gte(classifieds.createdAt, today)),
      db.select({ count: sql<number>`count(*)` }).from(reviews).where(gte(reviews.createdAt, today)),
    ]);

    res.json({
      total: {
        articles: stats[0][0].count,
        classifieds: stats[1][0].count,
        businesses: stats[2][0].count,
        reviews: stats[3][0].count,
        pendingModeration: stats[4][0].count,
      },
      today: {
        articles: recentStats[0][0].count,
        classifieds: recentStats[1][0].count,
        reviews: recentStats[2][0].count,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Classifieds management
router.get("/classifieds", authenticateAdmin, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    // Get all classifieds
    let query = db.select().from(classifieds);
    
    // Apply filters
    const conditions: any[] = [];
    
    if (category && category !== 'all') {
      conditions.push(eq(classifieds.categoryId, category as string));
    }
    
    if (search) {
      conditions.push(
        or(
          sql`${classifieds.title} ILIKE ${`%${search}%`}`,
          sql`${classifieds.description} ILIKE ${`%${search}%`}`
        )
      );
    }

    let results = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(classifieds.createdAt));

    // Process status in JavaScript
    const now = new Date();
    results = results.map(classified => {
      let computedStatus = 'pending';
      
      if (classified.active === false) {
        computedStatus = 'rejected';
      } else if (classified.expiresAt && classified.expiresAt < now) {
        computedStatus = 'expired';
      } else if (classified.active === true && classified.expiresAt && classified.expiresAt >= now) {
        computedStatus = 'active';
      }
      
      return {
        ...classified,
        status: computedStatus
      };
    });
    
    // Filter by status if needed
    if (status && status !== 'all') {
      results = results.filter(classified => classified.status === status);
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching classifieds:", error);
    res.status(500).json({ error: "Error al obtener clasificados" });
  }
});

// Approve classified
router.post("/classifieds/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .update(classifieds)
      .set({ 
        active: true,
        expiresAt: sql`NOW() + INTERVAL '30 days'`
      })
      .where(eq(classifieds.id, Number(id)));

    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "approve",
      "classified",
      Number(id),
      {},
      req
    );

    res.json({ message: "Clasificado aprobado exitosamente" });
  } catch (error) {
    console.error("Error approving classified:", error);
    res.status(500).json({ error: "Error al aprobar clasificado" });
  }
});

// Reject classified
router.post("/classifieds/:id/reject", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await db
      .update(classifieds)
      .set({ active: false })
      .where(eq(classifieds.id, Number(id)));

    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "reject",
      "classified",
      Number(id),
      { reason },
      req
    );

    res.json({ message: "Clasificado rechazado exitosamente" });
  } catch (error) {
    console.error("Error rejecting classified:", error);
    res.status(500).json({ error: "Error al rechazar clasificado" });
  }
});

// Delete classified
router.delete("/classifieds/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .delete(classifieds)
      .where(eq(classifieds.id, Number(id)));

    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "delete",
      "classified",
      Number(id),
      {},
      req
    );

    res.json({ message: "Clasificado eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting classified:", error);
    res.status(500).json({ error: "Error al eliminar clasificado" });
  }
});

// Audit logs
router.get("/audit-logs", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    const { adminUserId, entityType, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Apply filters
    const conditions: any[] = [];
    if (adminUserId) {
      conditions.push(eq(auditLogs.adminUserId, Number(adminUserId)));
    }
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType as string));
    }
    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate as string)));
    }

    const baseQuery = db
      .select({
        log: auditLogs,
        admin: {
          id: adminUsers.id,
          username: adminUsers.username,
          firstName: adminUsers.firstName,
          lastName: adminUsers.lastName,
        },
      })
      .from(auditLogs)
      .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id));

    const logs = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery)
      .orderBy(desc(auditLogs.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error al obtener registros de auditoría" });
  }
});

// Database management endpoints
router.get("/database/info", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    // Get table information
    const tablesQuery = await db.execute(sql`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = await Promise.all(
      tablesQuery.rows.map(async (row: any) => {
        const tableName = row.table_name;
        
        // Get row count for each table
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}
        `);
        
        // Get column information
        const columnsResult = await db.execute(sql`
          SELECT 
            column_name as name,
            data_type as type,
            is_nullable = 'YES' as nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = ${tableName}
          ORDER BY ordinal_position
        `);

        return {
          tableName,
          rowCount: Number(countResult.rows[0].count),
          columns: columnsResult.rows,
        };
      })
    );

    res.json({ tables });
  } catch (error) {
    console.error("Error fetching database info:", error);
    res.status(500).json({ error: "Error al obtener información de la base de datos" });
  }
});

// Execute SQL query (read-only)
router.post("/database/query", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Consulta SQL requerida" });
    }

    // Only allow SELECT queries for safety
    const normalizedQuery = query.trim().toUpperCase();
    if (!normalizedQuery.startsWith("SELECT")) {
      return res.status(403).json({ error: "Solo consultas SELECT están permitidas" });
    }

    const result = await db.execute(sql.raw(query));

    // Log the query
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "database_query",
      "database",
      0,
      { query },
      req
    );

    res.json({
      rows: result.rows,
      rowCount: result.rows.length,
      fields: result.rows.length > 0 
        ? Object.keys(result.rows[0]).map(name => ({ name }))
        : [],
    });
  } catch (error: any) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message || "Error ejecutando consulta" });
  }
});

// Run database migrations
router.post("/database/migrate", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    // In a real application, you would run actual migrations here
    // For now, we'll just push the current schema
    await db.execute(sql`SELECT 1`); // Test connection

    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "database_migration",
      "database",
      0,
      { timestamp: new Date() },
      req
    );

    res.json({ success: true, message: "Migraciones ejecutadas correctamente" });
  } catch (error) {
    console.error("Error running migrations:", error);
    res.status(500).json({ error: "Error ejecutando migraciones" });
  }
});

// Export database data
router.get("/database/export", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    // Export all data from main tables
    const [
      articlesData,
      categoriesData,
      authorsData,
      classifiedsData,
      businessesData,
      reviewsData,
      usersData,
    ] = await Promise.all([
      db.select().from(articles),
      db.select().from(categories),
      db.select().from(authors),
      db.select().from(classifieds),
      db.select().from(businesses),
      db.select().from(reviews),
      db.select().from(users),
    ]);

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      data: {
        articles: articlesData,
        categories: categoriesData,
        authors: authorsData,
        classifieds: classifiedsData,
        businesses: businessesData,
        reviews: reviewsData,
        users: usersData,
      },
    };

    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "database_export",
      "database",
      0,
      { timestamp: new Date() },
      req
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="safrareport-backup-${new Date().toISOString().split("T")[0]}.json"`
    );
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting database:", error);
    res.status(500).json({ error: "Error exportando base de datos" });
  }
});

// Reviews management
router.get("/reviews", authenticateAdmin, async (req, res) => {
  try {
    const { status, rating, search } = req.query;
    
    // Get all reviews with business info
    let query = db.select({
      id: reviews.id,
      businessId: reviews.businessId,
      businessName: businesses.name,
      reviewerName: reviews.reviewerName,
      reviewerEmail: reviews.reviewerEmail,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      approved: reviews.approved,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id));
    
    // Apply filters
    const conditions: any[] = [];
    
    if (status && status !== 'all') {
      switch (status) {
        case 'pending':
          conditions.push(isNull(reviews.approved));
          break;
        case 'approved':
          conditions.push(eq(reviews.approved, true));
          break;
        case 'rejected':
          conditions.push(eq(reviews.approved, false));
          break;
      }
    }
    
    if (rating && rating !== 'all') {
      conditions.push(eq(reviews.rating, parseInt(rating as string)));
    }
    
    if (search) {
      conditions.push(
        or(
          sql`${businesses.name} ILIKE ${`%${search}%`}`,
          sql`${reviews.reviewerName} ILIKE ${`%${search}%`}`,
          sql`${reviews.content} ILIKE ${`%${search}%`}`
        )
      );
    }

    let results = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(reviews.createdAt));

    res.json(results);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

router.post("/reviews/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(reviews)
      .set({ 
        approved: true
      })
      .where(eq(reviews.id, parseInt(id)));
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "approve",
      "review",
      parseInt(id),
      { action: 'Reseña aprobada' },
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Error al aprobar reseña" });
  }
});

router.post("/reviews/:id/reject", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await db.update(reviews)
      .set({ 
        approved: false
      })
      .where(eq(reviews.id, parseInt(id)));
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "reject",
      "review",
      parseInt(id),
      { reason },
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error rejecting review:", error);
    res.status(500).json({ error: "Error al rechazar reseña" });
  }
});

router.delete("/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(reviews).where(eq(reviews.id, parseInt(id)));
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "delete",
      "review",
      parseInt(id),
      {},
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

// Users management
router.get("/users", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let query = db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      email: adminUsers.email,
      firstName: adminUsers.firstName,
      lastName: adminUsers.lastName,
      role: adminUsers.role,
      active: adminUsers.active,
      createdAt: adminUsers.createdAt,
      lastLogin: adminUsers.lastLogin,
    }).from(adminUsers);
    
    // Apply filters
    const conditions: any[] = [];
    
    if (role && role !== 'all') {
      conditions.push(eq(adminUsers.role, role as string));
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(adminUsers.active, status === 'active'));
    }
    
    if (search) {
      conditions.push(
        or(
          sql`${adminUsers.username} ILIKE ${`%${search}%`}`,
          sql`${adminUsers.email} ILIKE ${`%${search}%`}`
        )
      );
    }

    let results = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query)
      .orderBy(desc(adminUsers.createdAt));
    
    // Add stats for each user
    const usersWithStats = await Promise.all(results.map(async (user) => {
      const articleCount = await db.select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.authorId, user.id));
      
      // Admin users don't create classifieds, so count is 0
      const classifiedCount = [{ count: 0 }];
      
      // Admin users don't create reviews, so count is 0
      const reviewCount = [{ count: 0 }];
      
      return {
        ...user,
        stats: {
          articles: parseInt(articleCount[0]?.count?.toString() || '0'),
          classifieds: parseInt(classifiedCount[0]?.count?.toString() || '0'),
          reviews: parseInt(reviewCount[0]?.count?.toString() || '0'),
        }
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.post("/users", authenticateAdmin, requireRole("admin"), async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body;
    
    // Check if user exists
    const existing = await db.select()
      .from(adminUsers)
      .where(or(eq(adminUsers.username, username), eq(adminUsers.email, email)));
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "El usuario o email ya existe" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const [newUser] = await db.insert(adminUsers)
      .values({
        username,
        email,
        password: hashedPassword,
        role,
        firstName: firstName || 'Usuario',
        lastName: lastName || 'Admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "create",
      "user",
      newUser.id,
      { username, role },
      req
    );
    
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

router.patch("/users/:id", authenticateAdmin, requireRole("admin"), async (req, res) => {
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
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "update",
      "user",
      parseInt(id),
      { username },
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/users/:id", authenticateAdmin, requireRole("admin"), async (req, res) => {
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
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "delete",
      "user",
      parseInt(id),
      { username: userToDelete.username },
      req
    );
    
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
      entity: auditLogs.entityType,
      entityId: auditLogs.entityId,
      details: auditLogs.changes,
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
      entity: auditLogs.entityType,
      entityId: auditLogs.entityId,
      details: auditLogs.changes,
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
        `${log.id},${log.userName},${log.userRole},${log.action},${log.entity},${log.entityId || ''},${JSON.stringify(log.details || {})},${log.ipAddress},${log.timestamp},${log.success ? 'Sí' : 'No'}`
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
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "create",
      "ad",
      newAd.id,
      { title: newAd.title },
      req
    );
    
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
    
    await db.update(ads)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, parseInt(id)));
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "update",
      "ad",
      parseInt(id),
      data,
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({ error: "Error al actualizar anuncio" });
  }
});

router.delete("/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [adToDelete] = await db.select()
      .from(ads)
      .where(eq(ads.id, parseInt(id)));
    
    if (!adToDelete) {
      return res.status(404).json({ error: "Anuncio no encontrado" });
    }
    
    await db.delete(ads).where(eq(ads.id, parseInt(id)));
    
    await logAdminAction(
      (req as AuthRequest).adminUser!.id,
      "delete",
      "ad",
      parseInt(id),
      { title: adToDelete.title },
      req
    );
    
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