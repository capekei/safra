import type { Express } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "./database/storage";
import { asyncErrorHandler } from "./middleware/database-error-handler";

const storage = new DatabaseStorage();
import { z } from "zod";
import adminRoutes from "./routes/admin/routes";

// Using session-based authentication system
import userRoutes from "./routes/user/routes";
import authRoutes from "./routes/auth.routes";
import { db } from "./db";
import { articles, categories, classifieds, businesses, classifiedCategories, businessCategories, provinces } from "../shared/index.js";
import { eq, desc, sql } from "drizzle-orm";
// import { generateSitemap, generateRSSFeed, generateRobotsTxt } from "./routes/seo";
import { generateOpenAPISpec } from "./routes/api-docs";


export async function registerRoutes(app: Express): Promise<Server> {
  // Modern session-based authentication system
  
  // Mount auth routes first
  app.use("/api/auth", authRoutes);
  
  // Mount user routes
  app.use("/api/user", userRoutes);
  // Enhanced health check endpoint with database validation
  app.get("/api/health", async (req, res) => {
    const healthCheck = {
      status: "checking",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: false,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          percentage: 0,
        }
      },
      dominican: {
        currency: "DOP",
        mobile_optimized: true,
        network: "3G_ready"
      },
      deployment: "render"
    };

    // Test database connection
    try {
      await db.execute(sql`SELECT 1 as test`);
      healthCheck.checks.database = true;
    } catch (error) {
      console.error('Health check database error:', error);
      healthCheck.checks.database = false;
    }

    // Calculate memory percentage
    healthCheck.checks.memory.percentage = Math.round(
      (healthCheck.checks.memory.used / healthCheck.checks.memory.total) * 100
    );

    // Determine overall status
    healthCheck.status = healthCheck.checks.database ? 'healthy' : 'unhealthy';
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(healthCheck);
  });

  // Liveness probe (required by Render)
  app.get("/api/health/live", (req, res) => {
    res.status(200).send('OK');
  });

  // Readiness probe (required by Render)
  app.get("/api/health/ready", async (req, res) => {
    try {
      await db.execute(sql`SELECT 1 as test`);
      res.status(200).send('Ready');
    } catch (error) {
      console.error('Readiness check failed:', error);
      res.status(503).send('Not Ready');
    }
  });

  // Debug endpoint for database connection
  app.get("/api/debug/db", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM articles`);
      res.json({ 
        success: true, 
        articles_count: result.rows[0]?.count || 0,
        message: "Database connection successful" 
      });
    } catch (error) {
      console.error('Database debug error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Database connection failed" 
      });
    }
  });

  // Simple articles endpoint bypassing storage layer
  app.get("/api/debug/articles", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT id, title, slug, excerpt, published, created_at 
        FROM articles 
        WHERE published = true 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      res.json({ 
        success: true, 
        articles: result.rows,
        message: "Direct query successful" 
      });
    } catch (error) {
      console.error('Direct articles query error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Direct query failed" 
      });
    }
  });

  // Debug single article endpoint
  app.get("/api/debug/article/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const result = await db.execute(sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content, 
          a.featured_image, a.views, a.likes, a.created_at,
          c.name as category_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ${slug} AND a.published = true
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Article not found" 
        });
      }
      
      res.json({ 
        success: true, 
        article: result.rows[0],
        message: "Direct article query successful" 
      });
    } catch (error) {
      console.error('Direct article query error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Direct article query failed" 
      });
    }
  });

  // News and Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const { limit = '20', offset = '0', category } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      
      // Use direct database query
      let query = sql`
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
      
      if (category) {
        query = sql`${query} AND c.slug = ${category}`;
      }
      
      query = sql`${query} ORDER BY a.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
      
      const result = await db.execute(query);
      
      const articles = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featured_image,
        videoUrl: row.video_url,
        isBreaking: row.is_breaking,
        isFeatured: row.is_featured,
        published: row.published,
        publishedAt: row.published_at,
        authorId: row.author_id,
        categoryId: row.category_id,
        views: row.views || 0,
        likes: row.likes || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        category: row.category_name ? {
          name: row.category_name,
          slug: row.category_slug,
        } : undefined,
      }));
      
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: "Error al cargar los artículos. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/articles/featured", async (req, res) => {
    try {
      const { limit = '5' } = req.query;
      const articles = await storage.getFeaturedArticles(parseInt(limit as string));
      res.json(articles);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      res.status(500).json({ message: "Error al cargar los artículos destacados. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/articles/breaking", async (req, res) => {
    try {
      const articles = await storage.getBreakingNews();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      res.status(500).json({ message: "Error al cargar las noticias de última hora. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Use direct database query instead of storage layer
      const result = await db.execute(sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content, 
          a.featured_image, a.video_url, a.is_breaking, a.is_featured,
          a.published, a.published_at, a.author_id, a.category_id, 
          a.views, a.likes, a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          c.icon as category_icon, c.description as category_description
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ${slug} AND a.published = true
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Artículo no encontrado." });
      }

      const row = result.rows[0];
      const article = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featured_image,
        videoUrl: row.video_url,
        isBreaking: row.is_breaking,
        isFeatured: row.is_featured,
        published: row.published,
        publishedAt: row.published_at,
        authorId: row.author_id,
        categoryId: row.category_id,
        views: row.views || 0,
        likes: row.likes || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          icon: row.category_icon,
          description: row.category_description,
        } : undefined,
      };

      // Increment views with direct query
      await db.execute(sql`UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = ${article.id}`);
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: "Error al cargar el artículo. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/articles/:id/related", async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getArticleById(parseInt(id));
      
      if (!article) {
        return res.status(404).json({ message: "Artículo no encontrado." });
      }

      const relatedArticles = await storage.getRelatedArticles(article.id, article.category_id);
      res.json(relatedArticles);
    } catch (error) {
      console.error('Error fetching related articles:', error);
      res.status(500).json({ message: "Error al cargar artículos relacionados. Por favor, intente nuevamente." });
    }
  });

  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementArticleLikes(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error liking article:', error);
      res.status(500).json({ message: "Error al dar like al artículo. Por favor, intente nuevamente." });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Error al cargar las categorías. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada." });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: "Error al cargar la categoría. Por favor, intente nuevamente." });
    }
  });



  // Classifieds routes
  app.get("/api/clasificados", async (req, res) => {
    try {
      const { limit = '20', offset = '0', category, province } = req.query;
      const classifieds = await storage.getClassifieds(
        parseInt(limit as string), 
        parseInt(offset as string),
        category as string,
        province ? parseInt(province as string) : undefined
      );
      res.json(classifieds);
    } catch (error) {
      console.error('Error fetching classifieds:', error);
      res.status(500).json({ message: "Error al cargar los clasificados. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/clasificados/categories", async (req, res) => {
    try {
      const categories = await storage.getClassifiedCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching classified categories:', error);
      res.status(500).json({ message: "Error al cargar las categorías de clasificados. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/clasificados/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const classified = await storage.getClassifiedById(parseInt(id));
      
      if (!classified) {
        return res.status(404).json({ message: "Clasificado no encontrado." });
      }
      
      res.json(classified);
    } catch (error) {
      console.error('Error fetching classified:', error);
      res.status(500).json({ message: "Error al cargar el clasificado. Por favor, intente nuevamente." });
    }
  });

  // Business and Reviews routes
  app.get("/api/resenas", async (req, res) => {
    try {
      const { limit = '20', offset = '0', category, province } = req.query;
      const businesses = await storage.getBusinesses(
        parseInt(limit as string), 
        parseInt(offset as string),
        category as string,
        province ? parseInt(province as string) : undefined
      );
      res.json(businesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({ message: "Error al cargar las reseñas. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/resenas/categories", async (req, res) => {
    try {
      const categories = await storage.getBusinessCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching business categories:', error);
      res.status(500).json({ message: "Error al cargar las categorías de negocios. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/resenas/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Negocio no encontrado." });
      }
      
      res.json(business);
    } catch (error) {
      console.error('Error fetching business:', error);
      res.status(500).json({ message: "Error al cargar el negocio. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/resenas/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = '20' } = req.query;
      const reviews = await storage.getReviewsByBusiness(
        parseInt(id), 
        parseInt(limit as string)
      );
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: "Error al cargar las reseñas. Por favor, intente nuevamente." });
    }
  });

  // Category and Province endpoints
  app.get("/api/classified-categories", async (req, res) => {
    try {
      const categories = await storage.getClassifiedCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching classified categories:', error);
      res.status(500).json({ message: "Error al cargar las categorías. Por favor, intente nuevamente." });
    }
  });

  app.get("/api/business-categories", async (req, res) => {
    try {
      const categories = await storage.getBusinessCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching business categories:', error);
      res.status(500).json({ message: "Error al cargar las categorías. Por favor, intente nuevamente." });
    }
  });

  // Provinces routes
  app.get("/api/provinces", async (req, res) => {
    try {
      const provinces = await storage.getProvinces();
      res.json(provinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      res.status(500).json({ message: "Error al cargar las provincias. Por favor, intente nuevamente." });
    }
  });

  // SEO Routes - temporarily disabled
  // app.get("/sitemap.xml", generateSitemap);
  // app.get("/feed.xml", generateRSSFeed);
  // app.get("/robots.txt", generateRobotsTxt);
  
  // API Documentation
  app.get("/api/docs", generateOpenAPISpec);

  // Mount admin routes
  app.use("/api/admin", adminRoutes);

  // Real-time data endpoints
  app.get('/api/fuel-prices', async (req, res) => {
    try {
      // In production, this would fetch from a real API
      // For now, return realistic Dominican Republic fuel prices
      const fuelPrices = {
        gasolina95: 293.60 + (Math.random() * 5 - 2.5), // Small variations
        gasolinaRegular: 274.50 + (Math.random() * 5 - 2.5),
        gasoil: 221.60 + (Math.random() * 5 - 2.5),
        glp: 147.60 + (Math.random() * 5 - 2.5),
        lastUpdated: new Date().toISOString()
      };
      res.json(fuelPrices);
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      res.status(500).json({ message: 'Error al obtener precios de combustibles' });
    }
  });

  app.get('/api/exchange-rates', async (req, res) => {
    try {
      // In production, this would fetch from Central Bank API
      const exchangeRates = {
        usd: { 
          rate: 60.45 + (Math.random() * 0.2 - 0.1), 
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change: (Math.random() * 0.5 - 0.25).toFixed(2)
        },
        eur: { 
          rate: 63.28 + (Math.random() * 0.2 - 0.1), 
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change: (Math.random() * 0.5 - 0.25).toFixed(2)
        },
        lastUpdated: new Date().toISOString()
      };
      res.json(exchangeRates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      res.status(500).json({ message: 'Error al obtener tasas de cambio' });
    }
  });

  app.get('/api/weather', async (req, res) => {
    try {
      // In production, this would fetch from a weather API
      const weatherData = {
        temp: 28 + Math.floor(Math.random() * 6 - 3),
        feelsLike: 32 + Math.floor(Math.random() * 6 - 3),
        condition: ['sunny', 'partly-cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
        humidity: 70 + Math.floor(Math.random() * 20 - 10),
        wind: 15 + Math.floor(Math.random() * 10 - 5),
        location: 'Santo Domingo',
        description: 'Parcialmente nublado',
        uv: 8 + Math.floor(Math.random() * 3),
        pressure: 1013 + Math.floor(Math.random() * 10 - 5),
        lastUpdated: new Date().toISOString()
      };
      res.json(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      res.status(500).json({ message: 'Error al obtener el clima' });
    }
  });

  app.get('/api/trending', async (req, res) => {
    try {
      // Fetch trending articles from database
      const trendingArticles = await storage.getTrendingArticles(5);
      res.json(trendingArticles);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      res.status(500).json({ message: 'Error al obtener artículos populares' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
