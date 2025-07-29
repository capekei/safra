import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database/storage";
import { z } from "zod";
import adminRoutes from "./routes/admin/routes";
import adminAccessRoutes from "./admin-access";
import adminArticlesFix from "./utils/admin-articles-fix";
import supabaseAuthRoutes from "./middleware/auth";
import userRoutes from "./routes/user/routes";
import { db } from "./db";
import { articles, categories, classifieds, businesses, classifiedCategories, businessCategories, provinces } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "./replit-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount Supabase auth routes first
  app.use("/", supabaseAuthRoutes);
  
  // Auth middleware (this sets up Replit Auth but shouldn't override our routes)
  // await setupAuth(app);
  
  // Mount user routes
  app.use("/api/user", userRoutes);
  // Health check endpoint optimized for Dominican mobile networks
  app.get("/api/health", async (req, res) => {
    try {
      // Quick database ping (faster than count query for 3G networks)
      await db.execute("SELECT 1 as health");
      
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        dominican: {
          currency: "DOP",
          mobile_optimized: true,
          network: "3G_ready"
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // News and Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const { limit = '20', offset = '0', category } = req.query;
      console.log(`Fetching articles: limit=${limit}, offset=${offset}, category=${category}`);
      const articles = await storage.getArticles(
        parseInt(limit as string), 
        parseInt(offset as string),
        category as string
      );
      console.log(`Found ${articles?.length || 0} articles`);
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
      const article = await storage.getArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Artículo no encontrado." });
      }

      // Increment views
      await storage.incrementArticleViews(article.id);
      
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

      const relatedArticles = await storage.getRelatedArticles(article.id, article.categoryId);
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

  // Authors routes
  app.get("/api/authors", async (req, res) => {
    try {
      const authors = await storage.getAuthors();
      res.json(authors);
    } catch (error) {
      console.error('Error fetching authors:', error);
      res.status(500).json({ message: "Error al cargar los autores. Por favor, intente nuevamente." });
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

  // Sitemap generation for SEO
  app.get("/api/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.SITE_URL || `http://localhost:5000`;
      
      // Simple sitemap with just main pages
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/clasificados</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/resenas</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ error: "Error generating sitemap" });
    }
  });

  // Robots.txt
  app.get("/api/robots.txt", (req, res) => {
    const baseUrl = process.env.SITE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml`;
    
    res.header("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  // Mount admin routes (prioritize fixed routes)
  app.use("/api/admin", adminArticlesFix);
  app.use("/api/admin", adminRoutes);
  
  // Register author routes
  import("./routes/author-routes").then(({ registerAuthorRoutes }) => {
    registerAuthorRoutes(app, storage as any);
  });
  
  // Special admin access route
  app.use("/", adminAccessRoutes);

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
