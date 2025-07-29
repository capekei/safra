import * as dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAuthors } from "./seed-authors";
import { db, pool } from "./db";

const app = express();

// Add production logging for debugging deployment
app.use(morgan('combined'));

// Add CORS support for deployment
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? '*'  // Allow all origins for Replit deployment
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

console.log("✅ CORS configured for environment:", process.env.NODE_ENV || 'development');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Critical deployment checks
  console.log("🚀 Starting SafraReport server...");
  console.log("Environment:", process.env.NODE_ENV || 'development');
  console.log("Port:", process.env.PORT || 4000);
  
  // Validate critical environment variables with masked logging
  if (!process.env.DATABASE_URL) {
    console.error("❌ FATAL: DATABASE_URL environment variable is missing!");
    console.error("Please configure DATABASE_URL secret in Replit");
    process.exit(1);
  }
  
  // Comprehensive DATABASE_URL validation
  const dbUrlLength = process.env.DATABASE_URL?.length || 0;
  console.log(`🔍 DB URL length: ${dbUrlLength} characters (masked for security)`);
  
  // Validate URL format and SSL requirement
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error("❌ FATAL: DATABASE_URL must start with 'postgresql://' or 'postgres://'");
    process.exit(1);
  }
  
  if (!dbUrl.includes('sslmode=require')) {
    console.warn("⚠️  WARNING: DATABASE_URL missing 'sslmode=require' - may cause deployment issues");
    console.log("💡 Recommended format: postgresql://user:pass@host:port/db?sslmode=require");
  }
  
  if (dbUrlLength < 50) {
    console.error("❌ FATAL: DATABASE_URL appears invalid (too short)");
    console.error("Expected format: postgresql://user:pass@host:port/db?sslmode=require");
    process.exit(1);
  }
  
  console.log(`✅ DATABASE_URL format validated`);
  console.log(`🔐 SSL mode: ${dbUrl.includes('sslmode=require') ? 'Required' : 'Not specified'}`);
  console.log(`🌍 DB Host: ${dbUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);
  
  // Test database connection with detailed diagnostics
  try {
    console.log("🔄 Testing database connection...");
    console.log("🔄 Import drizzle and neon packages...");
    
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { neon } = await import("@neondatabase/serverless");
    
    console.log("✅ Packages imported successfully");
    console.log("🔄 Creating database connection...");
    
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    console.log("✅ Database instance created");
    console.log("🔄 Testing connection with SELECT 1...");
    
    const result = await pool.query('SELECT 1 as test, NOW() as timestamp');
    console.log("✅ Database connection successful");
    console.log("📊 Test result:", result.rows);
    console.log("✅ Database URL configured and tested");
    
    // Test article count for deployment verification (skip on first deploy)
    try {
      console.log("🔄 Verifying article count...");
      const articleCount = await pool.query("SELECT COUNT(*) as count FROM articles WHERE status = 'published'");
      console.log("📰 Published articles count:", articleCount.rows[0]?.count || 0);
    } catch (tableError) {
      console.log("⚠️ Articles table not found - likely first deployment (this is normal)");
    }
    
  } catch (error) {
    console.error("❌ WARNING: Database connection failed on startup!");
    console.error("🔍 Error details:", error instanceof Error ? error.message : String(error));
    console.error("🔧 Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("💡 Troubleshooting:");
    console.error("  1. Verify DATABASE_URL in environment variables");
    console.error("  2. Ensure format: postgresql://user:pass@host:port/db?sslmode=require");
    console.error("  3. Check if database tables exist - may need migration");
    console.error("  4. App will continue but database features may not work");
    // Don't exit - let the app start and handle DB errors gracefully
  }
  
  console.log("✅ CORS configured for deployment");
  
  // Seed authors on startup
  await seedAuthors();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
    console.log('🔄 Development mode: setting up Vite...');
    try {
      await setupVite(app, server);
      console.log('✅ Vite setup completed successfully');
    } catch (error) {
      console.error('❌ Vite setup failed, continuing without it:', error);
    }
  } else {
    console.log('📦 Production mode: serving static files...');
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '4000', 10);
  const host = "0.0.0.0";
  
  server.listen(port, host, () => {
    console.log(`🚀 SafraReport Server Started Successfully`);
    console.log(`📍 Listening on: http://${host}:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Replit URL: ${process.env.REPLIT_URL || 'Not set'}`);
    log(`serving on port ${port} on host ${host}`);
  });
})();
