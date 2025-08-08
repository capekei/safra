// CONDITIONAL: Only disable SSL verification in development if explicitly needed
if (process.env.NODE_ENV === 'development' && process.env.DISABLE_SSL_VERIFY === 'true') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  console.warn('⚠️  SSL certificate verification disabled for development');
}

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load from root directory .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { databaseErrorHandler } from "./middleware/database-error-handler.js";

import { db, pool } from "./db.js";

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
  
  // Enhanced environment variable validation
  const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '10000'
  };

  // Check for required variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value && key === 'DATABASE_URL') {
      console.error(`❌ FATAL: ${key} environment variable is missing!`);
      console.error("Please configure DATABASE_URL in your deployment environment");
      process.exit(1);
    }
  }
  
  // Comprehensive DATABASE_URL validation
  const dbUrl = process.env.DATABASE_URL!;
  const dbUrlLength = dbUrl.length;
  
  console.log(`🔍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Database URL length: ${dbUrlLength} characters`);
  
  // Validate URL format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error("❌ FATAL: DATABASE_URL must start with 'postgresql://' or 'postgres://'");
    process.exit(1);
  }
  
  // SSL validation for production
  if (process.env.NODE_ENV === 'production') {
    if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
      console.warn("⚠️  WARNING: DATABASE_URL missing SSL configuration for production");
      console.warn("   Recommended: Add '?sslmode=require' to your DATABASE_URL");
    }
  }
  
  if (dbUrlLength < 30) {
    console.error("❌ FATAL: DATABASE_URL appears invalid (too short)");
    console.error("Expected format: postgresql://user:pass@host:port/db");
    if (process.env.NODE_ENV === 'production') {
      console.error("For production: postgresql://user:pass@host:port/db?sslmode=require");
    }
    process.exit(1);
  }

  // Log deployment environment info (without sensitive data)
  console.log(`🚀 Starting SafraReport Server`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Port: ${process.env.PORT || '10000'}`);
  console.log(`🗄️  Database: ${dbUrl.split('@')[1]?.split('/')[0] || 'configured'}`);
  console.log('');
  
  
  // Test database connection with detailed diagnostics
  try {
    
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");
    
    
    const testPool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000')
    });
    const db = drizzle(testPool);
    
    
    const result = await testPool.query('SELECT 1 as test, NOW() as timestamp');
    
    // Test article count for deployment verification (skip on first deploy)
    try {
      const articleCount = await testPool.query("SELECT COUNT(*) as count FROM articles WHERE published = true");
    } catch (tableError) {
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
  
  

  // await seedAuthors();
  
  const server = await registerRoutes(app);

  // Database error handling middleware (must come before general error handler)
  app.use(databaseErrorHandler);

  // General error handling middleware
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
    try {
      await setupVite(app, server);
    } catch (error) {
      console.error('❌ Vite setup failed, continuing without it:', error);
    }
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '10000', 10);
  const host = "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`serving on port ${port} on host ${host}`);
  });
})();
// Deploy trigger Tue Jul 29 20:20:08 AST 2025
